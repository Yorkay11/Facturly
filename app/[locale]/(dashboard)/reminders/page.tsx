"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BellRing, Mail } from "lucide-react";
import { Link } from '@/i18n/routing';
import Breadcrumb from "@/components/ui/breadcrumb";
import Skeleton from "@/components/ui/skeleton";
import { useGetInvoicesQuery } from "@/services/facturlyApi";
import ReminderModal from "@/components/modals/ReminderModal";
import { useState } from "react";
import { useTranslations, useLocale } from 'next-intl';

export default function RemindersPage() {
  const t = useTranslations('reminders');
  const locale = useLocale();
  
  const [isReminderModalOpen, setReminderModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | undefined>();

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
  
  // Calculer le montant total en EUR (simplification - en production, convertir les devises)
  const totalAmount = reminders.reduce((sum, invoice) => {
    const amount = typeof invoice.totalAmount === "string" 
      ? parseFloat(invoice.totalAmount) 
      : invoice.totalAmount;
    // TODO: Convertir les devises en EUR si nécessaire
    return sum + (amount || 0);
  }, 0);

  return (
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { label: t('breadcrumb.dashboard'), href: "/dashboard" },
          { label: t('breadcrumb.reminders') },
        ]}
        className="text-xs"
      />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-primary">{t('title')}</h1>
            <p className="mt-1 text-sm text-foreground/70">
              {t('subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              className="gap-2" 
              onClick={() => {
                setSelectedInvoiceId(undefined);
                setReminderModalOpen(true);
              }}
            >
              <BellRing className="h-4 w-4" />
              {t('buttons.create')}
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">{t('stats.active')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-semibold text-primary">{totalPending}</p>
              <p className="text-xs text-foreground/60">{t('stats.activeDescription')}</p>
            </CardContent>
          </Card>
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">{t('stats.overdueAmount')}</CardTitle>
            </CardHeader>
              <CardContent className="pt-0">
                <p className="text-2xl font-semibold text-primary">
                  {totalAmount > 0 ? formatCurrency(totalAmount, "EUR") : "—"}
                </p>
              </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-primary/20">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-primary">{t('table.title')}</CardTitle>
            <CardDescription>
              {t('table.description')}
            </CardDescription>
          </div>
          <Input placeholder={t('table.searchPlaceholder')} className="max-w-sm" />
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : isError ? (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
              {t('errors.loadingError')}
            </div>
          ) : reminders && reminders.length > 0 ? (
            <Table>
              <TableHeader className="bg-primary/5">
                <TableRow>
                  <TableHead>{t('table.invoice')}</TableHead>
                  <TableHead>{t('table.client')}</TableHead>
                  <TableHead>{t('table.dueDate')}</TableHead>
                  <TableHead className="text-right">{t('table.amount')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  <TableHead className="text-right">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reminders.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-primary/5">
                    <TableCell className="text-sm font-semibold text-primary">
                      <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                        {invoice.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-foreground/70">{invoice.client.name}</TableCell>
                    <TableCell className="text-sm text-foreground/60">{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell className="text-right text-sm font-semibold text-primary">
                      {formatCurrency(invoice.totalAmount, invoice.currency)}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-rose-100 text-rose-700 border border-rose-200">
                        {t('table.overdue')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-2 text-primary"
                        onClick={() => {
                          setSelectedInvoiceId(invoice.id);
                          setReminderModalOpen(true);
                        }}
                      >
                        <Mail className="h-4 w-4" />
                        {t('buttons.remind')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-xl border border-dashed border-primary/30 bg-white py-16 text-center text-sm text-foreground/60">
              {t('empty.noReminders')}
            </div>
          )}
        </CardContent>
      </Card>

      
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
