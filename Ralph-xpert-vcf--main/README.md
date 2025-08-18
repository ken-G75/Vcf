# Ralph Xpert - Avec Supabase

## 🚀 Installation et Configuration

### Prérequis
- Node.js (version 14 ou supérieure)
- Compte Supabase
- npm ou yarn

### 1. Installation des dépendances
\`\`\`bash
npm install
\`\`\`

### 2. Configuration Supabase

#### Créer un projet Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre URL de projet et vos clés API

#### Configurer les variables d'environnement
1. Copiez `.env.example` vers `.env`
2. Remplissez les variables Supabase :
\`\`\`env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=ralph-xpert-secret-key-2025
\`\`\`

#### Exécuter les scripts SQL
1. Allez dans l'éditeur SQL de Supabase
2. Exécutez le contenu de `scripts/01-create-tables.sql`
3. Exécutez le contenu de `scripts/02-seed-data.sql` (optionnel)

### 3. Démarrage
\`\`\`bash
# Mode production
npm start

# Mode développement
npm run dev
\`\`\`

### Accès
- **Site principal**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin-login.html
- **Identifiants admin**: Admin / Admin

## 🗄️ Base de Données

### Tables Supabase

#### `contacts`
- `id` (UUID, PK)
- `nom` (TEXT)
- `numero_complet` (TEXT, UNIQUE)
- `code_pays` (TEXT)
- `numero` (TEXT)
- `email` (TEXT, nullable)
- `timestamp` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)

#### `messages`
- `id` (UUID, PK)
- `nom` (TEXT)
- `email` (TEXT)
- `telephone` (TEXT, nullable)
- `sujet` (TEXT)
- `message` (TEXT)
- `read` (BOOLEAN)
- `status` (TEXT)
- `timestamp` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)

### Sécurité (RLS)
- Row Level Security activé sur toutes les tables
- Politiques configurées pour l'accès public et admin
- Service Role Key utilisée pour les opérations admin

## 🔧 Fonctionnalités

### API Endpoints (inchangés)
- `POST /api/contacts` - Inscription contact
- `GET /api/contacts/recent` - Contacts récents
- `POST /api/messages` - Envoyer message
- `POST /api/admin/login` - Connexion admin
- `GET /api/admin/messages` - Tous les messages
- `GET /api/admin/contacts` - Tous les contacts
- `PATCH /api/admin/contacts/:id` - Modifier contact
- `DELETE /api/admin/contacts/:id` - Supprimer contact
- `DELETE /api/admin/contacts` - Supprimer tous
- `GET /api/admin/download/vcf` - Télécharger VCF
- `GET /api/admin/stats` - Statistiques

### Nouvelles Fonctionnalités
- ✅ Persistance des données en base
- ✅ Recherche avancée avec PostgreSQL
- ✅ Sécurité renforcée avec RLS
- ✅ Scalabilité automatique
- ✅ Sauvegarde automatique
- ✅ Performance optimisée avec index

## 🔒 Sécurité

### Row Level Security (RLS)
- Accès public limité aux opérations de lecture/insertion
- Accès admin complet via Service Role Key
- Politiques de sécurité configurées

### Variables d'Environnement
- Clés API sécurisées
- JWT Secret personnalisable
- Configuration flexible

## 📊 Monitoring

### Supabase Dashboard
- Métriques en temps réel
- Logs des requêtes
- Monitoring des performances
- Gestion des utilisateurs

## 🚀 Déploiement

### Vercel
1. Connectez votre repo GitHub
2. Ajoutez les variables d'environnement
3. Déployez automatiquement

### Variables d'environnement Vercel
\`\`\`
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=ralph-xpert-secret-key-2025
\`\`\`

## 🔄 Migration depuis l'ancienne version

Les données existantes peuvent être migrées :
1. Exportez les fichiers JSON existants
2. Utilisez les scripts de migration (à créer)
3. Importez dans Supabase

## 📝 Notes Importantes

- Toutes les fonctionnalités existantes sont préservées
- L'interface utilisateur reste identique
- Performance améliorée avec PostgreSQL
- Sécurité renforcée avec Supabase
- Scalabilité automatique incluse
\`\`\`
