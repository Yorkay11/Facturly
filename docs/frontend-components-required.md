# Composants Frontend Requis - Système d'Envoi de Factures par Email

Ce document liste tous les composants frontend nécessaires pour implémenter le système d'envoi de factures par email avec acceptation, refus et paiement.

## 📋 Vue d'ensemble

Le système nécessite les composants suivants pour permettre aux clients de visualiser, accepter, refuser et payer les factures via un lien public.

## 🎯 Composants à Créer

### 1. Page Publique de Visualisation de Facture
**Fichier :** `app/(public)/invoice/[token]/page.tsx`

**Description :** Page publique principale pour visualiser une facture complète avec toutes les informations.

**Fonctionnalités :**
- ✅ Afficher toutes les informations de la facture (issuer, recipient, items, totaux)
- ✅ Afficher le statut de la facture (sent, paid, cancelled, rejected)
- ✅ Boutons d'action selon le statut :
  - Si `canAccept === true` : Bouton "Accepter" et "Refuser"
  - Si `isPaid === true` : Afficher un message "Facture payée"
  - Si `isRejected === true` : Afficher le commentaire et la raison de refus
- ✅ Afficher les informations de paiement si déjà payée
- ✅ Gestion des erreurs (token invalide, lien expiré)
- ✅ Loading states avec skeleton
- ✅ Design responsive et moderne

**Endpoints utilisés :**
- `GET /public/invoice/:token` - Récupérer les données de la facture
- `POST /public/invoice/:token/accept` - Accepter la facture
- `POST /public/invoice/:token/reject` - Refuser la facture

**Flux :**
1. Client clique sur le lien dans l'email → `/invoice/:token`
2. La page charge et affiche la facture
3. Si la facture peut être acceptée, afficher les boutons "Accepter" et "Refuser"
4. Si "Accepter" → Appeler l'endpoint accept → Rediriger vers `/pay/:token`
5. Si "Refuser" → Ouvrir le modal de refus

---

### 2. Modal/Dialog de Refus de Facture
**Fichier :** `components/modals/RejectInvoiceModal.tsx`

**Description :** Modal pour permettre au client de refuser une facture avec un commentaire et une raison optionnelle.

**Fonctionnalités :**
- ✅ Formulaire avec validation
- ✅ Champ commentaire (obligatoire) - Textarea
- ✅ Champ raison (optionnel) - Select avec options prédéfinies :
  - `amount_discrepancy` - Différence de montant
  - `wrong_items` - Articles incorrects
  - `wrong_client` - Mauvais client
  - `other` - Autre raison
- ✅ Validation Zod pour le formulaire
- ✅ Gestion des erreurs
- ✅ Loading state pendant l'envoi
- ✅ Message de confirmation après refus
- ✅ Fermeture automatique après succès

**Champs du formulaire :**
```typescript
{
  comment: string; // Obligatoire, min 10 caractères
  reason?: string; // Optionnel, enum
}
```

**Endpoints utilisés :**
- `POST /public/invoice/:token/reject` - Refuser la facture

---

### 3. Composant d'Affichage de Facture Publique
**Fichier :** `components/public/PublicInvoiceDisplay.tsx` (optionnel, pour réutilisabilité)

**Description :** Composant réutilisable pour afficher les détails d'une facture publique.

**Fonctionnalités :**
- ✅ Affichage des informations de l'émetteur (issuer)
- ✅ Affichage des informations du destinataire (recipient)
- ✅ Tableau des items de la facture
- ✅ Affichage des totaux (subtotal, tax, total)
- ✅ Affichage des dates (issueDate, dueDate)
- ✅ Affichage des notes si présentes
- ✅ Affichage du statut avec badge
- ✅ Formatage des montants et dates

**Props :**
```typescript
interface PublicInvoiceDisplayProps {
  invoice: PublicInvoice;
  showActions?: boolean; // Afficher les boutons d'action
}
```

---

### 4. Composant d'Actions de Facture
**Fichier :** `components/public/InvoiceActions.tsx` (optionnel, pour réutilisabilité)

**Description :** Composant pour afficher les boutons d'action (Accepter, Refuser, Payer).

**Fonctionnalités :**
- ✅ Bouton "Accepter" si `canAccept === true`
- ✅ Bouton "Refuser" si `canAccept === true`
- ✅ Bouton "Payer" si `canPay === true` et non payée
- ✅ Affichage conditionnel selon le statut
- ✅ Gestion des états de chargement
- ✅ Redirection après acceptation vers le paiement

**Props :**
```typescript
interface InvoiceActionsProps {
  token: string;
  canAccept: boolean;
  canPay: boolean;
  isPaid: boolean;
  isRejected: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onPay?: () => void;
}
```

---

### 5. Composant d'Affichage de Statut de Facture
**Fichier :** `components/public/InvoiceStatusBadge.tsx` (optionnel, extension du composant existant)

**Description :** Badge pour afficher le statut de la facture avec des couleurs appropriées.

**Fonctionnalités :**
- ✅ Badge "Envoyée" (sent) - Bleu
- ✅ Badge "Payée" (paid) - Vert
- ✅ Badge "Refusée" (cancelled/rejected) - Rouge
- ✅ Badge "En retard" (overdue) - Orange
- ✅ Icône associée au statut

**Note :** Il existe déjà `components/invoices/InvoiceStatusBadge.tsx` qui peut être étendu ou réutilisé.

---

### 6. Page de Paiement (Déjà existante)
**Fichier :** `app/(public)/pay/[token]/page.tsx` ✅

**Description :** Page publique pour payer une facture (déjà implémentée).

**Modifications nécessaires :**
- ✅ Vérifier que cette page fonctionne avec les nouveaux endpoints
- ✅ S'assurer que la redirection depuis `/invoice/:token` fonctionne correctement
- ✅ Peut nécessiter des ajustements mineurs pour la cohérence

---

## 🔄 Flux Utilisateur

### Scénario 1 : Client accepte et paie
1. Client reçoit l'email avec le lien
2. Client clique sur "Voir la facture" → `/invoice/:token`
3. Page `/invoice/:token` s'affiche avec la facture complète
4. Client clique sur "Accepter"
5. Backend accepte la facture et retourne le lien de paiement
6. Redirection automatique vers `/pay/:token`
7. Client paie la facture
8. Confirmation de paiement

### Scénario 2 : Client refuse
1. Client reçoit l'email avec le lien
2. Client clique sur "Voir la facture" → `/invoice/:token`
3. Page `/invoice/:token` s'affiche avec la facture complète
4. Client clique sur "Refuser"
5. Modal de refus s'ouvre
6. Client saisit un commentaire (obligatoire) et optionnellement une raison
7. Client valide le refus
8. Backend enregistre le refus et met le statut à `cancelled`
9. Page se met à jour pour afficher le statut "Refusée" avec le commentaire
10. Modal se ferme

### Scénario 3 : Facture déjà payée
1. Client clique sur le lien → `/invoice/:token`
2. Page s'affiche avec le statut "Payée"
3. Affichage des informations de paiement
4. Boutons d'action désactivés

### Scénario 4 : Facture déjà refusée
1. Client clique sur le lien → `/invoice/:token`
2. Page s'affiche avec le statut "Refusée"
3. Affichage du commentaire et de la raison de refus
4. Boutons d'action désactivés

---

## 🎨 Design et UX

### Principes de design
- ✅ Design cohérent avec le reste de l'application
- ✅ Interface claire et intuitive
- ✅ Messages d'erreur explicites
- ✅ Loading states pour toutes les actions asynchrones
- ✅ Responsive design (mobile, tablette, desktop)
- ✅ Accessibilité (ARIA labels, keyboard navigation)

### Couleurs et styles
- ✅ Utiliser le système de design existant (shadcn/ui)
- ✅ Couleurs cohérentes avec le thème de l'application
- ✅ Badges de statut avec couleurs appropriées
- ✅ Boutons d'action clairs et visibles

---

## 📦 Dépendances et Utilitaires

### Hooks nécessaires
- ✅ `useGetPublicInvoiceQuery` - Récupérer les données de la facture
- ✅ `useAcceptPublicInvoiceMutation` - Accepter la facture
- ✅ `useRejectPublicInvoiceMutation` - Refuser la facture
- ✅ `usePayPublicInvoiceMutation` - Payer la facture (déjà existant)

### Composants UI existants à utiliser
- ✅ `Card`, `CardHeader`, `CardTitle`, `CardContent` - Pour les sections
- ✅ `Button` - Pour les actions
- ✅ `Dialog` / `AlertDialog` - Pour les modals
- ✅ `Table` - Pour afficher les items
- ✅ `Badge` - Pour les statuts
- ✅ `Skeleton` - Pour les loading states
- ✅ `Toast` - Pour les notifications
- ✅ `Form`, `Label`, `Input`, `Textarea`, `Select` - Pour les formulaires

### Utilitaires
- ✅ Fonctions de formatage (dates, montants) - À créer ou réutiliser
- ✅ Validation Zod pour les formulaires
- ✅ Gestion des erreurs API

---

## 🚀 Priorités d'Implémentation

### Phase 1 : Composants essentiels
1. ✅ **Page publique de visualisation** (`/invoice/[token]/page.tsx`)
   - Affichage de la facture
   - Gestion des erreurs
   - Loading states

2. ✅ **Modal de refus** (`RejectInvoiceModal.tsx`)
   - Formulaire de refus
   - Validation
   - Intégration avec l'API

### Phase 2 : Améliorations et réutilisabilité
3. ✅ **Composant d'affichage de facture** (`PublicInvoiceDisplay.tsx`)
   - Extraction de la logique d'affichage
   - Réutilisabilité

4. ✅ **Composant d'actions** (`InvoiceActions.tsx`)
   - Extraction de la logique d'actions
   - Réutilisabilité

### Phase 3 : Polish et optimisations
5. ✅ **Amélioration du design**
   - Animations
   - Transitions
   - Micro-interactions

6. ✅ **Tests et validation**
   - Tests des différents scénarios
   - Validation de l'accessibilité
   - Tests de performance

---

## 📝 Notes Importantes

1. **Sécurité :** Les endpoints publics ne nécessitent pas d'authentification, mais utilisent un token unique valide 30 jours.

2. **Gestion des erreurs :** Tous les endpoints doivent gérer les erreurs appropriées (404, 400, etc.) avec des messages clairs pour l'utilisateur.

3. **Expiration des liens :** Les liens expirent après 30 jours. Il faut afficher un message approprié si le lien a expiré.

4. **Statuts de facture :** Les factures peuvent avoir différents statuts (sent, paid, cancelled, overdue). Il faut gérer tous les cas.

5. **Validation :** Le commentaire de refus est obligatoire et doit être validé côté client et serveur.

6. **Redirection :** Après acceptation, rediriger vers la page de paiement avec le token approprié.

---

## 🔍 Fichiers Existants à Examiner

- ✅ `app/(public)/pay/[token]/page.tsx` - Structure de référence pour la page publique
- ✅ `components/modals/ReminderModal.tsx` - Structure de référence pour les modals
- ✅ `components/invoices/InvoiceStatusBadge.tsx` - Badge de statut existant
- ✅ `app/(dashboard)/invoices/[id]/page.tsx` - Affichage de facture existant (pour référence)

---

## ✅ Checklist de Développement

- [ ] Créer la page `/invoice/[token]/page.tsx`
- [ ] Créer le modal `RejectInvoiceModal.tsx`
- [ ] Créer les fonctions de formatage (dates, montants)
- [ ] Intégrer les hooks API (`useAcceptPublicInvoiceMutation`, `useRejectPublicInvoiceMutation`)
- [ ] Gérer les erreurs (token invalide, lien expiré, etc.)
- [ ] Ajouter les loading states
- [ ] Ajouter les messages de confirmation
- [ ] Tester le flux d'acceptation
- [ ] Tester le flux de refus
- [ ] Tester les différents statuts de facture
- [ ] Tester la responsivité
- [ ] Tester l'accessibilité
- [ ] Vérifier la cohérence du design
- [ ] Documenter les composants

---

## 📚 Références

- Document principal : `docs/invoice-email-system.md`
- API Endpoints : `services/facturlyApi.ts`
- Composants UI : `components/ui/`
- Modals existants : `components/modals/`

