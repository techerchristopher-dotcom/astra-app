import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const MODEL = "gpt-4o-mini";

export function getOpenAI(apiKey: string): OpenAI {
  return new OpenAI({ apiKey });
}

/**
 * Génère un horoscope au format JSON strict (pas de stream, ~200-400 tokens).
 * On utilise le `response_format: json_object` d'OpenAI pour garantir
 * un JSON parsable, donc plus de try/catch JSON cassé.
 */
export async function generateHoroscope(
  openai: OpenAI,
  args: { name: string; signName: string; today: string }
): Promise<{
  amour: string;
  travail: string;
  energie: string;
  conseil: string;
  score: number;
  momentCle: string;
}> {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    max_tokens: 600,
    temperature: 0.85,
    messages: [
      {
        role: "system",
        content: `Tu es Astra, une astrologue IA bienveillante, mystérieuse et légèrement directe. Tu parles exclusivement en français.
RÈGLE : Réponds UNIQUEMENT avec du JSON valide (object), aucun texte avant ou après.
Format strict : {"amour":"...","travail":"...","energie":"...","conseil":"...","score":7,"momentCle":"..."}
- Chaque section : 2-3 phrases PRÉCISES, jamais vagues. Mentionne des planètes réelles.
- momentCle : 1 phrase percutante, mystérieuse (style "Tu ressens un tiraillement...").
- score : entier 1-10.
- Ton : chaleureux mais direct, jamais alarmiste.`,
      },
      {
        role: "user",
        content: `Horoscope du jour pour ${args.name || "l'utilisateur"}, signe ${args.signName}. Date : ${args.today}.`,
      },
    ],
  });

  const txt = completion.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(txt);

  return {
    amour: String(parsed.amour || ""),
    travail: String(parsed.travail || ""),
    energie: String(parsed.energie || ""),
    conseil: String(parsed.conseil || ""),
    score: Number(parsed.score) || 7,
    momentCle: String(parsed.momentCle || ""),
  };
}

/**
 * Stream un échange chat. Retourne un ReadableStream de chunks SSE
 * au format `data: {"delta":"texte"}\n\n` puis `data: [DONE]\n\n`.
 */
export async function streamChat(
  openai: OpenAI,
  args: {
    signName?: string;
    today: string;
    history: { role: "user" | "assistant"; content: string }[];
  }
): Promise<ReadableStream<Uint8Array>> {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `Tu es Astra, une astrologue IA francophone, mystérieuse, bienveillante et légèrement directe.
${args.signName ? `L'utilisateur est ${args.signName}.` : ""} Nous sommes le ${args.today}.
Réponds en français. Maximum 100 mots. Direct et personnel. Commence par une phrase d'accroche liée à son signe.
Style : émotionnellement intelligent, jamais banal, jamais vague.`,
    },
    ...args.history.map((m) => ({ role: m.role, content: m.content })),
  ];

  const completion = await openai.chat.completions.create({
    model: MODEL,
    stream: true,
    max_tokens: 400,
    temperature: 0.9,
    messages,
  });

  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            const payload = JSON.stringify({ delta });
            controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
          }
        }
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "stream error";
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
        controller.close();
      }
    },
  });
}
