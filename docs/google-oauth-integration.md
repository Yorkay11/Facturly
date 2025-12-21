# Intégration Google OAuth

## Vue d'ensemble

Facturly supporte l'authentification via Google OAuth 2.0, permettant aux utilisateurs de se connecter avec leur compte Google sans créer de mot de passe.

## Configuration

### 1. Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API "Google+ API" (ou "Google Identity Services")

### 2. Créer des identifiants OAuth 2.0

1. Allez dans **APIs & Services** > **Credentials**
2. Cliquez sur **Create Credentials** > **OAuth client ID**
3. Configurez l'écran de consentement OAuth si nécessaire
4. Sélectionnez le type d'application : **Web application**
5. Configurez les **Authorized redirect URIs** :
   - Développement : `http://localhost:3001/auth/google/callback`
   - Production : `https://facturlybackend-production.up.railway.app/auth/google/callback`

### 3. Variables d'environnement

Ajoutez les variables suivantes dans votre fichier `.env` :

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
```

**Pour la production :**
```env
GOOGLE_CALLBACK_URL=https://facturlybackend-production.up.railway.app/auth/google/callback
```

## Flux d'authentification

### 1. Initiation

L'utilisateur clique sur "Se connecter avec Google" et est redirigé vers :

```
GET /auth/google
```

Cette route redirige automatiquement vers Google pour l'authentification.

### 2. Callback

Après authentification, Google redirige vers :

```
GET /auth/google/callback
```

Le backend :
1. Récupère le profil Google
2. Crée ou met à jour l'utilisateur
3. Génère un JWT token
4. Redirige vers le frontend avec le token

### 3. Redirection frontend

Le backend redirige vers :

```
{FRONTEND_URL}/auth/callback?token={JWT_TOKEN}
```

Le frontend doit :
1. Récupérer le token depuis l'URL
2. Le stocker (localStorage, sessionStorage, etc.)
3. Rediriger vers la page d'accueil

## Endpoints API

### Initier l'authentification Google

```http
GET /auth/google
```

**Réponse :** Redirection vers Google OAuth

### Callback Google OAuth

```http
GET /auth/google/callback
```

**Paramètres de requête (gérés par Google) :**
- `code` : Code d'autorisation
- `state` : État de sécurité (optionnel)

**Réponse :** Redirection vers le frontend avec le token

## Comportement

**Important :** Google OAuth gère automatiquement à la fois le **login** et le **register**. Un seul endpoint `/auth/google` suffit pour les deux cas.

### Nouvel utilisateur (Register automatique)

Si l'utilisateur n'existe pas :
1. Un nouvel utilisateur est créé avec :
   - `email` : Email Google
   - `googleId` : ID Google unique
   - `firstName` : Prénom depuis Google
   - `lastName` : Nom depuis Google
   - `picture` : Photo de profil Google
   - `passwordHash` : `undefined` (pas de mot de passe)
2. **Aucun workspace n'est créé automatiquement** - l'utilisateur devra compléter son profil via `POST /workspaces`
3. Un JWT token est généré et retourné
4. L'utilisateur est automatiquement connecté
5. Le champ `workspace` dans la réponse est `null` jusqu'à ce que l'utilisateur crée son workspace

### Utilisateur existant (Login automatique)

Si l'utilisateur existe déjà (recherche par `email` ou `googleId`) :
1. **Par email** : L'utilisateur est trouvé et connecté
2. **Par googleId** : L'utilisateur est trouvé et connecté
3. Les informations sont mises à jour si nécessaire :
   - `googleId` est ajouté si manquant (lien de compte)
   - `firstName`, `lastName`, `picture` sont mis à jour si vides
4. `lastLoginAt` est mis à jour
5. Un JWT token est généré et retourné
6. L'utilisateur est automatiquement connecté

### Utilisateur avec mot de passe existant (Lien de compte)

Si un utilisateur existe avec un email mais sans `googleId` :
- Le `googleId` est ajouté à son compte
- Il peut désormais utiliser **Google OAuth** ou **email/password**
- C'est ce qu'on appelle un "lien de compte" (account linking)

## Sécurité

### Protection contre les comptes mixtes

Si un utilisateur essaie de se connecter avec email/password mais que son compte utilise Google OAuth :

```json
{
  "code": "AUTH_GOOGLE_ACCOUNT_USE_OAUTH",
  "message": "Ce compte utilise Google OAuth. Veuillez vous connecter avec Google."
}
```

### Validation

- L'email Google doit être vérifié
- Le `googleId` est unique dans la base de données
- Les tokens JWT sont signés avec le même secret que l'authentification classique

## Base de données

### Migration

Une migration ajoute les champs suivants à la table `users` :

```sql
ALTER TABLE "users" 
  ADD COLUMN "google_id" varchar,
  ADD COLUMN "picture" varchar,
  ALTER COLUMN "password_hash" DROP NOT NULL;

CREATE UNIQUE INDEX "IDX_users_google_id" 
  ON "users" ("google_id") 
  WHERE "google_id" IS NOT NULL;
```

### Schéma User

```typescript
{
  id: string;
  email: string;
  passwordHash?: string;        // Nullable pour les utilisateurs Google
  firstName?: string;
  lastName?: string;
  googleId?: string;             // ID Google unique
  picture?: string;               // URL de la photo de profil
  lastLoginAt?: Date;
  workspaces: Workspace[];
}
```

## Frontend

### Exemple React/Next.js

```typescript
// Rediriger vers Google OAuth
const handleGoogleLogin = () => {
  window.location.href = `${API_URL}/auth/google`;
};

// Gérer le callback
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    // Stocker le token
    localStorage.setItem('accessToken', token);
    
    // Rediriger vers la page d'accueil
    router.push('/dashboard');
  }
}, []);
```

### Bouton de connexion

```tsx
<button onClick={handleGoogleLogin}>
  <GoogleIcon />
  Se connecter avec Google
</button>
```

## Gestion des erreurs

### Erreurs possibles

1. **Google OAuth non configuré**
   - Vérifiez que `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, et `GOOGLE_CALLBACK_URL` sont définis

2. **Callback URL incorrecte**
   - Vérifiez que l'URL dans Google Cloud Console correspond à `GOOGLE_CALLBACK_URL`

3. **Beta limit atteint**
   - Si `BETA_MAX_USERS` est défini et atteint, l'inscription est bloquée

4. **Email déjà utilisé**
   - Si l'email existe déjà avec un autre compte, l'utilisateur est connecté à ce compte

## Tests

### Test local

1. Configurez les variables d'environnement
2. Démarrez le serveur : `pnpm start:dev`
3. Visitez : `http://localhost:3001/auth/google`
4. Connectez-vous avec un compte Google
5. Vérifiez la redirection vers le frontend avec le token

### Test de production

1. Configurez les URLs de production dans Google Cloud Console
2. Mettez à jour `GOOGLE_CALLBACK_URL` dans les variables d'environnement
3. Testez le flux complet

## Complétion du profil

Après l'authentification Google, l'utilisateur doit créer son workspace pour compléter son profil :

```http
POST /workspaces
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "INDIVIDUAL",  // ou "COMPANY"
  "name": "Mon Nom",      // optionnel pour INDIVIDUAL
  "defaultCurrency": "EUR"
}
```

**Réponse :**
- Le workspace est créé
- Une subscription "free implicite" est créée automatiquement
- Le workspace est retourné avec toutes ses informations

## Limitations actuelles

- Un utilisateur ne peut avoir qu'un seul `googleId`
- Les utilisateurs Google ne peuvent pas définir de mot de passe (utilisent uniquement OAuth)
- Le workspace doit être créé manuellement via `POST /workspaces` après l'authentification
- Un utilisateur ne peut avoir qu'un seul workspace (un workspace par utilisateur)

## Évolutions futures

- Support de plusieurs providers OAuth (GitHub, Microsoft, etc.)
- Lien de compte Google à un compte existant
- Déliaison de compte Google
- Workspace type personnalisé lors de l'inscription Google

## Support

Pour toute question sur l'intégration Google OAuth :
- Vérifiez cette documentation
- Consultez les logs d'erreur
- Vérifiez la configuration Google Cloud Console
- Contactez l'équipe de développement

