# 🧪 Configuration Tests E2E - Facturly Frontend

**Date** : 2025-01-27  
**Objectif** : Mettre en place les tests E2E pour les parcours utilisateur critiques

---

## 🎯 Outils Recommandés

### Option 1 : Playwright (Recommandé)

**Avantages** :
- Plus rapide que Cypress
- Meilleur support multi-navigateurs
- API moderne et simple
- Excellent pour Next.js

**Installation** :
```bash
cd Facturly
pnpm add -D @playwright/test
pnpm exec playwright install
```

### Option 2 : Cypress

**Avantages** :
- Interface graphique excellente
- Très populaire
- Bonne documentation

**Installation** :
```bash
cd Facturly
pnpm add -D cypress
```

---

## 📝 Configuration Playwright (Recommandé)

### 1. Créer `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 2. Créer structure de tests E2E

```
Facturly/
├── e2e/
│   ├── fixtures/
│   │   └── auth.ts          # Helpers pour authentification
│   ├── invoices/
│   │   ├── create-invoice.spec.ts
│   │   ├── send-invoice.spec.ts
│   │   └── payment-flow.spec.ts
│   ├── payments/
│   │   ├── moneroo-payment.spec.ts
│   │   └── credits-purchase.spec.ts
│   └── auth/
│       ├── register.spec.ts
│       └── login.spec.ts
```

---

## 🎯 Parcours Utilisateur à Tester

### 1. Création et Envoi de Facture

**Scénario** :
1. Utilisateur se connecte
2. Va sur la page de création de facture
3. Sélectionne un client
4. Saisit un montant
5. Envoie la facture
6. Vérifie que la facture apparaît dans la liste

**Test** : `e2e/invoices/create-invoice.spec.ts`

### 2. Paiement de Facture (Public)

**Scénario** :
1. Utilisateur ouvre le lien de paiement public
2. Vérifie les détails de la facture
3. Clique sur "Payer avec Mobile Money"
4. Est redirigé vers Moneroo
5. (Simulation) Complète le paiement
6. Vérifie que la facture est marquée comme payée

**Test** : `e2e/payments/moneroo-payment.spec.ts`

### 3. Achat de Crédits

**Scénario** :
1. Utilisateur va dans les paramètres
2. Clique sur "Acheter des crédits"
3. Sélectionne un pack
4. Initie le paiement
5. (Simulation) Complète le paiement
6. Vérifie que les crédits sont ajoutés

**Test** : `e2e/payments/credits-purchase.spec.ts`

### 4. Facture Récurrente

**Scénario** :
1. Utilisateur crée une facture récurrente
2. Configure la récurrence (mensuelle)
3. Vérifie que la facture récurrente apparaît dans la liste
4. Attend la génération automatique (ou déclenche manuellement)
5. Vérifie que la nouvelle facture est créée

**Test** : `e2e/invoices/recurring-invoice.spec.ts`

---

## 📝 Exemple de Test E2E (Playwright)

```typescript
// e2e/invoices/create-invoice.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Invoice Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Login (à implémenter dans fixtures)
    await page.goto('/fr/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/fr/invoices');
  });

  test('should create and send invoice via quick mode', async ({ page }) => {
    // Navigate to invoice creation
    await page.goto('/fr/invoices/new');

    // Select client
    await page.click('button[aria-label="Client"]');
    await page.click('text=Client Test');

    // Enter amount
    await page.fill('input[name="amount"]', '10000');

    // Submit
    await page.click('button:has-text("Envoyer")');

    // Wait for redirect to invoices list
    await page.waitForURL('/fr/invoices');

    // Verify invoice appears in list
    await expect(page.locator('text=FAC-')).toBeVisible();
  });
});
```

---

## 🚀 Commandes

### Playwright

```bash
# Installer
pnpm add -D @playwright/test
pnpm exec playwright install

# Exécuter les tests
pnpm exec playwright test

# Exécuter en mode UI
pnpm exec playwright test --ui

# Exécuter un test spécifique
pnpm exec playwright test e2e/invoices/create-invoice.spec.ts
```

### Ajouter au package.json

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

---

## 📚 Références

- [Playwright Documentation](https://playwright.dev)
- [Next.js E2E Testing](https://nextjs.org/docs/app/building-your-application/testing/playwright)
- [Cypress Documentation](https://docs.cypress.io)

---

**Dernière mise à jour** : 2025-01-27
