"use client";

import { ReactNode } from "react";
import Topbar from "@/components/layout/Topbar";
import { NavigationBlockProvider, useNavigationBlock } from "@/contexts/NavigationBlockContext";
import { UnsavedChangesDialog } from "@/components/dialogs/UnsavedChangesDialog";
import { GlobalLoader } from "@/components/ui/global-loader";
import { LoadingProvider, useLoading } from "@/contexts/LoadingContext";
import { useInvoiceMetadata } from "@/hooks/useInvoiceMetadata";
import { useItemsStore } from "@/hooks/useItemStore";
import { useRouter } from "next/navigation";

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

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LoadingProvider>
      <NavigationBlockProvider>
        <div className="min-h-screen bg-slate-100 text-slate-900">
          <Topbar />
          <main className="px-4 py-6 lg:px-10 lg:py-8">
            <div className="mx-auto max-w-7xl space-y-6">
              {children}
            </div>
          </main>
          <NavigationBlockDialog />
        </div>
      </NavigationBlockProvider>
    </LoadingProvider>
  );
}
