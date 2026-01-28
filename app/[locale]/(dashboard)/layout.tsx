"use client";

import { ReactNode, useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { BottomTabs } from "@/components/layout/BottomTabs";
import { NavigationBlockProvider, useNavigationBlock } from "@/contexts/NavigationBlockContext";
import { UnsavedChangesDialog } from "@/components/dialogs/UnsavedChangesDialog";
import { GlobalLoader } from "@/components/ui/global-loader";
import { LoadingProvider, useLoading } from "@/contexts/LoadingContext";
import { useInvoiceMetadata } from "@/hooks/useInvoiceMetadata";
import { useItemsStore } from "@/hooks/useItemStore";
import { useRouter, usePathname } from '@/i18n/routing';
import { useGetWorkspaceQuery } from "@/services/facturlyApi";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

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

// Composant pour gérer la redirection vers l'onboarding
function OnboardingRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: workspace, isLoading, error } = useGetWorkspaceQuery();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Ne pas rediriger si on est déjà sur la page d'onboarding
    if (pathname === '/onboarding') {
      return;
    }

    // Attendre que les données soient chargées
    if (isLoading) return;

    // Ne vérifier qu'une seule fois
    if (hasChecked) return;

    // Si l'utilisateur n'a pas de workspace (nouvel utilisateur Google OAuth)
    // ou si une erreur 404 est retournée, rediriger vers l'onboarding
    if (!workspace || (error && 'status' in error && error.status === 404)) {
      router.push('/onboarding');
      setHasChecked(true);
      return;
    }

    // Vérifier si le profil n'est pas complet
    const workspaceCompletion = workspace.profileCompletion ?? 0;
    
    // PHASE 3.1 : Onboarding simplifié - Pour INDIVIDUAL, toujours complet (defaultCurrency a une valeur par défaut)
    // Pour COMPANY, seulement le nom est requis
    const hasMissingWorkspaceInfo = workspace.type === 'COMPANY' 
      ? !workspace.name
      : false; // INDIVIDUAL n'a plus besoin de defaultCurrency (valeur par défaut)
    
    // Rediriger vers l'onboarding si :
    // 1. Le workspace n'est pas complet (< 100)
    // 2. OU les champs essentiels manquent
    const shouldRedirect = 
      workspaceCompletion < 100 || 
      hasMissingWorkspaceInfo;
    
    if (shouldRedirect) {
      router.push('/onboarding');
    }
    setHasChecked(true);
  }, [workspace, isLoading, error, hasChecked, pathname, router]);

  return null;
}

function DashboardLayoutContent({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isOnboardingPage = pathname === '/onboarding';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { isCollapsed } = useSidebar();

  // Sur la page d'onboarding, ne pas afficher la sidebar et le layout normal
  if (isOnboardingPage) {
    return (
      <>
        {children}
        <OnboardingRedirect />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Mobile Header */}
      <MobileHeader 
        onMenuClick={() => setSidebarOpen(true)}
        onProfileClick={() => setProfileOpen(true)}
      />
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onOpenChange={setSidebarOpen}
        profileOpen={profileOpen}
        onProfileOpenChange={setProfileOpen}
      />
      
      {/* Topbar (Desktop) */}
      <Topbar />
      
      {/* Main content */}
      <main className={cn(
        " mt-12 transition-all duration-300 px-3 py-4 md:px-4 md:py-5 lg:px-6 lg:py-6 pb-20 md:pb-24 lg:pb-6",
        "lg:pt-14", // Ajusté pour la nouvelle hauteur du topbar (h-12)
        isCollapsed ? "lg:pl-16" : "lg:pl-64"
      )}>
        <div className="mx-10 space-y-4">
          {children}
        </div>
      </main>
      <BottomTabs />
      <NavigationBlockDialog />
      <OnboardingRedirect />
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
        <SidebarProvider>
          <DashboardLayoutContent>
            {children}
          </DashboardLayoutContent>
        </SidebarProvider>
      </NavigationBlockProvider>
    </LoadingProvider>
  );
}
