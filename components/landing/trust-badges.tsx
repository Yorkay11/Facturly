"use client"

import { useTranslations } from 'next-intl'
import { FaShield, FaLock, FaCircleCheck, FaClock, FaStar, FaAward } from 'react-icons/fa6'
import CardSwap, { Card } from './card-swap'

export function TrustBadges() {
  const t = useTranslations('landing.trustBadges')

  const badges = [
    {
      icon: FaShield,
      title: t('security.title'),
      description: t('security.description')
    },
    {
      icon: FaLock,
      title: t('privacy.title'),
      description: t('privacy.description')
    },
    {
      icon: FaCircleCheck,
      title: t('guarantee.title'),
      description: t('guarantee.description')
    },
    {
      icon: FaClock,
      title: t('support.title'),
      description: t('support.description')
    },
    {
      icon: FaStar,
      title: t('satisfaction.title'),
      description: t('satisfaction.description')
    },
    {
      icon: FaAward,
      title: t('compliance.title'),
      description: t('compliance.description')
    }
  ]

  return (
    <section className="w-full px-4 md:px-12 bg-muted/30 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Texte à gauche */}
          <div className="text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4">
              {t('title')}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {t('subtitle')}
            </p>
          </div>

          {/* CardSwap Animation à droite */}
          <div className="relative min-h-[400px] md:min-h-[600px] h-fit flex items-center justify-center lg:justify-end">
            <CardSwap
              width={500}
              height={400}
              cardDistance={70}
              verticalDistance={80}
              delay={5000}
              pauseOnHover={true}
              easing="smooth"
            >
              {badges.map((badge, index) => {
                const Icon = badge.icon
                return (
                  <Card
                    key={index}
                    className="relative p-8 flex flex-col gap-6 cursor-pointer group hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card via-card to-card/95 border-primary/20 hover:border-primary/40"
                  >
                    <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/10">
                      <Icon className="h-10 w-10 text-primary group-hover:text-primary/90 transition-colors" />
                    </div>
                    <div className="flex-1 space-y-3 relative z-10">
                      <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                        {badge.title}
                      </h3>
                      <p className="text-base text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                        {badge.description}
                      </p>
                    </div>
                    <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0" />
                  </Card>
                )
              })}
            </CardSwap>
          </div>
        </div>
      </div>
    </section>
  )
}
