"use client"

import React from "react"
import { FaPlus, FaEnvelope, FaPhone, FaLocationDot, FaUser } from "react-icons/fa6"
import { useTranslations } from 'next-intl'

const ClientManagement: React.FC = () => {
  const t = useTranslations('landing.bento.clientManagement')
  const clients = [
    { id: 1, name: "Fidelize", email: "contact@fidelize.com", city: "Paris", initial: "FI" },
    { id: 2, name: "Tech Solutions", email: "info@techsol.fr", city: "Lyon", initial: "TS" },
    { id: 3, name: "Design Studio", email: "hello@design.fr", city: "Marseille", initial: "DS" },
  ]


  return (
    <div className="w-full h-full flex items-center justify-center p-1.5 bg-white relative overflow-hidden">
      <div className="w-full h-full relative overflow-hidden">
        {/* Header avec stats */}
        <div className="absolute top-1 left-1 right-1 flex items-center justify-between mb-1 z-10">
          <div>
            <p className="text-[10px] font-semibold text-slate-900">{t('header.title')}</p>
            <p className="text-[8px] text-slate-500">{t('header.activeClients')}</p>
          </div>
          <div className="h-5 px-1.5 rounded border border-primary/20 bg-primary/5 flex items-center gap-1 pointer-events-none">
            <FaPlus className="h-2.5 w-2.5 text-primary" />
            <span className="text-[8px] font-medium text-primary">{t('header.new')}</span>
          </div>
        </div>

        {/* Liste des clients */}
        <div className="absolute top-[22%] left-1 right-1 bottom-[25%] space-y-0.5 overflow-hidden pointer-events-none">
          {clients.map((client) => (
            <div
              key={client.id}
              className="rounded border border-slate-200 bg-white p-1 shadow-sm flex items-center gap-1"
            >
              {/* Avatar */}
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[8px] font-semibold text-primary">{client.initial}</span>
              </div>
              
              {/* Infos */}
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-semibold text-primary truncate">{client.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <FaEnvelope className="h-2 w-2 text-slate-400 flex-shrink-0" />
                  <p className="text-[7px] text-slate-600 truncate">{client.email}</p>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <FaLocationDot className="h-2 w-2 text-slate-400 flex-shrink-0" />
                  <p className="text-[7px] text-slate-500">{client.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Formulaire d'ajout superposé */}
        <div className="absolute bottom-1 left-1 right-1 rounded border border-primary/30 bg-white shadow-lg pointer-events-none z-20 p-1.5"
             style={{ transform: 'scale(0.95)' }}>
          <div className="flex items-center gap-1 mb-1 pb-1 border-b border-slate-200">
            <FaUser className="h-3 w-3 text-primary" />
            <p className="text-[9px] font-semibold text-slate-900">{t('form.title')}</p>
          </div>
          <div className="space-y-1">
            <div>
              <label className="text-[7px] text-slate-600 block mb-0.5">{t('form.name')}</label>
              <div className="h-3 w-full rounded border border-slate-300 bg-white px-1 text-[8px] pointer-events-none">
                {t('form.namePlaceholder')}
              </div>
            </div>
            <div>
              <label className="text-[7px] text-slate-600 block mb-0.5">{t('form.email')}</label>
              <div className="h-3 w-full rounded border border-slate-300 bg-white px-1 text-[8px] pointer-events-none flex items-center gap-0.5">
                <FaEnvelope className="h-2 w-2 text-slate-400" />
                <span>contact@example.com</span>
              </div>
            </div>
            <div className="pt-0.5">
              <div className="h-3 w-full rounded bg-primary flex items-center justify-center pointer-events-none">
                <span className="text-[8px] font-medium text-primary-foreground">{t('form.save')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientManagement

