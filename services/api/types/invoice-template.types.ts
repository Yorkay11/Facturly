/**
 * Types pour les templates de factures personnalisés
 */

export interface InvoiceTemplate {
  id: string;
  workspaceId: string;
  name: string;
  isDefault: boolean;
  baseTemplate: string; // 'invoice', 'invoice-modern', etc.
  logoUrl?: string;
  accentColor: string; // Hex color
  textColor: string; // Hex color
  backgroundColor: string; // Hex color
  headerText?: string;
  footerText?: string;
  showLogo: boolean;
  showCompanyDetails: boolean;
  showPaymentTerms: boolean;
  customHtml?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceTemplateDto {
  name: string;
  baseTemplate?: string;
  isDefault?: boolean;
  logoUrl?: string;
  accentColor?: string;
  textColor?: string;
  backgroundColor?: string;
  headerText?: string;
  footerText?: string;
  showLogo?: boolean;
  showCompanyDetails?: boolean;
  showPaymentTerms?: boolean;
  customHtml?: string;
}

export interface UpdateInvoiceTemplateDto {
  name?: string;
  baseTemplate?: string;
  isDefault?: boolean;
  logoUrl?: string;
  accentColor?: string;
  textColor?: string;
  backgroundColor?: string;
  headerText?: string;
  footerText?: string;
  showLogo?: boolean;
  showCompanyDetails?: boolean;
  showPaymentTerms?: boolean;
  customHtml?: string;
  isActive?: boolean;
}

export interface InvoiceTemplatesResponse {
  data: InvoiceTemplate[];
}

export interface DuplicateTemplateDto {
  name: string;
}
