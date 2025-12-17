"use client"

import React from "react"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { useTranslations } from 'next-intl'

const primaryColor = "rgb(120, 53, 239)"

const DashboardIntelligence: React.FC = () => {
  const t = useTranslations('landing.bento.dashboardIntelligence')
  
  // Données mockées pour le graphique (4 derniers mois avec tendance croissante)
  const mockRevenueData = [
    { name: t('months.jan'), revenus: 3200 },
    { name: t('months.feb'), revenus: 5800 },
    { name: t('months.mar'), revenus: 4500 },
    { name: t('months.apr'), revenus: 6200 },
  ]
  return (
    <div className="w-full h-full flex items-center justify-center p-3 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
      <div className="w-full h-full flex flex-col gap-1.5">
        {/* Header compact */}
        <div className="px-1">
          <h3 className="text-[11px] font-semibold text-foreground leading-tight">{t('revenueTrends')}</h3>
        </div>
        
        {/* Chart compact */}
        <div className="flex-1 min-h-0 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockRevenueData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenusBento" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                tick={{ fill: "#64748b", fontSize: 10, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 9, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                width={35}
                tickFormatter={(value) => {
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                  return `${value}`;
                }}
              />
              <Area
                type="monotone"
                dataKey="revenus"
                stroke={primaryColor}
                strokeWidth={2}
                fill="url(#colorRevenusBento)"
                dot={{ fill: primaryColor, strokeWidth: 1.5, r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Stats summary compact */}
        <div className="grid grid-cols-2 gap-1.5 px-1">
          <div className="rounded border border-primary/10 bg-primary/5 px-2 py-1.5">
            <p className="text-[9px] text-muted-foreground leading-tight">{t('stats.totalPaid')}</p>
            <p className="text-xs font-semibold text-primary leading-tight mt-0.5">15.4k€</p>
          </div>
          <div className="rounded border border-primary/10 bg-primary/5 px-2 py-1.5">
            <p className="text-[9px] text-muted-foreground leading-tight">{t('stats.pending')}</p>
            <p className="text-xs font-semibold text-foreground/80 leading-tight mt-0.5">2.8k€</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardIntelligence

