// ==================== Settings Endpoints ====================

import type { EndpointBuilder } from '@reduxjs/toolkit/query';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { Settings, UpdateSettingsPayload } from '../types';
import type { TagTypes } from '../base';

export const settingsEndpoints = (
  builder: EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, TagTypes, 'facturlyApi'>
) => ({
  getSettings: builder.query<Settings, void>({
    query: () => "/settings",
    providesTags: ["Settings"],
    keepUnusedDataFor: 3600, // Garder en cache 1h (aligné avec l'expiration des URLs pré-signées)
  }),
  updateSettings: builder.mutation<Settings, UpdateSettingsPayload>({
    query: (body) => ({
      url: "/settings",
      method: "PATCH",
      body,
    }),
    invalidatesTags: ["Settings"],
  }),
  uploadSignatureImage: builder.mutation<{ url: string }, File>({
    query: (file) => {
      const formData = new FormData();
      formData.append("file", file);
      return {
        url: "/upload/signature-image",
        method: "POST",
        body: formData,
      };
    },
    invalidatesTags: ["Settings"],
  }),
});
