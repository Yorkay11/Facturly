"use client"

import React from "react"
import { Mail, Check } from "lucide-react"

const EmailSending: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center p-1.5 bg-white relative overflow-hidden">
      <div className="w-full h-full relative overflow-hidden">
        {/* Facture en arrière-plan */}
        <div className="absolute inset-0 opacity-20">
          <div className="rounded border border-slate-200 bg-white p-1.5 h-full">
            <div className="space-y-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[7px] font-semibold text-primary mb-0.5">FACTURLY</p>
                  <p className="text-[8px] text-slate-700">Ma Société</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-slate-900 font-medium">FAC-001</p>
                  <p className="text-[7px] text-slate-500">01/04/2024</p>
                </div>
              </div>
              <div className="h-px bg-slate-200 my-0.5" />
              <div className="space-y-0.5">
                <div className="grid grid-cols-4 gap-0.5 text-[6px] text-slate-600">
                  <div>Développement</div>
                  <div className="text-right">5</div>
                  <div className="text-right">120€</div>
                  <div className="text-right font-medium text-primary">600€</div>
                </div>
              </div>
              <div className="mt-0.5 pt-0.5 border-t border-slate-200">
                <div className="flex justify-end gap-1">
                  <p className="text-[7px] font-semibold text-primary">1 050€</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Interface d'envoi d'email superposée */}
        <div className="absolute top-[15%] -right-[20%] w-[90%] rounded border border-primary/20 bg-white shadow-lg pointer-events-none z-10 p-2"
             style={{ transform: 'scale(1.2)' }}>
          <div className="space-y-1.5">
            {/* Header */}
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <Mail className="h-3 w-3 text-primary" />
              <p className="text-[10px] font-medium text-slate-900">Envoyer la facture</p>
            </div>
            
            {/* Formulaire */}
            <div className="space-y-1">
              <div>
                <label className="text-[8px] text-slate-600 block mb-0.5">Destinataire</label>
                <div className="h-4 w-full rounded border border-slate-300 bg-white px-1.5 text-[9px] pointer-events-none flex items-center gap-1">
                  <span className="text-slate-700">contact@acmecorp.com</span>
                </div>
              </div>
              
              <div>
                <label className="text-[8px] text-slate-600 block mb-0.5">Objet</label>
                <div className="h-4 w-full rounded border border-slate-300 bg-white px-1.5 text-[9px] pointer-events-none">
                  <span className="text-slate-700">Facture FAC-001 - 1 050€</span>
                </div>
              </div>
              
              {/* Aperçu email */}
              <div className="rounded border border-primary/20 bg-primary/5 p-1.5 mt-1">
                <p className="text-[7px] font-medium text-primary mb-0.5">Aperçu</p>
                <div className="space-y-0.5 text-[8px] text-slate-600">
                  <p>Bonjour Acme Corp,</p>
                  <p>Veuillez trouver ci-joint votre facture FAC-001 d'un montant de 1 050€.</p>
                  <div className="mt-0.5 pt-0.5 border-t border-primary/20">
                    <p className="text-primary font-medium">Voir la facture</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bouton d'envoi */}
            <div className="pt-1 border-t border-slate-200">
              <div className="h-5 w-full rounded bg-primary flex items-center justify-center gap-1.5 pointer-events-none">
                <Mail className="h-2.5 w-2.5 text-primary-foreground" />
                <span className="text-[9px] font-medium text-primary-foreground">Envoyer</span>
              </div>
            </div>
            
            {/* Confirmation */}
            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
              <Check className="h-2 w-2 text-primary-foreground" />
            </div>
          </div>
        </div>
        
        {/* Email envoyé (visualisation) */}
        <div className="absolute bottom-2 left-2 w-[45%] rounded border border-primary/20 bg-white shadow-md pointer-events-none z-20 p-1.5">
          <div className="flex items-center gap-1 mb-0.5">
            <Mail className="h-2.5 w-2.5 text-primary" />
            <p className="text-[8px] font-medium text-slate-900">Email envoyé</p>
            <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
          </div>
          <div className="space-y-0.5 text-[7px] text-slate-600">
            <p>De: facturly@example.com</p>
            <p>À: contact@acmecorp.com</p>
            <p className="text-[6px] text-slate-500 mt-0.5">Il y a 2 minutes</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailSending

