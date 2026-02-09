"use client";

import { createContext, useContext, useState, useRef, ReactNode, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

interface NavigationBlockContextType {
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  showUnsavedDialog: boolean;
  setShowUnsavedDialog: (show: boolean) => void;
  pendingNavigation: string | null;
  setPendingNavigation: (url: string | null) => void;
  saveDraftRef: React.MutableRefObject<((skipRedirect?: boolean) => Promise<void>) | null>;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  handleNavigation: (url: string) => void;
  handleSave: () => Promise<void>;
  handleDiscard: () => void;
  handleCancel: () => void;
}

const NavigationBlockContext = createContext<NavigationBlockContextType | undefined>(undefined);

export function NavigationBlockProvider({ children }: { children: ReactNode }) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const saveDraftRef = useRef<((skipRedirect?: boolean) => Promise<void>) | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const shouldBlockNavigationRef = useRef(false);
  const router = useRouter();

  // Fonction pour gérer la navigation avec vérification des modifications non sauvegardées
  const handleNavigation = useCallback((url: string) => {
    if (hasUnsavedChanges && shouldBlockNavigationRef.current) {
      setPendingNavigation(url);
      setShowUnsavedDialog(true);
    } else {
      router.push(url);
    }
  }, [hasUnsavedChanges, router]);

  // Fonction pour enregistrer le brouillon depuis le dialog
  // NOTE: Cette fonction n'est plus utilisée directement car la logique est dans NavigationBlockDialog
  // Elle est conservée pour la compatibilité mais la vraie logique est dans le layout
  const handleSave = useCallback(async () => {
    // Cette fonction est maintenant gérée dans NavigationBlockDialog
    // Elle est laissée vide pour éviter les erreurs mais ne devrait pas être appelée
  }, []);

  // Fonction pour abandonner les modifications (ne fait que réinitialiser l'état).
  // La navigation réelle est faite par le layout avec le router i18n après avoir lu pendingNavigation.
  const handleDiscard = useCallback(() => {
    setHasUnsavedChanges(false);
    shouldBlockNavigationRef.current = false;
    setPendingNavigation(null);
  }, []);

  // Fonction pour annuler la navigation
  const handleCancel = useCallback(() => {
    // Annuler la navigation en attente
    setPendingNavigation(null);
    // Le dialog sera fermé par le composant NavigationBlockDialog
  }, []);

  // Synchroniser hasUnsavedChanges avec shouldBlockNavigationRef
  const updateHasUnsavedChanges = useCallback((hasChanges: boolean) => {
    setHasUnsavedChanges(hasChanges);
    shouldBlockNavigationRef.current = hasChanges;
  }, []);

  // Intercepter la fermeture de page/onglet
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

  // Intercepter le bouton retour du navigateur
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handlePopState = (e: PopStateEvent) => {
      if (shouldBlockNavigationRef.current) {
        // Empêcher la navigation en arrière
        window.history.pushState(null, '', window.location.href);
        setShowUnsavedDialog(true);
        setPendingNavigation(null); // On ne sait pas vers où l'utilisateur voulait aller
      }
    };

    // Ajouter un état au navigateur pour pouvoir intercepter
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges]);

  return (
    <NavigationBlockContext.Provider
      value={{
        hasUnsavedChanges,
        setHasUnsavedChanges: updateHasUnsavedChanges,
        showUnsavedDialog,
        setShowUnsavedDialog,
        pendingNavigation,
        setPendingNavigation,
        saveDraftRef,
        isSaving,
        setIsSaving,
        isLoading,
        setIsLoading,
        handleNavigation,
        handleSave,
        handleDiscard,
        handleCancel,
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

