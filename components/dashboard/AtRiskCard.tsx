"use client";

import { cn } from "@/lib/utils";
import { TriangleAlert } from "lucide-react";

interface AtRiskItem {
  id: string;
  label: string;
  value: string;
  helper?: string;
}

interface AtRiskCardProps {
  title: string;
  description: string;
  items: AtRiskItem[];
  className?: string;
}

export const AtRiskCard = ({ title, description, items, className }: AtRiskCardProps) => {
  return (
    <div className={cn("rounded-md border border-primary/20 bg-white p-6 shadow-sm", className)}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-100 text-amber-700">
          <TriangleAlert className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-foreground/60">{description}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-md border border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-sm font-medium text-primary">{item.value}</p>
            <p className="text-xs text-foreground/60">{item.label}</p>
            {item.helper ? <p className="text-xs text-foreground/40">{item.helper}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AtRiskCard;
