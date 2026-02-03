"use client"

import { useTranslations } from 'next-intl'
import { FaMobileScreen, FaBolt, FaShield, FaGlobe, FaArrowRight } from 'react-icons/fa6'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from '@/i18n/routing'
import { PaymentMethodsGallery } from '@/components/payments/PaymentMethodsGallery'

import { useWaitlist } from '@/contexts/WaitlistContext'

export function MobileMoneySection() {
  const t = useTranslations('landing.mobileMoney')
  const { isAuthenticated } = useAuth()
  const { openWaitlist } = useWaitlist()
  const router = useRouter()
  
  const providers = [
    { 
      name: "Orange Money", 
      logo: "/images/providers/orange-money.png",
      badge: "Populaire",
      alt: "Orange Money"
    },
    { 
      name: "MTN Mobile Money", 
      logo: "/images/providers/mtn-momo.png",
      badge: "Populaire",
      alt: "MTN Mobile Money"
    },
    { 
      name: "Wave", 
      logo: "/images/providers/wave.png",
      badge: "Populaire",
      alt: "Wave"
    },
    { 
      name: "Moov Money",
      logo: "/images/providers/moov-money.png",
      alt: "Moov Money"
    },
    { 
      name: "T-money",
      logo: "/images/providers/t-money.png",
      alt: "T-money"
    },
    { 
      name: "Airtel Money",
      logo: "/images/providers/airtel-money.png",
      alt: "Airtel Money"
    }
  ]

  const features = [
    {
      icon: FaBolt,
      title: t('features.instant'),
      description: t('features.instantDesc')
    },
    {
      icon: FaShield,
      title: t('features.secure'),
      description: t('features.secureDesc')
    },
    {
      icon: FaGlobe,
      title: t('features.accessible'),
      description: t('features.accessibleDesc')
    }
  ]

  const handleCTAClick = () => {
    if (isAuthenticated) {
      router.push("/dashboard")
    } else {
      openWaitlist()
    }
  }

  return (
    <section className="w-full py-16 md:py-24 px-4 md:px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 z-[1]" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-[1]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 z-[1]" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-6">
            <FaMobileScreen className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6 leading-tight">
            {t('title')}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-4 mb-16 md:mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group relative p-4 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Opérateurs supportés - Galerie circulaire */}
        <div className="mb-12 md:mb-16">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-center mb-6 md:mb-12">
            {t("providers.title")}
          </h3>
          
          {/* Galerie circulaire – hauteur réduite sur mobile pour des cartes plus petites */}
          <div className="h-[220px] sm:h-[280px] md:h-[380px] lg:h-[500px] w-full min-h-[180px]">
            <PaymentMethodsGallery
              providers={providers}
              height="100%"
              className="w-full h-full"
              bend={3}
              textColor="hsl(var(--primary))"
              borderRadius={0.05}
              scrollSpeed={2}
              scrollEase={0.05}
            />
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6 md:mt-12">
            {t("providers.more")}
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="inline-flex flex-col items-center gap-4 p-4 md:p-6 rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-xl">
            <div>
              <h3 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
                {t('cta.title')}
              </h3>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
                {t('cta.description')}
              </p>
            </div>
            <Button
              onClick={handleCTAClick}
              size="lg"
              className="group px-8 py-6 text-base font-semibold rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isAuthenticated ? t('cta.buttonAuthenticated') : t('cta.buttonGuest')}
              <FaArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
