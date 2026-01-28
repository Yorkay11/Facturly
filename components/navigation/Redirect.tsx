"use client";

import { useEffect, ReactNode, useMemo } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { RedirectLoader } from './RedirectLoader';

export interface RedirectProps {
  /**
   * URL de destination (relative ou absolue)
   */
  to: string;
  
  /**
   * Type de redirection
   * - 'push': Ajoute une nouvelle entrée dans l'historique (défaut)
   * - 'replace': Remplace l'entrée actuelle dans l'historique
   * - 'external': Redirection vers une URL externe
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
   * Condition pour effectuer la redirection
   * @default true
   */
  condition?: boolean;
  
  /**
   * Callback appelé avant la redirection
   */
  onBeforeRedirect?: () => void | Promise<void>;
  
  /**
   * Callback appelé après la redirection
   */
  onAfterRedirect?: () => void;
  
  /**
   * Contenu à afficher pendant la redirection (optionnel)
   */
  children?: ReactNode;
  
  /**
   * Si true, affiche un loader pendant la redirection
   * @default false
   */
  showLoader?: boolean;
  
  /**
   * Texte à afficher dans le loader (si showLoader est true)
   * Si non spécifié, sera déterminé automatiquement selon le contexte
   */
  loaderText?: string;
  
  /**
   * Type de redirection pour déterminer le texte automatiquement
   */
  loaderType?: 'redirect' | 'loading' | 'saving' | 'processing';
  
  /**
   * Couleur de fond du loader
   * @default "#ffffff"
   */
  loaderBackgroundColor?: string;
  
  /**
   * Couleur de la fusée et du texte du loader
   * @default "hsl(var(--primary))"
   */
  loaderColor?: string;
}

/**
 * Composant de redirection réutilisable
 * 
 * @example
 * // Redirection simple
 * <Redirect to="/dashboard" />
 * 
 * @example
 * // Redirection avec condition
 * <Redirect 
 *   to="/login" 
 *   condition={!isAuthenticated}
 *   type="replace"
 * />
 * 
 * @example
 * // Redirection externe
 * <Redirect 
 *   to="https://example.com" 
 *   type="external"
 * />
 * 
 * @example
 * // Redirection avec callback
 * <Redirect 
 *   to="/dashboard"
 *   onBeforeRedirect={async () => {
 *     await saveData();
 *   }}
 *   onAfterRedirect={() => {
 *     toast.success('Redirection réussie');
 *   }}
 * />
 */
export function Redirect({
  to,
  type = 'push',
  checkUnsavedChanges = true,
  delay = 0,
  condition = true,
  onBeforeRedirect,
  onAfterRedirect,
  children,
  showLoader = false,
  loaderText,
  loaderType = 'redirect',
  loaderBackgroundColor = "#ffffff",
  loaderColor = "hsl(var(--primary))",
}: RedirectProps) {
  const router = useRouter();
  const t = useTranslations('common');
  
  // Déterminer le texte automatiquement selon le contexte
  const displayText = useMemo(() => {
    if (loaderText) return loaderText;
    
    switch (loaderType) {
      case 'loading':
        return t('loading') || 'Chargement...';
      case 'saving':
        return t('saving') || 'Enregistrement...';
      case 'processing':
        return t('processing') || 'Traitement...';
      case 'redirect':
      default:
        return t('redirecting') || 'Redirection...';
    }
  }, [loaderText, loaderType, t]);
  
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

  useEffect(() => {
    if (!condition) return;

    const performRedirect = async () => {
      // Appeler le callback avant la redirection
      if (onBeforeRedirect) {
        await onBeforeRedirect();
      }

      // Attendre le délai si spécifié
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Effectuer la redirection
      if (type === 'external') {
        // Redirection externe
        window.location.href = to;
      } else if (type === 'replace') {
        // Remplacement de l'historique
        if (checkUnsavedChanges && handleNavigation) {
          // Utiliser handleNavigation pour vérifier les modifications non sauvegardées
          handleNavigation(to);
        } else {
          router.replace(to);
        }
      } else {
        // Navigation normale (push)
        if (checkUnsavedChanges && handleNavigation) {
          // Utiliser handleNavigation pour vérifier les modifications non sauvegardées
          handleNavigation(to);
        } else {
          router.push(to);
        }
      }

      // Appeler le callback après la redirection
      if (onAfterRedirect) {
        onAfterRedirect();
      }
    };

    performRedirect();
  }, [
    to,
    type,
    condition,
    delay,
    checkUnsavedChanges,
    router,
    handleNavigation,
    onBeforeRedirect,
    onAfterRedirect,
  ]);

  // Afficher le loader ou le contenu personnalisé
  if (showLoader) {
    return (
      <RedirectLoader
        text={displayText}
        backgroundColor={loaderBackgroundColor}
        color={loaderColor}
      >
        {children}
      </RedirectLoader>
    );
  }

  return <>{children}</>;
}
