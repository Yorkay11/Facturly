"use client";

import { useState } from "react";
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { useGetWorkspaceQuery } from "@/services/facturlyApi";
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';

interface RevenueChartProps {
  data: Array<{ label: string; value: number }>;
  className?: string;
}

type TimeRange = "1d" | "1w" | "1m" | "1y" | "all";

export const RevenueChart = ({ data, className }: RevenueChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("1m");
  const { data: workspace } = useGetWorkspaceQuery();
  const locale = useLocale();
  const t = useTranslations('dashboard');
  const workspaceCurrency = workspace?.defaultCurrency || "EUR";
  
  const chartData = data.map((item) => ({
    name: item.label,
    revenus: Math.round(item.value),
  }));

  // Formatter pour les montants
  const amountFormatter = new Intl.NumberFormat(locale === 'fr' ? "fr-FR" : "en-US", {
    style: "currency",
    currency: workspaceCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Couleur primaire (violet) basée sur le thème: hsl(266, 74%, 46%)
  const primaryColor = "#7835ef"; // violet basé sur hsl(266, 74%, 46%)
  const primaryColorLight = "rgba(120, 53, 239, 0.08)";

  const timeRanges: Array<{ value: TimeRange; label: string }> = [
    { value: "1d", label: t('timeRange.1d') },
    { value: "1w", label: t('timeRange.1w') },
    { value: "1m", label: t('timeRange.1m') },
    { value: "1y", label: t('timeRange.1y') },
    { value: "all", label: t('timeRange.all') },
  ];

  return (
    <div className={cn("w-full", className)}>
      {/* Time Range Selector */}
      <div className="flex items-center justify-end mb-4">
        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
                timeRange === range.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart 
          data={chartData} 
          margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={primaryColor} stopOpacity={0.15} />
              <stop offset="95%" stopColor={primaryColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#f1f5f9" 
            vertical={false} 
          />
          <XAxis
            dataKey="name"
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={75}
            tickCount={6}
            tickFormatter={(value) => {
              if (value === 0) return "0";
              
              // Pour les grandes valeurs, utiliser un format simplifié
              if (value >= 1000000) {
                const millions = (value / 1000000).toFixed(value >= 10000000 ? 0 : 1);
                return `${millions}M`;
              }
              
              if (value >= 1000) {
                const thousands = (value / 1000).toFixed(value >= 10000 ? 0 : 1);
                return `${thousands}k`;
              }
              
              // Pour les petites valeurs, afficher directement
              return value.toString();
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              padding: "8px 12px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
            labelStyle={{ 
              color: "#1e293b", 
              fontWeight: 500, 
              marginBottom: "4px",
              fontSize: "12px",
            }}
            itemStyle={{
              color: primaryColor,
              fontWeight: 600,
              fontSize: "13px",
            }}
            formatter={(value: number) => [
              amountFormatter.format(value),
              "Revenus",
            ]}
            cursor={{ stroke: primaryColor, strokeWidth: 1, strokeDasharray: "3 3" }}
          />
          <Area
            type="monotone"
            dataKey="revenus"
            fill="url(#colorRevenus)"
            stroke="none"
          />
          <Line 
            type="monotone"
            dataKey="revenus" 
            stroke={primaryColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, stroke: primaryColor, strokeWidth: 2, fill: "#ffffff" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;

