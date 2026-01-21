"use client";

import * as React from "react";
import { useTranslations } from 'next-intl';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { Save, Send, Plus, Search, X } from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveDraft?: () => void;
  onSendInvoice?: () => void;
  onAddItem?: () => void;
  onFocusClient?: () => void;
  canSaveDraft?: boolean;
  canSendInvoice?: boolean;
}

export function CommandPalette({
  open,
  onOpenChange,
  onSaveDraft,
  onSendInvoice,
  onAddItem,
  onFocusClient,
  canSaveDraft = true,
  canSendInvoice = true,
}: CommandPaletteProps) {
  const t = useTranslations('invoices.commands');
  
  // Empêcher la propagation des touches clavier quand la palette est ouverte
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Empêcher Ctrl+K de fermer la palette
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder={t('searchPlaceholder')} />
      <CommandList>
        <CommandEmpty>{t('noResults')}</CommandEmpty>
        <CommandGroup heading={t('actions')}>
          <CommandItem
            onSelect={() => {
              onSaveDraft?.();
              onOpenChange(false);
            }}
            disabled={!canSaveDraft || !onSaveDraft}
          >
            <Save className="mr-2 h-4 w-4" />
            <span>{t('saveDraft')}</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onSendInvoice?.();
              onOpenChange(false);
            }}
            disabled={!canSendInvoice || !onSendInvoice}
          >
            <Send className="mr-2 h-4 w-4" />
            <span>{t('sendInvoice')}</span>
            <CommandShortcut>⌘↵</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onAddItem?.();
              onOpenChange(false);
            }}
            disabled={!onAddItem}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>{t('addItem')}</span>
            <CommandShortcut>N</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading={t('navigation')}>
          <CommandItem
            onSelect={() => {
              onFocusClient?.();
              onOpenChange(false);
            }}
            disabled={!onFocusClient}
          >
            <Search className="mr-2 h-4 w-4" />
            <span>{t('focusClient')}</span>
            <CommandShortcut>⌘K</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
