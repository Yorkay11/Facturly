"use client";

import { cn } from "@/lib/utils";
import { FaTriangleExclamation } from "react-icons/fa6";

interface AtRiskItem {
  id: string;
  label: string;
  value: string;
  helper?: string;
  subItems?: Array<{ label: string; value: string }>;
}

interface AtRiskCardProps {
  title: string;
  description: string;
  items: AtRiskItem[];
  className?: string;
  seeMoreLink?: string;
  seeMoreLabel?: string;
}

export const AtRiskCard = ({ title, description, items, className, seeMoreLink, seeMoreLabel }: AtRiskCardProps) => {
  const displayLabel = seeMoreLabel || "Voir plus";
  
  return (
    <div className={cn("rounded-md border border-amber-200 bg-white p-3 shadow-sm", className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700">
            <FaTriangleExclamation className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900">{title}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{description}</p>
          </div>
        </div>
        {seeMoreLink && (
          <a
            href={seeMoreLink}
            className="text-[10px] font-medium text-primary hover:text-primary/80 transition-colors shrink-0"
          >
            {displayLabel} →
          </a>
        )}
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="rounded-md border border-amber-200/50 bg-white px-3 py-2 transition-shadow hover:shadow-sm"
          >
            <p className="text-base font-bold text-amber-700 mb-0.5">{item.value}</p>
            <p className="text-[10px] font-medium text-slate-700">{item.label}</p>
            {item.helper && (
              <p className="text-[10px] text-slate-500 mt-1">{item.helper}</p>
            )}
            {/* Sub-segmentation */}
            {item.subItems && item.subItems.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-1.5 pt-2 border-t border-amber-100">
                {item.subItems.map((subItem, index) => (
                  <div key={index} className="text-center">
                    <p className="text-xs font-bold text-slate-900">{subItem.value}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">{subItem.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AtRiskCard;
