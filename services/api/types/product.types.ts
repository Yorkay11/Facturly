// ==================== Product Types ====================

import { ListQueryParams, PaginatedResponse, BulkImportResponse } from './common.types';

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
  currency?: string; // Optionnel - le backend utilise automatiquement workspace.defaultCurrency
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
