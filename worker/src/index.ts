import { Hono } from "hono";
import { cors } from "hono/cors";
import { extractBearer, verifyFirebaseIdToken } from "./auth";
import { checkRateLimit } from "./ratelimit";
import { generateHoroscope, getOpenAI, streamChat } from "./openai";

type Bindings = {
  OPENAI_API_KEY: string;
  FIREBASE_PROJECT_ID: string;
  RATE_LIMIT_KV: KVNamespace;
  RATE_LIMIT_PER_MINUTE: string;
  ALLOWED_ORIGINS: string;
};

type Variables = {
  uid: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use("*", async (c, next) => {
  const origins = c.env.ALLOWED_ORIGINS || "*";
  return cors({
    origin: origins === "*" ? "*" : origins.split(",").map((s) => s.trim()),
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    maxAge: 86400,
  })(c, next);
});

app.get("/", (c) =>
  c.json({
    name: "astra-ai-worker",
    status: "ok",
    endpoints: ["/chat (POST, SSE)", "/horoscope (POST, JSON)"],
  })
);

/**
 * Middleware d'auth + rate limit. Place `uid` dans le contexte Hono.
 */
async function authAndLimit(
  c: Parameters<Parameters<typeof app.post>[1]>[0],
  next: () => Promise<void>
) {
  const token = extractBearer(c.req.raw);
  if (!token) {
    return c.json({ error: "Missing Authorization Bearer token" }, 401);
  }

  let uid: string;
  try {
    const decoded = await verifyFirebaseIdToken(
      token,
      c.env.FIREBASE_PROJECT_ID,
      c.env.RATE_LIMIT_KV
    );
    uid = decoded.uid;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid token";
    return c.json({ error: `Auth invalide: ${msg}` }, 401);
  }

  const limit = parseInt(c.env.RATE_LIMIT_PER_MINUTE || "20", 10);
  const rl = await checkRateLimit(c.env.RATE_LIMIT_KV, uid, limit);
  if (!rl.allowed) {
    return c.json(
      { error: "Rate limit dépassé", retryAfter: rl.retryAfter },
      429,
      { "Retry-After": String(rl.retryAfter) }
    );
  }

  c.set("uid", uid);
  c.header("X-RateLimit-Remaining", String(rl.remaining));
  await next();
}

/**
 * POST /horoscope
 * Body: { name: string, signName: string, today: string }
 * Auth: Bearer <Firebase ID token>
 * Réponse: JSON { amour, travail, energie, conseil, score, momentCle }
 */
app.post("/horoscope", authAndLimit, async (c) => {
  let body: { name?: string; signName?: string; today?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Body JSON invalide" }, 400);
  }

  if (!body.signName || !body.today) {
    return c.json({ error: "Champs requis: signName, today" }, 400);
  }

  try {
    const openai = getOpenAI(c.env.OPENAI_API_KEY);
    const result = await generateHoroscope(openai, {
      name: body.name || "",
      signName: body.signName,
      today: body.today,
    });
    return c.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "OpenAI error";
    return c.json({ error: `Génération échouée: ${msg}` }, 502);
  }
});

/**
 * POST /chat
 * Body: { signName?: string, today: string, history: [{ role, content }, ...] }
 * Auth: Bearer <Firebase ID token>
 * Réponse: text/event-stream
 *   data: {"delta":"texte..."}\n\n  (répété)
 *   data: [DONE]\n\n
 */
app.post("/chat", authAndLimit, async (c) => {
  let body: {
    signName?: string;
    today?: string;
    history?: { role: "user" | "assistant"; content: string }[];
  };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Body JSON invalide" }, 400);
  }

  if (!body.today || !Array.isArray(body.history) || body.history.length === 0) {
    return c.json({ error: "Champs requis: today, history (non vide)" }, 400);
  }

  try {
    const openai = getOpenAI(c.env.OPENAI_API_KEY);
    const stream = await streamChat(openai, {
      signName: body.signName,
      today: body.today,
      history: body.history,
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "OpenAI error";
    return c.json({ error: `Stream échoué: ${msg}` }, 502);
  }
});

export default app;
