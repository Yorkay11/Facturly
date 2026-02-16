"use client";

import { Link } from '@/i18n/routing';
import { useParams } from "next/navigation";
import { useRouter } from '@/i18n/routing';
import { ArrowLeft, Mail, Phone, MapPin, Trash2, Plus, History, TrendingUp, Pencil, ChevronRight } from "lucide-react";
import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Breadcrumb from "@/components/ui/breadcrumb";
import Skeleton from "@/components/ui/skeleton";
import ClientModal from "@/components/modals/ClientModal";
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
import {
  useGetClientByIdQuery,
  useGetInvoicesQuery,
  useDeleteClientMutation,
  useGetClientRevenueQuery,
} from "@/services/facturlyApi";
import { toast } from "sonner";
import { useTranslations, useLocale } from 'next-intl';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('clients.detail');
  const clientsT = useTranslations('clients');
  const commonT = useTranslations('common');
  const locale = useLocale();
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Dans Next.js 16, useParams retourne directement les paramètres
  // Vérifier que l'ID existe et n'est pas "undefined" (chaîne)
  const rawId = params?.id;
  const clientId = typeof rawId === "string" && rawId !== "undefined" && rawId.trim() !== "" 
    ? rawId 
    : undefined;
  
  // Ne pas appeler les hooks si clientId n'est pas valide
  const shouldSkip = !clientId;

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
  
  const { data: client, isLoading: isLoadingClient, isError: isErrorClient } = useGetClientByIdQuery(
    clientId || "",
    // RTK Query: skip si clientId n'est pas valide
    { skip: shouldSkip }
  );
  
  const { data: invoicesResponse, isLoading: isLoadingInvoices } = useGetInvoicesQuery(
    shouldSkip ? { page: 1, limit: 10 } : { page: 1, limit: 10, clientId: clientId! },
    { skip: shouldSkip }
  );
  
  const { data: clientRevenue, isLoading: isLoadingRevenue } = useGetClientRevenueQuery(
    shouldSkip ? { id: "" } : { id: clientId!, params: { months: 6 } },
    { skip: shouldSkip }
  );
  
  const [deleteClientMutation, { isLoading: isDeleting }] = useDeleteClientMutation();

  const invoices = invoicesResponse?.data ?? [];
  const totalInvoices = invoicesResponse?.meta?.total ?? 0;
  const totalAmount = invoices.reduce((sum, invoice) => {
    const amount = typeof invoice.totalAmount === "string" 
      ? parseFloat(invoice.totalAmount) 
      : invoice.totalAmount;
    return sum + (amount || 0);
  }, 0);

  const handleDelete = async () => {
    if (!clientId) {
      toast.error(commonT('error'), { description: t('errors.missingIdError') });
      return;
    }
    try {
      await deleteClientMutation(clientId).unwrap();
      toast.success(clientsT('deleteSuccess'), {
        description: clientsT('deleteSuccessDescription', { name: client?.name || '' }),
      });
      setShowDeleteDialog(false);
      router.push("/clients");
    } catch (error) {
      const errorMessage =
        error && typeof error === "object" && error !== null && "data" in error
          ? (error.data as { message?: string })?.message ?? t('errors.deleteError')
          : t('errors.deleteErrorGeneric');
      toast.error(commonT('error'), { description: errorMessage });
    }
  };

  if (!clientId) {
    return (
      <div className="space-y-4">
        <Breadcrumb
          items={[
            { label: t('breadcrumb.dashboard'), href: "/dashboard" },
            { label: t('breadcrumb.clients'), href: "/clients" },
            { label: t('breadcrumb.details') },
          ]}
          className="text-xs"
        />
        <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-semibold">{t('errors.missingId')}</p>
          <p className="mt-2">{t('errors.missingIdDescription')}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/clients")}
          >
            {t('buttons.backToList')}
          </Button>
        </div>
      </div>
    );
  }

  if (isLoadingClient) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isErrorClient || !client) {
    return (
      <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
        {t('errors.notFound')}
      </div>
    );
  }

  const addressParts = [
    client.addressLine1,
    client.addressLine2,
    [client.postalCode, client.city].filter(Boolean).join(" "),
    client.country,
  ].filter(Boolean);
  const initial = client.name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-muted/30 to-background">
      <div className="w-full px-4 py-8 sm:px-6 sm:py-10">
        <nav className="mb-8">
          <Breadcrumb
            items={[
              { label: t('breadcrumb.dashboard'), href: "/dashboard" },
              { label: t('breadcrumb.clients'), href: "/clients" },
              { label: client.name },
            ]}
            className="text-xs text-muted-foreground"
          />
        </nav>

        {/* Hero: avatar + nom + actions */}
        <header className="mb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-2xl font-semibold text-primary shadow-sm">
                {initial}
              </div>
              <div className="min-w-0">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {client.name}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-full border-border/80 bg-background/80 px-4 text-sm font-medium shadow-sm backdrop-blur-sm"
                onClick={() => setEditModalOpen(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
                {t('buttons.edit')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-2 rounded-full px-4 text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t('buttons.delete')}
              </Button>
              <Button size="sm" className="h-9 gap-2 rounded-full px-4 text-sm font-medium" asChild>
                <Link href={`/invoices/new?clientId=${client.id}`}>
                  <Plus className="h-3.5 w-3.5" />
                  {t('buttons.createInvoice')}
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Stats principales */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border/40 bg-background p-6 shadow-sm">
            <p className="text-[13px] font-medium text-muted-foreground">
              {t('statistics.totalInvoices')}
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
              {totalInvoices}
            </p>
          </div>
          <div className="rounded-xl border border-border/40 bg-background p-6 shadow-sm">
            <p className="text-[13px] font-medium text-muted-foreground">
              {t('statistics.totalAmount')}
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
              {totalAmount > 0 ? formatCurrency(totalAmount, invoices[0]?.currency || "EUR") : "—"}
            </p>
          </div>
        </section>

        {/* Contenu principal */}
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Colonne gauche */}
          <div className="space-y-6">
            {/* Informations de contact */}
            <section className="rounded-xl border border-border/40 bg-background p-6 shadow-sm">
              <h2 className="text-[15px] font-semibold text-foreground mb-6">
                {t('contactInfo.title')}
              </h2>
              <div className="space-y-4">
                {client.email && (
                  <a
                    href={`mailto:${client.email}`}
                    className="flex items-center gap-4 rounded-lg p-4 transition-colors hover:bg-muted/40 -mx-2"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium text-muted-foreground mb-0.5">{t('contactInfo.email')}</p>
                      <p className="truncate text-[15px] font-medium text-foreground">{client.email}</p>
                    </div>
                  </a>
                )}
                {client.phone && (
                  <a
                    href={`tel:${client.phone}`}
                    className="flex items-center gap-4 rounded-lg p-4 transition-colors hover:bg-muted/40 -mx-2"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium text-muted-foreground mb-0.5">{t('contactInfo.phone')}</p>
                      <p className="text-[15px] font-medium text-foreground">{client.phone}</p>
                    </div>
                  </a>
                )}
                {addressParts.length > 0 && (
                  <div className="flex items-start gap-4 rounded-lg p-4 -mx-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium text-muted-foreground mb-1">{t('contactInfo.address')}</p>
                      <p className="text-[15px] leading-relaxed text-foreground">
                        {addressParts.join(", ")}
                      </p>
                    </div>
                  </div>
                )}
                {!client.email && !client.phone && addressParts.length === 0 && (
                  <div className="rounded-lg bg-muted/30 px-4 py-6 text-center">
                    <p className="text-sm text-muted-foreground">{t('contactInfo.description')}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Factures récentes */}
            <section className="rounded-xl border border-border/40 bg-background shadow-sm overflow-hidden">
              <div className="border-b border-border/30 px-6 py-4 bg-muted/20">
                <div className="flex items-center gap-2 mb-1">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-[15px] font-semibold text-foreground">
                    {t('recentInvoices.title')}
                  </h2>
                </div>
                <p className="text-[13px] text-muted-foreground">{t('recentInvoices.description')}</p>
              </div>
              <div className="divide-y divide-border/30">
                {isLoadingInvoices ? (
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                  </div>
                ) : invoices.length > 0 ? (
                  <>
                    {invoices.map((invoice) => (
                      <Link
                        key={invoice.id}
                        href={`/invoices/${invoice.id}`}
                        className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-muted/30 active:bg-muted/50"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-semibold text-foreground mb-1">{invoice.invoiceNumber}</p>
                          <p className="text-[13px] text-muted-foreground">
                            {formatDate(invoice.issueDate)} · {formatCurrency(invoice.totalAmount, invoice.currency)}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                      </Link>
                    ))}
                    {totalInvoices > invoices.length && (
                      <Link
                        href={`/invoices?clientId=${client.id}`}
                        className="flex items-center justify-center gap-2 px-6 py-4 text-[14px] font-medium text-primary hover:bg-muted/30 transition-colors"
                      >
                        {t('recentInvoices.viewAll', { count: totalInvoices })}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
                  </>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <p className="text-sm text-muted-foreground mb-4">{t('recentInvoices.noInvoices')}</p>
                    <Button size="sm" className="gap-2 rounded-xl" asChild>
                      <Link href={`/invoices/new?clientId=${client.id}`}>
                        <Plus className="h-4 w-4" />
                        {t('buttons.createInvoice')}
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </section>

            {/* Notes */}
            {client.notes && (
              <section className="rounded-xl border border-border/40 bg-background p-6 shadow-sm">
                <h2 className="text-[15px] font-semibold text-foreground mb-4">{t('notes.title')}</h2>
                <p className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap">{client.notes}</p>
              </section>
            )}
          </div>

          {/* Colonne droite */}
          <div className="space-y-6">
            {/* Statistiques */}
            {client.createdAt && (
              <section className="rounded-xl border border-border/40 bg-background p-6 shadow-sm">
                <h2 className="text-[15px] font-semibold text-foreground mb-4">
                  {t('statistics.title')}
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-[13px] font-medium text-muted-foreground mb-1">
                      {t('statistics.addedDate')}
                    </p>
                    <p className="text-[17px] font-semibold text-foreground">
                      {formatDate(client.createdAt)}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Revenus mensuels */}
            {clientRevenue && clientRevenue.monthlyRevenues.length > 0 && (
              <section className="rounded-xl border border-border/40 bg-background shadow-sm overflow-hidden">
                <div className="border-b border-border/30 px-6 py-4 bg-muted/20">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-[15px] font-semibold text-foreground">
                      {t('monthlyRevenue.title')}
                    </h2>
                  </div>
                  <p className="text-[13px] text-muted-foreground">{t('monthlyRevenue.description')}</p>
                </div>
                <div className="divide-y divide-border/30">
                  {isLoadingRevenue ? (
                    <div className="p-6 space-y-3">
                      <Skeleton className="h-16 w-full rounded-lg" />
                      <Skeleton className="h-16 w-full rounded-lg" />
                    </div>
                  ) : (
                    clientRevenue.monthlyRevenues.slice().reverse().map((monthData) => {
                      const date = new Date(monthData.year, monthData.month - 1, 1);
                      const monthName = date.toLocaleDateString(locale === 'fr' ? "fr-FR" : "en-US", { month: "long", year: "numeric" });
                      const revenue = monthData.revenue[0];
                      return (
                        <div
                          key={`${monthData.month}-${monthData.year}`}
                          className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-muted/30"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-[15px] font-semibold text-foreground capitalize mb-1">{monthName}</p>
                            <p className="text-[13px] text-muted-foreground">
                              {t('monthlyRevenue.invoicesSent', { count: monthData.invoicesSent })} · {t('monthlyRevenue.invoicesPaid', { paid: monthData.invoicesPaid })}
                            </p>
                          </div>
                          <p className="text-[15px] font-semibold tabular-nums text-foreground shrink-0 ml-4">
                            {revenue ? formatCurrency(revenue.amount, revenue.currency) : "—"}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            )}
          </div>
        </div>

        <div className="mt-10">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" asChild>
            <Link href="/clients">
              <ArrowLeft className="h-4 w-4" />
              {t('buttons.backToList')}
            </Link>
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{clientsT('deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {clientsT('deleteDescription', { name: client?.name ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{commonT('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? clientsT('processing') : t('buttons.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ClientModal
        open={isEditModalOpen}
        clientId={clientId}
        onClose={() => setEditModalOpen(false)}
        onSuccess={() => {
          toast.success(clientsT('updateSuccess'), {
            description: clientsT('updateSuccessDescription'),
          });
          setEditModalOpen(false);
        }}
      />
    </div>
  );
}

