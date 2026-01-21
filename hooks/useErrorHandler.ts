import { useCallback } from 'react';
import { toast } from 'sonner';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { formatErrorMessage } from '../utils/errorMessages';
import { useTranslations } from 'next-intl';

/**
 * Hook pour gérer les erreurs de manière uniforme dans toute l'application
 * Affiche des messages d'erreur explicites et actionnables avec possibilité de réessayer
 */
export function useErrorHandler() {
  const t = useTranslations('common');

  /**
   * Affiche une erreur avec un toast actionnable
   * @param error - L'erreur à afficher
   * @param fallbackMessage - Message par défaut si l'erreur ne peut pas être formatée
   * @param onRetry - Fonction appelée si l'utilisateur clique sur "Réessayer"
   */
  const handleError = useCallback(
    (
      error: FetchBaseQueryError | unknown,
      fallbackMessage?: string,
      onRetry?: () => void | Promise<void>
    ) => {
      const formattedError = formatErrorMessage(
        error,
        fallbackMessage || 'Une erreur est survenue. Veuillez réessayer.'
      );

      // Si l'erreur est actionnable et qu'on a une fonction de retry, afficher avec actions
      if (formattedError.actionnable && onRetry) {
        toast.error(formattedError.title, {
          description: formattedError.description,
          action: {
            label: t('retry'),
            onClick: async () => {
              try {
                await onRetry();
              } catch (retryError) {
                // Si le retry échoue aussi, afficher à nouveau l'erreur
                handleError(retryError, fallbackMessage, onRetry);
              }
            },
          },
          cancel: {
            label: t('dismiss'),
            onClick: () => {
              // Fermer le toast
            },
          },
          duration: 10000, // Garder le toast visible 10 secondes pour permettre à l'utilisateur de lire et agir
        });
      } else {
        // Erreur non actionnable ou pas de fonction de retry, afficher simple
        toast.error(formattedError.title, {
          description: formattedError.description,
          duration: 5000,
        });
      }
    },
    [t]
  );

  return { handleError };
}
