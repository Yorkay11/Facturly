"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetRevenueForecastQuery, useGetWorkspaceQuery } from "@/services/facturlyApi";
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { IoTrendingUpOutline, IoArrowForwardOutline } from "react-icons/io5";
import { Badge } from "@/components/ui/badge";

export function RevenueForecastCard() {
  const t = useTranslations('reports');
  const locale = useLocale();
  const { data: forecast, isLoading } = useGetRevenueForecastQuery({ months: 3 });
  const { data: workspace } = useGetWorkspaceQuery();
  const currency = workspace?.defaultCurrency || 'XOF';

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat(locale === 'fr' ? "fr-FR" : "en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(value));
  };

  const getConfidenceColor = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-orange-100 text-orange-700 border-orange-200';
    }
  };

  const getConfidenceLabel = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high':
        return t('confidenceHigh');
      case 'medium':
        return t('confidenceMedium');
      case 'low':
        return t('confidenceLow');
    }
  };

  return (
    <Card className="border-primary/20 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
          <IoTrendingUpOutline className="h-4 w-4" />
          {t('revenueForecast')}
        </CardTitle>
        <Link
          href="/reports"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          {t('viewDetails')}
          <IoArrowForwardOutline className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : forecast ? (
          <>
            <div className="rounded-md border border-primary/10 bg-primary/5 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-foreground/60">{t('projectedAnnual')}</p>
                <Badge className={getConfidenceColor(forecast.forecastMonths[0]?.confidence || 'medium')}>
                  {getConfidenceLabel(forecast.forecastMonths[0]?.confidence || 'medium')}
                </Badge>
              </div>
              <p className="text-xl font-bold text-primary">
                {formatCurrency(forecast.projectedAnnualRevenue)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground/70">{t('nextMonths')}</p>
              {forecast.forecastMonths.slice(0, 3).map((month, index) => {
                const monthName = new Date(month.year, month.month - 1, 1).toLocaleDateString(
                  locale === 'fr' ? "fr-FR" : "en-US",
                  { month: 'short', year: 'numeric' }
                );
                return (
                  <div
                    key={`${month.year}-${month.month}`}
                    className="flex items-center justify-between rounded-md border border-primary/10 bg-white p-2"
                  >
                    <span className="text-xs text-foreground/70">{monthName}</span>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(month.forecastedRevenue)}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="rounded-md border border-dashed border-primary/30 bg-white py-6 text-center">
            <p className="text-xs text-foreground/60">{t('noData')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
