"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { useTranslations } from 'next-intl';

interface QuickActionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "outline";
  color?: "primary" | "blue" | "orange" | "green" | "purple";
}

const colorClasses = {
  primary: {
    border: "border-primary/20 hover:border-primary/40",
    iconBg: "bg-primary/10",
    iconText: "text-primary",
    button: "bg-primary text-white hover:bg-primary/90",
  },
  blue: {
    border: "border-blue-200 hover:border-blue-300",
    iconBg: "bg-blue-50",
    iconText: "text-blue-600",
    button: "bg-blue-600 text-white hover:bg-blue-700",
  },
  orange: {
    border: "border-orange-200 hover:border-orange-300",
    iconBg: "bg-orange-50",
    iconText: "text-orange-600",
    button: "bg-orange-600 text-white hover:bg-orange-700",
  },
  green: {
    border: "border-emerald-200 hover:border-emerald-300",
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
    button: "bg-emerald-600 text-white hover:bg-emerald-700",
  },
  purple: {
    border: "border-purple-200 hover:border-purple-300",
    iconBg: "bg-purple-50",
    iconText: "text-purple-600",
    button: "bg-purple-600 text-white hover:bg-purple-700",
  },
};

export const QuickActionCard = ({
  icon,
  title,
  description,
  onClick,
  disabled,
  variant = "default",
  color = "primary",
}: QuickActionCardProps) => {
  const t = useTranslations('dashboard');
  const colors = colorClasses[color];
  
  return (
    <div
      className={cn(
        "cursor-pointer rounded-md border bg-white p-4 md:p-5 shadow-sm transition hover:shadow-sm",
        colors.border,
        disabled && "cursor-not-allowed opacity-70"
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-md",
            colors.iconBg,
            colors.iconText
          )}>
            {icon}
          </div>
          <div>
            <p className="text-sm md:text-base font-semibold text-foreground">{title}</p>
            <p className="text-xs md:text-sm text-foreground/60 max-w-[220px] md:max-w-none">{description}</p>
          </div>
        </div>
        <Button
          variant={variant === "outline" ? "outline" : "default"}
          size="sm"
          disabled={disabled}
          className={variant !== "outline" ? colors.button : undefined}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          {variant === "outline" ? t('open') : t('launch')}
        </Button>
      </div>
    </div>
  );
};

export default QuickActionCard;
