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
  info: {
    dot: "bg-primary",
    badge: "bg-primary/10 text-primary border-primary/20",
  },
  success: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  warning: {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
} as const;

export const RecentActivity = ({ items, className }: RecentActivityProps) => {
  return (
    <div className={cn("relative", className)}>
      {/* Timeline verticale */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
      
      <div className="space-y-3">
        {items.map((item, index) => {
          const status = item.status || "info";
          const statusStyle = statusVariants[status];
          
          return (
            <div key={item.id} className="relative flex gap-2.5">
              {/* Point de timeline */}
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center">
                <div className={cn(
                  "h-2.5 w-2.5 rounded-full border-2 border-white shadow-sm",
                  statusStyle.dot
                )} />
              </div>
              
              {/* Contenu */}
              <div className="flex-1 min-w-0 rounded-md border border-slate-200 bg-white p-2 transition-shadow hover:shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-semibold text-slate-900 flex-1">{item.title}</p>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">{item.time}</span>
                </div>
                <p className="text-[10px] text-slate-600">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
