"use client";

import { Link } from '@/i18n/routing';
import { useParams } from "next/navigation";
import { useRouter } from '@/i18n/routing';
import { ArrowLeft, CreditCard, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useTranslations, useLocale } from 'next-intl';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Skeleton from "@/components/ui/skeleton";
import { useGetBillByIdQuery, usePayBillMutation } from "@/services/facturlyApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Breadcrumb from "@/components/ui/breadcrumb";


export default function BillDetailPage() {
  const t = useTranslations('bills.detail');
  const billsT = useTranslations('bills');
  const commonT = useTranslations('common');
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [paymentNotes, setPaymentNotes] = useState("");

  const rawId = params?.id;
  const billId = typeof rawId === "string" && rawId !== "undefined" && rawId.trim() !== "" 
    ? rawId 
    : undefined;

  const { data: bill, isLoading, isError } = useGetBillByIdQuery(
    billId || "",
    { skip: !billId }
  );
  const [payBill, { isLoading: isPaying }] = usePayBillMutation();

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

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      RECEIVED: {
        label: billsT('status.received'),
        className: "bg-blue-100 text-blue-700 border border-blue-300",
      },
      VIEWED: {
        label: billsT('status.viewed'),
        className: "bg-blue-100 text-blue-700 border border-blue-300",
      },
      PAID: {
        label: billsT('status.paid'),
        className: "bg-emerald-100 text-emerald-700 border border-emerald-300",
      },
      OVERDUE: {
        label: billsT('status.overdue'),
        className: "bg-red-100 text-red-700 border border-red-300",
      },
      CANCELLED: {
        label: billsT('status.cancelled'),
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

  const handlePay = async () => {
    if (!billId || !bill) return;

    try {
      await payBill({
        id: billId,
        payload: {
          method: paymentMethod,
          notes: paymentNotes || undefined,
        },
      }).unwrap();
      toast.success(t('payment.success'), {
        description: t('payment.successDescription', { invoiceNumber: bill.invoice.invoiceNumber }),
      });
      router.push("/bills");
    } catch (error) {
      let errorMessage = t('payment.error');
      if (error && typeof error === "object" && error !== null && "data" in error) {
        errorMessage = (error.data as { message?: string })?.message ?? errorMessage;
      }
      toast.error(commonT('error'), {
        description: errorMessage,
      });
    }
  };

  if (!billId) {
    return (
      <div className="space-y-4">
        <Breadcrumb
          items={[
            { label: billsT('breadcrumb.dashboard'), href: "/dashboard" },
            { label: billsT('breadcrumb.bills'), href: "/bills" },
            { label: t('breadcrumb.details') },
          ]}
          className="text-xs"
        />
        <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-semibold mb-2">{t('errors.invalidId')}</p>
          <p className="mb-4">{t('errors.invalidIdDescription')}</p>
          <Button variant="outline" onClick={() => router.push("/bills")}>
            {t('errors.backToList')}
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !bill) {
    return (
      <div className="space-y-4">
        <Breadcrumb
          items={[
            { label: billsT('breadcrumb.dashboard'), href: "/dashboard" },
            { label: billsT('breadcrumb.bills'), href: "/bills" },
            { label: t('breadcrumb.details') },
          ]}
          className="text-xs"
        />
        <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-semibold mb-2">{t('errors.loadingError')}</p>
          <p className="mb-4">{t('errors.loadingErrorDescription')}</p>
          <Button variant="outline" onClick={() => router.push("/bills")}>
            {t('errors.backToList')}
          </Button>
        </div>
      </div>
    );
  }

  const invoice = bill.invoice;
  const items = invoice.items ?? [];
  const isPaid = bill.status === "PAID";

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: billsT('breadcrumb.dashboard'), href: "/dashboard" },
          { label: billsT('breadcrumb.bills'), href: "/bills" },
          { label: invoice.invoiceNumber },
        ]}
        className="text-xs"
      />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <h1 className="text-3xl font-semibold tracking-tight">{invoice.invoiceNumber}</h1>
            {getStatusBadge(bill.status)}
          </div>
          <p className="text-sm text-foreground/70">
            {t('title.description', { 
              supplier: invoice.issuer?.name || "N/A",
              amount: formatCurrency(invoice.totalAmount, invoice.currency)
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={() => router.push("/bills")}>
            <ArrowLeft className="h-4 w-4" />
            {t('buttons.back')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="border-primary/20">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-primary">{t('summary.title')}</CardTitle>
              <CardDescription>{t('summary.description')}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs uppercase text-foreground/50">{t('summary.supplier')}</p>
              <p className="text-sm font-semibold text-foreground">{invoice.issuer?.name || "N/A"}</p>
              {invoice.issuer?.addressLine1 && (
                <p className="text-xs text-foreground/60">
                  {invoice.issuer.addressLine1}
                  {invoice.issuer.city && `, ${invoice.issuer.city}`}
                  {invoice.issuer.country && `, ${invoice.issuer.country}`}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase text-foreground/50">{t('summary.amount')}</p>
              <p className="text-sm font-semibold text-primary">
                {formatCurrency(invoice.totalAmount, invoice.currency)}
              </p>
              <p className="text-xs text-foreground/60">
                {t('summary.paid', { amount: formatCurrency(invoice.amountPaid, invoice.currency) })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase text-foreground/50">{t('summary.issueDate')}</p>
              <p className="text-sm text-foreground">{formatDate(invoice.issueDate)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase text-foreground/50">{t('summary.dueDate')}</p>
              <p className="text-sm text-foreground">{formatDate(invoice.dueDate)}</p>
            </div>
          </CardContent>
          <Separator className="mx-6" />
          <CardContent className="space-y-4">
            <Table>
              <TableHeader className="bg-primary/5">
                <TableRow>
                  <TableHead>{t('items.description')}</TableHead>
                  <TableHead className="text-right">{t('items.quantity')}</TableHead>
                  <TableHead className="text-right">{t('items.unitPrice')}</TableHead>
                  <TableHead className="text-right">{t('items.total')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length > 0 ? (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-sm text-foreground/80">{item.description}</TableCell>
                      <TableCell className="text-right text-sm text-foreground/60">{item.quantity}</TableCell>
                      <TableCell className="text-right text-sm text-foreground/60">
                        {formatCurrency(item.unitPrice, invoice.currency)}
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold text-primary">
                        {formatCurrency(item.totalAmount, invoice.currency)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-foreground/60">
                      {t('items.empty')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-primary/20 self-start">
          <CardHeader>
            <CardTitle className="text-primary">{t('payment.title')}</CardTitle>
            <CardDescription>
              {isPaid ? t('payment.paidDescription') : t('payment.unpaidDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPaid ? (
              <div className="space-y-2 rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="font-semibold">{t('payment.paid')}</p>
                </div>
                {bill.payment && (
                  <div className="space-y-1 text-sm text-green-600">
                    <p>{t('payment.method', { method: t(`paymentMethods.${bill.payment.method}`) })}</p>
                    <p>{t('payment.date', { date: formatDate(bill.payment.paidAt) })}</p>
                    <p>{t('payment.amount', { amount: formatCurrency(bill.payment.amount, bill.payment.currency) })}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payment-method">{t('payment.methodLabel')}</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger id="payment-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">{t('paymentMethods.bank_transfer')}</SelectItem>
                      <SelectItem value="check">{t('paymentMethods.check')}</SelectItem>
                      <SelectItem value="cash">{t('paymentMethods.cash')}</SelectItem>
                      <SelectItem value="online_payment">{t('paymentMethods.online_payment')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-notes">{t('payment.notesLabel')}</Label>
                  <Textarea
                    id="payment-notes"
                    placeholder={t('payment.notesPlaceholder')}
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button
                  className="w-full gap-2"
                  onClick={handlePay}
                  disabled={isPaying}
                >
                  <CreditCard className="h-4 w-4" />
                  {isPaying ? t('payment.processing') : t('payment.markAsPaid')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {invoice.notes && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">{t('notes.title')}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground/70">
            <p className="whitespace-pre-wrap">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

