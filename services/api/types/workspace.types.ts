// ==================== Workspace Types ====================

export type WorkspaceType = 'INDIVIDUAL' | 'COMPANY';

export interface Workspace {
  id: string;
  type: WorkspaceType;
  name?: string | null; // Optionnel pour INDIVIDUAL
  legalName?: string;
  taxId?: string;
  vatNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  defaultCurrency: string;
  logoUrl?: string | null;
  profileCompletion?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWorkspacePayload {
  type: "INDIVIDUAL" | "COMPANY";
  name?: string | null;
  defaultCurrency: string;
  legalName?: string;
  taxId?: string;
  vatNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  city?: string;
  country?: string;
}

export interface UpdateWorkspacePayload {
  name?: string | null;
  legalName?: string;
  taxId?: string;
  vatNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  defaultCurrency?: string;
  logoUrl?: string;
  type?: WorkspaceType;
}
