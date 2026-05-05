import { Auth, WorkersKVStoreSingle } from "firebase-auth-cloudflare-workers";

export type DecodedToken = {
  uid: string;
  email?: string;
  email_verified?: boolean;
  firebase?: { sign_in_provider?: string };
};

/**
 * Vérifie un Firebase ID token (JWT). Les clés publiques RS256 sont récupérées
 * automatiquement chez Google et mises en cache dans KV pour respecter le TTL.
 *
 * Renvoie le token décodé si valide, sinon throw.
 */
export async function verifyFirebaseIdToken(
  idToken: string,
  projectId: string,
  kv: KVNamespace
): Promise<DecodedToken> {
  const auth = Auth.getOrInitialize(
    projectId,
    WorkersKVStoreSingle.getOrInitialize("PUBLIC_JWK_CACHE_KEY", kv)
  );

  const decoded = await auth.verifyIdToken(idToken, false);
  return {
    uid: decoded.sub,
    email: decoded.email as string | undefined,
    email_verified: decoded.email_verified as boolean | undefined,
    firebase: decoded.firebase as DecodedToken["firebase"],
  };
}

/**
 * Extrait le bearer token depuis Authorization header.
 */
export function extractBearer(req: Request): string | null {
  const auth = req.headers.get("Authorization") || req.headers.get("authorization");
  if (!auth) return null;
  const m = /^Bearer\s+(.+)$/i.exec(auth);
  return m ? m[1].trim() : null;
}
