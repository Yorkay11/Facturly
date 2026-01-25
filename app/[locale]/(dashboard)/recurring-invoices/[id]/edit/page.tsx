"use client";

import { useParams } from "next/navigation";
import { RecurringInvoiceForm } from "@/components/recurring-invoices/RecurringInvoiceForm";
import Breadcrumb from "@/components/ui/breadcrumb";
import { useTranslations } from "next-intl";
import { useGetRecurringInvoiceByIdQuery } from "@/services/facturlyApi";
import { Loader2 } from "lucide-react";

export default function EditRecurringInvoicePage() {
  const params = useParams();
  const t = useTranslations("recurringInvoices");
  const id = params.id as string;
  const { data: recurringInvoice, isLoading } = useGetRecurringInvoiceByIdQuery(id);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Breadcrumb
        items={[
          { label: t("breadcrumb.dashboard"), href: "/dashboard" },
          { label: t("breadcrumb.recurringInvoices"), href: "/recurring-invoices" },
          { label: recurringInvoice?.name || t("unnamed"), href: `/recurring-invoices/${id}` },
          { label: t("edit") },
        ]}
      />
      <RecurringInvoiceForm recurringInvoiceId={id} />
    </div>
  );
}
