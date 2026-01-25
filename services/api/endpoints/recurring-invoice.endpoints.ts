// ==================== Recurring Invoice Endpoints ====================

import type { EndpointBuilder } from '@reduxjs/toolkit/query';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type {
  RecurringInvoice,
  CreateRecurringInvoicePayload,
  UpdateRecurringInvoicePayload,
  UpdateRecurringInvoiceStatusPayload,
  Invoice,
} from '../types';
import type { TagTypes } from '../base';

export const recurringInvoiceEndpoints = (
  builder: EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, TagTypes, 'facturlyApi'>
) => ({
  getRecurringInvoices: builder.query<RecurringInvoice[], void>({
    query: () => '/recurring-invoices',
    providesTags: ['RecurringInvoice'],
  }),
  getRecurringInvoiceById: builder.query<RecurringInvoice, string>({
    query: (id) => `/recurring-invoices/${id}`,
    providesTags: (_result, _error, id) => [{ type: 'RecurringInvoice', id }],
  }),
  createRecurringInvoice: builder.mutation<RecurringInvoice, CreateRecurringInvoicePayload>({
    query: (body) => ({
      url: '/recurring-invoices',
      method: 'POST',
      body,
    }),
    invalidatesTags: ['RecurringInvoice'],
  }),
  updateRecurringInvoice: builder.mutation<RecurringInvoice, { id: string; payload: UpdateRecurringInvoicePayload }>({
    query: ({ id, payload }) => ({
      url: `/recurring-invoices/${id}`,
      method: 'PATCH',
      body: payload,
    }),
    invalidatesTags: (_result, _error, { id }) => [{ type: 'RecurringInvoice', id }, 'RecurringInvoice'],
  }),
  updateRecurringInvoiceStatus: builder.mutation<RecurringInvoice, { id: string; status: string }>({
    query: ({ id, status }) => ({
      url: `/recurring-invoices/${id}/status`,
      method: 'PATCH',
      body: { status },
    }),
    invalidatesTags: (_result, _error, { id }) => [{ type: 'RecurringInvoice', id }, 'RecurringInvoice'],
  }),
  generateRecurringInvoice: builder.mutation<Invoice, string>({
    query: (id) => ({
      url: `/recurring-invoices/${id}/generate`,
      method: 'POST',
    }),
    invalidatesTags: ['RecurringInvoice', 'Invoice'],
  }),
  deleteRecurringInvoice: builder.mutation<void, string>({
    query: (id) => ({
      url: `/recurring-invoices/${id}`,
      method: 'DELETE',
    }),
    invalidatesTags: ['RecurringInvoice'],
  }),
});
