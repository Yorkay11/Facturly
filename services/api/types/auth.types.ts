// ==================== Auth Types ====================

import { Workspace, WorkspaceType } from './workspace.types';

export interface AuthResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  workspace: {
    id: string;
    name?: string | null;
    type: WorkspaceType;
    defaultCurrency: string;
  } | null; // null si aucun workspace n'existe (nouvel utilisateur)
  accessToken: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  lastLoginAt?: string;
  profileCompletion?: number;
  workspace: Workspace | null;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  password?: string;
}
