'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { Item } from '@/types/items';

const DRAFT_KEY = 'facturly_invoice_draft';
const DEBOUNCE_MS = 500;

export interface InvoiceDraftData {
  formData: {
    receiver: string;
    subject: string;
    issueDate: string; // ISO
    dueDate: string; // ISO
    currency: string;
    notes?: string;
  };
  items: Item[];
  metadata: {
    clientId?: string;
    templateId?: string;
  };
  savedAt: string; // ISO
}

function loadDraft(): InvoiceDraftData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as InvoiceDraftData;
    if (!data?.formData || !data?.items) return null;
    return data;
  } catch {
    return null;
  }
}

export function clearInvoiceDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

interface UseInvoiceDraftPersistenceOptions {
  form: UseFormReturn<any>;
  items: Item[];
  metadata: {
    clientId?: string;
    templateId?: string;
    receiver?: string;
    subject?: string;
    currency?: string;
  };
  isEditMode: boolean;
  setItems: (items: Item[]) => void;
  setMetadata: (values: Partial<{ clientId?: string; templateId?: string; receiver?: string; subject?: string; currency?: string; issueDate?: Date; dueDate?: Date }>) => void;
  onRestored?: () => void;
}

/**
 * Persists invoice form draft to localStorage (debounced).
 * Restores draft on mount when in creation mode.
 * Call clearInvoiceDraft() when invoice is successfully saved/sent.
 */
export function useInvoiceDraftPersistence({
  form,
  items,
  metadata,
  isEditMode,
  setItems,
  setMetadata,
  onRestored,
}: UseInvoiceDraftPersistenceOptions): { didRestoreDraft: boolean } {
  const didRestoreRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstSaveRunRef = useRef(true);
  const [didRestoreDraft, setDidRestoreDraft] = useState(false);

  // Restore draft on mount (creation mode only, once)
  useEffect(() => {
    if (isEditMode || didRestoreRef.current || typeof window === 'undefined') return;

    const draft = loadDraft();
    if (!draft) return;

    didRestoreRef.current = true;

    // Restore form
    form.reset({
      receiver: draft.formData.receiver || '',
      subject: draft.formData.subject || '',
      issueDate: draft.formData.issueDate ? new Date(draft.formData.issueDate) : undefined,
      dueDate: draft.formData.dueDate ? new Date(draft.formData.dueDate) : undefined,
      currency: draft.formData.currency || '',
      notes: draft.formData.notes || '',
    });

    // Restore items
    if (draft.items?.length) {
      setItems(draft.items);
    }

    // Restore metadata
    const restoredIssueDate = draft.formData.issueDate ? new Date(draft.formData.issueDate) : undefined;
    const restoredDueDate = draft.formData.dueDate ? new Date(draft.formData.dueDate) : undefined;
    setMetadata({
      clientId: draft.metadata.clientId,
      templateId: draft.metadata.templateId,
      receiver: draft.formData.receiver,
      subject: draft.formData.subject,
      currency: draft.formData.currency,
      issueDate: restoredIssueDate,
      dueDate: restoredDueDate,
    });

    setDidRestoreDraft(true);
    onRestored?.();
  }, [isEditMode, form, setItems, setMetadata, onRestored]);

  // Save draft on change (creation mode only, debounced)
  useEffect(() => {
    if (isEditMode) return;

    const save = () => {
      const values = form.getValues();
      const issueDate = values.issueDate;
      const dueDate = values.dueDate;
      const draft: InvoiceDraftData = {
        formData: {
          receiver: values.receiver ?? '',
          subject: values.subject ?? '',
          issueDate: issueDate instanceof Date ? issueDate.toISOString() : '',
          dueDate: dueDate instanceof Date ? dueDate.toISOString() : '',
          currency: values.currency ?? '',
          notes: values.notes ?? '',
        },
        items: [...items],
        metadata: {
          clientId: metadata.clientId,
          templateId: metadata.templateId,
        },
        savedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch {
        // ignore quota exceeded etc.
      }
    };

    const scheduleSave = () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(save, DEBOUNCE_MS);
    };

    // Skip initial save to avoid overwriting restored draft with empty state
    if (!isFirstSaveRunRef.current) {
      scheduleSave();
    }
    isFirstSaveRunRef.current = false;
    const subscription = form.watch(scheduleSave);

    return () => {
      subscription.unsubscribe();
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [isEditMode, form, items, metadata.clientId, metadata.templateId]);

  return { didRestoreDraft };
}
