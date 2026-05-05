const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

function getApiKey() {
  const key = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!key || key.startsWith("sk-ant-xxxx")) {
    throw new Error(
      "EXPO_PUBLIC_ANTHROPIC_API_KEY manquant. Crée un fichier .env à la racine avec ta vraie clé."
    );
  }
  return key;
}

export async function callClaude({ system, messages, maxTokens = 1000 }) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": getApiKey(),
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Claude API ${res.status}: ${errText.slice(0, 200)}`);
  }
  const j = await res.json();
  return j.content?.[0]?.text || "";
}
