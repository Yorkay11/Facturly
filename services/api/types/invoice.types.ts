// ==================== Invoice Types ====================

import { ListQueryParams, PaginatedResponse } from './common.types';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  totalAmount: string;
  product?: {
    id: string;
    name: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoicePayment {
  id: string;
  amount: string;
  currency?: string;
  paymentDate?: string;
  paidAt?: string; // Pour les paiements publics (format ISO)
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
  status: "draft" | "quote" | "sent" | "paid" | "cancelled" | "overdue";
  issueDate: string;
  dueDate: string;
  validUntil?: string; // Date de validité du devis (pour statut QUOTE)
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
  templateName?: string; // Nom du template backend (ex: "invoice", "invoice-modern", "invoice-classic")
  viewedAt?: string | null;
  rejectedAt?: string | null;
  rejectionComment?: string | null;
  rejectionReason?: string | null;
  client: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
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
  status: "draft" | "quote" | "sent" | "paid" | "cancelled" | "overdue";
  issueDate: string;
  dueDate: string;
  validUntil?: string;
  currency: string;
  subtotalAmount: string;
  taxAmount: string;
  totalAmount: string;
  amountPaid: string;
  client: {
    id: string;
    name: string;
  };
  rejectedAt?: string | null;
  createdAt?: string;
}

export interface CreateInvoicePayload {
  clientId: string;
  issueDate: string;
  dueDate?: string; // OPTIONNEL - Date d'échéance (format: YYYY-MM-DD)
  currency?: string; // OPTIONNEL - Devise (EUR, USD, XOF). Par défaut: devise de l'entreprise
  items: {
    productId?: string; // OPTIONNEL - UUID du produit (peut être null)
    description: string; // REQUIS
    quantity: string; // REQUIS - Quantité (string)
    unitPrice: string; // REQUIS - Prix unitaire (string)
  }[];
  notes?: string; // OPTIONNEL - Notes libres
  recipientEmail?: string; // OPTIONNEL - Email du destinataire
  sendEmail?: boolean; // OPTIONNEL - Envoyer l'email automatiquement (boolean)
  templateName?: string; // OPTIONNEL - Nom du template (voir liste ci-dessous)
}

export interface UpdateInvoicePayload {
  clientId?: string;
  issueDate?: string;
  dueDate?: string;
  validUntil?: string; // OPTIONNEL - Date de validité du devis (format: YYYY-MM-DD)
  currency?: string;
  notes?: string;
  status?: "draft" | "sent" | "paid" | "cancelled";
}

export type WhatsAppMessageStyle = 
  | 'professional_warm' 
  | 'direct' 
  | 'premium' 
  | 'humane' 
  | 'compact';

export interface SendInvoicePayload {
  sendEmail?: boolean;
  emailTo?: string;
  whatsappMessageStyle?: WhatsAppMessageStyle;
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

// Query parameters
export interface InvoiceListQueryParams extends ListQueryParams {
  status?: "draft" | "sent" | "paid" | "cancelled" | "overdue";
  clientId?: string;
}
