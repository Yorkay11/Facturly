// ==================== Client Types ====================

import { ListQueryParams, PaginatedResponse, BulkImportResponse } from './common.types';

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
  email: string;
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

export interface BulkImportClientsPayload {
  clients: CreateClientPayload[];
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

export interface ClientRevenueQueryParams {
  months?: number;
}
