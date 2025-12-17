"use client"

import Image from "next/image"
import { useTranslations } from 'next-intl'

export function SocialProof() {
  const t = useTranslations('landing.socialProof')
  
  return (
    <section className="self-stretch py-8 md:py-16 flex flex-col justify-center items-center gap-4 md:gap-6 overflow-hidden px-4">
      <div className="text-center text-gray-300 text-xs md:text-sm font-medium leading-tight">
        {t('title')}
      </div>
      <div className="self-stretch flex items-center justify-center gap-4 md:gap-8 flex-wrap px-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Image
            key={i}
            src={`/logos/logo0${i + 1}.png`}
            alt={`Company Logo ${i + 1}`}
            width={200}
            height={60}
            className="w-full max-w-[120px] md:max-w-[150px] h-auto object-contain grayscale opacity-70"
          />
        ))}
      </div>
    </section>
  )
}
