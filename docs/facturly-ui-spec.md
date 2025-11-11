## Facturly — Guide UI & Implémentation

### 1. Principes directeurs
- **Accessibilité** : contrastes AA, navigation clavier, labels explicites.
- **Rapidité** : interactions en moins de 3 clics pour les actions fréquentes (créer, envoyer, relancer).
- **Modularité** : composants réutilisables, variants Tailwind/Shadcn.

### 2. Identité visuelle
- Palette primaire : `#163F73` (bleu), accent `#22B07D`, neutres `#0F172A`, `#F1F5F9`.
- Typo : `Nunito` (700 titres, 500 body), interlignage 1.4.
- Iconographie : `lucide-react` pour actions, `react-icons` pour cas spécifiques.

### 3. Layouts
- `app/(public)/layout` : header marketing, CTA, footer.
- `app/(dashboard)/layout` : sidebar fixe 280px, topbar résumé, contenu scrollable.
- Breakpoints : mobile <768px (stacked), tablet 768-1280 (sidebar collapsible), desktop >1280 (split view).

### 4. Écrans prioritaires MVP
1. **Onboarding** : choix statut (freelance, société), saisie infos entreprise.
2. **Dashboard** : stats (CA mensuel, impayés), relances à faire, raccourcis.
3. **Liste Factures** : table triable, filtres (période, client, statut), actions bulk.
4. **Création/Édition Facture** : stepper `Infos → Client → Items → Récap → Envoi` avec preview live.
5. **Clients** : table, formulaire drawer (contact, TVA, notes).
6. **Produits/Services** : catalogue items (prix HT, TVA par défaut).
7. **Paramètres** : onglets (Profil, Entreprise, Mentions légales, Branding, Intégrations, Facturation).

### 5. Composants clés
- `Sidebar`, `TopbarUserMenu`, `Breadcrumbs`.
- `StatCard`, `TrendIndicator`.
- `InvoiceStatusBadge`, `PaymentChip`, `DueDateTag`.
- `ClientSelect` (combobox + ajout rapide), `ItemTable` (editable rows), `TotalsSummary` (TVA, remises, total).
- `ReminderTimeline`, `ActivityLogList`.

### 6. Design System (Tailwind/Shadcn)
- Variants boutons : `primary`, `secondary`, `outline`, `ghost`, `destructive`, `link`.
- Inputs : `FormField` avec `react-hook-form` + `zod` (erreurs sous contrôle).
- Tables : utiliser `Table` shadcn, + sticky header, skeleton loader.
- Modal/Drawer : `Sheet` shadcn pour formulaires secondaires.
- Toaster global pour feedback (succès, erreur, info).

### 7. États & comportements
- **Empty states** : illustration légère + CTA (ex. “Ajoutez votre première facture”).
- **Loading** : skeleton sur cards/tables, spinners sur boutons.
- **Erreurs** : message clair + option retry. Logs côté console désactivés en prod.
- **Drag & Drop Items** : utiliser `dnd-kit` (priorité haute) pour réordonner les lignes.

### 8. Parcours Création Facture
1. Bouton `Créer` → ouverture builder.
2. Étape `Infos` : numérotation automatique (editable), date émission/échéance, devise.
3. Étape `Client` : sélection ou création rapide (drawer).
4. Étape `Items` : ajout lignes, TVA, remises; total calculé en temps réel.
5. Étape `Récap` : aperçu PDF (iframe) + options envoi/email.
6. Étape `Envoi` : choisir canal (email, lien), ajouter message, enregistrer brouillon ou envoyer.

### 9. Intégration backend Nest
- Consommation API via `fetcher` commun (`lib/apiClient.ts`).
- Auth JWT : cookie HTTP-only, refresh automatique via `/auth/refresh`.
- Query data : `React Query` (cache, mutations, optimistic update pour factures).
- Fichiers : upload vers Nest (pré-signed URL S3 à terme).

### 10. Roadmap UI (ordre de dev)
1. Framework structurel : layouts, navigation, theme provider, toasts.
2. Pages `Dashboard` + `Invoices` (liste) avec données mockées.
3. Builder facture (steps, store Zustand, validation R-H-F/Zod).
4. Modules `Clients` & `Produits` (CRUD, drawer forms).
5. Paramètres + personnalisation PDF (upload logo, mentions). 
6. Connexion réelle API Nest + React Query.
7. Optimisations responsive + accessibilité.

### 11. Suivi & QA
- Checklist UX à chaque release (création facture complète, relance, export PDF, mobile).
- Tests UI : Playwright pour scénarios critiques (login, création facture, envoi).
- Retro design mensuelle pour ajuster composants & tokens.
