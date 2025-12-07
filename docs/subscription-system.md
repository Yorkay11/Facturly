# Système d'Abonnements

Ce document décrit l'architecture et l'implémentation du système d'abonnements pour Facturly.

## Vue d'ensemble

Le système d'abonnements permet de gérer les plans tarifaires et les abonnements des entreprises utilisant la plateforme. Chaque entreprise (Company) a un abonnement unique qui détermine ses limites et fonctionnalités.

### Fonctionnalités principales

- **Plans tarifaires** : Définition de différents plans (Gratuit, Pro, Enterprise, etc.)
- **Abonnements automatiques** : Attribution automatique d'un plan gratuit lors de l'inscription
- **Gestion des périodes** : Suivi des périodes de facturation (mensuelle/annuelle)
- **Limites de factures** : Contrôle du nombre de factures par période
- **Changement de plan** : Possibilité de changer de plan avec prorata
- **Annulation** : Gestion de l'annulation d'abonnements

## Architecture

### Entités

#### Plan (`plans`)

Représente un plan tarifaire disponible.

```typescript
{
  id: string;
  code: string;              // Code unique (ex: 'free', 'pro', 'enterprise')
  name: string;              // Nom du plan (ex: 'Gratuit', 'Pro')
  description?: string;      // Description du plan
  price: string;             // Prix (decimal, ex: '0.00', '29.99')
  currency: string;          // Devise (ex: 'EUR')
  billingInterval: 'monthly' | 'yearly';  // Intervalle de facturation
  invoiceLimit?: number;    // Limite de factures par période (null = illimité)
  metadata?: object;         // Données additionnelles (JSONB)
  createdAt: Date;
  updatedAt: Date;
}
```

#### Subscription (`subscriptions`)

Représente l'abonnement d'une entreprise à un plan.

**Structure en base de données :**
```typescript
{
  id: string;
  companyId: string;        // Company concernée (unique, OneToOne)
  planId: string;           // Plan auquel l'entreprise est abonnée
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive';
  startedAt: Date;          // Date de début de l'abonnement
  currentPeriodStart: Date; // Début de la période actuelle
  currentPeriodEnd: Date;   // Fin de la période actuelle
  nextBillingAt?: Date;     // Prochaine date de facturation
  canceledAt?: Date;        // Date d'annulation (si annulé)
  invoiceLimitOverride?: number;  // Override manuel de la limite
  invoicesIssuedCurrentPeriod: number;  // Compteur de factures émises
  createdAt: Date;
  updatedAt: Date;
}
```

**Structure retournée par l'API (frontend) :**
```typescript
{
  id: string;
  status: string;                          // Statut de l'abonnement
  currentPeriodStart: string;              // Début de la période actuelle (ISO date)
  currentPeriodEnd: string;                // Fin de la période actuelle (ISO date)
  cancelAtPeriodEnd: boolean;              // Si true, annulera à la fin de la période
  plan: {                                  // Plan associé
    id: string;
    code: string;
    name: string;
    price: string;
    currency: string;
    billingInterval: 'monthly' | 'yearly';
    invoiceLimit?: number | null;
  };
  createdAt?: string;                      // Date de création (ISO date)
  updatedAt?: string;                      // Date de mise à jour (ISO date)
}
```

**Note :** L'API ne retourne pas actuellement les champs `invoicesIssuedCurrentPeriod`, `invoiceLimitOverride`, `companyId`, `planId`, `startedAt`, `nextBillingAt`, et `canceledAt`. Ces champs sont gérés en base de données mais ne sont pas exposés dans l'API publique.

### Relations

- **Company ↔ Subscription** : OneToOne (une company = un abonnement)
- **Plan ↔ Subscription** : OneToMany (un plan peut avoir plusieurs abonnements)
- **Subscription → Plan** : ManyToOne (chaque abonnement référence un plan)

## Plan Gratuit par Défaut

### Création automatique

Lors de l'inscription d'un nouvel utilisateur :

1. L'utilisateur est créé
2. La company est créée
3. **Un abonnement gratuit est automatiquement créé** avec le plan "free"

### Caractéristiques du plan gratuit

Le plan gratuit est créé automatiquement s'il n'existe pas encore avec les caractéristiques suivantes :

```typescript
{
  code: 'free',
  name: 'Gratuit',
  description: 'Plan gratuit avec fonctionnalités de base',
  price: '0.00',
  currency: 'EUR',
  billingInterval: 'monthly',
  invoiceLimit: 10  // 10 factures par mois
}
```

### Implémentation

Le plan gratuit est géré par deux méthodes dans `BillingService` :

- `getOrCreateFreePlan()` : Récupère ou crée le plan "free"
- `createFreeSubscription(companyId)` : Crée un abonnement gratuit pour une company

## Statuts d'abonnement

| Statut | Description |
|--------|-------------|
| `active` | Abonnement actif et en cours |
| `trialing` | Période d'essai |
| `past_due` | En retard de paiement |
| `canceled` | Abonnement annulé |
| `inactive` | Abonnement inactif |

## Gestion des périodes

### Calcul des périodes

- **Mensuel** : `currentPeriodEnd` = `currentPeriodStart` + 1 mois
- **Annuel** : `currentPeriodEnd` = `currentPeriodStart` + 1 an

### Réinitialisation

Le compteur `invoicesIssuedCurrentPeriod` doit être réinitialisé à chaque nouvelle période (à implémenter via un job/cron).

## Limites de factures

### Limite par plan

Chaque plan peut définir une limite de factures via `invoiceLimit` :
- `null` ou `undefined` : Illimité
- `number` : Nombre maximum de factures par période

### Override manuel

Un administrateur peut définir un `invoiceLimitOverride` sur une subscription pour modifier la limite d'un abonnement spécifique.

### Compteur

Le champ `invoicesIssuedCurrentPeriod` suit le nombre de factures émises dans la période actuelle.

**Note** : La vérification des limites lors de la création de factures n'est pas encore implémentée. C'est une fonctionnalité à ajouter dans `InvoicingService.create()`.

## API Endpoints

### GET `/plans`

Récupère la liste de tous les plans disponibles.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "code": "free",
      "name": "Gratuit",
      "description": "Plan gratuit avec fonctionnalités de base",
      "price": "0.00",
      "currency": "EUR",
      "billingInterval": "monthly",
      "invoiceLimit": 10,
      "createdAt": "2025-01-01T00:00:00Z"
    },
    {
      "id": "uuid",
      "code": "pro",
      "name": "Pro",
      "description": "Plan professionnel",
      "price": "29.99",
      "currency": "EUR",
      "billingInterval": "monthly",
      "invoiceLimit": 100,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### GET `/subscriptions/me`

Récupère l'abonnement de l'utilisateur connecté.

**Response (200 OK):**
```json
{
  "id": "uuid",
  "status": "active",
  "currentPeriodStart": "2025-01-01T00:00:00Z",
  "currentPeriodEnd": "2025-02-01T00:00:00Z",
  "cancelAtPeriodEnd": false,
  "plan": {
    "id": "uuid",
    "code": "free",
    "name": "Gratuit",
    "price": "0.00",
    "currency": "EUR",
    "billingInterval": "monthly",
    "invoiceLimit": 10
  },
  "createdAt": "2025-01-01T10:00:00Z",
  "updatedAt": "2025-01-01T10:00:00Z"
}
```

**Note :** Les champs `invoicesIssuedCurrentPeriod`, `invoiceLimitOverride`, `companyId`, `planId`, `startedAt`, `nextBillingAt`, et `canceledAt` sont gérés en base de données mais ne sont pas retournés par l'API publique pour simplifier la réponse.

**Error (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Subscription not found"
}
```

### POST `/subscriptions`

Crée ou met à jour un abonnement pour l'utilisateur connecté.

**Request Body:**
```json
{
  "planId": "uuid"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "status": "active",
  "currentPeriodStart": "2025-01-01T00:00:00Z",
  "currentPeriodEnd": "2025-02-01T00:00:00Z",
  "cancelAtPeriodEnd": false,
  "plan": {
    "id": "uuid",
    "code": "pro",
    "name": "Pro Plan",
    "price": "29.99",
    "currency": "EUR",
    "billingInterval": "monthly",
    "invoiceLimit": null
  },
  "createdAt": "2025-01-01T10:00:00Z",
  "updatedAt": "2025-01-01T10:00:00Z"
}
```

**Comportement :**
- Si l'entreprise n'a pas d'abonnement : crée un nouvel abonnement
- Si l'entreprise a déjà un abonnement : met à jour le plan et réinitialise la période

### POST `/subscriptions/preview`

Prévisualise un changement de plan (calcul du prorata, changement de limites, etc.).

**Request Body:**
```json
{
  "planId": "uuid"
}
```

**Response (200 OK):**
```json
{
  "currentPlan": {
    "id": "uuid",
    "code": "free",
    "name": "Gratuit",
    "price": "0.00"
  },
  "newPlan": {
    "id": "uuid",
    "code": "pro",
    "name": "Pro",
    "price": "29.99"
  },
  "prorationAmount": "14.99",
  "nextBillingDate": "2025-02-01T00:00:00Z",
  "invoiceLimitChange": {
    "current": 10,
    "new": 100
  }
}
```

**Note** : Le calcul du prorata est simplifié (50% de la période restante). Une implémentation plus précise peut être ajoutée.

**Note importante sur la structure des données :**

Il existe une différence entre la structure de la base de données (backend) et la structure retournée par l'API (frontend) :

- **Base de données** : Contient tous les champs détaillés (`companyId`, `planId`, `startedAt`, `nextBillingAt`, `canceledAt`, `invoiceLimitOverride`, `invoicesIssuedCurrentPeriod`)
- **API publique** : Retourne une version simplifiée avec seulement les champs nécessaires au frontend (`status`, `currentPeriodStart`, `currentPeriodEnd`, `cancelAtPeriodEnd`, `plan`)

Le champ `cancelAtPeriodEnd` est un booléen qui indique si l'abonnement sera annulé à la fin de la période en cours, remplaçant la logique basée sur `canceledAt` dans l'API publique.

### POST `/subscriptions/cancel`

Annule l'abonnement de l'utilisateur connecté.

**Response (200 OK):**
```json
{
  "id": "uuid",
  "status": "canceled",
  "currentPeriodStart": "2025-01-01T00:00:00Z",
  "currentPeriodEnd": "2025-02-01T00:00:00Z",
  "cancelAtPeriodEnd": true,
  "plan": {
    "id": "uuid",
    "code": "free",
    "name": "Gratuit",
    "price": "0.00",
    "currency": "EUR",
    "billingInterval": "monthly",
    "invoiceLimit": 10
  },
  "createdAt": "2025-01-01T10:00:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

## Implémentation technique

### BillingService

Service principal pour la gestion des abonnements.

#### Méthodes principales

**`getPlans()`**
- Récupère tous les plans disponibles, triés par prix croissant

**`getSubscriptionByUserId(userId: string)`**
- Récupère l'abonnement d'un utilisateur via sa company

**`createSubscription(userId: string, planId: string)`**
- Crée ou met à jour un abonnement
- Calcule automatiquement `currentPeriodEnd` selon `billingInterval`

**`previewSubscriptionChange(userId: string, planId: string)`**
- Aperçu d'un changement de plan avec calcul de prorata

**`cancelSubscription(userId: string)`**
- Annule un abonnement (statut → `CANCELED`)

#### Méthodes pour le plan gratuit

**`getOrCreateFreePlan()`**
- Récupère le plan "free" s'il existe
- Sinon, crée le plan gratuit avec les caractéristiques par défaut
- Retourne le plan

**`createFreeSubscription(companyId: string)`**
- Crée un abonnement gratuit pour une company
- Utilise `getOrCreateFreePlan()` pour obtenir le plan
- Initialise la période à 1 mois
- Définit le compteur de factures à 0

### Intégration avec l'authentification

Dans `AuthService.register()` :

```typescript
// Après la création de la company
const savedCompany = await this.companyRepository.save(company);

// Créer automatiquement un abonnement gratuit
try {
  await this.billingService.createFreeSubscription(savedCompany.id);
  this.logger.log(`Abonnement gratuit créé pour la company ${savedCompany.id}`);
} catch (error) {
  this.logger.error(`Erreur lors de la création de l'abonnement gratuit: ${error.message}`);
  // Ne pas faire échouer l'enregistrement si l'abonnement échoue
}
```

## Migration de base de données

Les tables sont créées via la migration `1731340800000-InitialSchema.ts` :

```sql
CREATE TABLE "plans" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "code" varchar NOT NULL UNIQUE,
  "name" varchar NOT NULL,
  "description" text,
  "price" decimal(12,2) NOT NULL DEFAULT '0',
  "currency" varchar(3) NOT NULL DEFAULT 'EUR',
  "billing_interval" varchar NOT NULL DEFAULT 'monthly',
  "invoice_limit" integer,
  "metadata" jsonb
);

CREATE TABLE "subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "company_id" uuid NOT NULL UNIQUE,
  "plan_id" uuid NOT NULL,
  "status" varchar NOT NULL DEFAULT 'active',
  "started_at" TIMESTAMPTZ NOT NULL,
  "current_period_start" TIMESTAMPTZ NOT NULL,
  "current_period_end" TIMESTAMPTZ NOT NULL,
  "next_billing_at" TIMESTAMPTZ,
  "canceled_at" TIMESTAMPTZ,
  "invoice_limit_override" integer,
  "invoices_issued_current_period" integer NOT NULL DEFAULT 0,
  CONSTRAINT "FK_subscriptions_company" FOREIGN KEY ("company_id") 
    REFERENCES "companies" ("id") ON DELETE CASCADE,
  CONSTRAINT "FK_subscriptions_plan" FOREIGN KEY ("plan_id") 
    REFERENCES "plans" ("id") ON DELETE RESTRICT
);
```

## Fonctionnalités à implémenter

### 1. Vérification des limites lors de la création de factures

Dans `InvoicingService.create()`, ajouter une vérification :

```typescript
// Vérifier la limite de factures
const subscription = await this.getSubscriptionByCompanyId(company.id);
const effectiveLimit = subscription.invoiceLimitOverride ?? subscription.plan.invoiceLimit;

if (effectiveLimit !== null && subscription.invoicesIssuedCurrentPeriod >= effectiveLimit) {
  throw new BadRequestException(
    `Limite de factures atteinte (${effectiveLimit} factures par période). Veuillez mettre à niveau votre abonnement.`
  );
}
```

### 2. Incrémentation du compteur

Après la création d'une facture, incrémenter `invoicesIssuedCurrentPeriod` :

```typescript
// Dans InvoicingService.create(), après la création de la facture
if (subscription) {
  subscription.invoicesIssuedCurrentPeriod += 1;
  await this.subscriptionRepository.save(subscription);
}
```

### 3. Réinitialisation périodique

Créer un job/cron pour réinitialiser les compteurs à chaque nouvelle période :

```typescript
// Job à exécuter quotidiennement
async resetInvoiceCounters() {
  const now = new Date();
  const subscriptions = await this.subscriptionRepository.find({
    where: {
      status: SubscriptionStatus.ACTIVE,
    },
    relations: ['plan'],
  });

  for (const subscription of subscriptions) {
    if (subscription.currentPeriodEnd <= now) {
      // Nouvelle période
      const periodStart = now;
      const periodEnd = new Date(now);
      
      if (subscription.plan.billingInterval === BillingInterval.MONTHLY) {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }

      subscription.currentPeriodStart = periodStart;
      subscription.currentPeriodEnd = periodEnd;
      subscription.invoicesIssuedCurrentPeriod = 0;
      await this.subscriptionRepository.save(subscription);
    }
  }
}
```

### 4. Intégration avec un processeur de paiement

Pour les plans payants, intégrer avec Stripe, PayPal, etc. :
- Créer des customers
- Gérer les paiements récurrents
- Gérer les webhooks (paiement réussi, échec, annulation)

### 5. Gestion des périodes d'essai

Ajouter la logique pour les périodes d'essai :
- Statut `TRIALING`
- Conversion automatique en `ACTIVE` après la période d'essai
- Notification avant la fin de l'essai

## Exemples d'utilisation

### Frontend - Récupérer les plans

```typescript
const response = await fetch('/api/plans', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const { data: plans } = await response.json();
console.log('Plans disponibles:', plans);
```

### Frontend - Récupérer mon abonnement

```typescript
const response = await fetch('/api/subscriptions/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const subscription = await response.json();
console.log('Mon abonnement:', subscription);
console.log('Plan:', subscription.plan.name);
console.log('Statut:', subscription.status);
console.log('Limite:', subscription.plan.invoiceLimit);
console.log('Annulation programmée:', subscription.cancelAtPeriodEnd);
```

**Note :** Le compteur `invoicesIssuedCurrentPeriod` n'est pas actuellement exposé par l'API. Cette information doit être calculée côté client en comptant les factures créées dans la période actuelle, ou ajoutée à l'API si nécessaire.

### Frontend - Changer de plan

```typescript
// Prévisualiser le changement
const previewResponse = await fetch('/api/subscriptions/preview', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ planId: 'pro-plan-uuid' }),
});

const preview = await previewResponse.json();
console.log('Prorata:', preview.prorationAmount);
console.log('Nouvelle limite:', preview.invoiceLimitChange.new);

// Confirmer le changement
const confirmResponse = await fetch('/api/subscriptions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ planId: 'pro-plan-uuid' }),
});

const newSubscription = await confirmResponse.json();
console.log('Abonnement mis à jour:', newSubscription);
```

### Frontend - Annuler l'abonnement

```typescript
const response = await fetch('/api/subscriptions/cancel', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const canceledSubscription = await response.json();
console.log('Abonnement annulé:', canceledSubscription);
```

## Bonnes pratiques

1. **Vérification des limites** : Toujours vérifier les limites avant d'autoriser une action
2. **Gestion d'erreurs** : Gérer gracieusement les erreurs de création d'abonnement
3. **Logging** : Logger les changements d'abonnement pour le debugging
4. **Sécurité** : Vérifier que l'utilisateur ne peut modifier que son propre abonnement
5. **Performance** : Utiliser des relations TypeORM pour éviter les requêtes N+1
6. **Transactions** : Utiliser des transactions pour les opérations critiques (création d'abonnement + company)

## Configuration

Aucune configuration supplémentaire n'est nécessaire. Le système utilise la base de données existante et crée automatiquement le plan gratuit lors de la première utilisation.

## Améliorations futures

- [ ] Intégration avec un processeur de paiement (Stripe, PayPal)
- [ ] Webhooks pour les événements d'abonnement
- [ ] Gestion des périodes d'essai
- [ ] Notifications avant expiration
- [ ] Tableau de bord d'administration pour gérer les plans
- [ ] Analytics sur les abonnements
- [ ] Système de coupons/réductions
- [ ] Facturation automatique des plans payants
- [ ] Gestion des remboursements
- [ ] Export des données d'abonnement
