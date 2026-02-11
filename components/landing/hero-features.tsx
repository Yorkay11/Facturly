"use client"

import { useTranslations } from 'next-intl'
import { FaClock, FaMessage, FaMobileScreen, FaRobot } from 'react-icons/fa6'
import { motion } from 'framer-motion'

export function HeroFeatures() {
  const t = useTranslations('landing.hero.features')
  
  const features = [
    {
      icon: FaClock,
      text: t('sixtySeconds'),
      highlight: "60s",
      colors: {
        bg: "from-amber-500/10 via-orange-500/10 to-yellow-500/10",
        border: "border-amber-500/30 hover:border-amber-500/50",
        icon: "text-amber-600 dark:text-amber-500",
        highlight: "text-amber-700 dark:text-amber-400",
        iconBg: "bg-gradient-to-br from-amber-500/20 to-orange-500/20"
      }
    },
    {
      icon: FaMessage,
      text: t('whatsapp'),
      highlight: "70%+",
      colors: {
        bg: "from-emerald-500/10 via-green-500/10 to-teal-500/10",
        border: "border-emerald-500/30 hover:border-emerald-500/50",
        icon: "text-emerald-600 dark:text-emerald-500",
        highlight: "text-emerald-700 dark:text-emerald-400",
        iconBg: "bg-gradient-to-br from-emerald-500/20 to-green-500/20"
      }
    },
    {
      icon: FaMobileScreen,
      text: t('mobileMoney'),
      highlight: "60+",
      colors: {
        bg: "from-violet-500/10 via-purple-500/10 to-indigo-500/10",
        border: "border-violet-500/30 hover:border-violet-500/50",
        icon: "text-violet-600 dark:text-violet-500",
        highlight: "text-violet-700 dark:text-violet-400",
        iconBg: "bg-gradient-to-br from-violet-500/20 to-purple-500/20"
      }
    },
    {
      icon: FaRobot,
      text: t('fury'),
      highlight: "FURY",
      colors: {
        bg: "from-pink-500/10 via-rose-500/10 to-fuchsia-500/10",
        border: "border-pink-500/30 hover:border-pink-500/50",
        icon: "text-pink-600 dark:text-pink-500",
        highlight: "text-pink-700 dark:text-pink-400",
        iconBg: "bg-gradient-to-br from-pink-500/20 to-rose-500/20"
      }
    }
  ]

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mt-4 md:mt-6">
      {features.map((feature, index) => {
        const Icon = feature.icon
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`
              group relative flex items-center gap-3 p-2 
              rounded-xl md:rounded-full 
              bg-gradient-to-br ${feature.colors.bg}
              border ${feature.colors.border}
              backdrop-blur-sm
              shadow-sm hover:shadow-md
              transition-all duration-300 ease-out
              cursor-default
              overflow-hidden
            `}
          >
            {/* Effet de brillance au hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
            
            {/* Icône avec background */}
            <div className={`
              relative flex items-center justify-center
              w-4 h-4 md:w-5 md:h-5
              rounded-lg md:rounded-full
              ${feature.colors.iconBg}
              group-hover:scale-110
              transition-transform duration-300
              shadow-sm
            `}>
              <Icon className={`h-2 w-2 md:h-3 md:w-3 ${feature.colors.icon} transition-colors duration-300`} />
            </div>
            
            {/* Texte */}
            <span className="text-sm md:text-base font-medium text-foreground relative z-10">
              <span className={`font-bold ${feature.colors.highlight} transition-colors duration-300`}>
                {feature.highlight}
              </span>{" "}
              <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                {feature.text}
              </span>
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}
