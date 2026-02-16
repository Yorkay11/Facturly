import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";
import { Link } from '@/i18n/routing';

interface StatusBreakdown {
  label: string;
  value: number; // percentage (0-100)
  color: "green" | "amber" | "red" | "slate";
}

interface StatCardProps {
  title: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
  trend?: {
    label: string;
    value?: number;
    positive?: boolean;
  };
  variant?: "default" | "accent" | "success" | "warning" | "danger";
  statusBreakdown?: StatusBreakdown[];
  seeMoreLink?: string;
  seeMoreLabel?: string;
}

export const StatCard = ({ title, value, helper, icon, trend, variant = "default", statusBreakdown, seeMoreLink, seeMoreLabel = "See more" }: StatCardProps) => {
  const variantStyles: Record<NonNullable<StatCardProps['variant']>, string> = {
    default: "border-border bg-card hover:border-primary/20",
    accent: "border-primary/20 bg-card hover:border-primary/30",
    success: "border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/10 hover:border-emerald-300",
    warning: "border-amber-200 bg-amber-50/30 dark:bg-amber-950/10 hover:border-amber-300",
    danger: "border-destructive/20 bg-destructive/5 hover:border-destructive/30",
  };

  const iconStyles: Record<NonNullable<StatCardProps['variant']>, string> = {
    default: "bg-muted text-muted-foreground",
    accent: "bg-primary/10 text-primary",
    success: "bg-emerald-500 text-white",
    warning: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    danger: "bg-destructive text-destructive-foreground",
  };

  const statusColors = {
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    slate: "bg-slate-400",
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 shadow-sm backdrop-blur-sm p-3 transition-all duration-300",
        variantStyles[variant]
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/60 to-transparent pointer-events-none" />
      
      <div className="relative flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
            {seeMoreLink && (
              <Link
                href={seeMoreLink}
                className="text-[10px] font-medium text-primary hover:text-primary/80 transition-colors hover:underline"
              >
                {seeMoreLabel} →
              </Link>
            )}
          </div>
          <p className="text-xl md:text-2xl font-bold text-foreground mb-1.5 tracking-tight">{value}</p>
          
          {trend && (
            <div
              className={cn(
                "mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                trend.positive !== false
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              )}
            >
              {trend.positive !== false ? (
                <FaArrowTrendUp className="h-3 w-3" />
              ) : (
                <FaArrowTrendDown className="h-3 w-3" />
              )}
              <span>{trend.label}</span>
            </div>
          )}
          
          {helper && (
            <p className="mt-1.5 text-[10px] text-slate-500">{helper}</p>
          )}
        </div>
        
        {icon && (
          <div
            className={cn(
              "ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-transform duration-200 group-hover:scale-110",
              iconStyles[variant]
            )}
          >
            <div className="text-sm">{icon}</div>
          </div>
        )}
      </div>

      {/* Status Breakdown with Progress Bars */}
      {statusBreakdown && statusBreakdown.length > 0 && (
        <div className="mt-3 space-y-2 pt-3 border-t border-border/60">
          {statusBreakdown.map((status, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-semibold text-foreground/80">{status.label}</span>
                <span className="text-muted-foreground font-medium">{status.value.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500 ease-out",
                    statusColors[status.color]
                  )}
                  style={{ width: `${status.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatCard;
