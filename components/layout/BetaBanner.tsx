"use client";

import { useTranslations } from 'next-intl';

export function BetaBanner() {
  const t = useTranslations('beta');
  
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-primary-foreground shadow-lg border-b border-primary/20">
      <div className="container mx-auto px-3 py-1.5 md:px-4 md:py-2">
        <div className="flex items-center justify-center gap-2 md:gap-3 text-xs md:text-sm">
          <div className="flex items-center gap-1.5 md:gap-2 flex-1">
            <span className="px-1.5 py-0.5 md:px-2 rounded-full bg-primary-foreground/20 text-[10px] md:text-xs font-semibold uppercase tracking-wide whitespace-nowrap">
              {t('badge')}
            </span>
            <p className="font-medium text-center sm:text-left leading-tight">
              {t('message')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

