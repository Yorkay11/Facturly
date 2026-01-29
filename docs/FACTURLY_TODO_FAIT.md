# Facturly — Ce qu’on a déjà & ce qui est fait

## 1. Ce qu’on a déjà dans Facturly

### Auth & onboarding
- [x] Login, Register, Callback (auth)
- [x] Onboarding (complétion profil / workspace)
- [x] Redirections conditionnelles, hooks `useAuth` / `useRedirect`

### Dashboard & layout
- [x] Layout dashboard (sidebar, topbar, main content)
- [x] **Sidebar** : nav (dashboard, factures, clients, articles, relances, rapports, paramètres), workspace, profil, collapse desktop, Sheet mobile
- [x] **Topbar** (desktop), **MobileHeader** (menu, logo, add, notifs, profil), **BottomTabs** (dashboard, factures, clients, paramètres)
- [x] Contexte `SidebarContext`, `NavigationBlockContext`, `LoadingContext`
- [x] Dialog « changements non enregistrés » + `UnsavedChangesDialog`

### Factures
- [x] Liste factures (vue dossiers par client, filtre client, tableau)
- [x] Détail facture (`/invoices/[id]`), édition (`/invoices/[id]/edit`)
- [x] Création (`/invoices/new`) — mode rapide + mode complet
- [x] **Modèles de factures** (`/invoices/templates`) — CRUD, formulaire (logo, couleurs, layout, etc.)
- [x] Factures récurrentes (liste, détail, création, édition)
- [x] Dupliquer, supprimer, annuler facture
- [x] Templates PDF (Classic, Minimal, Modern, Professional, etc.)

### Clients & articles
- [x] Liste clients, détail client (`/clients`, `/clients/[id]`)
- [x] Articles / services (`/items`, `/items/[id]`)

### Autres pages dashboard
- [x] Relances (`/reminders`)
- [x] Rapports (`/reports`)
- [x] Factures reçues / bills (`/bills`, `/bills/[id]`)
- [x] Notifications (`/notifications`)
- [x] Paramètres (`/settings`) — profil, workspace, etc.
- [x] Billing (`/billing/cancel`, `/billing/success`)

### Landing & pages publiques
- [x] Landing : Hero, DashboardPreview, CountriesBanner, SocialProof, VideoCarousel, InteractiveDemo, RealMetrics, **FeaturesSection** (grid 4 cartes, globe cobe), TrustBadges, WhyFacturly, MobileMoneySection (opérateurs), FAQ, CTA, Footer
- [x] Features, Pricing, Testimonials
- [x] Facture publique par token (`/invoice/[token]`)
- [x] Terms, Privacy

### API & données (RTK Query)
- [x] Auth, Workspace, Billing / subscription
- [x] Invoices, Recurring invoices, Invoice templates
- [x] Clients, Products (items)
- [x] Notifications, Reports, Payment, Public, Dashboard, Settings

### i18n & UX
- [x] **next-intl** : `fr` + `en`, namespaces (navigation, invoices, landing, etc.)
- [x] LanguageSwitcher, routing i18n
- [x] Traductions invoices (détail, formulaire, preview, commands, templates, etc.)

### Paiements & mobile money
- [x] Intégration Moneroo (paiement en ligne)
- [x] Section opérateurs (Orange Money, MTN, Wave, Moov, T-money, Airtel) — **PaymentMethodsGallery** (CircularGallery / cobe)

### Divers
- [x] Breadcrumbs, filtres, recherche, badges statut
- [x] BalanceDisplay, NotificationDropdown
- [x] Hooks : `useIsMobile`, `useItemStore`, `useInvoiceMetadata`, etc.

---

## 2. Ce qui a déjà été fait (sessions récentes)

### UI / UX
- [x] **Modal « Marquer comme payé »** (page détail facture) : simplifié (sans résumé, icônes inutiles, Select au lieu de boutons visuels)
- [x] **Section Features** landing : grid 4 cartes (Facturez, Clients/paiements, Vidéo, Globe), skeletons (image, pile photos, YouTube, globe cobe), i18n `landing.featuresSection`
- [x] **Globe** (carte 4) : marqueurs **Afrique de l’Ouest + Centrale** uniquement (Abidjan, Dakar, Lagos, Accra, Bamako, Ouaga, Cotonou, Lomé, Niamey, Abuja, Yaoundé, Libreville, Brazzaville, N’Djamena, Bangui)
- [x] **VideoCarousel** responsive : contrôles toujours visibles au tactile, overlay compact, thumbnails plus petits + scroll horizontal mobile, liste vidéos cachée sur mobile, `touch-manipulation`
- [x] **Opérateurs** (mobile money) : hauteur galerie responsive (`220px` → `500px`), cartes plus petites sur mobile
- [x] **Sidebar mobile** : toujours en mode étendu, Sheet `85vw` / `300px`, pas de mode collapsed, touch targets agrandis, header `h-14`, fermer custom (cache du close Sheet), nav + workspace + profil adaptés

### Traductions & corrections
- [x] `landing.header.home` (fr + en) pour le header landing
- [x] **`invoices.templates`** complet (fr + en) : breadcrumb, title, description, create, CRUD, form (name, logo, colors, layout, etc.)
- [x] Fix **`invoices.new`** / **`invoices.templates`** sur la page factures : `t('new')` → `t('new.label')`, `t('templates')` → `t('templates.breadcrumb.templates')` (éviter `INSUFFICIENT_PATH`)

### Technique
- [x] Dépendance **cobe** pour le globe
- [x] Sidebar : `effectiveCollapsed = isCollapsed && !isMobile`, usage de `CollapsedNavItem` / `CollapsedNavItemWithChildren` en mode réduit (plus de `useState` dans le `map`)

---

## 3. Fichiers clés modifiés récemment

| Fichier | Changements |
|--------|-------------|
| `app/[locale]/(dashboard)/invoices/[id]/page.tsx` | Modal « Marquer comme payé » simplifié |
| `components/landing/features-section.tsx` | Nouvelle section Features (grid, skeletons, globe) |
| `components/landing/mobile-money-section.tsx` | Galerie opérateurs responsive |
| `components/landing/video-carousel.tsx` | Responsive mobile (contrôles, thumbnails, liste) |
| `components/layout/Sidebar.tsx` | Mobile : étendu, Sheet, touch, `effectiveCollapsed` |
| `app/[locale]/(dashboard)/invoices/page.tsx` | `t('new.label')`, `t('templates.breadcrumb.templates')` |
| `messages/fr.json`, `messages/en.json` | `landing.header.home`, `invoices.templates`, etc. |

---

*Dernière mise à jour : suite aux sessions sur landing, VideoCarousel, opérateurs, sidebar mobile, et corrections i18n.*
