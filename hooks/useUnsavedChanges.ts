"use client";

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface UseUnsavedChangesOptions {
  hasUnsavedChanges: boolean;
  onSave?: () => Promise<void> | void;
  onDiscard?: () => void;
  enabled?: boolean;
}

/**
 * Hook pour détecter les tentatives de navigation lorsque des modifications non sauvegardées existent
 */
export function useUnsavedChanges({
  hasUnsavedChanges,
  onSave,
  onDiscard,
  enabled = true,
}: UseUnsavedChangesOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const isNavigatingRef = useRef(false);
  const pendingNavigationRef = useRef<string | null>(null);

  // Détecter la fermeture de page/onglet
  useEffect(() => {
    if (!enabled || !hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // La plupart des navigateurs modernes ignorent le message personnalisé
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, hasUnsavedChanges]);

  // Intercepter les navigations Next.js
  useEffect(() => {
    if (!enabled || !hasUnsavedChanges) return;

    const handleRouteChange = (url: string) => {
      if (isNavigatingRef.current) {
        // Si on a déjà autorisé la navigation, ne pas bloquer
        return;
      }

      // Si c'est la même route, ne pas bloquer
      if (url === pathname) {
        return;
      }

      // Bloquer la navigation et stocker la destination
      pendingNavigationRef.current = url;
      
      // L'événement sera géré par le composant parent via le callback
    };

    // Note: Next.js 13+ n'expose pas directement un événement de navigation
    // On devra utiliser une approche différente avec un état partagé
  }, [enabled, hasUnsavedChanges, pathname]);

  const allowNavigation = (url: string, shouldSave: boolean) => {
    isNavigatingRef.current = true;
    
    if (shouldSave && onSave) {
      const saveResult = onSave();
      Promise.resolve(saveResult).then(() => {
        if (onDiscard) {
          onDiscard();
        }
        router.push(url);
      }).catch(() => {
        isNavigatingRef.current = false;
      });
    } else {
      if (onDiscard) {
        onDiscard();
      }
      router.push(url);
    }
  };

  return {
    allowNavigation,
    pendingNavigation: pendingNavigationRef.current,
  };
}

