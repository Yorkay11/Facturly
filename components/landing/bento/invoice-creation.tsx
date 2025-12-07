"use client"

import React from "react"
import { Plus, CalendarIcon, ChevronsUpDown } from "lucide-react"

const InvoiceCreation: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center p-1.5 bg-gradient-to-br from-primary/5 via-transparent to-transparent relative overflow-hidden">
      <div className="w-full h-full relative overflow-hidden">
        {/* Formulaire en arrière-plan */}
        <div className="absolute inset-0 flex flex-col gap-1 opacity-40">
          {/* Section Informations facture */}
          <div className="rounded border border-slate-200 bg-white p-1.5 shadow-sm">
            <p className="text-[9px] font-semibold text-slate-900 mb-1">Informations facture</p>
            <div className="space-y-0.5">
              <div>
                <label className="text-[8px] text-muted-foreground block mb-0.5">Destinataire</label>
                <div className="h-4 w-full rounded border border-input bg-background flex items-center justify-between px-1.5 text-[9px] pointer-events-none">
                  <span>Acme Corp</span>
                  <ChevronsUpDown className="h-2 w-2 opacity-50" />
                </div>
              </div>
              <div>
                <label className="text-[8px] text-muted-foreground block mb-0.5">Objet</label>
                <div className="h-4 w-full rounded border border-input bg-background px-1.5 text-[9px] pointer-events-none">
                  Développement site web
                </div>
              </div>
            </div>
          </div>
          
          {/* Section Lignes de facture */}
          <div className="flex-1 rounded border border-slate-200 bg-white p-1.5 shadow-sm flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-[9px] font-semibold text-slate-900">Lignes de facture</p>
              <div className="h-4 px-1 rounded border border-input bg-background flex items-center gap-0.5 text-[8px] pointer-events-none">
                <Plus className="h-2 w-2" />
                <span>Ajouter</span>
              </div>
            </div>
            <div className="h-px bg-border mb-0.5" />
            <div className="flex-1 space-y-0.5">
              <div className="rounded border border-slate-200 p-1">
                <p className="text-[9px] font-medium text-slate-900">Développement frontend</p>
                <p className="text-[8px] text-slate-500">5 × 120€</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Aperçu de facture superposé - ZOOM */}
        <div className="absolute top-[10%] -right-[90%] w-[140%] rounded-lg border border-slate-200 bg-violet-50 shadow-2xl pointer-events-none z-10 p-4"
             style={{ backgroundColor: 'hsl(266, 74%, 96%)', transform: 'scale(1.1)' }}>
          {/* Header avec émetteur/destinataire et informations */}
          <div className="flex justify-between gap-3 mb-1.5">
            {/* Émetteur et destinataire */}
            <div className="space-y-1.5 flex-1">
              <div>
                <p className="text-[11px] font-semibold text-primary mb-1">FACTURLY — TEMPLATE CLASSIC</p>
                <p className="text-[13px] font-medium text-slate-900 mb-0.5">Ma Société</p>
                <p className="text-[11px] text-slate-600">Paris, France</p>
              </div>
              <div className="mt-1.5">
                <p className="text-[11px] font-semibold text-primary mb-0.5">DESTINATAIRE</p>
                <p className="text-[13px] font-medium text-slate-900">Acme Corp</p>
                <p className="text-[11px] text-slate-600">Lyon, France</p>
              </div>
            </div>
            
            {/* Informations (objet, dates) */}
            <div className="text-right space-y-0.5">
              <p className="text-[11px] font-semibold uppercase opacity-70 mb-1">INFORMATIONS</p>
              <p className="text-[12px] text-slate-900">Objet : Projet web</p>
              <p className="text-[12px] text-slate-900">Émise le : 01/04/2024</p>
              <p className="text-[12px] text-slate-900">Échéance : 30/04/2024</p>
            </div>
          </div>
          
          {/* Séparateur */}
          <div className="h-[2px] bg-primary/30 my-1.5" />
          
          {/* Tableau */}
          <div className="space-y-1.5">
            {/* Header du tableau */}
            <div className="grid grid-cols-5 gap-2 mb-1.5 text-[11px] font-semibold text-slate-700">
              <div>Description</div>
              <div className="text-right">Qté</div>
              <div className="text-right">P.U.</div>
              <div className="text-right">TVA</div>
              <div className="text-right">Total</div>
            </div>
            {/* Lignes du tableau */}
            <div className="grid grid-cols-5 gap-2 text-[12px] text-slate-900">
              <div className="text-[12px]">Développement frontend</div>
              <div className="text-right text-[12px]">5</div>
              <div className="text-right text-[12px]">120€</div>
              <div className="text-right text-[12px]">0%</div>
              <div className="text-right text-[12px] font-semibold">600€</div>
            </div>
            <div className="grid grid-cols-5 gap-2 text-[12px] text-slate-900">
              <div className="text-[12px]">Intégration API</div>
              <div className="text-right text-[12px]">3</div>
              <div className="text-right text-[12px]">150€</div>
              <div className="text-right text-[12px]">0%</div>
              <div className="text-right text-[12px] font-semibold">450€</div>
            </div>
          </div>
          
          {/* Footer avec sous-total, TVA, Total */}
          <div className="mt-1.5 pt-1.5 border-t border-slate-200 space-y-1">
            <div className="flex justify-end gap-4">
              <p className="text-[11px] uppercase opacity-70">Sous-total</p>
              <p className="text-[12px] font-semibold text-slate-900">1 050€</p>
            </div>
            <div className="flex justify-end gap-4">
              <p className="text-[11px] uppercase opacity-70">TVA estimée</p>
              <p className="text-[12px] font-semibold text-slate-900">0€</p>
            </div>
            <div className="flex justify-end gap-4">
              <p className="text-[12px] font-bold uppercase">Total TTC</p>
              <p className="text-[14px] font-bold text-primary">1 050€</p>
            </div>
          </div>
        </div>
        
        {/* Formulaire au premier plan (partie visible) */}
        <div className="absolute bottom-2 left-2 w-1/2 rounded border border-slate-200 bg-white/95 backdrop-blur-sm shadow-md p-1.5 pointer-events-none z-20">
          <p className="text-[8px] font-semibold text-slate-900 mb-0.5">Lignes de facture</p>
          <div className="h-px bg-border mb-0.5" />
          <div className="space-y-0.5">
            <div className="rounded border border-slate-200 p-0.5">
              <div className="flex justify-between items-start gap-1">
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] font-medium text-slate-900 truncate leading-tight">Développement frontend</p>
                  <p className="text-[7px] text-slate-500 leading-tight">5 × 120€</p>
                </div>
                <div className="text-[8px] font-semibold text-slate-900 whitespace-nowrap">600€</div>
              </div>
            </div>
            <div className="rounded border border-slate-200 p-0.5">
              <div className="flex justify-between items-start gap-1">
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] font-medium text-slate-900 truncate leading-tight">Intégration API</p>
                  <p className="text-[7px] text-slate-500 leading-tight">3 × 150€</p>
                </div>
                <div className="text-[8px] font-semibold text-slate-900 whitespace-nowrap">450€</div>
              </div>
            </div>
          </div>
          <div className="mt-0.5 pt-0.5 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-[8px] font-semibold text-slate-900">Total</span>
              <span className="text-[8px] font-bold text-primary">1 050€</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceCreation

