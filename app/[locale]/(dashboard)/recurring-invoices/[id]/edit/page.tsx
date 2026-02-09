"use client";

import { useParams } from "next/navigation";
import { RecurringInvoiceForm } from "@/components/recurring-invoices/RecurringInvoiceForm";
import Breadcrumb from "@/components/ui/breadcrumb";
import { useTranslations } from "next-intl";
import { useGetRecurringInvoiceByIdQuery } from "@/services/facturlyApi";
import { Loader2, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export default function EditRecurringInvoicePage() {
  const params = useParams();
  const t = useTranslations("recurringInvoices");
  const id = params.id as string;
  const { data: recurringInvoice, isLoading, isError } = useGetRecurringInvoiceByIdQuery(id);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (isError || !recurringInvoice) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumb
          items={[
            { label: t("breadcrumb.dashboard"), href: "/dashboard" },
            { label: t("breadcrumb.recurringInvoices"), href: "/recurring-invoices" },
            { label: t("edit") },
          ]}
        />
        <div className="rounded-xl border border-destructive bg-destructive/10 p-6 text-center">
          <FileQuestion className="mx-auto h-12 w-12 text-destructive/80 mb-4" />
          <h2 className="text-lg font-semibold text-destructive mb-2">{t("notFound.title")}</h2>
          <p className="text-muted-foreground mb-4">{t("notFound.description")}</p>
          <Button asChild variant="outline">
            <Link href="/recurring-invoices">{t("notFound.backToList")}</Link>
          </Button>
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
          { label: recurringInvoice.name || t("unnamed"), href: `/recurring-invoices/${id}` },
          { label: t("edit") },
        ]}
      />
      <RecurringInvoiceForm recurringInvoiceId={id} />
    </div>
  );
}
