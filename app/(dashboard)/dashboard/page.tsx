"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IoDocumentTextOutline,
  IoRefreshOutline,
  IoPeopleOutline,
  IoPieChartOutline,
  IoWalletOutline,
  IoTrendingUpOutline,
  IoTrendingDownOutline,
  IoHelpCircleOutline,
  IoBookOutline,
  IoMailOutline,
  IoOpenOutline,
  IoArrowForwardOutline,
  IoBarChartOutline,
  IoListOutline,
  IoCubeOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { FaMagic } from "react-icons/fa";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import AtRiskCard from "@/components/dashboard/AtRiskCard";
import ClientModal from "@/components/modals/ClientModal";
import {
  useGetInvoicesQuery,
  useGetDashboardStatsQuery,
  useGetDashboardActivitiesQuery,
  useGetDashboardAlertsQuery,
  useGetSubscriptionQuery,
} from "@/services/facturlyApi";
import { InvoiceLimitBanner } from "@/components/dashboard/InvoiceLimitBanner";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function DashboardPage() {
  const router = useRouter();
  const [isClientModalOpen, setClientModalOpen] = useState(false);

  // Récupérer les données du dashboard depuis l'API
  const { data: dashboardStats, isLoading: isLoadingStats } =
    useGetDashboardStatsQuery();
  const { data: activitiesData, isLoading: isLoadingActivities } =
    useGetDashboardActivitiesQuery({ limit: 5 });
  const { data: alertsData, isLoading: isLoadingAlerts } =
    useGetDashboardAlertsQuery();
  const { data: subscription } = useGetSubscriptionQuery(); // Pour vérifier le plan

  // Récupérer les factures pour le graphique (fallback si stats non disponibles)
  const { data: invoicesData, isLoading: isLoadingInvoices } =
    useGetInvoicesQuery({
      page: 1,
      limit: 100,
    });

  const invoices = invoicesData?.data || [];

  // Transformer les données de revenus mensuels depuis l'API
  const monthlyRevenue = useMemo(() => {
    if (
      dashboardStats?.monthlyRevenues &&
      dashboardStats.monthlyRevenues.length > 0
    ) {
      return dashboardStats.monthlyRevenues.map((item) => {
        const date = new Date(item.year, item.month - 1, 1);
        const monthName = date.toLocaleDateString("fr-FR", { month: "short" });
        return {
          label: monthName,
          value: parseFloat(item.revenue || "0"),
        };
      });
    }

    // Fallback: calculer depuis les factures si l'API n'a pas de données
    const now = new Date();
    const months = [];

    for (let i = 3; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthDate.toLocaleDateString("fr-FR", {
        month: "short",
      });

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
  }, [dashboardStats, invoices]);

  // Transformer les activités depuis l'API
  const activities = useMemo(() => {
    if (!activitiesData?.data) return [];

    return activitiesData.data.map((activity) => {
      const date = new Date(activity.date);
      const timeAgo = formatDistanceToNow(date, {
        addSuffix: true,
        locale: fr,
      });

      // Déterminer le statut basé sur le type d'activité
      let status: "info" | "success" | "warning" | undefined = "info";
      if (
        activity.type === "payment_received" ||
        activity.status === "completed"
      ) {
        status = "success";
      } else if (
        activity.type.includes("overdue") ||
        activity.status === "overdue"
      ) {
        status = "warning";
      }

      return {
        id: activity.entityId,
        title: activity.title,
        description: activity.description || "",
        time: timeAgo,
        status,
      };
    });
  }, [activitiesData]);

  // Transformer les alertes depuis l'API
  const atRiskItems = useMemo(() => {
    if (!alertsData) return [];

    const items = [];

    // Factures en retard
    if (alertsData.overdueInvoices && alertsData.overdueInvoices.length > 0) {
      const overdueCount = alertsData.overdueInvoices.length;
      const totalOverdue = alertsData.overdueInvoices.reduce((sum, inv) => {
        return sum + parseFloat(inv.totalAmount || "0");
      }, 0);

      items.push({
        id: "overdue",
        value: `${overdueCount} facture${overdueCount > 1 ? "s" : ""}`,
        label: "En retard > 7 jours",
        helper: `Total ${new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: alertsData.overdueInvoices[0]?.currency || "EUR",
          minimumFractionDigits: 0,
        }).format(totalOverdue)}`,
      });
    }

    // Clients avec factures impayées
    if (
      alertsData.clientsWithUnpaidInvoices &&
      alertsData.clientsWithUnpaidInvoices.length > 0
    ) {
      const firstClient = alertsData.clientsWithUnpaidInvoices[0];
      items.push({
        id: "client-unpaid",
        value: firstClient.clientName,
        label: "Client à relancer",
        helper: `${firstClient.unpaidCount} facture${
          firstClient.unpaidCount > 1 ? "s" : ""
        } impayée${firstClient.unpaidCount > 1 ? "s" : ""}`,
      });
    }

    // Taux d'impayés
    if (alertsData.totalUnpaid) {
      const totalUnpaid = parseFloat(alertsData.totalUnpaid);
      // Calculer le taux si on a les stats du dashboard
      if (dashboardStats?.totalPaid) {
        const totalPaid = parseFloat(dashboardStats.totalPaid);
        const total = totalPaid + totalUnpaid;
        if (total > 0) {
          const rate = (totalUnpaid / total) * 100;
          items.push({
            id: "unpaid-rate",
            value: `${rate.toFixed(0)}%`,
            label: "Tx d'impayés",
            helper: "Objectif < 10%",
          });
        }
      }
    }

    return items;
  }, [alertsData, dashboardStats]);

  // Statistiques pour les cartes
  const stats = useMemo(() => {
    if (dashboardStats) {
      const monthlyRev = dashboardStats.monthlyRevenue?.[0];

      // Utiliser invoicesByStatus pour obtenir le nombre total de factures envoyées
      // Plus précis que invoicesSent qui peut être limité au mois en cours
      const sentStatusCount = dashboardStats.invoicesByStatus?.find(
        (status) => status.status === "sent"
      );
      const totalSentCount = sentStatusCount?.count || 0;

      return {
        monthlyRevenue: monthlyRev ? parseFloat(monthlyRev.amount || "0") : 0,
        invoicesSent: totalSentCount,
        totalPaid: parseFloat(dashboardStats.totalPaid || "0"),
        totalUnpaid: parseFloat(dashboardStats.totalUnpaid || "0"),
      };
    }

    // Fallback: calculer depuis les factures
    const paidInvoices = invoices.filter((inv) => inv.status === "paid");
    const sentInvoices = invoices.filter((inv) => inv.status === "sent");

    const totalRevenue = paidInvoices.reduce((sum, inv) => {
      return sum + parseFloat(inv.totalAmount || "0");
    }, 0);

    const pendingAmount = sentInvoices.reduce((sum, inv) => {
      return sum + parseFloat(inv.totalAmount || "0");
    }, 0);

    return {
      monthlyRevenue: totalRevenue,
      invoicesSent: sentInvoices.length,
      totalPaid: totalRevenue,
      totalUnpaid: pendingAmount,
    };
  }, [dashboardStats, invoices]);

  const isLoading = isLoadingStats || isLoadingInvoices;

  return (
    <div className="space-y-6 ">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Tableau de bord
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Retrouvez un aperçu rapide de vos revenus et des actions à suivre.
        </p>
      </div>

      {/* Banner pour les utilisateurs du plan gratuit */}
      <InvoiceLimitBanner
        invoiceLimit={
          dashboardStats?.invoiceLimit || subscription?.invoiceLimit
        }
        planCode={subscription?.plan?.code}
      />

      <Card className="border border-primary/20 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base text-primary">
              Actions rapides
            </CardTitle>
            <p className="text-xs text-primary/70">
              Trois raccourcis clés pour accélérer votre routine.
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <QuickActionCard
            icon={<IoDocumentTextOutline className="h-5 w-5" />}
            title="Créer une facture"
            description="Brouillon en 5 étapes, preview et envoi."
            onClick={() => router.push("/invoices/new")}
            color="blue"
          />
          <QuickActionCard
            icon={<IoRefreshOutline className="h-5 w-5" />}
            title="Relancer un paiement"
            description="Choisissez un client et envoyez un rappel."
            onClick={() => router.push("/reminders")}
            color="orange"
          />
          <QuickActionCard
            icon={<IoPeopleOutline className="h-5 w-5" />}
            title="Ajouter un client"
            description="Ajoutez un contact depuis votre carnet."
            onClick={() => setClientModalOpen(true)}
            color="green"
          />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Revenus du mois"
          value={
            isLoading
              ? "--"
              : new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency:
                    dashboardStats?.monthlyRevenue?.[0]?.currency || "EUR",
                  minimumFractionDigits: 0,
                }).format(stats.monthlyRevenue)
          }
          helper={isLoading ? "Chargement..." : undefined}
          icon={<IoWalletOutline className="h-5 w-5" />}
        />
        <StatCard
          title="Factures envoyées"
          value={isLoading ? "--" : stats.invoicesSent.toString()}
          helper={isLoading ? "Chargement..." : undefined}
          icon={<IoPieChartOutline className="h-5 w-5" />}
        />
        <StatCard
          title="Total payé"
          value={
            isLoading
              ? "--"
              : new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency:
                    dashboardStats?.monthlyRevenue?.[0]?.currency || "EUR",
                  minimumFractionDigits: 0,
                }).format(stats.totalPaid)
          }
          helper={isLoading ? "Chargement..." : undefined}
          icon={<IoTrendingUpOutline className="h-5 w-5" />}
        />
        <StatCard
          title="Impayés"
          value={
            isLoading
              ? "--"
              : new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency:
                    dashboardStats?.monthlyRevenue?.[0]?.currency || "EUR",
                  minimumFractionDigits: 0,
                }).format(stats.totalUnpaid)
          }
          helper={isLoading ? "Chargement..." : undefined}
          icon={<IoTrendingDownOutline className="h-5 w-5" />}
          variant="accent"
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr] xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card className="border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <IoBarChartOutline className="h-5 w-5" />
                Tendances des revenus
              </CardTitle>
              <p className="text-xs text-foreground/60">
                Évolution sur les 4 derniers mois
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-32 w-full" />
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-4 flex-1" />
                    ))}
                  </div>
                </div>
              ) : monthlyRevenue.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <IoBarChartOutline className="h-12 w-12 text-foreground/30 mb-3" />
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
                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-md border border-primary/10 bg-primary/5 p-3 text-xs">
                    <div>
                      <p className="text-foreground/60">Total payé</p>
                      <p className="mt-1 text-base font-semibold text-primary">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency:
                            dashboardStats?.monthlyRevenue?.[0]?.currency ||
                            "EUR",
                          minimumFractionDigits: 0,
                        }).format(stats.totalPaid)}
                      </p>
                    </div>
                    <div>
                      <p className="text-foreground/60">En attente</p>
                      <p className="mt-1 text-base font-semibold text-foreground/80">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency:
                            dashboardStats?.monthlyRevenue?.[0]?.currency ||
                            "EUR",
                          minimumFractionDigits: 0,
                        }).format(stats.totalUnpaid)}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle className="text-primary">Activité récente</CardTitle>
            <p className="text-xs text-foreground/60">
              Dernières actions sur votre compte.
            </p>
          </CardHeader>
          <CardContent>
            {isLoadingActivities ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : activities.length > 0 ? (
              <RecentActivity items={activities.slice(0, 3)} />
            ) : (
              <div className="rounded-md border border-dashed border-primary/30 bg-white py-8 text-center">
                <p className="text-sm text-foreground/60">
                  Aucune activité récente
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        {isLoadingAlerts ? (
          <Card className="border-primary/20 shadow-sm">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <AtRiskCard
            title="À surveiller"
            description="Factures en retard, clients sensibles, objectif impayés."
            items={
              atRiskItems.length > 0
                ? atRiskItems
                : [
                    {
                      id: "none",
                      value: "Aucune alerte",
                      label: "Tout est en ordre",
                    },
                  ]
            }
          />
        )}
      </div>
        </div>

        <div className="space-y-4">
          {/* Statistiques rapides */}
          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-primary">
                Résumé rapide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex items-center justify-between border-b border-primary/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <IoPieChartOutline className="h-3.5 w-3.5 text-foreground/40" />
                  <span className="text-xs text-foreground/60">
                    Factures ce mois
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {isLoading ? "--" : stats.invoicesSent}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-primary/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <IoTrendingUpOutline className="h-3.5 w-3.5 text-foreground/40" />
                  <span className="text-xs text-foreground/60">
                    Taux de paiement
                  </span>
                </div>
                <span className="text-sm font-semibold text-primary">
                  {isLoading || stats.totalPaid + stats.totalUnpaid === 0
                    ? "--"
                    : `${Math.round(
                        (stats.totalPaid /
                          (stats.totalPaid + stats.totalUnpaid)) *
                          100
                      )}%`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IoWalletOutline className="h-3.5 w-3.5 text-foreground/40" />
                  <span className="text-xs text-foreground/60">
                    Revenus moyens
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {isLoading || stats.invoicesSent === 0
                    ? "--"
                    : new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency:
                          dashboardStats?.monthlyRevenue?.[0]?.currency ||
                          "EUR",
                        minimumFractionDigits: 0,
                      }).format(stats.monthlyRevenue / stats.invoicesSent)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
                <IoListOutline className="h-4 w-4" />
                Navigation rapide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <button
                onClick={() => router.push("/invoices")}
                className="group w-full flex items-center gap-2.5 rounded-md border border-primary/20 bg-primary/5 p-2.5 transition-all hover:border-primary/40 hover:bg-primary/10 text-left"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 text-blue-600">
                  <IoDocumentTextOutline className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">
                    Toutes les factures
                  </p>
                  <p className="text-[10px] text-foreground/60 mt-0.5">
                    Voir et gérer
                  </p>
                </div>
                <IoArrowForwardOutline className="h-3 w-3 text-primary/60 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={() => router.push("/clients")}
                className="group w-full flex items-center gap-2.5 rounded-md border border-primary/20 bg-primary/5 p-2.5 transition-all hover:border-primary/40 hover:bg-primary/10 text-left"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-600">
                  <IoPeopleOutline className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">
                    Mes clients
                  </p>
                  <p className="text-[10px] text-foreground/60 mt-0.5">
                    Gérer le carnet
                  </p>
                </div>
                <IoArrowForwardOutline className="h-3 w-3 text-primary/60 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={() => router.push("/items")}
                className="group w-full flex items-center gap-2.5 rounded-md border border-primary/20 bg-primary/5 p-2.5 transition-all hover:border-primary/40 hover:bg-primary/10 text-left"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-100 text-purple-600">
                  <IoCubeOutline className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">
                    Produits
                  </p>
                  <p className="text-[10px] text-foreground/60 mt-0.5">
                    Catalogue et tarifs
                  </p>
                </div>
                <IoArrowForwardOutline className="h-3 w-3 text-primary/60 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={() => router.push("/settings")}
                className="group w-full flex items-center gap-2.5 rounded-md border border-primary/20 bg-primary/5 p-2.5 transition-all hover:border-primary/40 hover:bg-primary/10 text-left"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                  <IoSettingsOutline className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">
                    Paramètres
                  </p>
                  <p className="text-[10px] text-foreground/60 mt-0.5">
                    Configuration
                  </p>
                </div>
                <IoArrowForwardOutline className="h-3 w-3 text-primary/60 transition-transform group-hover:translate-x-0.5" />
              </button>
            </CardContent>
          </Card>

          {/* Support & Ressources */}
          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
                <IoHelpCircleOutline className="h-4 w-4" />
                Ressources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <a
                href="https://docs.facturly.app"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 p-2.5 transition-all hover:border-primary/40 hover:bg-primary/10"
              >
                <IoBookOutline className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-primary truncate">
                    Documentation
                  </p>
                </div>
                <IoOpenOutline className="h-3 w-3 text-primary/60 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="mailto:support@facturly.app?subject=Demande d'assistance"
                className="group flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 p-2.5 transition-all hover:border-primary/40 hover:bg-primary/10"
              >
                <IoMailOutline className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-primary truncate">
                    Support
                  </p>
                </div>
                <IoArrowForwardOutline className="h-3 w-3 text-primary/60 transition-transform group-hover:translate-x-0.5" />
              </a>
              <div className="rounded-md border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-2.5">
                <div className="flex items-start gap-2">
                  <FaMagic className="h-3.5 w-3.5 flex-shrink-0 text-primary mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-xs font-semibold text-primary">
                        Nouveau
                      </p>
                      <span className="rounded-md bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                        !
                      </span>
                    </div>
                    <p className="text-[10px] text-foreground/70 leading-tight">
                      Relances automatisées disponibles
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <ClientModal
        open={isClientModalOpen}
        onClose={() => setClientModalOpen(false)}
      />
    </div>
  );
}
