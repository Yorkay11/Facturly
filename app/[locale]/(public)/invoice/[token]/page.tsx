"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from '@/i18n/routing';
import Image from "next/image";
import { CheckCircle2, AlertCircle, FileText, XCircle, Check, X, Loader2, Maximize2, Download, Share2 } from "lucide-react";
import { useState, useEffect } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Skeleton from "@/components/ui/skeleton";
import {
  useGetPublicInvoiceQuery,
  useAcceptPublicInvoiceMutation,
} from "@/services/facturlyApi";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { InvoiceStatusBadge } from "@/components/invoices/InvoiceStatusBadge";
import { RejectInvoiceModal } from "@/components/modals/RejectInvoiceModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTranslations, useLocale } from 'next-intl';
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { getFrontendTemplateFromBackend, invoiceTemplates } from "@/types/invoiceTemplate";
import { Redirect } from '@/components/navigation';

export default function PublicInvoicePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('public.invoice');
  const commonT = useTranslations('common');
  const locale = useLocale();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [monerooUrl, setMonerooUrl] = useState<string | null>(null);

  // Détecter si on est sur un grand écran (md et plus)
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.matchMedia("(min-width: 768px)").matches);
    };
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const rawToken = params?.token;
  const token =
    typeof rawToken === "string" && rawToken !== "undefined" && rawToken.trim() !== ""
      ? rawToken
      : undefined;

  const { data: invoiceData, isLoading, isError, error, refetch } = useGetPublicInvoiceQuery(
    token || "",
    { skip: !token }
  );

  // Gérer le retour de Moneroo après paiement
  useEffect(() => {
    const monerooStatus = searchParams?.get('paymentStatus');
    const paymentId = searchParams?.get('paymentId');
    
    const finalStatus = monerooStatus;
    
    if (!finalStatus) return;
    
    refetch();
    
    if (finalStatus === 'success') {
      toast.success(t('toasts.paymentSuccess') || 'Paiement réussi', {
        description: t('toasts.paymentSuccessDescription') || 'Votre paiement a été traité avec succès. Merci !',
        duration: 5000,
      });
    } else if (finalStatus === 'cancelled') {
      toast.info(t('toasts.paymentCancelled') || 'Paiement annulé', {
        description: t('toasts.paymentCancelledDescription') || 'Le paiement a été annulé. Vous pouvez réessayer à tout moment.',
        duration: 5000,
      });
    } else if (finalStatus === 'failed') {
      toast.error(t('toasts.paymentFailed') || 'Paiement échoué', {
        description: t('toasts.paymentFailedDescription') || 'Le paiement a échoué. Veuillez réessayer ou contacter le support.',
        duration: 5000,
      });
    } else if (finalStatus === 'pending') {
      toast.info(t('toasts.paymentPending') || 'Paiement en attente', {
        description: t('toasts.paymentPendingDescription') || 'Votre paiement est en cours de traitement. Vous serez notifié une fois confirmé.',
        duration: 5000,
      });
    }
    
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [searchParams, refetch, t]);
  const [acceptInvoice, { isLoading: isAccepting }] = useAcceptPublicInvoiceMutation();

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

  const handleAcceptClick = () => {
    // Soft Commitment : Afficher la confirmation avant de procéder au paiement
    setShowCommitmentModal(true);
  };

  const handleAcceptConfirm = async () => {
    if (!token || !invoiceData) return;

    setShowCommitmentModal(false);

    try {
      const response = await acceptInvoice(token).unwrap();
      
      toast.success(t('toasts.accepted'), {
        description: t('toasts.acceptedDescription'),
      });
      
      const checkoutUrl = response.checkoutUrl || response.paymentLink;
      
      const isMonerooUrl = checkoutUrl && (
        checkoutUrl.includes('checkout.moneroo.io') || 
        checkoutUrl.includes('api.moneroo.io') ||
        checkoutUrl.includes('moneroo.io')
      );
      
      if (checkoutUrl && isMonerooUrl) {
        // Déclencher la redirection avec loader
        setMonerooUrl(checkoutUrl);
      } else {
        toast.error(commonT('error'), {
          description: 'Impossible d\'initialiser le paiement. Veuillez contacter le support.',
        });
      }
    } catch (error) {
      let errorMessage = t('toasts.acceptError');
      if (error && typeof error === "object" && error !== null && "data" in error) {
        errorMessage = (error.data as { message?: string })?.message ?? errorMessage;
      }
      toast.error(commonT('error'), {
        description: errorMessage,
      });
    }
  };

  const handleRejectClick = () => {
    setShowRejectModal(true);
  };

  const handleRejectSuccess = () => {
    setShowRejectModal(false);
    refetch();
    toast.success(t('toasts.rejected'), {
      description: t('toasts.rejectedDescription'),
    });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-slate-900">{t('errors.invalidToken')}</CardTitle>
            <CardDescription className="text-base mt-2">
              {t('errors.invalidTokenDescription')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-center">
            <Skeleton className="h-12 w-48 rounded-lg" />
          </div>
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-8 p-8">
              <div className="space-y-8">
                <div className="flex items-center justify-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-xl" />
                  <Skeleton className="h-12 w-72" />
                </div>
                <Skeleton className="h-[600px] w-full rounded-xl" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isError || !invoiceData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-slate-900">{t('errors.error')}</CardTitle>
            <CardDescription className="text-base mt-2">
              {error && typeof error === "object" && "data" in error
                ? (error.data as { message?: string })?.message ||
                  t('errors.loadError')
                : t('errors.notFound')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const invoice = invoiceData.invoice;
  const items = invoice.items ?? [];
  const isQuote = invoice.status === "quote";
  const isPaid = invoiceData.isPaid || invoice.status === "paid";
  const isRejected = invoiceData.isRejected || invoice.status === "cancelled" || invoice.rejectedAt;
  const isExpired = invoiceData.isExpired || (isQuote && invoice.validUntil && new Date(invoice.validUntil) < new Date());
  const canAccept = invoiceData.canAccept && !isPaid && !isRejected && !isExpired;
  const canPay = invoiceData.canPay && !isPaid && !canAccept;
  const documentTitle = isQuote ? t('documentTitleQuote') : commonT('invoice');
  const acceptButtonLabel = isQuote ? t('actions.acceptQuote') : t('actions.accept');

  const backendTemplateName = invoice.templateName || "invoice";
  const frontendTemplate = getFrontendTemplateFromBackend(backendTemplateName);
  const template = {
    accentColor: frontendTemplate.accentColor,
    backgroundColor: frontendTemplate.backgroundColor || "#ffffff",
    textColor: frontendTemplate.textColor || "#1F1B2E",
    name: frontendTemplate.name,
  };

  // Fonction pour rendre la facture
  const renderInvoiceContent = () => (
    <div
      className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden"
      style={{
        backgroundColor: template.backgroundColor || "#fff",
        color: template.textColor || "#1F1B2E",
      }}
    >
      {/* Header avec gradient */}
      <div 
        className="px-8 py-10 bg-gradient-to-br from-slate-50 to-white border-b border-slate-200/60"
        style={{ borderBottomColor: `${template.accentColor}20` }}
      >
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
          {/* Émetteur */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3" style={{ color: template.accentColor }}>
              {t('labels.issuer')}
            </p>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900" style={{ color: template.textColor }}>
                {invoice.issuer?.name || "N/A"}
              </h2>
              {invoice.issuer?.legalName && (
                <p className="text-sm text-slate-600">{invoice.issuer.legalName}</p>
              )}
              {invoice.issuer?.addressLine1 && (
                <div className="text-sm text-slate-500 leading-relaxed space-y-1">
                  <p>{invoice.issuer.addressLine1}</p>
                  {invoice.issuer.addressLine2 && <p>{invoice.issuer.addressLine2}</p>}
                  {(invoice.issuer.postalCode || invoice.issuer.city || invoice.issuer.country) && (
                    <p>
                      {invoice.issuer.postalCode && `${invoice.issuer.postalCode} `}
                      {invoice.issuer.city}
                      {invoice.issuer.country && `, ${invoice.issuer.country}`}
                    </p>
                  )}
                </div>
              )}
              {invoice.issuer?.email && (
                <p className="text-sm text-slate-500 mt-3">{invoice.issuer.email}</p>
              )}
            </div>
          </div>

          {/* Informations de facture */}
          <div className="flex flex-col items-start md:items-end gap-6">
            <div className="text-left md:text-right space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{t('labels.number')}</p>
                <p className="text-xl font-bold" style={{ color: template.accentColor }}>
                  {invoice.invoiceNumber}
                </p>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">{t('labels.issuedOn')}</p>
                  <p className="text-sm font-semibold text-slate-900">{formatDate(invoice.issueDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">{t('labels.dueDate')}</p>
                  <p className="text-sm font-semibold text-slate-900">{formatDate(invoice.dueDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Destinataire */}
      <div className="px-8 py-8 border-b border-slate-200/60">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3" style={{ color: template.accentColor }}>
            {t('labels.recipient')}
          </p>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900" style={{ color: template.textColor }}>
              {invoice.recipient?.name || "N/A"}
            </h3>
            {invoice.recipient?.email && (
              <p className="text-sm text-slate-600">{invoice.recipient.email}</p>
            )}
            {invoice.recipient?.addressLine1 && (
              <div className="text-sm text-slate-500 leading-relaxed">
                <p>{invoice.recipient.addressLine1}</p>
                {(invoice.recipient.city || invoice.recipient.country) && (
                  <p>
                    {invoice.recipient.city}
                    {invoice.recipient.country && `, ${invoice.recipient.country}`}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table des articles */}
      <div className="px-8 py-8">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200/60 hover:bg-transparent">
              <TableHead className="text-sm font-semibold text-slate-700 py-4" style={{ color: template.accentColor }}>
                {t('labels.description')}
              </TableHead>
              <TableHead className="text-right text-sm font-semibold text-slate-700 py-4" style={{ color: template.accentColor }}>
                {t('labels.quantity')}
              </TableHead>
              <TableHead className="text-right text-sm font-semibold text-slate-700 py-4" style={{ color: template.accentColor }}>
                {t('labels.unitPrice')}
              </TableHead>
              <TableHead className="text-right text-sm font-semibold text-slate-700 py-4" style={{ color: template.accentColor }}>
                {t('labels.total')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
              items.map((item, index) => (
                <TableRow key={item.id} className="border-slate-200/60 hover:bg-slate-50/50 transition-colors">
                  <TableCell className="py-5 text-base text-slate-900">{item.description}</TableCell>
                  <TableCell className="text-right py-5 text-base text-slate-700">{item.quantity}</TableCell>
                  <TableCell className="text-right py-5 text-base text-slate-600">
                    {formatCurrency(item.unitPrice, invoice.currency)}
                  </TableCell>
                  <TableCell className="text-right py-5 text-base font-semibold text-slate-900">
                    {formatCurrency(item.totalAmount, invoice.currency)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center text-sm text-slate-500">
                  {t('empty.noItems')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter className="bg-slate-50/50">
            <TableRow className="border-slate-200/60">
              <TableCell colSpan={3} className="text-right text-sm font-semibold text-slate-700 py-4">
                {t('labels.subtotalHT')}
              </TableCell>
              <TableCell className="text-right text-base font-semibold text-slate-900 py-4">
                {formatCurrency(invoice.subtotalAmount, invoice.currency)}
              </TableCell>
            </TableRow>
            {parseFloat(invoice.taxAmount ?? "0") > 0 && (
              <TableRow className="border-slate-200/60">
                <TableCell colSpan={3} className="text-right text-sm font-semibold text-slate-700 py-3">
                  {t('labels.vat')}
                </TableCell>
                <TableCell className="text-right text-base font-semibold text-slate-900 py-3">
                  {formatCurrency(invoice.taxAmount, invoice.currency)}
                </TableCell>
              </TableRow>
            )}
            {invoice.amountPaid !== "0.00" && (
              <>
                <TableRow className="border-slate-200/60">
                  <TableCell colSpan={3} className="text-right text-sm font-semibold text-slate-700 py-3">
                    {t('labels.amountPaid')}
                  </TableCell>
                  <TableCell className="text-right text-base font-semibold text-green-600 py-3">
                    {formatCurrency(invoice.amountPaid, invoice.currency)}
                  </TableCell>
                </TableRow>
                <TableRow className="border-slate-200/60">
                  <TableCell colSpan={3} className="text-right text-sm font-semibold text-slate-700 py-3">
                    {t('labels.remaining')}
                  </TableCell>
                  <TableCell className="text-right text-base font-semibold text-slate-900 py-3">
                    {formatCurrency(invoice.remainingAmount, invoice.currency)}
                  </TableCell>
                </TableRow>
              </>
            )}
            <TableRow className="bg-slate-900 border-slate-200/60">
              <TableCell colSpan={3} className="text-right text-base font-bold text-white py-5">
                {t('labels.totalTTC')}
              </TableCell>
              <TableCell className="text-right text-2xl font-bold text-white py-5" style={{ color: template.accentColor }}>
                {formatCurrency(invoice.totalAmount, invoice.currency)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="px-8 py-8 border-t border-slate-200/60 bg-slate-50/30">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500" style={{ color: template.accentColor }}>
              {t('labels.notes')}
            </p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        </div>
      )}
    </div>
  );

  // Redirection vers Moneroo avec loader
  if (monerooUrl) {
    return (
      <Redirect
        to={monerooUrl}
        type="external"
        checkUnsavedChanges={false}
        showLoader={true}
        loaderType="processing"
        loaderText={commonT('redirectingToPayment')}
        delay={500}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header minimaliste */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image
                src="/logos/logo.png"
                alt="Facturly"
                width={120}
                height={40}
                className="h-8 w-auto object-contain"
                priority
              />
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                onClick={() => setIsFullscreenOpen(true)}
                title={t('actions.maximize')}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Titre et statut */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                {documentTitle} {invoice.invoiceNumber}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <InvoiceStatusBadge status={invoice.status} />
                {isPaid && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1.5" />
                    {t('status.paid')}
                  </Badge>
                )}
                {isRejected && (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1.5" />
                    {t('status.rejected')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Layout principal */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Facture */}
          <div>
            {renderInvoiceContent()}
          </div>

          {/* Actions sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg sticky top-24">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900">{t('actions.title')}</CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  {isPaid
                    ? t('actions.paidDescription')
                    : isRejected
                    ? t('actions.rejectedDescription')
                    : canAccept
                    ? t('actions.canAcceptDescription')
                    : t('actions.noActionDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status Messages */}
                {isPaid && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="h-5 w-5" />
                      <p className="font-semibold text-sm">{t('paid.title')}</p>
                    </div>
                    <p className="text-sm text-green-700 leading-relaxed">
                      {t('paid.description', { amount: formatCurrency(invoice.totalAmount, invoice.currency) })}
                    </p>
                    {invoice.payments && invoice.payments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-green-200 space-y-2">
                        {invoice.payments.map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between text-xs text-green-700 bg-white/60 rounded px-2 py-1.5">
                            <span className="font-medium">{formatCurrency(payment.amount, payment.currency || invoice.currency)}</span>
                            <span className="text-green-600">{formatDate(payment.paidAt || payment.paymentDate || '')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {isRejected && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-red-700">
                      <XCircle className="h-5 w-5" />
                      <p className="font-semibold text-sm">{t('paid.rejectedTitle')}</p>
                    </div>
                    {invoice.rejectionComment && (
                      <div className="text-sm text-red-700 bg-white/60 rounded p-3">
                        <p className="font-semibold mb-1">{t('paid.comment')} :</p>
                        <p className="whitespace-pre-wrap leading-relaxed">{invoice.rejectionComment}</p>
                      </div>
                    )}
                    {invoice.rejectionReason && (
                      <div className="text-xs text-red-600 bg-white/60 rounded px-2 py-1.5">
                        <span className="font-semibold">{t('paid.reason')} :</span> {invoice.rejectionReason}
                      </div>
                    )}
                    {invoice.rejectedAt && (
                      <div className="text-xs text-red-600">
                        {t('paid.rejectedOn', { date: formatDate(invoice.rejectedAt) })}
                      </div>
                    )}
                  </div>
                )}

                {isExpired && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-amber-700">
                      <AlertCircle className="h-5 w-5" />
                      <p className="font-semibold text-sm">{t('expired.title')}</p>
                    </div>
                    <p className="text-sm text-amber-700 leading-relaxed">
                      {t('expired.description', { 
                        date: invoice.validUntil ? formatDate(invoice.validUntil) : '' 
                      })}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                {canAccept && (
                  <div className="space-y-3">
                    <Button
                      className="w-full h-11 text-base font-semibold bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all"
                      onClick={handleAcceptClick}
                      disabled={isAccepting}
                      size="lg"
                    >
                      {isAccepting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t('actions.accepting')}
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          {acceptButtonLabel}
                        </>
                      )}
                    </Button>
                    <Button
                      className="w-full h-11 text-base font-semibold"
                      variant="destructive"
                      onClick={handleRejectClick}
                      size="lg"
                    >
                      <X className="h-4 w-4 mr-2 text-white" />
                      {t('actions.reject')}
                    </Button>
                  </div>
                )}

                {canPay && !isPaid && !isRejected && (
                  <div className="space-y-3">
                    <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 mb-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-900">Montant à payer</span>
                        <span className="text-xl font-bold" style={{ color: template.accentColor }}>
                          {formatCurrency(invoice.remainingAmount || invoice.totalAmount, invoice.currency)}
                        </span>
                      </div>
                    </div>
                    <Button
                      className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      onClick={handleAcceptClick}
                      disabled={isAccepting}
                      size="lg"
                    >
                      {isAccepting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          {t('actions.accepting')}
                        </>
                      ) : (
                        <>
                          <span className="text-2xl mr-2">💳</span>
                          {t('actions.payNow')}
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-center text-slate-500">
                      Paiement sécurisé via Moneroo
                    </p>
                  </div>
                )}

                {!canAccept && !canPay && !isPaid && !isRejected && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                    <div className="flex items-center gap-2 text-amber-700 mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <p className="font-semibold text-sm">{t('actions.unavailable')}</p>
                    </div>
                    <p className="text-sm text-amber-700 leading-relaxed">
                      {t('actions.unavailableDescription')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Reject Invoice Modal */}
      {token && (
        <RejectInvoiceModal
          open={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          onSuccess={handleRejectSuccess}
          token={token}
        />
      )}

      {/* Soft Commitment Modal */}
      <Dialog open={showCommitmentModal} onOpenChange={setShowCommitmentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {isQuote ? t('commitment.quoteTitle') : t('commitment.invoiceTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              {isQuote 
                ? t('commitment.quoteMessage', { 
                    amount: formatCurrency(invoice.totalAmount, invoice.currency),
                    number: invoice.invoiceNumber
                  })
                : t('commitment.invoiceMessage', { 
                    amount: formatCurrency(invoice.totalAmount, invoice.currency),
                    number: invoice.invoiceNumber
                  })}
            </p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-slate-900">{t('commitment.confirmation')}</p>
                  <p className="text-slate-600">{t('commitment.legalNote')}</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCommitmentModal(false)}
            >
              {t('commitment.cancel')}
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleAcceptConfirm}
              disabled={isAccepting}
            >
              {isAccepting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('actions.accepting')}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {t('commitment.confirm')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Invoice Sheet */}
      {isLargeScreen && (
        <Sheet open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
          <SheetContent side="bottom" className="h-[95vh] w-full max-w-full overflow-y-auto p-0 bg-slate-50">
            <SheetHeader className="px-6 pt-6 pb-4 bg-white border-b border-slate-200 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-slate-600" />
                  <SheetTitle className="text-xl font-semibold text-slate-900">
                    {documentTitle} {invoice.invoiceNumber}
                  </SheetTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFullscreenOpen(false)}
                  className="hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto">
                {renderInvoiceContent()}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
