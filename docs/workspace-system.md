# Système de Workspaces

## Vue d'ensemble

Le système de **Workspaces** remplace l'ancien modèle `Company` dans Facturly. Un workspace représente un profil de facturation (billing profile) qui peut être soit une **entreprise** (`COMPANY`) soit un **individu/freelance** (`INDIVIDUAL`).

### Pourquoi Workspaces ?

Le modèle Workspaces offre plus de flexibilité :
- Support des freelances et des entreprises
- Un utilisateur peut avoir plusieurs workspaces à l'avenir
- Modèle "freelance-first" pour s'adapter aux besoins des travailleurs indépendants
- Séparation claire entre profil personnel et professionnel

## Architecture

### Types de Workspaces

```typescript
enum WorkspaceType {
  INDIVIDUAL = 'INDIVIDUAL',  // Freelance, travailleur indépendant
  COMPANY = 'COMPANY',        // Entreprise, société
}
```

### Entité Workspace

```typescript
{
  id: string;                    // UUID
  ownerUserId: string;           // ID de l'utilisateur propriétaire
  type: WorkspaceType;           // 'INDIVIDUAL' ou 'COMPANY'
  name?: string;                 // Nom du workspace (optionnel pour INDIVIDUAL)
  legalName?: string;            // Nom légal (raison sociale)
  taxId?: string;                // Numéro SIRET, etc.
  vatNumber?: string;            // Numéro de TVA intracommunautaire
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  defaultCurrency: string;       // 'EUR', 'USD', 'XOF' (défaut: 'EUR')
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Champs optionnels selon le type

**INDIVIDUAL (Freelance) :**
- `name` peut être `null` (nom de l'utilisateur utilisé par défaut)
- Autres champs optionnels selon les besoins

**COMPANY (Entreprise) :**
- `name` recommandé mais optionnel
- `legalName` et `taxId` recommandés pour la facturation

## Relations

Un Workspace est lié à :
- **Owner** : Un utilisateur propriétaire (relation `ManyToOne` avec `User`)
- **Clients** : Liste de clients (`OneToMany`)
- **Products** : Liste de produits/services (`OneToMany`)
- **Invoices** : Liste de factures (`OneToMany`)
- **Settings** : Paramètres de facturation (`OneToOne`)
- **Subscription** : Abonnement Stripe (`OneToOne`)

## API Endpoints

### 1. Obtenir mon workspace

```http
GET /workspaces/me
Authorization: Bearer {token}
```

**Réponse :**
```json
{
  "id": "workspace-uuid",
  "type": "COMPANY",
  "name": "Ma Société",
  "legalName": "Ma Société SARL",
  "taxId": "12345678901234",
  "vatNumber": "FR12345678901",
  "addressLine1": "123 Rue Example",
  "city": "Paris",
  "postalCode": "75001",
  "country": "France",
  "defaultCurrency": "EUR",
  "logoUrl": "https://...",
  "profileCompletion": 85,
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-01-15T10:00:00Z"
}
```

**profileCompletion** : Pourcentage de complétion du profil (0-100)

### 2. Mettre à jour mon workspace

```http
PATCH /workspaces/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Nouveau nom",
  "legalName": "Nouvelle raison sociale",
  "taxId": "98765432109876",
  "vatNumber": "FR98765432109",
  "addressLine1": "456 Nouvelle Rue",
  "city": "Lyon",
  "postalCode": "69001",
  "country": "France",
  "defaultCurrency": "EUR",
  "logoUrl": "https://example.com/logo.png",
  "type": "COMPANY"
}
```

**Champs modifiables :**
- `name` (string, optionnel)
- `legalName` (string, optionnel)
- `taxId` (string, optionnel)
- `vatNumber` (string, optionnel)
- `addressLine1`, `addressLine2` (string, optionnel)
- `postalCode` (string, optionnel)
- `city` (string, optionnel)
- `country` (string, optionnel)
- `defaultCurrency` (string, enum: 'EUR', 'USD', 'XOF')
- `logoUrl` (string, optionnel, URL)
- `type` (enum: 'INDIVIDUAL', 'COMPANY')

**Validation :**
- `defaultCurrency` doit être l'une des valeurs : `EUR`, `USD`, `XOF`
- `type` doit être `INDIVIDUAL` ou `COMPANY`

**Réponse :** Workspace mis à jour

### 3. Création d'un workspace

Un workspace est créé automatiquement lors de l'inscription via `/auth/register`.

**Lors de l'inscription :**
- Si `companyName` est fourni → `type = COMPANY`
- Si `companyName` n'est pas fourni → `type = INDIVIDUAL`
- `defaultCurrency` = 'EUR' par défaut

## Migration depuis Company

### Changements dans le code

Toutes les références à `Company` ont été remplacées par `Workspace` :

**Avant :**
```typescript
const company = await companyRepository.findOne({
  where: { ownerId: userId }
});
const subscription = await billingService.getSubscriptionByCompanyId(company.id);
```

**Après :**
```typescript
const workspace = await workspaceRepository.findOne({
  where: { ownerUserId: userId }
});
const subscription = await billingService.getSubscriptionByWorkspaceId(workspace.id);
```

### Changements dans les entités

- `companyId` → `workspaceId`
- `ownerId` → `ownerUserId`
- `Company` → `Workspace`
- `companies` table → `workspaces` table

### Migration de base de données

La migration `MigrateToWorkspaces20251219215032` :
1. Crée la table `workspaces`
2. Migre les données de `companies` vers `workspaces`
3. Met à jour toutes les références (`company_id` → `workspace_id`)
4. Supprime l'ancienne table `companies`

## Cas d'usage

### 1. Inscription d'un freelance

```json
POST /auth/register
{
  "email": "freelance@example.com",
  "password": "securePassword123",
  "firstName": "Jean",
  "lastName": "Dupont"
  // Pas de companyName → type = INDIVIDUAL
}
```

**Résultat :**
- Workspace créé avec `type = INDIVIDUAL`
- `name` = `null`
- L'utilisateur peut compléter son profil plus tard

### 2. Inscription d'une entreprise

```json
POST /auth/register
{
  "email": "contact@company.com",
  "password": "securePassword123",
  "firstName": "Marie",
  "lastName": "Martin",
  "companyName": "Ma Société SARL"
  // companyName fourni → type = COMPANY
}
```

**Résultat :**
- Workspace créé avec `type = COMPANY`
- `name` = "Ma Société SARL"
- L'utilisateur peut compléter les informations légales plus tard

### 3. Mise à jour du profil

```json
PATCH /workspaces/me
{
  "legalName": "Ma Société à Responsabilité Limitée",
  "taxId": "12345678901234",
  "vatNumber": "FR12345678901",
  "addressLine1": "123 Rue de la République",
  "city": "Paris",
  "postalCode": "75001",
  "country": "France"
}
```

## Calcul du profil de complétion

Le pourcentage de complétion (`profileCompletion`) est calculé à partir des champs suivants :

1. `name` (optionnel pour INDIVIDUAL)
2. `legalName`
3. `taxId`
4. `vatNumber`
5. `addressLine1`
6. `postalCode`
7. `city`
8. `country`
9. `defaultCurrency` (toujours présent)

**Formule :** `(champs remplis / total champs) × 100`

## Devise par défaut

Chaque workspace a une devise par défaut (`defaultCurrency`) :
- **Valeurs supportées :** `EUR`, `USD`, `XOF`
- **Défaut :** `EUR`
- **Utilisation :** 
  - Les produits créés utilisent cette devise par défaut
  - Les statistiques du dashboard sont converties dans cette devise
  - Les factures peuvent être dans une devise différente (conversion automatique)

## Limitations actuelles

### Un workspace par utilisateur

Actuellement, chaque utilisateur possède **un seul workspace**. La structure est prête pour supporter plusieurs workspaces à l'avenir.

### Relations existantes

- Chaque workspace a exactement **un** setting
- Chaque workspace a exactement **une** subscription
- Les clients, produits et factures appartiennent à **un seul** workspace

## Erreurs communes

### 1. Workspace non trouvé

```json
{
  "code": "WORKSPACE_NOT_FOUND",
  "message": "Workspace non trouvé"
}
```

**Cause :** L'utilisateur n'a pas de workspace associé (ne devrait pas arriver après inscription).

### 2. Devise non supportée

```json
{
  "code": "CURRENCY_INVALID",
  "message": "La devise doit être l'une des suivantes : EUR, XOF, USD"
}
```

**Cause :** Tentative d'utiliser une devise non supportée.

## Schéma de base de données

```sql
CREATE TYPE workspace_type AS ENUM ('INDIVIDUAL', 'COMPANY');

CREATE TABLE "workspaces" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "owner_user_id" uuid NOT NULL,
  "type" workspace_type NOT NULL DEFAULT 'COMPANY',
  "name" varchar,
  "legal_name" varchar,
  "tax_id" varchar,
  "vat_number" varchar,
  "address_line_1" varchar,
  "address_line_2" varchar,
  "postal_code" varchar,
  "city" varchar,
  "country" varchar,
  "default_currency" varchar(3) NOT NULL DEFAULT 'EUR',
  "logo_url" varchar,
  CONSTRAINT "FK_workspaces_owner" FOREIGN KEY ("owner_user_id") 
    REFERENCES "users" ("id") ON DELETE CASCADE
);

CREATE INDEX "IDX_workspaces_owner_user_id" ON "workspaces" ("owner_user_id");
```

## Exemples Frontend

### React/Next.js

```typescript
// Obtenir le workspace
const response = await fetch('/api/workspaces/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const workspace = await response.json();

// Mettre à jour le workspace
const updateWorkspace = async (data: Partial<Workspace>) => {
  const response = await fetch('/api/workspaces/me', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
};

// Utilisation
await updateWorkspace({
  name: 'Ma Nouvelle Société',
  legalName: 'Ma Nouvelle Société SARL',
  taxId: '12345678901234'
});
```

## Bonnes pratiques

1. **Complétion du profil :** Encouragez les utilisateurs à compléter leur profil workspace (meilleure facturation, conformité légale)

2. **Type INDIVIDUAL :** Pour les freelances, `name` peut rester `null`, utilisez `firstName + lastName` de l'utilisateur

3. **Type COMPANY :** Recommandez `legalName` et `taxId` pour les entreprises (facturation professionnelle)

4. **Devise :** Permettez aux utilisateurs de changer leur devise par défaut, mais expliquez l'impact sur les conversions

5. **Validation :** Validez les numéros de TVA et SIRET côté frontend avant envoi

## Évolutions futures

- Support de plusieurs workspaces par utilisateur
- Invitation de collaborateurs sur un workspace
- Workspaces partagés entre utilisateurs
- Templates de workspaces par secteur d'activité
- Synchronisation avec des registres d'entreprises (API gouvernementales)

## Support

Pour toute question sur le système Workspaces :
- Vérifiez cette documentation
- Consultez les logs d'erreur (code d'erreur `WORKSPACE_*`)
- Contactez l'équipe de développement

