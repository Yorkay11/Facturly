"use client"

import { useTranslations } from 'next-intl'
import { FaBolt, FaMessage, FaMobileScreen, FaRobot } from 'react-icons/fa6'
import { motion } from 'framer-motion'

export function RealMetrics() {
  const t = useTranslations('landing.realMetrics')

  const items = [
    {
      icon: FaBolt,
      titleKey: 'speed.title' as const,
      descriptionKey: 'speed.description' as const,
      color: 'text-amber-500',
      bg: 'from-amber-500/10 to-orange-500/10',
    },
    {
      icon: FaMessage,
      titleKey: 'whatsapp.title' as const,
      descriptionKey: 'whatsapp.description' as const,
      color: 'text-emerald-500',
      bg: 'from-emerald-500/10 to-green-500/10',
    },
    {
      icon: FaMobileScreen,
      titleKey: 'payment.title' as const,
      descriptionKey: 'payment.description' as const,
      color: 'text-blue-500',
      bg: 'from-blue-500/10 to-indigo-500/10',
    },
    {
      icon: FaRobot,
      titleKey: 'fury.title' as const,
      descriptionKey: 'fury.description' as const,
      color: 'text-pink-500',
      bg: 'from-pink-500/10 to-rose-500/10',
    },
  ]

  return (
    <section className="w-full py-14 md:py-20 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
            {t('title')}
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.titleKey}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="flex flex-col items-center text-center p-5 md:p-6 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300"
              >
                <div className={`mb-3 w-11 h-11 rounded-xl bg-gradient-to-br ${item.bg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {t(item.titleKey)}
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  {t(item.descriptionKey)}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
