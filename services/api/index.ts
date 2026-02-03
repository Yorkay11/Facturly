// ==================== Facturly API - Main Entry Point ====================

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth, tagTypes, type TagTypes } from './base';
import { publicEndpoints } from './endpoints/public.endpoints';
import { authEndpoints } from './endpoints/auth.endpoints';
import { workspaceEndpoints } from './endpoints/workspace.endpoints';
import { clientEndpoints } from './endpoints/client.endpoints';
import { productEndpoints } from './endpoints/product.endpoints';
import { invoiceEndpoints } from './endpoints/invoice.endpoints';
import { recurringInvoiceEndpoints } from './endpoints/recurring-invoice.endpoints';
import { paymentEndpoints } from './endpoints/payment.endpoints';
import { dashboardEndpoints } from './endpoints/dashboard.endpoints';
import { reportsEndpoints } from './endpoints/reports.endpoints';
import { settingsEndpoints } from './endpoints/settings.endpoints';
import { notificationEndpoints } from './endpoints/notification.endpoints';
import { billingEndpoints } from './endpoints/billing.endpoints';
import { invoiceTemplateEndpoints } from './endpoints/invoice-template.endpoints';
import { waitlistEndpoints } from './endpoints/waitlist.endpoints';

// Export all types
export * from './types';

// Create the API
export const facturlyApi = createApi({
  reducerPath: "facturlyApi",
  baseQuery: baseQueryWithAuth,
  tagTypes,
  keepUnusedDataFor: 300, // Garder les données en cache 5 minutes (optimisation performance)
  endpoints: (builder) => ({
    ...publicEndpoints(builder),
    ...authEndpoints(builder),
    ...workspaceEndpoints(builder),
    ...clientEndpoints(builder),
    ...productEndpoints(builder),
    ...invoiceEndpoints(builder),
    ...recurringInvoiceEndpoints(builder),
    ...paymentEndpoints(builder),
    ...dashboardEndpoints(builder),
    ...reportsEndpoints(builder),
    ...settingsEndpoints(builder),
    ...notificationEndpoints(builder),
    ...billingEndpoints(builder),
    ...invoiceTemplateEndpoints(builder),
    ...waitlistEndpoints(builder),
  }),
});

// ==================== Exported Hooks ====================

export const {
  // Public
  useGetBetaAccessInfoQuery,
  useJoinWaitlistMutation,
  // Auth
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  // Users
  useUpdateUserMutation,
  // Workspaces
  useGetWorkspaceQuery,
  useGetWorkspacesQuery,
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
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
  // Recurring Invoices
  useGetRecurringInvoicesQuery,
  useGetRecurringInvoiceByIdQuery,
  useCreateRecurringInvoiceMutation,
  useUpdateRecurringInvoiceMutation,
  useUpdateRecurringInvoiceStatusMutation,
  useGenerateRecurringInvoiceMutation,
  useDeleteRecurringInvoiceMutation,
  // Payments
  useGetInvoicePaymentsQuery,
  useGetPaymentByIdQuery,
  // Settings
  useGetSettingsQuery,
  useUpdateSettingsMutation,
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
  // Notifications
  useGetNotificationsQuery,
  useGetUnreadNotificationsCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  useGetVapidPublicKeyQuery,
  useRegisterPushSubscriptionMutation,
  useUnregisterPushSubscriptionMutation,
        // Reports
        useGetRevenueByClientQuery,
        useGetRevenueByMonthQuery,
        useGetRevenueByProductQuery,
        useGetTopClientsQuery,
        useGetRevenueEvolutionQuery,
        useGetRevenueForecastQuery,
        useLazyExportReportsExcelQuery,
        useLazyExportReportsPDFQuery,
        // Moneroo Mobile Money
        useInitMonerooPaymentMutation,
  useGetMonerooPaymentMethodsQuery,
  useCheckMonerooPaymentStatusQuery,
  // Billing / Credits
  useGetPlansQuery,
  usePurchaseCreditsMutation,
  usePurchasePackMutation,
  // Invoice Templates
  useGetInvoiceTemplatesQuery,
  useGetDefaultInvoiceTemplateQuery,
  useGetInvoiceTemplateQuery,
  useCreateInvoiceTemplateMutation,
  useUpdateInvoiceTemplateMutation,
  useDeleteInvoiceTemplateMutation,
  useDuplicateInvoiceTemplateMutation,
} = facturlyApi;
