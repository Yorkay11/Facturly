"use client";

import { Button } from "@/components/ui/button";
import { FaFileInvoice, FaUsers, FaArrowRight, FaArrowTrendUp } from "react-icons/fa6";
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
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl border border-dashed border-primary/30 bg-card/50 shadow-sm backdrop-blur-sm overflow-hidden">
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
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
              className="flex-1 gap-2 rounded-full"
              onClick={onCreateInvoice}
            >
              <FaFileInvoice className="h-4 w-4" />
              {t("createInvoice") || "Créer une facture"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex-1 gap-2 rounded-full"
              onClick={onAddClient}
            >
              <FaUsers className="h-4 w-4" />
              {t("addClient") || "Ajouter un client"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: FaFileInvoice,
            iconClass: "bg-primary/10 text-primary",
            titleKey: "step1.title",
            titleFallback: "1. Facturez",
            descKey: "step1.description",
            descFallback: "Créez des factures professionnelles en quelques secondes.",
          },
          {
            icon: FaArrowRight,
            iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            titleKey: "step2.title",
            titleFallback: "2. Envoyez",
            descKey: "step2.description",
            descFallback: "Envoyez vos factures par email ou lien sécurisé.",
          },
          {
            icon: FaArrowTrendUp,
            iconClass: "bg-primary/10 text-primary",
            titleKey: "step3.title",
            titleFallback: "3. Encaissez",
            descKey: "step3.description",
            descFallback: "Suivez vos paiements et relancez les impayés.",
          },
        ].map((step) => {
          const StepIcon = step.icon;
          return (
            <div
              key={step.titleKey}
              className="rounded-2xl border border-border/50 bg-card/50 shadow-sm backdrop-blur-sm p-6"
            >
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${step.iconClass}`}>
                <StepIcon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{t(step.titleKey) || step.titleFallback}</h3>
              <p className="text-sm text-muted-foreground">{t(step.descKey) || step.descFallback}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
