"use client";

import { useEffect, useState } from "react";
import { GlobalLoader } from "@/components/ui/global-loader";
import { useLoading } from "@/contexts/LoadingContext";
import { usePathname } from '@/i18n/routing';

export function GlobalLoadingHandler() {
  const { isLoading, loadingMessage, setLoading } = useLoading();
  const pathname = usePathname();
  const [hasShownLoader, setHasShownLoader] = useState(false);
  
  // Utiliser un overlay blanc sur la landing page uniquement
  // Le pathname avec next-intl retourne le chemin sans la locale (ex: '/' pour la landing)
  const isLandingPage = pathname === '/';

  // Simuler le chargement initial de l'application
  useEffect(() => {
    // Afficher le loader sur toutes les pages, y compris la landing
    setLoading(true);
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500); // Durée pour voir les étapes du loader
    
    return () => clearTimeout(timer);
  }, [setLoading]);

  // Masquer le loader initial HTML et prendre le relais avec le loader React
  useEffect(() => {
    // Masquer le loader initial HTML s'il existe encore
    const initialLoader = document.getElementById('initial-loader');
    if (initialLoader) {
      initialLoader.style.opacity = '0';
      setTimeout(() => {
        initialLoader.style.display = 'none';
      }, 300);
    }

    // Vérifier si c'est un rechargement complet (pas une navigation côté client)
    const navigationType = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const isPageReload = navigationType?.type === 'reload' || 
                         (typeof window !== 'undefined' && window.performance.navigation?.type === 1);
    
    // Vérifier si on vient d'un rechargement complet en utilisant sessionStorage
    const wasReloaded = sessionStorage.getItem('facturly-page-reload') === 'true';
    
    // Si c'est un rechargement complet et qu'on n'a pas encore affiché le loader React
    if ((isPageReload || wasReloaded) && !hasShownLoader) {
      // Le loader initial HTML est déjà affiché, on synchronise juste le timing
      setHasShownLoader(true);
      sessionStorage.removeItem('facturly-page-reload');
    } else {
      // Marquer qu'on a déjà affiché le loader pour cette session
      setHasShownLoader(true);
    }
  }, [hasShownLoader]);

  // Marquer qu'un rechargement va avoir lieu avant le rechargement
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem('facturly-page-reload', 'true');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return <GlobalLoader isLoading={isLoading} message={loadingMessage || undefined} whiteOverlay={isLandingPage} />;
}

