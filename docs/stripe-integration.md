# Intégration Stripe - Guide Complet

Ce document décrit comment utiliser l'intégration Stripe pour gérer les abonnements dans Facturly.

## 📋 Prérequis

1. Compte Stripe (mode test ou production)
2. Clés API Stripe
3. Configuration des webhooks Stripe
4. Backend API configuré avec les endpoints Stripe

## 🔧 Configuration

### Variables d'Environnement

Ajoutez les variables suivantes à votre fichier `.env` côté backend :

```env
# Clés API Stripe
STRIPE_SECRET_KEY=sk_test_... # ou sk_live_... en production
STRIPE_PUBLISHABLE_KEY=pk_test_... # ou pk_live_... en production
STRIPE_WEBHOOK_SECRET=whsec_... # Secret du webhook

# URL de l'application (pour les redirects)
APP_URL=https://votre-domaine.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Pour le frontend
```

### Clés API Stripe

1. **Récupérer les clés API:**
   - Connectez-vous à votre [tableau de bord Stripe](https://dashboard.stripe.com/)
   - Allez dans **Developers > API keys**
   - Copiez la **Secret key** (commence par `sk_test_` ou `sk_live_`)
   - Copiez la **Publishable key** (commence par `pk_test_` ou `pk_live_`)

2. **Créer un webhook endpoint:**
   - Dans Stripe Dashboard, allez dans **Developers > Webhooks**
   - Cliquez sur **Add endpoint**
   - URL: `https://votre-domaine.com/webhooks/stripe` (ou votre endpoint backend)
   - Sélectionnez les événements suivants:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copiez le **Signing secret** (commence par `whsec_`)

## 🗄️ Migration de Base de Données

Les nouvelles colonnes doivent être ajoutées à la base de données:

```sql
-- Ajouter les champs Stripe à la table subscriptions
ALTER TABLE subscriptions
ADD COLUMN stripe_customer_id VARCHAR(255),
ADD COLUMN stripe_subscription_id VARCHAR(255),
ADD COLUMN stripe_price_id VARCHAR(255);

-- Ajouter les champs Stripe à la table plans
ALTER TABLE plans
ADD COLUMN stripe_product_id VARCHAR(255),
ADD COLUMN stripe_price_id VARCHAR(255);
```

## 📦 Synchronisation des Plans avec Stripe

### Créer des Products et Prices dans Stripe

Pour chaque plan dans votre base de données, créez un Product et un Price dans Stripe:

1. **Dans Stripe Dashboard:**
   - Allez dans **Products**
   - Créez un nouveau produit pour chaque plan
   - Créez un Price pour chaque produit (mensuel ou annuel)
   - Copiez les IDs (commencent par `prod_` et `price_`)

2. **Utiliser le script de synchronisation automatique (Recommandé):**

Le backend inclut un script pour synchroniser automatiquement les plans:

```bash
pnpm seed:sync-stripe-plans
```

Ce script:
- ✅ Récupère tous les plans depuis la base de données
- ✅ Crée automatiquement les Products et Prices dans Stripe
- ✅ Configure les bons intervalles de facturation (mensuel/annuel)
- ✅ Met à jour les plans locaux avec les IDs Stripe
- ✅ Ignore le plan gratuit (pas besoin sur Stripe)
- ✅ Vérifie et met à jour les plans existants si nécessaire

**Notes importantes:**
- Les plans mensuels sont créés avec l'intervalle `month` dans Stripe
- Les plans annuels sont créés avec l'intervalle `year` dans Stripe
- Le script est idempotent : il peut être exécuté plusieurs fois en toute sécurité

## 🚀 Utilisation

### Architecture Frontend/Backend

L'intégration Stripe fonctionne en deux parties:

1. **Backend**: Gère les sessions de checkout, les webhooks, et la synchronisation avec Stripe
2. **Frontend**: Utilise RTK Query pour appeler les endpoints backend et redirige vers Stripe Checkout

### Endpoints Backend Disponibles

Le backend expose les endpoints Stripe suivants:

- `POST /checkout/create` - Crée une session Stripe Checkout et retourne l'URL de redirection
- `POST /portal/create` - Crée une session Stripe Customer Portal pour gérer l'abonnement
- `POST /webhooks/stripe` - Endpoint pour recevoir les webhooks Stripe

**Note:** Ces endpoints sont implémentés côté backend. L'intégration frontend avec RTK Query reste à faire (voir section "Intégration avec RTK Query").

### 1. Créer une Session de Checkout

**Endpoint:** `POST /checkout/create`
**Auth:** Requis (JWT token dans header `Authorization: Bearer <token>`)

**Request Body:**
```json
{
  "planId": "uuid-du-plan"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_..."
}
```

**Utilisation Frontend:**

Utilisez RTK Query pour appeler cet endpoint. Après avoir reçu l'URL, redirigez l'utilisateur vers cette URL pour compléter le paiement.

### 2. Gérer le Retour de Checkout

Après le paiement réussi, Stripe redirige vers l'URL de succès configurée dans la session:
```
https://votre-domaine.com/billing/success?session_id={CHECKOUT_SESSION_ID}
```

**Page de succès:**

Créez une page Next.js pour gérer le retour. Cette page devrait:
- Récupérer le `session_id` depuis les query params
- Optionnellement vérifier le statut de la session via votre backend
- Afficher un message de confirmation
- L'abonnement sera automatiquement mis à jour via webhook

### 3. Portail Client Stripe

**Endpoint:** `POST /portal/create`
**Auth:** Requis (JWT token dans header `Authorization: Bearer <token>`)

**Response:**
```json
{
  "url": "https://billing.stripe.com/p/session/..."
}
```

Permet aux utilisateurs de gérer leur abonnement directement dans Stripe:
- Changer de plan
- Mettre à jour les informations de paiement
- Annuler l'abonnement
- Voir l'historique des factures

## 🔔 Webhooks

Les webhooks Stripe sont essentiels pour synchroniser l'état des abonnements entre Stripe et votre base de données.

### Endpoint Webhook

**Endpoint:** `POST /webhooks/stripe`
**Auth:** Non requis (validation via signature Stripe)

Cet endpoint doit:
- Valider la signature Stripe pour sécuriser les requêtes
- Traiter les événements reçus de manière idempotente
- Mettre à jour la base de données en fonction de l'événement

### Événements Gérés

- **checkout.session.completed**: 
  - Déclenché après un paiement réussi
  - Active l'abonnement dans votre base de données
  - Met à jour le statut de l'abonnement à `active`

- **customer.subscription.created**: 
  - Crée ou met à jour l'abonnement local
  - Enregistre les IDs Stripe (`stripe_customer_id`, `stripe_subscription_id`)

- **customer.subscription.updated**: 
  - Met à jour l'abonnement local (changement de plan, période, etc.)
  - Synchronise les dates de période

- **customer.subscription.deleted**: 
  - Annule l'abonnement local
  - Met le statut à `canceled`

- **invoice.payment_succeeded**: 
  - Confirme un paiement réussi
  - Peut être utilisé pour logger les paiements

- **invoice.payment_failed**: 
  - Alerte en cas d'échec de paiement
  - Peut mettre l'abonnement en `past_due`
  - Devrait déclencher une notification à l'utilisateur

### Structure des Webhooks

Chaque webhook contient:
- `id`: ID unique de l'événement (pour l'idempotence)
- `type`: Type d'événement (ex: `checkout.session.completed`)
- `data.object`: Objet Stripe concerné (session, subscription, invoice, etc.)
- `created`: Timestamp de création

### Idempotence

Stripe peut envoyer le même webhook plusieurs fois. Votre backend doit:
- Vérifier si l'événement a déjà été traité (via l'ID de l'événement)
- Ignorer les événements dupliqués
- Utiliser une table de log des événements traités si nécessaire

### Test des Webhooks en Local

Utilisez [Stripe CLI](https://stripe.com/docs/stripe-cli) pour forwarder les webhooks vers votre serveur local:

```bash
stripe listen --forward-to localhost:3000/webhooks/stripe
```

Cela vous donnera un `whsec_...` à utiliser comme `STRIPE_WEBHOOK_SECRET` en développement.

## 🔍 Statuts d'Abonnement

Les statuts Stripe sont mappés comme suit:

| Stripe Status | Statut Local | Description |
|--------------|--------------|-------------|
| `active` | `active` | Abonnement actif |
| `trialing` | `trialing` | Période d'essai |
| `past_due` | `past_due` | En retard de paiement |
| `canceled` | `canceled` | Annulé |
| `unpaid` | `canceled` | Non payé |
| `incomplete` | `trialing` | Incomplet |
| `incomplete_expired` | `canceled` | Expiré |

## 🔐 Sécurité

### Validation des Webhooks

Les webhooks doivent être validés via la signature Stripe pour éviter les requêtes malveillantes. Votre backend doit:

1. Récupérer le header `Stripe-Signature`
2. Construire le payload signé avec `STRIPE_WEBHOOK_SECRET`
3. Comparer avec la signature reçue
4. Rejeter les requêtes avec une signature invalide

### Rate Limiting

Les webhooks Stripe peuvent nécessiter une configuration spéciale de rate limiting car:
- Stripe peut envoyer plusieurs événements rapidement
- Les webhooks doivent être traités rapidement pour éviter les retards
- Considérez une file d'attente pour traiter les webhooks de manière asynchrone

### HTTPS Obligatoire

En production, les webhooks Stripe nécessitent HTTPS. Assurez-vous que votre application est accessible via HTTPS.

### Clés API

- **Secret Key**: Ne jamais exposer côté client, uniquement côté backend
- **Publishable Key**: Peut être utilisée côté frontend pour Stripe.js (si nécessaire)
- **Webhook Secret**: Uniquement côté backend pour valider les webhooks

## 🐛 Dépannage

### Webhook non reçu

1. Vérifiez que l'URL du webhook est correcte dans Stripe Dashboard
2. Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct
3. Vérifiez les logs de l'application pour les erreurs
4. Testez avec Stripe CLI en local
5. Vérifiez que votre serveur est accessible depuis Internet (pour la production)

### Subscription non créée après paiement

1. Vérifiez que le webhook `checkout.session.completed` est bien configuré
2. Vérifiez que les metadata (`companyId` ou `subscriptionId`) sont bien passées dans la session de checkout
3. Vérifiez les logs du webhook pour les erreurs
4. Vérifiez que l'utilisateur existe dans votre base de données

### Customer non trouvé

1. Vérifiez que l'email de l'utilisateur est bien défini
2. Vérifiez que la fonction `getOrCreateCustomer` s'exécute correctement
3. Vérifiez que le `stripe_customer_id` est bien sauvegardé lors de la création

### Erreurs de paiement

1. Vérifiez les logs Stripe Dashboard pour les détails
2. Vérifiez que les cartes de test fonctionnent (mode test)
3. Vérifiez que les montants sont corrects (en centimes pour Stripe)
4. Vérifiez que la devise est supportée par Stripe

### Redirection après paiement

1. Vérifiez que les URLs de succès/annulation sont correctement configurées
2. Vérifiez que les pages de succès/annulation existent dans votre application
3. Testez le flux complet de bout en bout

## 📚 Ressources

- [Documentation Stripe](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)

## 🔄 Intégration avec RTK Query (À Implémenter)

**État actuel:** Les endpoints Stripe sont disponibles côté backend, mais le frontend utilise encore l'endpoint `/subscriptions` directement.

**Pour intégrer Stripe dans le frontend:**

1. **Ajoutez les endpoints dans `services/facturlyApi.ts`:**
   - `createCheckoutSession`: Mutation pour créer une session de checkout (`POST /checkout/create`)
   - `createPortalSession`: Mutation pour créer une session du portail client (`POST /portal/create`)

2. **Modifiez les composants React:**
   - Remplacez l'appel direct à `createSubscription` par `createCheckoutSession` pour les plans payants
   - Redirigez l'utilisateur vers l'URL Stripe Checkout retournée
   - Pour le portail client, utilisez `createPortalSession` dans la page de gestion d'abonnement

3. **Créez les pages Next.js:**
   - La page de succès après paiement (`/billing/success`) - pour gérer le retour de Stripe
   - La page d'annulation (`/billing/cancel`) - pour gérer l'annulation côté Stripe
   - La gestion de l'abonnement (`/settings/billing`) - pour accéder au portail client

**Note:** Le plan gratuit peut continuer à utiliser `/subscriptions` directement, seuls les plans payants nécessitent Stripe Checkout.

## ⚠️ Notes Importantes

- Les montants dans Stripe sont toujours en **centimes** (ou plus petite unité de devise)
- Les webhooks peuvent arriver dans un ordre différent de celui attendu
- Toujours vérifier l'idempotence pour éviter les doublons
- Tester en mode test avant de passer en production
- Surveiller les logs Stripe Dashboard pour détecter les problèmes
- Les abonnements sont gérés côté backend, le frontend ne fait que déclencher les actions
