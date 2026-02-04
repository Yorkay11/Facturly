"use client"

import React, { useCallback, useMemo, startTransition, memo } from "react"
import { Button } from "@/components/ui/button"
import { Header } from "./header"
import { useRouter } from '@/i18n/routing'
import { useAuth } from "@/hooks/useAuth"
import { useTranslations } from 'next-intl'
import { cn } from "@/lib/utils"
import { HeroFeatures } from "./hero-features"
import RippleGrid from "./ripple-grid"
import SplitText from "@/components/ui/split-text"
import { useWaitlist } from "@/contexts/WaitlistContext"

// Composant mémoïsé pour éviter de re-render la grille complexe
const StaticGridBackground = memo(() => (
  <g mask="url(#mask0_186_1134)">
    {[...Array(35)].map((_, i) => (
      <React.Fragment key={`col-${i}`}>
        {/* On génère les lignes verticalement pour réduire le nombre de groupes */}
        {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324, 360, 396, 432, 468, 504, 540, 576, 612, 648, 684, 720, 756].map((y) => (
          <rect
            key={`rect-${i}-${y}`}
            x={-20.0891 + i * 36}
            y={y + 9.2}
            width="35.6"
            height="35.6"
            stroke="currentColor"
            className="text-foreground/10"
            strokeWidth="0.4"
            strokeDasharray="2 2"
            fill="none"
          />
        ))}
      </React.Fragment>
    ))}
    {/* Rectangles d'accentuation statiques */}
    <rect x="699.711" y="81" width="36" height="36" className="fill-foreground/5" />
    <rect x="195.711" y="153" width="36" height="36" className="fill-foreground/10" />
    <rect x="1023.71" y="153" width="36" height="36" className="fill-foreground/10" />
    <rect x="519.711" y="405" width="36" height="36" className="fill-foreground/5" />
  </g>
))
StaticGridBackground.displayName = "StaticGridBackground"

export function HeroSection() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { openWaitlist } = useWaitlist()
  const t = useTranslations('landing.hero')
  
  const buttonText = isAuthenticated ? t('ctaAuthenticated') : t('ctaGuest')

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (isAuthenticated) {
      router.push("/dashboard")
    } else {
      startTransition(() => {
        openWaitlist()
      })
    }
  }, [isAuthenticated, router, openWaitlist])

  return (
    <section className="flex flex-col items-center text-center relative mx-auto rounded-xl overflow-hidden my-6 py-0 px-4 w-full min-h-[700px] md:w-[1220px] md:h-[800px] shadow-2xl border border-white/5">
      {/* Gradient doux en arrière-plan */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/10 via-background/60 to-primary/30" />
      
      {/* Fond Interactif : RippleGrid */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <RippleGrid
          enableRainbow={true}
          gridColor="#D89EFF"
          rippleIntensity={0.02} // Légèrement réduit pour plus de subtilité
          gridSize={10}
          mouseInteraction={true}
          opacity={0.25}
          gridThickness={100}
        />
      </div>
      
      {/* Overlay SVG optimisé */}
      <div className="absolute inset-0 z-[1] opacity-20 pointer-events-none select-none">
        <svg width="100%" height="100%" viewBox="0 0 1220 810" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="paint_hero_grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
            <clipPath id="clip_hero">
              <rect width="1220" height="810" rx="24" />
            </clipPath>
          </defs>
          
          <g clipPath="url(#clip_hero)">
            <StaticGridBackground />
          </g>
        </svg>
      </div>

      {/* Navigation / Header */}
      <div className="absolute left-0 right-0 z-30 top-0 w-full">
        <Header />
      </div>

      {/* Contenu principal */}
      <div className={cn(
        "relative z-20 space-y-8 max-w-4xl px-6 mx-auto transition-transform duration-700",
        "mt-36 md:mt-[140px] lg:mt-[180px]"
      )}>
        <div className="will-change-transform">
          <SplitText
            text={t('title')}
            className="text-foreground text-4xl md:text-7xl font-semibold tracking-tight leading-[1.1]"
            tag="h1"
            delay={40}
            threshold={0.1}
            textAlign="center"
          />
        </div>
        
        <p className="text-muted-foreground text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-both">
          {t('subtitle')}
        </p>

        <div className="pt-4 animate-in fade-in zoom-in duration-700 delay-700 fill-mode-both">
          <HeroFeatures />
        </div>

        <div className="pt-8 flex flex-col items-center gap-4">
          <Button 
            onClick={handleClick}
            onMouseEnter={() => {
              if (!isAuthenticated) {
                // Prefetch code-splitting chunks
                const prefetch = () => {
                  import("@/components/landing/waitlist-modal")
                  import("@/components/landing/waitlist-form")
                }
                prefetch()
              }
            }}
            className="relative z-20 h-14 px-10 rounded-lg bg-primary text-primary-foreground text-lg font-semibold shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] hover:scale-105 transition-all duration-300 shimmer-effect"
          >
            <span className="relative z-10">{buttonText}</span>
          </Button>
          
          {/* <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] opacity-50">
            Rejoignez 
          </span> */}
        </div>
      </div>
    </section>
  )
}