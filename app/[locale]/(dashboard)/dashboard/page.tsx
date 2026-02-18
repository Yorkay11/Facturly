"use client";

import { useRouter, Link } from '@/i18n/routing';
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import StatCard from "@/components/dashboard/StatCard";
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
import { CreateProductModal } from "@/components/modals/ProductModal";
import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState";
import { FacturlyIntroTutorial } from "@/components/dashboard/FacturlyIntroTutorial";
import { TopClientsCard } from "@/components/reports/TopClientsCard";
import { RevenueForecastCard } from "@/components/reports/RevenueForecastCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import AISuggestionsPanel from '@/components/dashboard/AISuggestionsPanel';
import { useDashboardData } from '@/hooks/useDashboardData';
import { PushNotificationsCard } from '@/components/notifications/PushNotificationsCard';
import { useCreateProductMutation } from '@/services/facturlyApi';
import { toast } from 'sonner';

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
  const [createProduct] = useCreateProductMutation();

  // Helper pour le formatage des devises
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'fr' ? "fr-FR" : "en-US", {
      style: "currency",
      currency: dashboardStats?.currency || workspace?.defaultCurrency || "EUR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="w-full px-4 py-8 pb-10 sm:px-6 sm:py-10">
        <FacturlyIntroTutorial open={introOpen} setOpen={setIntroOpen} />

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            {t('subtitle')}
          </p>
        </header>

        <PushNotificationsCard variant="compact" />

        {isLoading ? (
          <>
            <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm backdrop-blur-sm">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-2 h-8 w-32" />
                </div>
              ))}
            </section>
            <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr] xl:grid-cols-[2fr_1fr]">
              <div className="space-y-6">
                <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm backdrop-blur-sm">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-2 h-4 w-48" />
                  <Skeleton className="mt-6 h-64 w-full rounded-xl" />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm backdrop-blur-sm">
                    <Skeleton className="h-4 w-32" />
                    <div className="mt-4 space-y-3">
                      <Skeleton className="h-16 w-full rounded-xl" />
                      <Skeleton className="h-16 w-full rounded-xl" />
                      <Skeleton className="h-16 w-full rounded-xl" />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm backdrop-blur-sm">
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="mt-3 h-16 w-full rounded-xl" />
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm backdrop-blur-sm">
                  <Skeleton className="h-4 w-28" />
                  <div className="mt-4 space-y-3">
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </div>
                </div>
                <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm backdrop-blur-sm">
                  <Skeleton className="h-32 w-full rounded-xl" />
                </div>
              </div>
            </div>
          </>
        ) : (stats.totalEmittedInvoices ?? stats.activeInvoices ?? 0) === 0 ? (
        <DashboardEmptyState
          onCreateInvoice={() => router.push("/invoices/new")}
          onAddClient={() => setClientModalOpen(true)}
        />
        ) : (
          <>
            {/* KPI Stats */}
            <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title={t('monthlyRevenue')}
                value={formatCurrency(stats.monthlyRevenue)}
                icon={<FaWallet className="h-5 w-5" />}
              />
              <StatCard
                title={t('invoicesSent')}
                value={(stats.totalEmittedInvoices ?? stats.invoicesSent ?? 0).toString()}
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
            </section>

            <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr] xl:grid-cols-[2fr_1fr]">
              <div className="space-y-6">
                {/* Graphique revenus */}
                <section className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm backdrop-blur-sm sm:p-8">
                  <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    {t('revenueTrends')}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{t('revenueTrendsDescription')}</p>
                  <div className="mt-6">
                    {dashboardStats?.chartData && dashboardStats.chartData.length === 0 && dashboardStats?.monthlyRevenues && dashboardStats.monthlyRevenues.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FaChartBar className="h-12 w-12 text-muted-foreground/40 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">{t('noDataAvailable')}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{t('noDataDescription')}</p>
                      </div>
                    ) : (
                      <>
                        <RevenueChart
                          data={monthlyRevenue}
                          range={chartRange}
                          onRangeChange={setChartRange}
                        />
                        <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-border/50 bg-muted/30 p-4">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">{t('totalPaidLabel')}</p>
                            <p className="text-xl font-semibold text-foreground tabular-nums">{formatCurrency(stats.totalPaid)}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">{t('pendingLabel')}</p>
                            <p className="text-xl font-semibold text-foreground tabular-nums">{formatCurrency(stats.totalUnpaid)}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </section>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Activité récente */}
                  <section className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm backdrop-blur-sm sm:p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">{t('recentActivity')}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{t('activityDescription')}</p>
                      </div>
                      <Link href="/invoices" className="text-xs font-medium text-primary hover:underline">
                        {t('seeMore')} →
                      </Link>
                    </div>
                    <div className="mt-6">
                      {isLoadingActivities ? (
                        <div className="space-y-3">
                          <Skeleton className="h-20 w-full rounded-xl" />
                          <Skeleton className="h-20 w-full rounded-xl" />
                          <Skeleton className="h-20 w-full rounded-xl" />
                        </div>
                      ) : activities.length > 0 ? (
                        <RecentActivity items={activities.slice(0, 3)} />
                      ) : (
                        <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 py-8 text-center">
                          <p className="text-sm text-muted-foreground">{t('noRecentActivity')}</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* À surveiller */}
                  {isLoadingAlerts ? (
                    <section className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm backdrop-blur-sm">
                      <Skeleton className="h-4 w-28" />
                      <div className="mt-4 space-y-3">
                        <Skeleton className="h-16 w-full rounded-xl" />
                        <Skeleton className="h-16 w-full rounded-xl" />
                      </div>
                    </section>
                  ) : (
                    <AtRiskCard
                      title={t('toWatch')}
                      description={t('toWatchDescription')}
                      items={
                        atRiskItems.length > 0
                          ? atRiskItems
                          : [{ id: "none", value: t('noAlert'), label: t('allGood') }]
                      }
                      seeMoreLink="/invoices?status=overdue"
                      seeMoreLabel={t('seeMore') || "Voir plus"}
                      className="rounded-2xl border-border/50 bg-card/50 p-6 shadow-sm backdrop-blur-sm sm:p-8"
                    />
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <TopClientsCard limit={5} />
                <RevenueForecastCard />
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
                    <AISuggestionsPanel title={t('aiSuggestions')} suggestions={suggestions} />
                  ) : null;
                })()}

                {/* Résumé rapide */}
                <section className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm backdrop-blur-sm">
                  <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">{t('quickSummary')}</p>
                  <div className="mt-6 divide-y divide-border/50 space-y-4">
                    <div className="flex items-center justify-between pb-4">
                      <div className="flex items-center gap-2">
                        <FaChartPie className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{t('invoicesThisMonth')}</span>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-foreground">{stats.invoicesSent}</span>
                    </div>
                    <div className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-2">
                        <FaArrowTrendUp className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{t('paymentRate')}</span>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-primary">
                        {stats.totalPaid + stats.totalUnpaid === 0 ? "—" : `${Math.round((stats.totalPaid / (stats.totalPaid + stats.totalUnpaid)) * 100)}%`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center gap-2">
                        <FaWallet className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{t('averageRevenue')}</span>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-foreground">
                        {isLoading || (stats.totalEmittedInvoices ?? stats.invoicesSent ?? 0) === 0 ? "—" : formatCurrency(stats.monthlyRevenue / (stats.totalEmittedInvoices ?? stats.invoicesSent ?? 1))}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Actions rapides - liste type iOS */}
                <section className="rounded-2xl border border-border/50 bg-card/50 shadow-sm backdrop-blur-sm overflow-hidden">
                  <div className="border-b border-border/50 px-5 py-4 sm:px-6">
                    <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                      {t('quickActions') || t('quickNavigation')}
                    </p>
                  </div>
                  <div className="divide-y divide-border/50">
                    <button
                      onClick={() => router.push("/invoices/new")}
                      className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30 active:bg-muted/50 sm:px-6"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <FaFileInvoice className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{invoicesT('new.label')}</p>
                        <p className="text-xs text-muted-foreground">{t('createInvoiceDescription') || "Créer une nouvelle facture"}</p>
                      </div>
                      <FaArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </button>
                    <button
                      onClick={() => setClientModalOpen(true)}
                      className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30 active:bg-muted/50 sm:px-6"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <FaUsers className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{clientsT('buttons.new') || "Nouveau client"}</p>
                        <p className="text-xs text-muted-foreground">{t('addClientDescription') || "Ajouter un client au carnet"}</p>
                      </div>
                      <FaArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </button>
                    <button
                      onClick={() => setProductModalOpen(true)}
                      className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30 active:bg-muted/50 sm:px-6"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <FaBox className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{itemsT('buttons.new')}</p>
                        <p className="text-xs text-muted-foreground">{t('addProductDescription') || "Ajouter un produit au catalogue"}</p>
                      </div>
                      <FaArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </button>
                    <button
                      onClick={() => router.push("/settings")}
                      className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30 active:bg-muted/50 sm:px-6"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                        <FaGear className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{t('settings')}</p>
                        <p className="text-xs text-muted-foreground">{t('configuration')}</p>
                      </div>
                      <FaArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </>
        )}
      </div>

      <ClientModal
        open={isClientModalOpen}
        onClose={() => setClientModalOpen(false)}
      />
      <CreateProductModal
        open={isProductModalOpen}
        setOpen={setProductModalOpen}
        workspaceCurrency={workspace?.defaultCurrency ?? 'EUR'}
        onSubmitProduct={async (data) => {
          await createProduct({
            name: data.name,
            description: data.description || undefined,
            type: 'service',
            price: data.price,
          }).unwrap();
          toast.success(itemsT('success.createSuccess'), {
            description: itemsT('success.createSuccessDescription'),
          });
        }}
      />
    </div>
  );
}
