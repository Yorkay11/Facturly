# Documentation - Ajout de Produits

Ce document décrit comment ajouter des produits et services dans le système Facturly, que ce soit individuellement ou en batch.

## Vue d'ensemble

Le système permet d'ajouter des produits/services de deux manières :
1. **Ajout individuel** : Création d'un produit à la fois via `POST /products`
2. **Import en batch** : Création de plusieurs produits en une seule requête via `POST /products/bulk`

Tous les endpoints nécessitent une authentification JWT valide.

---

## 1. Ajout d'un produit unique

### POST `/products`

Crée un nouveau produit ou service.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Consulting Services",
  "description": "Professional consulting services",
  "price": "150.00",
  "currency": "EUR",
  "taxRate": "20.00",
  "unitOfMeasure": "hour",
  "sku": "CONS-001",
  "isActive": true
}
```

**Champs disponibles :**

| Champ | Type | Requis | Description | Exemple |
|-------|------|--------|-------------|---------|
| `name` | string | ✅ Oui | Nom du produit/service | `"Consulting Services"` |
| `price` ou `unitPrice` | string | ✅ Oui | Prix unitaire (les deux sont acceptés) | `"150.00"` |
| `description` | string | ❌ Non | Description détaillée | `"Professional consulting services"` |
| `currency` | string | ❌ Non | Code devise ISO (3 lettres). Par défaut : devise de la company | `"EUR"`, `"USD"` |
| `taxRate` | string | ❌ Non | Taux de TVA en pourcentage | `"20.00"` (pour 20%) |
| `unitOfMeasure` | string | ❌ Non | Unité de mesure | `"hour"`, `"unit"`, `"kg"`, `"m²"` |
| `sku` | string | ❌ Non | Référence/SKU du produit | `"CONS-001"` |
| `isActive` | boolean | ❌ Non | Produit actif ou non (par défaut: `true`) | `true`, `false` |

**Notes importantes :**
- Le champ `price` est accepté comme alias de `unitPrice` pour compatibilité
- Si `currency` n'est pas fourni, la devise par défaut de la company sera utilisée
- Si `isActive` n'est pas fourni, le produit sera actif par défaut (`true`)
- Les prix et taux doivent être fournis sous forme de chaînes de caractères (ex: `"150.00"`)

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Consulting Services",
  "description": "Professional consulting services",
  "unitPrice": "150.00",
  "currency": "EUR",
  "taxRate": "20.00",
  "unitOfMeasure": "hour",
  "sku": "CONS-001",
  "isActive": true,
  "companyId": "company-uuid",
  "createdAt": "2025-11-11T17:00:00.000Z",
  "updatedAt": "2025-11-11T17:00:00.000Z"
}
```

**Erreurs possibles :**

| Code | Message | Description |
|------|---------|-------------|
| 400 | `unitPrice or price is required` | Aucun prix n'a été fourni |
| 400 | `name should not be empty` | Le nom est requis |
| 401 | `Unauthorized` | Token JWT manquant ou invalide |
| 404 | `Company not found` | La company de l'utilisateur n'existe pas |

**Exemple d'utilisation avec cURL :**
```bash
curl -X POST https://api.facturly.com/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Consulting Services",
    "description": "Professional consulting services",
    "price": "150.00",
    "currency": "EUR",
    "taxRate": "20.00",
    "unitOfMeasure": "hour",
    "sku": "CONS-001"
  }'
```

**Exemple avec JavaScript/TypeScript :**
```typescript
const response = await fetch('/api/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Consulting Services',
    description: 'Professional consulting services',
    price: '150.00',
    currency: 'EUR',
    taxRate: '20.00',
    unitOfMeasure: 'hour',
    sku: 'CONS-001',
    isActive: true,
  }),
});

const product = await response.json();
```

---

## 2. Import en batch

### POST `/products/bulk`

Crée plusieurs produits/services en une seule requête. Utile pour l'import depuis un fichier CSV ou pour créer plusieurs produits rapidement.

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
    },
    {
      "name": "Service ABC",
      "price": "75.50",
      "currency": "EUR",
      "taxRate": "20.00"
    }
  ]
}
```

**Structure de la requête :**
- `products` : Tableau d'objets produit (maximum 1000 éléments)

**Champs des produits :**
Identiques à l'ajout individuel (voir section précédente).

**Response (200 OK) - Succès complet :**
```json
{
  "total": 3,
  "successCount": 3,
  "failedCount": 0,
  "created": [
    {
      "line": 1,
      "productId": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Consulting Services"
    },
    {
      "line": 2,
      "productId": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Product XYZ"
    },
    {
      "line": 3,
      "productId": "770e8400-e29b-41d4-a716-446655440002",
      "name": "Service ABC"
    }
  ],
  "failed": []
}
```

**Response (200 OK) - Avec erreurs partielles :**
```json
{
  "total": 3,
  "successCount": 2,
  "failedCount": 1,
  "created": [
    {
      "line": 1,
      "productId": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Consulting Services"
    },
    {
      "line": 3,
      "productId": "770e8400-e29b-41d4-a716-446655440002",
      "name": "Service ABC"
    }
  ],
  "failed": [
    {
      "line": 2,
      "data": {
        "name": "Invalid Product",
        "description": "Missing price"
      },
      "error": "unitPrice or price is required"
    }
  ]
}
```

**Structure de la réponse :**
- `total` : Nombre total de produits dans la requête
- `successCount` : Nombre de produits créés avec succès
- `failedCount` : Nombre de produits qui ont échoué
- `created` : Tableau des produits créés avec succès
  - `line` : Numéro de ligne (1-indexed)
  - `productId` : UUID du produit créé
  - `name` : Nom du produit
- `failed` : Tableau des produits qui ont échoué
  - `line` : Numéro de ligne (1-indexed)
  - `data` : Données du produit qui a échoué
  - `error` : Message d'erreur détaillé

**Limites :**
- Maximum **1000 produits** par batch
- Chaque produit est validé individuellement
- Les produits valides sont créés même si d'autres échouent (traitement partiel)
- Les numéros de ligne correspondent à l'ordre d'envoi

**Erreurs possibles :**

| Code | Message | Description |
|------|---------|-------------|
| 400 | `Maximum 1000 products allowed per batch import` | Trop de produits dans la requête |
| 401 | `Unauthorized` | Token JWT manquant ou invalide |
| 404 | `Company not found` | La company de l'utilisateur n'existe pas |

**Exemple d'utilisation avec cURL :**
```bash
curl -X POST https://api.facturly.com/products/bulk \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {
        "name": "Consulting Services",
        "price": "150.00",
        "currency": "EUR",
        "taxRate": "20.00",
        "unitOfMeasure": "hour",
        "sku": "CONS-001"
      },
      {
        "name": "Product XYZ",
        "price": "99.99",
        "currency": "USD",
        "taxRate": "10.00",
        "sku": "PROD-001"
      }
    ]
  }'
```

**Exemple avec JavaScript/TypeScript :**
```typescript
const products = [
  {
    name: 'Consulting Services',
    price: '150.00',
    currency: 'EUR',
    taxRate: '20.00',
    unitOfMeasure: 'hour',
    sku: 'CONS-001',
  },
  {
    name: 'Product XYZ',
    price: '99.99',
    currency: 'USD',
    taxRate: '10.00',
    sku: 'PROD-001',
  },
];

const response = await fetch('/api/products/bulk', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ products }),
});

const result = await response.json();
console.log(`Créés: ${result.successCount}, Échoués: ${result.failedCount}`);
```

---

## 3. Exemples de produits

### Produit simple (minimum requis)
```json
{
  "name": "Basic Product",
  "price": "50.00"
}
```

### Service avec tous les champs
```json
{
  "name": "Consulting Services",
  "description": "Professional consulting services for your business",
  "price": "150.00",
  "currency": "EUR",
  "taxRate": "20.00",
  "unitOfMeasure": "hour",
  "sku": "CONS-001",
  "isActive": true
}
```

### Produit physique
```json
{
  "name": "Laptop Computer",
  "description": "High-performance laptop",
  "price": "1299.99",
  "currency": "EUR",
  "taxRate": "20.00",
  "unitOfMeasure": "unit",
  "sku": "LAPTOP-001",
  "isActive": true
}
```

### Service sans TVA
```json
{
  "name": "International Service",
  "description": "Service exempt de TVA",
  "price": "200.00",
  "currency": "EUR",
  "unitOfMeasure": "service",
  "sku": "INT-001"
}
```

---

## 4. Gestion des erreurs

### Erreurs de validation

**Nom manquant :**
```json
{
  "statusCode": 400,
  "message": ["name should not be empty"]
}
```

**Prix manquant :**
```json
{
  "statusCode": 400,
  "message": "unitPrice or price is required"
}
```

### Erreurs dans le batch

Chaque produit est validé individuellement. Les erreurs sont retournées dans le tableau `failed` :

```json
{
  "line": 2,
  "data": {
    "name": "Invalid Product",
    "price": ""
  },
  "error": "unitPrice or price is required"
}
```

**Types d'erreurs courantes :**
- `name should not be empty` : Le nom est requis
- `unitPrice or price is required` : Aucun prix n'a été fourni
- `Duplicate entry (SKU or other unique field)` : Violation de contrainte unique (si applicable)

---

## 5. Bonnes pratiques

### Nommage
- Utilisez des noms clairs et descriptifs
- Évitez les abréviations non standard
- Exemple : `"Consulting Services"` plutôt que `"Cons Serv"`

### Prix
- Toujours fournir les prix sous forme de chaînes de caractères
- Utiliser le format décimal avec 2 décimales : `"150.00"` plutôt que `150` ou `"150"`
- Pour les montants sans décimales, utiliser `"100.00"` plutôt que `"100"`

### SKU
- Utiliser un format cohérent pour les SKU
- Exemples : `"CONS-001"`, `"PROD-2024-001"`, `"SVC-HR-001"`
- Les SKU doivent être uniques (si applicable selon votre configuration)

### Unités de mesure
- Utiliser des unités standard :
  - Services : `"hour"`, `"day"`, `"service"`, `"session"`
  - Produits : `"unit"`, `"piece"`, `"box"`, `"pack"`
  - Poids : `"kg"`, `"g"`, `"lb"`
  - Volume : `"L"`, `"mL"`, `"m³"`
  - Surface : `"m²"`, `"ft²"`

### Taux de TVA
- Fournir le taux en pourcentage : `"20.00"` pour 20%
- Pour les produits sans TVA, omettre le champ ou utiliser `"0.00"`
- Respecter les taux légaux selon votre pays

### Import en batch
- Valider les données côté frontend avant l'envoi
- Afficher une prévisualisation à l'utilisateur
- Gérer les erreurs ligne par ligne avec des messages clairs
- Limiter à 1000 produits par batch pour éviter les timeouts

---

## 6. Workflow recommandé pour l'import CSV

1. **Frontend** : L'utilisateur upload un fichier CSV
2. **Frontend** : Le CSV est parsé et transformé en tableau d'objets JSON
3. **Frontend** : Les données sont affichées à l'utilisateur pour prévisualisation/validation
4. **Frontend** : Si l'utilisateur valide, le tableau est envoyé au backend via `POST /products/bulk`
5. **Backend** : Validation et création ligne par ligne
6. **Backend** : Retour d'un rapport détaillé avec succès et échecs
7. **Frontend** : Affichage des résultats avec possibilité de corriger et réessayer

### Format CSV recommandé

```csv
name,price,taxRate,currency,unitOfMeasure,sku,description,isActive
Consulting Services,150.00,20.00,EUR,hour,CONS-001,Professional consulting,true
Product XYZ,99.99,10.00,USD,unit,PROD-001,Product description,true
Service ABC,75.50,20.00,EUR,service,SVC-001,Service description,true
```

**Note :** Le champ `price` peut être utilisé à la place de `unitPrice` dans le CSV.

---

## 7. Notes techniques

### Alias `price` / `unitPrice`
- Les deux champs sont acceptés pour le prix unitaire
- `price` est un alias de `unitPrice` pour compatibilité
- En interne, le système utilise toujours `unitPrice`

### Devise par défaut
- Si `currency` n'est pas fourni, la devise par défaut de la company est utilisée
- La devise par défaut est définie lors de la création de la company

### Statut actif
- Par défaut, les produits sont créés avec `isActive: true`
- Pour désactiver un produit, utiliser `isActive: false`
- Les produits désactivés ne sont pas supprimés, mais peuvent être masqués dans certaines vues

### Traitement partiel (batch)
- Les produits valides sont créés même si d'autres échouent
- Il n'y a pas de transaction globale (pas de rollback si un produit échoue)
- Chaque création est indépendante

### Performance
- Pour de gros volumes (> 100 éléments), considérer un traitement asynchrone
- Le batch est limité à 1000 produits pour éviter les timeouts
- Pour des imports plus importants, diviser en plusieurs batches

---

## 8. Références

- **API Endpoints** : Voir `docs/api-endpoints.md` pour la liste complète des endpoints
- **Import Batch** : Voir `docs/batch-import.md` pour plus de détails sur l'import en batch
- **Entité Product** : Voir `src/products/entities/product.entity.ts` pour la structure complète

---

## 9. Exemples complets

### Exemple 1 : Création d'un service de consulting

**Requête :**
```json
POST /products
{
  "name": "Consulting Services",
  "description": "Professional consulting services for your business needs",
  "price": "150.00",
  "currency": "EUR",
  "taxRate": "20.00",
  "unitOfMeasure": "hour",
  "sku": "CONS-001",
  "isActive": true
}
```

**Réponse :**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Consulting Services",
  "description": "Professional consulting services for your business needs",
  "unitPrice": "150.00",
  "currency": "EUR",
  "taxRate": "20.00",
  "unitOfMeasure": "hour",
  "sku": "CONS-001",
  "isActive": true,
  "companyId": "company-uuid",
  "createdAt": "2025-11-11T17:00:00.000Z",
  "updatedAt": "2025-11-11T17:00:00.000Z"
}
```

### Exemple 2 : Import batch avec erreurs

**Requête :**
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
      "price": "75.00",
      "taxRate": "20.00"
    }
  ]
}
```

**Réponse :**
```json
{
  "total": 3,
  "successCount": 2,
  "failedCount": 1,
  "created": [
    {
      "line": 1,
      "productId": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Valid Product"
    },
    {
      "line": 3,
      "productId": "660e8400-e29b-41d4-a716-446655440001",
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

---

## Questions fréquentes (FAQ)

**Q : Puis-je utiliser `price` et `unitPrice` en même temps ?**  
R : Oui, mais `unitPrice` prendra la priorité. Il est recommandé d'utiliser un seul des deux.

**Q : Que se passe-t-il si je n'indique pas de devise ?**  
R : La devise par défaut de votre company sera utilisée automatiquement.

**Q : Les produits sont-ils supprimés ou désactivés ?**  
R : Les produits sont désactivés (`isActive: false`) plutôt que supprimés pour préserver l'historique.

**Q : Puis-je importer plus de 1000 produits ?**  
R : Non, la limite est de 1000 produits par batch. Divisez votre import en plusieurs batches si nécessaire.

**Q : Les erreurs dans un batch empêchent-elles la création des autres produits ?**  
R : Non, chaque produit est traité indépendamment. Les produits valides sont créés même si d'autres échouent.

