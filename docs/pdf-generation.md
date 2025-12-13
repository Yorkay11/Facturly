# Génération PDF des Factures

Ce document décrit le système de génération PDF des factures avec Puppeteer.

## 📋 Vue d'ensemble

Le système utilise **Puppeteer** pour générer des PDFs professionnels à partir de templates HTML personnalisables. Les PDFs sont générés :
- À la demande via les endpoints API
- Automatiquement lors de l'envoi de factures par email (en pièce jointe)

**✨ Fonctionnalité importante :** Le système supporte **8 templates différents** et chaque facture peut avoir son propre template associé. Voir la [documentation complète des templates](./invoice-templates.md) pour plus de détails.

## 🛠️ Architecture

### Service PDF (`src/invoicing/pdf.service.ts`)

Le service `PdfService` gère :
- La création et la gestion du browser Puppeteer
- Le chargement et la compilation des templates Handlebars
- La génération du HTML de la facture à partir du template
- La conversion HTML → PDF
- Le formatage des données (dates, montants, statuts)
- Le cache des templates compilés

### Templates HTML

Les templates HTML utilisent **Handlebars** pour le rendu dynamique et sont stockés dans `src/invoicing/templates/`. Chaque template inclut :
- Informations de l'entreprise (émetteur)
- Informations du client (destinataire)
- Détails de la facture (numéro, dates, statut)
- Tableau des lignes de facture
- Totaux (HT, TVA, TTC)
- Notes additionnelles

**Templates disponibles :**
- `invoice` - Moderne avec sidebar (par défaut)
- `invoice-modern` - Moderne épuré
- `invoice-minimal` - Ultra-minimaliste
- `invoice-classic` - Classique traditionnel
- `invoice-elegant` - Élégant raffiné
- `invoice-compact` - Compact ticket/reçu
- `invoice-colorful` - Coloré moderne
- `invoice-professional` - Professionnel entreprise

Voir [invoice-templates.md](./invoice-templates.md) pour les détails de chaque template.

## 🚀 Utilisation

### Endpoints API

#### 1. Télécharger le PDF d'une facture (utilisateur authentifié)

**Endpoint:** `GET /invoices/:id/pdf?template={templateName}`  
**Auth:** Requis (JWT token)

**Paramètres :**
- `id` (requis) : ID de la facture (UUID)
- `template` (optionnel) : Nom du template à utiliser
  - Si non spécifié → utilise le template associé à la facture (`invoice.templateName`)
  - Si la facture n'a pas de template → utilise `invoice` (par défaut)

**Response:**
- Type: `application/pdf`
- Headers:
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="facture-{numero}.pdf"`

**Exemples:**
```bash
# Utilise le template de la facture
curl -H "Authorization: Bearer {token}" \
  http://localhost:3000/invoices/{invoiceId}/pdf \
  --output facture.pdf

# Utilise un template spécifique (surcharge temporaire)
curl -H "Authorization: Bearer {token}" \
  http://localhost:3000/invoices/{invoiceId}/pdf?template=invoice-modern \
  --output facture.pdf
```

#### 2. Télécharger le PDF via token public

**Endpoint:** `GET /public/invoice/:token/pdf?template={templateName}`  
**Auth:** Non requis (token dans l'URL)

**Paramètres :**
- `token` (requis) : Token public de la facture
- `template` (optionnel) : Même logique que l'endpoint principal

**Exemples:**
```bash
# Utilise le template de la facture
curl http://localhost:3000/public/invoice/{token}/pdf \
  --output facture.pdf

# Utilise un template spécifique
curl http://localhost:3000/public/invoice/{token}/pdf?template=invoice-elegant \
  --output facture.pdf
```

### Intégration dans les emails

Les PDFs sont automatiquement générés et ajoutés en pièce jointe lors de l'envoi de factures :

**Endpoints:**
- `POST /invoices` (avec `sendEmail: true`)
- `POST /invoices/:id/send`

Le PDF est généré automatiquement **avec le template associé à la facture** et ajouté à l'email avec le nom :
```
facture-{invoiceNumber}.pdf
```

**Comportement :**
1. Si la facture a un `templateName` → utilise ce template
2. Sinon → utilise le template par défaut (`invoice`)

**Note:** Si la génération du PDF échoue, l'email est quand même envoyé (sans PDF). L'erreur est loggée mais ne bloque pas l'envoi.

**Exemple de création avec envoi automatique :**
```typescript
POST /invoices
{
  clientId: "uuid",
  issueDate: "2025-01-15",
  items: [...],
  templateName: "invoice-elegant", // Template utilisé pour le PDF
  sendEmail: true,
  recipientEmail: "client@example.com"
}
```

## 🎨 Personnalisation

### Modifier un template existant

Les templates HTML sont stockés dans `src/invoicing/templates/` au format Handlebars. Pour modifier un template :

1. Ouvrez le fichier du template (ex: `invoice.html`, `invoice-modern.html`)
2. Modifiez les styles CSS dans la section `<style>`
3. Ajustez la structure HTML selon vos besoins
4. Utilisez les helpers Handlebars pour les données dynamiques

**Structure des données disponibles dans les templates :**
```typescript
{
  metadata: {
    number: string;
    receiver?: string;
    subject?: string;
    notes?: string;
    issueDateFormatted: string;
    dueDateFormatted: string;
  };
  company: { /* ... */ };
  client: { /* ... */ };
  items: Array<{ /* ... */ }>;
  subtotalFormatted: string;
  vatAmountFormatted: string;
  totalAmountFormatted: string;
  template: {
    name: string;
    accentColor: string;
    textColor: string;
    backgroundColor?: string;
  };
}
```

### Créer un nouveau template

Pour créer un nouveau template :

1. Créez un fichier `invoice-{nom}.html` dans `src/invoicing/templates/`
2. Utilisez Handlebars pour le rendu dynamique
3. Suivez la structure des templates existants
4. Ajoutez le nom du template dans la validation du DTO (`CreateInvoiceDto`)
5. Redémarrez l'application pour charger le nouveau template

### Exemple de template Handlebars

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      color: {{template.textColor}};
    }
    .header {
      background: {{template.accentColor}};
    }
  </style>
</head>
<body>
  <h1>Facture {{metadata.number}}</h1>
  <p>Émise le : {{metadata.issueDateFormatted}}</p>
  
  {{#if company.name}}
    <div class="company">{{company.name}}</div>
  {{/if}}
  
  <!-- ... reste du template ... -->
</body>
</html>
```

### Ajouter un logo

Si la company a un `logoUrl`, vous pouvez l'afficher dans le template :

```handlebars
{{#if company.logoUrl}}
  <div class="company-logo">
    <img src="{{company.logoUrl}}" alt="{{company.name}}">
  </div>
{{/if}}
```

Pour plus de détails sur la personnalisation, voir la [documentation des templates](./invoice-templates.md).

## 🔧 Configuration

### Puppeteer

Puppeteer est configuré avec les options suivantes :
- `headless: true` - Mode sans interface
- Arguments pour Docker/Serverless :
  - `--no-sandbox`
  - `--disable-setuid-sandbox`
  - `--disable-dev-shm-usage`
  - `--disable-accelerated-2d-canvas`
  - `--disable-gpu`

### Handlebars

Les templates utilisent **Handlebars** pour le rendu dynamique :
- Templates compilés et mis en cache en mémoire
- Rechargement automatique lors des changements (en développement)
- Support des helpers Handlebars standards (`#if`, `#each`, etc.)

### Format PDF

- Format: `A4`
- Marges: 20mm (top/bottom), 15mm (left/right)
- Background: Activé (pour les couleurs)
- Print: Optimisé pour l'impression

## 📦 Dépendances

- `puppeteer` - Génération PDF
- `handlebars` - Moteur de templates
- `@types/handlebars` - Types TypeScript pour Handlebars

## ⚠️ Considérations

### Performance

- Le browser Puppeteer est réutilisé entre les requêtes (singleton)
- Les templates Handlebars sont compilés une fois et mis en cache
- La première génération peut être plus lente (initialisation du browser + compilation du template)
- Pour un volume élevé, considérez une queue de traitement

### Mémoire

- Puppeteer utilise de la mémoire pour le browser
- Le browser est fermé lors du shutdown de l'application
- Pour des environnements limités, considérez `puppeteer-core` avec Chrome externe

### Production

En production, assurez-vous que :
- Chrome/Chromium est installé sur le serveur (ou utilisez Docker avec Puppeteer)
- Les permissions sont correctement configurées
- Les ressources (CPU, mémoire) sont suffisantes

### Docker

Si vous utilisez Docker, ajoutez dans votre Dockerfile :

```dockerfile
RUN apt-get update && apt-get install -y \
  chromium \
  && rm -rf /var/lib/apt/lists/*
```

Ou utilisez une image qui inclut déjà Chromium.

## 🐛 Dépannage

### PDF non généré

1. Vérifiez les logs pour les erreurs Puppeteer
2. Vérifiez que Chrome/Chromium est installé
3. Vérifiez les permissions du système
4. Testez avec `headless: false` pour voir les erreurs visuelles

### PDF vide ou mal formaté

1. Vérifiez que toutes les relations sont chargées (items, client, company, payments)
2. Vérifiez les données dans la base (null/undefined)
3. Vérifiez le template HTML pour les erreurs de syntaxe Handlebars
4. Vérifiez que le template existe bien dans `src/invoicing/templates/`
5. Vérifiez les logs pour les erreurs de compilation Handlebars

### Timeout

Si la génération prend trop de temps :
- Vérifiez la taille du HTML généré
- Optimisez les images (logos)
- Augmentez le timeout dans Puppeteer

### Erreur "Browser closed"

- Vérifiez que le browser n'est pas fermé prématurément
- Vérifiez les ressources système (mémoire)
- Redémarrez l'application si nécessaire

## 📝 Exemples

### Générer un PDF manuellement

```typescript
import { PdfService } from './pdf.service';
import { InvoicingService } from './invoicing.service';

// Dans votre service
const invoice = await invoicingService.findOne(userId, invoiceId);
const company = await invoicingService.getCompanyByUserId(userId);

// Utiliser le template de la facture (ou spécifier un template)
const pdf = await pdfService.generateInvoicePdf(
  invoice,
  company,
  invoice.client,
  invoice.templateName || 'invoice', // Template optionnel
);

// Sauvegarder ou envoyer le PDF
fs.writeFileSync('facture.pdf', pdf);
```

### Associer un template à une facture

```typescript
// Lors de la création
const invoice = await invoicingService.create(userId, {
  clientId: 'uuid',
  issueDate: '2025-01-15',
  items: [...],
  templateName: 'invoice-modern', // Template associé
});

// Ou mettre à jour une facture existante
await invoicingService.update(userId, invoiceId, {
  templateName: 'invoice-elegant',
});
```

### Obtenir la liste des templates disponibles

```typescript
const templates = pdfService.getAvailableTemplates();
// Retourne: ['invoice', 'invoice-modern', 'invoice-minimal', ...]
```

### Tester un template HTML

Pour tester le HTML généré par un template sans créer le PDF :

```typescript
// Dans votre service/test
const html = await pdfService.generateInvoiceHtml(
  invoice,
  company,
  invoice.client,
  'invoice-modern', // Template à tester
);

console.log(html); // Afficher le HTML généré
```

Vous pouvez créer un endpoint temporaire pour prévisualiser le HTML dans le navigateur.

## 📚 Documentation complémentaire

- **[Documentation des Templates](./invoice-templates.md)** - Guide complet sur les templates disponibles, leur utilisation et intégration frontend
- **[Documentation Stripe](./stripe-integration.md)** - Intégration des paiements

## 🔄 Améliorations futures

- [x] Templates multiples avec Handlebars
- [x] Association de template par facture
- [ ] Cache des PDFs générés
- [ ] Templates personnalisables par entreprise (avec upload de templates personnalisés)
- [ ] Support multi-langues
- [ ] Génération asynchrone via queue
- [ ] Prévisualisation avant génération
- [ ] Support de signatures électroniques
- [ ] Éditeur de templates visuel

