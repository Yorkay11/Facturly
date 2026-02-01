"use client"

import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'

export function PricingComparison() {
  const t = useTranslations('pricing.comparison')
  const tPacks = useTranslations('pricing.packs')

  const packs = [
    { key: 'starter', credits: '60', price: '5 000', pricePerCredit: '~83' },
    { key: 'pro', credits: '150', price: '10 000', pricePerCredit: '~66' },
    { key: 'business', credits: '400', price: '25 000', pricePerCredit: '~62' },
  ] as const

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
                  {t('starter')}
                </th>
                <th className="text-center p-4 font-semibold text-primary">
                  {t('pro')}
                </th>
                <th className="text-center p-4 font-semibold text-foreground">
                  {t('business')}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="p-4 font-medium text-foreground">{t('credits')}</td>
                {packs.map((p) => (
                  <td key={p.key} className="p-4 text-center text-muted-foreground">
                    {p.credits}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="p-4 font-medium text-foreground">{t('price')}</td>
                {packs.map((p) => (
                  <td key={p.key} className="p-4 text-center text-muted-foreground">
                    {p.price} FCFA
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="p-4 font-medium text-foreground">{t('pricePerCredit')}</td>
                {packs.map((p) => (
                  <td key={p.key} className="p-4 text-center text-muted-foreground">
                    {p.pricePerCredit} FCFA
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
