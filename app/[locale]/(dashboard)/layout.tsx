"use client";

import { ReactNode, useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { BottomTabs } from "@/components/layout/BottomTabs";
import { NavigationBlockProvider, useNavigationBlock } from "@/contexts/NavigationBlockContext";
import { GlobalLoader } from "@/components/ui/global-loader";
import { useLoading } from "@/contexts/LoadingContext";
import { RedirectLoader } from "@/components/navigation/RedirectLoader";
import { useInvoiceMetadata } from "@/hooks/useInvoiceMetadata";
import { useItemsStore } from "@/hooks/useItemStore";
import { usePathname } from '@/i18n/routing';
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { WorkspaceProvider, useWorkspace } from "@/contexts/WorkspaceContext";
import { cn } from "@/lib/utils";
import { ConditionalRedirect } from '@/components/navigation';
import { useNotificationsPush } from '@/hooks/useNotificationsPush';
import { useWebPushSubscribe } from '@/hooks/useWebPushSubscribe';
import { useLocale } from 'next-intl';
import { ChatFab } from '@/components/chat/ChatFab';

// Composant interne : enregistre le nettoyage (metadata + items) au départ sans sauvegarder, et affiche le loader global
function NavigationBlockLoader() {
  const { isSaving, registerNavigateAwayCleanup } = useNavigationBlock();
  const { isLoading: globalLoading, loadingMessage } = useLoading();
  const { reset: resetMetadata } = useInvoiceMetadata();
  const { clearItems } = useItemsStore();

  useEffect(() => {
    registerNavigateAwayCleanup(() => {
      resetMetadata();
      clearItems();
    });
  }, [registerNavigateAwayCleanup, resetMetadata, clearItems]);

  return (
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
  );
}

// Même logique que CreateWorkspaceRedirect pour savoir si le profil workspace est incomplet
function useWorkspaceIncomplete() {
  const { currentWorkspace, isLoadingCurrent } = useWorkspace();
  if (isLoadingCurrent) return { incomplete: false, loading: true };
  const incomplete =
    !currentWorkspace ||
    (currentWorkspace && (
      (currentWorkspace.profileCompletion ?? 0) < 100 ||
      (currentWorkspace.type === "COMPANY" ? !currentWorkspace.name : false)
    ));
  return { incomplete: !!incomplete, loading: false };
}

// Redirection vers create-workspace uniquement si on n’ouvre pas le modal (ex: page create-workspace elle-même gère le contenu)
function CreateWorkspaceRedirect({ skipRedirect }: { skipRedirect?: boolean }) {
  const pathname = usePathname();
  const { currentWorkspace, isLoadingCurrent } = useWorkspace();

  if (pathname?.includes("/create-workspace") || isLoadingCurrent || skipRedirect) {
    return null;
  }

  const shouldRedirectToCreateWorkspace =
    !currentWorkspace ||
    (currentWorkspace &&
      ((currentWorkspace.profileCompletion ?? 0) < 100 ||
        (currentWorkspace.type === "COMPANY" ? !currentWorkspace.name : false)));

  if (!shouldRedirectToCreateWorkspace) return null;

  return (
    <ConditionalRedirect
      condition={shouldRedirectToCreateWorkspace}
      to="/create-workspace"
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
  const isCreateWorkspacePage = pathname?.includes('/create-workspace');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { isCollapsed } = useSidebar();
  const { isChangingWorkspace } = useWorkspace();
  const { incomplete: workspaceIncomplete, loading: workspaceLoading } = useWorkspaceIncomplete();
  const locale = useLocale();

  const openCreateWorkspaceModal = !workspaceLoading && workspaceIncomplete && !isCreateWorkspacePage;

  useNotificationsPush();
  useWebPushSubscribe(locale);

  // Sur la page create-workspace, ne pas afficher la sidebar et le layout normal
  if (isCreateWorkspacePage) {
    return (
      <>
        {children}
        <CreateWorkspaceRedirect />
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
        openCreateWorkspaceModal={openCreateWorkspaceModal}
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
      <ChatFab />
      <NavigationBlockLoader />
      <CreateWorkspaceRedirect skipRedirect={openCreateWorkspaceModal} />
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
