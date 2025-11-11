"use client";

import { cn } from "@/lib/utils";

interface SimpleChartProps {
  data: number[];
  labels: string[];
  className?: string;
}

export const SimpleChart = ({ data, labels, className }: SimpleChartProps) => {
  const maxValue = Math.max(...data, 1);

  return (
    <div className={cn("flex w-full items-end gap-2", className)}>
      {data.map((value, index) => (
        <div key={labels[index]} className="flex-1">
          <div
            className="rounded-t-md bg-primary/40"
            style={{ height: `${(value / maxValue) * 60 + 20}%` }}
            aria-hidden="true"
          />
          <p className="mt-2 text-center text-xs text-foreground/60">{labels[index]}</p>
        </div>
      ))}
    </div>
  );
};

export default SimpleChart;
