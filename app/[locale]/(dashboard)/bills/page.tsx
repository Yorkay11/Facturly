"use client";

import { Link } from '@/i18n/routing';
import { FileText, Search, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useTranslations, useLocale } from 'next-intl';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Breadcrumb from "@/components/ui/breadcrumb";
import Skeleton from "@/components/ui/skeleton";
import { useGetBillsQuery } from "@/services/facturlyApi";
import { cn } from "@/lib/utils";
import { FuryMascot } from "@/components/mascot";

export default function BillsPage() {
  const t = useTranslations('bills');
  const locale = useLocale();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: billsResponse, isLoading, isError } = useGetBillsQuery({
    page: 1,
    limit: 100,
    status: statusFilter !== "all" ? (statusFilter as "RECEIVED" | "VIEWED" | "PAID" | "OVERDUE" | "CANCELLED") : undefined,
  });

  const bills = billsResponse?.data ?? [];
  const totalBills = billsResponse?.meta?.total ?? 0;

  const formatCurrency = (value: string | number, currency: string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat(locale === 'fr' ? "fr-FR" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(numValue);
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(locale === 'fr' ? "fr-FR" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      RECEIVED: {
        label: t('status.received'),
        className: "bg-blue-500/12 text-blue-600 dark:text-blue-400 border-0",
      },
      VIEWED: {
        label: t('status.viewed'),
        className: "bg-blue-500/12 text-blue-600 dark:text-blue-400 border-0",
      },
      PAID: {
        label: t('status.paid'),
        className: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 border-0",
      },
      OVERDUE: {
        label: t('status.overdue'),
        className: "bg-red-500/12 text-red-600 dark:text-red-400 border-0",
      },
      CANCELLED: {
        label: t('status.cancelled'),
        className: "bg-muted/80 text-muted-foreground border-0",
      },
    };
    const config = statusMap[status];
    if (!config) {
      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-muted text-muted-foreground">
          {status}
        </span>
      );
    }
    return (
      <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium", config.className)}>
        {config.label}
      </span>
    );
  };

  const filteredBills = bills.filter((bill) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      bill.invoice.invoiceNumber?.toLowerCase().includes(query) ||
      bill.invoice.issuer?.name?.toLowerCase().includes(query)
    );
  });

  const pendingCount = bills.filter((b) => b.status === "RECEIVED" || b.status === "VIEWED" || b.status === "OVERDUE").length;
  const paidCount = bills.filter((b) => b.status === "PAID").length;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-muted/30 to-background">
      <div className="w-full px-4 py-8 sm:px-6 sm:py-10">
        <nav className="mb-8">
          <Breadcrumb
            items={[
              { label: t('breadcrumb.dashboard'), href: "/dashboard" },
              { label: t('breadcrumb.bills') },
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
          </div>
        </header>

        {/* Stats — cartes type Apple, pleine largeur */}
        {!isLoading && !isError && (
          <section className="mb-8 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-muted/40 dark:bg-muted/20 border border-border/40 p-5 sm:p-6 min-h-[100px] flex flex-col justify-center">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t('stats.total')}
              </p>
              <p className="mt-2 text-[28px] sm:text-[32px] font-semibold tabular-nums tracking-tight text-foreground">
                {totalBills}
              </p>
            </div>
            <div className="rounded-2xl bg-muted/40 dark:bg-muted/20 border border-border/40 p-5 sm:p-6 min-h-[100px] flex flex-col justify-center">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t('stats.pending')}
              </p>
              <p className="mt-2 text-[28px] sm:text-[32px] font-semibold tabular-nums tracking-tight text-foreground">
                {pendingCount}
              </p>
            </div>
            <div className="rounded-2xl bg-muted/40 dark:bg-muted/20 border border-border/40 p-5 sm:p-6 min-h-[100px] flex flex-col justify-center col-span-2 md:col-span-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t('stats.paid')}
              </p>
              <p className="mt-2 text-[28px] sm:text-[32px] font-semibold tabular-nums tracking-tight text-foreground">
                {paidCount}
              </p>
            </div>
          </section>
        )}

        {/* Liste */}
        <div className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[17px] font-semibold text-foreground tracking-tight">
                {t('list.title')}
              </h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                {t('list.description', { count: totalBills, plural: totalBills !== 1 ? 's' : '' })}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="relative w-full sm:w-52">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder={t('list.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-11 rounded-xl bg-muted/30 border-0 focus-visible:ring-2 focus-visible:ring-ring/20 text-[15px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 w-full sm:w-[160px] rounded-xl border-0 bg-muted/30 text-[15px] focus:ring-2 focus:ring-ring/20">
                  <SelectValue placeholder={t('list.filterPlaceholder')} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">{t('list.allStatuses')}</SelectItem>
                  <SelectItem value="RECEIVED">{t('status.received')}</SelectItem>
                  <SelectItem value="VIEWED">{t('status.viewed')}</SelectItem>
                  <SelectItem value="PAID">{t('status.paid')}</SelectItem>
                  <SelectItem value="OVERDUE">{t('status.overdue')}</SelectItem>
                  <SelectItem value="CANCELLED">{t('status.cancelled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-[72px] w-full rounded-2xl bg-muted/40" />
              <Skeleton className="h-[72px] w-full rounded-2xl bg-muted/40" />
              <Skeleton className="h-[72px] w-full rounded-2xl bg-muted/40" />
            </div>
          )}

          {isError && (
            <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6">
              <p className="text-[15px] font-semibold text-destructive">
                {t('errors.loadingError')}
              </p>
              <p className="mt-1 text-[13px] text-destructive/90">
                {t('errors.loadingErrorDescription')}
              </p>
            </div>
          )}

          {!isLoading && !isError && filteredBills.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 py-16 text-center px-4">
              <FuryMascot mood="sad" size="lg" className="mb-4" />
              <p className="text-[19px] font-semibold text-foreground tracking-tight mb-1">
                {t('empty.title')}
              </p>
              <p className="text-[15px] text-muted-foreground max-w-sm">
                {searchQuery ? t('empty.noResults') : t('empty.noBills')}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-5 rounded-full h-9 px-4 text-[15px] font-medium border-border/60"
                  onClick={() => setSearchQuery("")}
                >
                  {t('list.clearSearch')}
                </Button>
              )}
            </div>
          )}

          {!isLoading && !isError && filteredBills.length > 0 && (
            <div className="rounded-2xl bg-muted/40 dark:bg-muted/20 border border-border/40 overflow-hidden">
              <div className="divide-y divide-border/40">
                {filteredBills.map((bill) => (
                  <Link
                    key={bill.id}
                    href={`/bills/${bill.id}`}
                    className="group flex items-center gap-4 px-4 py-3.5 sm:px-5 transition-colors hover:bg-muted/50 active:bg-muted/60"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background/80 dark:bg-background/60 text-primary shadow-sm">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold text-foreground truncate">
                        {bill.invoice.invoiceNumber}
                      </p>
                      <p className="text-[13px] text-muted-foreground truncate mt-0.5">
                        {bill.invoice.issuer?.name ?? "—"}
                      </p>
                      <p className="text-[12px] text-muted-foreground/80 mt-1">
                        {t('table.issueDate')} · {formatDate(bill.invoice.issueDate)}
                        <span className="mx-1.5">·</span>
                        {t('table.dueDate')} · {formatDate(bill.invoice.dueDate)}
                      </p>
                      <p className="text-[13px] font-semibold tabular-nums text-foreground mt-1 sm:hidden">
                        {formatCurrency(bill.invoice.totalAmount, bill.invoice.currency)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <p className="text-[15px] font-semibold tabular-nums text-foreground hidden sm:block">
                        {formatCurrency(bill.invoice.totalAmount, bill.invoice.currency)}
                      </p>
                      {getStatusBadge(bill.status)}
                      <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
