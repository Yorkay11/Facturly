"use client"

import { useTranslations } from 'next-intl'
import { Shield, Lock, CheckCircle2, Clock, Star, Award } from 'lucide-react'

export function TrustBadges() {
  const t = useTranslations('landing.trustBadges')

  const badges = [
    {
      icon: Shield,
      title: t('security.title'),
      description: t('security.description')
    },
    {
      icon: Lock,
      title: t('privacy.title'),
      description: t('privacy.description')
    },
    {
      icon: CheckCircle2,
      title: t('guarantee.title'),
      description: t('guarantee.description')
    },
    {
      icon: Clock,
      title: t('support.title'),
      description: t('support.description')
    },
    {
      icon: Star,
      title: t('satisfaction.title'),
      description: t('satisfaction.description')
    },
    {
      icon: Award,
      title: t('compliance.title'),
      description: t('compliance.description')
    }
  ]

  return (
    <section className="w-full py-12 md:py-16 px-4 md:px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
            {t('title')}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {badges.map((badge, index) => {
            const Icon = badge.icon
            return (
              <div
                key={index}
                className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {badge.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
