"use client"

import { useTranslations } from 'next-intl'
import { Check, X } from 'lucide-react'

export function PricingComparison() {
  const t = useTranslations('pricing.comparison')

  const features = [
    {
      name: t('features.invoices'),
      free: t('features.free.invoices'),
      pro: t('features.pro.invoices'),
      enterprise: t('features.enterprise.invoices'),
    },
    {
      name: t('features.clients'),
      free: t('features.free.clients'),
      pro: t('features.pro.clients'),
      enterprise: t('features.enterprise.clients'),
    },
    {
      name: t('features.whatsapp'),
      free: t('features.free.whatsapp'),
      pro: t('features.pro.whatsapp'),
      enterprise: t('features.enterprise.whatsapp'),
    },
    {
      name: t('features.mobileMoney'),
      free: t('features.free.mobileMoney'),
      pro: t('features.pro.mobileMoney'),
      enterprise: t('features.enterprise.mobileMoney'),
    },
    {
      name: t('features.reminders'),
      free: t('features.free.reminders'),
      pro: t('features.pro.reminders'),
      enterprise: t('features.enterprise.reminders'),
    },
    {
      name: t('features.statistics'),
      free: t('features.free.statistics'),
      pro: t('features.pro.statistics'),
      enterprise: t('features.enterprise.statistics'),
    },
    {
      name: t('features.pdfExport'),
      free: t('features.free.pdfExport'),
      pro: t('features.pro.pdfExport'),
      enterprise: t('features.enterprise.pdfExport'),
    },
    {
      name: t('features.customization'),
      free: t('features.free.customization'),
      pro: t('features.pro.customization'),
      enterprise: t('features.enterprise.customization'),
    },
    {
      name: t('features.team'),
      free: t('features.free.team'),
      pro: t('features.pro.team'),
      enterprise: t('features.enterprise.team'),
    },
    {
      name: t('features.api'),
      free: t('features.free.api'),
      pro: t('features.pro.api'),
      enterprise: t('features.enterprise.api'),
    },
    {
      name: t('features.support'),
      free: t('features.free.support'),
      pro: t('features.pro.support'),
      enterprise: t('features.enterprise.support'),
    },
  ]

  return (
    <div className="w-full">
      <div className="text-center mb-10 md:mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          {t('title')}
        </h2>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full inline-block">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left p-4 font-semibold text-foreground">
                  {t('feature')}
                </th>
                <th className="text-center p-4 font-semibold text-foreground">
                  {t('free')}
                </th>
                <th className="text-center p-4 font-semibold text-primary">
                  {t('pro')}
                </th>
                <th className="text-center p-4 font-semibold text-foreground">
                  {t('enterprise')}
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr
                  key={index}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4 font-medium text-foreground">
                    {feature.name}
                  </td>
                  <td className="p-4 text-center">
                    {feature.free === 'true' ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : feature.free === 'false' ? (
                      <X className="h-5 w-5 text-muted-foreground mx-auto" />
                    ) : (
                      <span className="text-sm text-muted-foreground">{feature.free}</span>
                    )}
                  </td>
                  <td className="p-4 text-center bg-primary/5">
                    {feature.pro === 'true' ? (
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    ) : feature.pro === 'false' ? (
                      <X className="h-5 w-5 text-muted-foreground mx-auto" />
                    ) : (
                      <span className="text-sm text-muted-foreground">{feature.pro}</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {feature.enterprise === 'true' ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : feature.enterprise === 'false' ? (
                      <X className="h-5 w-5 text-muted-foreground mx-auto" />
                    ) : (
                      <span className="text-sm text-muted-foreground">{feature.enterprise}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
