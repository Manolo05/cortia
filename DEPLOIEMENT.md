# Guide de Déploiement CortIA sur Vercel

## Prérequis

- Compte GitHub avec le repo cortia
- Compte Supabase (gratuit suffisant pour démarrer)
- Compte OpenAI avec clé API
- Compte Vercel (gratuit)

## Étape 1 : Configuration Supabase

### 1.1 Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Choisir une région (EU West pour la France)
4. Noter le mot de passe de la base de données

### 1.2 Initialiser le schéma

1. Dans le dashboard Supabase, aller dans **SQL Editor**
2. Copier-coller le contenu de `supabase/migrations/001_complete_schema.sql`
3. Cliquer **Run**
4. Vérifier que toutes les tables sont créées dans **Table Editor**

### 1.3 Configurer l'authentification

1. Aller dans **Authentication > Settings**
2. Configurer les URLs autorisées :
   - Site URL : `https://votre-app.vercel.app`
   - Redirect URLs : `https://votre-app.vercel.app/**`
3. Optionnel : Désactiver la confirmation email pour les tests

### 1.4 Récupérer les clés

Dans **Settings > API** :
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

## Étape 2 : Déploiement Vercel

### 2.1 Importer le projet

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer **New Project**
3. Importer depuis GitHub : `Manolo05/cortia`
4. Framework : **Next.js** (auto-détecté)

### 2.2 Configurer les variables d'environnement

Dans Vercel, aller dans **Settings > Environment Variables** et ajouter :

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app
NEXT_PUBLIC_APP_NAME=CortIA
EXTENSION_SECRET_KEY=une-cle-secrete-aleatoire
```

### 2.3 Déployer

1. Cliquer **Deploy**
2. Attendre ~2 minutes
3. Votre app est disponible sur `https://cortia-xxx.vercel.app`

### 2.4 Domaine personnalisé (optionnel)

1. Dans Vercel **Settings > Domains**
2. Ajouter votre domaine (ex: `app.cortia.fr`)
3. Mettre à jour les URLs Supabase avec le nouveau domaine

## Étape 3 : Vérification

### Tester le déploiement

1. Aller sur votre URL Vercel
2. S'inscrire avec un email/mot de passe
3. Créer un premier dossier de test
4. Vérifier que l'analyse IA fonctionne

### Checklist

- [ ] Inscription/connexion fonctionne
- [ ] Création de dossier fonctionne
- [ ] Upload de documents fonctionne
- [ ] Analyse IA génère un résultat
- [ ] Synthèse IA se génère correctement

## Étape 4 : Configuration Production

### Storage Supabase

Pour les uploads de documents, vérifier que le bucket `documents` existe :

1. Aller dans **Storage** dans Supabase
2. Vérifier que le bucket `documents` est créé (par la migration SQL)
3. Les policies RLS doivent être actives

### Monitoring

- **Logs Vercel** : Aller dans votre projet Vercel > Deployments > View logs
- **Logs Supabase** : Aller dans Supabase > Logs
- **Usage OpenAI** : Surveiller sur platform.openai.com

## Variables d'environnement complètes

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| NEXT_PUBLIC_SUPABASE_URL | ✅ | URL projet Supabase |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✅ | Clé publique Supabase |
| SUPABASE_SERVICE_ROLE_KEY | ✅ | Clé privée Supabase |
| OPENAI_API_KEY | ✅ | Clé API OpenAI |
| NEXT_PUBLIC_APP_URL | ✅ | URL de l'application |
| NEXT_PUBLIC_APP_NAME | ❌ | Nom de l'app (défaut: CortIA) |
| EXTENSION_SECRET_KEY | ❌ | Secret pour l'extension Chrome |

## Dépannage

### Erreur "Invalid API key" OpenAI
→ Vérifier que `OPENAI_API_KEY` est correctement défini dans Vercel

### Erreur de connexion Supabase
→ Vérifier les URLs et clés dans les variables d'environnement Vercel

### Erreur lors des uploads
→ Vérifier que le bucket `documents` existe dans Supabase Storage

### L'authentification ne redirige pas
→ Mettre à jour les "Redirect URLs" dans Supabase Authentication Settings
