"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const statusClassMap: Record<
  "draft" | "quote" | "sent" | "paid" | "overdue" | "cancelled" | "rejected",
  string
> = {
  draft: "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-900/20 dark:text-amber-400",
  quote: "bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-900/20 dark:text-sky-400",
  sent: "bg-indigo-100 text-indigo-800 border border-indigo-300 dark:bg-indigo-900/20 dark:text-indigo-400",
  paid: "bg-green-100 text-green-800 border border-green-400 dark:bg-green-900/20 dark:text-green-400",
  overdue: "bg-orange-100 text-orange-800 border border-orange-400 dark:bg-orange-900/20 dark:text-orange-400",
  cancelled: "bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-700/50 dark:text-slate-300",
  rejected: "bg-red-100 text-red-800 border border-red-300 dark:bg-red-900/20 dark:text-red-400",
};

interface InvoiceStatusBadgeProps {
  status: "draft" | "quote" | "sent" | "paid" | "overdue" | "cancelled" | "rejected";
}

export const InvoiceStatusBadge = ({ status }: InvoiceStatusBadgeProps) => {
  const t = useTranslations("invoices");
  const className = statusClassMap[status];

  if (!className) {
    return (
      <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
        {status}
      </span>
    );
  }

  const label = t(status as keyof typeof statusClassMap);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        className
      )}
    >
      {label}
    </span>
  );
};

export default InvoiceStatusBadge;
