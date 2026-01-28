"use client";

import { useCallback } from 'react';
import { useRouter } from '@/i18n/routing';

interface UseRedirectOptions {
  /**
   * Type de redirection
   * @default 'push'
   */
  type?: 'push' | 'replace' | 'external';
  
  /**
   * Si true, vérifie les modifications non sauvegardées avant de rediriger
   * Nécessite NavigationBlockProvider dans l'arbre de composants
   * @default true
   */
  checkUnsavedChanges?: boolean;
  
  /**
   * Délai avant la redirection (en millisecondes)
   * @default 0
   */
  delay?: number;
  
  /**
   * Callback appelé avant la redirection
   */
  onBeforeRedirect?: () => void | Promise<void>;
  
  /**
   * Callback appelé après la redirection
   */
  onAfterRedirect?: () => void;
}

interface RedirectFunction {
  (to: string, options?: UseRedirectOptions): Promise<void>;
}

/**
 * Hook pour effectuer des redirections programmatiques
 * 
 * @example
 * const redirect = useRedirect();
 * 
 * // Redirection simple
 * redirect('/dashboard');
 * 
 * @example
 * // Redirection avec options
 * redirect('/login', {
 *   type: 'replace',
 *   checkUnsavedChanges: false,
 *   delay: 1000,
 *   onBeforeRedirect: async () => {
 *     await logout();
 *   }
 * });
 * 
 * @example
 * // Redirection externe
 * redirect('https://example.com', { type: 'external' });
 */
export function useRedirect(options?: UseRedirectOptions): RedirectFunction {
  const router = useRouter();
  
  // Essayer d'obtenir handleNavigation du contexte si disponible
  let handleNavigation: ((url: string) => void) | null = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useNavigationBlock } = require('@/contexts/NavigationBlockContext');
    const navContext = useNavigationBlock();
    handleNavigation = navContext.handleNavigation;
  } catch {
    // Le contexte n'est pas disponible (page publique), utiliser router directement
    handleNavigation = null;
  }

  const defaultOptions: UseRedirectOptions = {
    type: 'push',
    checkUnsavedChanges: true,
    delay: 0,
    ...options,
  };

  const redirect: RedirectFunction = useCallback(
    async (to: string, overrideOptions?: UseRedirectOptions) => {
      const finalOptions = { ...defaultOptions, ...overrideOptions };

      // Appeler le callback avant la redirection
      if (finalOptions.onBeforeRedirect) {
        await finalOptions.onBeforeRedirect();
      }

      // Attendre le délai si spécifié
      if (finalOptions.delay && finalOptions.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, finalOptions.delay));
      }

      // Effectuer la redirection
      if (finalOptions.type === 'external') {
        // Redirection externe
        window.location.href = to;
      } else if (finalOptions.type === 'replace') {
        // Remplacement de l'historique
        if (finalOptions.checkUnsavedChanges && handleNavigation) {
          handleNavigation(to);
        } else {
          router.replace(to);
        }
      } else {
        // Navigation normale (push)
        if (finalOptions.checkUnsavedChanges && handleNavigation) {
          handleNavigation(to);
        } else {
          router.push(to);
        }
      }

      // Appeler le callback après la redirection
      if (finalOptions.onAfterRedirect) {
        finalOptions.onAfterRedirect();
      }
    },
    [router, handleNavigation, defaultOptions]
  );

  return redirect;
}

/**
 * Hook pour créer une fonction de redirection avec des options par défaut
 * 
 * @example
 * const redirectToLogin = useRedirectTo('/login', { type: 'replace' });
 * redirectToLogin(); // Redirige vers /login avec replace
 */
export function useRedirectTo(
  defaultPath: string,
  defaultOptions?: UseRedirectOptions
): () => Promise<void> {
  const redirect = useRedirect(defaultOptions);

  return useCallback(() => {
    return redirect(defaultPath);
  }, [redirect, defaultPath]);
}
