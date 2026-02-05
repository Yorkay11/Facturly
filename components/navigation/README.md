# Composants de Navigation

Système de redirection réutilisable pour l'application Facturly.

## Composants

### `<Redirect />`

Composant de redirection déclarative.

```tsx
import { Redirect } from '@/components/navigation';

// Redirection simple
<Redirect to="/dashboard" />

// Redirection conditionnelle
<Redirect 
  to="/login" 
  condition={!isAuthenticated}
  type="replace"
/>

// Redirection externe
<Redirect 
  to="https://example.com" 
  type="external"
/>

// Redirection avec callbacks
<Redirect 
  to="/dashboard"
  delay={1000}
  onBeforeRedirect={async () => {
    await saveData();
  }}
  onAfterRedirect={() => {
    toast.success('Redirection réussie');
  }}
/>
```

### `<ConditionalRedirect />`

Composant de redirection conditionnelle avec fallback.

```tsx
import { ConditionalRedirect } from '@/components/navigation';

<ConditionalRedirect
  condition={!isAuthenticated}
  to="/login"
  fallback={<DashboardContent />}
/>
```

## Hooks

### `useRedirect()`

Hook pour effectuer des redirections programmatiques.

```tsx
import { useRedirect } from '@/hooks/useRedirect';

function MyComponent() {
  const redirect = useRedirect();

  const handleClick = () => {
    redirect('/dashboard', {
      type: 'push',
      checkUnsavedChanges: true,
      delay: 500,
      onBeforeRedirect: async () => {
        await saveData();
      }
    });
  };

  return <button onClick={handleClick}>Go to Dashboard</button>;
}
```

### `useRedirectTo()`

Hook pour créer une fonction de redirection pré-configurée.

```tsx
import { useRedirectTo } from '@/hooks/useRedirect';

function MyComponent() {
  const redirectToLogin = useRedirectTo('/login', { 
    type: 'replace',
    checkUnsavedChanges: false 
  });

  return <button onClick={redirectToLogin}>Login</button>;
}
```

## Options

### `type`
- `'push'` (défaut) : Ajoute une nouvelle entrée dans l'historique
- `'replace'` : Remplace l'entrée actuelle dans l'historique
- `'external'` : Redirection vers une URL externe

### `checkUnsavedChanges`
- `true` (défaut) : Vérifie les modifications non sauvegardées avant de rediriger
- `false` : Redirige immédiatement sans vérification

**Note** : Nécessite `NavigationBlockProvider` dans l'arbre de composants pour fonctionner.

### `delay`
Délai en millisecondes avant la redirection (défaut: 0).

### `condition`
Condition pour effectuer la redirection (défaut: true).

### `onBeforeRedirect`
Callback appelé avant la redirection (peut être async).

### `onAfterRedirect`
Callback appelé après la redirection.

## Intégration avec NavigationBlockContext

Les composants s'intègrent automatiquement avec `NavigationBlockContext` pour vérifier les modifications non sauvegardées. Si le contexte n'est pas disponible (par exemple sur les pages publiques), les composants utilisent directement le router.

## Exemples d'utilisation

### Redirection après authentification

```tsx
<ConditionalRedirect
  condition={isAuthenticated}
  to="/dashboard"
  fallback={<LoginForm />}
/>
```

### Redirection avec sauvegarde

```tsx
const redirect = useRedirect();

const handleSaveAndRedirect = async () => {
  await redirect('/invoices', {
    onBeforeRedirect: async () => {
      await saveInvoice();
    },
    onAfterRedirect: () => {
      toast.success('Facture sauvegardée');
    }
  });
};
```

### Redirection externe

```tsx
<Redirect 
  to="https://docs.facturly.online" 
  type="external"
  checkUnsavedChanges={false}
/>
```
