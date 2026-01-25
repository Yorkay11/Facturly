"use client";

import { RecurringInvoiceForm } from "@/components/recurring-invoices/RecurringInvoiceForm";
import Breadcrumb from "@/components/ui/breadcrumb";
import { useTranslations } from "next-intl";

export default function NewRecurringInvoicePage() {
  const t = useTranslations("recurringInvoices");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Breadcrumb
        items={[
          { label: t("breadcrumb.dashboard"), href: "/dashboard" },
          { label: t("breadcrumb.recurringInvoices"), href: "/recurring-invoices" },
          { label: t("create") },
        ]}
      />
      <RecurringInvoiceForm />
    </div>
  );
}
