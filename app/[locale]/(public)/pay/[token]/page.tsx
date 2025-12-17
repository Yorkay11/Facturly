"use client";

import { useParams } from "next/navigation";
import { useRouter } from '@/i18n/routing';
import { CreditCard, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { useState } from "react";

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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Skeleton from "@/components/ui/skeleton";
import { useGetPublicInvoiceQuery, usePayPublicInvoiceMutation } from "@/services/facturlyApi";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useTranslations, useLocale } from 'next-intl';
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import Image from "next/image";

export default function PublicPayPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('public.pay');
  const commonT = useTranslations('common');
  const locale = useLocale();
  const [paymentMethod, setPaymentMethod] = useState("online_payment");
  const [paymentEmail, setPaymentEmail] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  const rawToken = params?.token;
  const token = typeof rawToken === "string" && rawToken !== "undefined" && rawToken.trim() !== "" 
    ? rawToken 
    : undefined;

  const { data: invoiceData, isLoading, isError, error } = useGetPublicInvoiceQuery(
    token || "",
    { skip: !token }
  );
  const [payInvoice, { isLoading: isPaying }] = usePayPublicInvoiceMutation();

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const formatCurrency = (value: string | number, currency: string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(numValue);
  };

  const handlePay = async () => {
    if (!token || !invoiceData) return;

    try {
      await payInvoice({
        token,
        payload: {
          method: paymentMethod,
          email: paymentEmail || undefined,
          notes: paymentNotes || undefined,
        },
      }).unwrap();
      toast.success(t('toasts.success'), {
        description: t('toasts.successDescription', { amount: formatCurrency(invoiceData.invoice.totalAmount, invoiceData.invoice.currency) }),
      });
      // Recharger les données pour voir le statut mis à jour
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      let errorMessage = t('toasts.error');
      if (error && typeof error === "object" && error !== null && "data" in error) {
        errorMessage = (error.data as { message?: string })?.message ?? errorMessage;
      }
      toast.error(commonT('error'), {
        description: errorMessage,
      });
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">{t('errors.invalidToken')}</CardTitle>
            <CardDescription>{t('errors.invalidTokenDescription')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
        <Card className="w-full max-w-4xl">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !invoiceData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertCircle className="h-5 w-5" />
              <CardTitle className="text-destructive">{t('errors.error')}</CardTitle>
            </div>
            <CardDescription>
              {error && typeof error === "object" && "data" in error
                ? (error.data as { message?: string })?.message || t('errors.loadError')
                : t('errors.notFound')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const invoice = invoiceData.invoice;
  const items = invoice.items ?? [];
  const isPaid = invoice.status === "paid";
  const canPay = invoiceData.canPay && !isPaid;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 p-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header avec logo et sélecteur de langue */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1"></div>
          <div className="bg-white/80 backdrop-blur-sm rounded-md p-3">
            <Image
              src="/logos/logo.png"
              alt="Facturly"
              width={120}
              height={40}
              className="h-8 w-auto object-contain"
              priority
            />
          </div>
          <div className="flex-1 flex justify-end">
            <LanguageSwitcher />
          </div>
        </div>

        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-semibold tracking-tight">{t('title', { number: invoice.invoiceNumber })}</h1>
          </div>
          {isPaid && (
            <Badge variant="secondary" className="text-base px-4 py-2">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {t('status.paid')}
            </Badge>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="border-primary/20">
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-primary">{t('details.title')}</CardTitle>
                <CardDescription>{t('details.description')}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs uppercase text-foreground/50">{t('details.issuer')}</p>
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
                <p className="text-xs uppercase text-foreground/50">{t('details.totalAmount')}</p>
                <p className="text-sm font-semibold text-primary">
                  {formatCurrency(invoice.totalAmount, invoice.currency)}
                </p>
                <p className="text-xs text-foreground/60">
                  {t('details.remaining', { amount: formatCurrency(invoice.remainingAmount, invoice.currency) })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase text-foreground/50">{t('details.issueDate')}</p>
                <p className="text-sm text-foreground">{formatDate(invoice.issueDate)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase text-foreground/50">{t('details.dueDate')}</p>
                <p className="text-sm text-foreground">{formatDate(invoice.dueDate)}</p>
              </div>
            </CardContent>
            <Separator className="mx-6" />
            <CardContent className="space-y-4">
              <Table>
                <TableHeader className="bg-primary/5">
                  <TableRow>
                    <TableHead>{t('details.description')}</TableHead>
                    <TableHead className="text-right">{t('details.quantity')}</TableHead>
                    <TableHead className="text-right">{t('details.unitPrice')}</TableHead>
                    <TableHead className="text-right">{t('details.total')}</TableHead>
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
                        {t('details.noItems')}
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
                {isPaid
                  ? t('payment.paidDescription', { amount: formatCurrency(invoice.totalAmount, invoice.currency) })
                  : canPay
                  ? t('payment.canPayDescription')
                  : t('payment.cannotPayDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isPaid ? (
                <div className="space-y-2 rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="font-semibold">{t('payment.paidTitle')}</p>
                  </div>
                  <p className="text-sm text-green-600">
                    {t('payment.paidDescription', { amount: formatCurrency(invoice.totalAmount, invoice.currency) })}
                  </p>
                </div>
              ) : canPay ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment-method">{t('payment.method')}</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger id="payment-method">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online_payment">{t('payment.methods.online')}</SelectItem>
                        <SelectItem value="bank_transfer">{t('payment.methods.bankTransfer')}</SelectItem>
                        <SelectItem value="check">{t('payment.methods.check')}</SelectItem>
                        <SelectItem value="cash">{t('payment.methods.cash')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment-email">{t('payment.email')}</Label>
                    <Input
                      id="payment-email"
                      type="email"
                      placeholder={t('payment.emailPlaceholder')}
                      value={paymentEmail}
                      onChange={(e) => setPaymentEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment-notes">{t('payment.notes')}</Label>
                    <Textarea
                      id="payment-notes"
                      placeholder={t('payment.notesPlaceholder')}
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-foreground/70">{t('payment.amountToPay')}</span>
                      <span className="text-lg font-semibold text-primary">
                        {formatCurrency(invoice.remainingAmount, invoice.currency)}
                      </span>
                    </div>
                  </div>
                  <Button
                    className="w-full gap-2"
                    onClick={handlePay}
                    disabled={isPaying}
                    size="lg"
                  >
                    <CreditCard className="h-4 w-4" />
                    {isPaying ? t('payment.processing') : t('payment.payNow')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <AlertCircle className="h-5 w-5" />
                    <p className="font-semibold">{t('payment.unavailable')}</p>
                  </div>
                  <p className="text-sm text-yellow-600">
                    {t('payment.unavailableDescription')}
                  </p>
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
    </div>
  );
}

