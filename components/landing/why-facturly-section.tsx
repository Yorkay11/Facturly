"use client"

import { useTranslations } from 'next-intl'
import { FaMessage, FaMobileScreen, FaGlobe, FaBolt, FaShield, FaArrowTrendUp, FaBriefcase, FaMobile, FaBell } from 'react-icons/fa6'

export function WhyFacturlySection() {
  const t = useTranslations('landing.whyFacturly')
  
  const reasons = [
    {
      icon: FaMessage,
      title: t('whatsapp.title'),
      description: t('whatsapp.description')
    },
    {
      icon: FaMobileScreen,
      title: t('mobileMoney.title'),
      description: t('mobileMoney.description')
    },
    {
      icon: FaGlobe,
      title: t('africa.title'),
      description: t('africa.description')
    },
    {
      icon: FaBolt,
      title: t('speed.title'),
      description: t('speed.description')
    },
    {
      icon: FaShield,
      title: t('security.title'),
      description: t('security.description')
    },
    {
      icon: FaArrowTrendUp,
      title: t('growth.title'),
      description: t('growth.description')
    },
    {
      icon: FaBriefcase,
      title: t('multiWorkspace.title'),
      description: t('multiWorkspace.description')
    },
    {
      icon: FaMobile,
      title: t('pwa.title'),
      description: t('pwa.description')
    },
    {
      icon: FaBell,
      title: t('notifications.title'),
      description: t('notifications.description')
    }
  ]

  return (
    <section className="w-full py-12 md:py-20 px-4 md:px-6 bg-gradient-to-b from-background to-muted/30 my-12 md:my-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4">
            {t('title')}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-4">
          {reasons.map((reason, index) => {
            const Icon = reason.icon
            return (
              <div
                key={index}
                className="p-4 rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {reason.title}
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {reason.description}
                    </p>
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
