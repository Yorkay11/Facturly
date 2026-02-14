// ==================== Workspace Endpoints ====================

import type { EndpointBuilder } from '@reduxjs/toolkit/query';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { Workspace, CreateWorkspacePayload, UpdateWorkspacePayload } from '../types';
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
      // Normaliser la devise : backend peut renvoyer defaultCurrency (camelCase) ou default_currency (snake_case)
      const raw = response as unknown as Record<string, unknown>;
      const defaultCurrency =
        (raw.defaultCurrency as string) ?? (raw.default_currency as string) ?? "XOF";
      return { ...response, defaultCurrency } as Workspace;
    },
    // Ne pas considérer null comme une erreur
    keepUnusedDataFor: 60, // Garder en cache 60 secondes même si null
  }),
  getWorkspaces: builder.query<Workspace[], void>({
    query: () => "/workspaces",
    providesTags: ["Workspace"],
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
});
