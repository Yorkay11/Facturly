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
import { Download, FileSpreadsheet, FileText } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: commonT('dashboard'), href: "/dashboard" },
          { label: t('title') },
        ]}
        className="text-xs"
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-primary">{t('title')}</h1>
          <p className="mt-1 text-sm text-foreground/70">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            disabled={isExportingExcel}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {isExportingExcel ? t('export.exporting') : t('export.excel')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            disabled={isExportingPDF}
          >
            <FileText className="h-4 w-4 mr-2" />
            {isExportingPDF ? t('export.exporting') : t('export.pdf')}
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card className="border-primary/20 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-primary">{t('filters.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-xs text-foreground/60 mb-1.5 block">{t('filters.month')}</label>
              <Select
                value={selectedMonth?.toString()}
                onValueChange={(value) => setSelectedMonth(value ? parseInt(value, 10) : undefined)}
              >
                <SelectTrigger>
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
            <div>
              <label className="text-xs text-foreground/60 mb-1.5 block">{t('filters.year')}</label>
              <Select
                value={selectedYear?.toString()}
                onValueChange={(value) => setSelectedYear(value ? parseInt(value, 10) : undefined)}
              >
                <SelectTrigger>
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
            <div>
              <label className="text-xs text-foreground/60 mb-1.5 block">{t('filters.months')}</label>
              <Select
                value={monthsRange.toString()}
                onValueChange={(value) => setMonthsRange(parseInt(value, 10))}
              >
                <SelectTrigger>
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
      <Tabs defaultValue="evolution" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="evolution">{t('revenueEvolution')}</TabsTrigger>
          <TabsTrigger value="clients">{t('revenueByClient')}</TabsTrigger>
          <TabsTrigger value="products">{t('revenueByProduct')}</TabsTrigger>
          <TabsTrigger value="months">{t('revenueByMonth')}</TabsTrigger>
          <TabsTrigger value="top">{t('topClients')}</TabsTrigger>
          <TabsTrigger value="forecast">{t('revenueForecast')}</TabsTrigger>
        </TabsList>

        {/* Évolution des revenus */}
        <TabsContent value="evolution" className="space-y-4">
          <Card className="border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-primary">{t('revenueEvolution')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingEvolution ? (
                <Skeleton className="h-64 w-full" />
              ) : revenueEvolution ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-md border border-primary/10 bg-primary/5 p-3">
                      <p className="text-xs text-foreground/60">{t('totalRevenue')}</p>
                      <p className="text-xl font-bold text-primary">
                        {formatCurrency(revenueEvolution.totalRevenue)}
                      </p>
                    </div>
                    <div className="rounded-md border border-primary/10 bg-primary/5 p-3">
                      <p className="text-xs text-foreground/60">{t('averageRevenue')}</p>
                      <p className="text-xl font-bold text-primary">
                        {formatCurrency(revenueEvolution.averageRevenue)}
                      </p>
                    </div>
                    <div className="rounded-md border border-primary/10 bg-primary/5 p-3">
                      <p className="text-xs text-foreground/60">{t('growthTrend')}</p>
                      <p className="text-xl font-bold text-primary">
                        {revenueEvolution.growthTrend === 'increasing'
                          ? t('growthTrendIncreasing')
                          : revenueEvolution.growthTrend === 'decreasing'
                          ? t('growthTrendDecreasing')
                          : t('growthTrendStable')}
                      </p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={evolutionChartData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7835ef" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#7835ef" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} />
                      <YAxis
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        tickFormatter={(value: number) => formatCurrency(value)}
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                        }}
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
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-foreground/60">
                  {t('noData')}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenus par client */}
        <TabsContent value="clients" className="space-y-4">
          <Card className="border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-primary">{t('revenueByClient')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingClients ? (
                <Skeleton className="h-64 w-full" />
              ) : revenueByClient && revenueByClient.length > 0 ? (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueByClientChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        tickFormatter={(value: number) => formatCurrency(value)}
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="revenue" fill="#7835ef" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {revenueByClient.map((client) => (
                      <div
                        key={client.clientId}
                        className="flex items-center justify-between rounded-md border border-primary/10 bg-primary/5 p-3"
                      >
                        <div>
                          <p className="font-medium text-foreground">{client.clientName}</p>
                          <p className="text-xs text-foreground/60">
                            {client.invoiceCount} {t('invoices')} • {t('averageRevenue')}:{' '}
                            {formatCurrency(client.averageInvoiceAmount)}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(client.totalRevenue)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-foreground/60">{t('noData')}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenus par produit */}
        <TabsContent value="products" className="space-y-4">
          <Card className="border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-primary">{t('revenueByProduct')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingProducts ? (
                <Skeleton className="h-64 w-full" />
              ) : revenueByProduct && revenueByProduct.length > 0 ? (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={revenueByProductChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: { name: string; percent: number }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
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
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {revenueByProduct.map((product) => (
                      <div
                        key={product.productId || product.description}
                        className="flex items-center justify-between rounded-md border border-primary/10 bg-primary/5 p-3"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {product.productName || product.description}
                          </p>
                          <p className="text-xs text-foreground/60">
                            {t('quantity')}: {product.quantitySold} • {product.invoiceCount}{' '}
                            {t('invoices')}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(product.totalRevenue)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-foreground/60">{t('noData')}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenus par mois */}
        <TabsContent value="months" className="space-y-4">
          <Card className="border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-primary">{t('revenueByMonth')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMonths ? (
                <Skeleton className="h-64 w-full" />
              ) : revenueByMonthChartData.length > 0 ? (
                <RevenueChart data={revenueByMonthChartData} />
              ) : (
                <div className="py-8 text-center text-sm text-foreground/60">{t('noData')}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top clients */}
        <TabsContent value="top" className="space-y-4">
          <Card className="border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-primary">{t('topClients')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTopClients ? (
                <Skeleton className="h-64 w-full" />
              ) : topClients && topClients.length > 0 ? (
                <div className="space-y-2">
                  {topClients.map((client, index) => (
                    <div
                      key={client.clientId}
                      className="flex items-center justify-between rounded-md border border-primary/10 bg-primary/5 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{client.clientName}</p>
                          <p className="text-xs text-foreground/60">
                            {client.invoiceCount} {t('invoices')}
                            {client.lastInvoiceDate &&
                              ` • ${new Date(client.lastInvoiceDate).toLocaleDateString(
                                locale === 'fr' ? "fr-FR" : "en-US"
                              )}`}
                          </p>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-primary">
                        {formatCurrency(client.totalRevenue)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-foreground/60">{t('noData')}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prévisions */}
        <TabsContent value="forecast" className="space-y-4">
          <Card className="border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-primary">{t('revenueForecast')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingForecast ? (
                <Skeleton className="h-64 w-full" />
              ) : revenueForecast ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-md border border-primary/10 bg-primary/5 p-4">
                      <p className="text-xs text-foreground/60">{t('projectedAnnual')}</p>
                      <p className="text-2xl font-bold text-primary mt-1">
                        {formatCurrency(revenueForecast.projectedAnnualRevenue)}
                      </p>
                    </div>
                    <div className="rounded-md border border-primary/10 bg-primary/5 p-4">
                      <p className="text-xs text-foreground/60">{t('averageRevenue')}</p>
                      <p className="text-2xl font-bold text-primary mt-1">
                        {formatCurrency(revenueForecast.averageMonthlyRevenue)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">{t('nextMonths')}</p>
                    {revenueForecast.forecastMonths.map((month) => {
                      const monthName = new Date(month.year, month.month - 1, 1).toLocaleDateString(
                        locale === 'fr' ? "fr-FR" : "en-US",
                        { month: 'long', year: 'numeric' }
                      );
                      return (
                        <div
                          key={`${month.year}-${month.month}`}
                          className="flex items-center justify-between rounded-md border border-primary/10 bg-white p-3"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-foreground">{monthName}</span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                month.confidence === 'high'
                                  ? 'bg-green-100 text-green-700'
                                  : month.confidence === 'medium'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-orange-100 text-orange-700'
                              }`}
                            >
                              {t(`confidence${month.confidence.charAt(0).toUpperCase() + month.confidence.slice(1)}`)}
                            </span>
                          </div>
                          <p className="text-lg font-bold text-primary">
                            {formatCurrency(month.forecastedRevenue)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-foreground/60">{t('noData')}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
