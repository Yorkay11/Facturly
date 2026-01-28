"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { FaArrowRight } from "react-icons/fa6";

interface QuickActionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
  color?: "primary" | "blue" | "orange" | "green" | "purple";
}

const colorClasses = {
  primary: {
    border: "border-primary/20 hover:border-primary/40",
    bg: "bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15",
    iconBg: "bg-primary/10 group-hover:bg-primary/20",
    iconText: "text-primary",
  },
  blue: {
    border: "border-blue-200 hover:border-blue-300",
    bg: "bg-gradient-to-br from-blue-50 to-white hover:from-blue-100 hover:to-blue-50",
    iconBg: "bg-blue-100 group-hover:bg-blue-200",
    iconText: "text-blue-600",
  },
  orange: {
    border: "border-orange-200 hover:border-orange-300",
    bg: "bg-gradient-to-br from-orange-50 to-white hover:from-orange-100 hover:to-orange-50",
    iconBg: "bg-orange-100 group-hover:bg-orange-200",
    iconText: "text-orange-600",
  },
  green: {
    border: "border-emerald-200 hover:border-emerald-300",
    bg: "bg-gradient-to-br from-emerald-50 to-white hover:from-emerald-100 hover:to-emerald-50",
    iconBg: "bg-emerald-100 group-hover:bg-emerald-200",
    iconText: "text-emerald-600",
  },
  purple: {
    border: "border-purple-200 hover:border-purple-300",
    bg: "bg-gradient-to-br from-purple-50 to-white hover:from-purple-100 hover:to-purple-50",
    iconBg: "bg-purple-100 group-hover:bg-purple-200",
    iconText: "text-purple-600",
  },
  gold: {
    border: "border-gold/30 hover:border-gold/50",
    bg: "bg-gradient-to-br from-gold/10 to-white hover:from-gold/15 hover:to-gold/5",
    iconBg: "bg-gold/20 group-hover:bg-gold/30",
    iconText: "text-gold-dark",
  },
};

export const QuickActionCard = ({
  icon,
  title,
  description,
  onClick,
  disabled,
  color = "primary",
}: QuickActionCardProps) => {
  const colors = colorClasses[color];
  
              return (
                <div
                  className={cn(
                    "group relative cursor-pointer rounded-md border p-2.5 shadow-sm transition-all duration-200 hover:shadow-md",
                    colors.border,
                    colors.bg,
                    disabled && "cursor-not-allowed opacity-60"
                  )}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="flex items-center gap-2">
        <div className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-all duration-200",
          colors.iconBg,
          colors.iconText
        )}>
          <div className="text-sm">{icon}</div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-900 truncate">{title}</p>
          <p className="text-[10px] text-slate-600 mt-0.5 line-clamp-2">{description}</p>
        </div>
        <FaArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-slate-600 shrink-0" />
      </div>
    </div>
  );
};

export default QuickActionCard;
