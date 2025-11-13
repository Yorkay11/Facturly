# Facturly API Endpoints (MVP)

Ce document décrit les endpoints prévus pour le MVP du backend NestJS. Les routes suivent une convention REST, utilisent des ressources typées et sont regroupées par module fonctionnel.

## Authentification & Utilisateur

| Méthode | Endpoint             | Description                                              |
| ------- | -------------------- | -------------------------------------------------------- |
| POST    | `/auth/register`     | Inscription, création d’un utilisateur et de sa company |
| POST    | `/auth/login`        | Connexion par email + mot de passe                      |
| POST    | `/auth/logout`       | Invalidation de la session courante                     |
| GET     | `/auth/me`           | Récupération du profil utilisateur courant              |
| PATCH   | `/users/me`          | Mise à jour du profil (nom, prénom, mot de passe, etc.) |

### POST `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "companyName": "My Company Ltd"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "company": {
    "id": "uuid",
    "name": "My Company Ltd",
    "defaultCurrency": "EUR"
  },
  "accessToken": "jwt-token-here"
}
```

### POST `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "company": {
    "id": "uuid",
    "name": "My Company Ltd"
  },
  "accessToken": "jwt-token-here"
}
```

### GET `/auth/me`

**Response (200 OK):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "lastLoginAt": "2025-11-11T17:00:00Z",
  "company": {
    "id": "uuid",
    "name": "My Company Ltd",
    "legalName": "My Company Ltd",
    "taxId": "123456789",
    "vatNumber": "FR12345678901",
    "addressLine1": "123 Main St",
    "city": "Paris",
    "country": "FR",
    "defaultCurrency": "EUR"
  }
}
```

### PATCH `/users/me`

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "password": "NewSecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "updatedAt": "2025-11-11T17:00:00Z"
}
```

## Entreprises

| Méthode | Endpoint          | Description                                   |
| ------- | ----------------- | --------------------------------------------- |
| GET     | `/companies/me`   | Récupération des infos de la company liée     |
| PATCH   | `/companies/me`   | Mise à jour (raison sociale, adresse, etc.)   |

### GET `/companies/me`

**Response (200 OK):**
```json
{
  "id": "uuid",
  "name": "My Company Ltd",
  "legalName": "My Company Ltd",
  "taxId": "123456789",
  "vatNumber": "FR12345678901",
  "addressLine1": "123 Main St",
  "addressLine2": "Suite 100",
  "postalCode": "75001",
  "city": "Paris",
  "country": "FR",
  "defaultCurrency": "EUR",
  "logoUrl": null,
  "createdAt": "2025-11-11T10:00:00Z",
  "updatedAt": "2025-11-11T10:00:00Z"
}
```

### PATCH `/companies/me`

**Request Body:**
```json
{
  "name": "Updated Company Name",
  "legalName": "Updated Legal Name",
  "taxId": "987654321",
  "vatNumber": "FR98765432109",
  "addressLine1": "456 New St",
  "city": "Lyon",
  "postalCode": "69001",
  "country": "FR",
  "defaultCurrency": "USD"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "name": "Updated Company Name",
  "legalName": "Updated Legal Name",
  "taxId": "987654321",
  "vatNumber": "FR98765432109",
  "addressLine1": "456 New St",
  "city": "Lyon",
  "postalCode": "69001",
  "country": "FR",
  "defaultCurrency": "USD",
  "updatedAt": "2025-11-11T17:00:00Z"
}
```

## Clients

| Méthode | Endpoint           | Description                                         |
| ------- | ------------------ | --------------------------------------------------- |
| GET     | `/clients`         | Liste paginée des clients de la company             |
| POST    | `/clients`         | Création d’un client                                |
| GET     | `/clients/:id`     | Récupération d’un client                            |
| PATCH   | `/clients/:id`     | Mise à jour d’un client                             |
| DELETE  | `/clients/:id`     | Suppression logique ou hard (selon implémentation)  |

### GET `/clients?page=1&limit=10&search=acme`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10, max: 100)
- `search` (string, optional) - Recherche dans nom, email

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Acme Corp",
      "email": "contact@acme.com",
      "phone": "+33123456789",
      "addressLine1": "789 Client St",
      "city": "Paris",
      "country": "FR",
      "taxId": "CLIENT123",
      "createdAt": "2025-11-11T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### POST `/clients`

**Request Body:**
```json
{
  "name": "Acme Corp",
  "email": "contact@acme.com",
  "phone": "+33123456789",
  "addressLine1": "789 Client St",
  "addressLine2": "Floor 5",
  "postalCode": "75008",
  "city": "Paris",
  "country": "FR",
  "taxId": "CLIENT123",
  "notes": "Important client"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "name": "Acme Corp",
  "email": "contact@acme.com",
  "phone": "+33123456789",
  "addressLine1": "789 Client St",
  "addressLine2": "Floor 5",
  "postalCode": "75008",
  "city": "Paris",
  "country": "FR",
  "taxId": "CLIENT123",
  "notes": "Important client",
  "createdAt": "2025-11-11T17:00:00Z",
  "updatedAt": "2025-11-11T17:00:00Z"
}
```

### GET `/clients/:id`

**Response (200 OK):**
```json
{
  "id": "uuid",
  "name": "Acme Corp",
  "email": "contact@acme.com",
  "phone": "+33123456789",
  "addressLine1": "789 Client St",
  "addressLine2": "Floor 5",
  "postalCode": "75008",
  "city": "Paris",
  "country": "FR",
  "taxId": "CLIENT123",
  "notes": "Important client",
  "createdAt": "2025-11-11T10:00:00Z",
  "updatedAt": "2025-11-11T10:00:00Z"
}
```

### PATCH `/clients/:id`

**Request Body:**
```json
{
  "name": "Acme Corporation Updated",
  "email": "newemail@acme.com",
  "phone": "+33987654321"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "name": "Acme Corporation Updated",
  "email": "newemail@acme.com",
  "phone": "+33987654321",
  "updatedAt": "2025-11-11T17:00:00Z"
}
```

### GET `/clients/:id/revenue?months=6`

**Query Parameters:**
- `months` (number, default: 6) - Nombre de mois à retourner

**Response (200 OK):**
```json
{
  "clientId": "uuid",
  "clientName": "Acme Corp",
  "monthlyRevenues": [
    {
      "month": 6,
      "year": 2025,
      "revenue": [
        {
          "currency": "EUR",
          "amount": "5000.00"
        }
      ],
      "invoicesSent": 5,
      "invoicesPaid": 4
    },
    {
      "month": 7,
      "year": 2025,
      "revenue": [
        {
          "currency": "EUR",
          "amount": "7500.00"
        }
      ],
      "invoicesSent": 8,
      "invoicesPaid": 7
    }
  ]
}
```

## Produits & Services

| Méthode | Endpoint            | Description                                         |
| ------- | ------------------- | --------------------------------------------------- |
| GET     | `/products`         | Liste paginée des produits/services                 |
| POST    | `/products`         | Création d’un produit/service                       |
| GET     | `/products/:id`     | Détails d’un produit/service                        |
| PATCH   | `/products/:id`     | Mise à jour                                         |
| DELETE  | `/products/:id`     | Suppression (désactivation)                         |

### GET `/products?page=1&limit=10&search=consulting`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10, max: 100)
- `search` (string, optional) - Recherche dans nom, description

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Consulting Services",
      "description": "Hourly consulting",
      "type": "service",
      "price": "150.00",
      "currency": "EUR",
      "taxRate": "20.00",
      "unit": "hour",
      "createdAt": "2025-11-11T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

### POST `/products`

**Request Body:**
```json
{
  "name": "Consulting Services",
  "description": "Professional consulting services",
  "type": "service",
  "price": "150.00",
  "currency": "EUR",
  "taxRate": "20.00",
  "unit": "hour",
  "sku": "CONS-001"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "name": "Consulting Services",
  "description": "Professional consulting services",
  "type": "service",
  "price": "150.00",
  "currency": "EUR",
  "taxRate": "20.00",
  "unit": "hour",
  "sku": "CONS-001",
  "createdAt": "2025-11-11T17:00:00Z",
  "updatedAt": "2025-11-11T17:00:00Z"
}
```

### GET `/products/:id`

**Response (200 OK):**
```json
{
  "id": "uuid",
  "name": "Consulting Services",
  "description": "Professional consulting services",
  "type": "service",
  "price": "150.00",
  "currency": "EUR",
  "taxRate": "20.00",
  "unit": "hour",
  "sku": "CONS-001",
  "createdAt": "2025-11-11T10:00:00Z",
  "updatedAt": "2025-11-11T10:00:00Z"
}
```

### PATCH `/products/:id`

**Request Body:**
```json
{
  "price": "175.00",
  "description": "Updated description"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "name": "Consulting Services",
  "description": "Updated description",
  "price": "175.00",
  "updatedAt": "2025-11-11T17:00:00Z"
}
```

## Factures

| Méthode | Endpoint                         | Description                                                           |
| ------- | -------------------------------- | --------------------------------------------------------------------- |
| GET     | `/invoices`                      | Liste paginée des factures                                            |
| POST    | `/invoices`                      | Création d’une facture (etat `draft`)                                 |
| GET     | `/invoices/:id`                  | Détails d’une facture (items, paiements, totaux)                      |
| PATCH   | `/invoices/:id`                  | Mise à jour (dates, client, notes, statut)                            |
| POST    | `/invoices/:id/send`             | Marque comme envoyée (envoi email optionnel)                          |
| POST    | `/invoices/:id/mark-paid`        | Marque comme payée (si paiement reçu manuellement)                    |
| POST    | `/invoices/:id/cancel`           | Annule la facture                                                     |

### GET `/invoices?page=1&limit=10&status=sent`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10, max: 100)
- `status` (string, optional) - `draft`, `sent`, `paid`, `cancelled`
- `clientId` (string, optional) - Filtrer par client
- `search` (string, optional) - Recherche dans numéro de facture

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "invoiceNumber": "FAC-001",
      "status": "sent",
      "issueDate": "2025-11-01",
      "dueDate": "2025-11-30",
      "currency": "EUR",
      "subtotalAmount": "1000.00",
      "taxAmount": "200.00",
      "totalAmount": "1200.00",
      "amountPaid": "0.00",
      "client": {
        "id": "uuid",
        "name": "Acme Corp"
      },
      "createdAt": "2025-11-11T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

### POST `/invoices`

**Request Body:**
```json
{
  "clientId": "uuid",
  "issueDate": "2025-11-11",
  "dueDate": "2025-12-11",
  "currency": "EUR",
  "items": [
    {
      "productId": "uuid",
      "description": "Consulting Services",
      "quantity": "10",
      "unitPrice": "150.00"
    },
    {
      "description": "Custom Service",
      "quantity": "5",
      "unitPrice": "200.00"
    }
  ],
  "notes": "Payment terms: 30 days",
  "recipientEmail": "client@example.com"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "invoiceNumber": "FAC-001",
  "status": "draft",
  "issueDate": "2025-11-11",
  "dueDate": "2025-12-11",
  "currency": "EUR",
  "subtotalAmount": "2500.00",
  "taxAmount": "500.00",
  "totalAmount": "3000.00",
  "amountPaid": "0.00",
  "notes": "Payment terms: 30 days",
  "client": {
    "id": "uuid",
    "name": "Acme Corp"
  },
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
    },
    {
      "id": "uuid",
      "description": "Custom Service",
      "quantity": "5",
      "unitPrice": "200.00",
      "totalAmount": "1000.00"
    }
  ],
  "createdAt": "2025-11-11T17:00:00Z",
  "updatedAt": "2025-11-11T17:00:00Z"
}
```

### GET `/invoices/:id`

**Response (200 OK):**
```json
{
  "id": "uuid",
  "invoiceNumber": "FAC-001",
  "status": "sent",
  "issueDate": "2025-11-11",
  "dueDate": "2025-12-11",
  "sentAt": "2025-11-11T12:00:00Z",
  "currency": "EUR",
  "subtotalAmount": "2500.00",
  "taxAmount": "500.00",
  "totalAmount": "3000.00",
  "amountPaid": "1500.00",
  "notes": "Payment terms: 30 days",
  "client": {
    "id": "uuid",
    "name": "Acme Corp",
    "email": "contact@acme.com",
    "addressLine1": "789 Client St",
    "city": "Paris",
    "country": "FR"
  },
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
  "payments": [
    {
      "id": "uuid",
      "amount": "1500.00",
      "paymentDate": "2025-11-15",
      "method": "bank_transfer",
      "status": "completed",
      "notes": "Partial payment"
    }
  ],
  "createdAt": "2025-11-11T10:00:00Z",
  "updatedAt": "2025-11-15T14:00:00Z"
}
```

### PATCH `/invoices/:id`

**Request Body:**
```json
{
  "dueDate": "2025-12-31",
  "notes": "Updated payment terms",
  "status": "sent"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "invoiceNumber": "FAC-001",
  "status": "sent",
  "dueDate": "2025-12-31",
  "notes": "Updated payment terms",
  "updatedAt": "2025-11-11T17:00:00Z"
}
```

### POST `/invoices/:id/send`

**Request Body (optional):**
```json
{
  "sendEmail": true,
  "emailTo": "client@example.com"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "invoiceNumber": "FAC-001",
  "status": "sent",
  "sentAt": "2025-11-11T17:00:00Z",
  "recipientEmail": "client@example.com",
  "paymentLinkToken": "abc123...",
  "paymentLinkExpiresAt": "2025-12-11T17:00:00Z",
  "paymentLink": "http://localhost:3000/pay/abc123...",
  "updatedAt": "2025-11-11T17:00:00Z"
}
```

**Notes:**
- Génère automatiquement un token de paiement unique et un lien de paiement valide 30 jours
- Si le `recipientEmail` (ou `emailTo`) correspond à un utilisateur du système, une `ReceivedInvoice` est créée automatiquement
- Le lien de paiement peut être utilisé par n'importe qui (public) pour payer la facture

### POST `/invoices/:id/mark-paid`

**Request Body:**
```json
{
  "amount": "3000.00",
  "paymentDate": "2025-11-20",
  "method": "bank_transfer",
  "notes": "Full payment received"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "status": "paid",
  "amountPaid": "3000.00",
  "payments": [
    {
      "id": "uuid",
      "amount": "3000.00",
      "paymentDate": "2025-11-20",
      "method": "bank_transfer",
      "status": "completed",
      "notes": "Full payment received"
    }
  ],
  "updatedAt": "2025-11-20T10:00:00Z"
}
```

### Lignes de factures

| Méthode | Endpoint                                | Description                                                  |
| ------- | --------------------------------------- | ------------------------------------------------------------ |
| POST    | `/invoices/:invoiceId/items`            | Ajout d’une ligne                                            |
| PATCH   | `/invoices/:invoiceId/items/:itemId`    | Mise à jour d’une ligne (description, quantité, prix)        |
| DELETE  | `/invoices/:invoiceId/items/:itemId`    | Suppression d’une ligne                                      |

### POST `/invoices/:invoiceId/items`

**Request Body:**
```json
{
  "productId": "uuid",
  "description": "Additional Service",
  "quantity": "3",
  "unitPrice": "100.00"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "description": "Additional Service",
  "quantity": "3",
  "unitPrice": "100.00",
  "totalAmount": "300.00",
  "product": {
    "id": "uuid",
    "name": "Additional Service"
  },
  "createdAt": "2025-11-11T17:00:00Z"
}
```

### PATCH `/invoices/:invoiceId/items/:itemId`

**Request Body:**
```json
{
  "quantity": "5",
  "unitPrice": "120.00"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "description": "Additional Service",
  "quantity": "5",
  "unitPrice": "120.00",
  "totalAmount": "600.00",
  "updatedAt": "2025-11-11T17:00:00Z"
}
```

### Paiements

| Méthode | Endpoint                              | Description                                         |
| ------- | ------------------------------------- | --------------------------------------------------- |
| GET     | `/invoices/:invoiceId/payments`       | Liste des paiements associés                        |
| POST    | `/invoices/:invoiceId/payments`       | Enregistrement d’un paiement manuel                 |
| GET     | `/payments/:id`                       | Détails d’un paiement                               |
| PATCH   | `/payments/:id`                       | Mise à jour du statut ou des métadonnées            |

### GET `/invoices/:invoiceId/payments`

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "amount": "1500.00",
      "paymentDate": "2025-11-15",
      "method": "bank_transfer",
      "status": "completed",
      "notes": "Partial payment",
      "createdAt": "2025-11-15T10:00:00Z"
    }
  ]
}
```

### POST `/invoices/:invoiceId/payments`

**Request Body:**
```json
{
  "amount": "1500.00",
  "paymentDate": "2025-11-15",
  "method": "bank_transfer",
  "notes": "Partial payment received"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "amount": "1500.00",
  "paymentDate": "2025-11-15",
  "method": "bank_transfer",
  "status": "completed",
  "notes": "Partial payment received",
  "invoice": {
    "id": "uuid",
    "invoiceNumber": "FAC-001",
    "totalAmount": "3000.00",
    "amountPaid": "1500.00"
  },
  "createdAt": "2025-11-15T10:00:00Z",
  "updatedAt": "2025-11-15T10:00:00Z"
}
```

### GET `/payments/:id`

**Response (200 OK):**
```json
{
  "id": "uuid",
  "amount": "1500.00",
  "paymentDate": "2025-11-15",
  "method": "bank_transfer",
  "status": "completed",
  "notes": "Partial payment received",
  "invoice": {
    "id": "uuid",
    "invoiceNumber": "FAC-001",
    "client": {
      "id": "uuid",
      "name": "Acme Corp"
    }
  },
  "createdAt": "2025-11-15T10:00:00Z",
  "updatedAt": "2025-11-15T10:00:00Z"
}
```

### PATCH `/payments/:id`

**Request Body:**
```json
{
  "status": "cancelled",
  "notes": "Payment cancelled"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "status": "cancelled",
  "notes": "Payment cancelled",
  "updatedAt": "2025-11-15T14:00:00Z"
}
```

## Paramètres

| Méthode | Endpoint            | Description                                              |
| ------- | ------------------- | -------------------------------------------------------- |
| GET     | `/settings`         | Récupération des paramètres de la company                |
| PATCH   | `/settings`         | Mise à jour (langue, fuseau, prefixe, séquence, etc.)    |

### GET `/settings`

**Response (200 OK):**
```json
{
  "id": "uuid",
  "language": "fr",
  "timezone": "Europe/Paris",
  "invoicePrefix": "FAC",
  "invoiceSequence": 1,
  "dateFormat": "DD/MM/YYYY",
  "currency": "EUR",
  "taxRate": "20.00",
  "paymentTerms": 30,
  "createdAt": "2025-11-11T10:00:00Z",
  "updatedAt": "2025-11-11T10:00:00Z"
}
```

### PATCH `/settings`

**Request Body:**
```json
{
  "language": "en",
  "timezone": "America/New_York",
  "invoicePrefix": "INV",
  "dateFormat": "MM/DD/YYYY",
  "currency": "USD",
  "taxRate": "10.00",
  "paymentTerms": 15
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "language": "en",
  "timezone": "America/New_York",
  "invoicePrefix": "INV",
  "invoiceSequence": 1,
  "dateFormat": "MM/DD/YYYY",
  "currency": "USD",
  "taxRate": "10.00",
  "paymentTerms": 15,
  "updatedAt": "2025-11-11T17:00:00Z"
}
```

## Abonnements & Plans

| Méthode | Endpoint                | Description                                                           |
| ------- | ----------------------- | --------------------------------------------------------------------- |
| GET     | `/plans`                | Liste des plans disponibles (Free, Pro…)                              |
| GET     | `/subscriptions/me`     | Abonnement actif pour la company                                      |
| POST    | `/subscriptions`        | Souscription à un plan (upgrade/downgrade)                            |
| POST    | `/subscriptions/preview`| Calcul d’un changement de plan (proration, limites)                   |
| POST    | `/subscriptions/cancel` | Demande d’annulation à la fin de la période en cours                  |

### GET `/plans`

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "code": "free",
      "name": "Free Plan",
      "description": "Perfect for getting started",
      "price": "0.00",
      "currency": "EUR",
      "billingInterval": "monthly",
      "invoiceLimit": 10,
      "metadata": {
        "features": ["10 invoices/month", "Basic support"]
      }
    },
    {
      "id": "uuid",
      "code": "pro",
      "name": "Pro Plan",
      "description": "For growing businesses",
      "price": "29.99",
      "currency": "EUR",
      "billingInterval": "monthly",
      "invoiceLimit": null,
      "metadata": {
        "features": ["Unlimited invoices", "Priority support", "Advanced reports"]
      }
    }
  ]
}
```

### GET `/subscriptions/me`

**Response (200 OK):**
```json
{
  "id": "uuid",
  "status": "active",
  "currentPeriodStart": "2025-11-01T00:00:00Z",
  "currentPeriodEnd": "2025-12-01T00:00:00Z",
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
  "createdAt": "2025-11-01T10:00:00Z",
  "updatedAt": "2025-11-01T10:00:00Z"
}
```

### POST `/subscriptions`

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
  "currentPeriodStart": "2025-11-11T17:00:00Z",
  "currentPeriodEnd": "2025-12-11T17:00:00Z",
  "cancelAtPeriodEnd": false,
  "plan": {
    "id": "uuid",
    "code": "pro",
    "name": "Pro Plan",
    "price": "29.99",
    "currency": "EUR",
    "billingInterval": "monthly"
  },
  "createdAt": "2025-11-11T17:00:00Z",
  "updatedAt": "2025-11-11T17:00:00Z"
}
```

### POST `/subscriptions/preview`

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
    "name": "Free Plan",
    "price": "0.00"
  },
  "newPlan": {
    "id": "uuid",
    "code": "pro",
    "name": "Pro Plan",
    "price": "29.99"
  },
  "prorationAmount": "14.99",
  "nextBillingDate": "2025-12-01T00:00:00Z",
  "invoiceLimitChange": {
    "current": 10,
    "new": null
  }
}
```

### POST `/subscriptions/cancel`

**Response (200 OK):**
```json
{
  "id": "uuid",
  "status": "active",
  "cancelAtPeriodEnd": true,
  "currentPeriodEnd": "2025-12-01T00:00:00Z",
  "updatedAt": "2025-11-11T17:00:00Z"
}
```

## Bills (Factures Reçues)

| Méthode | Endpoint                    | Description                                    |
| ------- | --------------------------- | ---------------------------------------------- |
| GET     | `/bills`                    | Liste des factures reçues                     |
| GET     | `/bills/:id`                | Détails d'une facture reçue                   |
| POST    | `/bills/:id/pay`            | Payer une facture reçue                        |
| GET     | `/public/invoice/:token`    | Voir une facture via lien de paiement (public) |
| POST    | `/public/pay/:token`        | Payer une facture via lien de paiement (public) |

### GET `/bills?page=1&limit=10&status=sent`

**Query Parameters:**
- `page` (number, default: 1) - Numéro de page
- `limit` (number, default: 10) - Nombre d'éléments par page
- `status` (string, optional) - Filtrer par statut (`draft`, `sent`, `paid`, `overdue`, `cancelled`)

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "invoice": {
        "id": "uuid",
        "invoiceNumber": "FAC-001",
        "issueDate": "2025-11-11",
        "dueDate": "2025-12-11",
        "totalAmount": "3000.00",
        "amountPaid": "0.00",
        "currency": "EUR",
        "status": "sent",
        "notes": "Payment terms: 30 days",
        "issuer": {
          "id": "uuid",
          "name": "Acme Corp",
          "legalName": "Acme Corporation Ltd",
          "addressLine1": "123 Business St",
          "city": "Paris",
          "country": "FR"
        }
      },
      "status": "sent",
      "viewedAt": null,
      "paidAt": null,
      "createdAt": "2025-11-11T12:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### GET `/bills/:id`

**Response (200 OK):**
```json
{
  "id": "uuid",
  "invoice": {
    "id": "uuid",
    "invoiceNumber": "FAC-001",
    "issueDate": "2025-11-11",
    "dueDate": "2025-12-11",
    "totalAmount": "3000.00",
    "amountPaid": "0.00",
    "currency": "EUR",
    "status": "sent",
    "notes": "Payment terms: 30 days",
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
      "country": "FR"
    }
  },
  "status": "sent",
  "viewedAt": "2025-11-11T12:30:00Z",
  "paidAt": null,
  "createdAt": "2025-11-11T12:00:00Z"
}
```

**Notes:**
- Marque automatiquement la facture comme vue (`viewedAt`) lors de la première consultation

### POST `/bills/:id/pay`

**Request Body:**
```json
{
  "method": "bank_transfer",
  "notes": "Payment received via bank transfer"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "status": "paid",
  "paidAt": "2025-11-15T10:00:00Z",
  "payment": {
    "id": "uuid",
    "amount": "3000.00",
    "currency": "EUR",
    "method": "bank_transfer",
    "paidAt": "2025-11-15T10:00:00Z"
  }
}
```

### GET `/public/invoice/:token`

**Description:** Endpoint public (sans authentification) pour voir une facture via son lien de paiement

**Response (200 OK):**
```json
{
  "invoice": {
    "id": "uuid",
    "invoiceNumber": "FAC-001",
    "issueDate": "2025-11-11",
    "dueDate": "2025-12-11",
    "totalAmount": "3000.00",
    "amountPaid": "0.00",
    "currency": "EUR",
    "status": "sent",
    "notes": "Payment terms: 30 days",
    "items": [
      {
        "id": "uuid",
        "description": "Consulting Services",
        "quantity": "10",
        "unitPrice": "150.00",
        "totalAmount": "1500.00"
      }
    ],
    "issuer": {
      "name": "Acme Corp",
      "legalName": "Acme Corporation Ltd",
      "addressLine1": "123 Business St",
      "city": "Paris",
      "country": "FR"
    },
    "recipient": {
      "name": "Client Corp",
      "email": "client@example.com"
    }
  },
  "canPay": true,
  "remainingAmount": "3000.00"
}
```

**Errors:**
- `404 Not Found` - Token invalide ou facture introuvable
- `400 Bad Request` - Lien de paiement expiré

### POST `/public/pay/:token`

**Description:** Endpoint public (sans authentification) pour payer une facture via son lien de paiement

**Request Body:**
```json
{
  "method": "online_payment",
  "notes": "Paid via credit card",
  "email": "payer@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "payment": {
    "id": "uuid",
    "amount": "3000.00",
    "currency": "EUR",
    "paidAt": "2025-11-15T10:00:00Z"
  },
  "invoice": {
    "id": "uuid",
    "invoiceNumber": "FAC-001",
    "status": "paid"
  }
}
```

**Errors:**
- `404 Not Found` - Token invalide ou facture introuvable
- `400 Bad Request` - Lien expiré, facture déjà payée, ou montant invalide

**Notes:**
- Si le récepteur est un utilisateur du système, la `ReceivedInvoice` correspondante est automatiquement mise à jour

## Dashboard & Analytics

| Méthode | Endpoint                | Description                                                           |
| ------- | ----------------------- | --------------------------------------------------------------------- |
| GET     | `/dashboard/activities` | Activités récentes de l'utilisateur (30 derniers jours)               |
| GET     | `/dashboard/alerts`     | Alertes à surveiller (factures en retard, clients sensibles)          |
| GET     | `/dashboard/stats`      | Statistiques générales (revenus, factures, paiements)                 |

### GET `/dashboard/activities?limit=5`

**Query Parameters:**
- `limit` (number, default: 5) - Nombre d'activités à retourner

**Response (200 OK):**
```json
{
  "data": [
    {
      "type": "invoice_created",
      "date": "2025-11-11T17:00:00Z",
      "title": "Facture FAC-001 créée",
      "description": "Client: Acme Corp",
      "amount": "3000.00",
      "currency": "EUR",
      "status": "draft",
      "entityId": "uuid",
      "entityType": "invoice"
    },
    {
      "type": "payment_received",
      "date": "2025-11-10T14:30:00Z",
      "title": "Paiement reçu pour FAC-002",
      "description": "Client: Tech Solutions",
      "amount": "1500.00",
      "currency": "EUR",
      "status": "completed",
      "entityId": "uuid",
      "entityType": "payment"
    },
    {
      "type": "client_created",
      "date": "2025-11-09T10:00:00Z",
      "title": "Client NewCorp créé",
      "description": "contact@newcorp.com",
      "entityId": "uuid",
      "entityType": "client"
    }
  ]
}
```

### GET `/dashboard/alerts`

**Response (200 OK):**
```json
{
  "overdueInvoices": [
    {
      "id": "uuid",
      "invoiceNumber": "FAC-001",
      "clientName": "Acme Corp",
      "dueDate": "2025-11-01",
      "totalAmount": "3000.00",
      "amountPaid": "0.00",
      "currency": "EUR",
      "daysOverdue": 10
    }
  ],
  "clientsWithUnpaidInvoices": [
    {
      "clientId": "uuid",
      "clientName": "Acme Corp",
      "clientEmail": "contact@acme.com",
      "unpaidCount": 3,
      "totalUnpaid": "7500.00"
    }
  ],
  "totalUnpaid": "12000.00"
}
```

### GET `/dashboard/stats?month=11&year=2025`

**Query Parameters:**
- `month` (number, optional) - Mois (1-12), défaut: mois actuel
- `year` (number, optional) - Année, défaut: année actuelle

**Response (200 OK):**
```json
{
  "period": {
    "month": 11,
    "year": 2025
  },
  "monthlyRevenue": [
    {
      "currency": "EUR",
      "amount": "15000.00"
    }
  ],
  "invoicesSent": 25,
  "totalPaid": "12000.00",
  "totalUnpaid": "8000.00",
  "invoicesByStatus": [
    {
      "status": "draft",
      "count": 5
    },
    {
      "status": "sent",
      "count": 15
    },
    {
      "status": "paid",
      "count": 20
    },
    {
      "status": "overdue",
      "count": 3
    }
  ],
  "monthlyRevenues": [
    {
      "month": 6,
      "year": 2025,
      "revenue": "10000.00"
    },
    {
      "month": 7,
      "year": 2025,
      "revenue": "12000.00"
    },
    {
      "month": 8,
      "year": 2025,
      "revenue": "15000.00"
    },
    {
      "month": 9,
      "year": 2025,
      "revenue": "18000.00"
    },
    {
      "month": 10,
      "year": 2025,
      "revenue": "14000.00"
    },
    {
      "month": 11,
      "year": 2025,
      "revenue": "15000.00"
    }
  ]
}
```

### GET `/clients/:id/revenue?months=6`

**Query Parameters:**
- `months` (number, default: 6) - Nombre de mois à retourner

**Response (200 OK):**
```json
{
  "clientId": "uuid",
  "clientName": "Acme Corp",
  "monthlyRevenues": [
    {
      "month": 6,
      "year": 2025,
      "revenue": [
        {
          "currency": "EUR",
          "amount": "5000.00"
        }
      ],
      "invoicesSent": 5,
      "invoicesPaid": 4
    },
    {
      "month": 7,
      "year": 2025,
      "revenue": [
        {
          "currency": "EUR",
          "amount": "7500.00"
        }
      ],
      "invoicesSent": 8,
      "invoicesPaid": 7
    },
    {
      "month": 8,
      "year": 2025,
      "revenue": [
        {
          "currency": "EUR",
          "amount": "6000.00"
        }
      ],
      "invoicesSent": 6,
      "invoicesPaid": 6
    }
  ]
}
```

---

### Notes de conception

- Les endpoints sont protégés via l'authentification JWT et scellés à la `company` du user courant.
- Les ressources paginées (clients, produits, invoices) exposent des query params `page`, `limit`, `search`.
- La gestion des fichiers (logo, documents) n'est pas incluse dans le MVP.
- Les limites liées aux plans sont appliquées lors de la création d'une facture / client / produit selon le `plan` courant.
- Tous les endpoints retournent uniquement les données de l'utilisateur connecté (pas d'accès admin).
- Les statistiques et revenus sont calculés en temps réel depuis la base de données.


