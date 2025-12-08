# Configuration des Analytics

Ce document explique comment configurer les analytics pour Facturly.

## Options disponibles

Facturly supporte deux solutions d'analytics :

1. **Google Analytics 4 (GA4)** - Solution complète et gratuite de Google
2. **Plausible Analytics** - Alternative respectueuse de la vie privée (RGPD compliant)

Vous pouvez utiliser l'une ou les deux solutions simultanément.

## Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# Analytics - Google Analytics 4 (optionnel)
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX

# Analytics - Plausible (optionnel)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=facturly.app

# Autres variables d'environnement existantes
NEXT_PUBLIC_API_URL=https://facturlybackend-production.up.railway.app
NEXT_PUBLIC_SITE_URL=https://facturly.app
```

**Note** : Les variables d'environnement pour les analytics sont optionnelles. Si elles ne sont pas définies, les analytics ne seront tout simplement pas chargés.

## Configuration

### Google Analytics 4

1. **Créer un compte GA4** :
   - Allez sur [Google Analytics](https://analytics.google.com/)
   - Créez un compte et une propriété
   - Récupérez votre **Measurement ID** (format : `G-XXXXXXXXXX`)

2. **Configurer la variable d'environnement** :
   - Ajoutez dans votre fichier `.env.local` :
   ```env
   NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
   ```

3. **Redémarrer le serveur de développement** :
   ```bash
   pnpm dev
   ```

### Plausible Analytics

1. **Créer un compte Plausible** :
   - Allez sur [Plausible.io](https://plausible.io/)
   - Créez un compte et ajoutez votre domaine
   - Récupérez votre **domaine** (ex: `facturly.app`)

2. **Configurer la variable d'environnement** :
   - Ajoutez dans votre fichier `.env.local` :
   ```env
   NEXT_PUBLIC_PLAUSIBLE_DOMAIN=facturly.app
   ```

3. **Redémarrer le serveur de développement** :
   ```bash
   pnpm dev
   ```

## Utilisation dans le code

### Tracker des événements personnalisés

Utilisez le hook `useAnalytics` pour tracker des événements :

```tsx
import { useAnalytics } from "@/components/analytics/Analytics";

function MyComponent() {
  const { trackEvent } = useAnalytics();

  const handleButtonClick = () => {
    trackEvent("button_click", {
      button_name: "signup",
      location: "hero_section",
    });
  };

  return <button onClick={handleButtonClick}>S'inscrire</button>;
}
```

### Événements recommandés à tracker

- **Inscription** : `signup` avec `method` (email, google, etc.)
- **Connexion** : `login` avec `method`
- **Création de facture** : `invoice_created` avec `amount`, `currency`
- **Envoi de facture** : `invoice_sent` avec `method` (email, etc.)
- **Paiement reçu** : `payment_received` avec `amount`, `currency`
- **Changement de plan** : `plan_changed` avec `plan_name`, `billing_interval`
- **Clic CTA** : `cta_click` avec `location`, `text`

### Exemples d'implémentation

#### Tracker l'inscription

```tsx
// Dans votre composant d'inscription
const { trackEvent } = useAnalytics();

const handleSignup = async (data) => {
  try {
    await signup(data);
    trackEvent("signup", {
      method: "email",
      plan: "free",
    });
  } catch (error) {
    trackEvent("signup_error", {
      error: error.message,
    });
  }
};
```

#### Tracker la création de facture

```tsx
// Dans votre composant de création de facture
const { trackEvent } = useAnalytics();

const handleCreateInvoice = async (invoiceData) => {
  try {
    const invoice = await createInvoice(invoiceData);
    trackEvent("invoice_created", {
      amount: invoice.totalAmount,
      currency: invoice.currency,
      item_count: invoice.items.length,
    });
  } catch (error) {
    trackEvent("invoice_creation_error", {
      error: error.message,
    });
  }
};
```

#### Tracker les clics sur les CTA

```tsx
// Dans vos composants CTA
const { trackEvent } = useAnalytics();

<button
  onClick={() => {
    trackEvent("cta_click", {
      location: "hero_section",
      text: "Commencer gratuitement",
      destination: "/register",
    });
    router.push("/register");
  }}
>
  Commencer gratuitement
</button>
```

## Données trackées automatiquement

Les analytics trackent automatiquement :

- **Page views** : Toutes les navigations entre pages
- **Temps sur la page** : Temps passé sur chaque page
- **Source de trafic** : D'où viennent vos visiteurs
- **Appareil et navigateur** : Type d'appareil, navigateur, OS
- **Géolocalisation** : Pays et ville (niveau ville pour GA4 uniquement)

## Respect de la vie privée

### Google Analytics 4

- GA4 respecte le RGPD avec le consentement utilisateur
- Vous pouvez désactiver la collecte de données personnelles dans les paramètres GA4
- Considérez ajouter un banner de consentement cookies

### Plausible Analytics

- **100% RGPD compliant** par défaut
- Pas de cookies, pas de données personnelles collectées
- Données agrégées uniquement
- Open source et auto-hébergeable

## Dépannage

### Les analytics ne fonctionnent pas

1. Vérifiez que les variables d'environnement sont bien définies :
   ```bash
   echo $NEXT_PUBLIC_GA4_ID
   echo $NEXT_PUBLIC_PLAUSIBLE_DOMAIN
   ```

2. Vérifiez la console du navigateur pour les erreurs

3. Utilisez les outils de développement :
   - **GA4** : Extension Chrome "Google Analytics Debugger"
   - **Plausible** : Vérifiez le dashboard Plausible en temps réel

### Tester en local

Les analytics fonctionnent aussi en local. Pour GA4, vous verrez les événements dans le dashboard avec le hostname `localhost`.

## Recommandations

1. **Commencez avec GA4** si vous voulez des données détaillées
2. **Ajoutez Plausible** si vous voulez une alternative respectueuse de la vie privée
3. **Trackez les événements importants** : conversions, erreurs, actions utilisateur
4. **Ne trackez pas de données sensibles** : pas d'emails, noms, informations financières dans les événements

