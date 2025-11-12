"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface QuickActionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "outline";
}

export const QuickActionCard = ({
  icon,
  title,
  description,
  onClick,
  disabled,
  variant = "default",
}: QuickActionCardProps) => {
  return (
    <div
      className={cn(
        "cursor-pointer rounded-xl border border-primary/20 bg-white p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md",
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
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs text-foreground/60 max-w-[220px]">{description}</p>
          </div>
        </div>
        <Button
          variant={variant === "outline" ? "outline" : "secondary"}
          size="sm"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          {variant === "outline" ? "Ouvrir" : "Lancer"}
        </Button>
      </div>
    </div>
  );
};

export default QuickActionCard;
