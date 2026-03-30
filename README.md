# CortIA — Plateforme SaaS de Courtage Immobilier

> Solution B2B intelligente pour les courtiers en prêt immobilier français

## 🚀 Fonctionnalités

- **Gestion de dossiers** : Créez et suivez vos dossiers de prêt immobilier
- **Analyse financière IA** : Score automatique, taux d'endettement, capacité d'emprunt
- **Synthèse IA** : Génération automatique de notes bancaires professionnelles
- **Gestion de documents** : Upload, vérification et extraction automatique
- **Multi-utilisateurs** : Gestion d'équipe par cabinet
- **Extension Chrome** : Intégration directe depuis les sites des banques

## 🛠️ Stack Technique

- **Frontend** : Next.js 15, TypeScript, Tailwind CSS
- **Backend** : Next.js API Routes (serverless)
- **Base de données** : Supabase (PostgreSQL + Auth + Storage)
- **IA** : OpenAI GPT-4o
- **Déploiement** : Vercel

## 📋 Prérequis

- Node.js 18+
- Compte Supabase
- Clé API OpenAI
- Compte Vercel (pour le déploiement)

## ⚡ Installation locale

```bash
# Cloner le repo
git clone https://github.com/Manolo05/cortia.git
cd cortia

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.local.example .env.local
# Éditer .env.local avec vos clés

# Lancer en développement
npm run dev
```

## 🗄️ Configuration Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Allez dans l'éditeur SQL
3. Exécutez le fichier `supabase/migrations/001_complete_schema.sql`
4. Copiez les clés dans votre `.env.local`

## 🌐 Déploiement Vercel

Voir [DEPLOIEMENT.md](./DEPLOIEMENT.md) pour le guide complet.

```bash
# Déployer rapidement
vercel --prod
```

## 📁 Structure du projet

```
cortia/
├── src/
│   ├── app/              # Pages Next.js (App Router)
│   │   ├── (auth)/       # Pages d'authentification
│   │   ├── (dashboard)/  # Pages du tableau de bord
│   │   └── api/          # Routes API
│   ├── components/       # Composants React réutilisables
│   └── lib/
│       ├── supabase/     # Clients Supabase
│       ├── ia/           # Modules IA (OpenAI)
│       ├── calculs/      # Moteur de calculs financiers
│       ├── types/        # Types TypeScript
│       └── utils/        # Utilitaires
├── supabase/
│   └── migrations/       # Schéma SQL
└── apps/
    └── chrome-extension/ # Extension Chrome
```

## 🔐 Variables d'environnement

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de votre projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé de service Supabase (privée) |
| `OPENAI_API_KEY` | Clé API OpenAI |
| `NEXT_PUBLIC_APP_URL` | URL de votre application |

## 📜 Licence

MIT — © 2025 CortIA
