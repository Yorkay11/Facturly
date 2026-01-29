"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  useGetWorkspaceQuery,
  useGetWorkspacesQuery,
  useCreateWorkspaceMutation,
  facturlyApi,
} from "@/services/facturlyApi";
import { store } from "@/lib/redux/store";
import type { Workspace } from "@/services/facturlyApi";
import {
  getWorkspaceIdFromCookie,
  setWorkspaceIdCookie,
  clearWorkspaceIdCookie,
} from "@/lib/workspace-cookie";

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null | undefined;
  currentWorkspaceId: string | null;
  setCurrentWorkspaceId: (id: string | null) => void;
  createWorkspace: ReturnType<typeof useCreateWorkspaceMutation>[0];
  createWorkspaceStatus: ReturnType<typeof useCreateWorkspaceMutation>[1];
  isLoadingWorkspaces: boolean;
  isLoadingCurrent: boolean;
  isChangingWorkspace: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [currentWorkspaceId, setCurrentWorkspaceIdState] = useState<
    string | null
  >(null);
  const [isChangingWorkspace, setIsChangingWorkspace] = useState(false);

  const { data: workspaces = [], isLoading: isLoadingWorkspaces } =
    useGetWorkspacesQuery(undefined, { skip: false });
  const { data: currentWorkspace, isLoading: isLoadingCurrent } =
    useGetWorkspaceQuery();

  const [createWorkspace, createWorkspaceStatus] = useCreateWorkspaceMutation();

  const setCurrentWorkspaceId = useCallback((id: string | null) => {
    // Éviter les changements multiples rapides
    if (currentWorkspaceId === id) return;
    
    setIsChangingWorkspace(true);
    setCurrentWorkspaceIdState(id);
    if (id) setWorkspaceIdCookie(id);
    else clearWorkspaceIdCookie();
    
    // Invalider tous les tags pour forcer le refetch des données du nouveau workspace
    // RTK Query refetch automatiquement les queries actives quand leurs tags sont invalidés
    store.dispatch(
      facturlyApi.util.invalidateTags([
        "Workspace",
        "Invoice",
        "Client",
        "Product",
        "Payment",
        "Bill",
        "Dashboard",
        "Reports",
        "Settings",
        "Notification",
        "RecurringInvoice",
        "InvoiceTemplate",
      ])
    );
  }, [currentWorkspaceId]);

  // Réinitialiser isChangingWorkspace quand toutes les données sont chargées
  useEffect(() => {
    if (!isChangingWorkspace) return;

    let checkCount = 0;
    const maxChecks = 50; // Maximum 10 secondes (50 * 200ms)
    
    // Vérifier périodiquement si toutes les queries sont terminées
    const checkQueriesComplete = () => {
      checkCount++;
      const state = store.getState() as any;
      
      // Vérifier les queries en cours via le state RTK Query
      const queries = state?.facturlyApi?.queries || {};
      const mutations = state?.facturlyApi?.mutations || {};
      
      // Vérifier s'il y a des queries en cours (status === 'pending' ou isLoading/isFetching)
      const hasActiveQueries = Object.values(queries).some((query: any) => {
        if (!query) return false;
        // Vérifier le statut de la query
        return query.status === 'pending' || 
               (query.isLoading === true) || 
               (query.isFetching === true);
      });
      
      // Vérifier s'il y a des mutations en cours
      const hasActiveMutations = Object.values(mutations).some((mutation: any) => {
        if (!mutation) return false;
        return mutation.status === 'pending';
      });
      
      // Si les queries principales sont terminées et qu'il n'y a pas de queries actives
      if (!isLoadingCurrent && !isLoadingWorkspaces && !hasActiveQueries && !hasActiveMutations) {
        // Attendre encore un peu pour être sûr que tout est bien chargé
        // On attend 2 vérifications consécutives pour être sûr
        if (checkCount >= 2) {
          setIsChangingWorkspace(false);
          return true; // Arrêter la vérification
        }
      } else {
        // Réinitialiser le compteur si on trouve encore des queries actives
        checkCount = 0;
      }
      
      // Timeout de sécurité après maxChecks vérifications
      if (checkCount >= maxChecks) {
        setIsChangingWorkspace(false);
        return true; // Arrêter la vérification
      }
      
      return false;
    };

    // Vérifier périodiquement toutes les 200ms
    const interval = setInterval(() => {
      if (checkQueriesComplete()) {
        clearInterval(interval);
      }
    }, 200);

    return () => {
      clearInterval(interval);
    };
  }, [isChangingWorkspace, isLoadingCurrent, isLoadingWorkspaces]);

  useEffect(() => {
    const fromCookie = getWorkspaceIdFromCookie();
    if (fromCookie) {
      setCurrentWorkspaceIdState(fromCookie);
      return;
    }
    if (workspaces.length > 0 && !currentWorkspaceId) {
      const first = workspaces[0];
      if (first?.id) {
        setCurrentWorkspaceIdState(first.id);
        setWorkspaceIdCookie(first.id);
      }
    }
  }, [workspaces, currentWorkspaceId]);

  useEffect(() => {
    if (currentWorkspaceId && workspaces.length > 0) {
      const exists = workspaces.some((w) => w.id === currentWorkspaceId);
      if (!exists) {
        const first = workspaces[0];
        if (first?.id && first.id !== currentWorkspaceId) {
          setCurrentWorkspaceIdState(first.id);
          setWorkspaceIdCookie(first.id);
          // Invalider tous les tags quand on change de workspace automatiquement
          store.dispatch(
            facturlyApi.util.invalidateTags([
              "Workspace",
              "Invoice",
              "Client",
              "Product",
              "Payment",
              "Bill",
              "Dashboard",
              "Reports",
              "Settings",
              "Notification",
              "RecurringInvoice",
              "InvoiceTemplate",
            ])
          );
        }
      }
    }
  }, [currentWorkspaceId, workspaces]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        currentWorkspaceId,
        setCurrentWorkspaceId,
        createWorkspace,
        createWorkspaceStatus,
        isLoadingWorkspaces,
        isLoadingCurrent,
        isChangingWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (ctx === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return ctx;
}
