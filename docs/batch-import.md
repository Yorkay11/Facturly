# Import en Batch (Clients et Produits)

Ce document décrit les endpoints pour l'import en batch de clients et produits depuis un fichier CSV.

## Vue d'ensemble

Le système permet d'importer plusieurs clients ou produits en une seule requête. Le frontend lit le fichier CSV, affiche les données à l'utilisateur pour validation, puis envoie la liste au backend pour enregistrement.

## Workflow

1. **Frontend** : L'utilisateur upload un fichier CSV
2. **Frontend** : Le CSV est lu et transformé en liste d'objets JSON
3. **Frontend** : La liste est affichée à l'utilisateur pour prévisualisation/validation
4. **Frontend** : Si l'utilisateur valide, la liste est envoyée au backend
5. **Backend** : Validation et création ligne par ligne
6. **Backend** : Retour d'un rapport détaillé avec succès et échecs

## Import de Clients

### POST `/clients/bulk`

Importe une liste de clients en batch.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "clients": [
    {
      "name": "Client 1",
      "email": "client1@example.com",
      "phone": "+33123456789",
      "addressLine1": "123 Rue Example",
      "addressLine2": "Bâtiment A",
      "postalCode": "75001",
      "city": "Paris",
      "country": "FR",
      "taxId": "123456789",
      "notes": "Important client"
    },
    {
      "name": "Client 2",
      "email": "client2@example.com",
      "phone": "+33987654321",
      "addressLine1": "456 Avenue Test",
      "city": "Lyon",
      "postalCode": "69001",
      "country": "FR"
    }
  ]
}
```

**Champs du client :**
- `name` (string, requis) - Nom du client
- `email` (string, optionnel) - Email (doit être unique par company si fourni)
- `phone` (string, optionnel) - Téléphone
- `addressLine1` (string, optionnel) - Adresse ligne 1
- `addressLine2` (string, optionnel) - Adresse ligne 2
- `postalCode` (string, optionnel) - Code postal
- `city` (string, optionnel) - Ville
- `country` (string, optionnel) - Pays (code ISO)
- `taxId` (string, optionnel) - Numéro d'identification fiscale
- `notes` (string, optionnel) - Notes additionnelles

**Response (200 OK):**
```json
{
  "total": 2,
  "successCount": 2,
  "failedCount": 0,
  "created": [
    {
      "line": 1,
      "clientId": "uuid",
      "name": "Client 1"
    },
    {
      "line": 2,
      "clientId": "uuid",
      "name": "Client 2"
    }
  ],
  "failed": []
}
```

**Response avec erreurs (200 OK):**
```json
{
  "total": 3,
  "successCount": 2,
  "failedCount": 1,
  "created": [
    {
      "line": 1,
      "clientId": "uuid",
      "name": "Client 1"
    },
    {
      "line": 3,
      "clientId": "uuid",
      "name": "Client 3"
    }
  ],
  "failed": [
    {
      "line": 2,
      "data": {
        "name": "Client 2",
        "email": "client1@example.com"
      },
      "error": "Email \"client1@example.com\" already exists"
    }
  ]
}
```

**Limites :**
- Maximum **1000 clients** par batch
- Chaque client est validé individuellement
- Les clients valides sont créés même si d'autres échouent

**Validation :**
- Le champ `name` est obligatoire
- L'`email` doit être valide (format email) s'il est fourni
- L'`email` doit être unique par company (pas de doublons)
- Les erreurs de validation sont retournées ligne par ligne

**Gestion des erreurs :**
- **Validation** : Erreurs de format ou de contraintes métier
- **Doublons** : Email déjà existant pour cette company
- **Base de données** : Violations de contraintes uniques

---

## Import de Produits

### POST `/products/bulk`

Importe une liste de produits/services en batch.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "products": [
    {
      "name": "Consulting Services",
      "description": "Professional consulting services",
      "price": "150.00",
      "currency": "EUR",
      "taxRate": "20.00",
      "unitOfMeasure": "hour",
      "sku": "CONS-001",
      "isActive": true
    },
    {
      "name": "Product XYZ",
      "description": "Description du produit",
      "unitPrice": "99.99",
      "taxRate": "10.00",
      "currency": "USD",
      "sku": "PROD-001"
    }
  ]
}
```

**Champs du produit :**
- `name` (string, requis) - Nom du produit/service
- `description` (string, optionnel) - Description
- `price` ou `unitPrice` (string, requis) - Prix unitaire (les deux sont acceptés)
- `currency` (string, optionnel) - Devise (par défaut : devise de la company)
- `taxRate` (string, optionnel) - Taux de TVA (ex: "20.00")
- `unitOfMeasure` (string, optionnel) - Unité de mesure (ex: "hour", "unit", "kg")
- `sku` (string, optionnel) - Référence/SKU du produit
- `isActive` (boolean, optionnel) - Produit actif ou non (par défaut: true)

**Note :** Le champ `price` est accepté comme alias de `unitPrice` pour compatibilité avec la documentation API.

**Response (200 OK):**
```json
{
  "total": 2,
  "successCount": 2,
  "failedCount": 0,
  "created": [
    {
      "line": 1,
      "productId": "uuid",
      "name": "Consulting Services"
    },
    {
      "line": 2,
      "productId": "uuid",
      "name": "Product XYZ"
    }
  ],
  "failed": []
}
```

**Response avec erreurs (200 OK):**
```json
{
  "total": 3,
  "successCount": 2,
  "failedCount": 1,
  "created": [
    {
      "line": 1,
      "productId": "uuid",
      "name": "Consulting Services"
    },
    {
      "line": 3,
      "productId": "uuid",
      "name": "Product ABC"
    }
  ],
  "failed": [
    {
      "line": 2,
      "data": {
        "name": "Invalid Product",
        "price": ""
      },
      "error": "unitPrice or price is required"
    }
  ]
}
```

**Limites :**
- Maximum **1000 produits** par batch
- Chaque produit est validé individuellement
- Les produits valides sont créés même si d'autres échouent

**Validation :**
- Le champ `name` est obligatoire
- Le champ `price` ou `unitPrice` est obligatoire
- Les valeurs numériques doivent être valides
- Les erreurs de validation sont retournées ligne par ligne

**Gestion des erreurs :**
- **Validation** : Erreurs de format ou champs manquants
- **Base de données** : Violations de contraintes

---

## Format de réponse standard

Les deux endpoints retournent un format de réponse identique :

```typescript
{
  total: number;              // Nombre total d'éléments dans la liste
  successCount: number;       // Nombre d'éléments créés avec succès
  failedCount: number;        // Nombre d'éléments qui ont échoué
  created: Array<{            // Liste des éléments créés
    line: number;             // Numéro de ligne (1-indexed)
    clientId?: string;        // ID du client créé (pour /clients/bulk)
    productId?: string;       // ID du produit créé (pour /products/bulk)
    name: string;             // Nom de l'élément créé
  }>;
  failed: Array<{             // Liste des échecs
    line: number;             // Numéro de ligne (1-indexed)
    data: object;             // Données qui ont échoué
    error: string;            // Message d'erreur détaillé
  }>;
}
```

## Exemples d'utilisation

### Import de clients depuis CSV

**Étape 1 : Frontend parse le CSV**
```javascript
// Exemple de parsing CSV côté frontend
const csvData = `name,email,phone,city
Client 1,client1@example.com,+33123456789,Paris
Client 2,client2@example.com,+33987654321,Lyon`;

const lines = csvData.split('\n');
const headers = lines[0].split(',');
const clients = lines.slice(1).map((line, index) => {
  const values = line.split(',');
  return {
    name: values[0],
    email: values[1],
    phone: values[2],
    city: values[3],
  };
});
```

**Étape 2 : Envoi au backend**
```javascript
const response = await fetch('/api/clients/bulk', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ clients }),
});

const result = await response.json();
// result.successCount = nombre de clients créés
// result.failed = liste des erreurs avec numéro de ligne
```

### Import de produits depuis CSV

**Exemple de CSV produit :**
```csv
name,price,taxRate,currency,description
Consulting Services,150.00,20.00,EUR,Hourly consulting
Product XYZ,99.99,10.00,USD,Product description
```

**Envoi au backend :**
```javascript
const products = [
  {
    name: "Consulting Services",
    price: "150.00",
    taxRate: "20.00",
    currency: "EUR",
    description: "Hourly consulting"
  },
  // ...
];

const response = await fetch('/api/products/bulk', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ products }),
});
```

## Gestion des erreurs

### Erreurs courantes

1. **Champ requis manquant**
   ```json
   {
     "line": 2,
     "data": { "email": "test@example.com" },
     "error": "name should not be empty"
   }
   ```

2. **Format email invalide**
   ```json
   {
     "line": 3,
     "data": { "name": "Client", "email": "invalid-email" },
     "error": "email must be an email"
   }
   ```

3. **Doublon d'email (clients uniquement)**
   ```json
   {
     "line": 5,
     "data": { "name": "Client", "email": "existing@example.com" },
     "error": "Email \"existing@example.com\" already exists"
   }
   ```

4. **Limite de batch dépassée**
   ```json
   {
     "statusCode": 400,
     "message": "Maximum 1000 clients allowed per batch import"
   }
   ```

5. **Prix manquant (produits)**
   ```json
   {
     "line": 2,
     "data": { "name": "Product" },
     "error": "unitPrice or price is required"
   }
   ```

## Bonnes pratiques

### Frontend

1. **Validation préalable** : Valider les données avant l'envoi pour éviter les erreurs évidentes
2. **Prévisualisation** : Toujours afficher les données à l'utilisateur avant validation
3. **Gestion d'erreurs** : Afficher clairement les erreurs avec le numéro de ligne
4. **Feedback utilisateur** : Afficher le nombre de succès/échecs et permettre de corriger et réessayer

### Format CSV recommandé

**Pour les clients :**
```csv
name,email,phone,addressLine1,postalCode,city,country,taxId,notes
Acme Corp,contact@acme.com,+33123456789,123 Street,75001,Paris,FR,123456789,Important
```

**Pour les produits :**
```csv
name,price,taxRate,currency,unitOfMeasure,sku,description
Consulting,150.00,20.00,EUR,hour,CONS-001,Hourly consulting
Product XYZ,99.99,10.00,USD,unit,PROD-001,Product description
```

## Exemples complets

### Exemple 1 : Import de clients réussi

**Request:**
```json
POST /clients/bulk
{
  "clients": [
    {
      "name": "Acme Corp",
      "email": "contact@acme.com",
      "phone": "+33123456789",
      "city": "Paris",
      "country": "FR"
    },
    {
      "name": "Tech Solutions",
      "email": "info@tech.com",
      "city": "Lyon",
      "country": "FR"
    }
  ]
}
```

**Response:**
```json
{
  "total": 2,
  "successCount": 2,
  "failedCount": 0,
  "created": [
    {
      "line": 1,
      "clientId": "uuid-1",
      "name": "Acme Corp"
    },
    {
      "line": 2,
      "clientId": "uuid-2",
      "name": "Tech Solutions"
    }
  ],
  "failed": []
}
```

### Exemple 2 : Import avec erreurs

**Request:**
```json
POST /products/bulk
{
  "products": [
    {
      "name": "Valid Product",
      "price": "100.00",
      "taxRate": "20.00"
    },
    {
      "name": "",
      "price": "50.00"
    },
    {
      "name": "Another Product",
      "price": "75.00"
    }
  ]
}
```

**Response:**
```json
{
  "total": 3,
  "successCount": 2,
  "failedCount": 1,
  "created": [
    {
      "line": 1,
      "productId": "uuid-1",
      "name": "Valid Product"
    },
    {
      "line": 3,
      "productId": "uuid-3",
      "name": "Another Product"
    }
  ],
  "failed": [
    {
      "line": 2,
      "data": {
        "name": "",
        "price": "50.00"
      },
      "error": "name should not be empty"
    }
  ]
}
```

## Notes importantes

1. **Traitement partiel** : Les éléments valides sont créés même si d'autres échouent
2. **Ordre préservé** : Les numéros de ligne correspondent à l'ordre d'envoi
3. **Validation stricte** : Chaque élément est validé selon les règles du DTO
4. **Pas de transaction** : Chaque création est indépendante (pas de rollback si une échoue)
5. **Performance** : Pour de gros volumes (> 100 éléments), considérer un traitement asynchrone côté frontend

## Limites et contraintes

- **Maximum 1000 éléments** par batch (pour éviter les timeouts)
- **Validation ligne par ligne** (pas de validation globale avant création)
- **Pas de transaction** (les créations sont indépendantes)
- **Doublons** : Pour les clients, les emails doivent être uniques par company

## Améliorations futures possibles

- Support d'autres formats (Excel, JSON)
- Upload de fichier direct (multipart/form-data)
- Traitement asynchrone avec job en arrière-plan
- Template CSV téléchargeable
- Prévisualisation des erreurs avant envoi
- Import depuis URL (fichier distant)

