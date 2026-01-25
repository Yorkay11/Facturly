"use client";

import dynamic from "next/dynamic";
import Breadcrumb from "@/components/ui/breadcrumb";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load InvoiceTemplateManager (composant lourd avec formulaires complexes)
const InvoiceTemplateManager = dynamic(
  () => import("@/components/invoices/InvoiceTemplateManager").then((mod) => mod.InvoiceTemplateManager),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    ),
  }
);

export default function InvoiceTemplatesPage() {
  const t = useTranslations("invoices.templates");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Breadcrumb
        items={[
          { label: t("breadcrumb.home") || "Accueil", href: "/dashboard" },
          { label: t("breadcrumb.invoices") || "Factures", href: "/invoices" },
          {
            label: t("breadcrumb.templates") || "Templates",
            href: "/invoices/templates",
          },
        ]}
      />
      <InvoiceTemplateManager />
    </div>
  );
}
