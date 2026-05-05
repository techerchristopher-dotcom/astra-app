/**
 * Cache global : même horoscope pour tous les utilisateurs
 * partageant le même signe et le même jour civil (dateKey YYYY-MM-DD).
 */

const KEY_PREFIX = "horoscope:v1";

export function normalizeSign(signName: string): string {
  return signName
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function horoscopeKvKey(dateKey: string, signName: string): string {
  return `${KEY_PREFIX}:${dateKey}:${normalizeSign(signName)}`;
}

/** TTL jusqu'à fin du jour UTC pour dateKey + 1 h, borné entre 5 min et 3 jours. */
export function horoscopeKvTtlSeconds(dateKey: string): number {
  const end = Date.parse(`${dateKey}T23:59:59Z`) + 3600 * 1000;
  const sec = Math.floor((end - Date.now()) / 1000);
  return Math.min(Math.max(sec, 300), 86400 * 3);
}

export function isValidDateKey(dateKey: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateKey);
}
