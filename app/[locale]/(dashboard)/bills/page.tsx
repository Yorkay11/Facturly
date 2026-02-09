"use client";

import { Link } from '@/i18n/routing';
import { FileText, Eye } from "lucide-react";
import { useState } from "react";
import { useTranslations, useLocale } from 'next-intl';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetBillsQuery } from "@/services/facturlyApi";
import { toast } from "sonner";
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
        className: "bg-blue-100 text-blue-700 border border-blue-300",
      },
      VIEWED: {
        label: t('status.viewed'),
        className: "bg-blue-100 text-blue-700 border border-blue-300",
      },
      PAID: {
        label: t('status.paid'),
        className: "bg-emerald-100 text-emerald-700 border border-emerald-300",
      },
      OVERDUE: {
        label: t('status.overdue'),
        className: "bg-red-100 text-red-700 border border-red-300",
      },
      CANCELLED: {
        label: t('status.cancelled'),
        className: "bg-gray-100 text-gray-600 border border-gray-300",
      },
    };

    const config = statusMap[status];

    if (!config) {
      return (
        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
          {status}
        </span>
      );
    }

    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
          config.className
        )}
      >
        {config.label}
      </span>
    );
  };

  // Filtrer par recherche
  const filteredBills = bills.filter((bill) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      bill.invoice.invoiceNumber.toLowerCase().includes(query) ||
      bill.invoice.issuer?.name.toLowerCase().includes(query) ||
      ""
    );
  });

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t('breadcrumb.dashboard'), href: "/dashboard" },
          { label: t('breadcrumb.bills') },
        ]}
        className="text-xs"
      />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-foreground/60 mt-1">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t('stats.total')}</CardDescription>
            <CardTitle className="text-2xl">{totalBills}</CardTitle>
          </CardHeader>
        </Card>
            <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t('stats.pending')}</CardDescription>
            <CardTitle className="text-2xl">
              {bills.filter((b) => b.status === "RECEIVED" || b.status === "VIEWED" || b.status === "OVERDUE").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t('stats.paid')}</CardDescription>
            <CardTitle className="text-2xl">
              {bills.filter((b) => b.status === "PAID").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('list.title')}</CardTitle>
          <CardDescription>
            {t('list.description', { 
              count: totalBills, 
              plural: totalBills > 1 ? 's' : '' 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-2">
              <Input
                placeholder={t('list.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('list.filterPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('list.allStatuses')}</SelectItem>
                <SelectItem value="RECEIVED">{t('status.received')}</SelectItem>
                <SelectItem value="VIEWED">{t('status.viewed')}</SelectItem>
                <SelectItem value="PAID">{t('status.paid')}</SelectItem>
                <SelectItem value="OVERDUE">{t('status.overdue')}</SelectItem>
                <SelectItem value="CANCELLED">{t('status.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
              <p className="font-semibold">{t('errors.loadingError')}</p>
              <p>{t('errors.loadingErrorDescription')}</p>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="rounded-xl border border-border bg-secondary/60 p-6 text-center">
              <div className="mb-4">
                <FuryMascot mood="sad" size="md" />
              </div>
              <p className="text-sm font-medium text-foreground/70 mb-1">{t('empty.title')}</p>
              <p className="text-xs text-foreground/50">
                {searchQuery
                  ? t('empty.noResults')
                  : t('empty.noBills')}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.number')}</TableHead>
                    <TableHead>{t('table.supplier')}</TableHead>
                    <TableHead>{t('table.issueDate')}</TableHead>
                    <TableHead>{t('table.dueDate')}</TableHead>
                    <TableHead>{t('table.amount')}</TableHead>
                    <TableHead>{t('table.status')}</TableHead>
                    <TableHead className="text-right">{t('table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill) => (
                    <TableRow key={bill.id} className="hover:bg-primary/5">
                      <TableCell className="font-medium text-primary">
                        {bill.invoice.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/70">
                        {bill.invoice.issuer?.name || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/60">
                        {formatDate(bill.invoice.issueDate)}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/60">
                        {formatDate(bill.invoice.dueDate)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatCurrency(bill.invoice.totalAmount, bill.invoice.currency)}
                      </TableCell>
                      <TableCell>{getStatusBadge(bill.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/bills/${bill.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            {t('table.view')}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

