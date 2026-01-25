"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetTopClientsQuery } from "@/services/facturlyApi";
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { IoPeopleOutline, IoArrowForwardOutline } from "react-icons/io5";
import { useGetWorkspaceQuery } from "@/services/facturlyApi";

export function TopClientsCard({ limit = 5 }: { limit?: number }) {
  const t = useTranslations('reports');
  const locale = useLocale();
  const { data: topClients, isLoading } = useGetTopClientsQuery({ limit });
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

  return (
    <Card className="border-primary/20 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
          <IoPeopleOutline className="h-4 w-4" />
          {t('topClients')}
        </CardTitle>
        <Link
          href="/reports"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          {t('viewAll')}
          <IoArrowForwardOutline className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : topClients && topClients.length > 0 ? (
          <>
            {topClients.slice(0, limit).map((client, index) => (
              <div
                key={client.clientId}
                className="flex items-center justify-between rounded-md border border-primary/10 bg-primary/5 p-2.5"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {client.clientName}
                    </p>
                    <p className="text-xs text-foreground/60">
                      {client.invoiceCount} {t('invoices')}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-sm font-semibold text-primary">
                    {formatCurrency(client.totalRevenue)}
                  </p>
                </div>
              </div>
            ))}
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
