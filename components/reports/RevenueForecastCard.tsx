"use client";

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
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case 'low':
        return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
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
    <div className="rounded-2xl border border-border/50 bg-card/50 shadow-sm backdrop-blur-sm overflow-hidden">
      <div className="flex flex-row items-center justify-between px-4 py-3 border-b border-border/50">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <IoTrendingUpOutline className="h-4 w-4 text-primary" />
          {t('revenueForecast')}
        </h3>
        <Link
          href="/reports"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          {t('viewDetails')}
          <IoArrowForwardOutline className="h-3 w-3" />
        </Link>
      </div>
      <div className="p-4 space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </>
        ) : forecast ? (
          <>
            <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{t('projectedAnnual')}</p>
                <Badge variant="secondary" className={getConfidenceColor(forecast.forecastMonths[0]?.confidence || 'medium')}>
                  {getConfidenceLabel(forecast.forecastMonths[0]?.confidence || 'medium')}
                </Badge>
              </div>
              <p className="text-xl font-bold text-primary">
                {formatCurrency(forecast.projectedAnnualRevenue)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{t('nextMonths')}</p>
              <div className="divide-y divide-border/50 rounded-xl border border-border/50 overflow-hidden">
                {forecast.forecastMonths.slice(0, 3).map((month) => {
                  const monthName = new Date(month.year, month.month - 1, 1).toLocaleDateString(
                    locale === 'fr' ? "fr-FR" : "en-US",
                    { month: 'short', year: 'numeric' }
                  );
                  return (
                    <div
                      key={`${month.year}-${month.month}`}
                      className="flex items-center justify-between px-3 py-2.5 hover:bg-muted/30 transition-colors"
                    >
                      <span className="text-sm text-foreground/80">{monthName}</span>
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(month.forecastedRevenue)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-border/50 bg-muted/20 py-8 text-center">
            <p className="text-xs text-muted-foreground">{t('noData')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
