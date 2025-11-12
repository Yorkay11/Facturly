"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePlus, RefreshCcw, Users, PieChart, Wallet, TrendingUp, TrendingDown, HelpCircle, BookOpen, Mail, Sparkles, ExternalLink, ArrowRight, BarChart3 } from "lucide-react";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import SimpleChart from "@/components/dashboard/SimpleChart";
import RevenueChart from "@/components/dashboard/RevenueChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import AtRiskCard from "@/components/dashboard/AtRiskCard";
import ClientModal from "@/components/modals/ClientModal";
import { useGetInvoicesQuery } from "@/services/facturlyApi";
import { Skeleton } from "@/components/ui/skeleton";

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
  const router = useRouter();
  const [isClientModalOpen, setClientModalOpen] = useState(false);
  
  // Récupérer les factures pour calculer les tendances
  const { data: invoicesData, isLoading: isLoadingInvoices } = useGetInvoicesQuery({ 
    page: 1, 
    limit: 100 
  });
  
  const invoices = invoicesData?.data || [];
  
  // Calculer les revenus par mois (4 derniers mois)
  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    const months = [];
    
    for (let i = 3; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthDate.toLocaleDateString("fr-FR", { month: "short" });
      
      const monthInvoices = invoices.filter((inv) => {
        if (!inv.issueDate) return false;
        const invDate = new Date(inv.issueDate);
        return (
          invDate.getMonth() === monthDate.getMonth() &&
          invDate.getFullYear() === monthDate.getFullYear() &&
          (inv.status === "paid" || inv.status === "sent")
        );
      });
      
      const revenue = monthInvoices.reduce((sum, inv) => {
        const total = parseFloat(inv.totalAmount || "0");
        return sum + total;
      }, 0);
      
      months.push({
        label: monthName,
        value: revenue,
      });
    }
    
    return months;
  }, [invoices]);
  
  // Calculer les statistiques
  const stats = useMemo(() => {
    const paidInvoices = invoices.filter((inv) => inv.status === "paid");
    const sentInvoices = invoices.filter((inv) => inv.status === "sent");
    const draftInvoices = invoices.filter((inv) => inv.status === "draft");
    const overdueInvoices = invoices.filter((inv) => {
      if (!inv.dueDate || inv.status === "paid") return false;
      return new Date(inv.dueDate) < new Date();
    });
    
    const totalRevenue = paidInvoices.reduce((sum, inv) => {
      return sum + parseFloat(inv.totalAmount || "0");
    }, 0);
    
    const pendingAmount = sentInvoices.reduce((sum, inv) => {
      return sum + parseFloat(inv.totalAmount || "0");
    }, 0);
    
    return {
      totalRevenue,
      pendingAmount,
      paidCount: paidInvoices.length,
      sentCount: sentInvoices.length,
      draftCount: draftInvoices.length,
      overdueCount: overdueInvoices.length,
    };
  }, [invoices]);

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
              Trois raccourcis clés pour accélérer votre routine.
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <QuickActionCard
            icon={<FilePlus className="h-5 w-5" />}
            title="Créer une facture"
            description="Brouillon en 5 étapes, preview et envoi."
            onClick={() => router.push("/invoices/new")}
          />
          <QuickActionCard
            icon={<RefreshCcw className="h-5 w-5" />}
            title="Relancer un paiement"
            description="Choisissez un client et envoyez un rappel."
            onClick={() => router.push("/reminders")}
          />
          <QuickActionCard
            icon={<Users className="h-5 w-5" />}
            title="Ajouter un client"
            description="Ajoutez un contact depuis votre carnet (modal)."
            onClick={() => setClientModalOpen(true)}
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
              <BarChart3 className="h-5 w-5" />
              Tendances des revenus
            </CardTitle>
            <p className="text-xs text-foreground/60">
              Évolution sur les 4 derniers mois
            </p>
          </CardHeader>
          <CardContent>
            {isLoadingInvoices ? (
              <div className="space-y-2">
                <Skeleton className="h-32 w-full" />
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-4 flex-1" />
                  ))}
                </div>
              </div>
            ) : invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BarChart3 className="h-12 w-12 text-foreground/30 mb-3" />
                <p className="text-sm font-medium text-foreground/70 mb-1">
                  Aucune donnée disponible
                </p>
                <p className="text-xs text-foreground/50">
                  Créez vos premières factures pour voir les tendances
                </p>
              </div>
            ) : (
              <>
                <RevenueChart data={monthlyRevenue} />
                <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg border border-primary/10 bg-primary/5 p-3 text-xs">
                  <div>
                    <p className="text-foreground/60">Revenus totaux</p>
                    <p className="mt-1 text-base font-semibold text-primary">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                        minimumFractionDigits: 0,
                      }).format(stats.totalRevenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-foreground/60">En attente</p>
                    <p className="mt-1 text-base font-semibold text-foreground/80">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                        minimumFractionDigits: 0,
                      }).format(stats.pendingAmount)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <HelpCircle className="h-5 w-5" />
              Support & nouveautés
            </CardTitle>
            <p className="text-xs text-foreground/60">Ressources, guides et assistance.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="https://docs.facturly.app"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 transition-all hover:border-primary/40 hover:bg-primary/10"
            >
              <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-primary">Documentation</p>
                  <ExternalLink className="h-3 w-3 text-primary/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <p className="text-xs text-foreground/70">Guides complets, tutoriels vidéo et FAQ pour maîtriser Facturly.</p>
              </div>
            </a>
            <div className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-3">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-primary">Nouvelle fonctionnalité</p>
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">Nouveau</span>
                  </div>
                  <p className="text-xs text-foreground/70">Gestion des relances automatisées maintenant disponible. Configurez vos rappels depuis les paramètres.</p>
                </div>
              </div>
            </div>
            <a
              href="mailto:support@facturly.app?subject=Demande d'assistance"
              className="group flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 transition-all hover:border-primary/40 hover:bg-primary/10"
            >
              <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-primary">Support par email</p>
                  <ArrowRight className="h-3 w-3 text-primary/60 transition-transform group-hover:translate-x-1" />
                </div>
                <p className="text-xs text-foreground/70">Une question ? Contactez notre équipe à support@facturly.app</p>
              </div>
            </a>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-600" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold text-slate-800">À venir</p>
                  <p className="text-xs text-slate-600">Templates PDF personnalisables, intégrations comptables et API publique en développement.</p>
                </div>
              </div>
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
      <ClientModal open={isClientModalOpen} onClose={() => setClientModalOpen(false)} />
    </div>
  );
}
