"use client"

import { Zap, FileText, Plus, Trash2, Layout, Settings2, Eye, Download, Send, User, Calendar, CreditCard, Type } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/landing/ui/button"
import { Card, CardContent } from "@/components/landing/ui/card"
import { Badge } from "@/components/landing/ui/badge"

export function MockDashboardPreview() {
  return (
    <div className="w-full max-w-[1100px] mx-auto">
      <div className="bg-slate-50 border-2 border-primary/10 rounded-[2.5rem] shadow-2xl overflow-hidden">
        {/* Header de la page */}
        <div className="p-6 md:p-8 border-b border-slate-200 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                <span>Factures</span>
                <span>/</span>
                <span className="text-primary">Nouvelle facture</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Créer une facture</h2>
            </div>
            
            {/* Tabs Mode Rapide / Complet */}
            <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit shadow-inner">
              <div className="px-6 py-2 text-sm font-bold text-slate-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Mode Rapide
              </div>
              <div className="px-6 py-2 bg-white rounded-xl shadow-md text-sm font-bold text-primary flex items-center gap-2 border border-primary/5">
                <FileText className="w-4 h-4" />
                Mode Complet
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 grid grid-cols-1 xl:grid-cols-[1fr_450px] gap-8">
          {/* Colonne de gauche : Formulaire détaillé */}
          <div className="space-y-6">
            {/* Section Client */}
            <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-500" />
                  </div>
                  <h3 className="font-bold text-slate-800">Informations Client</h3>
                </div>
                <Button variant="ghost" size="sm" className="text-primary font-bold text-xs">+ Nouveau client</Button>
              </div>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Client</label>
                  <div className="h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center px-4 text-slate-900 font-medium">
                    Amadou Traoré
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email de réception</label>
                  <div className="h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center px-4 text-slate-500 font-medium">
                    amadou@techstart.com
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section Articles */}
            <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center">
                    <Layout className="w-5 h-5 text-purple-500" />
                  </div>
                  <h3 className="font-bold text-slate-800">Articles & Services</h3>
                </div>
                <Badge className="bg-purple-50 text-purple-600 border-none font-bold">2 articles</Badge>
              </div>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider pl-6">Description</th>
                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Qté</th>
                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right pr-6">Prix (XOF)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      <tr>
                        <td className="p-4 pl-6">
                          <p className="font-bold text-slate-900 text-sm">Développement Web</p>
                          <p className="text-xs text-slate-400">Phase 1 : Landing Page</p>
                        </td>
                        <td className="p-4 text-center font-bold text-slate-700">1</td>
                        <td className="p-4 text-right pr-6 font-black text-slate-900">150 000</td>
                      </tr>
                      <tr className="bg-slate-50/30">
                        <td className="p-4 pl-6">
                          <p className="font-bold text-slate-900 text-sm">Design UI/UX</p>
                          <p className="text-xs text-slate-400">Maquettes Figma</p>
                        </td>
                        <td className="p-4 text-center font-bold text-slate-700">1</td>
                        <td className="p-4 text-right pr-6 font-black text-slate-900">75 000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="p-6 bg-slate-50/50">
                  <Button variant="outline" className="w-full border-dashed border-2 border-slate-200 text-slate-500 font-bold hover:border-primary/30 hover:text-primary transition-all rounded-xl">
                    <Plus className="w-4 h-4 mr-2" /> Ajouter un article
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Actions de bas de page */}
            <div className="flex gap-4">
              <Button className="flex-1 h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] gap-3">
                <Send className="w-5 h-5" />
                Envoyer la facture
              </Button>
              <Button variant="outline" className="h-14 px-6 border-2 border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-100 transition-all">
                <Download className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Colonne de droite : Preview Temps Réel */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <span className="font-black text-slate-900 uppercase text-xs tracking-widest">Aperçu en direct</span>
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <div className="w-2 h-2 rounded-full bg-green-400" />
              </div>
            </div>

            <div className="relative group">
              {/* Fond décoratif style canvas */}
              <div className="absolute -inset-4 bg-slate-200/50 rounded-[2rem] -z-10 border border-slate-300/50" 
                   style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              
              {/* La Facture elle-même */}
              <div className="bg-white shadow-2xl rounded-xl overflow-hidden border border-slate-100 aspect-[1/1.4] flex flex-col scale-[0.98] group-hover:scale-100 transition-transform duration-500">
                {/* En-tête facture */}
                <div className="p-8 border-b-4 border-primary bg-slate-50/50">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl">F</div>
                    <div className="text-right">
                      <h4 className="font-black text-slate-900 text-xl uppercase tracking-tighter">Facture</h4>
                      <p className="text-primary font-bold text-sm">#FAC-2026-001</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8 text-[10px]">
                    <div>
                      <p className="text-slate-400 font-bold uppercase mb-2">Émetteur</p>
                      <p className="font-black text-slate-900">VOTRE ENTREPRISE</p>
                      <p className="text-slate-500">Abidjan, Côte d'Ivoire</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 font-bold uppercase mb-2">Facturé à</p>
                      <p className="font-black text-slate-900">AMADOU TRAORÉ</p>
                      <p className="text-slate-500">TechStart SARL</p>
                    </div>
                  </div>
                </div>

                {/* Corps facture */}
                <div className="p-8 flex-1">
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase border-b border-slate-100 pb-2">
                      <span>Description</span>
                      <span>Total</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-700">Développement Web</span>
                      <span className="font-black text-slate-900">150 000 XOF</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-700">Design UI/UX</span>
                      <span className="font-black text-slate-900">75 000 XOF</span>
                    </div>
                  </div>
                </div>

                {/* Pied de facture */}
                <div className="p-8 bg-slate-900 text-white">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">Total à payer</span>
                    <span className="text-2xl font-black text-primary">225 000 XOF</span>
                  </div>
                </div>
              </div>

              {/* Badges de personnalisation flottants */}
              <div className="absolute -left-6 top-1/3 bg-white p-3 rounded-2xl shadow-xl border border-slate-100 space-y-3 animate-pulse-slow">
                <div className="w-6 h-6 rounded-full bg-primary" />
                <div className="w-6 h-6 rounded-full bg-purple-500" />
                <div className="w-6 h-6 rounded-full bg-slate-900" />
              </div>
            </div>

            {/* Sélecteur de template mock */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Template actif</p>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Layout className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-slate-700">Moderne (Sombre)</span>
                </div>
                <Settings2 className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
