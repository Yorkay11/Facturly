"use client";

import { create } from "zustand";

export interface InvoiceMetadataState {
  receiver: string;
  clientId?: string;
  subject: string;
  issueDate?: Date;
  dueDate?: Date;
  currency: string;
  notes?: string;
}

interface InvoiceMetadataStore extends InvoiceMetadataState {
  setMetadata: (values: Partial<InvoiceMetadataState>) => void;
  reset: () => void;
}

const initialState: InvoiceMetadataState = {
  receiver: "",
  clientId: undefined,
  subject: "",
  issueDate: undefined,
  dueDate: undefined,
  currency: "",
  notes: "",
};

export const useInvoiceMetadata = create<InvoiceMetadataStore>((set) => ({
  ...initialState,
  setMetadata: (values) =>
    set((state) => ({
      ...state,
      ...values,
    })),
  reset: () => set(() => ({ ...initialState })),
}));
