import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://facturlybackend-production.up.railway.app";
// const BASE_URL = "http://192.168.1.69:3000";

// ==================== Types & Interfaces ====================

// Pagination
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Auth
export interface AuthResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: {
    id: string;
    name: string;
    defaultCurrency: string;
  };
  accessToken: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  lastLoginAt?: string;
  company: Company;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  password?: string;
}

// Company
export interface Company {
  id: string;
  name: string;
  legalName?: string;
  taxId?: string;
  vatNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  defaultCurrency: string;
  logoUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateCompanyPayload {
  name?: string;
  legalName?: string;
  taxId?: string;
  vatNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  defaultCurrency?: string;
}

// Client
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  taxId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClientPayload {
  name: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  taxId?: string;
  notes?: string;
}

export interface UpdateClientPayload {
  name?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  taxId?: string;
  notes?: string;
}

// Product
export interface Product {
  id: string;
  name: string;
  description?: string;
  type: "product" | "service";
  price: string;
  currency: string;
  taxRate: string;
  unit?: string;
  sku?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  type: "product" | "service";
  price: string;
  currency: string;
  taxRate: string;
  unit?: string;
  sku?: string;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  type?: "product" | "service";
  price?: string;
  currency?: string;
  taxRate?: string;
  unit?: string;
  sku?: string;
}

// Invoice
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  totalAmount: string;
  product?: {
    id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoicePayment {
  id: string;
  amount: string;
  paymentDate: string;
  method: string;
  status: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: "draft" | "sent" | "paid" | "cancelled" | "overdue";
  issueDate: string;
  dueDate: string;
  sentAt?: string;
  currency: string;
  subtotalAmount: string;
  taxAmount: string;
  totalAmount: string;
  amountPaid: string;
  notes?: string;
  client: {
    id: string;
    name: string;
    email?: string;
    addressLine1?: string;
    city?: string;
    country?: string;
  };
  items?: InvoiceItem[];
  payments?: InvoicePayment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  status: "draft" | "sent" | "paid" | "cancelled" | "overdue";
  issueDate: string;
  dueDate: string;
  currency: string;
  subtotalAmount: string;
  taxAmount: string;
  totalAmount: string;
  amountPaid: string;
  client: {
    id: string;
    name: string;
  };
  createdAt?: string;
}

export interface CreateInvoicePayload {
  clientId: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  items: {
    productId?: string;
    description: string;
    quantity: string;
    unitPrice: string;
  }[];
  notes?: string;
}

export interface UpdateInvoicePayload {
  clientId?: string;
  issueDate?: string;
  dueDate?: string;
  currency?: string;
  notes?: string;
  status?: "draft" | "sent" | "paid" | "cancelled";
}

export interface SendInvoicePayload {
  sendEmail?: boolean;
  emailTo?: string;
}

export interface MarkInvoicePaidPayload {
  amount: string;
  paymentDate: string;
  method: string;
  notes?: string;
}

// Invoice Items
export interface CreateInvoiceItemPayload {
  productId?: string;
  description: string;
  quantity: string;
  unitPrice: string;
}

export interface UpdateInvoiceItemPayload {
  description?: string;
  quantity?: string;
  unitPrice?: string;
}

// Payment
export interface CreatePaymentPayload {
  amount: string;
  paymentDate: string;
  method: string;
  notes?: string;
}

export interface UpdatePaymentPayload {
  status?: string;
  notes?: string;
}

// Settings
export interface Settings {
  id: string;
  language: string;
  timezone: string;
  invoicePrefix: string;
  invoiceSequence: number;
  dateFormat: string;
  currency: string;
  taxRate: string;
  paymentTerms: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateSettingsPayload {
  language?: string;
  timezone?: string;
  invoicePrefix?: string;
  dateFormat?: string;
  currency?: string;
  taxRate?: string;
  paymentTerms?: number;
}

// Plans & Subscriptions
export interface Plan {
  id: string;
  code: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  billingInterval: string;
  invoiceLimit: number | null;
  metadata?: {
    features?: string[];
  };
}

export interface Subscription {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan: Plan;
  createdAt?: string;
  updatedAt?: string;
}

// Query parameters
export interface ListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface InvoiceListQueryParams extends ListQueryParams {
  status?: "draft" | "sent" | "paid" | "cancelled" | "overdue";
  clientId?: string;
}

// ==================== API Service ====================

export const facturlyApi = createApi({
  reducerPath: "facturlyApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const cookies = document.cookie.split("; ");
        const tokenCookie = cookies.find((cookie) => cookie.startsWith("facturly_access_token="));
        if (tokenCookie) {
          const token = tokenCookie.split("=")[1];
          headers.set("authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ["Invoice", "Client", "Product", "User", "Company", "Settings", "Subscription", "Payment"],
  endpoints: (builder) => ({
    // ==================== Auth ====================
    register: builder.mutation<AuthResponse, RegisterPayload>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),
    login: builder.mutation<AuthResponse, LoginPayload>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
    getMe: builder.query<User, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),

    // ==================== Users ====================
    updateUser: builder.mutation<User, UpdateUserPayload>({
      query: (body) => ({
        url: "/users/me",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    // ==================== Companies ====================
    getCompany: builder.query<Company, void>({
      query: () => "/companies/me",
      providesTags: ["Company"],
    }),
    updateCompany: builder.mutation<Company, UpdateCompanyPayload>({
      query: (body) => ({
        url: "/companies/me",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Company", "User"],
    }),

    // ==================== Clients ====================
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

    // ==================== Products ====================
    getProducts: builder.query<PaginatedResponse<Product>, ListQueryParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params && params.page) searchParams.append("page", params.page.toString());
        if (params && params.limit) searchParams.append("limit", params.limit.toString());
        if (params && params.search) searchParams.append("search", params.search);
        const queryString = searchParams.toString();
        return `/products${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Product"],
    }),
    getProductById: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Product", id }],
    }),
    createProduct: builder.mutation<Product, CreateProductPayload>({
      query: (body) => ({
        url: "/products",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation<Product, { id: string; payload: UpdateProductPayload }>({
      query: ({ id, payload }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Product", id }, "Product"],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),

    // ==================== Invoices ====================
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

    // ==================== Invoice Items ====================
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

    // ==================== Payments ====================
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

    // ==================== Settings ====================
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

    // ==================== Plans & Subscriptions ====================
    getPlans: builder.query<{ data: Plan[] }, void>({
      query: () => "/plans",
      providesTags: ["Subscription"],
    }),
    getSubscription: builder.query<Subscription, void>({
      query: () => "/subscriptions/me",
      providesTags: ["Subscription"],
    }),
    createSubscription: builder.mutation<Subscription, { planId: string }>({
      query: (body) => ({
        url: "/subscriptions",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Subscription"],
    }),
    previewSubscription: builder.mutation<any, { planId: string }>({
      query: (body) => ({
        url: "/subscriptions/preview",
        method: "POST",
        body,
      }),
    }),
    cancelSubscription: builder.mutation<Subscription, void>({
      query: () => ({
        url: "/subscriptions/cancel",
        method: "POST",
      }),
      invalidatesTags: ["Subscription"],
    }),
  }),
});

// ==================== Exported Hooks ====================

export const {
  // Auth
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  // Users
  useUpdateUserMutation,
  // Companies
  useGetCompanyQuery,
  useUpdateCompanyMutation,
  // Clients
  useGetClientsQuery,
  useGetClientByIdQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  // Products
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  // Invoices
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useSendInvoiceMutation,
  useMarkInvoicePaidMutation,
  useCancelInvoiceMutation,
  useDeleteInvoiceMutation,
  // Invoice Items
  useCreateInvoiceItemMutation,
  useUpdateInvoiceItemMutation,
  useDeleteInvoiceItemMutation,
  // Payments
  useGetInvoicePaymentsQuery,
  useCreatePaymentMutation,
  useGetPaymentByIdQuery,
  useUpdatePaymentMutation,
  // Settings
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  // Plans & Subscriptions
  useGetPlansQuery,
  useGetSubscriptionQuery,
  useCreateSubscriptionMutation,
  usePreviewSubscriptionMutation,
  useCancelSubscriptionMutation,
} = facturlyApi;
