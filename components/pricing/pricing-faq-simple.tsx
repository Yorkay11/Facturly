"use client"

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PricingFAQ() {
  const t = useTranslations('pricing.faq')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: t('freeTrial.question'),
      answer: t('freeTrial.answer'),
    },
    {
      question: t('paymentMethods.question'),
      answer: t('paymentMethods.answer'),
    },
    {
      question: t('cancelAnyTime.question'),
      answer: t('cancelAnyTime.answer'),
    },
    {
      question: t('switchPlans.question'),
      answer: t('switchPlans.answer'),
    },
    {
      question: t('refund.question'),
      answer: t('refund.answer'),
    },
    {
      question: t('annualSavings.question'),
      answer: t('annualSavings.answer'),
    },
  ]

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-10 md:mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          {t('title')}
        </h2>
        <p className="text-base md:text-lg text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      <div className="w-full space-y-0">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border-b border-border last:border-b-0"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between py-4 font-semibold text-foreground hover:no-underline text-left transition-colors"
            >
              <span>{faq.question}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200",
                  openIndex === index && "rotate-180"
                )}
              />
            </button>
            {openIndex === index && (
              <div className="pb-4 pt-0 text-muted-foreground leading-relaxed animate-in slide-in-from-top-2 duration-200">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
