// ==================== Workspace Endpoints ====================

import type { EndpointBuilder } from '@reduxjs/toolkit/query';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { Workspace, CreateWorkspacePayload, UpdateWorkspacePayload } from '../types';
import type { TagTypes } from '../base';

export const workspaceEndpoints = (
  builder: EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, TagTypes, 'facturlyApi'>
) => ({
  getWorkspace: builder.query<Workspace, void>({
    query: () => "/workspaces/me",
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
