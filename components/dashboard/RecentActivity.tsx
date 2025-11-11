"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  status?: "info" | "success" | "warning";
}

interface RecentActivityProps {
  items: ActivityItem[];
  className?: string;
}

const statusVariants = {
  info: "bg-primary/10 text-primary",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
} as const;

export const RecentActivity = ({ items, className }: RecentActivityProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border border-primary/20 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            <span className="text-xs text-foreground/50">{item.time}</span>
          </div>
          <p className="mt-1 text-xs text-foreground/60">{item.description}</p>
          {item.status ? (
            <Badge className={cn("mt-2", statusVariants[item.status])}>{item.status}</Badge>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default RecentActivity;
