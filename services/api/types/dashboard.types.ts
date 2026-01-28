// ==================== Dashboard Types ====================

import { InvoiceLimit } from './billing.types';

export interface DashboardActivity {
  type: string;
  date: string;
  title: string;
  description?: string;
  clientName?: string; // Nom du client pour l'interpolation
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
  currency?: string; // Devise de l'entreprise - tous les montants sont dans cette devise
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
export interface DashboardStatsQueryParams {
  month?: number;
  year?: number;
}

export interface DashboardActivitiesQueryParams {
  limit?: number;
}
