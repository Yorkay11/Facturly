// ==================== Reports Endpoints ====================

import type { EndpointBuilder } from '@reduxjs/toolkit/query';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type {
  RevenueByClient,
  RevenueByMonth,
  RevenueByProduct,
  TopClient,
  RevenueEvolution,
  RevenueForecast,
  ReportsQueryParams,
} from '../types';
import type { TagTypes } from '../base';

export const reportsEndpoints = (
  builder: EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, TagTypes, 'facturlyApi'>
) => ({
  getRevenueByClient: builder.query<RevenueByClient[], ReportsQueryParams | void>({
    query: (params) => {
      const searchParams = new URLSearchParams();
      if (params?.month) searchParams.append('month', params.month.toString());
      if (params?.year) searchParams.append('year', params.year.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      const queryString = searchParams.toString();
      return `/reports/revenue/by-client${queryString ? `?${queryString}` : ''}`;
    },
    providesTags: ['Reports'],
  }),

  getRevenueByMonth: builder.query<RevenueByMonth[], ReportsQueryParams | void>({
    query: (params) => {
      const searchParams = new URLSearchParams();
      if (params?.months) searchParams.append('months', params.months.toString());
      const queryString = searchParams.toString();
      return `/reports/revenue/by-month${queryString ? `?${queryString}` : ''}`;
    },
    providesTags: ['Reports'],
  }),

  getRevenueByProduct: builder.query<RevenueByProduct[], ReportsQueryParams | void>({
    query: (params) => {
      const searchParams = new URLSearchParams();
      if (params?.month) searchParams.append('month', params.month.toString());
      if (params?.year) searchParams.append('year', params.year.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      const queryString = searchParams.toString();
      return `/reports/revenue/by-product${queryString ? `?${queryString}` : ''}`;
    },
    providesTags: ['Reports'],
  }),

  getTopClients: builder.query<TopClient[], ReportsQueryParams | void>({
    query: (params) => {
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      const queryString = searchParams.toString();
      return `/reports/clients/top${queryString ? `?${queryString}` : ''}`;
    },
    providesTags: ['Reports'],
  }),

  getRevenueEvolution: builder.query<RevenueEvolution, ReportsQueryParams | void>({
    query: (params) => {
      const searchParams = new URLSearchParams();
      if (params?.months) searchParams.append('months', params.months.toString());
      const queryString = searchParams.toString();
      return `/reports/revenue/evolution${queryString ? `?${queryString}` : ''}`;
    },
    providesTags: ['Reports'],
  }),

  getRevenueForecast: builder.query<RevenueForecast, ReportsQueryParams | void>({
    query: (params) => {
      const searchParams = new URLSearchParams();
      if (params?.months) searchParams.append('months', params.months.toString());
      const queryString = searchParams.toString();
      return `/reports/revenue/forecast${queryString ? `?${queryString}` : ''}`;
    },
    providesTags: ['Reports'],
  }),

  exportReportsExcel: builder.query<Blob, ReportsQueryParams | void>({
    query: (params) => {
      const searchParams = new URLSearchParams();
      if (params?.month) searchParams.append('month', params.month.toString());
      if (params?.year) searchParams.append('year', params.year.toString());
      if (params?.months) searchParams.append('months', params.months.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      const queryString = searchParams.toString();
      return {
        url: `/reports/export/excel${queryString ? `?${queryString}` : ''}`,
        responseHandler: (response) => response.blob(),
      };
    },
  }),

  exportReportsPDF: builder.query<Blob, ReportsQueryParams | void>({
    query: (params) => {
      const searchParams = new URLSearchParams();
      if (params?.month) searchParams.append('month', params.month.toString());
      if (params?.year) searchParams.append('year', params.year.toString());
      if (params?.months) searchParams.append('months', params.months.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      const queryString = searchParams.toString();
      return {
        url: `/reports/export/pdf${queryString ? `?${queryString}` : ''}`,
        responseHandler: (response) => response.blob(),
      };
    },
  }),
});
