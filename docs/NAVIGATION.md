# Conventions Facturly

## Navigation

## Règle principale

**Toute navigation interne** (vers une route de l’application) doit utiliser le **`Link`** et le **`useRouter`** exposés par `@/i18n/routing`, et **jamais** `next/link` ni `next/navigation` pour les liens ou redirections.

- **Liens :** `import { Link } from '@/i18n/routing'` puis `<Link href="/dashboard">`
- **Redirection / navigation programmatique :** `import { useRouter } from '@/i18n/routing'` puis `router.push('/invoices')`

Cela garantit le préfixe de locale (`/fr/...`, `/en/...`) et une navigation SPA sans rechargement complet.

## À garder en `<a>`

- **Liens externes** : `href="https://..."` (avec `target="_blank"` si besoin)
- **Email / Téléphone** : `href="mailto:..."`, `href="tel:..."`
- **Ancres** : `href="#section-id"` pour le défilement dans la même page

## Vérification rapide

- Ne pas réimporter `Link` depuis `"next/link"`.
- Ne pas utiliser `<a href="/...">` pour les routes internes.

---

## Thème & CSS (Dark Mode)

Pour que le **Dark Mode** et le rebranding restent cohérents :

- **Préférer les variables sémantiques** aux couleurs en dur :
  - `bg-card`, `bg-background`, `bg-muted` au lieu de `bg-white`, `bg-slate-50`
  - `text-foreground`, `text-muted-foreground` au lieu de `text-slate-900`, `text-slate-600`
  - `border-border` au lieu de `border-slate-200`
- **Dans les graphiques (Recharts)** : utiliser des constantes basées sur les variables CSS, par ex. `CHART_PRIMARY = "hsl(var(--primary))"`, et les mêmes pour tooltips (card, border, foreground).
- **Couleurs hexadécimales** (`#7835ef`, etc.) : à réserver aux cas très spécifiques (ex. templates PDF, branding fixe). Partout ailleurs, utiliser les variables du thème (`app/globals.css`).

---

## Formulaires (validation & i18n)

- **Stack** : tous les formulaires utilisent **react-hook-form** + **zod** + **@hookform/resolvers/zod** (`zodResolver`).
- **Schéma** : définir le schéma zod avec `useMemo` et **traductions** pour les messages de validation (`useTranslations('…validation')` ou `…form.validation`), afin d’éviter les chaînes en dur (ex. `z.string().min(1, tValidation('clientRequired'))`).
- **Typage** : préférer `z.infer<typeof schema>` pour le type du formulaire. Si besoin, utiliser `zodResolver(schema as z.ZodType<FormValues>)` pour satisfaire TypeScript quand le schéma est mémorisé.
- **Clés de validation** : ajouter les messages dans les namespaces dédiés (ex. `recurringInvoices.form.validation`, `invoices.quick.validation`, `invoices.templates.validation`) dans `messages/fr.json` et `messages/en.json`.
