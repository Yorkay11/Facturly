"use client"

import React from "react"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { useTranslations } from 'next-intl'

const PaymentTracking: React.FC = () => {
  const t = useTranslations('landing.bento.paymentTracking')
  const invoices = [
    { id: 1, number: "FAC-042", client: "Fidelize", amount: "2 400€", status: "paid", date: "15/04/2026" },
    { id: 2, number: "FAC-043", client: "Tech Solutions", amount: "1 800€", status: "sent", date: "18/04/2026" },
    { id: 3, number: "FAC-044", client: "Design Studio", amount: "950€", status: "overdue", date: "10/04/2026" },
    { id: 4, number: "FAC-045", client: "Marketing Pro", amount: "3 200€", status: "paid", date: "20/04/2026" },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-300">
            <CheckCircle2 className="h-2 w-2" />
            <span className="text-[7px] font-medium">{t('status.paid')}</span>
          </div>
        )
      case "sent":
        return (
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
            <Clock className="h-2 w-2" />
            <span className="text-[7px] font-medium">{t('status.sent')}</span>
          </div>
        )
      case "overdue":
        return (
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-400">
            <AlertCircle className="h-2 w-2" />
            <span className="text-[7px] font-medium">{t('status.overdue')}</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-1.5 bg-white relative overflow-hidden">
      <div className="w-full h-full relative overflow-hidden">
        {/* Header */}
        <div className="absolute top-1 left-1 right-1 flex items-center justify-between mb-1 z-10">
          <div>
            <p className="text-[10px] font-semibold text-slate-900">{t('header.title')}</p>
            <p className="text-[8px] text-slate-500">{t('header.subtitle')}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-semibold text-primary">4 650€</p>
            <p className="text-[7px] text-slate-500">{t('header.paidThisMonth')}</p>
          </div>
        </div>

        {/* Liste des factures */}
        <div className="absolute top-[22%] left-1 right-1 bottom-1 space-y-0.5 overflow-hidden pointer-events-none">
          {invoices.map((invoice, index) => (
            <div
              key={invoice.id}
              className="rounded border border-slate-200 bg-white p-1 shadow-sm flex items-center justify-between gap-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <p className="text-[9px] font-semibold text-primary">{invoice.number}</p>
                  {getStatusBadge(invoice.status)}
                </div>
                <p className="text-[8px] text-slate-600 truncate">{invoice.client}</p>
                <p className="text-[7px] text-slate-500">{invoice.date}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold text-slate-900">{invoice.amount}</p>
                {invoice.status === "paid" && (
                  <div className="mt-0.5 flex items-center justify-end gap-0.5">
                    <CheckCircle2 className="h-2 w-2 text-green-600" />
                    <span className="text-[6px] text-green-600">{t('status.paidShort')}</span>
                  </div>
                )}
                {invoice.status === "overdue" && (
                  <div className="mt-0.5 flex items-center justify-end gap-0.5">
                    <AlertCircle className="h-2 w-2 text-orange-600" />
                    <span className="text-[6px] text-orange-600">{t('status.overdueShort')}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Graphique de progression (mini) */}
        <div className="absolute bottom-1 left-1 right-1 h-[18%] rounded border border-primary/20 bg-primary/5 p-1 pointer-events-none z-20">
          <div className="flex items-end justify-between gap-0.5 h-full">
            <div className="flex-1 flex flex-col items-center justify-end gap-0.5">
              <div className="w-full bg-primary/30 rounded-t" style={{ height: "40%" }} />
              <p className="text-[6px] text-slate-500">{t('chart.months.jan')}</p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-end gap-0.5">
              <div className="w-full bg-primary/50 rounded-t" style={{ height: "60%" }} />
              <p className="text-[6px] text-slate-500">{t('chart.months.feb')}</p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-end gap-0.5">
              <div className="w-full bg-primary rounded-t" style={{ height: "80%" }} />
              <p className="text-[6px] text-slate-500">{t('chart.months.mar')}</p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-end gap-0.5">
              <div className="w-full bg-primary rounded-t" style={{ height: "100%" }} />
              <p className="text-[6px] text-slate-500 font-semibold text-primary">{t('chart.months.apr')}</p>
            </div>
          </div>
          <p className="text-[7px] text-center text-slate-600 mt-0.5">{t('chart.title')}</p>
        </div>
      </div>
    </div>
  )
}

export default PaymentTracking

