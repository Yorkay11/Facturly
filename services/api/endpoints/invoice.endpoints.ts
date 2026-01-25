// ==================== Invoice Endpoints ====================

import type { EndpointBuilder } from '@reduxjs/toolkit/query';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type {
  Invoice,
  InvoiceSummary,
  InvoiceItem,
  CreateInvoicePayload,
  UpdateInvoicePayload,
  SendInvoicePayload,
  MarkInvoicePaidPayload,
  CreateInvoiceItemPayload,
  UpdateInvoiceItemPayload,
  InvoiceReminder,
  SendReminderResponse,
  PaginatedResponse,
  InvoiceListQueryParams,
} from '../types';
import type { TagTypes } from '../base';

export const invoiceEndpoints = (
  builder: EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, TagTypes, 'facturlyApi'>
) => ({
  getInvoices: builder.query<PaginatedResponse<InvoiceSummary>, InvoiceListQueryParams | void>({
    query: (params) => {
      const searchParams = new URLSearchParams();
      if (params && params.page) searchParams.append("page", params.page.toString());
      if (params && params.limit) searchParams.append("limit", params.limit.toString());
      if (params && params.status) searchParams.append("status", params.status);
      if (params && params.clientId) searchParams.append("clientId", params.clientId);
      if (params && params.search) searchParams.append("search", params.search);
      const queryString = searchParams.toString();
      return `/invoices${queryString ? `?${queryString}` : ""}`;
    },
    providesTags: ["Invoice"],
  }),
  getInvoiceById: builder.query<Invoice, string>({
    query: (id) => `/invoices/${id}`,
    providesTags: (_result, _error, id) => [{ type: "Invoice", id }],
  }),
  createInvoice: builder.mutation<Invoice, CreateInvoicePayload>({
    query: (body) => ({
      url: "/invoices",
      method: "POST",
      body,
    }),
    invalidatesTags: ["Invoice"],
  }),
  updateInvoice: builder.mutation<Invoice, { id: string; payload: UpdateInvoicePayload }>({
    query: ({ id, payload }) => ({
      url: `/invoices/${id}`,
      method: "PATCH",
      body: payload,
    }),
    invalidatesTags: (_result, _error, { id }) => [{ type: "Invoice", id }, "Invoice"],
  }),
  sendInvoice: builder.mutation<Invoice, { id: string; payload?: SendInvoicePayload }>({
    query: ({ id, payload }) => ({
      url: `/invoices/${id}/send`,
      method: "POST",
      body: payload,
    }),
    invalidatesTags: (_result, _error, { id }) => [{ type: "Invoice", id }, "Invoice"],
  }),
  markInvoicePaid: builder.mutation<Invoice, { id: string; payload: MarkInvoicePaidPayload }>({
    query: ({ id, payload }) => ({
      url: `/invoices/${id}/mark-paid`,
      method: "POST",
      body: payload,
    }),
    invalidatesTags: (_result, _error, { id }) => [{ type: "Invoice", id }, "Invoice"],
  }),
  cancelInvoice: builder.mutation<Invoice, string>({
    query: (id) => ({
      url: `/invoices/${id}/cancel`,
      method: "POST",
    }),
    invalidatesTags: (_result, _error, id) => [{ type: "Invoice", id }, "Invoice"],
  }),
  deleteInvoice: builder.mutation<void, string>({
    query: (id) => ({
      url: `/invoices/${id}`,
      method: "DELETE",
    }),
    invalidatesTags: (_result, _error, id) => [{ type: "Invoice", id }, "Invoice"],
  }),
  sendReminder: builder.mutation<SendReminderResponse, string>({
    query: (id) => ({
      url: `/invoices/${id}/remind`,
      method: "POST",
    }),
    invalidatesTags: (_result, _error, id) => [{ type: "Invoice", id }, "Invoice"],
  }),
  getInvoiceReminders: builder.query<InvoiceReminder[], string>({
    query: (id) => `/invoices/${id}/reminders`,
    providesTags: (_result, _error, id) => [{ type: "Invoice", id }],
  }),
  // Invoice Items
  createInvoiceItem: builder.mutation<InvoiceItem, { invoiceId: string; payload: CreateInvoiceItemPayload }>({
    query: ({ invoiceId, payload }) => ({
      url: `/invoices/${invoiceId}/items`,
      method: "POST",
      body: payload,
    }),
    invalidatesTags: (_result, _error, { invoiceId }) => [{ type: "Invoice", id: invoiceId }, "Invoice"],
  }),
  updateInvoiceItem: builder.mutation<InvoiceItem, { invoiceId: string; itemId: string; payload: UpdateInvoiceItemPayload }>({
    query: ({ invoiceId, itemId, payload }) => ({
      url: `/invoices/${invoiceId}/items/${itemId}`,
      method: "PATCH",
      body: payload,
    }),
    invalidatesTags: (_result, _error, { invoiceId }) => [{ type: "Invoice", id: invoiceId }, "Invoice"],
  }),
  deleteInvoiceItem: builder.mutation<void, { invoiceId: string; itemId: string }>({
    query: ({ invoiceId, itemId }) => ({
      url: `/invoices/${invoiceId}/items/${itemId}`,
      method: "DELETE",
    }),
    invalidatesTags: (_result, _error, { invoiceId }) => [{ type: "Invoice", id: invoiceId }, "Invoice"],
  }),
});
