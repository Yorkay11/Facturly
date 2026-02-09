"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaFileInvoice, FaUsers, FaPlus, FaArrowRight, FaWandMagicSparkles, FaArrowTrendUp } from "react-icons/fa6";
import { useTranslations } from "next-intl";
import { FuryMascot } from "@/components/mascot/FuryMascot";

interface DashboardEmptyStateProps {
  onCreateInvoice: () => void;
  onAddClient: () => void;
}

export default function DashboardEmptyState({
  onCreateInvoice,
  onAddClient,
}: DashboardEmptyStateProps) {
  const t = useTranslations("dashboard.emptyState");

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-dashed border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-6">
            <FuryMascot mood="welcome" size="lg" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-primary mb-2">
            {t("title") || "Bienvenue sur votre tableau de bord !"}
          </h2>
          <p className="max-w-lg text-muted-foreground mb-8">
            {t("description") || "C'est ici que vous pourrez suivre votre activité. Pour commencer, créez votre première facture ou ajoutez un client."}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Button 
              size="lg" 
              className="flex-1 gap-2" 
              onClick={onCreateInvoice}
            >
              <FaFileInvoice className="h-4 w-4" />
              {t("createInvoice") || "Créer une facture"}
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="flex-1 gap-2" 
              onClick={onAddClient}
            >
              <FaUsers className="h-4 w-4" />
              {t("addClient") || "Ajouter un client"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <FaFileInvoice className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">{t("step1.title") || "1. Facturez"}</h3>
            <p className="text-sm text-slate-500">
              {t("step1.description") || "Créez des factures professionnelles en quelques secondes."}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <FaArrowRight className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">{t("step2.title") || "2. Envoyez"}</h3>
            <p className="text-sm text-slate-500">
              {t("step2.description") || "Envoyez vos factures par email ou lien sécurisé."}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <FaArrowTrendUp className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">{t("step3.title") || "3. Encaissez"}</h3>
            <p className="text-sm text-slate-500">
              {t("step3.description") || "Suivez vos paiements et relancez les impayés."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
