"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { useItemsStore } from "@/hooks/useItemStore";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";
import { useInvoiceMetadata } from "@/hooks/useInvoiceMetadata";
import { format } from "date-fns";
import { invoiceTemplates } from "@/types/invoiceTemplate";
import { TemplateClassic, TemplateBold, type InvoiceTemplateProps } from "@/templates/invoices";
import Skeleton from "@/components/ui/skeleton";
import { useItemModalControls } from "@/contexts/ItemModalContext";

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
    <div className="flex flex-wrap gap-2">
      {invoiceTemplates.map((template) => (
        <Button
          key={template.id}
          variant={template.id === activeTemplate ? "default" : "outline"}
          size="sm"
          className={cn(
            "border-primary/40",
            template.id === activeTemplate && "bg-primary text-primary-foreground"
          )}
          onClick={() => onChange(template.id)}
        >
          {template.name}
        </Button>
      ))}
    </div>
  );
};

const Preview = () => {
  const [loading, setLoading] = useState(false);
  const { items } = useItemsStore();
  const metadataStore = useInvoiceMetadata();
  const [activeTemplate, setActiveTemplate] = useState(invoiceTemplates[0].id);
  const [isHydrated, setIsHydrated] = useState(false);

  const currentTemplate = invoiceTemplates.find((tpl) => tpl.id === activeTemplate) ?? invoiceTemplates[0];
  const metadata = {
    receiver: metadataStore.receiver,
    subject: metadataStore.subject,
    issueDate: metadataStore.issueDate,
    dueDate: metadataStore.dueDate,
    notes: metadataStore.notes,
  };
  const TemplateComponent = templateRegistry[currentTemplate.id] ?? TemplateClassic;
  const { openCreate } = useItemModalControls();

  const onLoading = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1200);
  };

  useEffect(() => {
    onLoading();
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
            variant="secondary"
            size="sm"
            className="w-full gap-2 sm:w-auto"
            onClick={openCreate}
          >
            <Plus className="h-4 w-4" />
            Ajouter une ligne
          </Button>
        </div>
      </div>

      {isHydrated ? (
        <TemplateComponent
          metadata={metadata}
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

      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="outline"
          size="sm"
          className={cn("w-full sm:w-auto border-primary/40", { "animate-pulse": loading })}
          onClick={onLoading}
        >
          Regénérer
        </Button>
        <Button variant="default" size="sm" className="w-full sm:w-auto" disabled>
          Envoi rapide (bientôt)
        </Button>
      </div>
    </Card>
  );
};

export default Preview;
