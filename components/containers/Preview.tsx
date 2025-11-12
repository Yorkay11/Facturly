"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { useItemsStore } from "@/hooks/useItemStore";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";
import { useInvoiceMetadata } from "@/hooks/useInvoiceMetadata";
import { format } from "date-fns";
import { invoiceTemplates } from "@/types/invoiceTemplate";
import { TemplateClassic, TemplateBold, type InvoiceTemplateProps } from "@/templates/invoices";
import { useGetCompanyQuery, useGetClientByIdQuery } from "@/services/facturlyApi";
import Skeleton from "@/components/ui/skeleton";
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
import { Maximize2 } from "lucide-react";

const templateRegistry: Record<string, React.ComponentType<InvoiceTemplateProps>> = {
  classic: TemplateClassic,
  bold: TemplateBold,
};

const TemplateSelector = ({
  activeTemplate,
  onChange,
}: {
  activeTemplate: string;
  onChange: (templateId: string) => void;
}) => {
  return (
    <Select value={activeTemplate} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-[200px] border-primary/40">
        <SelectValue placeholder="Sélectionner un template" />
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

const Preview = () => {
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const { items } = useItemsStore();
  const metadataStore = useInvoiceMetadata();
  const [activeTemplate, setActiveTemplate] = useState(invoiceTemplates[0].id);
  const [isHydrated, setIsHydrated] = useState(false);

  // Récupérer les données de l'entreprise et du client
  const { data: company } = useGetCompanyQuery();
  const { data: client } = useGetClientByIdQuery(metadataStore.clientId || "", {
    skip: !metadataStore.clientId,
  });

  const currentTemplate = invoiceTemplates.find((tpl) => tpl.id === activeTemplate) ?? invoiceTemplates[0];
  const metadata = {
    receiver: metadataStore.receiver,
    subject: metadataStore.subject,
    issueDate: metadataStore.issueDate,
    dueDate: metadataStore.dueDate,
    notes: metadataStore.notes,
  };
  const TemplateComponent = templateRegistry[currentTemplate.id] ?? TemplateClassic;

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
  const currencyCode = metadataStore.currency ? metadataStore.currency.toUpperCase() : "EUR";
  const amountFormatter = useMemo(
    () =>
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: 2,
      }),
    [currencyCode]
  );

  const formatDate = (date?: Date) => (date ? format(date, "dd/MM/yyyy") : "--/--/----");

  return (
    <Card className="w-full flex-1 space-y-6 border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-slate-900">Aperçu</p>
          <p className="text-xs text-slate-500">Synchronisé avec les informations saisies.</p>
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
            Aperçu grand écran
          </Button>
        </div>
      </div>

      {isHydrated ? (
        <TemplateComponent
          metadata={metadata}
          company={company}
          client={client}
          items={items}
          subtotal={subtotal}
          vatAmount={vatAmount}
          totalAmount={totalAmount}
          formatAmount={(value) => amountFormatter.format(value)}
          formatDate={formatDate}
          template={currentTemplate}
        />
      ) : (
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-[280px] rounded-xl" />
        </div>
      )}

      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <Button variant="default" size="sm" className="w-full sm:w-auto" disabled>
          Envoi rapide (bientôt)
        </Button>
      </div>

      <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] p-6 overflow-y-auto translate-x-[-50%] translate-y-[-50%] left-[50%] top-[50%]">
          <DialogHeader>
            <DialogTitle>Aperçu de la facture</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="flex flex-col gap-4 mb-6">
              <TemplateSelector activeTemplate={activeTemplate} onChange={setActiveTemplate} />
            </div>
            {isHydrated ? (
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <TemplateComponent
                  metadata={metadata}
                  company={company}
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
    </Card>
  );
};

export default Preview;
