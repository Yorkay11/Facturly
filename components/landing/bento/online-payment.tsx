"use client"

import React from "react"
import { CreditCard, Lock, CheckCircle2 } from "lucide-react"
import { useTranslations } from 'next-intl'

const OnlinePayment: React.FC = () => {
  const t = useTranslations('landing.bento.onlinePayment')
  return (
    <div className="w-full h-full flex items-center justify-center p-1.5 bg-white relative overflow-hidden">
      <div className="w-full h-full relative overflow-hidden">
        {/* Carte bancaire en arrière-plan */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[5%] left-[10%] w-[70%] h-[50%] rounded-lg border border-slate-300 bg-gradient-to-br from-primary/20 to-primary/5 shadow-sm p-2">
            <div className="flex justify-between items-start mb-2">
              <div className="h-4 w-8 rounded bg-primary/30" />
              <Lock className="h-3 w-3 text-primary" />
            </div>
            <div className="space-y-1 mt-3">
              <div className="h-2 w-full rounded bg-slate-300/50" />
              <div className="flex justify-between">
                <div className="h-2 w-16 rounded bg-slate-300/50" />
                <div className="h-2 w-12 rounded bg-slate-300/50" />
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire de paiement superposé */}
        <div className="absolute top-[15%] -right-[10%] w-[75%] rounded-lg border border-primary/30 bg-white shadow-xl pointer-events-none z-10 p-2"
             style={{ transform: 'scale(1.1)' }}>
          <div className="space-y-1.5">
            {/* Header */}
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <CreditCard className="h-3 w-3 text-primary" />
              <p className="text-[10px] font-semibold text-slate-900">{t('form.title')}</p>
            </div>

            {/* Montant */}
            <div className="rounded border border-primary/20 bg-primary/5 p-1.5">
              <p className="text-[7px] text-slate-600 mb-0.5">{t('form.amountToPay')}</p>
              <p className="text-[13px] font-bold text-primary">1 050€</p>
            </div>

            {/* Formulaire */}
            <div className="space-y-1">
              <div>
                <label className="text-[7px] text-slate-600 block mb-0.5">{t('form.email')}</label>
                <div className="h-3 w-full rounded border border-slate-300 bg-white px-1 text-[8px] pointer-events-none">
                  contact@acmecorp.com
                </div>
              </div>
              
              <div>
                <label className="text-[7px] text-slate-600 block mb-0.5">{t('form.method')}</label>
                <div className="h-3 w-full rounded border border-primary/30 bg-primary/5 px-1 text-[8px] pointer-events-none flex items-center gap-0.5">
                  <CreditCard className="h-2 w-2 text-primary" />
                  <span className="text-primary font-medium">{t('form.creditCard')}</span>
                </div>
              </div>
            </div>

            {/* Bouton de paiement */}
            <div className="pt-1 border-t border-slate-200">
              <div className="h-5 w-full rounded bg-primary flex items-center justify-center gap-1 pointer-events-none">
                <CreditCard className="h-2.5 w-2.5 text-primary-foreground" />
                <span className="text-[9px] font-semibold text-primary-foreground">{t('form.payNow')}</span>
              </div>
            </div>

            {/* Badge de sécurité */}
            <div className="flex items-center justify-center gap-1 pt-0.5">
              <Lock className="h-2 w-2 text-primary" />
              <p className="text-[7px] text-slate-500">{t('form.securePayment')}</p>
            </div>
          </div>
        </div>

        {/* Confirmation de paiement */}
        <div className="absolute bottom-2 left-2 w-[45%] rounded border border-green-400 bg-green-50 shadow-md pointer-events-none z-20 p-1.5">
          <div className="flex items-center gap-1 mb-0.5">
            <CheckCircle2 className="h-3 w-3 text-green-600" />
            <p className="text-[8px] font-semibold text-green-700">{t('confirmation.title')}</p>
          </div>
          <div className="space-y-0.5 text-[7px] text-green-700">
            <p className="font-medium">{t('confirmation.amountPaid')}</p>
            <p className="text-[6px] text-green-600">{t('confirmation.timeAgo')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnlinePayment

