import { cn } from "@/lib/utils";

const statusMap: Record<
  "draft" | "sent" | "paid" | "overdue" | "cancelled",
  { label: string; className: string }
> = {
  draft: {
    label: "Brouillon",
    className: "bg-primary/10 text-primary border border-primary/30",
  },
  sent: {
    label: "Envoyée",
    className: "bg-secondary text-secondary-foreground border border-primary/30",
  },
  paid: {
    label: "Payée",
    className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  },
  overdue: {
    label: "En retard",
    className: "bg-accent text-accent-foreground border border-accent/50",
  },
  cancelled: {
    label: "Annulée",
    className: "bg-gray-100 text-gray-700 border border-gray-200",
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
