"use client";

import { Link } from '@/i18n/routing';
import { useParams } from "next/navigation";
import { useRouter } from '@/i18n/routing';
import { ArrowLeft, Mail, Phone, MapPin, Building2, Trash2, Plus, History, TrendingUp, Pencil } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Breadcrumb from "@/components/ui/breadcrumb";
import Skeleton from "@/components/ui/skeleton";
import ClientModal from "@/components/modals/ClientModal";
import {
  useGetClientByIdQuery,
  useGetInvoicesQuery,
  useDeleteClientMutation,
  useGetClientRevenueQuery,
} from "@/services/facturlyApi";
import { toast } from "sonner";
import { useTranslations, useLocale } from 'next-intl';
import { useState } from "react";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('clients.detail');
  const clientsT = useTranslations('clients');
  const navigationT = useTranslations('navigation');
  const commonT = useTranslations('common');
  const locale = useLocale();
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  
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
    if (!confirm(t('errors.deleteConfirm'))) {
      return;
    }

    if (!clientId) {
      toast.error(commonT('error'), {
        description: t('errors.missingIdError'),
      });
      return;
    }

    try {
      await deleteClientMutation(clientId).unwrap();
      toast.success(clientsT('deleteSuccess'), {
        description: clientsT('deleteSuccessDescription', { name: client?.name || '' }),
      });
      router.push("/clients");
    } catch (error) {
      let errorMessage = t('errors.deleteErrorGeneric');
      if (error && typeof error === "object" && error !== null && "data" in error) {
        errorMessage =
          (error.data as { message?: string })?.message ??
          t('errors.deleteError');
      }
      
      toast.error(commonT('error'), {
        description: errorMessage,
      });
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
        <div className="rounded-xl border border-destructive bg-destructive/10 p-6 text-sm text-destructive">
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
      <div className="rounded-xl border border-destructive bg-destructive/10 p-6 text-sm text-destructive">
        {t('errors.notFound')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t('breadcrumb.dashboard'), href: "/dashboard" },
          { label: t('breadcrumb.clients'), href: "/clients" },
          { label: client.name },
        ]}
        className="text-xs"
      />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          
          <h1 className="text-3xl font-semibold tracking-tight text-primary">{client.name}</h1>
          <p className="text-sm text-foreground/60">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setEditModalOpen(true)}
          >
            <Pencil className="h-4 w-4" />
            {t('buttons.edit')}
          </Button>
          <Button
            variant="outline"
            className="gap-2 text-destructive hover:!bg-destructive hover:!text-white"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
            {t('buttons.delete')}
          </Button>
          <Button className="gap-2" asChild>
            <Link href={`/invoices/new?clientId=${client.id}`}>
              <Plus className="h-4 w-4" />
              {t('buttons.createInvoice')}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('contactInfo.title')}</CardTitle>
              <CardDescription>{t('contactInfo.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {client.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary/60 mt-0.5" />
                    <div>
                      <p className="text-xs uppercase text-foreground/50">{t('contactInfo.email')}</p>
                      <a
                        href={`mailto:${client.email}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {client.email}
                      </a>
                    </div>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary/60 mt-0.5" />
                    <div>
                      <p className="text-xs uppercase text-foreground/50">{t('contactInfo.phone')}</p>
                      <a
                        href={`tel:${client.phone}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {client.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
              {(client.addressLine1 || client.city || client.country) && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary/60 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs uppercase text-foreground/50">{t('contactInfo.address')}</p>
                      <div className="text-sm text-foreground/70">
                        {client.addressLine1 && <p>{client.addressLine1}</p>}
                        {client.addressLine2 && <p>{client.addressLine2}</p>}
                        <p>
                          {client.postalCode && `${client.postalCode} `}
                          {client.city}
                          {client.city && client.country && ", "}
                          {client.country}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">{t('recentInvoices.title')}</CardTitle>
                <CardDescription>{t('recentInvoices.description')}</CardDescription>
              </div>
              <History className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isLoadingInvoices ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : invoices.length > 0 ? (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <Link
                      key={invoice.id}
                      href={`/invoices/${invoice.id}`}
                      className="block rounded-lg border border-primary/20 bg-primary/5 p-3 hover:bg-primary/10 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-primary">{invoice.invoiceNumber}</p>
                          <p className="text-xs text-foreground/60">
                            {formatDate(invoice.issueDate)} - {formatDate(invoice.dueDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-primary">
                            {formatCurrency(invoice.totalAmount, invoice.currency)}
                          </p>
                          <p className="text-xs text-foreground/60">{invoice.status}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {totalInvoices > invoices.length && (
                    <Button variant="ghost" className="w-full justify-center text-primary" asChild>
                      <Link href={`/invoices?clientId=${client.id}`}>
                        {t('recentInvoices.viewAll', { count: totalInvoices })}
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-primary/30 bg-white py-8 text-center">
                  <p className="text-sm text-foreground/60">{t('recentInvoices.noInvoices')}</p>
                  <Button variant="ghost" className="mt-2 gap-2 text-primary" asChild>
                    <Link href={`/invoices/new?clientId=${client.id}`}>
                      <Plus className="h-4 w-4" />
                      {t('buttons.createInvoice')}
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle>{t('notes.title')}</CardTitle>
                <CardDescription>{t('notes.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/70 whitespace-pre-wrap">{client.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('statistics.title')}</CardTitle>
              <CardDescription>{t('statistics.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs uppercase text-foreground/50">{t('statistics.totalInvoices')}</p>
                <p className="text-2xl font-semibold text-primary">{totalInvoices}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs uppercase text-foreground/50">{t('statistics.totalAmount')}</p>
                <p className="text-2xl font-semibold text-primary">
                  {totalAmount > 0 
                    ? formatCurrency(totalAmount, invoices[0]?.currency || "EUR")
                    : "—"
                  }
                </p>
              </div>
              {client.createdAt && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs uppercase text-foreground/50">{t('statistics.addedDate')}</p>
                    <p className="text-sm font-medium text-primary">{formatDate(client.createdAt)}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {clientRevenue && clientRevenue.monthlyRevenues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  {t('monthlyRevenue.title')}
                </CardTitle>
                <CardDescription>{t('monthlyRevenue.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRevenue ? (
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clientRevenue.monthlyRevenues.slice().reverse().map((monthData, index) => {
                      const date = new Date(monthData.year, monthData.month - 1, 1);
                      const monthName = date.toLocaleDateString(locale === 'fr' ? "fr-FR" : "en-US", { month: "long", year: "numeric" });
                      const revenue = monthData.revenue[0];
                      
                      return (
                        <div
                          key={`${monthData.month}-${monthData.year}`}
                          className="rounded-lg border border-primary/20 bg-primary/5 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-primary capitalize">{monthName}</p>
                              <p className="text-xs text-foreground/60">
                                {t('monthlyRevenue.invoicesSent', { count: monthData.invoicesSent })} • {t('monthlyRevenue.invoicesPaid', { paid: monthData.invoicesPaid })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-primary">
                                {revenue
                                  ? formatCurrency(revenue.amount, revenue.currency)
                                  : "—"}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          
        </div>
      </div>
      
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

