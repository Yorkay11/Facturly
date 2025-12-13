# Intégration Stripe - Guide Frontend

Ce guide explique comment intégrer les fonctionnalités Stripe côté frontend pour gérer les abonnements dans Facturly.

## 📋 Vue d'ensemble

L'architecture Stripe de Facturly fonctionne avec **deux flux distincts** :

1. **Création d'abonnement** : Utilisation de Stripe Checkout pour souscrire à un nouveau plan
2. **Changement de plan** : Utilisation directe de l'API Stripe (via notre backend) pour modifier un plan existant avec prorata automatique

⚠️ **Important** : Ne jamais utiliser Checkout pour changer un plan existant. Cela créerait une nouvelle subscription au lieu de mettre à jour l'existante.

---

## 🆕 Créer un nouvel abonnement

### Quand utiliser

- Un utilisateur a le plan gratuit et souhaite souscrire à un plan payant
- Un utilisateur n'a pas encore d'abonnement Stripe actif
- Première souscription après inscription

### Endpoint

**POST** `/checkout/create`

**Body** :
```json
{
  "planId": "uuid-du-plan"
}
```

**Response** (200 OK) :
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

### Comportement

1. Le backend vérifie que l'utilisateur n'a pas déjà une subscription Stripe active
2. Si une subscription active existe, une erreur `400 Bad Request` est retournée
3. Sinon, une session Stripe Checkout est créée
4. L'utilisateur doit être **redirigé vers `url`** pour finaliser le paiement

### Gestion des erreurs

- **400 Bad Request** : 
  - "Vous avez déjà un abonnement actif. Utilisez 'Changer de plan' pour modifier votre abonnement."
  - "Ce plan n'est pas configuré pour le paiement en ligne"
  - "Plan non trouvé"

### Flux utilisateur recommandé

1. L'utilisateur clique sur "S'abonner" à un plan
2. Appel API vers `/checkout/create`
3. Si succès : `window.location.href = response.url`
4. L'utilisateur paie sur Stripe Checkout
5. Stripe redirige vers votre `success_url` (configurée dans l'environnement `APP_URL`)
6. Sur la page de succès, vérifier le statut de l'abonnement

### Page de succès

Sur votre route de succès (ex: `/billing/success`), vous pouvez :

1. Récupérer le `session_id` depuis l'URL (si fourni dans les query params)
2. Poller l'endpoint `GET /subscriptions/me` pour vérifier que le plan a été mis à jour
3. Afficher un message de confirmation

⚠️ **Note** : Les webhooks Stripe peuvent prendre quelques secondes pour mettre à jour l'abonnement. Un délai de quelques secondes peut être nécessaire avant de vérifier le statut.

---

## 🔄 Changer de plan (avec prorata)

### Quand utiliser

- Un utilisateur a déjà un abonnement actif (plan payant)
- Il souhaite passer d'un plan à un autre (upgrade ou downgrade)
- Le prorata doit être appliqué automatiquement

### Endpoint

**POST** `/subscriptions/change-plan`

**Body** :
```json
{
  "planId": "uuid-du-nouveau-plan"
}
```

**Response** (200 OK) :
```json
{
  "success": true,
  "message": "Changement de plan en cours. Stripe va créer une facture avec le prorata.",
  "subscriptionId": "sub_...",
  "newPlanId": "uuid-du-nouveau-plan",
  "newPlanName": "Pro"
}
```

### Comportement

1. Le backend vérifie que l'utilisateur a une subscription Stripe active
2. Vérifie que le nouveau plan est différent de l'actuel
3. Appelle directement `stripe.subscriptions.update()` avec le nouveau `priceId`
4. Stripe calcule **automatiquement** le prorata
5. Stripe crée une **facture immédiate** avec :
   - Crédit pour le temps non utilisé de l'ancien plan
   - Débit pour le nouveau plan
   - Montant final à payer
6. Les webhooks mettent à jour le plan local automatiquement

### Prorata

Le prorata est **entièrement géré par Stripe**. Vous n'avez rien à calculer côté frontend.

- **Upgrade** : L'utilisateur paie la différence proratée immédiatement
- **Downgrade** : Le crédit est appliqué sur la prochaine facture

### Gestion des erreurs

- **400 Bad Request** :
  - "Aucun abonnement actif trouvé. Utilisez 'S'abonner' pour créer un nouvel abonnement."
  - "Vous êtes déjà abonné à ce plan"
  - "Votre abonnement n'est pas actif. Veuillez d'abord activer un abonnement."
  - "Plan non trouvé"

### Flux utilisateur recommandé

1. L'utilisateur sélectionne un nouveau plan
2. Afficher un message de confirmation avec mention du prorata :
   - "Vous allez être crédité pour le temps restant de votre plan actuel"
   - "Le changement prendra effet immédiatement"
3. Appel API vers `/subscriptions/change-plan`
4. Afficher un message de succès : "Changement de plan en cours..."
5. Poller `GET /subscriptions/me` pour vérifier que le plan a été mis à jour
6. Afficher le nouveau plan actif

⚠️ **Note** : Le prorata est visible dans la facture Stripe créée. L'utilisateur peut consulter les détails dans le portail client Stripe.

---

## 📊 Vérifier le statut de l'abonnement

### Endpoint

**GET** `/subscriptions/me`

**Response** (200 OK) :
```json
{
  "id": "uuid",
  "status": "active",
  "plan": {
    "id": "uuid",
    "name": "Pro",
    "code": "pro",
    "price": "29.00",
    "billingInterval": "monthly"
  },
  "currentPeriodStart": "2025-01-01T00:00:00.000Z",
  "currentPeriodEnd": "2025-02-01T00:00:00.000Z",
  "nextBillingAt": "2025-02-01T00:00:00.000Z",
  "invoiceLimit": {
    "effective": null,
    "used": 5,
    "remaining": null,
    "unlimited": true
  }
}
```

### Quand l'utiliser

- Après un paiement réussi (Checkout)
- Après un changement de plan
- Pour afficher les informations de l'abonnement actuel
- Pour vérifier si un utilisateur peut créer des factures (limite)

---

## 🔐 Portail client Stripe

### Quand utiliser

- Permettre à l'utilisateur de gérer ses méthodes de paiement
- Consulter l'historique des factures
- Télécharger des factures
- Gérer l'abonnement directement dans Stripe

### Endpoint

**POST** `/portal/create`

**Response** (200 OK) :
```json
{
  "url": "https://billing.stripe.com/p/session/..."
}
```

### Comportement

1. Le backend crée une session du portail client Stripe
2. L'utilisateur doit être **redirigé vers `url`**
3. Il peut gérer son abonnement, ses paiements, etc.
4. Après fermeture, il est redirigé vers `APP_URL/billing`

### Flux utilisateur recommandé

1. Bouton "Gérer mon abonnement" ou "Méthodes de paiement"
2. Appel API vers `/portal/create`
3. Redirection vers `response.url`
4. L'utilisateur gère son abonnement dans Stripe
5. Retour automatique vers votre application

---

## 🎯 Décision : Checkout vs Change Plan

### Utiliser **Checkout** (`/checkout/create`) si :

✅ L'utilisateur a le plan gratuit  
✅ L'utilisateur n'a pas d'abonnement Stripe actif  
✅ C'est la première souscription  
✅ L'utilisateur vient de s'inscrire

### Utiliser **Change Plan** (`/subscriptions/change-plan`) si :

✅ L'utilisateur a déjà un plan payant actif  
✅ Il veut changer de plan (upgrade/downgrade)  
✅ Le prorata doit être appliqué automatiquement  
✅ L'abonnement Stripe existe déjà

### Vérification avant action

Avant de proposer l'une ou l'autre option, vérifiez :

1. **GET** `/subscriptions/me`
2. Si `status === "active"` ET `plan.code !== "free"` :
   - Afficher "Changer de plan"
   - Utiliser `/subscriptions/change-plan`
3. Sinon :
   - Afficher "S'abonner"
   - Utiliser `/checkout/create`

---

## ⏱️ Synchronisation des données

### Délai de mise à jour

Après une action (paiement, changement de plan), les webhooks Stripe mettent à jour la base de données locale. Ce processus peut prendre :

- **Minimum** : 1-2 secondes
- **Maximum** : 10-15 secondes (rare)

### Stratégie de polling recommandée

1. Après une action (Checkout ou Change Plan) :
   - Attendre 2 secondes
   - Poller `GET /subscriptions/me` toutes les 2 secondes
   - Maximum 5 tentatives (10 secondes total)
   - Si le plan n'est pas mis à jour après 10 secondes, afficher un message :
     - "Mise à jour en cours. Le changement peut prendre quelques instants."
     - Permettre à l'utilisateur de rafraîchir manuellement

2. Afficher un indicateur de chargement pendant le polling

3. Si le plan est mis à jour : arrêter le polling et afficher le succès

### Vérification manuelle

Toujours permettre à l'utilisateur de :
- Rafraîchir la page
- Cliquer sur "Actualiser" pour vérifier le statut
- Consulter le portail Stripe pour voir les détails

---

## 💰 Affichage du prorata

### Ce que Stripe calcule automatiquement

Lors d'un changement de plan, Stripe crée une facture avec :

- **Ligne crédit** : Temps non utilisé de l'ancien plan (montant négatif)
- **Ligne débit** : Nouveau plan proraté (montant positif)
- **Total** : Montant à payer (peut être négatif = crédit)

### Affichage recommandé

Avant un changement de plan, vous pouvez afficher :

> "Changement de plan avec prorata automatique"
> 
> - Votre crédit pour le temps restant sera calculé automatiquement
> - Vous ne paierez que la différence
> - Le changement prendra effet immédiatement

⚠️ **Note** : Le montant exact du prorata n'est pas disponible avant la création de la facture Stripe. Si vous souhaitez l'afficher à l'avance, vous devrez implémenter un calcul côté backend (voir endpoint `/subscriptions/preview` si disponible).

### Facture détaillée

L'utilisateur peut consulter les détails du prorata dans :
- Le portail client Stripe (`/portal/create`)
- Les emails de facture Stripe
- Son tableau de bord Stripe (s'il s'y connecte)

---

## 🚨 Gestion des erreurs courantes

### Erreur : "Vous avez déjà un abonnement actif"

**Cause** : L'utilisateur essaie d'utiliser Checkout alors qu'il a déjà un plan payant actif.

**Solution** : Utiliser `/subscriptions/change-plan` à la place.

### Erreur : "Aucun abonnement actif trouvé"

**Cause** : L'utilisateur essaie de changer de plan alors qu'il n'a pas d'abonnement Stripe actif.

**Solution** : Utiliser `/checkout/create` pour créer un nouvel abonnement.

### Erreur : "Vous êtes déjà abonné à ce plan"

**Cause** : L'utilisateur essaie de passer au même plan.

**Solution** : Masquer ce plan dans l'interface ou désactiver le bouton.

### Paiement échoué

**Cause** : La carte de crédit a été refusée ou a expiré.

**Solution** :
- Rediriger vers le portail client Stripe pour mettre à jour la méthode de paiement
- Afficher un message d'erreur clair
- Proposer de réessayer

---

## 📝 Checklist d'intégration

- [ ] Endpoint `/checkout/create` implémenté pour les nouveaux abonnements
- [ ] Endpoint `/subscriptions/change-plan` implémenté pour les changements de plan
- [ ] Endpoint `/subscriptions/me` utilisé pour vérifier le statut
- [ ] Endpoint `/portal/create` implémenté pour la gestion du compte
- [ ] Détection automatique : Checkout vs Change Plan selon le statut actuel
- [ ] Redirection vers Stripe Checkout après création de session
- [ ] Page de succès avec polling pour vérifier la mise à jour
- [ ] Gestion des erreurs avec messages utilisateur clairs
- [ ] Indicateurs de chargement pendant les opérations
- [ ] Message de confirmation après changement de plan
- [ ] Possibilité de rafraîchir manuellement le statut

---

## 🔗 Variables d'environnement nécessaires

Le frontend n'a pas besoin de variables d'environnement Stripe spécifiques. Toutes les interactions passent par le backend.

Assurez-vous que le backend a accès à :
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `APP_URL` (pour les redirections Stripe)

---

## 📚 Ressources supplémentaires

- [Documentation Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Documentation Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)
- [Documentation Stripe Prorations](https://stripe.com/docs/billing/subscriptions/prorations)
- [Documentation du backend Stripe](/docs/stripe-integration.md)

---

## ❓ FAQ

### Puis-je afficher le montant exact du prorata avant le changement ?

Non, directement. Le prorata est calculé par Stripe au moment du changement. Si vous avez besoin d'un aperçu, utilisez l'endpoint `/subscriptions/preview` (si implémenté).

### Que se passe-t-il si l'utilisateur ferme la page Stripe Checkout ?

L'utilisateur peut revenir plus tard. La session Checkout reste valide pendant un certain temps. Il peut aussi cliquer à nouveau sur "S'abonner" pour créer une nouvelle session.

### Comment savoir si le changement de plan a réussi ?

Polllez `GET /subscriptions/me` après le changement. Vérifiez que `plan.id` correspond au nouveau plan et que `status === "active"`.

### L'utilisateur peut-il annuler son abonnement via le frontend ?

Oui, via le portail client Stripe (`/portal/create`). Le backend peut aussi implémenter une route `/subscriptions/cancel` si vous préférez une annulation directe.

### Que se passe-t-il en cas de downgrade ?

Stripe crédite automatiquement le temps non utilisé sur la prochaine facture. L'utilisateur ne paiera pas immédiatement, mais le crédit sera appliqué au prochain cycle.

