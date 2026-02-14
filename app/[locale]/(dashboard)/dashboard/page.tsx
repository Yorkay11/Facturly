"use client";

import { useRouter, Link } from '@/i18n/routing';
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
import RevenueChart from "@/components/dashboard/RevenueChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import AtRiskCard from "@/components/dashboard/AtRiskCard";
import ClientModal from "@/components/modals/ClientModal";
import ProductModal from "@/components/modals/ProductModal";
import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState";
import { FacturlyIntroTutorial } from "@/components/dashboard/FacturlyIntroTutorial";
import { TopClientsCard } from "@/components/reports/TopClientsCard";
import { RevenueForecastCard } from "@/components/reports/RevenueForecastCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import AISuggestionsPanel from '@/components/dashboard/AISuggestionsPanel';
import { useDashboardData } from '@/hooks/useDashboardData';

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isClientModalOpen, setClientModalOpen] = useState(false);
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations('dashboard');
  const commonT = useTranslations('common');
  const invoicesT = useTranslations('invoices');
  const clientsT = useTranslations('clients');
  const itemsT = useTranslations('items');

  // Ouvrir le tutoriel après création du workspace (redirection avec ?showIntro=1)
  useEffect(() => {
    if (searchParams?.get("showIntro") === "1") {
      setIntroOpen(true);
    }
  }, [searchParams]);

  const {
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
  } = useDashboardData();

  // Helper pour le formatage des devises
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'fr' ? "fr-FR" : "en-US", {
      style: "currency",
      currency: dashboardStats?.currency || workspace?.defaultCurrency || "EUR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 pb-8">
      <FacturlyIntroTutorial open={introOpen} setOpen={setIntroOpen} />
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-primary">{t('title')}</h1>
          <p className="mt-1 text-sm text-foreground/70">{t('subtitle')}</p>
        </div>
      </div>

      {/* État de chargement */}
      {isLoading ? (
        <>
          {/* Skeleton pour les KPIs */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-border shadow-sm">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Skeleton pour le graphique et les cartes */}
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-[1.8fr_1fr] xl:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              {/* Skeleton graphique */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-48 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
              
              {/* Skeleton activités et alertes */}
              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                <Card className="border-border shadow-sm">
                  <CardHeader className="pb-4">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-48 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border shadow-sm">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Skeleton sidebar */}
            <div className="space-y-3">
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : stats.invoicesSent === 0 ? (
        <DashboardEmptyState
          onCreateInvoice={() => router.push("/invoices/new")}
          onAddClient={() => setClientModalOpen(true)}
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={t('monthlyRevenue')}
              value={formatCurrency(stats.monthlyRevenue)}
              icon={<FaWallet className="h-5 w-5" />}
            />
            <StatCard
              title={t('invoicesSent')}
              value={stats.invoicesSent.toString()}
              icon={<FaChartPie className="h-5 w-5" />}
            />
            <StatCard
              title={t('totalPaid')}
              value={formatCurrency(stats.totalPaid)}
              icon={<FaArrowTrendUp className="h-5 w-5" />}
            />
            <StatCard
              title={t('unpaid')}
              value={formatCurrency(stats.totalUnpaid)}
              icon={<FaArrowTrendDown className="h-5 w-5" />}
              variant="danger"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-[1.8fr_1fr] xl:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <FaChartBar className="h-4 w-4 text-primary" />
                        {t('revenueTrends')}
                      </CardTitle>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {t('revenueTrendsDescription')}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {dashboardStats?.chartData && dashboardStats.chartData.length === 0 && dashboardStats?.monthlyRevenues && dashboardStats.monthlyRevenues.length === 0 ? (
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
                      <RevenueChart
                        data={monthlyRevenue}
                        range={chartRange}
                        onRangeChange={setChartRange}
                      />
                      <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-border bg-gradient-to-br from-muted/50 to-card p-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1.5">{t('totalPaidLabel')}</p>
                          <p className="text-xl font-bold text-emerald-600">
                            {formatCurrency(stats.totalPaid)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-medium text-muted-foreground mb-1">{t('pendingLabel')}</p>
                          <p className="text-base font-bold text-amber-600">
                            {formatCurrency(stats.totalUnpaid)}
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
                      <Link
                        href="/invoices"
                        className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        {t('seeMore')} →
                      </Link>
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
                      <div className="rounded-md border border-dashed border-border bg-muted/50 py-8 text-center">
                        <p className="text-xs text-muted-foreground">
                          {t('noRecentActivity')}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                {isLoadingAlerts ? (
                  <Card className="border-border shadow-sm">
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
                      {stats.invoicesSent}
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
                      {stats.totalPaid + stats.totalUnpaid === 0
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
                        : formatCurrency(stats.monthlyRevenue / stats.invoicesSent)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Actions rapides */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <FaList className="h-4 w-4 text-muted-foreground" />
                    {t('quickActions') || t('quickNavigation')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <button
                    onClick={() => router.push("/invoices/new")}
                    className="group w-full flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm text-left"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      <FaFileInvoice className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {invoicesT('new.label')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t('createInvoiceDescription') || "Créer une nouvelle facture"}
                      </p>
                    </div>
                    <FaArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary shrink-0" />
                  </button>
                  <button
                    onClick={() => setClientModalOpen(true)}
                    className="group w-full flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm text-left"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <FaUsers className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {clientsT('buttons.new') || "Nouveau client"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t('addClientDescription') || "Ajouter un client au carnet"}
                      </p>
                    </div>
                    <FaArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary shrink-0" />
                  </button>
                  <button
                    onClick={() => setProductModalOpen(true)}
                    className="group w-full flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm text-left"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                      <FaBox className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {itemsT('buttons.new')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t('addProductDescription') || "Ajouter un produit au catalogue"}
                      </p>
                    </div>
                    <FaArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary shrink-0" />
                  </button>
                  <button
                    onClick={() => router.push("/settings")}
                    className="group w-full flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm text-left"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <FaGear className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {t('settings')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t('configuration')}
                      </p>
                    </div>
                    <FaArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary shrink-0" />
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
      
      <ClientModal
        open={isClientModalOpen}
        onClose={() => setClientModalOpen(false)}
      />
      
      <ProductModal
        open={isProductModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSuccess={() => {
          setProductModalOpen(false);
        }}
      />
    </div>
  );
}
