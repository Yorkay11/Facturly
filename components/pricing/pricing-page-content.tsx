"use client"

import { Check, ArrowRight, Zap, Smartphone, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link, useRouter } from '@/i18n/routing'
import { useAuth } from "@/hooks/useAuth"
import { useTranslations } from 'next-intl'

const PACK_ICONS = [Zap, Smartphone, Building2] as const

export function PricingPageContent() {
  const { isAuthenticated } = useAuth()
  const t = useTranslations('pricing')
  const tPacks = useTranslations('pricing.packs')

  const packKeys = ['starter', 'pro', 'business'] as const
  const popularPack = 'pro'

  return (
    <div className="w-full">
      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
          {t('title')}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-4 max-w-6xl mx-auto">
        {packKeys.map((key, index) => {
          const name = tPacks(`${key}.name`)
          const description = tPacks(`${key}.description`)
          const credits = tPacks(`${key}.credits`)
          const price = tPacks(`${key}.price`)
          const pricePerCredit = tPacks(`${key}.pricePerCredit`)
          const savings = key !== 'starter' ? tPacks(`${key}.savings`) : null
          const isPopular = key === popularPack
          const Icon = PACK_ICONS[index]

          const featuresKey = `pricing.packs.${key}.features` as const
          const featureKeys = key === 'starter' ? ['whatsapp', 'mobileMoney', 'dashboard', 'support'] as const
            : key === 'pro' ? ['whatsapp', 'mobileMoney', 'reminders', 'statistics', 'pdfExport', 'support'] as const
            : ['whatsapp', 'mobileMoney', 'reminders', 'statistics', 'customization', 'pdfExport', 'support'] as const

          return (
            <div
              key={key}
              className={`relative flex flex-col overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-xl ${
                isPopular
                  ? "border-primary bg-gradient-to-br from-primary via-primary to-primary/90 shadow-2xl scale-105 md:scale-110 z-10"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              {isPopular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-2 rounded-bl-2xl">
                  <span className="text-xs font-bold">{t('popular')}</span>
                </div>
              )}

              <div className="p-4 md:p-4 flex flex-col gap-4 h-full">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isPopular ? "bg-primary-foreground/20" : "bg-primary/10"
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      isPopular ? "text-primary-foreground" : "text-primary"
                    }`} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${isPopular ? "text-primary-foreground" : "text-foreground"}`}>
                      {name}
                    </h3>
                    <p className={`text-sm ${isPopular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl md:text-5xl font-bold ${isPopular ? "text-primary-foreground" : "text-foreground"}`}>
                      {price}
                    </span>
                    <span className={`text-sm ${isPopular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      FCFA
                    </span>
                  </div>
                  <p className={`text-sm ${isPopular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {credits} {t('credits')} · {t('perCredit', { price: pricePerCredit })}
                  </p>
                  {savings && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded w-fit">
                      {savings}
                    </span>
                  )}
                </div>

                <Link
                  href={isAuthenticated ? "/dashboard" : "/register"}
                  className="w-full"
                >
                  <Button
                    className={`w-full py-6 rounded-lg font-semibold text-base transition-all duration-300 ${
                      isPopular
                        ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg hover:shadow-xl"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {isAuthenticated ? t('ctaAuthenticated') : t('ctaBuy')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>

                <div className="flex flex-col gap-4 pt-2 flex-grow">
                  <div className={`text-sm font-semibold ${isPopular ? "text-primary-foreground" : "text-foreground"}`}>
                    {t('included')}
                  </div>
                  <div className="flex flex-col gap-3">
                    {featureKeys.map((fk) => (
                      <div key={fk} className="flex items-start gap-3">
                        <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                          isPopular ? "bg-primary-foreground/20" : "bg-primary/10"
                        }`}>
                          <Check
                            className={`h-3.5 w-3.5 ${
                              isPopular ? "text-primary-foreground" : "text-primary"
                            }`}
                            strokeWidth={3}
                          />
                        </div>
                        <span className={`text-sm leading-relaxed ${
                          isPopular ? "text-primary-foreground" : "text-muted-foreground"
                        }`}>
                          {tPacks(`${key}.features.${fk}`)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-12 md:mt-16 text-center">
        <p className="text-sm text-muted-foreground">
          {t('trustMessage')}
        </p>
      </div>
    </div>
  )
}
