// ==================== Payment Types ====================

import { InvoicePayment } from './invoice.types';

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

// Moneroo Mobile Money
export type MonerooPaymentMethod =
  | 'orange_money_sn' // Sénégal
  | 'orange_money_ci' // Côte d'Ivoire
  | 'orange_money_ml' // Mali
  | 'mtn_momo_gh' // Ghana
  | 'mtn_momo_ci' // Côte d'Ivoire
  | 'mtn_momo_cm' // Cameroun
  | 'moov_money_bj' // Bénin
  | 'moov_money_tg' // Togo
  | 'wave_sn' // Sénégal
  | 'wave_ci'; // Côte d'Ivoire

/**
 * Payload pour initialiser un paiement Moneroo
 * 
 * Architecture: Hosted Checkout (pas de SDK frontend)
 * - Le backend génère un lien Moneroo (checkout_url)
 * - L'utilisateur est redirigé vers l'interface Moneroo
 * - Moneroo gère la sélection de méthode (Orange Money, MTN, Wave, etc.)
 */
export interface InitMonerooPaymentPayload {
  invoiceId: string;
  phoneNumber?: string; // Optionnel - Format international (ex: +221771234567). Moneroo peut le demander dans son UI
  customerName?: string;
  customerEmail?: string;
  // method supprimé - Moneroo gère la sélection dans son Hosted Checkout
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
  items?: Array<{
    id: string;
    description: string;
    quantity: string;
    unitPrice: string;
    totalAmount: string;
  }>;
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
  templateName?: string; // "invoice" | "invoice-modern" | "invoice-classic" | ...
  viewedAt?: string | null;
  rejectedAt?: string | null;
  rejectionComment?: string | null;
  rejectionReason?: string | null;
  items: Array<{
    id: string;
    description: string;
    quantity: string;
    unitPrice: string;
    totalAmount: string;
  }>;
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
  } | null;
  payments: InvoicePayment[];
}

export interface PublicInvoiceResponse {
  invoice: PublicInvoice;
  canAccept: boolean;
  canPay: boolean;
  isRejected: boolean;
  isPaid: boolean;
}

export interface AcceptInvoiceResponse {
  success: boolean;
  message: string;
  paymentLink: string; // Pour compatibilité
  checkoutUrl?: string; // URL de checkout Moneroo
  paymentId?: string; // Référence du paiement Moneroo
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

// Query parameters
export interface BillListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "RECEIVED" | "VIEWED" | "PAID" | "OVERDUE" | "CANCELLED";
}
