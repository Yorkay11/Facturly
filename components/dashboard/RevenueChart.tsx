"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
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
  // Convertie en RGB: rgb(120, 53, 239) approximativement
  const primaryColor = "rgb(120, 53, 239)"; // violet basé sur hsl(266, 74%, 46%)
  const primaryColorLight = "rgba(120, 53, 239, 0.1)";
  const primaryColorBorder = "rgba(120, 53, 239, 0.2)";

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
        <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
                timeRange === range.value
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={primaryColor} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={primaryColorLight} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
            stroke="#e2e8f0"
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
            stroke="#e2e8f0"
            axisLine={false}
            tickLine={false}
            width={80}
            tickFormatter={(value) => {
              if (value >= 1000) {
                // Pour les valeurs >= 1000, afficher en format "k" avec le symbole de devise
                const parts = amountFormatter.formatToParts(value / 1000);
                const numberPart = parts.find(p => p.type === 'integer' || p.type === 'decimal')?.value || '0';
                const symbolPart = parts.find(p => p.type === 'currency')?.value || '';
                const decimalPart = parts.find(p => p.type === 'decimal')?.value;
                const formattedNumber = decimalPart ? parseFloat(`${numberPart}.${decimalPart}`).toFixed(1) : parseFloat(numberPart).toFixed(1);
                // Construire le format selon la position du symbole (avant ou après)
                const symbolIndex = parts.findIndex(p => p.type === 'currency');
                const isSymbolBefore = symbolIndex < parts.findIndex(p => p.type === 'integer' || p.type === 'decimal');
                return isSymbolBefore ? `${symbolPart}${formattedNumber}k` : `${formattedNumber}k${symbolPart}`;
              }
              if (value === 0) return amountFormatter.format(0);
              return amountFormatter.format(value);
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: `1px solid ${primaryColorBorder}`,
              borderRadius: "8px",
              padding: "10px 12px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
            labelStyle={{ 
              color: "#1e293b", 
              fontWeight: 600, 
              marginBottom: "6px",
              fontSize: "13px",
            }}
            itemStyle={{
              color: primaryColor,
              fontWeight: 600,
              fontSize: "14px",
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
            stroke={primaryColor}
            strokeWidth={3}
            fill="url(#colorRevenus)"
            dot={{ fill: primaryColor, strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7, stroke: primaryColor, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;

