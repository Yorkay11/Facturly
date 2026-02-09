"use client";

import { ReactNode, useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { BottomTabs } from "@/components/layout/BottomTabs";
import { NavigationBlockProvider, useNavigationBlock } from "@/contexts/NavigationBlockContext";
import { UnsavedChangesDialog } from "@/components/dialogs/UnsavedChangesDialog";
import { GlobalLoader } from "@/components/ui/global-loader";
import { useLoading } from "@/contexts/LoadingContext";
import { RedirectLoader } from "@/components/navigation/RedirectLoader";
import { useInvoiceMetadata } from "@/hooks/useInvoiceMetadata";
import { useItemsStore } from "@/hooks/useItemStore";
import { useRouter, usePathname } from '@/i18n/routing';
import { useGetWorkspaceQuery } from "@/services/facturlyApi";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { WorkspaceProvider, useWorkspace } from "@/contexts/WorkspaceContext";
import { cn } from "@/lib/utils";
import { ConditionalRedirect } from '@/components/navigation';
import { useNotificationsPush } from '@/hooks/useNotificationsPush';
import { useWebPushSubscribe } from '@/hooks/useWebPushSubscribe';
import { useLocale } from 'next-intl';

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
    const urlToGo = pendingNavigation;
    // Réinitialiser les stores et l'état du contexte (ferme le dialog, clear pending)
    resetMetadata();
    clearItems();
    setHasUnsavedChanges(false);
    setShowUnsavedDialog(false);
    handleDiscardFromContext();
    // Naviguer avec le router i18n (obligatoire pour la locale)
    if (urlToGo) {
      router.push(urlToGo);
    } else {
      router.push("/invoices");
    }
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
  const pathname = usePathname();
  const { data: workspace, isLoading, error } = useGetWorkspaceQuery();

  // Ne pas rediriger si on est déjà sur la page d'onboarding
  if (pathname === '/onboarding' || isLoading) {
    return null;
  }

  // Vérifier si le profil doit être complété
  const shouldRedirectToOnboarding = 
    // Cas 1: Pas de workspace du tout (404) ou workspace null
    !workspace || (error && 'status' in error && error.status === 404) ||
    // Cas 2: Workspace existe mais incomplet
    (workspace && (() => {
      const workspaceCompletion = workspace.profileCompletion ?? 0;
      // Pour les entreprises, vérifier si le nom est présent
      const hasMissingWorkspaceInfo = workspace.type === 'COMPANY' 
        ? !workspace.name
        : false;
      
      // Considérer incomplet si < 100% ou infos manquantes
      // Note: Vous pouvez ajuster le seuil de 100% si nécessaire (ex: 80%)
      return workspaceCompletion < 100 || hasMissingWorkspaceInfo;
    })());

  if (!shouldRedirectToOnboarding) {
    return null;
  }

  return (
    <ConditionalRedirect
      condition={shouldRedirectToOnboarding}
      to="/onboarding"
      type="replace"
      checkUnsavedChanges={false}
      showLoader={true}
      loaderType="redirect"
    />
  );
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
  const { isChangingWorkspace } = useWorkspace();
  const locale = useLocale();

  useNotificationsPush();
  useWebPushSubscribe(locale);

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
    <div className="min-h-screen bg-background text-foreground">
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
        " mt-12 transition-all duration-300  py-4 md:px-4 md:py-5 lg:px-6 lg:py-6 pb-20 md:pb-24 lg:pb-6",
        "lg:pt-14", // Ajusté pour la nouvelle hauteur du topbar (h-12)
        isCollapsed ? "lg:pl-16" : "lg:pl-64"
      )}>
        <div className="mx-2 md:mx-10 space-y-4">
          {children}
        </div>
      </main>
      <BottomTabs />
      <NavigationBlockDialog />
      <OnboardingRedirect />
      {isChangingWorkspace && (
        <RedirectLoader 
          text="Chargement du workspace..."
          backgroundColor="rgba(255, 255, 255, 1)"
          color="hsl(var(--primary))"
        />
      )}
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <NavigationBlockProvider>
      <SidebarProvider>
        <WorkspaceProvider>
          <DashboardLayoutContent>
            {children}
          </DashboardLayoutContent>
        </WorkspaceProvider>
      </SidebarProvider>
    </NavigationBlockProvider>
  );
}
