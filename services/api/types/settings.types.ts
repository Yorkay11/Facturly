// ==================== Settings Types ====================

export interface Settings {
  id: string;
  language: string;
  timezone: string;
  invoicePrefix: string;
  invoiceSequence: number;
  dateFormat: string;
  currency: string;
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
  paymentTerms?: number;
}
