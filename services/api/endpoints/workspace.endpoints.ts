// ==================== Workspace Endpoints ====================

import type { EndpointBuilder } from '@reduxjs/toolkit/query';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { Workspace, WorkspaceType, CreateWorkspacePayload, UpdateWorkspacePayload } from '../types';
import type { TagTypes } from '../base';

export const workspaceEndpoints = (
  builder: EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, TagTypes, 'facturlyApi'>
) => ({
  getWorkspace: builder.query<Workspace | null, void>({
    query: () => "/workspaces/me",
    providesTags: ["Workspace"],
    // Ne pas traiter null comme une erreur - c'est une valeur valide quand l'utilisateur n'a pas encore de workspace
    transformResponse: (response: Workspace | null) => {
      if (!response) return null;
      // Normaliser : backend peut renvoyer camelCase ou snake_case
      const raw = response as unknown as Record<string, unknown>;
      const defaultCurrency =
        (raw.defaultCurrency as string) ?? (raw.default_currency as string) ?? "XOF";
      const type = (raw.type as WorkspaceType) ?? (response as Workspace).type;
      return { ...response, defaultCurrency, type } as Workspace;
    },
    // Ne pas considérer null comme une erreur
    keepUnusedDataFor: 3600, // Garder en cache 1h (aligné avec l'expiration des URLs pré-signées)
  }),
  getWorkspaces: builder.query<Workspace[], void>({
    query: () => "/workspaces",
    providesTags: ["Workspace"],
    keepUnusedDataFor: 3600, // Garder en cache 1h (aligné avec l'expiration des URLs pré-signées)
  }),
  createWorkspace: builder.mutation<Workspace, CreateWorkspacePayload>({
    query: (body) => ({
      url: "/workspaces",
      method: "POST",
      body,
    }),
    invalidatesTags: ["Workspace", "User"],
  }),
  updateWorkspace: builder.mutation<Workspace, UpdateWorkspacePayload>({
    query: (body) => ({
      url: "/workspaces/me",
      method: "PATCH",
      body,
    }),
    invalidatesTags: ["Workspace", "User"],
  }),
  uploadWorkspaceLogo: builder.mutation<{ url: string }, File>({
    query: (file) => {
      const formData = new FormData();
      formData.append("file", file);
      return {
        url: "/upload/workspace-logo",
        method: "POST",
        body: formData,
      };
    },
    // Invalider les tags pour mettre à jour le cache, mais les données restent en cache RTK Query
    // donc pas de refetch si les données sont encore valides (< 1h)
    invalidatesTags: ["Workspace", "User"],
  }),
});
