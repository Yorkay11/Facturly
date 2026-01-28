"use client"

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  FileText, 
  ShoppingCart, 
  Calendar, 
  Send, 
  CheckCircle2,
  ArrowRight,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DemoStep {
  id: string
  icon: typeof User
  title: string
  description: string
  duration: number
}

export function InteractiveDemo() {
  const t = useTranslations('landing.interactiveDemo')
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const steps: DemoStep[] = [
    {
      id: 'client',
      icon: User,
      title: t('steps.client.title'),
      description: t('steps.client.description'),
      duration: 2000
    },
    {
      id: 'items',
      icon: ShoppingCart,
      title: t('steps.items.title'),
      description: t('steps.items.description'),
      duration: 2500
    },
    {
      id: 'dates',
      icon: Calendar,
      title: t('steps.dates.title'),
      description: t('steps.dates.description'),
      duration: 1500
    },
    {
      id: 'send',
      icon: Send,
      title: t('steps.send.title'),
      description: t('steps.send.description'),
      duration: 2000
    },
    {
      id: 'complete',
      icon: CheckCircle2,
      title: t('steps.complete.title'),
      description: t('steps.complete.description'),
      duration: 3000
    }
  ]

  useEffect(() => {
    if (!isPlaying || isCompleted) return

    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        setIsCompleted(true)
        setIsPlaying(false)
      }
    }, steps[currentStep].duration)

    return () => clearTimeout(timer)
  }, [currentStep, isPlaying, isCompleted, steps])

  const handlePlay = () => {
    if (isCompleted) {
      setCurrentStep(0)
      setIsCompleted(false)
    }
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleReset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
    setIsCompleted(false)
  }

  const handleStepClick = (index: number) => {
    setCurrentStep(index)
    setIsCompleted(false)
    if (isPlaying) {
      setIsPlaying(false)
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <section className="w-full py-16 md:py-24 px-4 md:px-6 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('title')}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Demo Container */}
        <div className="relative">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">
                {t('progress', { current: currentStep + 1, total: steps.length })}
              </span>
              <div className="flex items-center gap-2">
                {!isPlaying && !isCompleted && (
                  <Button
                    onClick={handlePlay}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    <Play className="h-4 w-4" />
                    {t('play')}
                  </Button>
                )}
                {isPlaying && (
                  <Button
                    onClick={handlePause}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    <Pause className="h-4 w-4" />
                    {t('pause')}
                  </Button>
                )}
                <Button
                  onClick={handleReset}
                  size="sm"
                  variant="ghost"
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  {t('reset')}
                </Button>
              </div>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-4 mb-12">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === index
              const isPast = currentStep > index
              const isFuture = currentStep < index

              return (
                <motion.button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all duration-300 text-left",
                    "hover:shadow-lg hover:scale-105",
                    isActive && "border-primary bg-primary/10 shadow-lg scale-105",
                    isPast && "border-green-500/50 bg-green-500/5",
                    isFuture && "border-border bg-card/50 opacity-60"
                  )}
                  whileHover={{ scale: isActive ? 1.05 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center transition-colors",
                        isActive && "bg-primary text-primary-foreground",
                        isPast && "bg-green-500 text-white",
                        isFuture && "bg-muted text-muted-foreground"
                      )}>
                        {isPast ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : (
                          <Icon className="h-6 w-6" />
                        )}
                      </div>
                      <span className={cn(
                        "text-xs font-bold px-2 py-1 rounded",
                        isActive && "bg-primary text-primary-foreground",
                        isPast && "bg-green-500 text-white",
                        isFuture && "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <h3 className={cn(
                        "font-semibold mb-2",
                        isActive && "text-primary",
                        isPast && "text-green-600 dark:text-green-400",
                        isFuture && "text-muted-foreground"
                      )}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Demo Preview */}
          <div className="relative bg-card border border-border rounded-2xl p-4 md:p-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="relative z-10"
              >
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        "bg-primary text-primary-foreground"
                      )}>
                        {(() => {
                          const Icon = steps[currentStep].icon
                          return <Icon className="h-5 w-5" />
                        })()}
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">
                        {steps[currentStep].title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                      {steps[currentStep].description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{t('time')}</span>
                      <span className="font-semibold text-foreground">
                        {t('timeValue', { seconds: steps[currentStep].duration / 1000 })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <div className="w-64 h-64 md:w-80 md:h-80 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center">
                      <motion.div
                        animate={{ 
                          scale: isPlaying ? [1, 1.1, 1] : 1,
                          rotate: isPlaying ? [0, 5, -5, 0] : 0
                        }}
                        transition={{ 
                          repeat: isPlaying ? Infinity : 0,
                          duration: 2
                        }}
                        className="text-6xl"
                      >
                        {(() => {
                          const Icon = steps[currentStep].icon
                          return <Icon className="h-24 w-24 text-primary" />
                        })()}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* CTA */}
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center"
            >
              <div className="inline-flex flex-col items-center gap-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
                <CheckCircle2 className="h-12 w-12 text-primary" />
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {t('completed.title')}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {t('completed.description')}
                  </p>
                  <Button
                    onClick={handleReset}
                    size="lg"
                    className="gap-2"
                  >
                    {t('completed.cta')}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
