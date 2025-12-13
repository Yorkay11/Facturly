# Documentation - Templates de Factures

Cette documentation explique comment utiliser les différents templates de factures disponibles dans l'API backend pour générer des PDFs personnalisés.

## 📋 Vue d'ensemble

Le système de génération PDF supporte **8 templates différents** qui peuvent être utilisés pour générer des factures avec des styles variés. Chaque template utilise les mêmes données mais présente les informations avec un design unique.

**✨ Fonctionnalité importante :** Chaque facture peut avoir un template associé qui sera utilisé automatiquement lors de la génération du PDF et de l'envoi par email. Ce template peut être défini lors de la création de la facture ou modifié ultérieurement.

## 🚀 Utilisation

### Association d'un Template à une Facture

Lors de la création d'une facture, vous pouvez spécifier le template à utiliser :

**POST** `/invoices`

```typescript
{
  // ... autres champs
  templateName: "invoice-modern", // Optionnel, défaut: "invoice"
}
```

Le template spécifié sera :
- ✅ Sauvegardé dans la facture
- ✅ Utilisé automatiquement lors de la génération du PDF
- ✅ Utilisé lors de l'envoi de la facture par email (en pièce jointe)

### Mise à jour du Template

Vous pouvez modifier le template d'une facture existante :

**PATCH** `/invoices/:id`

```typescript
{
  templateName: "invoice-professional"
}
```

### Endpoint Principal (Téléchargement PDF)

**GET** `/invoices/:id/pdf?template={templateName}`

**Paramètres :**
- `id` (requis) : ID de la facture (UUID)
- `template` (optionnel) : Nom du template à utiliser pour cette génération.
  - Si non spécifié → utilise le template associé à la facture (`invoice.templateName`)
  - Si la facture n'a pas de template → utilise `invoice` (template par défaut)

**Comportement :**
1. Si `template` est spécifié dans la query → utilise ce template (surcharge temporaire)
2. Sinon, si la facture a un `templateName` → utilise le template de la facture
3. Sinon → utilise `invoice` (template par défaut)

**Headers requis :**
- `Authorization: Bearer {token}` (pour les utilisateurs authentifiés)

### Endpoint Public (Téléchargement PDF)

**GET** `/public/invoice/:token/pdf?template={templateName}`

**Paramètres :**
- `token` (requis) : Token public de la facture
- `template` (optionnel) : Nom du template à utiliser. Même logique que l'endpoint principal

**Headers :** Aucun (endpoint public)

## 📦 Templates Disponibles

### 1. `invoice` (Template par défaut)

**Style :** Moderne avec sidebar colorée  
**Utilisation :** Général, convient à tous les types d'entreprises  
**Caractéristiques :**
- Layout à deux colonnes (sidebar + contenu)
- Sidebar avec couleur d'accent personnalisable
- Design épuré et professionnel

**Exemple :**
```typescript
// Utilise le template associé à la facture
const pdfUrl = `/invoices/${invoiceId}/pdf`;

// Ou surcharger temporairement avec un autre template
const pdfUrl = `/invoices/${invoiceId}/pdf?template=invoice`;
```

---

### 2. `invoice-modern`

**Style :** Moderne et épuré  
**Utilisation :** Startups, entreprises tech, services modernes  
**Caractéristiques :**
- Design minimaliste avec espacements généreux
- Typographie claire et lisible
- Section conditions de paiement intégrée

**Exemple :**
```typescript
const pdfUrl = `/invoices/${invoiceId}/pdf?template=invoice-modern`;
```

---

### 3. `invoice-minimal`

**Style :** Ultra-minimaliste  
**Utilisation :** Factures simples, petits projets  
**Caractéristiques :**
- Design très épuré
- Mise en page simple et directe
- Optimisé pour l'impression

**Exemple :**
```typescript
const pdfUrl = `/invoices/${invoiceId}/pdf?template=invoice-minimal`;
```

---

### 4. `invoice-classic`

**Style :** Classique et traditionnel  
**Utilisation :** Secteurs traditionnels, artisanat, services locaux  
**Caractéristiques :**
- Police serif (Times New Roman)
- Bordures classiques
- Style traditionnel français

**Exemple :**
```typescript
const pdfUrl = `/invoices/${invoiceId}/pdf?template=invoice-classic`;
```

---

### 5. `invoice-elegant`

**Style :** Élégant et raffiné  
**Utilisation :** Prestations haut de gamme, luxe, services premium  
**Caractéristiques :**
- Header centré avec police élégante
- Accents dorés
- Double bordure décorative
- Style sophistiqué

**Exemple :**
```typescript
const pdfUrl = `/invoices/${invoiceId}/pdf?template=invoice-elegant`;
```

---

### 6. `invoice-compact`

**Style :** Compact, style ticket/reçu  
**Utilisation :** Reçus, tickets, factures courtes  
**Caractéristiques :**
- Format réduit pour économiser le papier
- Police monospace (style reçu)
- Bordures simples
- Optimisé pour impression rapide

**Exemple :**
```typescript
const pdfUrl = `/invoices/${invoiceId}/pdf?template=invoice-compact`;
```

---

### 7. `invoice-colorful`

**Style :** Coloré et moderne  
**Utilisation :** Secteurs créatifs, agences, design  
**Caractéristiques :**
- Dégradés de couleurs vives
- Header avec gradient
- Cartes colorées pour les informations
- Design moderne et dynamique

**Exemple :**
```typescript
const pdfUrl = `/invoices/${invoiceId}/pdf?template=invoice-colorful`;
```

---

### 8. `invoice-professional`

**Style :** Professionnel entreprise  
**Utilisation :** Grandes entreprises, B2B, services corporatifs  
**Caractéristiques :**
- Header sombre et élégant
- Mise en page structurée
- Section notes intégrée
- Style corporate

**Exemple :**
```typescript
const pdfUrl = `/invoices/${invoiceId}/pdf?template=invoice-professional`;
```

## 📧 Templates et Envoi par Email

Lorsqu'une facture est envoyée par email (soit automatiquement lors de la création avec `sendEmail: true`, soit via l'endpoint `POST /invoices/:id/send`), le PDF est automatiquement généré avec le template associé à la facture et ajouté en pièce jointe.

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

Le PDF généré et attaché à l'email utilisera le template `invoice-elegant`.

## 💻 Intégration Next.js

### Configuration de l'API

D'abord, configurez l'URL de votre backend dans votre fichier `.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
# ou en production
NEXT_PUBLIC_API_URL=https://api.votre-domaine.com
```

### App Router (Next.js 13+)

#### Composant Client pour le téléchargement

```typescript
// app/components/invoice-download.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TEMPLATES = [
  { value: 'invoice', label: 'Moderne (Sidebar)' },
  { value: 'invoice-modern', label: 'Moderne' },
  { value: 'invoice-minimal', label: 'Minimaliste' },
  { value: 'invoice-classic', label: 'Classique' },
  { value: 'invoice-elegant', label: 'Élégant' },
  { value: 'invoice-compact', label: 'Compact' },
  { value: 'invoice-colorful', label: 'Coloré' },
  { value: 'invoice-professional', label: 'Professionnel' },
];

interface InvoiceDownloadProps {
  invoiceId: string;
  token?: string; // Pour les liens publics
  className?: string;
}

export function InvoiceDownload({ 
  invoiceId, 
  token,
  className 
}: InvoiceDownloadProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('invoice');
  const [isLoading, setIsLoading] = useState(false);

  const downloadPdf = async () => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const baseUrl = token 
        ? `${apiUrl}/public/invoice/${token}/pdf`
        : `${apiUrl}/invoices/${invoiceId}/pdf`;
      
      const url = `${baseUrl}?template=${selectedTemplate}`;
      
      // Récupérer le token depuis les cookies ou le store
      const authToken = token ? undefined : getAuthToken();
      
      const response = await fetch(url, {
        headers: authToken ? {
          'Authorization': `Bearer ${authToken}`,
        } : {},
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du PDF');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `facture-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      // Afficher une notification d'erreur à l'utilisateur
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Select 
        value={selectedTemplate} 
        onValueChange={setSelectedTemplate}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Sélectionner un template" />
        </SelectTrigger>
        <SelectContent>
          {TEMPLATES.map(template => (
            <SelectItem key={template.value} value={template.value}>
              {template.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button 
        onClick={downloadPdf} 
        disabled={isLoading}
      >
        {isLoading ? 'Téléchargement...' : 'Télécharger PDF'}
      </Button>
    </div>
  );
}

function getAuthToken(): string {
  // Utiliser vos cookies ou votre store d'authentification
  // Exemple avec cookies-next :
  // import { getCookie } from 'cookies-next';
  // return getCookie('auth_token') as string || '';
  
  // Ou avec un store Zustand/Context :
  // return useAuthStore(state => state.token);
  
  return '';
}
```

#### Prévisualisation dans un iframe

```typescript
// app/components/invoice-preview.tsx
'use client';

import { useState } from 'react';
import { Select } from '@/components/ui/select';

interface InvoicePreviewProps {
  invoiceId: string;
  token?: string;
}

export function InvoicePreview({ invoiceId, token }: InvoicePreviewProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('invoice');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  
  const pdfUrl = token
    ? `${apiUrl}/public/invoice/${token}/pdf?template=${selectedTemplate}`
    : `${apiUrl}/invoices/${invoiceId}/pdf?template=${selectedTemplate}`;

  return (
    <div className="space-y-4">
      <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
        {/* ... options ... */}
      </Select>
      
      <div className="border rounded-lg overflow-hidden">
        <iframe
          src={pdfUrl}
          className="w-full h-[600px]"
          title="Aperçu de la facture"
        />
      </div>
    </div>
  );
}
```

#### API Route pour téléchargement côté serveur

```typescript
// app/api/invoices/[id]/pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const invoiceId = params.id;
  const searchParams = request.nextUrl.searchParams;
  const template = searchParams.get('template') || 'invoice';
  
  const cookieStore = cookies();
  const authToken = cookieStore.get('auth_token')?.value;

  if (!authToken) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(
      `${apiUrl}/invoices/${invoiceId}/pdf?template=${template}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la génération du PDF');
    }

    const blob = await response.blob();
    
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="facture-${invoiceId}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    );
  }
}
```

#### Utilisation dans une page

```typescript
// app/invoices/[id]/page.tsx
import { InvoiceDownload } from '@/components/invoice-download';
import { InvoicePreview } from '@/components/invoice-preview';

export default function InvoicePage({ 
  params 
}: { 
  params: { id: string } 
}) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Facture</h1>
      
      {/* Option 1: Téléchargement */}
      <InvoiceDownload invoiceId={params.id} />
      
      {/* Option 2: Prévisualisation */}
      <InvoicePreview invoiceId={params.id} />
    </div>
  );
}
```

### Pages Router (Next.js 12 et antérieur)

#### Composant de téléchargement

```typescript
// components/InvoiceDownload.tsx
import { useState } from 'react';

const TEMPLATES = [
  { value: 'invoice', label: 'Moderne (Sidebar)' },
  { value: 'invoice-modern', label: 'Moderne' },
  { value: 'invoice-minimal', label: 'Minimaliste' },
  { value: 'invoice-classic', label: 'Classique' },
  { value: 'invoice-elegant', label: 'Élégant' },
  { value: 'invoice-compact', label: 'Compact' },
  { value: 'invoice-colorful', label: 'Coloré' },
  { value: 'invoice-professional', label: 'Professionnel' },
];

export default function InvoiceDownload({ 
  invoiceId, 
  token 
}: { 
  invoiceId: string; 
  token?: string;
}) {
  const [selectedTemplate, setSelectedTemplate] = useState('invoice');
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const baseUrl = token
        ? `${apiUrl}/public/invoice/${token}/pdf`
        : `${apiUrl}/invoices/${invoiceId}/pdf`;
      
      const url = `${baseUrl}?template=${selectedTemplate}`;
      
      // Pour les routes publiques, pas besoin de token
      const headers: HeadersInit = {};
      if (!token) {
        const authToken = localStorage.getItem('auth_token');
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }
      }

      const response = await fetch(url, { headers });
      
      if (!response.ok) throw new Error('Erreur lors du téléchargement');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `facture-${invoiceId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du téléchargement du PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <select
        value={selectedTemplate}
        onChange={(e) => setSelectedTemplate(e.target.value)}
        className="px-3 py-2 border rounded"
      >
        {TEMPLATES.map(template => (
          <option key={template.value} value={template.value}>
            {template.label}
          </option>
        ))}
      </select>
      <button
        onClick={handleDownload}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Téléchargement...' : 'Télécharger PDF'}
      </button>
    </div>
  );
}
```

#### Page avec téléchargement

```typescript
// pages/invoices/[id].tsx
import { GetServerSideProps } from 'next';
import InvoiceDownload from '@/components/InvoiceDownload';

interface InvoicePageProps {
  invoiceId: string;
}

export default function InvoicePage({ invoiceId }: InvoicePageProps) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Facture #{invoiceId}</h1>
      <InvoiceDownload invoiceId={invoiceId} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      invoiceId: context.params?.id,
    },
  };
};
```

#### API Route (Pages Router)

```typescript
// pages/api/invoices/[id]/pdf.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt'; // ou votre méthode d'auth

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { template } = req.query;
  
  // Vérifier l'authentification
  const token = await getToken({ req });
  if (!token) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(
      `${apiUrl}/invoices/${id}/pdf?template=${template || 'invoice'}`,
      {
        headers: {
          'Authorization': `Bearer ${token.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la génération du PDF');
    }

    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="facture-${id}.pdf"`
    );
    res.send(buffer);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du PDF' });
  }
}
```

### Hook personnalisé pour Next.js

Créez un hook réutilisable pour gérer le téléchargement :

```typescript
// hooks/useInvoiceDownload.ts
import { useState } from 'react';

interface UseInvoiceDownloadOptions {
  invoiceId: string;
  token?: string;
}

export function useInvoiceDownload({ invoiceId, token }: UseInvoiceDownloadOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadPdf = async (template: string = 'invoice') => {
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const baseUrl = token
        ? `${apiUrl}/public/invoice/${token}/pdf`
        : `${apiUrl}/invoices/${invoiceId}/pdf`;
      
      const url = `${baseUrl}?template=${template}`;
      
      const headers: HeadersInit = {};
      if (!token) {
        // Récupérer le token depuis votre système d'auth
        const authToken = getAuthToken();
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du PDF');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `facture-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { downloadPdf, isLoading, error };
}

function getAuthToken(): string {
  // Adaptez selon votre système d'authentification
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token') || '';
  }
  return '';
}
```

### Utilisation avec Zustand (Store d'état)

Si vous utilisez Zustand pour gérer l'état global :

```typescript
// store/useInvoiceStore.ts
import { create } from 'zustand';

interface InvoiceStore {
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
  downloadPdf: (invoiceId: string, token?: string) => Promise<void>;
  isLoading: boolean;
}

export const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  selectedTemplate: 'invoice',
  isLoading: false,
  
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  
  downloadPdf: async (invoiceId: string, token?: string) => {
    set({ isLoading: true });
    try {
      const { selectedTemplate } = get();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const baseUrl = token
        ? `${apiUrl}/public/invoice/${token}/pdf`
        : `${apiUrl}/invoices/${invoiceId}/pdf`;
      
      const url = `${baseUrl}?template=${selectedTemplate}`;
      
      // ... logique de téléchargement ...
    } finally {
      set({ isLoading: false });
    }
  },
}));
```

## 🎨 Aperçu Visuel des Templates

| Template | Style | Utilisation Recommandée |
|----------|-------|------------------------|
| `invoice` | Moderne avec sidebar | Général |
| `invoice-modern` | Moderne épuré | Startups, Tech |
| `invoice-minimal` | Ultra-minimaliste | Petits projets |
| `invoice-classic` | Classique traditionnel | Artisanat, Local |
| `invoice-elegant` | Élégant raffiné | Luxe, Premium |
| `invoice-compact` | Compact ticket | Reçus, Tickets |
| `invoice-colorful` | Coloré moderne | Créatif, Design |
| `invoice-professional` | Corporate | B2B, Entreprises |

## 🔧 Configuration

### Variables d'Environnement

Les templates utilisent certaines variables configurables :

- `template.accentColor` : Couleur d'accent (par défaut : `#3b82f6`)
- `template.textColor` : Couleur du texte (par défaut : `#1F1B2E`)
- `template.backgroundColor` : Couleur de fond (par défaut : `#ffffff`)
- `template.name` : Nom du template pour affichage

Ces valeurs sont actuellement définies dans le service backend. Pour personnaliser, modifiez le fichier `src/invoicing/pdf.service.ts`.

## 📝 Structure des Données

Tous les templates utilisent la même structure de données :

```typescript
interface InvoiceTemplateData {
  metadata: {
    number: string;              // Numéro de facture
    receiver?: string;            // Destinataire (optionnel)
    subject?: string;             // Objet (optionnel)
    notes?: string;               // Notes (optionnel)
    issueDateFormatted: string;   // Date d'émission formatée
    dueDateFormatted: string;     // Date d'échéance formatée
  };
  company: {
    name: string;
    legalName?: string;
    addressLine1?: string;
    addressLine2?: string;
    postalCode?: string;
    city?: string;
    country?: string;
    vatNumber?: string;
    taxId?: string;
    logoUrl?: string;
  };
  client: {
    name: string;
    email?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };
  items: Array<{
    index: number;
    description: string;
    quantity: string;
    unitPriceFormatted: string;
    vatRate: string;
    lineTotalFormatted: string;
  }>;
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

## ⚠️ Gestion des Erreurs

Si un template n'existe pas, le système utilisera automatiquement le template par défaut (`invoice`).

**Exemple de gestion d'erreur :**
```typescript
try {
  const response = await fetch(`/invoices/${invoiceId}/pdf?template=invalid-template`);
  if (!response.ok) {
    // Le backend utilisera le template par défaut
    console.warn('Template invalide, utilisation du template par défaut');
  }
} catch (error) {
  console.error('Erreur lors du téléchargement:', error);
}
```

## 🎯 Workflow Recommandé

### 1. Création de Facture avec Template

```typescript
// Créer une facture avec un template spécifique
const createInvoice = async (invoiceData) => {
  const response = await fetch('/invoices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...invoiceData,
      templateName: 'invoice-modern', // Template associé à la facture
      sendEmail: true, // Le PDF sera généré avec ce template
    }),
  });
  return response.json();
};
```

### 2. Modification du Template d'une Facture

```typescript
// Changer le template d'une facture existante
const updateInvoiceTemplate = async (invoiceId, newTemplate) => {
  const response = await fetch(`/invoices/${invoiceId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      templateName: newTemplate,
    }),
  });
  return response.json();
};
```

### 3. Téléchargement avec Template de la Facture

```typescript
// Télécharger le PDF avec le template associé à la facture
const downloadPdf = (invoiceId) => {
  // Pas besoin de spécifier ?template=, le template de la facture sera utilisé
  window.open(`/invoices/${invoiceId}/pdf`);
};

// Ou surcharger temporairement avec un autre template
const downloadPdfWithTemplate = (invoiceId, template) => {
  window.open(`/invoices/${invoiceId}/pdf?template=${template}`);
};
```

## 🚀 Bonnes Pratiques pour Next.js

1. **Gestion des tokens** : Utilisez des cookies HTTP-only pour les tokens d'authentification en production.

2. **Variables d'environnement** : Configurez `NEXT_PUBLIC_API_URL` dans votre `.env.local` et `.env.production`.

3. **Error Boundaries** : Enveloppez vos composants de téléchargement dans des Error Boundaries Next.js.

4. **Loading States** : Affichez toujours un état de chargement pendant le téléchargement.

5. **Sélection du template** : 
   - Permettez aux utilisateurs de définir un template par défaut lors de la création de facture
   - Sauvegardez le template préféré dans le profil utilisateur ou les paramètres de l'entreprise
   - Affichez le template actuel de la facture dans l'interface

6. **Prévisualisation** : Considérez ajouter une option de prévisualisation dans un iframe avant génération du PDF.

7. **API Routes** : Utilisez les API Routes Next.js pour proxy les requêtes et protéger vos tokens backend.

8. **SSR/SSG** : Pour les factures publiques avec token, vous pouvez pré-générer des URLs sécurisées.

9. **Cache** : Les templates sont mis en cache côté backend pour de meilleures performances.

10. **Fallback** : Toujours prévoir un fallback vers le template par défaut si le template demandé n'existe pas.

11. **Template par facture** : Rappelez-vous que chaque facture a son propre template. Lors du téléchargement, le template de la facture est utilisé par défaut, sauf si vous spécifiez un autre template dans la query.

### Exemple avec Error Boundary

```typescript
// app/components/invoice-error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class InvoiceErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">
            Erreur lors de la génération du PDF. Veuillez réessayer.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 📚 Ressources

- [Documentation API Backend](./pdf-generation.md)
- [Documentation Stripe Integration](./stripe-integration.md)

## 🐛 Dépannage

**Problème : Le PDF ne s'affiche pas**
- Vérifiez que le token d'authentification est valide (pour les endpoints privés)
- Vérifiez que l'ID de facture est correct
- Vérifiez la console du navigateur pour les erreurs

**Problème : Template non trouvé**
- Le système utilisera automatiquement le template par défaut (`invoice`)
- Vérifiez que le nom du template est correct (sensible à la casse)
- Si vous avez défini un template pour une facture, vérifiez qu'il est valide (un des 8 templates disponibles)

**Problème : PDF généré avec erreurs**
- Vérifiez que toutes les données de la facture sont complètes
- Contactez le support si le problème persiste

