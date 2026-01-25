# 🧪 Stratégie de Tests Frontend - Facturly

**Date** : 2025-01-27  
**Objectif** : Atteindre 70% de couverture de tests minimum

---

## 📊 État Actuel

### Tests Existants (6 fichiers)

- ✅ `components/invoices/__tests__/InvoiceStatusBadge.test.tsx` - Tests basiques
- ✅ `components/dashboard/__tests__/StatCard.test.tsx` - Tests basiques
- ✅ `app/[locale]/(auth)/register/__tests__/page.test.tsx` - Tests basiques
- ✅ `hooks/__tests__/use-mobile.test.ts` - Tests basiques
- ✅ `hooks/__tests__/useAuth.test.ts` - Tests basiques
- ✅ `lib/__tests__/utils.test.ts` - Tests basiques

### Configuration

- ✅ **Jest** configuré avec Next.js
- ✅ **@testing-library/react** installé
- ✅ **test-utils.tsx** avec wrapper Redux
- ✅ **jest.setup.js** avec mocks Next.js

---

## 🎯 Composants Critiques à Tester

### 🔴 PRIORITÉ CRITIQUE (Paiements & Facturation)

1. **QuickInvoice** ⚠️ **CRITIQUE**
   - Composant central pour création rapide de factures
   - Gère formulaire, validation, soumission
   - **Impact** : 70% des utilisateurs utilisent ce mode

2. **MonerooPaymentModal** ⚠️ **CRITIQUE**
   - Initie les paiements Moneroo
   - Gère redirection vers checkout
   - **Impact** : Tous les paiements passent par là

3. **CreditsPurchaseModal** ⚠️ **CRITIQUE**
   - Achat de crédits Pay-as-you-go
   - Sélection de packs
   - **Impact** : Revenus de l'application

4. **PublicPayPage** ⚠️ **CRITIQUE**
   - Page publique de paiement
   - Gère paiement sans authentification
   - **Impact** : Conversion des paiements

### 🟡 PRIORITÉ HAUTE (Fonctionnalités Métier)

5. **RecurringInvoiceForm** 🟡
   - Création/modification factures récurrentes
   - **Impact** : 50% des factures sont récurrentes

6. **InvoiceDetails** 🟡
   - Affichage et édition des factures
   - Gestion des items
   - **Impact** : Fonctionnalité principale

7. **InvoicesPage** 🟡
   - Liste des factures
   - Filtres et recherche
   - **Impact** : Vue principale utilisateur

---

## 🎯 Plan d'Implémentation

### Phase 1 : Composants Critiques (Semaine 1)

1. ✅ **QuickInvoice** - Tests complets
   - Rendu initial
   - Sélection client
   - Saisie montant
   - Validation formulaire
   - Soumission réussie
   - Gestion erreurs
   - Duplication dernière facture
   - Raccourcis clavier

2. ✅ **MonerooPaymentModal** - Tests complets
   - Ouverture/fermeture modal
   - Initiation paiement
   - Redirection checkout
   - Gestion erreurs

3. ✅ **CreditsPurchaseModal** - Tests complets
   - Affichage packs
   - Sélection pack
   - Initiation paiement
   - Gestion erreurs

4. ✅ **PublicPayPage** - Tests complets
   - Affichage facture publique
   - Initiation paiement
   - Gestion token invalide
   - Gestion facture déjà payée

### Phase 2 : Formulaires (Semaine 2)

5. ✅ **RecurringInvoiceForm** - Tests complets
6. ✅ **InvoiceDetails** - Tests complets
7. ✅ **InvoicesPage** - Tests complets

### Phase 3 : Tests E2E (Semaine 3)

8. ✅ **Tests E2E parcours utilisateur**
   - Création facture → Envoi → Paiement
   - Achat crédits → Utilisation crédits
   - Création facture récurrente

---

## 📝 Structure de Tests

### Pattern AAA (Arrange-Act-Assert)

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickInvoice } from '../QuickInvoice';

describe('QuickInvoice', () => {
  it('should render form correctly', () => {
    // Arrange
    render(<QuickInvoice />);

    // Act
    const clientInput = screen.getByLabelText(/client/i);

    // Assert
    expect(clientInput).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockCreateInvoice = jest.fn();
    render(<QuickInvoice />);

    // Act
    await user.type(screen.getByLabelText(/client/i), 'Client Test');
    await user.type(screen.getByLabelText(/montant/i), '10000');
    await user.click(screen.getByRole('button', { name: /envoyer/i }));

    // Assert
    await waitFor(() => {
      expect(mockCreateInvoice).toHaveBeenCalled();
    });
  });
});
```

---

## 🧪 Types de Tests

### 1. Tests Unitaires Composants

- **Objectif** : Tester le rendu et l'interaction
- **Mock** : RTK Query, Next.js router
- **Exemple** : `QuickInvoice` - Rendu, validation, soumission

### 2. Tests d'Intégration

- **Objectif** : Tester un flux complet avec mocks
- **Mock** : API calls
- **Exemple** : Création facture → Envoi → Redirection

### 3. Tests E2E

- **Objectif** : Tester le parcours utilisateur complet
- **Outils** : Playwright ou Cypress
- **Exemple** : Utilisateur crée facture → Client paie → Facture marquée payée

---

## 🎯 Objectifs de Couverture

### Minimum Requis

- **Composants critiques** : 80%+ couverture
- **Composants métier** : 70%+ couverture
- **Composants UI** : 60%+ couverture
- **Global** : 70%+ couverture

### Métriques

```bash
# Vérifier la couverture
cd Facturly
pnpm test:coverage

# Objectif : 70%+ global
```

---

## 📚 Références

- [Testing Library](https://testing-library.com/react)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

---

**Dernière mise à jour** : 2025-01-27
