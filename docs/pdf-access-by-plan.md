# Accès PDF selon le plan (Free / Pro / Enterprise)

Cette documentation décrit les règles d’accès à la génération et au téléchargement des **PDF de factures** selon le plan d’abonnement.

---

## Règle métier

- **Free** : génération PDF **interdite**
- **Pro** : génération PDF **autorisée**
- **Enterprise** : génération PDF **autorisée**

Le plan courant de l’entreprise connectée est exposé via :
- `GET /subscriptions/me` → champ `plan` (`free | pro | enterprise`)

---

## Endpoints PDF

### 1) PDF authentifié (backoffice)

- **GET** `/invoices/:id/pdf`
- Auth requis (JWT)

Comportement :
- si `subscription.plan === 'free'` → **403 Forbidden**
- sinon → renvoie le PDF (`Content-Type: application/pdf`)

Paramètre optionnel :
- `?template=<nom>` (sinon le template de la facture est utilisé)

---

### 2) PDF public (lien partagé)

- **GET** `/public/invoice/:token/pdf`
- Public (pas d’auth), token requis

Comportement :
- si token invalide/expiré → **404/400**
- si `subscription.plan === 'free'` (entreprise émettrice) → **403 Forbidden**
- sinon → renvoie le PDF

Paramètre optionnel :
- `?template=<nom>`

---

## PDF en pièce jointe des emails

Lors de l’envoi d’une facture par email (création avec `sendEmail` ou endpoint `sendInvoice`) :

- si `subscription.plan === 'free'`  
  - **aucun PDF n’est généré**
  - l’email est envoyé **sans pièce jointe**
- si `subscription.plan !== 'free'`  
  - le PDF est généré
  - l’email est envoyé **avec** la pièce jointe PDF

> Objectif : éviter de contourner la règle “PDF réservé aux plans Pro/Enterprise” via l’envoi email.

---

## Codes d’erreur attendus

- **403 Forbidden** : “La génération de PDF est réservée aux plans Pro ou Entreprise.”
- **400 Bad Request** : lien public expiré, etc.
- **404 Not Found** : facture/token introuvable


