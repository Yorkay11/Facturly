"use client"

import { useState } from "react"
import { Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link, useRouter } from '@/i18n/routing'
import { useAuth } from "@/hooks/useAuth"
import { useTranslations } from 'next-intl'

export function PricingSection() {
  const router = useRouter()
  const [isAnnual, setIsAnnual] = useState(true)
  const { isAuthenticated } = useAuth()
  const t = useTranslations('landing.pricing')
  const tPlans = useTranslations('landing.pricing.plans')

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
      buttonHref: "/login",
      authenticatedText: t('ctaAuthenticated'),
      authenticatedHref: "/dashboard",
      popular: false,
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
      buttonHref: "/login",
      authenticatedText: t('ctaAuthenticated'),
      authenticatedHref: "/dashboard",
      popular: true,
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
    },
  ]

  return (
    <section className="w-full px-5 overflow-hidden flex flex-col justify-start items-center my-0 py-8 md:py-14">
      <div className="self-stretch relative flex flex-col justify-center items-center gap-2 py-0">
        <div className="flex flex-col justify-start items-center gap-4">
          <h2 className="text-center text-foreground text-4xl font-semibold leading-tight">
            {t('title')}
          </h2>
          <p className="self-stretch text-center text-muted-foreground text-sm font-medium leading-[18.20px] max-w-2xl">
            {t('subtitle')}
          </p>
        </div>
        <div className="py-8">
          <div className="relative p-1 bg-muted/50 rounded-md border border-border flex justify-start items-center gap-1">
            <button
              onClick={() => setIsAnnual(true)}
              className={`relative px-6 py-2.5 flex justify-center items-center gap-2 rounded-md transition-all duration-300 ${
                isAnnual 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-sm font-medium">{t('annual')}</span>
              {isAnnual && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg">
                  -20%
                </span>
              )}
            </button>
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2.5 flex justify-center items-center gap-2 rounded-md transition-all duration-300 ${
                !isAnnual 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-sm font-medium">{t('monthly')}</span>
            </button>
          </div>
        </div>
      </div>
      <div className="self-stretch px-5 flex flex-col md:flex-row justify-center items-stretch gap-6 md:gap-8 mt-10 max-w-[1200px] mx-auto">
        {pricingPlans.map((plan) => {
          const price = isAnnual ? plan.annualPrice : plan.monthlyPrice
          const monthlyEquivalent = isAnnual ? (parseFloat(plan.annualPrice) / 12).toFixed(2) : plan.monthlyPrice
          
          return (
            <div
              key={plan.name}
              className={`relative flex-1 overflow-hidden rounded-md border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? "border-primary bg-gradient-to-br from-primary via-primary to-primary/90 shadow-2xl scale-105 md:scale-110 z-10"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-1.5 rounded-bl-2xl">
                  <span className="text-xs font-bold">{t('popular')}</span>
                </div>
              )}
              
              <div className="p-6 md:p-8 flex flex-col gap-6">
                {/* En-tête */}
                <div className="flex flex-col gap-3">
                  <h3 className={`text-lg font-semibold ${plan.popular ? "text-primary-foreground" : "text-foreground"}`}>
                    {plan.name}
                  </h3>
                  
                  <p className={`text-sm ${plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {plan.description}
                  </p>
                </div>

                {/* Prix */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold ${plan.popular ? "text-primary-foreground" : "text-foreground"}`}>
                      {price}€
                    </span>
                    <span className={`text-sm ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {isAnnual ? t('perYear') : t('perMonth')}
                    </span>
                  </div>
                  {isAnnual && plan.savings && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded">
                        {plan.savings}
                      </span>
                      <span className="text-xs text-muted-foreground line-through">
                        {parseFloat(plan.monthlyPrice) * 12}€/an
                      </span>
                    </div>
                  )}
                  {/* {!isAnnual && plan.savings && (
                    <p className="text-xs text-muted-foreground">
                      {t('monthlyEquivalent', { price: monthlyEquivalent })}
                    </p>
                  )} */}
                </div>

                {/* Bouton */}
                <Link 
                  href={isAuthenticated ? (plan.authenticatedHref || "/dashboard") : (plan.buttonHref || "/register")} 
                  className="w-full"
                  onClick={(e) => {
                    if (isAuthenticated) {
                      e.preventDefault()
                      router.push(plan.authenticatedHref || "/dashboard")
                    }
                  }}
                >
                  <Button
                    className={`w-full py-3 rounded-md font-medium text-sm transition-all duration-300 ${
                      plan.popular
                        ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg hover:shadow-xl"
                        : plan.name === "Gratuit"
                        ? "bg-muted text-foreground hover:bg-muted/80"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {isAuthenticated ? plan.authenticatedText : plan.buttonText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                {/* Fonctionnalités */}
                <div className="flex flex-col gap-4 pt-2">
                  <div className={`text-xs font-semibold ${plan.popular ? "text-primary-foreground" : "text-foreground"}`}>
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
                        <span className={`text-xs leading-relaxed ${
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
    </section>
  )
}
