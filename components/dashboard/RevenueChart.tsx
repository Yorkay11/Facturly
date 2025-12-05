"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { cn } from "@/lib/utils";

interface RevenueChartProps {
  data: Array<{ label: string; value: number }>;
  className?: string;
}

export const RevenueChart = ({ data, className }: RevenueChartProps) => {
  const chartData = data.map((item) => ({
    name: item.label,
    revenus: Math.round(item.value),
  }));

  // Couleur primaire (violet) basée sur le thème: hsl(266, 74%, 46%)
  // Convertie en RGB: rgb(120, 53, 239) approximativement
  const primaryColor = "rgb(120, 53, 239)"; // violet basé sur hsl(266, 74%, 46%)
  const primaryColorLight = "rgba(120, 53, 239, 0.1)";
  const primaryColorBorder = "rgba(120, 53, 239, 0.2)";

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
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
            tickFormatter={(value) => {
              if (value >= 1000) {
                return `${(value / 1000).toFixed(1)}k€`;
              }
              if (value === 0) return "0€";
              return `${value}€`;
            }}
            width={60}
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
              new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(value),
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

