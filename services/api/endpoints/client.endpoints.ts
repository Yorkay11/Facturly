// ==================== Client Endpoints ====================

import type { EndpointBuilder } from '@reduxjs/toolkit/query';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type {
  Client,
  CreateClientPayload,
  UpdateClientPayload,
  PaginatedResponse,
  ListQueryParams,
  BulkImportResponse,
  BulkImportClientsPayload,
  ClientRevenue,
  ClientRevenueQueryParams,
} from '../types';
import type { TagTypes } from '../base';

export const clientEndpoints = (
  builder: EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, TagTypes, 'facturlyApi'>
) => ({
  getClients: builder.query<PaginatedResponse<Client>, ListQueryParams | void>({
    query: (params) => {
      const searchParams = new URLSearchParams();
      if (params && params.page) searchParams.append("page", params.page.toString());
      if (params && params.limit) searchParams.append("limit", params.limit.toString());
      if (params && params.search) searchParams.append("search", params.search);
      const queryString = searchParams.toString();
      return `/clients${queryString ? `?${queryString}` : ""}`;
    },
    providesTags: ["Client"],
  }),
  getClientById: builder.query<Client, string>({
    query: (id) => `/clients/${id}`,
    providesTags: (_result, _error, id) => [{ type: "Client", id }],
  }),
  createClient: builder.mutation<Client, CreateClientPayload>({
    query: (body) => ({
      url: "/clients",
      method: "POST",
      body,
    }),
    invalidatesTags: ["Client"],
  }),
  updateClient: builder.mutation<Client, { id: string; payload: UpdateClientPayload }>({
    query: ({ id, payload }) => ({
      url: `/clients/${id}`,
      method: "PATCH",
      body: payload,
    }),
    invalidatesTags: (_result, _error, { id }) => [{ type: "Client", id }, "Client"],
  }),
  deleteClient: builder.mutation<void, string>({
    query: (id) => ({
      url: `/clients/${id}`,
      method: "DELETE",
    }),
    invalidatesTags: ["Client"],
  }),
  bulkImportClients: builder.mutation<BulkImportResponse, BulkImportClientsPayload>({
    query: (body) => ({
      url: "/clients/bulk",
      method: "POST",
      body,
    }),
    invalidatesTags: ["Client"],
  }),
  getClientRevenue: builder.query<ClientRevenue, { id: string; params?: ClientRevenueQueryParams }>({
    query: ({ id, params }) => {
      const searchParams = new URLSearchParams();
      if (params && params.months) searchParams.append("months", params.months.toString());
      const queryString = searchParams.toString();
      return `/clients/${id}/revenue${queryString ? `?${queryString}` : ""}`;
    },
    providesTags: (_result, _error, { id }) => [{ type: "Client", id }],
  }),
});
