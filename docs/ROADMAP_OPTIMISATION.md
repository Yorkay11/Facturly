# Roadmap d’optimisation Facturly

Document de référence pour les prochaines optimisations (technique et produit).  
Dernière mise à jour : février 2025.

---

## Vision Facturly (référence)

**Cette roadmap et le refactoring de l’app sont guidés par la [vision Facturly](../../docs/VISION_FACTURLY.md).**

**Vision** : *« La facturation mobile-first pour l’Afrique »* — Cible : freelances et agences (Digital Nomads Abidjan, Dakar, Lomé, Cotonou). Positionnement : *« Le Stripe de l’Afrique de l’Ouest »*.

Pour la vision complète (mission, positionnement, cible, fonctionnalités killer, principes), voir **[docs/VISION_FACTURLY.md](../../docs/VISION_FACTURLY.md)** à la racine du repo. Les items produit (P1–P9) et les refactos techniques en découlent.

---

## 1. Déjà réalisé (référence)

| Domaine | Action | Fichiers / impact |
|--------|--------|-------------------|
| **Dashboard** | Logique extraite dans `useDashboardData` | `hooks/useDashboardData.ts`, `dashboard/page.tsx` allégé |
| **Navigation** | `<a>` internes → `Link` i18n, abandon de `next/link` | Tous les composants, `docs/NAVIGATION.md` |
| **Thème / CSS** | Couleurs en dur → variables sémantiques (dark mode) | Dashboard, Reports, Clients, Onboarding, RevenueChart |
| **Page Factures** | Logique extraite dans `useInvoicesData` | `hooks/useInvoicesData.ts`, `invoices/page.tsx` |
| **Page Clients** | Logique extraite dans `useClientsData` | `hooks/useClientsData.ts`, `clients/page.tsx` |
| **Formulaires** | Validation i18n (zod + useMemo), typage register | RecurringInvoiceForm, QuickInvoice, InvoiceTemplateForm, register |
| **Conventions** | Doc Navigation + Thème + Formulaires | `docs/NAVIGATION.md` |

---

## 2. Roadmap technique (optimisation code & perf)

### 2.1 Priorité haute (P0)

| # | Sujet | Description | Cible |
|---|--------|-------------|--------|
| T1 | **Calculs lourds côté client** | Déplacer les agrégats (revenus, stats) côté API ; le front ne doit que formater/afficher. | `useDashboardData` (fallback 100 factures), tout calcul sur gros tableaux |
| T2 | **Sécurité des routes** | Vérifier que le middleware protège bien les routes dashboard/settings (token valide, redirect login). | `proxy.ts`, routes protégées |
| T3 | **Chargement conditionnel des factures** | Ne pas appeler `useGetInvoicesQuery({ limit: 100 })` si les stats dashboard sont déjà disponibles. | `useDashboardData.ts` |

### 2.2 Priorité moyenne (P1)

| # | Sujet | Description | Cible |
|---|--------|-------------|--------|
| T4 | **Refactoring page Items/Produits** | Même pattern que Factures/Clients : hook `useProductsData` (ou équivalent) + page UI seule. | `app/.../items/page.tsx` (ou products) |
| T5 | **Audit Lighthouse** | Mesurer FCP, LCP, TBT ; corriger les régressions (lazy load graphiques, images, etc.). | Projet global |
| T6 | **Cache / invalidation** | Vérifier les tags RTK Query (invalidate sur création facture/client) pour éviter données stale. | `facturlyApi.ts`, endpoints |
| T7 | **Erreurs API centralisées** | Afficher des messages utilisateur cohérents (toast ou UI) à partir des réponses API (401, 403, 5xx). | `useErrorHandler` ou équivalent, composants |

### 2.3 Priorité basse (P2)

| # | Sujet | Description | Cible |
|---|--------|-------------|--------|
| T8 | **Tests unitaires hooks** | Tester `useDashboardData`, `useInvoicesData`, `useClientsData` (données mock, pas de rendu). | `hooks/__tests__/` |
| T9 | **Bundle / code splitting** | Vérifier que les grosses libs (Recharts, etc.) sont bien chargées en lazy où c’est pertinent. | `reports/page.tsx`, `LazyCharts` |
| T10 | **Accessibilité** | Audit rapide (labels, focus, contrastes) sur formulaire facture et modales. | Formulaires principaux |

---

## 3. Roadmap produit / UX

### 3.1 Priorité haute (P0)

| # | Sujet | Description | Livrable type |
|---|--------|-------------|----------------|
| P1 | **Proposition de valeur** | Afficher un message unique (landing + dashboard) : ex. « Relancez par WhatsApp », « Facturez en XOF ». | Copy + composant hero / bandeau |
| P2 | **Parcours première facture** | Wizard ou mode “première facture” (étapes numérotées, champs essentiels uniquement) ; par défaut privilégier le mode rapide pour les nouveaux. | Onboarding / première connexion |
| P3 | **Stratégie de relance** | Workflow relance (J+7, J+15, J+30) avec modèles de messages (email + WhatsApp) et historique par facture (« Relance 1 envoyée le … »). | Module Relances / fiche facture |

### 3.2 Priorité moyenne (P1)

| # | Sujet | Description | Livrable type |
|---|--------|-------------|----------------|
| P4 | **Lien facture ↔ paiement** | Vue “Encaissements” (paiements avec facture liée) ; sur la facture : “Payée le … via …”. | Page Encaissements + détail facture |
| P5 | **Objectif d’activation** | Métrique “Factures envoyées ce mois” + objectif (“3 factures ce mois”) ; email ou in-app si inactivité. | Dashboard + emails / notifs |
| P6 | **Rapports utiles** | Export planifié (PDF/Excel mensuel par email) ; alerte configurable (ex. CA &lt; X ou &gt; Y factures en retard). | Paramètres + jobs / cron |

### 3.3 Priorité basse (P2)

| # | Sujet | Description | Livrable type |
|---|--------|-------------|----------------|
| P7 | **Devis → facture** | Parcours clair : devis → accepté → conversion en facture (si pas déjà couvert). | Fiche devis + bouton “Transformer en facture” |
| P8 | **Rappel clients inactifs** | Alerte “Ce client n’a pas été facturé depuis X mois” (configurable). | Dashboard ou page Clients |
| P9 | **Comparaison rapports** | Ce mois vs même mois année précédente dans les graphiques. | Page Rapports |

---

## 4. Synthèse des priorités

- **Court terme (sprint actuel)** : T2 (middleware), T3 (éviter 100 factures inutiles), P1 (message de valeur).
- **Moyen terme** : T1 (agrégats côté API), P2 (première facture), P3 (relances).
- **Long terme** : P4 (encaissements), P6 (rapports/alertes), T8 (tests hooks).

---

## 5. Références

- Conventions (navigation, thème, formulaires) : `docs/NAVIGATION.md`
- Stratégie de tests : `docs/TESTING_STRATEGY.md`
- Performance front : `docs/FRONTEND_PERFORMANCE_COMPLETE.md` (si existant)
