"use client"

import { useTranslations } from 'next-intl'
import { TrendingUp, Zap, Users, FileText, MessageCircle, DollarSign } from 'lucide-react'

export function RealMetrics() {
  const t = useTranslations('landing.realMetrics')

  const metrics = [
    {
      icon: Zap,
      value: t('speed.value'),
      label: t('speed.label'),
      description: t('speed.description'),
      color: 'text-yellow-500'
    },
    {
      icon: MessageCircle,
      value: t('whatsapp.value'),
      label: t('whatsapp.label'),
      description: t('whatsapp.description'),
      color: 'text-green-500'
    },
    {
      icon: DollarSign,
      value: t('payment.value'),
      label: t('payment.label'),
      description: t('payment.description'),
      color: 'text-blue-500'
    },
    {
      icon: TrendingUp,
      value: t('growth.value'),
      label: t('growth.label'),
      description: t('growth.description'),
      color: 'text-purple-500'
    }
  ]

  return (
    <section className="w-full py-12 md:py-16 px-4 md:px-6 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
            {t('title')}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <div
                key={index}
                className="group relative p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors`}>
                    <Icon className={`h-7 w-7 ${metric.color}`} />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {metric.value}
                  </div>
                  <div className="text-base font-semibold text-foreground mb-2">
                    {metric.label}
                  </div>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    {metric.description}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
