"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { useItemsStore } from "@/hooks/useItemStore";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";
import { useInvoiceMetadata } from "@/hooks/useInvoiceMetadata";
import { format } from "date-fns";
import { invoiceTemplates } from "@/types/invoiceTemplate";
import {
  TemplateInvoice,
  TemplateProfessional,
  TemplateModern,
  TemplateMinimal,
  TemplateElegant,
  TemplateCompact,
  TemplateColorful,
  TemplateClassicSerif,
  type InvoiceTemplateProps,
} from "@/templates/invoices";
import { useGetWorkspaceQuery, useGetClientByIdQuery } from "@/services/facturlyApi";
import { getBackendTemplateName } from "@/types/invoiceTemplate";
import Skeleton from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Maximize2 } from "lucide-react";
import { useTranslations, useLocale } from 'next-intl';

const templateRegistry: Record<string, React.ComponentType<InvoiceTemplateProps>> = {
  invoice: TemplateInvoice,
  professional: TemplateProfessional,
  modern: TemplateModern,
  minimal: TemplateMinimal,
  elegant: TemplateElegant,
  compact: TemplateCompact,
  colorful: TemplateColorful,
  classicSerif: TemplateClassicSerif,
};

const TemplateSelector = ({
  activeTemplate,
  onChange,
}: {
  activeTemplate: string;
  onChange: (templateId: string) => void;
}) => {
  const t = useTranslations('invoices.preview');
  return (
    <Select value={activeTemplate} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-[200px] border-primary/40">
        <SelectValue placeholder={t('templateSelector.placeholder')} />
      </SelectTrigger>
      <SelectContent>
        {invoiceTemplates.map((template) => (
          <SelectItem key={template.id} value={template.id}>
            {template.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

interface PreviewProps {
  invoiceId?: string;
}

const Preview = ({ invoiceId }: PreviewProps = {}) => {
  const t = useTranslations('invoices.preview');
  const locale = useLocale();
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const { items } = useItemsStore();
  const metadataStore = useInvoiceMetadata();
  // Utiliser le template depuis le store, avec fallback sur le template par défaut
  const [activeTemplate, setActiveTemplate] = useState(metadataStore.templateId || invoiceTemplates[0].id);
  const [isHydrated, setIsHydrated] = useState(false);

  // Synchroniser le template avec le store quand il change
  useEffect(() => {
    if (activeTemplate !== metadataStore.templateId) {
      metadataStore.setMetadata({ templateId: activeTemplate });
    }
  }, [activeTemplate]);

  // Synchroniser le state local avec le store si le template change depuis l'extérieur
  useEffect(() => {
    if (metadataStore.templateId && metadataStore.templateId !== activeTemplate) {
      setActiveTemplate(metadataStore.templateId);
    }
  }, [metadataStore.templateId]);

  // Détecter si on est sur un grand écran (lg et plus)
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.matchMedia("(min-width: 1024px)").matches);
    };
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Récupérer les données de l'entreprise et du client
  const { data: workspace } = useGetWorkspaceQuery();
  const { data: client } = useGetClientByIdQuery(metadataStore.clientId || "", {
    skip: !metadataStore.clientId,
  });

  // Utiliser la devise du workspace comme fallback
  const workspaceCurrency = workspace?.defaultCurrency || "EUR";

  const currentTemplate = invoiceTemplates.find((tpl) => tpl.id === activeTemplate) ?? invoiceTemplates[0];
  
  // S'assurer que les dates sont bien des objets Date
  const issueDate = metadataStore.issueDate instanceof Date 
    ? metadataStore.issueDate 
    : metadataStore.issueDate 
      ? new Date(metadataStore.issueDate) 
      : undefined;
  const dueDate = metadataStore.dueDate instanceof Date 
    ? metadataStore.dueDate 
    : metadataStore.dueDate 
      ? new Date(metadataStore.dueDate) 
      : undefined;
  
  const metadata = {
    receiver: metadataStore.receiver,
    subject: metadataStore.subject,
    issueDate: issueDate,
    dueDate: dueDate,
    notes: metadataStore.notes,
  };
  const TemplateComponent = templateRegistry[currentTemplate.id] ?? TemplateInvoice;

  useEffect(() => {
    const timer = setTimeout(() => setIsHydrated(true), 400);
    return () => clearTimeout(timer);
  }, [items, activeTemplate])
  
  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    [items]
  );
  const vatAmount = useMemo(
    () => items.reduce((total, item) => total + (item.unitPrice * item.quantity * item.vatRate) / 100, 0),
    [items]
  );
  const totalAmount = subtotal + vatAmount;
      const currencyCode = metadataStore.currency ? metadataStore.currency.toUpperCase() : workspaceCurrency.toUpperCase();
  const amountFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale === 'fr' ? "fr-FR" : "en-US", {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: 2,
      }),
    [currencyCode, locale]
  );

  const formatDate = (date?: Date) => {
    if (!date) return "--/--/----";
    // S'assurer que c'est bien un objet Date
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return "--/--/----";
    return format(dateObj, locale === 'fr' ? "dd/MM/yyyy" : "MM/dd/yyyy");
  };

  return (
    <div className="w-full flex-1 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-slate-200/50 shadow-sm">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-slate-900">{t('title')}</p>
          <p className="text-xs text-slate-500">{t('description')}</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <TemplateSelector activeTemplate={activeTemplate} onChange={setActiveTemplate} />
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 sm:w-auto border-primary/40 text-primary hover:bg-primary/10"
            onClick={() => setIsFullscreenOpen(true)}
          >
            <Maximize2 className="h-4 w-4" />
            {t('fullscreen')}
          </Button>
        </div>
      </div>

      {isHydrated ? (
        <div data-invoice-preview className="bg-white rounded-lg shadow-sm p-6 border border-slate-200/50">
          <TemplateComponent
            metadata={metadata}
            workspace={workspace}
            client={client}
            items={items}
            subtotal={subtotal}
            vatAmount={vatAmount}
            totalAmount={totalAmount}
            formatAmount={(value) => amountFormatter.format(value)}
            formatDate={formatDate}
            template={currentTemplate}
          />
        </div>
      ) : (
        <div className="space-y-4 bg-white rounded-lg p-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-[280px] rounded-xl" />
        </div>
      )}


      {/* Dialog pour petits écrans */}
      {!isLargeScreen && (
        <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] p-4 overflow-y-auto translate-x-[-50%] translate-y-[-50%] left-[50%] top-[50%]">
            <DialogHeader>
              <DialogTitle>{t('fullscreenTitle')}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <div className="flex flex-col gap-4 mb-6">
                <TemplateSelector activeTemplate={activeTemplate} onChange={setActiveTemplate} />
              </div>
              {isHydrated ? (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <TemplateComponent
                    metadata={metadata}
                    workspace={workspace}
                    client={client}
                    items={items}
                    subtotal={subtotal}
                    vatAmount={vatAmount}
                    totalAmount={totalAmount}
                    formatAmount={(value) => amountFormatter.format(value)}
                    formatDate={formatDate}
                    template={currentTemplate}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-[280px] rounded-xl" />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Sheet pour grands écrans */}
      {isLargeScreen && (
        <Sheet open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
          <SheetContent side="bottom" className="h-[95vh] w-full max-w-full overflow-y-auto p-4">
            <SheetHeader>
              <SheetTitle>{t('fullscreenTitle')}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <div className="flex flex-col gap-4 mb-6">
                <TemplateSelector activeTemplate={activeTemplate} onChange={setActiveTemplate} />
              </div>
              {isHydrated ? (
                <div className="bg-white p-4 rounded-lg shadow-sm max-w-5xl mx-auto">
                  <TemplateComponent
                    metadata={metadata}
                    workspace={workspace}
                    client={client}
                    items={items}
                    subtotal={subtotal}
                    vatAmount={vatAmount}
                    totalAmount={totalAmount}
                    formatAmount={(value) => amountFormatter.format(value)}
                    formatDate={formatDate}
                    template={currentTemplate}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-[280px] rounded-xl" />
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default Preview;
