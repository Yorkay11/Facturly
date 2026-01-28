"use client";

import { useRouter } from '@/i18n/routing';
import { useState, useMemo } from "react";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FaFileInvoice,
  FaUsers,
  FaChartPie,
  FaWallet,
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaChartBar,
  FaList,
  FaBox,
  FaGear,
  FaArrowRight,
} from "react-icons/fa6";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import AtRiskCard from "@/components/dashboard/AtRiskCard";
import ClientModal from "@/components/modals/ClientModal";
import { TopClientsCard } from "@/components/reports/TopClientsCard";
import { RevenueForecastCard } from "@/components/reports/RevenueForecastCard";
import {
  useGetInvoicesQuery,
  useGetDashboardStatsQuery,
  useGetDashboardActivitiesQuery,
  useGetDashboardAlertsQuery,
  useGetSubscriptionQuery,
  useGetWorkspaceQuery,
} from "@/services/facturlyApi";
import { InvoiceLimitBanner } from "@/components/dashboard/InvoiceLimitBanner";
import { Skeleton } from "@/components/ui/skeleton";
import Breadcrumb from "@/components/ui/breadcrumb";
import { formatDistanceToNow } from "date-fns";
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { fr, enUS } from "date-fns/locale";
import { interpolateMessage } from "@/utils/interpolation";
import AISuggestionsPanel from '@/components/dashboard/AISuggestionsPanel';

export default function DashboardPage() {
  const router = useRouter();
  const [isClientModalOpen, setClientModalOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations('dashboard');
  const commonT = useTranslations('common');
  const dateLocale = locale === 'fr' ? fr : enUS;

  // Récupérer les données du dashboard depuis l'API
  const { data: dashboardStats, isLoading: isLoadingStats } =
    useGetDashboardStatsQuery();
  const { data: activitiesData, isLoading: isLoadingActivities } =
    useGetDashboardActivitiesQuery({ limit: 5 });
  const { data: alertsData, isLoading: isLoadingAlerts } =
    useGetDashboardAlertsQuery();
  const { data: subscription } = useGetSubscriptionQuery(); // Pour vérifier le plan
  const { data: workspace } = useGetWorkspaceQuery(); // Pour obtenir la devise du workspace comme fallback

  // Récupérer les factures pour le graphique (fallback si stats non disponibles)
  const { data: invoicesData, isLoading: isLoadingInvoices } =
    useGetInvoicesQuery({
      page: 1,
      limit: 100,
    });

  const invoices = invoicesData?.data || [];

  // Transformer les données de revenus mensuels depuis l'API (4 derniers mois)
  const monthlyRevenue = useMemo(() => {
    if (
      dashboardStats?.monthlyRevenues &&
      dashboardStats.monthlyRevenues.length > 0
    ) {
      // Prendre les 4 derniers mois seulement
      const last4Months = dashboardStats.monthlyRevenues.slice(-4);
      return last4Months.map((item) => {
        const date = new Date(item.year, item.month - 1, 1);
        const monthName = date.toLocaleDateString(locale === 'fr' ? "fr-FR" : "en-US", { month: "short" });
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
      const monthName = monthDate.toLocaleDateString(locale === 'fr' ? "fr-FR" : "en-US", {
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
        locale: dateLocale,
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

      // Extraire le numéro de facture depuis le titre si disponible
      const invoiceNumberMatch = activity.title.match(/#?([A-Z0-9-]+)/);
      const invoiceNumber = invoiceNumberMatch ? invoiceNumberMatch[1] : undefined;
      
      // Préparer les données pour l'interpolation
      // Utiliser clientName depuis l'activité si disponible, sinon essayer de l'extraire depuis description
      const clientName = activity.clientName || 
        (activity.description ? activity.description.replace(/^Client:\s*/i, '').replace(/\{\{clientName\}\}/g, '').trim() : '') ||
        '';
      
      const activityData: Record<string, unknown> = {
        invoiceNumber,
        clientName,
        amount: activity.amount,
        currency: activity.currency,
      };

      // Interpoler les messages seulement s'ils contiennent des variables
      const title = activity.title.includes('{{') || activity.title.includes('{') 
        ? interpolateMessage(activity.title, activityData, locale)
        : activity.title;
      
      const description = activity.description && (activity.description.includes('{{') || activity.description.includes('{'))
        ? interpolateMessage(activity.description, activityData, locale)
        : activity.description || '';

      return {
        id: activity.entityId,
        title,
        description,
        time: timeAgo,
        status,
      };
    });
  }, [activitiesData, dateLocale, locale]);

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
        value: `${overdueCount} ${overdueCount > 1 ? t('invoices') : t('invoice')}`,
        label: t('overdueMoreThan7Days'),
        helper: `${t('totalPaidLabel')} ${new Intl.NumberFormat(locale === 'fr' ? "fr-FR" : "en-US", {
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
        label: t('clientToRemind'),
        helper: `${firstClient.unpaidCount} ${firstClient.unpaidCount > 1 ? t('invoices') : t('invoice')} ${firstClient.unpaidCount > 1 ? t('unpaidInvoices') : t('unpaidInvoice')}`,
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
            label: t('unpaidRate'),
            helper: t('unpaidRateGoal'),
          });
        }
      }
    }

    return items;
  }, [alertsData, dashboardStats]);

  // Statistiques pour les cartes
  const stats = useMemo(() => {
    if (dashboardStats) {
      // Trouver le revenu du mois en cours selon period.month et period.year
      let monthlyRev = 0;
      
      if (dashboardStats.period && dashboardStats.monthlyRevenues) {
        // Chercher le revenu correspondant au mois et à l'année dans period
        const currentMonthRevenue = dashboardStats.monthlyRevenues.find(
          (item) => item.month === dashboardStats.period.month && item.year === dashboardStats.period.year
        );
        
        if (currentMonthRevenue) {
          monthlyRev = parseFloat(currentMonthRevenue.revenue || "0");
        }
      }
      
      // Fallback: utiliser monthlyRevenue[0] si monthlyRevenues n'est pas disponible
      if (monthlyRev === 0 && dashboardStats.monthlyRevenue?.[0]) {
        monthlyRev = parseFloat(dashboardStats.monthlyRevenue[0].amount || "0");
      }

      // Utiliser invoicesByStatus pour obtenir le nombre total de factures envoyées
      // Plus précis que invoicesSent qui peut être limité au mois en cours
      const sentStatusCount = dashboardStats.invoicesByStatus?.find(
        (status) => status.status === "sent"
      );
      const totalSentCount = sentStatusCount?.count || 0;

      return {
        monthlyRevenue: monthlyRev,
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
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-primary">{t('title')}</h1>
          <p className="mt-1 text-sm text-foreground/70">{t('subtitle')}</p>
        </div>
      </div>

      {/* Banner pour les utilisateurs du plan gratuit */}
      <InvoiceLimitBanner
        invoiceLimit={
          dashboardStats?.invoiceLimit || subscription?.invoiceLimit
        }
        planCode={subscription?.plan || "free"}
      />

      {/* KPIs Principaux */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('monthlyRevenue')}
          value={
            isLoading
              ? "--"
              : new Intl.NumberFormat(locale === 'fr' ? "fr-FR" : "en-US", {
                  style: "currency",
                  currency:
                    dashboardStats?.currency || 
                    dashboardStats?.monthlyRevenue?.[0]?.currency || 
                    workspace?.defaultCurrency || 
                    "EUR",
                  minimumFractionDigits: 0,
                }).format(stats.monthlyRevenue)
          }
          helper={isLoading ? commonT('loading') : undefined}
          icon={<FaWallet className="h-5 w-5" />}
        />
        <StatCard
          title={t('invoicesSent')}
          value={isLoading ? "--" : stats.invoicesSent.toString()}
          helper={isLoading ? commonT('loading') : undefined}
          icon={<FaChartPie className="h-5 w-5" />}
        />
        <StatCard
          title={t('totalPaid')}
          value={
            isLoading
              ? "--"
              : new Intl.NumberFormat(locale === 'fr' ? "fr-FR" : "en-US", {
                  style: "currency",
                  currency:
                    dashboardStats?.currency || 
                    dashboardStats?.monthlyRevenue?.[0]?.currency || 
                    workspace?.defaultCurrency || 
                    "EUR",
                  minimumFractionDigits: 0,
                }).format(stats.totalPaid)
          }
          helper={isLoading ? commonT('loading') : undefined}
          icon={<FaArrowTrendUp className="h-5 w-5" />}
        />
        <StatCard
          title={t('unpaid')}
          value={
            isLoading
              ? "--"
              : new Intl.NumberFormat(locale === 'fr' ? "fr-FR" : "en-US", {
                  style: "currency",
                  currency:
                    dashboardStats?.currency || 
                    dashboardStats?.monthlyRevenue?.[0]?.currency || 
                    workspace?.defaultCurrency || 
                    "EUR",
                  minimumFractionDigits: 0,
                }).format(stats.totalUnpaid)
          }
          helper={isLoading ? commonT('loading') : undefined}
          icon={<FaArrowTrendDown className="h-5 w-5" />}
          variant="danger"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-[1.8fr_1fr] xl:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                    <FaChartBar className="h-4 w-4 text-primary" />
                    {t('revenueTrends')}
                  </CardTitle>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    {t('revenueTrendsDescription')}
                  </p>
                </div>
              </div>
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
                  <FaChartBar className="h-12 w-12 text-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-foreground/70 mb-1">
                    {t('noDataAvailable')}
                  </p>
                  <p className="text-xs text-foreground/50">
                    {t('noDataDescription')}
                  </p>
                </div>
              ) : (
                <>
                  <RevenueChart data={monthlyRevenue} />
                  <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-1.5">{t('totalPaidLabel')}</p>
                      <p className="text-xl font-bold text-emerald-600">
                        {new Intl.NumberFormat(locale === 'fr' ? "fr-FR" : "en-US", {
                          style: "currency",
                          currency:
                            dashboardStats?.currency || 
                            dashboardStats?.monthlyRevenue?.[0]?.currency || 
                            workspace?.defaultCurrency || 
                            "EUR",
                          minimumFractionDigits: 0,
                        }).format(stats.totalPaid)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-slate-600 mb-1">{t('pendingLabel')}</p>
                      <p className="text-base font-bold text-amber-600">
                        {new Intl.NumberFormat(locale === 'fr' ? "fr-FR" : "en-US", {
                          style: "currency",
                          currency:
                            dashboardStats?.currency || 
                            dashboardStats?.monthlyRevenue?.[0]?.currency || 
                            workspace?.defaultCurrency || 
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
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-900">{t('recentActivity')}</CardTitle>
                <p className="text-xs text-slate-600 mt-1">
                  {t('activityDescription')}
                </p>
              </div>
              <a
                href="/invoices"
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {t('seeMore')} →
              </a>
            </div>
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
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 py-8 text-center">
                <p className="text-xs text-slate-600">
                  {t('noRecentActivity')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        {isLoadingAlerts ? (
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <AtRiskCard
            title={t('toWatch')}
            description={t('toWatchDescription')}
            items={
              atRiskItems.length > 0
                ? atRiskItems
                : [
                    {
                      id: "none",
                      value: t('noAlert'),
                      label: t('allGood'),
                    },
                  ]
            }
            seeMoreLink="/invoices?status=overdue"
            seeMoreLabel={t('seeMore') || "Voir plus"}
          />
        )}
      </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Rapports - Top Clients */}
          <TopClientsCard limit={5} />
          
          {/* Rapports - Prévisions */}
          <RevenueForecastCard />

          {/* AI Suggestions */}
          {(() => {
            const suggestions = [];
            if (dashboardStats && stats.totalUnpaid > 0) {
              const unpaidRate = Math.round((stats.totalUnpaid / (stats.totalPaid + stats.totalUnpaid)) * 100);
              suggestions.push({
                id: "1",
                category: t('recentActivity'),
                message: locale === 'fr' 
                  ? `${unpaidRate}% de vos factures sont impayées. Envisagez d'envoyer des rappels.`
                  : `${unpaidRate}% of your invoices are unpaid. Consider sending reminders.`,
                actionLabel: locale === 'fr' ? "Voir les factures" : "View invoices",
                actionLink: "/invoices",
              });
            }
            if (alertsData?.overdueInvoices && alertsData.overdueInvoices.length > 0) {
              suggestions.push({
                id: "2",
                category: t('toWatch'),
                message: locale === 'fr'
                  ? `${alertsData.overdueInvoices.length} facture${alertsData.overdueInvoices.length > 1 ? 's' : ''} en retard nécessitent votre attention.`
                  : `${alertsData.overdueInvoices.length} overdue invoice${alertsData.overdueInvoices.length > 1 ? 's' : ''} require your attention.`,
                actionLabel: locale === 'fr' ? "Voir les alertes" : "View alerts",
                actionLink: "/invoices?status=overdue",
              });
            }
            return suggestions.length > 0 ? (
              <AISuggestionsPanel
                title={t('aiSuggestions')}
                suggestions={suggestions}
              />
            ) : null;
          })()}

          {/* Statistiques rapides */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-900">
                {t('quickSummary')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex items-center justify-between border-b border-primary/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <FaChartPie className="h-3.5 w-3.5 text-foreground/40" />
                  <span className="text-xs text-foreground/60">
                    {t('invoicesThisMonth')}
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {isLoading ? "--" : stats.invoicesSent}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-primary/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <FaArrowTrendUp className="h-3.5 w-3.5 text-foreground/40" />
                  <span className="text-xs text-foreground/60">
                    {t('paymentRate')}
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
                  <FaWallet className="h-3.5 w-3.5 text-foreground/40" />
                  <span className="text-xs text-foreground/60">
                    {t('averageRevenue')}
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {isLoading || stats.invoicesSent === 0
                    ? "--"
                    : new Intl.NumberFormat(locale === 'fr' ? "fr-FR" : "en-US", {
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
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <FaList className="h-4 w-4 text-slate-600" />
                {t('quickNavigation')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <button
                onClick={() => router.push("/invoices")}
                className="group w-full flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm text-left"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <FaFileInvoice className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {t('allInvoices')}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {t('viewAndManage')}
                  </p>
                </div>
                <FaArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-primary shrink-0" />
              </button>
              <button
                onClick={() => router.push("/clients")}
                className="group w-full flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm text-left"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <FaUsers className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {t('myClients')}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {t('manageAddressBook')}
                  </p>
                </div>
                <FaArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-primary shrink-0" />
              </button>
              <button
                onClick={() => router.push("/items")}
                className="group w-full flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm text-left"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <FaBox className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {t('products')}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {t('catalogAndPricing')}
                  </p>
                </div>
                <FaArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-primary shrink-0" />
              </button>
              <button
                onClick={() => router.push("/settings")}
                className="group w-full flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm text-left"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <FaGear className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {t('settings')}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {t('configuration')}
                  </p>
                </div>
                <FaArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-primary shrink-0" />
              </button>
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
