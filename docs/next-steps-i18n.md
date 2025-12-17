# Prochaines étapes pour l'internationalisation

## ✅ Ce qui est déjà fait

1. ✅ Configuration de next-intl
2. ✅ Structure des routes avec `[locale]`
3. ✅ Middleware/proxy configuré
4. ✅ Imports mis à jour (Link, useRouter, usePathname)
5. ✅ Fichiers de messages de base créés

## 📋 Prochaines étapes

### 1. Tester la configuration

```bash
npm run dev
```

Vérifier :
- ✅ Accès à `http://localhost:3000` → redirige vers `/fr`
- ✅ Accès à `http://localhost:3000/en` → page en anglais
- ✅ Navigation entre les pages fonctionne
- ✅ Les liens incluent automatiquement la locale

### 2. Ajouter un sélecteur de langue

Le composant `LanguageSwitcher` a été créé dans `components/ui/language-switcher.tsx`.

**Pour l'ajouter dans le header :**
```tsx
// Dans components/landing/header.tsx
import { LanguageSwitcher } from "@/components/ui/language-switcher";

// Ajouter dans le JSX :
<LanguageSwitcher />
```

**Pour l'ajouter dans le Topbar :**
```tsx
// Dans components/layout/Topbar.tsx
import { LanguageSwitcher } from "@/components/ui/language-switcher";

// Ajouter dans le JSX où vous voulez
<LanguageSwitcher />
```

### 3. Utiliser les traductions dans les composants

**Exemple dans un composant client :**
```tsx
"use client";

import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('common');
  
  return (
    <div>
      <button>{t('save')}</button>
      <button>{t('cancel')}</button>
    </div>
  );
}
```

**Exemple dans un composant serveur :**
```tsx
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export default async function MyPage() {
  const t = await getTranslations('common');
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
    </div>
  );
}
```

### 4. Traduire les métadonnées

**Dans `app/[locale]/page.tsx` :**
```tsx
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  
  return {
    title: t('title'),
    description: t('description'),
  };
}
```

### 5. Enrichir les fichiers de messages

**Structure recommandée pour `messages/fr.json` :**
```json
{
  "common": {
    "welcome": "Bienvenue",
    "loading": "Chargement...",
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer",
    "edit": "Modifier",
    "create": "Créer",
    "search": "Rechercher"
  },
  "auth": {
    "login": "Connexion",
    "register": "Inscription",
    "email": "Email",
    "password": "Mot de passe",
    "forgotPassword": "Mot de passe oublié ?"
  },
  "dashboard": {
    "title": "Tableau de bord",
    "invoices": "Factures",
    "clients": "Clients",
    "items": "Articles",
    "settings": "Paramètres"
  },
  "metadata": {
    "title": "Facturly - Facturation simple & intelligente",
    "description": "..."
  }
}
```

### 6. Priorités de traduction

**Haute priorité :**
- [ ] Pages d'authentification (login, register)
- [ ] Navigation principale (Topbar)
- [ ] Boutons et actions communes
- [ ] Messages d'erreur et de succès

**Moyenne priorité :**
- [ ] Pages du dashboard
- [ ] Formulaires
- [ ] Modales

**Basse priorité :**
- [ ] Pages publiques (landing page)
- [ ] Messages de confirmation
- [ ] Tooltips et help text

### 7. Bonnes pratiques

1. **Organiser les traductions par domaine** :
   - `common` : textes communs
   - `auth` : authentification
   - `dashboard` : tableau de bord
   - `invoices` : factures
   - etc.

2. **Utiliser des clés descriptives** :
   - ✅ `invoices.create.title`
   - ❌ `title1`

3. **Gérer les pluriels** :
   ```json
   {
     "items": {
       "one": "{count} article",
       "other": "{count} articles"
     }
   }
   ```
   ```tsx
   t('items', { count: 5 }) // "5 articles"
   ```

4. **Traduire les dates et nombres** :
   Utiliser `next-intl` avec `date-fns` pour les formats locaux.

### 8. Commandes utiles

```bash
# Démarrer le serveur de développement
npm run dev

# Build pour vérifier les erreurs
npm run build

# Linter
npm run lint
```

## 🎯 Objectif final

- ✅ Toutes les routes fonctionnent avec `/fr` et `/en`
- ✅ Sélecteur de langue visible et fonctionnel
- ✅ Tous les textes traduits
- ✅ Métadonnées traduites
- ✅ Expérience utilisateur fluide lors du changement de langue

## 📚 Ressources

- [Documentation next-intl](https://next-intl-docs.vercel.app/)
- [Exemples next-intl](https://github.com/amannn/next-intl/tree/main/examples)

