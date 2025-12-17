"use client"

import InvoiceCreation from "./bento/invoice-creation"
import EmailSending from "./bento/email-sending"
import PaymentTracking from "./bento/payment-tracking"
import ClientManagement from "./bento/client-management"
import OnlinePayment from "./bento/online-payment"
import DashboardIntelligence from "./bento/dashboard-intelligence"
import { useTranslations } from 'next-intl'
import type { ComponentType } from "react"

interface BentoCardProps {
  title: string
  description: string
  Component: ComponentType
}

const BentoCard = ({ title, description, Component }: BentoCardProps) => (
  <div className="overflow-hidden rounded-lg border border-white/20 flex flex-col justify-start items-start relative transition-all duration-300 ease-out hover:scale-[1.02] hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 group cursor-pointer">
    {/* Background with blur effect */}
    <div
      className="absolute inset-0 rounded-lg transition-all duration-300 group-hover:bg-opacity-12"
      style={{
        background: "rgba(231, 236, 235, 0.08)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    />
    {/* Additional subtle gradient overlay with hover effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-lg transition-all duration-300 group-hover:from-primary/10 group-hover:to-transparent" />

    {/* Glow effect on hover */}
    <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

    <div className="self-stretch p-6 flex flex-col justify-start items-start gap-2 relative z-10 transition-transform duration-300 group-hover:translate-y-[-2px]">
      <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
        <p className="self-stretch text-foreground text-lg font-normal leading-7 transition-colors duration-300 group-hover:text-primary/90">
          {title} <br />
          <span className="text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">{description}</span>
        </p>
      </div>
    </div>
    <div className="self-stretch h-72 relative -mt-0.5 z-10 transition-transform duration-300 group-hover:scale-[1.01]">
      <Component />
    </div>
  </div>
)

export function BentoSection() {
  const t = useTranslations('landing.bento')
  
  const cards = [
    {
      title: t('invoiceCreation.title'),
      description: t('invoiceCreation.description'),
      Component: InvoiceCreation,
    },
    {
      title: t('emailSending.title'),
      description: t('emailSending.description'),
      Component: EmailSending,
    },
    {
      title: t('paymentTracking.title'),
      description: t('paymentTracking.description'),
      Component: PaymentTracking,
    },
    {
      title: t('clientManagement.title'),
      description: t('clientManagement.description'),
      Component: ClientManagement,
    },
    {
      title: t('onlinePayment.title'),
      description: t('onlinePayment.description'),
      Component: OnlinePayment,
    },
    {
      title: t('dashboardIntelligence.title'),
      description: t('dashboardIntelligence.description'),
      Component: DashboardIntelligence,
    },
  ]

  return (
    <section className="w-full px-5 flex flex-col justify-center items-center overflow-visible bg-transparent">
      <div className="w-full py-8 md:py-16 relative flex flex-col justify-start items-start gap-6">
        <div className="w-[547px] h-[938px] absolute top-[614px] left-[80px] origin-top-left rotate-[-33.39deg] bg-primary/10 blur-[130px] z-0" />
        <div className="self-stretch py-8 md:py-14 flex flex-col justify-center items-center gap-2 z-10">
          <div className="flex flex-col justify-start items-center gap-4">
            <h2 className="w-full max-w-[655px] text-center text-foreground text-4xl md:text-6xl font-semibold leading-tight md:leading-[66px]">
              {t('title')}
            </h2>
            <p className="w-full max-w-[600px] text-center text-muted-foreground text-lg md:text-xl font-medium leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
        </div>
        <div className="self-stretch grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10">
          {cards.map((card) => (
            <BentoCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  )
}
