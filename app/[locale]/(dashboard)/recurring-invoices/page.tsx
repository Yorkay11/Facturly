"use client";

import { Link } from '@/i18n/routing';
import { Plus, Pause, Play, Edit, Trash2, Calendar, Repeat, Search, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Breadcrumb from "@/components/ui/breadcrumb";
import Skeleton from "@/components/ui/skeleton";
import {
  useGetRecurringInvoicesQuery,
  useDeleteRecurringInvoiceMutation,
  useUpdateRecurringInvoiceStatusMutation,
} from "@/services/facturlyApi";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { FuryMascot } from "@/components/mascot";

export default function RecurringInvoicesPage() {
  const t = useTranslations('recurringInvoices');
  const router = useRouter();
  const locale = useLocale();
  const dateLocale = locale === 'fr' ? fr : enUS;

  const { data: recurringInvoices, isLoading, isError } = useGetRecurringInvoicesQuery();
  const [deleteRecurringInvoice, { isLoading: isDeleting }] = useDeleteRecurringInvoiceMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateRecurringInvoiceStatusMutation();

  const [recurringInvoiceToDelete, setRecurringInvoiceToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = async () => {
    if (!recurringInvoiceToDelete) return;
    try {
      await deleteRecurringInvoice(recurringInvoiceToDelete).unwrap();
      toast.success(t('deleteSuccess'));
      setRecurringInvoiceToDelete(null);
    } catch (error: unknown) {
      const msg = error && typeof error === 'object' && 'data' in error && (error.data as { message?: string })?.message;
      toast.error(typeof msg === 'string' ? msg : t('deleteError'));
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      await updateStatus({ id, status: newStatus }).unwrap();
      toast.success(t('statusUpdateSuccess'));
    } catch (error: unknown) {
      const msg = error && typeof error === 'object' && 'data' in error && (error.data as { message?: string })?.message;
      toast.error(typeof msg === 'string' ? msg : t('statusUpdateError'));
    }
  };

  const filteredInvoices = recurringInvoices?.filter((invoice) => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    return (
      invoice.name?.toLowerCase().includes(search) ||
      invoice.client.name.toLowerCase().includes(search)
    );
  }) ?? [];

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'monthly':
        return t('frequency.monthly');
      case 'quarterly':
        return t('frequency.quarterly');
      case 'yearly':
        return t('frequency.yearly');
      default:
        return frequency;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-500/90 text-white border-0">{t('status.active')}</Badge>;
      case 'paused':
        return <Badge variant="secondary">{t('status.paused')}</Badge>;
      case 'completed':
        return <Badge variant="outline">{t('status.completed')}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{t('status.cancelled')}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const activeCount = recurringInvoices?.filter((i) => i.status === 'active').length ?? 0;
  const pausedCount = recurringInvoices?.filter((i) => i.status === 'paused').length ?? 0;
  const totalGenerated = recurringInvoices?.reduce((sum, i) => sum + (i.totalInvoicesGenerated ?? 0), 0) ?? 0;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-muted/30 to-background">
      <div className="w-full px-4 py-8 sm:px-6 sm:py-10">
        <nav className="mb-8">
          <Breadcrumb
            items={[
              { label: t('breadcrumb.dashboard'), href: "/dashboard" },
              { label: t('breadcrumb.recurringInvoices') },
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
            <Button size="sm" className="h-9 gap-2 rounded-full px-4 font-medium" asChild>
              <Link href="/invoices/new?recurring=1">
                <Plus className="h-4 w-4" />
                {t('create')}
              </Link>
            </Button>
          </div>
        </header>

        {/* Stats */}
        {!isLoading && !isError && (
          <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/50 bg-card/50 p-5 shadow-sm backdrop-blur-sm">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {t('status.active')}
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                {activeCount}
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/50 p-5 shadow-sm backdrop-blur-sm">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {t('status.paused')}
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                {pausedCount}
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/50 p-5 shadow-sm backdrop-blur-sm max-sm:col-span-2 sm:max-w-none">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {t('table.generated')}
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                {totalGenerated}
              </p>
            </div>
          </section>
        )}

        {/* List section */}
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{t('breadcrumb.recurringInvoices')}</h2>
              <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
            </div>
            {filteredInvoices.length > 0 && (
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10 bg-muted/30 border-border rounded-xl"
                />
              </div>
            )}
          </div>

          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          )}

          {isError && (
            <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-6 text-sm text-destructive">
              {t('errors.loadingError')}
            </div>
          )}

          {!isLoading && !isError && filteredInvoices.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
              <FuryMascot mood="focus" size="lg" className="mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('empty.title')}</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">{t('empty.description')}</p>
              <Button size="sm" className="rounded-full gap-2" asChild>
                <Link href="/invoices/new?recurring=1">
                  <Plus className="h-4 w-4" />
                  {t('create')}
                </Link>
              </Button>
            </div>
          )}

          {!isLoading && !isError && filteredInvoices.length > 0 && (
            <div className="rounded-2xl border border-border/50 bg-card/50 shadow-sm backdrop-blur-sm overflow-hidden">
              <div className="divide-y divide-border/50">
                {filteredInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="group flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-4 transition-colors hover:bg-muted/30 sm:px-5"
                  >
                    <button
                      type="button"
                      onClick={() => router.push(`/recurring-invoices/${invoice.id}`)}
                      className="flex-1 text-left min-w-0 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {invoice.name || t('unnamed')}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">{invoice.client.name}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Repeat className="h-3.5 w-3.5" />
                          {getFrequencyLabel(invoice.frequency)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(invoice.nextGenerationDate), 'PP', { locale: dateLocale })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:ml-auto">
                        {getStatusBadge(invoice.status)}
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {invoice.totalInvoicesGenerated} {t('table.generated')}
                        </span>
                      </div>
                    </button>
                    <div className="flex items-center justify-end gap-1 shrink-0 sm:pl-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => handleToggleStatus(invoice.id, invoice.status)}
                        disabled={isUpdatingStatus || invoice.status === 'completed' || invoice.status === 'cancelled'}
                        title={invoice.status === 'active' ? t('pause') : t('activate')}
                      >
                        {invoice.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10"
                        onClick={() => router.push(`/recurring-invoices/${invoice.id}`)}
                        title={t('edit')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
                        onClick={() => setRecurringInvoiceToDelete(invoice.id)}
                        disabled={isDeleting}
                        title={t('delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <AlertDialog open={!!recurringInvoiceToDelete} onOpenChange={() => setRecurringInvoiceToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
              <AlertDialogDescription>{t('deleteDialog.description')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                {t('deleteDialog.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
