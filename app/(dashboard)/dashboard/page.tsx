"use client";

import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePlus, RefreshCcw, Users, PieChart, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import SimpleChart from "@/components/dashboard/SimpleChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import AtRiskCard from "@/components/dashboard/AtRiskCard";

const statPlaceholders = [
  {
    title: "Revenus du mois",
    value: "--",
    helper: "Synchronisation à venir",
    icon: <Wallet className="h-5 w-5" />,
    trend: { label: "+12% vs. dernier mois", positive: true },
  },
  {
    title: "Factures envoyées",
    value: "--",
    helper: "Données mockées",
    icon: <PieChart className="h-5 w-5" />,
  },
  {
    title: "Total payé",
    value: "--",
    icon: <TrendingUp className="h-5 w-5" />,
    trend: { label: "+4 factures", positive: true },
  },
  {
    title: "Impayés",
    value: "--",
    icon: <TrendingDown className="h-5 w-5" />,
    trend: { label: "-1 relance", positive: false },
    variant: "accent" as const,
  },
];

const mockActivities = [
  {
    id: "1",
    title: "Facture INV-2025-004 envoyée",
    description: "Envoyée à Agence Horizon",
    time: "Il y a 3 heures",
    status: "info" as const,
  },
  {
    id: "2",
    title: "Paiement reçu",
    description: "Kossi Tech - INV-2025-003",
    time: "Hier",
    status: "success" as const,
  },
  {
    id: "3",
    title: "Relance programmée",
    description: "FoodConnect - Echéance dépassée",
    time: "Il y a 2 jours",
    status: "warning" as const,
  },
];

const mockAtRisk = [
  { id: "1", value: "3 factures", label: "En retard > 7 jours", helper: "Total 2 180 €" },
  { id: "2", value: "FoodConnect", label: "Client à relancer", helper: "Dernier contact : 30/12" },
  { id: "3", value: "35%", label: "Tx d&apos;impayés", helper: "Objectif < 10%" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Tableau de bord</h1>
        <p className="mt-2 text-sm text-slate-500">
          Retrouvez un aperçu rapide de vos revenus et des actions à suivre.
        </p>
      </div>
      <Card className="border border-primary/20 bg-white">
        <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base text-primary">Actions rapides</CardTitle>
            <p className="text-xs text-primary/70">
              Trois raccourcis clés pour accélérer votre routine (mock).
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <QuickActionCard
            icon={<FilePlus className="h-5 w-5" />}
            title="Créer une facture"
            description="Brouillon en 5 étapes, preview et envoi."
            onClick={() => console.log("open invoice builder")}
          />
          <QuickActionCard
            icon={<RefreshCcw className="h-5 w-5" />}
            title="Relancer un paiement"
            description="Choisissez un client et envoyez un rappel."
            onClick={() => console.log("open reminders")}
          />
          <QuickActionCard
            icon={<Users className="h-5 w-5" />}
            title="Ajouter un client"
            description="Ajoutez un contact depuis votre carnet (modal)."
            onClick={() => console.log("open client modal")}
          />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statPlaceholders.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            helper={stat.helper}
            icon={stat.icon}
            trend={stat.trend}
            variant={stat.variant}
          />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[2fr_1.2fr]">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <PieChart className="h-5 w-5" />
              Tendances mockées
            </CardTitle>
            <p className="text-xs text-foreground/60">Répartition des revenus (mock).</p>
          </CardHeader>
          <CardContent>
            <SimpleChart data={[15, 25, 35, 20]} labels={["S1", "S2", "S3", "S4"]} />
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Support & nouveautés</CardTitle>
            <p className="text-xs text-foreground/60">Aide, guides et roadmap.</p>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-foreground/70">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="font-semibold text-primary">Centre d&apos;aide mock</p>
              <p className="text-xs">Tutoriels, modèles et astuces pour démarrer.</p>
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="font-semibold text-primary">Roadmap</p>
              <p className="text-xs">Templates PDF avancés, API Nest en cours d&apos;intégration.</p>
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="font-semibold text-primary">Support personnalisé</p>
              <p className="text-xs">Contactez Facturly pour un onboarding assisté.</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Activité récente</CardTitle>
            <p className="text-xs text-foreground/60">Mises à jour mock des dernières actions.</p>
          </CardHeader>
          <CardContent>
            <RecentActivity items={mockActivities} />
          </CardContent>
        </Card>
        <AtRiskCard
          title="À surveiller"
          description="Factures en retard, clients sensibles, objectif impayés."
          items={mockAtRisk}
        />
      </div>
    </div>
  );
}
