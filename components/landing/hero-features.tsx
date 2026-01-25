"use client"

import { useTranslations } from 'next-intl'
import { Clock, MessageCircle, Smartphone } from 'lucide-react'

export function HeroFeatures() {
  const t = useTranslations('landing.hero.features')
  
  const features = [
    {
      icon: Clock,
      text: t('sixtySeconds'),
      highlight: "60s"
    },
    {
      icon: MessageCircle,
      text: t('whatsapp'),
      highlight: "70%+"
    },
    {
      icon: Smartphone,
      text: t('mobileMoney'),
      highlight: "60+"
    }
  ]

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mt-6 md:mt-8">
      {features.map((feature, index) => {
        const Icon = feature.icon
        return (
          <div
            key={index}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm"
          >
            <Icon className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              <span className="font-bold text-primary">{feature.highlight}</span> {feature.text}
            </span>
          </div>
        )
      })}
    </div>
  )
}
