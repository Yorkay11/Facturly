"use client"

import Image from "next/image"
import { useTranslations } from 'next-intl'
import { FaMobileScreen, FaGlobe, FaCoins, FaClock } from 'react-icons/fa6'

export function SocialProof() {
  const t = useTranslations('landing.socialProof')
  const tStats = useTranslations('landing.socialProof.stats')
  
  const stats = [
    {
      icon: FaMobileScreen,
      value: tStats('tMoneyMoov'),
      label: tStats('tMoneyMoovLabel'),
      description: tStats('tMoneyMoovDescription')
    },
    {
      icon: FaGlobe,
      value: tStats('uemoa'),
      label: tStats('uemoaLabel'),
      description: tStats('uemoaDescription')
    },
    {
      icon: FaGlobe,
      value: tStats('cemac'),
      label: tStats('cemacLabel'),
      description: tStats('cemacDescription')
    },
    {
      icon: FaMobileScreen,
      value: tStats('mobileMoney'),
      label: tStats('mobileMoneyLabel'),
      description: tStats('mobileMoneyDescription')
    },
    {
      icon: FaClock,
      value: tStats('responseTime'),
      label: tStats('responseTimeLabel'),
      description: tStats('responseTimeDescription')
    },
    {
      icon: FaCoins,
      value: tStats('growth'),
      label: tStats('growthLabel'),
      description: tStats('growthDescription')
    }
  ]
  
  return (
    <section className="self-stretch py-12 md:py-16 flex flex-col justify-center items-center gap-4 md:gap-6 overflow-hidden px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="text-center mb-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
          {t('title')}
        </h2>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-4 w-full max-w-6xl">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="group flex flex-col items-center gap-3 p-4 md:p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon className="h-7 w-7 text-primary" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-base md:text-lg font-semibold text-foreground text-center">
                {stat.label}
              </div>
              {stat.description && (
                <div className="text-sm text-muted-foreground text-center leading-relaxed">
                  {stat.description}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
