# Système d'envoi de factures par email

Ce document décrit le système d'envoi de factures par email avec page dédiée pour visualisation, acceptation, refus et paiement.

## Vue d'ensemble

Lorsqu'une facture est envoyée par email, le client reçoit un lien sécurisé qui le redirige vers une page frontend dédiée où il peut :
- ✅ Voir la facture complète
- ✅ Accepter et payer la facture
- ✅ Refuser ou demander une modification avec commentaire
- ✅ Télécharger la facture en PDF (à venir)

## Architecture

### 1. Envoi de facture

**Endpoint :** `POST /invoices/:id/send`

**Request Body (optionnel) :**
```json
{
  "sendEmail": true,
  "emailTo": "client@example.com"
}
```

**Comportement :**
- Génère un token unique (`paymentLinkToken`) valide 30 jours
- Met le statut de la facture à `sent`
- Enregistre `recipientEmail` et `sentAt`
- Si `sendEmail: true`, envoie un email au client avec le lien vers la page frontend
- Si le récepteur est un utilisateur du système, crée automatiquement une `ReceivedInvoice`

**Response (200 OK):**
```json
{
  "id": "uuid",
  "invoiceNumber": "FAC-001",
  "status": "sent",
  "sentAt": "2025-11-15T10:00:00Z",
  "recipientEmail": "client@example.com",
  "paymentLinkToken": "abc123...",
  "paymentLinkExpiresAt": "2025-12-15T10:00:00Z",
  "paymentLink": "http://localhost:3000/public/pay/abc123..."
}
```

### 2. Email envoyé au client

**Template :** Email HTML avec résumé de la facture

**Contenu :**
- Numéro de facture
- Montant total
- Date d'échéance (si définie)
- Bouton "Voir la facture" → lien vers `{FRONTEND_URL}/invoice/:token`
- Liste des actions possibles sur la page

**Lien :** `{FRONTEND_URL}/invoice/:token`

### 3. Visualisation de la facture (Frontend)

**Endpoint :** `GET /public/invoice/:token`

**Description :** Retourne toutes les données nécessaires pour afficher la facture complète

**Response (200 OK):**
```json
{
  "invoice": {
    "id": "uuid",
    "invoiceNumber": "FAC-001",
    "issueDate": "2025-11-11",
    "dueDate": "2025-12-11",
    "status": "sent",
    "currency": "EUR",
    "subtotalAmount": "2500.00",
    "taxAmount": "500.00",
    "totalAmount": "3000.00",
    "amountPaid": "0.00",
    "remainingAmount": "3000.00",
    "notes": "Payment terms: 30 days",
    "viewedAt": "2025-11-15T10:05:00Z",
    "rejectedAt": null,
    "rejectionComment": null,
    "rejectionReason": null,
    "items": [
      {
        "id": "uuid",
        "description": "Consulting Services",
        "quantity": "10",
        "unitPrice": "150.00",
        "totalAmount": "1500.00",
        "product": {
          "id": "uuid",
          "name": "Consulting Services"
        }
      }
    ],
    "issuer": {
      "id": "uuid",
      "name": "Acme Corp",
      "legalName": "Acme Corporation Ltd",
      "taxId": "123456789",
      "vatNumber": "FR12345678901",
      "addressLine1": "123 Business St",
      "addressLine2": "Suite 100",
      "postalCode": "75001",
      "city": "Paris",
      "country": "FR",
      "email": "contact@acme.com"
    },
    "recipient": {
      "id": "uuid",
      "name": "Client Corp",
      "email": "client@example.com",
      "addressLine1": "456 Client Ave",
      "city": "Lyon",
      "country": "FR"
    },
    "payments": []
  },
  "canAccept": true,
  "canPay": true,
  "isRejected": false,
  "isPaid": false
}
```

**Comportement :**
- Marque automatiquement la facture comme vue (`viewedAt`) lors de la première consultation
- Vérifie que le lien n'a pas expiré
- Retourne des flags pour guider l'interface utilisateur

**Errors:**
- `404 Not Found` - Token invalide ou facture introuvable
- `400 Bad Request` - Lien de paiement expiré

### 4. Accepter la facture

**Endpoint :** `POST /public/invoice/:token/accept`

**Description :** Accepte la facture et retourne le lien de paiement

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Invoice accepted",
  "paymentLink": "http://localhost:3000/public/pay/abc123...",
  "remainingAmount": "3000.00",
  "currency": "EUR"
}
```

**Comportement :**
- Vérifie que la facture peut être acceptée (statut `sent`, non payée, non refusée)
- Retourne le lien de paiement pour redirection
- Le frontend peut ensuite rediriger vers le paiement

**Errors:**
- `404 Not Found` - Token invalide
- `400 Bad Request` - Lien expiré, facture déjà payée, déjà refusée, ou statut invalide

### 5. Refuser la facture

**Endpoint :** `POST /public/invoice/:token/reject`

**Request Body:**
```json
{
  "comment": "Le montant ne correspond pas à notre accord. Nous avions convenu de 2500€.",
  "reason": "amount_discrepancy"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Invoice rejected",
  "rejectedAt": "2025-11-15T10:10:00Z"
}
```

**Comportement :**
- Commentaire obligatoire (validation)
- Enregistre `rejectedAt`, `rejectionComment`, `rejectionReason`
- Met le statut de la facture à `cancelled`
- L'émetteur peut ensuite modifier et renvoyer la facture

**Validation :**
- `comment` : Requis, non vide après trim

**Errors:**
- `400 Bad Request` - Commentaire manquant ou vide
- `404 Not Found` - Token invalide
- `400 Bad Request` - Lien expiré, facture déjà payée, ou déjà refusée

## Champs de la base de données

### Table `invoices`

Nouveaux champs ajoutés :
- `rejected_at` (TIMESTAMPTZ, nullable) - Date de refus
- `rejection_comment` (TEXT, nullable) - Commentaire de refus (obligatoire lors du refus)
- `rejection_reason` (VARCHAR, nullable) - Raison optionnelle du refus
- `viewed_at` (TIMESTAMPTZ, nullable) - Date de première consultation

## Flux utilisateur

### Scénario 1 : Client accepte et paie

1. Client reçoit l'email avec le lien
2. Client clique sur "Voir la facture" → Frontend : `GET /public/invoice/:token`
3. Client clique sur "Accepter" → Frontend : `POST /public/invoice/:token/accept`
4. Frontend redirige vers le lien de paiement retourné
5. Client paie → `POST /public/pay/:token`

### Scénario 2 : Client refuse

1. Client reçoit l'email avec le lien
2. Client clique sur "Voir la facture" → Frontend : `GET /public/invoice/:token`
3. Client clique sur "Refuser" et saisit un commentaire
4. Frontend : `POST /public/invoice/:token/reject` avec commentaire
5. Facture marquée comme refusée (`cancelled`)
6. Émetteur peut modifier et renvoyer la facture

## Variables d'environnement

```env
# URL du frontend (pour les liens dans les emails)
FRONTEND_URL=http://localhost:3001

# URL du backend (pour les liens de paiement)
APP_URL=http://localhost:3000
```

## Sécurité

- **Token unique** : Chaque facture a un token unique généré avec `crypto.randomBytes(32)`
- **Expiration** : Les liens expirent après 30 jours
- **Validation** : Tous les endpoints vérifient l'expiration et le statut
- **Pas d'authentification requise** : Les endpoints publics utilisent uniquement le token

## Statuts de facture

- `draft` - Brouillon
- `sent` - Envoyée (peut être acceptée/refusée)
- `paid` - Payée
- `overdue` - En retard
- `cancelled` - Annulée (refusée ou annulée manuellement)

## Notes importantes

1. **Refus définitif** : Une fois refusée, la facture est marquée comme `cancelled`. L'émetteur peut créer une nouvelle version ou modifier et renvoyer.

2. **Pas de notification email** : Actuellement, aucun email n'est envoyé à l'émetteur lors d'un refus. Cela peut être ajouté plus tard si nécessaire.

3. **PDF** : La génération et le téléchargement de PDF seront ajoutés ultérieurement.

4. **Commentaire séparé** : La possibilité de laisser un commentaire sans refuser sera ajoutée plus tard si nécessaire.

## Migration

Pour appliquer les nouveaux champs à la base de données :

```bash
pnpm migration:run
```

La migration `1731341000000-AddInvoiceRejectionFields.ts` ajoute les champs nécessaires.

