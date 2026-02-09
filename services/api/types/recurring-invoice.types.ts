// ==================== Recurring Invoice Types ====================

import { ListQueryParams, PaginatedResponse } from './common.types';
import { InvoiceSummary } from './invoice.types';

export type RecurrenceFrequency = 'monthly' | 'quarterly' | 'yearly';
export type RecurringInvoiceStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export interface RecurringInvoiceItem {
  id: string;
  productId?: string;
  description: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecurringInvoice {
  id: string;
  workspaceId: string;
  clientId: string;
  name?: string;
  frequency: RecurrenceFrequency;
  status: RecurringInvoiceStatus;
  startDate: string;
  endDate?: string;
  nextGenerationDate: string;
  dayOfMonth: number;
  autoSend: boolean;
  recipientEmail?: string;
  currency: string;
  templateName?: string;
  notes?: string;
  totalInvoicesGenerated: number;
  lastGeneratedAt?: string;
  notificationDaysBefore: number;
  client: {
    id: string;
    name: string;
    email?: string;
  };
  items?: RecurringInvoiceItem[];
  generatedInvoices?: InvoiceSummary[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRecurringInvoicePayload {
  clientId: string;
  name?: string;
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string;
  dayOfMonth: number;
  autoSend?: boolean;
  recipientEmail?: string;
  currency?: string;
  templateName?: string;
  notes?: string;
  notificationDaysBefore?: number;
  items: {
    productId?: string;
    description: string;
    quantity: string;
    unitPrice: string;
  }[];
}

export interface UpdateRecurringInvoicePayload {
  name?: string;
  frequency?: RecurrenceFrequency;
  startDate?: string;
  endDate?: string;
  dayOfMonth?: number;
  autoSend?: boolean;
  recipientEmail?: string;
  currency?: string;
  templateName?: string;
  notes?: string;
  notificationDaysBefore?: number;
  items?: {
    productId?: string;
    description: string;
    quantity: string;
    unitPrice: string;
  }[];
}

export interface UpdateRecurringInvoiceStatusPayload {
  status: RecurringInvoiceStatus;
}
