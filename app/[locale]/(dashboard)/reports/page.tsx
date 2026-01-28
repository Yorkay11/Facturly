"use client";

import { useState } from "react";
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const COLORS = ['#7835ef', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

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

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: commonT('dashboard'), href: "/dashboard" },
          { label: t('title') },
        ]}
        className="text-xs"
      />

      {/* Header amélioré */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {t('title')}
            </h1>
            <p className="mt-2 text-sm md:text-base text-muted-foreground">{t('subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={isExportingExcel}
              className="group hover:bg-green-50 hover:border-green-500/50 hover:text-green-700 transition-all"
            >
              <FaFileExcel className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              {isExportingExcel ? t('export.exporting') : t('export.excel')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="group hover:bg-red-50 hover:border-red-500/50 hover:text-red-700 transition-all"
            >
              <FaFilePdf className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              {isExportingPDF ? t('export.exporting') : t('export.pdf')}
            </Button>
          </div>
        </div>

        {/* Statistiques clés */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2 }}
                className={`
                  group relative overflow-hidden rounded-xl border ${stat.borderColor}
                  bg-gradient-to-br ${stat.color}
                  p-4 shadow-sm hover:shadow-md transition-all duration-300
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-lg
                    bg-white/50 group-hover:bg-white/70
                    ${stat.iconColor} transition-all duration-300
                    group-hover:scale-110
                  `}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Filtres améliorés */}
      <Card className="border-primary/20 shadow-sm bg-gradient-to-br from-card to-card/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FaCalendar className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold text-primary">{t('filters.title')}</CardTitle>
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
                      {new Date(2024, month - 1, 1).toLocaleDateString(
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

      {/* Onglets de rapports améliorés */}
      <Tabs defaultValue="evolution" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto p-1 bg-muted/50 rounded-lg">
          <TabsTrigger value="evolution" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
            <FaChartLine className="h-3.5 w-3.5 mr-1.5" />
            <span className="text-xs">{t('revenueEvolution')}</span>
          </TabsTrigger>
          <TabsTrigger value="clients" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
            <FaUsers className="h-3.5 w-3.5 mr-1.5" />
            <span className="text-xs">{t('revenueByClient')}</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
            <FaBox className="h-3.5 w-3.5 mr-1.5" />
            <span className="text-xs">{t('revenueByProduct')}</span>
          </TabsTrigger>
          <TabsTrigger value="months" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
            <FaCalendar className="h-3.5 w-3.5 mr-1.5" />
            <span className="text-xs">{t('revenueByMonth')}</span>
          </TabsTrigger>
          <TabsTrigger value="top" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
            <FaTrophy className="h-3.5 w-3.5 mr-1.5" />
            <span className="text-xs">{t('topClients')}</span>
          </TabsTrigger>
          <TabsTrigger value="forecast" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
            <FaChartArea className="h-3.5 w-3.5 mr-1.5" />
            <span className="text-xs">{t('revenueForecast')}</span>
          </TabsTrigger>
        </TabsList>

        {/* Évolution des revenus */}
        <TabsContent value="evolution" className="space-y-6">
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
                          <stop offset="5%" stopColor="#7835ef" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#7835ef" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="label" 
                        tick={{ fill: "#64748b", fontSize: 12 }} 
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        tickFormatter={(value: number) => formatCurrency(value)}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                        }}
                        labelStyle={{ fontWeight: 500, color: "#1e293b", marginBottom: "4px" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#7835ef"
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
        </TabsContent>

        {/* Revenus par client */}
        <TabsContent value="clients" className="space-y-6">
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
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        tickFormatter={(value: number) => formatCurrency(value)}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                        }}
                        labelStyle={{ fontWeight: 500, color: "#1e293b", marginBottom: "4px" }}
                      />
                      <Bar dataKey="revenue" fill="#7835ef" radius={[4, 4, 0, 0]} />
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
        </TabsContent>

        {/* Revenus par produit */}
        <TabsContent value="products" className="space-y-6">
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
                          fill="#8884d8"
                          dataKey="revenue"
                        >
                          {revenueByProductChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "6px",
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                          }}
                          labelStyle={{ fontWeight: 500, color: "#1e293b", marginBottom: "4px" }}
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
        </TabsContent>

        {/* Revenus par mois */}
        <TabsContent value="months" className="space-y-6">
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
        </TabsContent>

        {/* Top clients */}
        <TabsContent value="top" className="space-y-6">
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
                            ? 'bg-slate-100 text-slate-700'
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
        </TabsContent>

        {/* Prévisions */}
        <TabsContent value="forecast" className="space-y-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
