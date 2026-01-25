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
  }),
  updateSettings: builder.mutation<Settings, UpdateSettingsPayload>({
    query: (body) => ({
      url: "/settings",
      method: "PATCH",
      body,
    }),
    invalidatesTags: ["Settings"],
  }),
});
