import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";

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
  profileCompletion?: number;
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
  profileCompletion?: number;
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
  type?: "product" | "service"; // Optionnel car peut ne pas être retourné par le backend
  unitPrice: string; // Le backend retourne unitPrice
  currency: string;
  taxRate: string;
  unitOfMeasure?: string | null; // Le backend utilise unitOfMeasure (peut être null)
  sku?: string | null; // Peut être null
  isActive?: boolean;
  companyId?: string;
  createdAt?: string;
  updatedAt?: string;
  // Alias pour compatibilité avec le code existant
  price?: string; // Alias de unitPrice
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  type: "product" | "service";
  price: string; // Le backend accepte aussi unitPrice
  currency: string;
  taxRate: string;
  unitOfMeasure?: string; // Le backend attend unitOfMeasure, pas unit
  sku?: string;
  isActive?: boolean;
}

export interface UpdateProductPayload {
  name?: string;
  description?: string;
  type?: "product" | "service";
  price?: string; // Le backend accepte aussi unitPrice
  currency?: string;
  taxRate?: string;
  unitOfMeasure?: string; // Le backend attend unitOfMeasure
  sku?: string;
  isActive?: boolean;
}

// Bulk Import
export interface BulkImportCreatedItem {
  line: number;
  clientId?: string;
  productId?: string;
  name: string;
}

export interface BulkImportFailedItem {
  line: number;
  data: object;
  error: string;
}

export interface BulkImportResponse {
  total: number;
  successCount: number;
  failedCount: number;
  created: BulkImportCreatedItem[];
  failed: BulkImportFailedItem[];
}

export interface BulkImportClientsPayload {
  clients: CreateClientPayload[];
}

export interface BulkImportProductsPayload {
  products: Array<{
    name: string;
    description?: string;
    type?: "product" | "service";
    price?: string; // Le backend accepte price ou unitPrice
    unitPrice?: string; // Alias de price pour compatibilité
    currency?: string;
    taxRate?: string;
    unitOfMeasure?: string;
    sku?: string;
    isActive?: boolean;
  }>;
}

// Invoice Reminders
export interface InvoiceReminder {
  id: string;
  reminderNumber: number;
  sentAt: string;
  reminderType: "manual" | "automatic";
  dueDate: string;
  daysAfterDue: number;
  recipientEmail: string;
  createdAt: string;
}

export interface SendReminderResponse {
  success: boolean;
  reminderNumber: number;
  reminderId: string;
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
  invoice?: {
    id: string;
    invoiceNumber: string;
    totalAmount?: string;
    amountPaid?: string;
    client?: {
      id: string;
      name: string;
    };
  };
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
  recipientEmail?: string;
  paymentLinkToken?: string;
  paymentLinkExpiresAt?: string;
  paymentLink?: string;
  currency: string;
  subtotalAmount: string;
  taxAmount: string;
  totalAmount: string;
  amountPaid: string;
  notes?: string;
  viewedAt?: string | null;
  rejectedAt?: string | null;
  rejectionComment?: string | null;
  rejectionReason?: string | null;
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
  recipientEmail?: string;
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

// Bill (Received Invoice)
export interface BillInvoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  totalAmount: string;
  amountPaid: string;
  currency: string;
  status: "draft" | "sent" | "paid" | "cancelled" | "overdue";
  notes?: string;
  issuer?: {
    id: string;
    name: string;
    legalName?: string;
    addressLine1?: string;
    addressLine2?: string;
    postalCode?: string;
    city?: string;
    country?: string;
    taxId?: string;
    vatNumber?: string;
  };
  items?: InvoiceItem[];
  recipient?: {
    name: string;
    email: string;
  };
}

export interface Bill {
  id: string;
  invoice: BillInvoice;
  status: "RECEIVED" | "VIEWED" | "PAID" | "OVERDUE" | "CANCELLED";
  viewedAt?: string | null;
  paidAt?: string | null;
  payment?: {
    id: string;
    amount: string;
    currency: string;
    method: string;
    paidAt: string;
  };
  createdAt?: string;
}

export interface PayBillPayload {
  method: string;
  notes?: string;
}

// Public Invoice
export interface PublicInvoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: "draft" | "sent" | "paid" | "cancelled" | "overdue";
  currency: string;
  subtotalAmount: string;
  taxAmount: string;
  totalAmount: string;
  amountPaid: string;
  remainingAmount: string;
  notes?: string;
  viewedAt?: string | null;
  rejectedAt?: string | null;
  rejectionComment?: string | null;
  rejectionReason?: string | null;
  items: InvoiceItem[];
  issuer: {
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
    email?: string;
  };
  recipient: {
    id: string;
    name: string;
    email?: string;
    addressLine1?: string;
    city?: string;
    country?: string;
  };
  payments: InvoicePayment[];
}

export interface PublicInvoiceResponse {
  invoice: PublicInvoice;
  canAccept: boolean;
  canPay: boolean;
  isRejected: boolean;
  isPaid: boolean;
}

export interface PublicPayPayload {
  method: string;
  notes?: string;
  email?: string;
}

export interface PublicPayResponse {
  success: boolean;
  payment: {
    id: string;
    amount: string;
    currency: string;
    paidAt: string;
  };
  invoice: {
    id: string;
    invoiceNumber: string;
    status: string;
  };
}

export interface AcceptInvoiceResponse {
  success: boolean;
  message: string;
  paymentLink: string;
  remainingAmount: string;
  currency: string;
}

export interface RejectInvoicePayload {
  comment: string;
  reason?: string;
}

export interface RejectInvoiceResponse {
  success: boolean;
  message: string;
  rejectedAt: string;
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
// Nouveau format : catalogue depuis Stripe (pas de table plans)
export interface PlanCatalogItem {
  plan: "free" | "pro" | "enterprise";
  interval: "month" | "year";
  stripePriceId: string | null; // null = non configuré, désactiver l'option
}

// Ancien format Plan (pour compatibilité temporaire)
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

export interface InvoiceLimit {
  effective: number | null; // Limite effective (null = illimité)
  used: number; // Nombre de factures utilisées
  remaining: number | null; // Nombre restant (null = illimité)
  percentage: number | null; // Pourcentage utilisé (null = illimité)
  periodStart: string; // Date de début de période
  periodEnd: string; // Date de fin de période
  isUnlimited: boolean; // true si plan illimité
  isNearLimit: boolean; // true si >= 80% de la limite
  isLimitReached: boolean; // true si limite atteinte
}

export interface Subscription {
  id: string;
  status: "active" | "past_due" | "canceled" | string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan: "free" | "pro" | "enterprise"; // Nouveau format : string au lieu de Plan | null
  interval: "month" | "year"; // Nouveau format : intervalle de facturation
  invoicesIssuedCurrentPeriod?: number; // Nombre de factures émises dans la période actuelle
  invoiceLimit?: InvoiceLimit; // Informations détaillées sur la limite
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionPreview {
  currentPlan: {
    id: string;
    code: string;
    name: string;
    price: string;
    billingInterval?: "monthly" | "yearly";
    currency?: string;
  };
  newPlan: {
    id: string;
    code: string;
    name: string;
    price: string;
    billingInterval?: "monthly" | "yearly";
    currency?: string;
  };
  prorationAmount: string;
  creditAmount?: string | null;
  prorationDetails?: {
    daysElapsed: number;
    daysRemaining: number;
    totalDaysInPeriod: number;
    usedValue: string;
    remainingValue: string;
    isUpgrade: boolean;
    isDowngrade: boolean;
    intervalChange: boolean;
  };
  nextBillingDate: string;
  invoiceLimitChange: {
    current: number | null;
    new: number | null;
  };
}

// Stripe
export interface StripeCheckoutResponse {
  sessionId: string;
  url: string;
}

export interface StripePortalResponse {
  url: string;
}

// Client Revenue
export interface MonthlyRevenue {
  month: number;
  year: number;
  revenue: {
    currency: string;
    amount: string;
  }[];
  invoicesSent: number;
  invoicesPaid: number;
}

export interface ClientRevenue {
  clientId: string;
  clientName: string;
  monthlyRevenues: MonthlyRevenue[];
}

// Dashboard
export interface DashboardActivity {
  type: string;
  date: string;
  title: string;
  description?: string;
  amount?: string;
  currency?: string;
  status?: string;
  entityId: string;
  entityType: string;
}

export interface OverdueInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  dueDate: string;
  totalAmount: string;
  amountPaid: string;
  currency: string;
  daysOverdue: number;
}

export interface ClientWithUnpaidInvoices {
  clientId: string;
  clientName: string;
  clientEmail: string;
  unpaidCount: number;
  totalUnpaid: string;
}

export interface DashboardAlerts {
  overdueInvoices: OverdueInvoice[];
  clientsWithUnpaidInvoices: ClientWithUnpaidInvoices[];
  totalUnpaid: string;
}

export interface InvoiceStatusCount {
  status: "draft" | "sent" | "paid" | "cancelled" | "overdue";
  count: number;
}

export interface MonthlyRevenueData {
  month: number;
  year: number;
  revenue: string;
}

export interface DashboardStats {
  period: {
    month: number;
    year: number;
  };
  monthlyRevenue: {
    currency: string;
    amount: string;
  }[];
  invoicesSent: number;
  totalPaid: string;
  totalUnpaid: string;
  invoicesByStatus: InvoiceStatusCount[];
  monthlyRevenues: MonthlyRevenueData[];
  invoiceLimit?: InvoiceLimit; // Informations sur la limite de factures
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

export interface BillListQueryParams extends ListQueryParams {
  status?: "RECEIVED" | "VIEWED" | "PAID" | "OVERDUE" | "CANCELLED";
}

export interface ClientRevenueQueryParams {
  months?: number;
}

export interface DashboardStatsQueryParams {
  month?: number;
  year?: number;
}

export interface DashboardActivitiesQueryParams {
  limit?: number;
}

// ==================== Notifications ====================

export type NotificationType =
  | 'invoice_paid'
  | 'invoice_overdue'
  | 'invoice_sent'
  | 'invoice_rejected'
  | 'payment_received'
  | 'reminder_sent'
  | 'client_created'
  | 'system_alert';

export type NotificationPriority = 'info' | 'warning' | 'error' | 'success';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationListQueryParams extends ListQueryParams {
  read?: boolean;
  type?: NotificationType;
  priority?: NotificationPriority;
}

export interface UnreadCountResponse {
  count: number;
}

export interface MarkAllAsReadResponse {
  success: boolean;
  updatedCount: number;
}

// ==================== API Service ====================

// Fonction pour nettoyer les cookies et rediriger vers la page de connexion
function logoutAndRedirect() {
  if (typeof window !== "undefined") {
    // Supprimer les cookies
    document.cookie = "facturly_access_token=; path=/; max-age=0";
    document.cookie = "facturly_refresh_token=; path=/; max-age=0";
    
    // Rediriger vers la page de connexion
    window.location.href = "/login";
  }
}

// Base query standard
const baseQuery = fetchBaseQuery({
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
});

// Base query avec gestion des erreurs d'authentification
const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  
  // Gérer les erreurs d'authentification
  if (result.error && result.error.status === 401) {
    const errorData = result.error.data as { code?: string; message?: string };
    const errorCode = errorData?.code;
    
    // Codes qui nécessitent une déconnexion
    const logoutCodes = [
      "AUTH_TOKEN_EXPIRED",
      "AUTH_TOKEN_INVALID",
      "AUTH_TOKEN_MISSING",
      "AUTH_UNAUTHORIZED",
    ];
    
    if (errorCode && logoutCodes.includes(errorCode)) {
      // Nettoyer les cookies et rediriger vers la page de connexion
      logoutAndRedirect();
    }
  }
  
  return result;
};

// Beta Access
export interface BetaAccessInfo {
  enabled: boolean;
  maxUsers: number | null;
  currentUsers: number;
  remaining: number | null;
  isFull: boolean;
}

export const facturlyApi = createApi({
  reducerPath: "facturlyApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Invoice", "Client", "Product", "User", "Company", "Settings", "Subscription", "Payment", "Dashboard", "Bill", "Notification"],
  endpoints: (builder) => ({
    // ==================== Public ====================
    getBetaAccessInfo: builder.query<BetaAccessInfo, void>({
      query: () => ({
        url: "/public/beta",
      }),
      // Pas besoin d'auth pour cet endpoint public
    }),
    
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
      transformResponse: (response: { data: any[]; meta: any }) => {
        // Mapper unitPrice vers price pour compatibilité avec le code existant
        return {
          ...response,
          data: response.data.map((product) => ({
            ...product,
            price: product.unitPrice, // Alias pour compatibilité
          })),
        };
      },
      providesTags: ["Product"],
    }),
    getProductById: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      transformResponse: (product: any) => {
        // Mapper unitPrice vers price pour compatibilité avec le code existant
        return {
          ...product,
          price: product.unitPrice, // Alias pour compatibilité
        };
      },
      providesTags: (_result, _error, id) => [{ type: "Product", id }],
    }),
    createProduct: builder.mutation<Product, CreateProductPayload>({
      query: (body) => ({
        url: "/products",
        method: "POST",
        body: {
          ...body,
          // Le backend accepte price comme alias de unitPrice, mais on envoie price pour compatibilité
          unitPrice: body.price, // Envoyer unitPrice au backend
        },
      }),
      transformResponse: (product: any) => {
        // Mapper unitPrice vers price pour compatibilité avec le code existant
        return {
          ...product,
          price: product.unitPrice, // Alias pour compatibilité
        };
      },
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation<Product, { id: string; payload: UpdateProductPayload }>({
      query: ({ id, payload }) => {
        // Créer un nouveau payload sans price, en utilisant unitPrice à la place
        const { price, ...restPayload } = payload;
        const body = {
          ...restPayload,
          ...(price && { unitPrice: price }), // Convertir price en unitPrice pour le backend
        };
        return {
          url: `/products/${id}`,
          method: "PATCH",
          body,
        };
      },
      transformResponse: (product: any) => {
        // Mapper unitPrice vers price pour compatibilité avec le code existant
        return {
          ...product,
          price: product.unitPrice, // Alias pour compatibilité
        };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: "Product", id }, "Product"],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
    bulkImportProducts: builder.mutation<BulkImportResponse, BulkImportProductsPayload>({
      query: (body) => ({
        url: "/products/bulk",
        method: "POST",
        body,
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
    // Note: GET /plans n'existe plus dans le backend, les plans sont définis localement dans le frontend
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
    previewSubscription: builder.mutation<SubscriptionPreview, { planId: string }>({
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

    // ==================== Stripe ====================
    createCheckoutSession: builder.mutation<
      StripeCheckoutResponse,
      { plan: "free" | "pro" | "enterprise"; interval: "month" | "year" }
    >({
      query: (body) => ({
        url: "/checkout/create",
        method: "POST",
        body,
      }),
    }),
    changePlan: builder.mutation<
      {
        success: boolean;
        subscriptionId: string;
        plan: "free" | "pro" | "enterprise";
        interval: "month" | "year";
      },
      { plan: "free" | "pro" | "enterprise"; interval: "month" | "year" }
    >({
      query: (body) => ({
        url: "/subscriptions/change-plan",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Subscription"],
    }),
    createPortalSession: builder.mutation<StripePortalResponse, void>({
      query: () => ({
        url: "/portal/create",
        method: "POST",
      }),
    }),

    // ==================== Dashboard ====================
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

    // ==================== Bills (Received Invoices) ====================
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

    // ==================== Public Endpoints ====================
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
    payPublicInvoice: builder.mutation<PublicPayResponse, { token: string; payload: PublicPayPayload }>({
      query: ({ token, payload }) => ({
        url: `/public/pay/${token}`,
        method: "POST",
        body: payload,
      }),
    }),

    // ==================== Notifications ====================
    getNotifications: builder.query<PaginatedResponse<Notification>, NotificationListQueryParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params && params.page) searchParams.append("page", params.page.toString());
        if (params && params.limit) searchParams.append("limit", params.limit.toString());
        if (params && params.read !== undefined) searchParams.append("read", params.read.toString());
        if (params && params.type) searchParams.append("type", params.type);
        if (params && params.priority) searchParams.append("priority", params.priority);
        const queryString = searchParams.toString();
        return `/notifications${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Notification"],
    }),
    getUnreadNotificationsCount: builder.query<UnreadCountResponse, void>({
      query: () => "/notifications/unread-count",
      providesTags: ["Notification"],
    }),
    markNotificationAsRead: builder.mutation<Notification, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
    markAllNotificationsAsRead: builder.mutation<MarkAllAsReadResponse, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
    deleteNotification: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

// ==================== Exported Hooks ====================

export const {
  // Public
  useGetBetaAccessInfoQuery,
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
  useGetClientRevenueQuery,
  useBulkImportClientsMutation,
  // Products
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useBulkImportProductsMutation,
  // Invoices
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useSendInvoiceMutation,
  useMarkInvoicePaidMutation,
  useCancelInvoiceMutation,
  useDeleteInvoiceMutation,
  useSendReminderMutation,
  useGetInvoiceRemindersQuery,
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
  // Note: useGetPlansQuery supprimé car GET /plans n'existe plus dans le backend
  useGetSubscriptionQuery,
  useCreateSubscriptionMutation,
  usePreviewSubscriptionMutation,
  useCancelSubscriptionMutation,
  // Stripe
  useCreateCheckoutSessionMutation,
  useChangePlanMutation,
  useCreatePortalSessionMutation,
  // Dashboard
  useGetDashboardActivitiesQuery,
  useGetDashboardAlertsQuery,
  useGetDashboardStatsQuery,
  // Bills
  useGetBillsQuery,
  useGetBillByIdQuery,
  usePayBillMutation,
  // Public
  useGetPublicInvoiceQuery,
  useAcceptPublicInvoiceMutation,
  useRejectPublicInvoiceMutation,
  usePayPublicInvoiceMutation,
  // Notifications
  useGetNotificationsQuery,
  useGetUnreadNotificationsCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
} = facturlyApi;
