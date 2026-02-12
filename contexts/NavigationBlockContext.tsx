"use client";

import { createContext, useContext, useState, useRef, ReactNode, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

interface NavigationBlockContextType {
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  saveDraftRef: React.MutableRefObject<((skipRedirect?: boolean) => Promise<void>) | null>;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  handleNavigation: (url: string) => void;
  registerNavigateAwayCleanup: (fn: () => void) => void;
}

const NavigationBlockContext = createContext<NavigationBlockContextType | undefined>(undefined);

export function NavigationBlockProvider({ children }: { children: ReactNode }) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveDraftRef = useRef<((skipRedirect?: boolean) => Promise<void>) | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const shouldBlockNavigationRef = useRef(false);
  const router = useRouter();
  const onNavigateAwayRef = useRef<(() => void) | null>(null);

  const registerNavigateAwayCleanup = useCallback((fn: () => void) => {
    onNavigateAwayRef.current = fn;
  }, []);

  // Navigation sans dialog : on navigue directement, en réinitialisant l'état et les stores si besoin
  const handleNavigation = useCallback((url: string) => {
    if (hasUnsavedChanges && shouldBlockNavigationRef.current) {
      onNavigateAwayRef.current?.();
      setHasUnsavedChanges(false);
      shouldBlockNavigationRef.current = false;
    }
    router.push(url);
  }, [hasUnsavedChanges, router]);

  // Synchroniser hasUnsavedChanges avec shouldBlockNavigationRef
  const updateHasUnsavedChanges = useCallback((hasChanges: boolean) => {
    setHasUnsavedChanges(hasChanges);
    shouldBlockNavigationRef.current = hasChanges;
  }, []);

  // Intercepter la fermeture de page/onglet (avertissement navigateur)
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  return (
    <NavigationBlockContext.Provider
      value={{
        hasUnsavedChanges,
        setHasUnsavedChanges: updateHasUnsavedChanges,
        saveDraftRef,
        isSaving,
        setIsSaving,
        isLoading,
        setIsLoading,
        handleNavigation,
        registerNavigateAwayCleanup,
      }}
    >
      {children}
    </NavigationBlockContext.Provider>
  );
}

export function useNavigationBlock() {
  const context = useContext(NavigationBlockContext);
  if (context === undefined) {
    throw new Error("useNavigationBlock must be used within a NavigationBlockProvider");
  }
  return context;
}
