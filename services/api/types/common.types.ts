// ==================== Common Types ====================

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

// Query parameters
export interface ListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Beta Access
export interface BetaAccessInfo {
  enabled: boolean;
  maxUsers: number | null;
  currentUsers: number;
  remaining: number | null;
  isFull: boolean;
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
