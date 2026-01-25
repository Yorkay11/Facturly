// ==================== Dashboard Endpoints ====================

import type { EndpointBuilder } from '@reduxjs/toolkit/query';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type {
  DashboardActivity,
  DashboardAlerts,
  DashboardStats,
  DashboardActivitiesQueryParams,
  DashboardStatsQueryParams,
} from '../types';
import type { TagTypes } from '../base';

export const dashboardEndpoints = (
  builder: EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, TagTypes, 'facturlyApi'>
) => ({
  getDashboardActivities: builder.query<{ data: DashboardActivity[] }, DashboardActivitiesQueryParams | void>({
    query: (params) => {
      const searchParams = new URLSearchParams();
      if (params && params.limit) searchParams.append("limit", params.limit.toString());
      const queryString = searchParams.toString();
      return `/dashboard/activities${queryString ? `?${queryString}` : ""}`;
    },
    providesTags: ["Invoice", "Client", "Payment"],
  }),
  getDashboardAlerts: builder.query<DashboardAlerts, void>({
    query: () => "/dashboard/alerts",
    providesTags: ["Invoice", "Client"],
  }),
  getDashboardStats: builder.query<DashboardStats, DashboardStatsQueryParams | void>({
    query: (params) => {
      const searchParams = new URLSearchParams();
      if (params && params.month) searchParams.append("month", params.month.toString());
      if (params && params.year) searchParams.append("year", params.year.toString());
      const queryString = searchParams.toString();
      return `/dashboard/stats${queryString ? `?${queryString}` : ""}`;
    },
    providesTags: ["Invoice", "Payment"],
  }),
});
