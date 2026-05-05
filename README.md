# Astra — App Horoscope IA Francophone

App mobile **Expo React Native** (SDK 54) avec backend **Firebase** (Auth + Firestore)
et un proxy IA **Cloudflare Worker** (`worker/`) qui appelle **OpenAI gpt-4o-mini**.

## Architecture haut niveau

```
App Expo  ──(Bearer JWT Firebase)──▶  Cloudflare Worker  ──▶  OpenAI gpt-4o-mini
        ◀──── SSE stream ───────────                    ◀──
        │
        └─── Firebase Auth + Firestore (users, messages, horoscopes)
```

Pourquoi un worker ? La clé OpenAI ne doit **jamais** vivre dans le bundle de l'app
(elle serait extraite par n'importe qui). Le worker tient la clé côté serveur,
vérifie l'auth Firebase et applique un rate limit.

## Prérequis

- Node 20+
- `Expo Go` installé sur ton smartphone
- Téléphone et ordinateur sur le **même réseau Wi-Fi**

## Installation rapide

```bash
npm install
```

Le fichier `.env` doit contenir tes vraies clés Firebase **et** l'URL du worker
(`EXPO_PUBLIC_WORKER_URL`). Vois `.env.example` pour la liste complète.

Pour le worker IA, suis le guide `worker/README.md` (déploiement one-shot ~10 min).

```bash
cat .env  # vérification
```

## Lancer l'app

```bash
npx expo start
```

Scanne le QR code avec **l'appareil photo iOS** (iPhone) ou **Expo Go** (Android).

Si le téléphone ne détecte pas le serveur :
```bash
npx expo start --tunnel
```

---

## Architecture Firebase

### Projet Firebase actif

- **Project ID** : `astraia-f2263`
- **Display name** : AstraIA
- **Region Firestore** : `eur3` (Europe)
- **Auth providers activés** : Anonymous + Email/Password
- **Console** : https://console.firebase.google.com/project/astraia-f2263

### Configuration `.env`

```
EXPO_PUBLIC_WORKER_URL=https://astra-ai-worker.<account>.workers.dev
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=astraia-f2263.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=astraia-f2263
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=astraia-f2263.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

⚠️ **Plus aucune clé API d'IA dans le bundle.** Toute la conversation passe par
le Cloudflare Worker (`worker/`) qui authentifie chaque requête via JWT Firebase.

Le `.env` est dans `.gitignore` — ne le commit jamais.

### Modèle Firestore

```
users/{uid}
  ├── uid            string
  ├── prenom         string
  ├── signe          string (nom du signe, ex "Scorpion") | null
  ├── isPremium      boolean
  ├── email          string | null
  ├── createdAt      timestamp
  └── updatedAt      timestamp

  messages/{messageId}
    ├── role         "user" | "assistant"
    ├── content      string (max 5000)
    └── createdAt    timestamp

  horoscopes/{YYYY-MM-DD}
    ├── signe        string
    ├── content      string (JSON sérialisé : amour, travail, energie, conseil, score, momentCle)
    ├── score        number 1-10
    ├── momentCle    string
    └── createdAt    timestamp
```

### Règles de sécurité

`firestore.rules` — appliquées au déploiement Firebase. Principes :
- Un utilisateur ne peut accéder qu'à `users/{son_uid}` et ses sous-collections
- `isPremium` ne peut PAS être modifié côté client (sera flippé par Cloud Function quand Stripe sera intégré)
- Pas de delete possible, sauf via Console Firebase / admin SDK

### Re-déployer les règles après modification

```bash
npx firebase-tools@latest deploy --only firestore:rules --project astraia-f2263
```

### Émulateurs locaux (optionnel pour dev offline)

```bash
npx firebase-tools@latest emulators:start
```
- Auth UI : http://localhost:9099
- Firestore UI : http://localhost:8080
- Emulator Suite UI : http://localhost:4000

## Architecture côté app

```
App.js                        entry — fonts + AuthProvider + AuthGate + AppRouter
src/
├── config/firebase.js        init Firebase (auth + firestore + AsyncStorage persistence)
├── contexts/AuthContext.js   anonymous auto-signin + signup/login/link email
├── services/
│   ├── userService.js        ensureUserDoc, subscribeUser, updateUserProfile
│   ├── messageService.js     addMessage, subscribeMessages
│   └── horoscopeService.js   getTodayHoroscope, saveTodayHoroscope, getHoroscopeStats
├── components/
│   ├── AuthGate.js           splash + erreur si Firebase pas configuré
│   ├── EmailAuthForm.js      formulaire signup/login (avec linkWithCredential)
│   ├── Stars, BottomNav, ProgressBar, PulseGlyph, Buttons
└── screens/
    ├── OnboardPrenom.js      → Firestore updateProfile({ prenom })
    ├── OnboardSigne.js       → Firestore updateProfile({ signe })
    ├── OnboardTeaser.js
    ├── OnboardPremium.js
    ├── Home.js               lecture profile + horoscope du jour
    ├── Horoscope.js          getTodayHoroscope au montage, save après gen
    ├── Chat.js               subscribeMessages (history live), addMessage à chaque msg
    ├── Premium.js
    └── Profil.js             stats Firestore + bouton "Sécuriser le compte"
```

## Flow utilisateur

1. **Lancement** : `AuthProvider` détecte qu'il n'y a pas d'utilisateur → `signInAnonymously()` automatique → un doc `users/{uid}` est créé avec `prenom: ""`, `signe: null`, `isPremium: false`.
2. **Onboarding** : selon les champs vides du profil, on affiche les écrans dans l'ordre Prénom → Signe → Teaser → Premium intro. Chaque écran écrit dans Firestore en temps réel.
3. **Main app** : Home / Horoscope / Chat / Premium / Profil.
4. **Profil** : un user anonyme peut "Sécuriser le compte" via email/password → on appelle `linkWithCredential` qui préserve toutes ses données (uid inchangé).

## ⚠️ Sécurité — points connus

1. **Mock Premium** : les boutons "Débloquer" / "Commencer à X€/mois" n'effectuent **aucun paiement** et ne flippent pas `isPremium`. À brancher sur Stripe + Cloud Function plus tard. Pour tester l'UI premium, modifier `users/{uid}.isPremium = true` directement dans la console Firebase.
2. **Clé Firebase Web exposée** dans le bundle, c'est **normal et attendu** par Firebase (la sécurité repose sur les Firestore rules + Auth, pas sur la clé). Mais elle doit être restreinte par domaine/bundle ID dans Google Cloud Console.

## Prochaines étapes

- Stripe pour vrai abonnement (mensuel + annuel) via webhook → `users/{uid}.isPremium`
- Calcul streak côté worker (plus fiable que côté client)
- Notifications push quotidiennes (`expo-notifications`)
- Google / Apple Sign-In (nécessite Dev Build EAS)
- Reset password / vérification email
- Cache horoscope du jour en KV (1 entrée par signe/jour) pour diviser par 12 le coût OpenAI
