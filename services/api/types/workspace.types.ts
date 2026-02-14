// ==================== Workspace Types ====================

export type WorkspaceType = 'FREELANCE' | 'INDIVIDUAL' | 'COMPANY';

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
  defaultTaxRate?: string; // Taux de TVA par défaut (ex: "0.18" pour 18%)
  logoUrl?: string | null;
  profileCompletion?: number;
  balance?: string; // Solde retirable du workspace
  balanceCurrency?: string; // Devise du solde
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWorkspacePayload {
  type: "FREELANCE" | "INDIVIDUAL" | "COMPANY";
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
