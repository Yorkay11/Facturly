# Free implicite (plan_id = NULL)

Ce projet utilise désormais un modèle **“free implicite”**:

- Il n’existe **pas** forcément de plan `free` dans la table `plans`
- Une subscription avec `subscriptions.plan_id = NULL` signifie **“plan gratuit implicite”**

L’objectif est d’éviter que le backend recrée un plan `free` en base et de simplifier la gestion quand un plan est supprimé.

---

## Principes

- **Source de vérité des plans payants**: table `plans`
- **Gratuit**: **absence de plan** (`planId = NULL`)
- **Limite de factures gratuite**: configurable via `FREE_INVOICE_LIMIT` (par défaut 10)
- **Stripe**: les plans payants sont toujours des `Plan` avec `stripePriceId` (le free implicite n’est pas synchronisé vers Stripe)

---

## Schéma / Base de données

### Changement principal

- `subscriptions.plan_id` est désormais **nullable**
- La FK est en **`ON DELETE SET NULL`**

Conséquence:
- Si un plan est supprimé, les subscriptions qui pointaient dessus basculent automatiquement en **free implicite**.

### Migration

- Migration: `src/database/migrations/1766000000000-SubscriptionPlanNullable.ts`

Exécution (déjà intégrée au script `build`):

```bash
pnpm build
```

ou uniquement migrations:

```bash
pnpm migration:run
```

---

## Backend: comportements attendus

### Création automatique de la subscription (free implicite)

Lors de l’inscription (création company), le backend crée une subscription par défaut via:

- `BillingService.ensureDefaultSubscription(companyId)`

Cette subscription a:
- `planId = NULL`
- période courante mensuelle (du 1er du mois à +1 mois)
- `status = ACTIVE`

### Récupération subscription

Endpoints comme:
- `GET /subscriptions/me`

Comportement:
- Si la company n’a pas encore de subscription, le backend **en crée une** (free implicite) puis la retourne.

### Limites de factures

Le calcul de limite suit l’ordre:
1. `subscription.invoiceLimitOverride` si défini
2. `subscription.plan.invoiceLimit` si `plan` existe
3. **fallback free implicite**: `FREE_INVOICE_LIMIT` (par défaut 10)

Cas “illimité”:
- si `invoiceLimitOverride` est `null`/`undefined` et `plan.invoiceLimit` est `null`/`undefined` (ou `plan` absent et tu choisis `FREE_INVOICE_LIMIT` très élevé)

---

## Configuration

### `config/env.example`

Variable ajoutée:

- `FREE_INVOICE_LIMIT=10`

En prod, définis-la explicitement si tu veux changer la limite du plan gratuit implicite.

---

## Seeds / Réparation d’une DB

### Rattacher une subscription “free implicite” aux companies qui n’en ont pas

Commande:

```bash
pnpm seed:free-subscriptions
```

Effet:
- Trouve les companies sans abonnement
- Crée une subscription par company avec `planId = NULL`

> Note: le nom du script est **`seed:free-subscriptions`** (pas `seed:free`).

### Seed des plans payants

Commande:

```bash
pnpm seed:plans
```

Effet:
- Crée **uniquement** les plans payants (Pro/Entreprise mensuel/annuel…)
- Ne crée plus de plan `free`

---

## Stripe (rappel)

- Les plans payants doivent avoir `stripePriceId` en DB (sinon checkout impossible)
- Le free implicite n’a pas d’objet Stripe dédié
- Quand Stripe confirme un paiement (invoice/webhooks), la subscription locale doit être mise à jour vers un `planId` payant

Si tu vois des utilisateurs “bloqués free” après paiement:
- vérifier que la subscription locale liée au customer/metadata est bien trouvée
- vérifier que l’invoice Stripe contient le `priceId` (ou metadata `planId`)
- vérifier que ton app pointe vers la **bonne base** (env `DATABASE_URL`)

---

## Frontend: recommandations

### Affichage

Si l’API renvoie:
- `subscription.plan = null` ou `subscription.planId = null`

Alors afficher:
- nom: `Gratuit`
- prix: `0`
- intervalle: `mensuel`
- limite: `subscription.invoiceLimit.effective` (ou `FREE_INVOICE_LIMIT`)

### Actions

- Souscrire à un plan payant: utiliser `POST /checkout/create`
- Changer de plan (si abonnement Stripe actif): `POST /subscriptions/change-plan`

---

## Checklist de validation

- **DB**
  - `subscriptions.plan_id` est nullable
  - FK `ON DELETE SET NULL`
- **Config**
  - `FREE_INVOICE_LIMIT` défini en prod
- **API**
  - `GET /subscriptions/me` fonctionne même sans subscription préexistante
  - création de facture respecte la limite (free implicite)
- **Seeds**
  - `pnpm seed:free-subscriptions` fonctionne
  - `pnpm seed:plans` ne recrée pas `free`


