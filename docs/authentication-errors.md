# Gestion des erreurs d'authentification

Ce document décrit le système de gestion des erreurs d'authentification de l'API Facturly, incluant les codes d'erreur spécifiques qui permettent au frontend de détecter automatiquement les problèmes d'authentification et de déconnecter l'utilisateur si nécessaire.

## Vue d'ensemble

L'API retourne des codes d'erreur spécifiques pour chaque type d'erreur d'authentification. Ces codes permettent au frontend de :
- Détecter automatiquement les problèmes d'authentification
- Déconnecter l'utilisateur lorsque nécessaire
- Afficher des messages d'erreur appropriés
- Gérer la reconnexion automatique si applicable

## Format des réponses d'erreur

Toutes les erreurs d'authentification suivent le format standard suivant :

```json
{
  "statusCode": 401,
  "message": "Message d'erreur en français",
  "code": "CODE_D_ERREUR"
}
```

### Propriétés

- **statusCode** : Code HTTP (toujours `401` pour les erreurs d'authentification)
- **message** : Message d'erreur descriptif en français
- **code** : Code d'erreur unique permettant l'identification du type d'erreur

## Codes d'erreur disponibles

### `AUTH_TOKEN_EXPIRED`

**Quand** : Le token JWT a expiré (dépassé sa date d'expiration)

**Réponse** :
```json
{
  "statusCode": 401,
  "message": "Token expiré",
  "code": "AUTH_TOKEN_EXPIRED"
}
```

**Action frontend recommandée** : Déconnecter l'utilisateur et rediriger vers la page de connexion

---

### `AUTH_TOKEN_INVALID`

**Quand** : Le token JWT est invalide (malformé, signature invalide, etc.)

**Réponse** :
```json
{
  "statusCode": 401,
  "message": "Token invalide",
  "code": "AUTH_TOKEN_INVALID"
}
```

**Action frontend recommandée** : Déconnecter l'utilisateur, supprimer le token du stockage local, et rediriger vers la page de connexion

---

### `AUTH_TOKEN_MISSING`

**Quand** : Aucun token n'est fourni dans l'en-tête `Authorization`

**Réponse** :
```json
{
  "statusCode": 401,
  "message": "Token manquant",
  "code": "AUTH_TOKEN_MISSING"
}
```

**Action frontend recommandée** : Rediriger vers la page de connexion

---

### `AUTH_UNAUTHORIZED`

**Quand** : 
- Identifiants invalides lors de la connexion
- Utilisateur non authentifié
- Autre erreur d'authentification non spécifique

**Réponse** :
```json
{
  "statusCode": 401,
  "message": "Identifiants invalides",
  "code": "AUTH_UNAUTHORIZED"
}
```

ou

```json
{
  "statusCode": 401,
  "message": "Non autorisé",
  "code": "AUTH_UNAUTHORIZED"
}
```

**Action frontend recommandée** : 
- Si lors du login : Afficher un message d'erreur
- Si lors d'une requête API : Déconnecter l'utilisateur et rediriger vers la page de connexion

---

### `AUTH_USER_NOT_FOUND`

**Quand** : L'utilisateur existe mais n'a pas d'entreprise associée

**Réponse** :
```json
{
  "statusCode": 401,
  "message": "Aucune entreprise trouvée pour cet utilisateur",
  "code": "AUTH_USER_NOT_FOUND"
}
```

**Action frontend recommandée** : Rediriger vers une page de création d'entreprise ou afficher un message d'erreur approprié

---

## Codes d'erreur autres (non authentification)

### `CONFLICT_EMAIL_EXISTS`

**Quand** : Tentative d'inscription avec un email déjà utilisé

**Réponse** :
```json
{
  "statusCode": 409,
  "message": "Cet email est déjà utilisé",
  "code": "CONFLICT_EMAIL_EXISTS"
}
```

**Action frontend recommandée** : Afficher un message d'erreur indiquant que l'email est déjà utilisé

---

## Intégration frontend

### RTK Query (Recommandé pour ce projet)

Le projet Facturly utilise **RTK Query** avec `fetchBaseQuery`. Voici comment implémenter la gestion des erreurs d'authentification :

```typescript
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

// Fonction pour nettoyer les cookies et rediriger
function logoutAndRedirect() {
  if (typeof window !== 'undefined') {
    // Supprimer les cookies
    document.cookie = 'facturly_access_token=; path=/; max-age=0';
    document.cookie = 'facturly_refresh_token=; path=/; max-age=0';
    
    // Rediriger vers la page de connexion
    window.location.href = '/login';
  }
}

// Base query avec gestion des erreurs d'authentification
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.facturly.com',
  prepareHeaders: (headers) => {
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split('; ');
      const tokenCookie = cookies.find((cookie) => 
        cookie.startsWith('facturly_access_token=')
      );
      if (tokenCookie) {
        const token = tokenCookie.split('=')[1];
        headers.set('authorization', `Bearer ${token}`);
      }
    }
    return headers;
  },
});

// Base query avec intercepteur d'erreurs
const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  
  // Vérifier les erreurs d'authentification
  if (result.error && result.error.status === 401) {
    const errorData = result.error.data as { code?: string; message?: string };
    const errorCode = errorData?.code;
    
    // Codes qui nécessitent une déconnexion
    const logoutCodes = [
      'AUTH_TOKEN_EXPIRED',
      'AUTH_TOKEN_INVALID',
      'AUTH_TOKEN_MISSING',
      'AUTH_UNAUTHORIZED',
    ];
    
    if (errorCode && logoutCodes.includes(errorCode)) {
      // Nettoyer et rediriger
      logoutAndRedirect();
    }
  }
  
  return result;
};

// Utilisation dans createApi
export const facturlyApi = createApi({
  reducerPath: 'facturlyApi',
  baseQuery: baseQueryWithAuth,
  // ... reste de la configuration
});
```

### Intercepteur HTTP (Axios) - Alternative

Si vous utilisez Axios dans un autre projet :

```typescript
import axios from 'axios';

// Créer une instance axios
const apiClient = axios.create({
  baseURL: 'https://api.facturly.com',
});

// Intercepteur de réponse pour gérer les erreurs d'authentification
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorCode = error.response.data?.code;
      
      // Codes qui nécessitent une déconnexion
      const logoutCodes = [
        'AUTH_TOKEN_EXPIRED',
        'AUTH_TOKEN_INVALID',
        'AUTH_TOKEN_MISSING',
        'AUTH_UNAUTHORIZED',
      ];
      
      if (logoutCodes.includes(errorCode)) {
        // Supprimer le token du stockage
        document.cookie = 'facturly_access_token=; path=/; max-age=0';
        document.cookie = 'facturly_refresh_token=; path=/; max-age=0';
        
        // Rediriger vers la page de connexion
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);
```

### Intercepteur Fetch API

```typescript
// Wrapper pour fetch avec gestion des erreurs d'authentification
async function apiFetch(url: string, options: RequestInit = {}) {
  const token = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('facturly_access_token='))
    ?.split('=')[1];
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    const errorData = await response.json();
    const errorCode = errorData?.code;
    
    const logoutCodes = [
      'AUTH_TOKEN_EXPIRED',
      'AUTH_TOKEN_INVALID',
      'AUTH_TOKEN_MISSING',
      'AUTH_UNAUTHORIZED',
    ];
    
    if (logoutCodes.includes(errorCode)) {
      // Nettoyer le stockage
      document.cookie = 'facturly_access_token=; path=/; max-age=0';
      document.cookie = 'facturly_refresh_token=; path=/; max-age=0';
      
      // Rediriger vers la page de connexion
      window.location.href = '/login';
      
      throw new Error(errorData.message);
    }
  }
  
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  
  return response.json();
}
```

---

## Gestion des erreurs dans les formulaires

### Exemple : Formulaire de connexion avec RTK Query

```typescript
import { useLoginMutation } from '@/services/facturlyApi';
import { toast } from 'sonner';

function LoginForm() {
  const [login, { isLoading, error }] = useLoginMutation();
  const router = useRouter();
  
  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      const result = await login(values).unwrap();
      
      // Stocker le token dans le cookie
      if (typeof window !== 'undefined') {
        document.cookie = `facturly_access_token=${result.accessToken}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
      }
      
      // Rediriger vers le dashboard
      router.push('/dashboard');
    } catch (err: any) {
      // RTK Query retourne l'erreur dans error.data
      const errorData = err?.data || err;
      const errorCode = errorData?.code;
      const message = errorData?.message || 'Une erreur est survenue';
      
      if (errorCode === 'AUTH_UNAUTHORIZED') {
        toast.error('Identifiants incorrects', {
          description: message,
        });
      } else if (errorCode === 'CONFLICT_EMAIL_EXISTS') {
        toast.error('Email déjà utilisé', {
          description: message,
        });
      } else {
        toast.error('Erreur de connexion', {
          description: message,
        });
      }
    }
  };
  
  return (
    // ... formulaire
  );
}
```

### Exemple : Formulaire d'inscription avec RTK Query

```typescript
import { useRegisterMutation } from '@/services/facturlyApi';
import { toast } from 'sonner';

function RegisterForm() {
  const [register, { isLoading, error }] = useRegisterMutation();
  const router = useRouter();
  
  const handleSubmit = async (values: RegisterFormValues) => {
    try {
      const result = await register(values).unwrap();
      
      // Stocker le token dans le cookie
      if (typeof window !== 'undefined') {
        document.cookie = `facturly_access_token=${result.accessToken}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
      }
      
      toast.success('Inscription réussie', {
        description: 'Votre compte a été créé avec succès !',
      });
      
      // Rediriger vers le dashboard
      router.push('/dashboard');
    } catch (err: any) {
      const errorData = err?.data || err;
      const errorCode = errorData?.code;
      const message = errorData?.message || 'Une erreur est survenue';
      
      if (errorCode === 'CONFLICT_EMAIL_EXISTS') {
        toast.error('Email déjà utilisé', {
          description: 'Cet email est déjà associé à un compte. Veuillez vous connecter.',
        });
      } else {
        toast.error('Erreur d\'inscription', {
          description: message,
        });
      }
    }
  };
  
  return (
    // ... formulaire
  );
}
```

---

## Bonnes pratiques

### 1. Détection automatique

Toujours vérifier le code d'erreur plutôt que seulement le message, car les messages peuvent changer mais les codes restent stables.

```typescript
// ✅ Bon
if (errorCode === 'AUTH_TOKEN_EXPIRED') {
  // Déconnecter
}

// ❌ Éviter
if (message.includes('expiré')) {
  // Déconnecter
}
```

### 2. Nettoyage du stockage

Lors de la déconnexion, nettoyer tous les tokens et données utilisateur :

```typescript
function logout() {
  // Supprimer les cookies
  if (typeof window !== 'undefined') {
    document.cookie = 'facturly_access_token=; path=/; max-age=0';
    document.cookie = 'facturly_refresh_token=; path=/; max-age=0';
  }
  
  // Vider le cache RTK Query si nécessaire
  // store.dispatch(facturlyApi.util.resetApiState());
  
  // Rediriger
  window.location.href = '/login';
}
```

### 3. Gestion des requêtes en cours

RTK Query gère automatiquement l'annulation des requêtes lors de la déconnexion grâce au cache.

### 4. Messages utilisateur

Afficher des messages clairs à l'utilisateur :

```typescript
const errorMessages: Record<string, string> = {
  AUTH_TOKEN_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter.',
  AUTH_TOKEN_INVALID: 'Session invalide. Veuillez vous reconnecter.',
  AUTH_TOKEN_MISSING: 'Vous devez être connecté pour accéder à cette page.',
  AUTH_UNAUTHORIZED: 'Identifiants incorrects. Veuillez réessayer.',
  CONFLICT_EMAIL_EXISTS: 'Cet email est déjà utilisé.',
};

function getErrorMessage(code: string): string {
  return errorMessages[code] || 'Une erreur est survenue';
}
```

### 5. Gestion dans les hooks RTK Query

```typescript
import { useGetMeQuery } from '@/services/facturlyApi';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function useAuth() {
  const router = useRouter();
  const { data: user, error } = useGetMeQuery();
  
  useEffect(() => {
    if (error && 'status' in error && error.status === 401) {
      const errorData = error.data as { code?: string };
      const logoutCodes = [
        'AUTH_TOKEN_EXPIRED',
        'AUTH_TOKEN_INVALID',
        'AUTH_TOKEN_MISSING',
        'AUTH_UNAUTHORIZED',
      ];
      
      if (errorData?.code && logoutCodes.includes(errorData.code)) {
        // Nettoyer et rediriger
        document.cookie = 'facturly_access_token=; path=/; max-age=0';
        router.push('/login');
      }
    }
  }, [error, router]);
  
  return { user, isAuthenticated: !!user };
}
```

---

## Tests

### Test unitaire (Jest) pour RTK Query

```typescript
import { facturlyApi } from './services/facturlyApi';
import { store } from './lib/redux/store';

describe('Authentication Error Handling', () => {
  it('should logout user on token expired', async () => {
    // Mock une réponse avec token expiré
    const mockError = {
      status: 401,
      data: {
        statusCode: 401,
        message: 'Token expiré',
        code: 'AUTH_TOKEN_EXPIRED',
      },
    };
    
    // Simuler une erreur dans RTK Query
    const result = await store.dispatch(
      facturlyApi.endpoints.getMe.initiate(undefined)
    );
    
    if ('error' in result) {
      expect(result.error.status).toBe(401);
      expect(result.error.data.code).toBe('AUTH_TOKEN_EXPIRED');
    }
  });
});
```

---

## Résumé des codes d'erreur

| Code | Status | Message | Action recommandée |
|------|--------|---------|-------------------|
| `AUTH_TOKEN_EXPIRED` | 401 | Token expiré | Déconnecter et rediriger |
| `AUTH_TOKEN_INVALID` | 401 | Token invalide | Déconnecter et rediriger |
| `AUTH_TOKEN_MISSING` | 401 | Token manquant | Rediriger vers login |
| `AUTH_UNAUTHORIZED` | 401 | Non autorisé | Déconnecter si API, afficher erreur si login |
| `AUTH_USER_NOT_FOUND` | 401 | Aucune entreprise trouvée | Rediriger vers création entreprise |
| `CONFLICT_EMAIL_EXISTS` | 409 | Email déjà utilisé | Afficher erreur dans formulaire |

---

## Implémentation recommandée pour Facturly

Pour implémenter cette gestion d'erreur dans le projet Facturly actuel, modifiez `services/facturlyApi.ts` :

```typescript
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

// Base query standard
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers) => {
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split('; ');
      const tokenCookie = cookies.find((cookie) => 
        cookie.startsWith('facturly_access_token=')
      );
      if (tokenCookie) {
        const token = tokenCookie.split('=')[1];
        headers.set('authorization', `Bearer ${token}`);
      }
    }
    return headers;
  },
});

// Base query avec gestion des erreurs d'authentification
const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  
  // Gérer les erreurs d'authentification
  if (result.error && result.error.status === 401) {
    const errorData = result.error.data as { code?: string; message?: string };
    const errorCode = errorData?.code;
    
    const logoutCodes = [
      'AUTH_TOKEN_EXPIRED',
      'AUTH_TOKEN_INVALID',
      'AUTH_TOKEN_MISSING',
      'AUTH_UNAUTHORIZED',
    ];
    
    if (errorCode && logoutCodes.includes(errorCode)) {
      // Nettoyer les cookies
      if (typeof window !== 'undefined') {
        document.cookie = 'facturly_access_token=; path=/; max-age=0';
        document.cookie = 'facturly_refresh_token=; path=/; max-age=0';
        
        // Rediriger vers la page de connexion
        window.location.href = '/login';
      }
    }
  }
  
  return result;
};

export const facturlyApi = createApi({
  reducerPath: 'facturlyApi',
  baseQuery: baseQueryWithAuth, // Utiliser baseQueryWithAuth au lieu de baseQuery
  // ... reste de la configuration
});
```

---

## Support

Pour toute question ou problème concernant la gestion des erreurs d'authentification, consultez la documentation de l'API ou contactez l'équipe de développement.
