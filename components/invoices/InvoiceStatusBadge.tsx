import { cn } from "@/lib/utils";

const statusMap: Record<
  "draft" | "sent" | "paid" | "overdue" | "cancelled",
  { label: string; className: string }
> = {
  draft: {
    label: "Brouillon",
    className: "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-900/20 dark:text-amber-400",
  },
  sent: {
    label: "Envoyée",
    className: "bg-indigo-100 text-indigo-800 border border-indigo-300 dark:bg-indigo-900/20 dark:text-indigo-400",
  },
  paid: {
    label: "Payée",
    className: "bg-green-100 text-green-800 border border-green-400 dark:bg-green-900/20 dark:text-green-400",
  },
  overdue: {
    label: "En retard",
    className: "bg-orange-100 text-orange-800 border border-orange-400 dark:bg-orange-900/20 dark:text-orange-400",
  },
  cancelled: {
    label: "Annulée",
    className: "bg-slate-200 text-slate-700 border border-slate-400 dark:bg-slate-800 dark:text-slate-300",
  },
};

interface InvoiceStatusBadgeProps {
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
}

export const InvoiceStatusBadge = ({ status }: InvoiceStatusBadgeProps) => {
  const config = statusMap[status];

  if (!config) {
    return (
      <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
        {status}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
};

export default InvoiceStatusBadge;
