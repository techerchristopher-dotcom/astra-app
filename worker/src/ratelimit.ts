/**
 * Rate limiter glissant simple basé sur Cloudflare KV.
 *
 * Pour des volumes plus élevés, passer sur Durable Objects (latence plus basse,
 * cohérence forte). Pour ~10k users, KV suffit largement.
 */
export async function checkRateLimit(
  kv: KVNamespace,
  uid: string,
  limitPerMinute: number
): Promise<{ allowed: boolean; remaining: number; retryAfter: number }> {
  const now = Math.floor(Date.now() / 1000);
  const windowSec = 60;
  const key = `rl:${uid}:${Math.floor(now / windowSec)}`;

  const raw = await kv.get(key);
  const count = raw ? parseInt(raw, 10) : 0;

  if (count >= limitPerMinute) {
    const retryAfter = windowSec - (now % windowSec);
    return { allowed: false, remaining: 0, retryAfter };
  }

  // Pas atomique parfait (on s'en fout pour ~10/min/user) — KV ne supporte pas
  // d'incrément atomique. Pour atomique strict utiliser Durable Objects.
  await kv.put(key, String(count + 1), { expirationTtl: windowSec * 2 });

  return {
    allowed: true,
    remaining: limitPerMinute - count - 1,
    retryAfter: 0,
  };
}
