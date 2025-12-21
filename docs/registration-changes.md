# Modifications du système d'inscription

## Vue d'ensemble

Le système d'inscription a été modifié pour supprimer la création automatique du workspace lors de l'inscription. L'utilisateur doit maintenant créer son workspace manuellement après l'inscription, via l'API `POST /workspaces`.

## Changements principaux

### 1. Suppression du champ `companyName`

**Avant :**
```typescript
// RegisterDto contenait un champ optionnel companyName
export class RegisterDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  companyName?: string; // ❌ Supprimé
}
```

**Après :**
```typescript
// RegisterDto ne contient plus companyName
export class RegisterDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  // companyName a été supprimé
}
```

### 2. Suppression de la création automatique du workspace

**Avant :**
- Lors de l'inscription (`POST /auth/register`), un workspace était créé automatiquement
- Le type du workspace était déterminé par la présence ou non de `companyName` :
  - Si `companyName` était fourni → `type = COMPANY`
  - Si `companyName` n'était pas fourni → `type = INDIVIDUAL`
- Une subscription "free implicite" était créée automatiquement

**Après :**
- Lors de l'inscription (`POST /auth/register`), **aucun workspace n'est créé**
- Le champ `workspace` dans la réponse est `null`
- L'utilisateur doit créer son workspace via `POST /workspaces` après l'inscription
- La subscription "free implicite" est créée lors de la création du workspace

### 3. Uniformisation avec Google OAuth

Le comportement est maintenant identique pour :
- Inscription classique (email/password)
- Inscription via Google OAuth

Dans les deux cas, **aucun workspace n'est créé automatiquement**.

## Flux d'inscription mis à jour

### 1. Inscription classique (email/password)

#### Étape 1 : Inscription

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "Jean",
  "lastName": "Dupont"
}
```

**Réponse :**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "firstName": "Jean",
  "lastName": "Dupont",
  "workspace": null,  // ⚠️ Workspace n'est plus créé automatiquement
  "accessToken": "jwt-token"
}
```

#### Étape 2 : Création du workspace

```http
POST /workspaces
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "type": "INDIVIDUAL",  // ou "COMPANY"
  "name": "Jean Dupont",  // optionnel pour INDIVIDUAL
  "defaultCurrency": "EUR"
}
```

**Réponse :**
```json
{
  "id": "workspace-uuid",
  "type": "INDIVIDUAL",
  "name": "Jean Dupont",
  "defaultCurrency": "EUR",
  "ownerUserId": "user-uuid",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

**Note :** Une subscription "free implicite" est créée automatiquement lors de la création du workspace.

### 2. Inscription via Google OAuth

Le flux est identique à l'inscription classique :

1. L'utilisateur se connecte via Google OAuth (`GET /auth/google`)
2. Le backend crée l'utilisateur et retourne un JWT token
3. Le champ `workspace` dans la réponse est `null`
4. L'utilisateur doit créer son workspace via `POST /workspaces`

## Impact sur le frontend

### Avant

```typescript
// Le frontend pouvait supposer qu'un workspace existait après l'inscription
const registerResponse = await register(registerDto);
if (registerResponse.workspace) {
  // Workspace créé automatiquement
  router.push('/dashboard');
}
```

### Après

```typescript
// Le frontend doit vérifier si un workspace existe et le créer si nécessaire
const registerResponse = await register(registerDto);

if (!registerResponse.workspace) {
  // Aucun workspace, rediriger vers la page de création de workspace
  router.push('/onboarding/create-workspace');
} else {
  router.push('/dashboard');
}
```

### Exemple complet : Gestion de l'onboarding

```typescript
// Après l'inscription ou la connexion
const authResponse = await authApi.getProfile(); // GET /auth/me

if (!authResponse.workspace) {
  // Aucun workspace, afficher le formulaire de création
  showWorkspaceCreationForm();
} else {
  // Workspace existe, aller au dashboard
  router.push('/dashboard');
}

// Lors de la création du workspace
async function createWorkspace(workspaceData: {
  type: 'INDIVIDUAL' | 'COMPANY';
  name?: string;
  defaultCurrency?: string;
}) {
  const workspace = await workspacesApi.create(workspaceData);
  
  // Le workspace est créé avec une subscription "free implicite"
  // Rediriger vers le dashboard
  router.push('/dashboard');
}
```

## Migration des utilisateurs existants

### Comportement

Les utilisateurs existants qui ont déjà un workspace créé automatiquement ne sont pas affectés. Leurs workspaces continuent de fonctionner normalement.

### Nouveaux utilisateurs

Les nouveaux utilisateurs (inscrits après cette modification) doivent créer leur workspace manuellement via `POST /workspaces`.

## Changements dans le code

### `AuthService.register()`

**Avant :**
```typescript
async register(registerDto: RegisterDto) {
  // ... validation et création de l'utilisateur ...
  
  // Création automatique du workspace
  const workspaceType = registerDto.companyName 
    ? WorkspaceType.COMPANY 
    : WorkspaceType.INDIVIDUAL;
  
  const workspace = this.workspaceRepository.create({
    name: registerDto.companyName || undefined,
    ownerUserId: savedUser.id,
    type: workspaceType,
    defaultCurrency: 'EUR',
  });
  
  const savedWorkspace = await this.workspaceRepository.save(workspace);
  
  // Création de la subscription
  await this.billingService.ensureDefaultSubscription(savedWorkspace.id);
  
  return {
    // ... user data ...
    workspace: { /* workspace data */ },
    accessToken,
  };
}
```

**Après :**
```typescript
async register(registerDto: RegisterDto) {
  // ... validation et création de l'utilisateur ...
  
  // ❌ Plus de création automatique du workspace
  
  return {
    // ... user data ...
    workspace: null, // Workspace sera créé lors de la complétion du profil
    accessToken,
  };
}
```

### `WorkspacesService.createWorkspace()`

Cette méthode crée maintenant la subscription "free implicite" :

```typescript
async createWorkspace(
  ownerUserId: string,
  workspaceDto: {
    type?: 'INDIVIDUAL' | 'COMPANY';
    name?: string;
    defaultCurrency?: string;
  },
): Promise<Workspace> {
  // ... création du workspace ...
  
  // Créer automatiquement une subscription "free implicite"
  await this.billingService.ensureDefaultSubscription(savedWorkspace.id);
  
  return savedWorkspace;
}
```

## Avantages de cette approche

1. **Flexibilité** : L'utilisateur choisit le type de workspace et ses informations au moment de la création
2. **Uniformité** : Le comportement est identique pour l'inscription classique et Google OAuth
3. **Profil complet** : L'utilisateur peut compléter son profil de manière plus réfléchie
4. **Meilleure UX** : L'utilisateur peut explorer l'application avant de créer son workspace

## Endpoints concernés

### Modifiés

- `POST /auth/register` : Ne crée plus de workspace automatiquement
- `GET /auth/me` : Retourne `workspace: null` si aucun workspace n'existe
- `GET /workspaces/me` : Retourne `workspace: null` si aucun workspace n'existe (au lieu de lancer une erreur)

### Non modifiés

- `POST /workspaces` : Crée un workspace (comportement inchangé, mais maintenant utilisé après l'inscription)
- `PATCH /workspaces/me` : Met à jour un workspace existant

## Tests

Tous les tests ont été mis à jour pour refléter ces changements :

- `auth.service.spec.ts` : Les tests vérifient que `workspace: null` est retourné
- `auth.controller.spec.ts` : Les tests ne passent plus de paramètre `companyName`
- Les autres tests ont été ajustés en conséquence

## Compatibilité

Cette modification est **non rétrocompatible** pour les nouveaux utilisateurs :

- ✅ Les utilisateurs existants avec un workspace continuent de fonctionner
- ❌ Le frontend doit être mis à jour pour gérer le cas où `workspace` est `null`
- ❌ Le champ `companyName` n'est plus accepté dans `POST /auth/register`

## Conclusion

Cette modification permet un contrôle plus fin sur la création du workspace et une meilleure expérience utilisateur, en permettant à l'utilisateur de compléter son profil de manière plus réfléchie plutôt que de le forcer à créer un workspace lors de l'inscription.

