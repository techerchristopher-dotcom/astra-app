#!/bin/bash
# ─────────────────────────────────────────────
# Astra — Init git + push vers GitHub
# Exécute ce script depuis le dossier astra-app
# ─────────────────────────────────────────────

set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "📁 Dossier : $REPO_DIR"

# Nettoyer un éventuel .git cassé
if [ -d "$REPO_DIR/.git" ]; then
  echo "🧹 Suppression de l'ancien .git..."
  rm -rf "$REPO_DIR/.git"
fi

# Init git
echo "🔧 git init..."
git -C "$REPO_DIR" init
git -C "$REPO_DIR" branch -m main

# Config locale (si nécessaire)
git -C "$REPO_DIR" config user.email "techerchristopher@gmail.com"
git -C "$REPO_DIR" config user.name "christopher"

# Premier commit
echo "📦 Staging & commit..."
git -C "$REPO_DIR" add .
git -C "$REPO_DIR" commit -m "feat: init MVP Astra — onboarding + horoscope IA + chat + premium"

echo ""
echo "✅ Commit OK !"
echo ""
echo "─────────────────────────────────────────────"
echo "👉 PROCHAINES ÉTAPES (à faire manuellement) :"
echo ""
echo "1. Crée le repo sur GitHub :"
echo "   https://github.com/new"
echo "   Nom : astra-app"
echo "   Description : MVP application horoscope IA francophone — React + Vite + Claude API"
echo "   Visibilité : Public — NE PAS initialiser avec README"
echo ""
echo "2. Puis colle ces commandes :"
echo "   cd \"$REPO_DIR\""
echo "   git remote add origin https://github.com/TON_USERNAME/astra-app.git"
echo "   git push -u origin main"
echo "─────────────────────────────────────────────"
