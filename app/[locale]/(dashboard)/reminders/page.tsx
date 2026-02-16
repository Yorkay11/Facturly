"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BellRing, Mail, Search, ChevronRight } from "lucide-react";
import { Link } from '@/i18n/routing';
import Breadcrumb from "@/components/ui/breadcrumb";
import Skeleton from "@/components/ui/skeleton";
import { useGetInvoicesQuery } from "@/services/facturlyApi";
import ReminderModal from "@/components/modals/ReminderModal";
import { useState, useMemo } from "react";
import { useTranslations, useLocale } from 'next-intl';
import { FuryMascot } from "@/components/mascot/FuryMascot";

export default function RemindersPage() {
  const t = useTranslations('reminders');
  const locale = useLocale();
  
  const [isReminderModalOpen, setReminderModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(locale === 'fr' ? "fr-FR" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const formatCurrency = (value: string | number, currency: string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat(locale === 'fr' ? "fr-FR" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(numValue);
  };
  
  // Récupérer les factures en retard (overdue) et sent (potentiellement en retard)
  const { 
    data: overdueInvoices, 
    isLoading: isLoadingOverdue, 
    isError: isErrorOverdue 
  } = useGetInvoicesQuery({ 
    page: 1, 
    limit: 100, 
    status: "overdue" 
  });
  const { 
    data: sentInvoices, 
    isLoading: isLoadingSent,
    isError: isErrorSent 
  } = useGetInvoicesQuery({ 
    page: 1, 
    limit: 100, 
    status: "sent" 
  });

  const isLoading = isLoadingOverdue || isLoadingSent;
  const isError = isErrorOverdue || isErrorSent;

  // Filtrer les factures sent dont la date d'échéance est dépassée
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const overdueFromSent = sentInvoices?.data?.filter((invoice) => {
    const dueDate = new Date(invoice.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  }) ?? [];

  // Combiner les factures en retard
  const reminders = [
    ...(overdueInvoices?.data ?? []),
    ...overdueFromSent,
  ];

  const totalPending = reminders.length;

  const filteredReminders = useMemo(() => {
    if (!searchQuery.trim()) return reminders;
    const q = searchQuery.trim().toLowerCase();
    return reminders.filter(
      (inv) =>
        inv.invoiceNumber?.toLowerCase().includes(q) ||
        inv.client?.name?.toLowerCase().includes(q)
    );
  }, [reminders, searchQuery]);
  
  const totalAmount = reminders.reduce((sum, invoice) => {
    const amount = typeof invoice.totalAmount === "string" 
      ? parseFloat(invoice.totalAmount) 
      : invoice.totalAmount;
    // TODO: Convertir les devises en EUR si nécessaire
    return sum + (amount || 0);
  }, 0);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-muted/30 to-background">
      <div className="w-full px-4 py-8 sm:px-6 sm:py-10">
        <nav className="mb-8">
          <Breadcrumb
            items={[
              { label: t('breadcrumb.dashboard'), href: "/dashboard" },
              { label: t('breadcrumb.reminders') },
            ]}
            className="text-xs text-muted-foreground"
          />
        </nav>

        <header className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {t('title')}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
            </div>
            <Button
              size="sm"
              className="h-9 gap-2 rounded-full px-4 font-medium"
              onClick={() => {
                setSelectedInvoiceId(undefined);
                setReminderModalOpen(true);
              }}
            >
              <BellRing className="h-4 w-4" />
              {t('buttons.create')}
            </Button>
          </div>
        </header>

        {/* Stats en row */}
        <section className="mb-8 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border/50 bg-card/50 p-5 shadow-sm backdrop-blur-sm">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('stats.active')}
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
              {totalPending}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{t('stats.activeDescription')}</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/50 p-5 shadow-sm backdrop-blur-sm">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('stats.overdueAmount')}
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
              {totalAmount > 0 ? formatCurrency(totalAmount, "EUR") : "—"}
            </p>
          </div>
        </section>

        {/* Liste des relances */}
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{t('table.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('table.description')}</p>
            </div>
            {reminders.length > 0 && (
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('table.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 bg-muted/30 border-border"
                />
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-6 text-sm text-destructive">
              {t('errors.loadingError')}
            </div>
          ) : filteredReminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
              <FuryMascot mood="reminder" size="lg" className="mb-4" />
              <p className="text-sm text-muted-foreground">{t('empty.noReminders')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReminders.map((invoice) => (
                <div
                  key={invoice.id}
                  className="group flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/50 p-5 shadow-sm backdrop-blur-sm transition-colors hover:border-border sm:flex-row sm:items-center sm:justify-between"
                >
                  <Link
                    href={`/invoices/${invoice.id}`}
                    className="min-w-0 flex-1 space-y-1 sm:pr-4"
                  >
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-foreground">{invoice.invoiceNumber}</p>
                      <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                        {t('table.overdue')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{invoice.client?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('table.dueDate')} · {formatDate(invoice.dueDate)}
                    </p>
                  </Link>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <p className="text-lg font-semibold tabular-nums text-foreground">
                      {formatCurrency(invoice.totalAmount, invoice.currency)}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 gap-2 rounded-full shrink-0"
                      onClick={() => {
                        setSelectedInvoiceId(invoice.id);
                        setReminderModalOpen(true);
                      }}
                    >
                      <Mail className="h-4 w-4" />
                      {t('buttons.remind')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ReminderModal 
        open={isReminderModalOpen} 
        onClose={() => {
          setReminderModalOpen(false);
          setSelectedInvoiceId(undefined);
        }}
        preselectedInvoiceId={selectedInvoiceId}
      />
    </div>
  );
}
