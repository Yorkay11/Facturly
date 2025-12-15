# Intégration Stripe - Guide Frontend (v2 — catalogue sans table plans)

Ce guide décrit l’intégration frontend **avec le nouveau modèle** :
- pas de table `plans` en base
- le frontend envoie `{ plan, interval }`
- Stripe est la source de vérité

---

## Vue d’ensemble

Le frontend ne “met pas à jour” l’abonnement directement. Il déclenche une action côté backend, puis **attend que les webhooks Stripe** mettent à jour la DB Facturly.

Deux flux :
- **Souscrire (nouvel abonnement)** → `POST /checkout/create`
- **Changer de plan** → `POST /subscriptions/change-plan`

---

## Catalogue de plans (pour afficher le pricing)

### `GET /plans`
Appelle `GET /plans` pour obtenir les combinaisons disponibles :
- `plan`: `free | pro | enterprise`
- `interval`: `month | year`
- `stripePriceId`: `string | null`

But :
- afficher les cartes pricing
- désactiver les options dont `stripePriceId` est `null`

> Le mapping priceId Stripe est côté backend via variables d’env :
> `STRIPE_PRICE_PRO_MONTH`, `STRIPE_PRICE_PRO_YEAR`, `STRIPE_PRICE_ENTERPRISE_MONTH`, `STRIPE_PRICE_ENTERPRISE_YEAR`.

---

## Lire l’abonnement courant (pour l’UI)

### `GET /subscriptions/me`
Le frontend utilise cet endpoint pour afficher l’état :
- `plan`: `free | pro | enterprise`
- `interval`: `month | year`
- `status`: `active | past_due | canceled`

Notes :
- si l’entreprise n’a pas encore d’enregistrement subscription, le backend crée un abonnement `free` automatiquement.

---

## Souscrire (Stripe Checkout)

### Quand l’utiliser
- l’utilisateur est en `free`
- ou n’a pas de `stripeSubscriptionId` actif

### `POST /checkout/create`
Body :
```json
{ "plan": "pro", "interval": "month" }
```

Réponse :
- `url` (Stripe Checkout URL)

Frontend :
- rediriger l’utilisateur vers `url`
- sur la page success, **poller** `GET /subscriptions/me` jusqu’à refléter le bon `plan/interval/status`

---

## Changer de plan (prorata géré par Stripe)

### Quand l’utiliser
- l’utilisateur a déjà un abonnement Stripe actif

### `POST /subscriptions/change-plan`
Body :
```json
{ "plan": "enterprise", "interval": "year" }
```

Réponse :
- `success: true`
- `subscriptionId` (Stripe sub id)
- `plan`, `interval` (ce qui a été demandé)

Frontend :
- afficher “changement en cours…”
- **poller** `GET /subscriptions/me` (1–2s) pendant ~15s
- arrêter dès que la DB reflète la nouvelle valeur

---

## Portail client (Stripe Customer Portal)

### `POST /portal/create`
Réponse :
- `url` (à ouvrir)

---

## Stratégie de polling recommandée (sans code)

Après checkout success ou change-plan :
- poll `GET /subscriptions/me` toutes les 1–2 secondes
- timeout ~15 secondes
- si pas à jour : “Traitement en cours, réessayez” + bouton refresh

---

## Erreurs fréquentes

- **400 “déjà un abonnement actif”** : tu as appelé checkout au lieu de change-plan
- **plan/interval non configurés** : le backend n’a pas les variables `STRIPE_PRICE_*`
- **retour Stripe OK mais DB pas à jour** : webhooks non reçus (URL/secret/events)


