"use client";

import { ReactNode, useState, useEffect } from "react";
import Topbar from "@/components/layout/Topbar";
import { NavigationBlockProvider, useNavigationBlock } from "@/contexts/NavigationBlockContext";
import { UnsavedChangesDialog } from "@/components/dialogs/UnsavedChangesDialog";
import { GlobalLoader } from "@/components/ui/global-loader";
import { LoadingProvider, useLoading } from "@/contexts/LoadingContext";
import { useInvoiceMetadata } from "@/hooks/useInvoiceMetadata";
import { useItemsStore } from "@/hooks/useItemStore";
import { useRouter } from '@/i18n/routing';
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { useGetMeQuery, useGetCompanyQuery } from "@/services/facturlyApi";
import { useBetaBanner } from "@/hooks/useBetaBanner";

// Composant interne pour utiliser le contexte et afficher le dialog
function NavigationBlockDialog() {
  const {
    showUnsavedDialog,
    setShowUnsavedDialog,
    saveDraftRef,
    isSaving,
    setIsSaving,
    pendingNavigation,
    setPendingNavigation,
    setHasUnsavedChanges,
    handleDiscard: handleDiscardFromContext,
    handleCancel,
  } = useNavigationBlock();
  
  const { isLoading: globalLoading, loadingMessage } = useLoading();
  const { reset: resetMetadata } = useInvoiceMetadata();
  const { clearItems } = useItemsStore();
  const router = useRouter();

  // Fonction pour enregistrer le brouillon depuis le dialog
  const handleSave = async () => {
    if (!saveDraftRef.current) {
      setShowUnsavedDialog(false);
      return;
    }
    
    setIsSaving(true);
    try {
      // Passer skipRedirect: true pour éviter la redirection automatique
      await saveDraftRef.current(true);
      
      // Réinitialiser les stores après la sauvegarde réussie
      resetMetadata();
      clearItems();
      setHasUnsavedChanges(false);
      
      // Fermer le dialog
      setShowUnsavedDialog(false);
      
      // Naviguer vers la destination prévue ou la liste des factures
      if (pendingNavigation) {
        router.push(pendingNavigation);
        setPendingNavigation(null);
      } else {
        router.push('/invoices');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      // Le toast d'erreur est déjà affiché dans handleSaveDraft
      // Ne pas fermer le dialog en cas d'erreur pour permettre de réessayer
    } finally {
      setIsSaving(false);
    }
  };

  // Fonction pour abandonner les modifications
  const handleDiscard = () => {
    // Réinitialiser les stores
    resetMetadata();
    clearItems();
    setHasUnsavedChanges(false);
    
    // Fermer le dialog
    setShowUnsavedDialog(false);
    
    // Utiliser la fonction du contexte pour la navigation
    handleDiscardFromContext();
  };

  // Fonction pour annuler (rester sur la page)
  const handleCancelAction = () => {
    // Fermer le dialog
    setShowUnsavedDialog(false);
    // Annuler la navigation en attente
    handleCancel();
  };

  // Empêcher la fermeture du dialog pendant l'enregistrement
  const handleDialogOpenChange = (open: boolean) => {
    // Ne pas permettre la fermeture pendant l'enregistrement
    if (!open && isSaving) {
      return;
    }
    
    setShowUnsavedDialog(open);
    
    // Si le dialog est fermé (clic en dehors, ESC), annuler la navigation
    if (!open && !isSaving) {
      handleCancel();
    }
  };

  return (
    <>
      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onOpenChange={handleDialogOpenChange}
        onSave={handleSave}
        onDiscard={handleDiscard}
        onCancel={handleCancelAction}
        isSaving={isSaving}
      />
      <GlobalLoader 
        isLoading={isSaving || globalLoading} 
        message={
          isSaving 
            ? "Enregistrement en cours..." 
            : globalLoading 
            ? (loadingMessage || "Chargement en cours...")
            : undefined
        }
      />
    </>
  );
}

// Composant pour gérer l'onboarding
function OnboardingHandler() {
  const { data: user, isLoading: isLoadingUser, refetch: refetchUser } = useGetMeQuery();
  const { data: company, isLoading: isLoadingCompany, refetch: refetchCompany } = useGetCompanyQuery();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Attendre que les données soient chargées
    if (isLoadingCompany) return;

    // Ne vérifier qu'une seule fois
    if (hasChecked) return;

    // Vérifier si le profil n'est pas complet
    if (company) {
      // Petit délai pour s'assurer que tout est bien chargé
      const checkTimer = setTimeout(() => {
        const companyCompletion = company.profileCompletion ?? 0;
        
        // Vérifier si les champs essentiels de l'entreprise manquent
        const hasMissingCompanyInfo = !company.name || !company.defaultCurrency;
        
        // Afficher l'onboarding si :
        // 1. L'entreprise n'est pas complète (< 100)
        // 2. OU les champs essentiels manquent
        const shouldShow = 
          companyCompletion < 100 || 
          hasMissingCompanyInfo;
        
        console.log('Should show onboarding:', shouldShow);
        
        if (shouldShow) {
          setShowOnboarding(true);
        }
        setHasChecked(true);
      }, 500); // Délai de 500ms pour s'assurer que les données sont bien chargées

      return () => clearTimeout(checkTimer);
    }
  }, [company, isLoadingCompany, hasChecked]);

  const handleOnboardingComplete = async () => {
    // Rafraîchir les données après la complétion
    await refetchCompany();
    setShowOnboarding(false);
  };

  // Ne rien afficher si les données ne sont pas encore chargées
  if (isLoadingCompany || !company) {
    return null;
  }

  return (
    <OnboardingModal 
      open={showOnboarding} 
      onComplete={handleOnboardingComplete}
    />
  );
}

function DashboardLayoutContent({
  children,
}: {
  children: ReactNode;
}) {
  const isBetaBannerVisible = useBetaBanner();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {isBetaBannerVisible && <div className="h-[44px] md:h-[42px]" />} {/* Spacer pour le banner fixe */}
      <Topbar />
      <main className="px-4 py-6 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {children}
        </div>
      </main>
      <NavigationBlockDialog />
      <OnboardingHandler />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LoadingProvider>
      <NavigationBlockProvider>
        <DashboardLayoutContent>
          {children}
        </DashboardLayoutContent>
      </NavigationBlockProvider>
    </LoadingProvider>
  );
}
