import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

/**
 * Type d'erreur API
 */
export interface ApiErrorData {
  code?: string;
  message?: string;
  details?: Record<string, unknown>;
}

/**
 * Formate un message d'erreur de manière explicite et actionnable
 */
export function formatErrorMessage(
  error: FetchBaseQueryError | unknown,
  fallbackMessage: string = 'Une erreur est survenue. Veuillez réessayer.'
): { title: string; description: string; actionnable: boolean } {
  // Gérer les erreurs réseau
  if (error && typeof error === 'object' && 'status' in error) {
    const fetchError = error as FetchBaseQueryError;
    
    // Erreur réseau (pas de réponse du serveur)
    if (fetchError.status === 'FETCH_ERROR') {
      return {
        title: 'Erreur de connexion',
        description: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.',
        actionnable: true, // L'utilisateur peut réessayer
      };
    }
    
    // Erreur de parsing
    if (fetchError.status === 'PARSING_ERROR') {
      return {
        title: 'Erreur de format',
        description: 'La réponse du serveur n\'est pas au format attendu. Veuillez réessayer.',
        actionnable: true,
      };
    }
    
    // Erreurs HTTP
    if (typeof fetchError.status === 'number') {
      const errorData = fetchError.data as ApiErrorData | undefined;
      const errorMessage = errorData?.message || fallbackMessage;
      const errorCode = errorData?.code;
      
      // Erreurs serveur (5xx)
      if (fetchError.status >= 500 && fetchError.status < 600) {
        return {
          title: 'Erreur serveur',
          description: 'Le serveur rencontre un problème. Veuillez réessayer dans quelques instants.',
          actionnable: true,
        };
      }
      
      // Erreur 408 (Request Timeout)
      if (fetchError.status === 408) {
        return {
          title: 'Délai d\'attente dépassé',
          description: 'La requête a pris trop de temps. Veuillez réessayer.',
          actionnable: true,
        };
      }
      
      // Erreur 429 (Too Many Requests)
      if (fetchError.status === 429) {
        return {
          title: 'Trop de requêtes',
          description: 'Vous avez fait trop de requêtes. Veuillez patienter quelques instants avant de réessayer.',
          actionnable: false,
        };
      }
      
      // Erreur 400 (Bad Request)
      if (fetchError.status === 400) {
        // Messages d'erreur spécifiques selon le code
        const specificMessages: Record<string, { title: string; description: string; actionnable: boolean }> = {
          CONFLICT_EMAIL_EXISTS: {
            title: 'Email déjà utilisé',
            description: 'Cet email est déjà associé à un compte. Utilisez un autre email ou connectez-vous.',
            actionnable: true,
          },
          'errors.CLIENTS.EMAIL_EXISTS': {
            title: 'Client déjà existant',
            description: 'Un client avec cet email existe déjà pour ce workspace.',
            actionnable: true,
          },
        };
        
        if (errorCode && specificMessages[errorCode]) {
          return specificMessages[errorCode];
        }
        
        return {
          title: 'Requête invalide',
          description: errorMessage || 'Les données envoyées ne sont pas valides. Vérifiez votre saisie.',
          actionnable: true,
        };
      }
      
      // Erreur 404 (Not Found)
      if (fetchError.status === 404) {
        return {
          title: 'Ressource introuvable',
          description: 'La ressource demandée n\'existe pas ou a été supprimée.',
          actionnable: false,
        };
      }
      
      // Erreur 403 (Forbidden)
      if (fetchError.status === 403) {
        return {
          title: 'Accès refusé',
          description: errorMessage || 'Vous n\'avez pas les permissions nécessaires pour cette action.',
          actionnable: false,
        };
      }
      
      // Erreur 401 (Unauthorized) - gérée séparément dans baseQueryWithAuth
      if (fetchError.status === 401) {
        return {
          title: 'Non autorisé',
          description: errorMessage || 'Vous devez être connecté pour effectuer cette action.',
          actionnable: false,
        };
      }
    }
  }
  
  // Message par défaut
  return {
    title: 'Erreur',
    description: fallbackMessage,
    actionnable: true,
  };
}

/**
 * Détermine si une erreur peut être réessayée
 */
export function isRetryableError(error: FetchBaseQueryError | unknown): boolean {
  if (!error || typeof error !== 'object' || !('status' in error)) {
    return false;
  }
  
  const fetchError = error as FetchBaseQueryError;
  
  // Erreurs réseau
  if (fetchError.status === 'FETCH_ERROR' || fetchError.status === 'PARSING_ERROR') {
    return true;
  }
  
  // Erreurs serveur (5xx)
  if (typeof fetchError.status === 'number' && fetchError.status >= 500 && fetchError.status < 600) {
    return true;
  }
  
  // Erreur 408 (Request Timeout)
  if (fetchError.status === 408) {
    return true;
  }
  
  // Erreur 429 (Too Many Requests) - retryable après un délai
  if (fetchError.status === 429) {
    return true;
  }
  
  return false;
}
