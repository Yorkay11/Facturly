"use client"

import { useState } from "react"
import { Check, ArrowRight, Zap, Shield, MessageCircle, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link, useRouter } from '@/i18n/routing'
import { useAuth } from "@/hooks/useAuth"
import { useTranslations } from 'next-intl'

export function PricingPageContent() {
  const router = useRouter()
  const [isAnnual, setIsAnnual] = useState(true)
  const { isAuthenticated } = useAuth()
  const t = useTranslations('pricing')
  const tPlans = useTranslations('pricing.plans')

  const pricingPlans = [
    {
      name: tPlans('free.name'),
      monthlyPrice: "0",
      annualPrice: "0",
      description: tPlans('free.description'),
      features: [
        tPlans('free.features.invoices'),
        tPlans('free.features.clients'),
        tPlans('free.features.whatsapp'),
        tPlans('free.features.dashboard'),
        tPlans('free.features.support'),
      ],
      buttonText: tPlans('free.cta'),
      buttonHref: "/register",
      authenticatedText: t('ctaAuthenticated'),
      authenticatedHref: "/dashboard",
      popular: false,
      icon: Zap,
    },
    {
      name: tPlans('pro.name'),
      monthlyPrice: "5",
      annualPrice: "48",
      description: tPlans('pro.description'),
      savings: t('save', { percent: 20 }),
      features: [
        tPlans('pro.features.invoices'),
        tPlans('pro.features.mobileMoney'),
        tPlans('pro.features.reminders'),
        tPlans('pro.features.statistics'),
        tPlans('pro.features.customization'),
        tPlans('pro.features.pdfExport'),
        tPlans('pro.features.support'),
      ],
      buttonText: tPlans('pro.cta'),
      buttonHref: "/register",
      authenticatedText: t('ctaAuthenticated'),
      authenticatedHref: "/dashboard",
      popular: true,
      icon: Smartphone,
    },
    {
      name: tPlans('enterprise.name'),
      monthlyPrice: "20",
      annualPrice: "192",
      description: tPlans('enterprise.description'),
      savings: t('save', { percent: 20 }),
      features: [
        tPlans('enterprise.features.invoices'),
        tPlans('enterprise.features.team'),
        tPlans('enterprise.features.api'),
        tPlans('enterprise.features.customBranding'),
        tPlans('enterprise.features.dedicatedSupport'),
        tPlans('enterprise.features.advancedAnalytics'),
        tPlans('enterprise.features.sla'),
      ],
      buttonText: tPlans('enterprise.cta'),
      buttonHref: "/contact",
      authenticatedText: t('ctaAuthenticated'),
      authenticatedHref: "/dashboard",
      popular: false,
      icon: Shield,
    },
  ]

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
          {t('title')}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {t('subtitle')}
        </p>
      </div>

      {/* Toggle Annual/Monthly */}
      <div className="flex justify-center mb-12">
        <div className="relative p-1 bg-muted/50 rounded-lg border border-border flex items-center gap-1">
          <button
            onClick={() => setIsAnnual(true)}
            className={`relative px-6 py-3 flex justify-center items-center gap-2 rounded-md transition-all duration-300 ${
              isAnnual 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="text-sm font-medium">{t('annual')}</span>
            {isAnnual && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                -20%
              </span>
            )}
          </button>
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-6 py-3 flex justify-center items-center gap-2 rounded-md transition-all duration-300 ${
              !isAnnual 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="text-sm font-medium">{t('monthly')}</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-4 max-w-6xl mx-auto">
        {pricingPlans.map((plan) => {
          const price = isAnnual ? plan.annualPrice : plan.monthlyPrice
          const monthlyEquivalent = isAnnual ? (parseFloat(plan.annualPrice) / 12).toFixed(2) : plan.monthlyPrice
          const Icon = plan.icon
          
          return (
            <div
              key={plan.name}
              className={`relative flex flex-col overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? "border-primary bg-gradient-to-br from-primary via-primary to-primary/90 shadow-2xl scale-105 md:scale-110 z-10"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-2 rounded-bl-2xl">
                  <span className="text-xs font-bold">{t('popular')}</span>
                </div>
              )}
              
              <div className="p-4 md:p-4 flex flex-col gap-4 h-full">
                {/* Icon & Name */}
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    plan.popular ? "bg-primary-foreground/20" : "bg-primary/10"
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      plan.popular ? "text-primary-foreground" : "text-primary"
                    }`} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${plan.popular ? "text-primary-foreground" : "text-foreground"}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-sm ${plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {plan.description}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl md:text-5xl font-bold ${plan.popular ? "text-primary-foreground" : "text-foreground"}`}>
                      {price}€
                    </span>
                    <span className={`text-sm ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {isAnnual ? t('perYear') : t('perMonth')}
                    </span>
                  </div>
                  {isAnnual && plan.savings && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                        {plan.savings}
                      </span>
                      <span className="text-xs text-muted-foreground line-through">
                        {parseFloat(plan.monthlyPrice) * 12}€/an
                      </span>
                    </div>
                  )}
                  {isAnnual && price !== "0" && (
                    <p className={`text-xs ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {t('monthlyEquivalent', { price: monthlyEquivalent })}
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <Link 
                  href={isAuthenticated ? (plan.authenticatedHref || "/dashboard") : (plan.buttonHref || "/register")} 
                  className="w-full"
                >
                  <Button
                    className={`w-full py-6 rounded-lg font-semibold text-base transition-all duration-300 ${
                      plan.popular
                        ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg hover:shadow-xl"
                        : plan.name === tPlans('free.name')
                        ? "bg-muted text-foreground hover:bg-muted/80"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {isAuthenticated ? plan.authenticatedText : plan.buttonText}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>

                {/* Features */}
                <div className="flex flex-col gap-4 pt-2 flex-grow">
                  <div className={`text-sm font-semibold ${plan.popular ? "text-primary-foreground" : "text-foreground"}`}>
                    {plan.name === tPlans('free.name') ? t('included') : t('includesFree')}
                  </div>
                  <div className="flex flex-col gap-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                          plan.popular ? "bg-primary-foreground/20" : "bg-primary/10"
                        }`}>
                          <Check
                            className={`h-3.5 w-3.5 ${
                              plan.popular ? "text-primary-foreground" : "text-primary"
                            }`}
                            strokeWidth={3}
                          />
                        </div>
                        <span className={`text-sm leading-relaxed ${
                          plan.popular ? "text-primary-foreground" : "text-muted-foreground"
                        }`}>
                          {feature}
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

      {/* Trust Message */}
      <div className="mt-12 md:mt-16 text-center">
        <p className="text-sm text-muted-foreground">
          {t('trustMessage')}
        </p>
      </div>
    </div>
  )
}
