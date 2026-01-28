// ==================== Payment Endpoints ====================

import type { EndpointBuilder } from '@reduxjs/toolkit/query';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type {
  InvoicePayment,
  CreatePaymentPayload,
  UpdatePaymentPayload,
  InitMonerooPaymentPayload,
  MonerooPaymentMethod,
  Bill,
  PayBillPayload,
  PaginatedResponse,
  BillListQueryParams,
  PublicInvoiceResponse,
  AcceptInvoiceResponse,
  RejectInvoicePayload,
  RejectInvoiceResponse,
} from '../types';
import type { TagTypes } from '../base';

export const paymentEndpoints = (
  builder: EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, TagTypes, 'facturlyApi'>
) => ({
  getInvoicePayments: builder.query<{ data: InvoicePayment[] }, string>({
    query: (invoiceId) => `/invoices/${invoiceId}/payments`,
    providesTags: (_result, _error, invoiceId) => [{ type: "Payment", id: invoiceId }],
  }),
  createPayment: builder.mutation<InvoicePayment, { invoiceId: string; payload: CreatePaymentPayload }>({
    query: ({ invoiceId, payload }) => ({
      url: `/invoices/${invoiceId}/payments`,
      method: "POST",
      body: payload,
    }),
    invalidatesTags: (_result, _error, { invoiceId }) => [{ type: "Payment", id: invoiceId }, { type: "Invoice", id: invoiceId }, "Invoice"],
  }),
  getPaymentById: builder.query<InvoicePayment, string>({
    query: (id) => `/payments/${id}`,
    providesTags: (_result, _error, id) => [{ type: "Payment", id }],
  }),
  updatePayment: builder.mutation<InvoicePayment, { id: string; payload: UpdatePaymentPayload }>({
    query: ({ id, payload }) => ({
      url: `/payments/${id}`,
      method: "PATCH",
      body: payload,
    }),
    invalidatesTags: (_result, _error, { id }) => [{ type: "Payment", id }, "Payment"],
  }),
  // Moneroo Mobile Money
  initMonerooPayment: builder.mutation<
    { checkoutUrl: string; paymentId: string; reference: string },
    InitMonerooPaymentPayload
  >({
    query: (body) => ({
      url: "/payments/moneroo/init",
      method: "POST",
      body,
    }),
    invalidatesTags: ["Payment", "Invoice"],
  }),
  getMonerooPaymentMethods: builder.query<MonerooPaymentMethod[], string | void>({
    query: (country) => {
      const searchParams = new URLSearchParams();
      if (country) searchParams.append("country", country);
      const queryString = searchParams.toString();
      return `/payments/moneroo/methods${queryString ? `?${queryString}` : ""}`;
    },
  }),
  checkMonerooPaymentStatus: builder.query<{ status: string }, string>({
    query: (reference) => `/payments/moneroo/status/${reference}`,
  }),
  // Bills (Received Invoices)
  getBills: builder.query<PaginatedResponse<Bill>, BillListQueryParams | void>({
    query: (params) => {
      const searchParams = new URLSearchParams();
      if (params && params.page) searchParams.append("page", params.page.toString());
      if (params && params.limit) searchParams.append("limit", params.limit.toString());
      if (params && params.status) searchParams.append("status", params.status);
      const queryString = searchParams.toString();
      return `/bills${queryString ? `?${queryString}` : ""}`;
    },
    providesTags: ["Bill"],
  }),
  getBillById: builder.query<Bill, string>({
    query: (id) => `/bills/${id}`,
    providesTags: (_result, _error, id) => [{ type: "Bill", id }],
  }),
  payBill: builder.mutation<Bill, { id: string; payload: PayBillPayload }>({
    query: ({ id, payload }) => ({
      url: `/bills/${id}/pay`,
      method: "POST",
      body: payload,
    }),
    invalidatesTags: (_result, _error, { id }) => [{ type: "Bill", id }, "Bill"],
  }),
  // Public Endpoints
  getPublicInvoice: builder.query<PublicInvoiceResponse, string>({
    query: (token) => `/public/invoice/${token}`,
  }),
  acceptPublicInvoice: builder.mutation<AcceptInvoiceResponse, string>({
    query: (token) => ({
      url: `/public/invoice/${token}/accept`,
      method: "POST",
    }),
  }),
  rejectPublicInvoice: builder.mutation<RejectInvoiceResponse, { token: string; payload: RejectInvoicePayload }>({
    query: ({ token, payload }) => ({
      url: `/public/invoice/${token}/reject`,
      method: "POST",
      body: payload,
    }),
  }),
});
