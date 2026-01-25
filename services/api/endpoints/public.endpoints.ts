// ==================== Public Endpoints ====================

import type { EndpointBuilder } from '@reduxjs/toolkit/query';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { BetaAccessInfo } from '../types';
import type { TagTypes } from '../base';

export const publicEndpoints = (
  builder: EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, TagTypes, 'facturlyApi'>
) => ({
  getBetaAccessInfo: builder.query<BetaAccessInfo, void>({
    query: () => ({
      url: "/public/beta",
    }),
    // Pas besoin d'auth pour cet endpoint public
  }),
});
