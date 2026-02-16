"use client";

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
    <div className="rounded-2xl border border-border/50 bg-card/50 shadow-sm backdrop-blur-sm overflow-hidden">
      <div className="flex flex-row items-center justify-between px-4 py-3 border-b border-border/50">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <IoPeopleOutline className="h-4 w-4 text-primary" />
          {t('topClients')}
        </h3>
        <Link
          href="/reports"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          {t('viewAll')}
          <IoArrowForwardOutline className="h-3 w-3" />
        </Link>
      </div>
      <div className="divide-y divide-border/50">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : topClients && topClients.length > 0 ? (
          topClients.slice(0, limit).map((client, index) => (
            <div
              key={client.clientId}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 active:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {client.clientName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {client.invoiceCount} {t('invoices')}
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold text-primary flex-shrink-0 ml-2">
                {formatCurrency(client.totalRevenue)}
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border/50 bg-muted/20 py-8 mx-4 my-4 text-center">
            <p className="text-xs text-muted-foreground">{t('noData')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
