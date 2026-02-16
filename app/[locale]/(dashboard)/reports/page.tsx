"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DirectionAwareTabs } from "@/components/ui/direction-aware-tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Breadcrumb from "@/components/ui/breadcrumb";
import {
  useGetRevenueByClientQuery,
  useGetRevenueByMonthQuery,
  useGetRevenueByProductQuery,
  useGetTopClientsQuery,
  useGetRevenueEvolutionQuery,
  useGetRevenueForecastQuery,
  useGetWorkspaceQuery,
} from "@/services/facturlyApi";
import { FaFileExcel, FaFilePdf, FaDownload, FaChartLine, FaUsers, FaBox, FaTrophy, FaChartArea, FaCalendar } from "react-icons/fa6";
import { motion } from "framer-motion";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { toast } from "sonner";
import {
  useLazyExportReportsExcelQuery,
  useLazyExportReportsPDFQuery,
} from "@/services/facturlyApi";
// Lazy load Recharts pour réduire le bundle initial (~200KB économisés)
import {
  LazyBarChart as BarChart,
  LazyBar as Bar,
  LazyXAxis as XAxis,
  LazyYAxis as YAxis,
  LazyCartesianGrid as CartesianGrid,
  LazyTooltip as Tooltip,
  LazyResponsiveContainer as ResponsiveContainer,
  LazyPieChart as PieChart,
  LazyPie as Pie,
  LazyCell as Cell,
  LazyLineChart as LineChart,
  LazyLine as Line,
  LazyArea as Area,
  LazyAreaChart as AreaChart,
} from "@/components/reports/LazyCharts";

const CHART_PRIMARY = "hsl(var(--primary))";
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];
const CHART_GRID_STROKE = "hsl(var(--border))";
const CHART_TICK_FILL = "hsl(var(--muted-foreground))";
const CHART_TOOLTIP_BG = "hsl(var(--card))";
const CHART_TOOLTIP_BORDER = "hsl(var(--border))";
const CHART_TOOLTIP_LABEL = "hsl(var(--foreground))";

export default function ReportsPage() {
  const t = useTranslations('reports');
  const commonT = useTranslations('common');
  const locale = useLocale();
  const { data: workspace } = useGetWorkspaceQuery();
  const currency = workspace?.defaultCurrency || 'XOF';

  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    new Date().getFullYear()
  );
  const [monthsRange, setMonthsRange] = useState<number>(12);

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat(locale === 'fr' ? "fr-FR" : "en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  // Queries
  const { data: revenueByClient, isLoading: loadingClients } = useGetRevenueByClientQuery({
    month: selectedMonth,
    year: selectedYear,
  });

  const { data: revenueByMonth, isLoading: loadingMonths } = useGetRevenueByMonthQuery({
    months: monthsRange,
  });

  const { data: revenueByProduct, isLoading: loadingProducts } = useGetRevenueByProductQuery({
    month: selectedMonth,
    year: selectedYear,
  });

  const { data: topClients, isLoading: loadingTopClients } = useGetTopClientsQuery({ limit: 10 });

  const { data: revenueEvolution, isLoading: loadingEvolution } = useGetRevenueEvolutionQuery({
    months: monthsRange,
  });

  const { data: revenueForecast, isLoading: loadingForecast } = useGetRevenueForecastQuery({
    months: 3,
  });

  // Prepare chart data
  const revenueByMonthChartData = revenueByMonth?.map((item) => ({
    label: new Date(item.year, item.month - 1, 1).toLocaleDateString(
      locale === 'fr' ? "fr-FR" : "en-US",
      { month: 'short', year: 'numeric' }
    ),
    value: parseFloat(item.revenue),
  })) || [];

  const revenueByClientChartData = revenueByClient?.slice(0, 10).map((item) => ({
    name: item.clientName,
    revenue: parseFloat(item.totalRevenue),
  })) || [];

  const revenueByProductChartData = revenueByProduct?.slice(0, 10).map((item) => ({
    name: item.productName || item.description,
    revenue: parseFloat(item.totalRevenue),
  })) || [];

  const evolutionChartData = revenueEvolution?.data.map((item) => ({
    label: new Date(item.year, item.month - 1, 1).toLocaleDateString(
      locale === 'fr' ? "fr-FR" : "en-US",
      { month: 'short', year: 'numeric' }
    ),
    revenue: parseFloat(item.revenue),
    growth: item.growthRate ? parseFloat(item.growthRate) : 0,
  })) || [];

  const [exportExcel, { isLoading: isExportingExcel }] = useLazyExportReportsExcelQuery();
  const [exportPDF, { isLoading: isExportingPDF }] = useLazyExportReportsPDFQuery();
  
  // État pour le tab actif
  const [activeTab, setActiveTab] = useState(0);

  const handleExportExcel = async () => {
    try {
      const result = await exportExcel({
        month: selectedMonth,
        year: selectedYear,
        months: monthsRange,
      }).unwrap();

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(result);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapports-facturly-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(t('export.excel'), {
        description: t('export.success'),
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error(t('export.error'), {
        description: t('export.errorDescription'),
      });
    }
  };

  const handleExportPDF = async () => {
    try {
      const result = await exportPDF({
        month: selectedMonth,
        year: selectedYear,
        months: monthsRange,
      }).unwrap();

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(result);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapports-facturly-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(t('export.pdf'), {
        description: t('export.success'),
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error(t('export.error'), {
        description: t('export.errorDescription'),
      });
    }
  };

  // Calculer les statistiques globales pour le header
  const totalRevenue = revenueEvolution?.totalRevenue || "0";
  const averageRevenue = revenueEvolution?.averageRevenue || "0";
  const totalClients = revenueByClient?.length || 0;
  const totalProducts = revenueByProduct?.length || 0;

  const statsCards = [
    {
      label: t('totalRevenue'),
      value: formatCurrency(totalRevenue),
      icon: FaChartLine,
      color: "from-violet-500/10 to-purple-500/10",
      iconColor: "text-violet-600",
      borderColor: "border-violet-500/20"
    },
    {
      label: t('averageRevenue'),
      value: formatCurrency(averageRevenue),
      icon: FaChartArea,
      color: "from-emerald-500/10 to-green-500/10",
      iconColor: "text-emerald-600",
      borderColor: "border-emerald-500/20"
    },
    {
      label: t('totalClients'),
      value: totalClients.toString(),
      icon: FaUsers,
      color: "from-blue-500/10 to-cyan-500/10",
      iconColor: "text-blue-600",
      borderColor: "border-blue-500/20"
    },
    {
      label: t('totalProducts'),
      value: totalProducts.toString(),
      icon: FaBox,
      color: "from-amber-500/10 to-orange-500/10",
      iconColor: "text-amber-600",
      borderColor: "border-amber-500/20"
    }
  ];

  // Tableau de tabs pour DirectionAwareTabs
  const reportTabs = useMemo(() => [
    {
      id: 0,
      label: (
        <span className="flex items-center gap-1.5">
          <FaChartLine className="h-3.5 w-3.5" />
          <span>{t('revenueEvolution')}</span>
        </span>
      ),
      content: (
        <div className="space-y-6">
          {loadingEvolution ? (
            <Skeleton className="h-96 w-full rounded-lg" />
          ) : revenueEvolution ? (
            <>
              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-border bg-card p-5">
                  <p className="text-sm text-muted-foreground mb-1.5">{t('totalRevenue')}</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {formatCurrency(revenueEvolution.totalRevenue)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card p-5">
                  <p className="text-sm text-muted-foreground mb-1.5">{t('averageRevenue')}</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {formatCurrency(revenueEvolution.averageRevenue)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card p-5">
                  <p className="text-sm text-muted-foreground mb-1.5">{t('growthTrend')}</p>
                  <p className={`text-xl font-semibold ${
                    revenueEvolution.growthTrend === 'increasing'
                      ? 'text-green-600'
                      : revenueEvolution.growthTrend === 'decreasing'
                      ? 'text-red-600'
                      : 'text-muted-foreground'
                  }`}>
                    {revenueEvolution.growthTrend === 'increasing'
                      ? t('growthTrendIncreasing')
                      : revenueEvolution.growthTrend === 'decreasing'
                      ? t('growthTrendDecreasing')
                      : t('growthTrendStable')}
                  </p>
                </div>
              </div>

              {/* Chart */}
              <Card className="border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-medium">{t('revenueEvolution')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={evolutionChartData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_PRIMARY} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={CHART_PRIMARY} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                      <XAxis 
                        dataKey="label" 
                        tick={{ fill: CHART_TICK_FILL, fontSize: 12 }} 
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: CHART_TICK_FILL, fontSize: 12 }}
                        tickFormatter={(value: number) => formatCurrency(value)}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: CHART_TOOLTIP_BG,
                          border: `1px solid ${CHART_TOOLTIP_BORDER}`,
                          borderRadius: "6px",
                          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                        }}
                        labelStyle={{ fontWeight: 500, color: CHART_TOOLTIP_LABEL, marginBottom: "4px" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke={CHART_PRIMARY}
                        strokeWidth={2}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">{t('noData')}</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 1,
      label: (
        <span className="flex items-center gap-1.5">
          <FaUsers className="h-3.5 w-3.5" />
          <span>{t('revenueByClient')}</span>
        </span>
      ),
      content: (
        <div className="space-y-6">
          {loadingClients ? (
            <Skeleton className="h-96 w-full rounded-lg" />
          ) : revenueByClient && revenueByClient.length > 0 ? (
            <>
              <Card className="border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-medium">{t('revenueByClient')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={revenueByClientChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: CHART_TICK_FILL, fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: CHART_TICK_FILL, fontSize: 12 }}
                        tickFormatter={(value: number) => formatCurrency(value)}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: CHART_TOOLTIP_BG,
                          border: `1px solid ${CHART_TOOLTIP_BORDER}`,
                          borderRadius: "6px",
                          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                        }}
                        labelStyle={{ fontWeight: 500, color: CHART_TOOLTIP_LABEL, marginBottom: "4px" }}
                      />
                      <Bar dataKey="revenue" fill={CHART_PRIMARY} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-medium">{t('details')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border">
                    {revenueByClient.map((client) => (
                      <div
                        key={client.clientId}
                        className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground mb-0.5">{client.clientName}</p>
                          <p className="text-sm text-muted-foreground">
                            {client.invoiceCount} {t('invoices')} • {t('averageRevenue')}:{' '}
                            {formatCurrency(client.averageInvoiceAmount)}
                          </p>
                        </div>
                        <p className="text-lg font-semibold text-foreground ml-6">
                          {formatCurrency(client.totalRevenue)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">{t('noData')}</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 2,
      label: (
        <span className="flex items-center gap-1.5">
          <FaBox className="h-3.5 w-3.5" />
          <span>{t('revenueByProduct')}</span>
        </span>
      ),
      content: (
        <div className="space-y-6">
          {loadingProducts ? (
            <Skeleton className="h-96 w-full rounded-lg" />
          ) : revenueByProduct && revenueByProduct.length > 0 ? (
            <>
              <Card className="border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-medium">{t('revenueByProduct')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={revenueByProductChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }: { name: string; percent: number }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={120}
                          fill={CHART_COLORS[0]}
                          dataKey="revenue"
                        >
                          {revenueByProductChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: CHART_TOOLTIP_BG,
                            border: `1px solid ${CHART_TOOLTIP_BORDER}`,
                            borderRadius: "6px",
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                          }}
                          labelStyle={{ fontWeight: 500, color: CHART_TOOLTIP_LABEL, marginBottom: "4px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-medium">{t('details')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border">
                    {revenueByProduct.map((product) => (
                      <div
                        key={product.productId || product.description}
                        className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground mb-0.5">
                            {product.productName || product.description}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t('quantity')}: {product.quantitySold} • {product.invoiceCount}{' '}
                            {t('invoices')}
                          </p>
                        </div>
                        <p className="text-lg font-semibold text-foreground ml-6">
                          {formatCurrency(product.totalRevenue)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">{t('noData')}</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 3,
      label: (
        <span className="flex items-center gap-1.5">
          <FaCalendar className="h-3.5 w-3.5" />
          <span>{t('revenueByMonth')}</span>
        </span>
      ),
      content: (
        <div className="space-y-6">
          {loadingMonths ? (
            <Skeleton className="h-96 w-full rounded-lg" />
          ) : revenueByMonthChartData.length > 0 ? (
            <Card className="border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-medium">{t('revenueByMonth')}</CardTitle>
              </CardHeader>
              <CardContent>
                <RevenueChart data={revenueByMonthChartData} />
              </CardContent>
            </Card>
          ) : (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">{t('noData')}</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 4,
      label: (
        <span className="flex items-center gap-1.5">
          <FaTrophy className="h-3.5 w-3.5" />
          <span>{t('topClients')}</span>
        </span>
      ),
      content: (
        <div className="space-y-6">
          {loadingTopClients ? (
            <Skeleton className="h-96 w-full rounded-lg" />
          ) : topClients && topClients.length > 0 ? (
            <Card className="border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-medium">{t('topClients')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border">
                  {topClients.map((client, index) => (
                    <div
                      key={client.clientId}
                      className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`
                          flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold
                          flex-shrink-0
                          ${index === 0 
                            ? 'bg-amber-100 text-amber-700' 
                            : index === 1
                            ? 'bg-muted text-muted-foreground'
                            : index === 2
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-muted text-muted-foreground'
                          }
                        `}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground mb-0.5 truncate">{client.clientName}</p>
                          <p className="text-sm text-muted-foreground">
                            {client.invoiceCount} {t('invoices')}
                            {client.lastInvoiceDate &&
                              ` • ${new Date(client.lastInvoiceDate).toLocaleDateString(
                                locale === 'fr' ? "fr-FR" : "en-US"
                              )}`}
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-semibold text-foreground ml-6">
                        {formatCurrency(client.totalRevenue)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">{t('noData')}</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 5,
      label: (
        <span className="flex items-center gap-1.5">
          <FaChartArea className="h-3.5 w-3.5" />
          <span>{t('revenueForecast')}</span>
        </span>
      ),
      content: (
        <div className="space-y-6">
          {loadingForecast ? (
            <Skeleton className="h-96 w-full rounded-lg" />
          ) : revenueForecast ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-border">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-2">{t('projectedAnnual')}</p>
                    <p className="text-2xl font-semibold text-foreground">
                      {formatCurrency(revenueForecast.projectedAnnualRevenue)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-2">{t('averageRevenue')}</p>
                    <p className="text-2xl font-semibold text-foreground">
                      {formatCurrency(revenueForecast.averageMonthlyRevenue)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-medium">{t('nextMonths')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border">
                    {revenueForecast.forecastMonths.map((month) => {
                      const monthName = new Date(month.year, month.month - 1, 1).toLocaleDateString(
                        locale === 'fr' ? "fr-FR" : "en-US",
                        { month: 'long', year: 'numeric' }
                      );
                      return (
                        <div
                          key={`${month.year}-${month.month}`}
                          className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-sm font-medium text-foreground">{monthName}</span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded font-medium ${
                                month.confidence === 'high'
                                  ? 'bg-green-50 text-green-700'
                                  : month.confidence === 'medium'
                                  ? 'bg-yellow-50 text-yellow-700'
                                  : 'bg-orange-50 text-orange-700'
                              }`}
                            >
                              {t(`confidence${month.confidence.charAt(0).toUpperCase() + month.confidence.slice(1)}`)}
                            </span>
                          </div>
                          <p className="text-lg font-semibold text-foreground ml-6">
                            {formatCurrency(month.forecastedRevenue)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">{t('noData')}</p>
            </div>
          )}
        </div>
      ),
    },
  ], [t, loadingEvolution, revenueEvolution, evolutionChartData, formatCurrency, loadingClients, revenueByClient, revenueByClientChartData, loadingProducts, revenueByProduct, revenueByProductChartData, loadingMonths, revenueByMonthChartData, loadingTopClients, topClients, locale, loadingForecast, revenueForecast]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-muted/30 to-background">
      <div className="w-full px-4 py-8 sm:px-6 sm:py-10 space-y-8">
        <nav className="mb-8">
          <Breadcrumb
            items={[
              { label: commonT('dashboard'), href: "/dashboard" },
              { label: t('title') },
            ]}
            className="text-xs text-muted-foreground"
          />
        </nav>

        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t('title')}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 rounded-full"
              onClick={handleExportExcel}
              disabled={isExportingExcel}
            >
              <FaFileExcel className="h-4 w-4" />
              {isExportingExcel ? t('export.exporting') : t('export.excel')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 rounded-full"
              onClick={handleExportPDF}
              disabled={isExportingPDF}
            >
              <FaFilePdf className="h-4 w-4" />
              {isExportingPDF ? t('export.exporting') : t('export.pdf')}
            </Button>
          </div>
        </header>

        {/* Stats en row */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl border border-border/50 bg-card/50 p-5 shadow-sm backdrop-blur-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/60 ${stat.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* Filtres */}
        <Card className="rounded-2xl border border-border/50 bg-card/50 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FaCalendar className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold text-foreground">{t('filters.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground/70 flex items-center gap-1.5">
                <span>{t('filters.month')}</span>
              </label>
              <Select
                value={selectedMonth?.toString()}
                onValueChange={(value) => setSelectedMonth(value ? parseInt(value, 10) : undefined)}
              >
                <SelectTrigger className="h-10 hover:border-primary/50 transition-colors">
                  <SelectValue placeholder={t('filters.month')} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {new Date(2026, month - 1, 1).toLocaleDateString(
                        locale === 'fr' ? "fr-FR" : "en-US",
                        { month: 'long' }
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground/70 flex items-center gap-1.5">
                <span>{t('filters.year')}</span>
              </label>
              <Select
                value={selectedYear?.toString()}
                onValueChange={(value) => setSelectedYear(value ? parseInt(value, 10) : undefined)}
              >
                <SelectTrigger className="h-10 hover:border-primary/50 transition-colors">
                  <SelectValue placeholder={t('filters.year')} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground/70 flex items-center gap-1.5">
                <span>{t('filters.months')}</span>
              </label>
              <Select
                value={monthsRange.toString()}
                onValueChange={(value) => setMonthsRange(parseInt(value, 10))}
              >
                <SelectTrigger className="h-10 hover:border-primary/50 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 {t('month')}</SelectItem>
                  <SelectItem value="6">6 {t('month')}</SelectItem>
                  <SelectItem value="12">12 {t('month')}</SelectItem>
                  <SelectItem value="24">24 {t('month')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Onglets de rapports */}
        <DirectionAwareTabs
          className="w-full"
          tabs={reportTabs}
          value={activeTab}
          onValueChange={setActiveTab}
        />
      </div>
    </div>
  );
}
