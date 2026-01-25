"use client"

import { useTranslations } from 'next-intl'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function PricingFAQ() {
  const t = useTranslations('pricing.faq')

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

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border-b border-border">
            <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
