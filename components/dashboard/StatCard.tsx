import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
  trend?: {
    label: string;
    positive?: boolean;
  };
  variant?: "default" | "accent";
}

export const StatCard = ({ title, value, helper, icon, trend, variant = "default" }: StatCardProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border p-6 shadow-sm transition hover:shadow-sm",
        variant === "accent"
          ? "border-accent/60 bg-accent/20"
          : "border-primary/30 bg-white"
      )}
    >
      {icon ? (
        <div
          className={cn(
            "absolute right-4 top-4 h-10 w-10 rounded-md",
            variant === "accent" ? "bg-accent/30 text-accent-foreground" : "bg-primary/10 text-primary"
          )}
        >
          <div className="flex h-full w-full items-center justify-center text-lg">{icon}</div>
        </div>
      ) : null}
      <p className="text-xs md:text-sm font-medium uppercase tracking-wide text-foreground/60">{title}</p>
      <p className="mt-3 text-xl md:text-2xl font-semibold text-foreground">{value}</p>
      {trend ? (
        <div
          className={cn(
            "mt-2 inline-flex items-center gap-2 rounded-md px-3 py-1 text-xs",
            trend.positive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
          )}
        >
          <span className="font-semibold">{trend.label}</span>
        </div>
      ) : null}
      {helper ? <p className="mt-2 text-xs text-foreground/60">{helper}</p> : null}
    </div>
  );
};

export default StatCard;
