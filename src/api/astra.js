import { fetch as expoFetch } from "expo/fetch";
import { auth } from "../config/firebase";

/**
 * Client pour le worker Cloudflare `astra-ai-worker`.
 *
 * Appelle l'IA via un proxy serveur — la clé OpenAI ne quitte jamais le serveur.
 * Auth via Firebase ID token (récupéré de l'utilisateur courant).
 */

function getWorkerUrl() {
  const url = process.env.EXPO_PUBLIC_WORKER_URL;
  if (!url) {
    throw new Error(
      "EXPO_PUBLIC_WORKER_URL manquant. Ajoute dans .env l'URL de ton worker Cloudflare (ex: https://astra-ai-worker.<account>.workers.dev)."
    );
  }
  return url.replace(/\/+$/, "");
}

async function getIdToken() {
  if (!auth?.currentUser) {
    throw new Error("Aucun utilisateur connecté. Recharge l'app.");
  }
  return auth.currentUser.getIdToken(false);
}

/**
 * Génère l'horoscope du jour. Réponse JSON complète (pas de stream, c'est court).
 * @param args.dateKey   YYYY-MM-DD (jour civil pour le cache global par signe)
 */
export async function fetchHoroscope({ signName, today, dateKey }) {
  const token = await getIdToken();
  const res = await expoFetch(`${getWorkerUrl()}/horoscope`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ signName, today, dateKey }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Horoscope ${res.status}: ${errText.slice(0, 200)}`);
  }
  return res.json();
}

/**
 * Stream un échange chat. Appelle `onDelta(text)` à chaque morceau reçu,
 * puis renvoie le texte final complet.
 *
 * @param args.history    [{ role: "user"|"assistant", content: string }]
 * @param args.signName   Nom du signe astro de l'utilisateur (optionnel).
 * @param args.today      Date FR (passée par le client pour cohérence).
 * @param args.onDelta    (text) => void   appelé à chaque chunk
 * @param args.signal     AbortSignal pour annuler
 */
export async function streamChat({ history, signName, today, onDelta, signal }) {
  const token = await getIdToken();

  const res = await expoFetch(`${getWorkerUrl()}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "text/event-stream",
    },
    body: JSON.stringify({ history, signName, today }),
    signal,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Chat ${res.status}: ${errText.slice(0, 200)}`);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error("Streaming non supporté par cet environnement");
  }

  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let full = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE : événements séparés par \n\n
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const ev of events) {
      const line = ev.split("\n").find((l) => l.startsWith("data:"));
      if (!line) continue;
      const payload = line.slice(5).trim();
      if (payload === "[DONE]") {
        return full;
      }
      try {
        const json = JSON.parse(payload);
        if (json.error) throw new Error(json.error);
        if (typeof json.delta === "string") {
          full += json.delta;
          onDelta?.(json.delta);
        }
      } catch (e) {
        // Si on tombe sur un payload non-JSON, on l'ignore (keepalive, etc.)
        if (e instanceof SyntaxError) continue;
        throw e;
      }
    }
  }

  return full;
}
