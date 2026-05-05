# Astra AI Worker

Proxy Cloudflare Worker entre l'app Expo (`astra-app`) et l'API OpenAI.

**Pourquoi ?** La clé OpenAI ne doit jamais être bundlée dans l'app mobile (sinon
elle est extractible par n'importe quel utilisateur). Ce worker :

- Vérifie l'ID token Firebase de chaque requête (auth)
- Applique un rate limit par utilisateur (anti-abus, anti-coût qui dérape)
- Appelle OpenAI `gpt-4o-mini` côté serveur
- Retourne du **streaming SSE** pour le chat (texte en temps réel) et JSON pour l'horoscope

## Stack

- [Hono](https://hono.dev/) — micro-framework HTTP
- [firebase-auth-cloudflare-workers](https://github.com/Code-Hex/firebase-auth-cloudflare-workers) — vérif JWT
- [openai](https://github.com/openai/openai-node) SDK officiel

## Déploiement initial (one-shot)

### 1. Compte Cloudflare

Crée un compte gratuit sur [cloudflare.com](https://dash.cloudflare.com/sign-up). Pas besoin de carte.

### 2. Installer les deps

```bash
cd worker
npm install
```

### 3. Login Wrangler

```bash
npx wrangler login
```

Une fenêtre navigateur s'ouvre, tu autorises Cloudflare.

### 4. Créer le KV namespace (rate limit + cache JWT)

```bash
npm run kv:create
```

La commande retourne un ID. **Copie-le** et remplace `REPLACE_WITH_KV_ID_AFTER_CREATION`
dans `wrangler.toml` par cet ID.

### 5. Définir les secrets

```bash
# Ta clé OpenAI (sk-...)
npm run secret:openai

# Ton project ID Firebase (ex: astraia-f2263)
npm run secret:project
```

### 6. Déployer

```bash
npm run deploy
```

Sortie attendue :

```
✨ Deployed astra-ai-worker
   https://astra-ai-worker.<your-account>.workers.dev
```

### 7. Configurer l'app Expo

Dans `astra-app/.env` à la racine, ajoute :

```env
EXPO_PUBLIC_WORKER_URL=https://astra-ai-worker.<your-account>.workers.dev
```

Puis recharge l'app (Cmd+R dans le simulateur). Fini.

## Développement local

```bash
npm run dev
```

Lance le worker sur `http://localhost:8787`. Pour tester depuis l'app, change
temporairement `EXPO_PUBLIC_WORKER_URL` vers cette URL (ou via tunneling
ngrok / Cloudflare Tunnel pour tester depuis le simulateur iOS).

Pour les secrets en local, crée `.dev.vars` :

```
OPENAI_API_KEY=sk-...
FIREBASE_PROJECT_ID=astraia-f2263
```

## Endpoints

### `POST /chat`

Stream SSE.

**Headers** :
- `Authorization: Bearer <Firebase ID token>`
- `Content-Type: application/json`

**Body** :
```json
{
  "today": "lundi 5 mai 2026",
  "signName": "Scorpion",
  "history": [
    { "role": "user", "content": "Bonjour" }
  ]
}
```

**Réponse** : `text/event-stream`
```
data: {"delta":"Bon"}

data: {"delta":"jour"}

data: [DONE]
```

### `POST /horoscope`

Réponse JSON synchrone.

**Body** :
```json
{
  "name": "Christopher",
  "signName": "Scorpion",
  "today": "lundi 5 mai 2026"
}
```

**Réponse** :
```json
{
  "amour": "...",
  "travail": "...",
  "energie": "...",
  "conseil": "...",
  "score": 7,
  "momentCle": "..."
}
```

## Coûts attendus

Pour 10 000 utilisateurs actifs (~50k requêtes/mois) :

| Item | Coût |
|------|------|
| Workers (free tier 100k req/jour) | **Gratuit** |
| KV (free tier 100k reads/jour) | **Gratuit** |
| OpenAI gpt-4o-mini | ~10 $/mois |

## Logs en prod

```bash
npm run tail
```

Affiche les requêtes en temps réel.

## Sécurité

- La clé OpenAI vit uniquement comme secret Cloudflare (jamais dans le code)
- Chaque requête est authentifiée via JWT Firebase RS256 (clé publique cachée 24h en KV)
- Rate limit 20 req/min/user par défaut (modifiable via dashboard CF sans redeploy)
- CORS permissif par défaut. Pour restreindre, change `ALLOWED_ORIGINS` dans `wrangler.toml`

## Évolutions possibles

- [ ] Migrer le rate limit vers Durable Objects (cohérence forte)
- [ ] Ajouter une route `/admin/usage` pour exposer un dashboard conso
- [ ] Logger les conversations dans Firestore depuis le worker (signed token)
- [ ] Cache des horoscopes du jour en KV (1 par signe/jour) → division par 12 du coût OpenAI
