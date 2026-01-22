"use client"

import { Link } from '@/i18n/routing'
import Image from "next/image"
import { useTranslations } from 'next-intl'

export function FooterSection() {
  const t = useTranslations('landing.footer')
  
  return (
    <footer className="w-full max-w-[1320px] mx-auto px-5 flex flex-col md:flex-row justify-between items-start gap-8 md:gap-0 py-10 md:py-[70px]">
      {/* Left Section: Logo, Description */}
      <div className="flex flex-col justify-start items-start gap-4 p-4 md:p-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/logos/logo.png"
            alt="Facturly"
            width={120}
            height={40}
            className="h-8 w-auto object-contain"
          />
        </Link>
        <p className="text-foreground/90 text-sm font-medium leading-[18px] text-left max-w-sm">
          {t('tagline')}
        </p>
      </div>
      {/* Right Section: Links */}
      <div className="grid grid-cols-2 gap-8 md:gap-12 p-4 md:p-8 w-full md:w-auto">
        <div className="flex flex-col justify-start items-start gap-3">
          <h3 className="text-muted-foreground text-sm font-medium leading-5">{t('product')}</h3>
          <div className="flex flex-col justify-end items-start gap-2">
            <a href="#features-section" className="text-foreground text-sm font-normal leading-5 hover:underline">
              {t('features')}
            </a>
            <a href="#pricing-section" className="text-foreground text-sm font-normal leading-5 hover:underline">
              {t('pricing')}
            </a>
          </div>
        </div>
        <div className="flex flex-col justify-start items-start gap-3">
          <h3 className="text-muted-foreground text-sm font-medium leading-5">{t('legal')}</h3>
          <div className="flex flex-col justify-center items-start gap-2">
            <Link href="/terms" className="text-foreground text-sm font-normal leading-5 hover:underline">
              {t('terms')}
            </Link>
            <Link href="/privacy" className="text-foreground text-sm font-normal leading-5 hover:underline">
              {t('privacy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
