import { useState, useMemo } from "react";
import { useLocale, useTranslations } from 'next-intl';
import { formatDistanceToNow } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { interpolateMessage } from "@/utils/interpolation";
import {
  useGetInvoicesQuery,
  useGetDashboardStatsQuery,
  useGetDashboardActivitiesQuery,
  useGetDashboardAlertsQuery,
  useGetWorkspaceQuery,
} from "@/services/facturlyApi";

export type ChartRange = '1d' | '1w' | '1m' | '1y' | 'all';

export function useDashboardData() {
  const locale = useLocale();
  const t = useTranslations('dashboard');
  const dateLocale = locale === 'fr' ? fr : enUS;

  const [chartRange, setChartRange] = useState<ChartRange>('1m');

  // Récupérer les données du dashboard depuis l'API
  const { data: dashboardStats, isLoading: isLoadingStats } =
    useGetDashboardStatsQuery({ range: chartRange });
  const { data: activitiesData, isLoading: isLoadingActivities } =
    useGetDashboardActivitiesQuery({ limit: 5 });
  const { data: alertsData, isLoading: isLoadingAlerts } =
    useGetDashboardAlertsQuery();
  const { data: workspace } = useGetWorkspaceQuery();

  // Récupérer les factures pour le graphique (fallback si stats non disponibles)
  const { data: invoicesData, isLoading: isLoadingInvoices } =
    useGetInvoicesQuery({
      page: 1,
      limit: 100,
    });

  const invoices = invoicesData?.data || [];

  // Données du graphique (chartData ou monthlyRevenues selon l'API)
  const monthlyRevenue = useMemo(() => {
    if (dashboardStats?.chartData && dashboardStats.chartData.length > 0) {
      return dashboardStats.chartData.map((item) => ({
        label: item.label,
        value: parseFloat(item.revenue || "0"),
      }));
    }
    if (
      dashboardStats?.monthlyRevenues &&
      dashboardStats.monthlyRevenues.length > 0
    ) {
      const last = dashboardStats.monthlyRevenues.slice(-6);
      return last.map((item) => {
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
  }, [dashboardStats, invoices, locale]);

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
  }, [alertsData, dashboardStats, locale, t]);

  // Statistiques pour les cartes
  const stats = useMemo(() => {
    if (dashboardStats) {
      let monthlyRev = 0;
      const mr = dashboardStats.monthlyRevenue;
      if (typeof mr === "string") {
        monthlyRev = parseFloat(mr || "0");
      } else if (Array.isArray(mr) && mr[0]) {
        monthlyRev = parseFloat((mr[0] as { amount?: string }).amount || "0");
      } else if (dashboardStats.period && dashboardStats.monthlyRevenues?.length) {
        const cur = dashboardStats.monthlyRevenues.find(
          (item) => item.month === dashboardStats.period!.month && item.year === dashboardStats.period!.year
        );
        if (cur) monthlyRev = parseFloat(cur.revenue || "0");
      }

      return {
        monthlyRevenue: monthlyRev,
        invoicesSent: dashboardStats.invoicesSent ?? 0,
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

  return {
    chartRange,
    setChartRange,
    dashboardStats,
    activities,
    atRiskItems,
    stats,
    isLoading,
    isLoadingActivities,
    isLoadingAlerts,
    workspace,
    alertsData,
    monthlyRevenue,
  };
}
