"use client";

import { useParams } from "next/navigation";
import { useRouter } from '@/i18n/routing';
import Image from "next/image";
import { CheckCircle2, AlertCircle, FileText, XCircle, Check, X, Loader2, Maximize2 } from "lucide-react";
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

export default function PublicInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('public.invoice');
  const commonT = useTranslations('common');
  const locale = useLocale();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

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

  const handleAccept = async () => {
    if (!token || !invoiceData) return;

    try {
      const response = await acceptInvoice(token).unwrap();
      toast.success(t('toasts.accepted'), {
        description: t('toasts.acceptedDescription'),
      });
      // Rediriger vers la page de paiement
      // Extraire le token du paymentLink (format: http://.../public/pay/:token)
      // Le paymentLink peut être une URL complète ou juste le chemin
      const paymentLink = response.paymentLink;
      // Extraire le token du lien (format: /pay/:token ou /public/pay/:token)
      const paymentTokenMatch = paymentLink.match(/\/pay\/([^/?]+)/);
      const paymentToken = paymentTokenMatch ? paymentTokenMatch[1] : token;
      
      // Rediriger vers la page de paiement
      router.push(`/pay/${paymentToken}`);
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
    // Recharger les données pour voir le statut mis à jour
    refetch();
    toast.success(t('toasts.rejected'), {
      description: t('toasts.rejectedDescription'),
    });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-primary/10 p-4">
        <Card className="w-full max-w-md bg-gradient-to-br from-red-50 to-white">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 text-destructive mb-2">
              <div className="p-2 rounded-full bg-red-200">
                <AlertCircle className="h-5 w-5" />
              </div>
              <CardTitle className="text-destructive text-xl">{t('errors.invalidToken')}</CardTitle>
            </div>
            <CardDescription className="text-base leading-relaxed">
              {t('errors.invalidTokenDescription')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-primary/10 p-4">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          <div className="flex justify-center mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-md p-4">
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
          <Card>
            <CardContent className="pt-6 p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <Skeleton className="h-10 w-64" />
                </div>
                <Skeleton className="h-96 w-full rounded-md" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isError || !invoiceData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-primary/10 p-4">
        <Card className="w-full max-w-md bg-gradient-to-br from-red-50 to-white">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 text-destructive mb-2">
              <div className="p-2 rounded-full bg-red-200">
                <AlertCircle className="h-5 w-5" />
              </div>
              <CardTitle className="text-destructive text-xl">{t('errors.error')}</CardTitle>
            </div>
            <CardDescription className="text-base leading-relaxed">
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
  const isPaid = invoiceData.isPaid || invoice.status === "paid";
  const isRejected = invoiceData.isRejected || invoice.status === "cancelled" || invoice.rejectedAt;
  const canAccept = invoiceData.canAccept && !isPaid && !isRejected;
  // canPay signifie que la facture peut être payée (probablement après acceptation)
  // Si canAccept est true, on doit d'abord accepter avant de payer
  const canPay = invoiceData.canPay && !isPaid && !canAccept;

  // Obtenir le template à partir du templateName retourné par le backend
  // Si templateName n'est pas fourni, utiliser le template par défaut
  const backendTemplateName = invoice.templateName || "invoice";
  const frontendTemplate = getFrontendTemplateFromBackend(backendTemplateName);
  const template = {
    accentColor: frontendTemplate.accentColor,
    backgroundColor: frontendTemplate.backgroundColor || "#ffffff",
    textColor: frontendTemplate.textColor || "#1F1B2E",
    name: frontendTemplate.name,
  };

  // Fonction pour rendre la facture (réutilisable pour le plein écran)
  const renderInvoiceContent = () => (
    <div
      className="rounded-md space-y-10 p-10 md:p-16 bg-white transition-all duration-300"
      style={{
        backgroundColor: template.backgroundColor || "#fff",
        color: template.textColor || "#1F1B2E",
      }}
    >
      {/* Header avec émetteur et destinataire */}
      <div className="flex flex-col gap-8 md:flex-row md:justify-between md:items-start">
        <div className="space-y-6 flex-1">
          {/* Émetteur */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: template.accentColor }}>
              {t('labels.issuer')}
            </p>
            <div className="space-y-1">
              <p className="text-xl font-bold" style={{ color: template.textColor }}>
                {invoice.issuer?.name || "N/A"}
              </p>
              {invoice.issuer?.legalName && (
                <p className="text-sm opacity-80">{invoice.issuer.legalName}</p>
              )}
              {invoice.issuer?.addressLine1 && (
                <div className="text-sm opacity-70 leading-relaxed">
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
                <p className="text-xs opacity-70 mt-2">{invoice.issuer.email}</p>
              )}
            </div>
          </div>

          {/* Destinataire */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: template.accentColor }}>
              {t('labels.recipient')}
            </p>
            <div className="space-y-1">
              <p className="text-lg font-semibold" style={{ color: template.textColor }}>
                {invoice.recipient?.name || "N/A"}
              </p>
              {invoice.recipient?.email && (
                <p className="text-sm opacity-70">{invoice.recipient.email}</p>
              )}
              {invoice.recipient?.addressLine1 && (
                <div className="text-sm opacity-70 leading-relaxed">
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

        {/* Informations de facture */}
        <div className="flex flex-col items-start md:items-end gap-4 text-left md:text-right">
          <p className="text-xs font-bold uppercase opacity-70 tracking-wider">{t('labels.information')}</p>
          <div className="space-y-2">
            <div>
              <p className="text-xs opacity-70">{t('labels.number')}</p>
              <p className="text-base font-bold" style={{ color: template.accentColor }}>
                {invoice.invoiceNumber}
              </p>
            </div>
            <div>
              <p className="text-xs opacity-70">{t('labels.issuedOn')}</p>
              <p className="text-sm font-semibold">{formatDate(invoice.issueDate)}</p>
            </div>
            <div>
              <p className="text-xs opacity-70">{t('labels.dueDate')}</p>
              <p className="text-sm font-semibold">{formatDate(invoice.dueDate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Séparateur */}
      <Separator style={{ backgroundColor: template.accentColor, opacity: 0.3, height: "2px" }} />

      {/* Table des articles */}
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-sm font-bold py-4" style={{ color: template.accentColor }}>
                {t('labels.description')}
              </TableHead>
              <TableHead className="text-right text-sm font-bold py-4" style={{ color: template.accentColor }}>
                {t('labels.quantity')}
              </TableHead>
              <TableHead className="text-right text-sm font-bold py-4" style={{ color: template.accentColor }}>
                {t('labels.unitPrice')}
              </TableHead>
              <TableHead className="text-right text-sm font-bold py-4" style={{ color: template.accentColor }}>
                {t('labels.total')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
              items.map((item) => (
                <TableRow key={item.id} className="hover:bg-primary/5 transition-colors">
                  <TableCell className="py-4 text-base font-medium">{item.description}</TableCell>
                  <TableCell className="text-right py-4 text-base">{item.quantity}</TableCell>
                  <TableCell className="text-right py-4 text-base opacity-80">
                    {formatCurrency(item.unitPrice, invoice.currency)}
                  </TableCell>
                  <TableCell className="text-right py-4 text-base font-semibold">
                    {formatCurrency(item.totalAmount, invoice.currency)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center text-sm opacity-60">
                  {t('empty.noItems')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="text-right text-sm font-semibold py-4 opacity-70">
                {t('labels.subtotalHT')}
              </TableCell>
              <TableCell className="text-right text-base font-semibold py-4">
                {formatCurrency(invoice.subtotalAmount, invoice.currency)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} className="text-right text-sm font-semibold py-3 opacity-70">
                {t('labels.vat')}
              </TableCell>
              <TableCell className="text-right text-base font-semibold py-3">
                {formatCurrency(invoice.taxAmount, invoice.currency)}
              </TableCell>
            </TableRow>
            {invoice.amountPaid !== "0.00" && (
              <>
                <TableRow>
                  <TableCell colSpan={3} className="text-right text-sm font-semibold py-3 opacity-70">
                    {t('labels.amountPaid')}
                  </TableCell>
                  <TableCell className="text-right text-base font-semibold py-3 text-green-600">
                    {formatCurrency(invoice.amountPaid, invoice.currency)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className="text-right text-sm font-semibold py-3 opacity-70">
                    {t('labels.remaining')}
                  </TableCell>
                  <TableCell className="text-right text-base font-semibold py-3">
                    {formatCurrency(invoice.remainingAmount, invoice.currency)}
                  </TableCell>
                </TableRow>
              </>
            )}
            <TableRow className="bg-primary/5">
              <TableCell colSpan={3} className="text-right text-base font-bold py-4">
                {t('labels.totalTTC')}
              </TableCell>
              <TableCell className="text-right text-2xl font-bold py-4" style={{ color: template.accentColor }}>
                {formatCurrency(invoice.totalAmount, invoice.currency)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <>
          <Separator style={{ backgroundColor: template.accentColor, opacity: 0.3 }} />
          <div className="space-y-2 pt-2">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: template.accentColor }}>
              {t('labels.notes')}
            </p>
            <p className="text-sm leading-relaxed opacity-80 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 p-4 py-8 md:py-12 mt-6 md:mt-0">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header avec logo et sélecteur de langue */}
        <div className="flex justify-between items-start mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex-1"></div>
          <div className="bg-white/80 backdrop-blur-sm rounded-md p-4">
            <Image
              src="/logos/logo.png"
              alt="Facturly"
              width={150}
              height={50}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>
          <div className="flex-1 flex justify-end">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Header avec statut - Design amélioré */}
        <div className="text-center space-y-4 mb-8 animate-in fade-in slide-in-from-top-6 duration-700">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-md bg-gradient-to-br from-primary/10 to-primary/5">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {commonT('invoice')} {invoice.invoiceNumber}
              </h1>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="hidden md:flex text-primary hover:bg-primary/10 transition-all"
              onClick={() => setIsFullscreenOpen(true)}
              title={t('actions.maximize')}
            >
              <Maximize2 className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <InvoiceStatusBadge status={invoice.status} />
            {isPaid && (
              <Badge variant="secondary" className="text-sm px-4 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                {t('status.paid')}
              </Badge>
            )}
            {isRejected && (
              <Badge variant="destructive" className="text-sm px-4 py-1.5">
                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                {t('status.rejected')}
              </Badge>
            )}
          </div>
        </div>

        {/* Invoice Template */}
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1fr_420px] animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Main Invoice Template - Style professionnel agrandi */}
          <div className="animate-in fade-in slide-in-from-left-8 duration-700">
            {renderInvoiceContent()}
          </div>

          {/* Actions Card - Design amélioré */}
          <Card className="self-start sticky top-6 bg-white/95 backdrop-blur-sm rounded-md animate-in fade-in slide-in-from-right-8 duration-700">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold" style={{ color: template.accentColor }}>{t('actions.title')}</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {isPaid
                      ? t('actions.paidDescription')
                      : isRejected
                      ? t('actions.rejectedDescription')
                      : canAccept
                      ? t('actions.canAcceptDescription')
                      : t('actions.noActionDescription')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              {/* Status Messages - Design amélioré */}
              {isPaid && (
                <div className="space-y-3 rounded-md bg-gradient-to-br from-green-50 to-green-100/50 p-5">
                  <div className="flex items-center gap-3 text-green-700">
                    <div className="p-2 rounded-full bg-green-200">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <p className="font-bold text-base">{t('paid.title')}</p>
                  </div>
                  <p className="text-sm text-green-700 leading-relaxed">
                    {t('paid.description', { amount: formatCurrency(invoice.totalAmount, invoice.currency) })}
                  </p>
                  {invoice.payments && invoice.payments.length > 0 && (
                    <div className="mt-3 pt-3 space-y-2">
                      {invoice.payments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between text-xs text-green-700 bg-white/50 rounded-md p-2">
                          <span className="font-medium">{formatCurrency(payment.amount, payment.currency || invoice.currency)}</span>
                          <span className="opacity-70">{formatDate(payment.paidAt || payment.paymentDate || '')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {isRejected && (
                <div className="space-y-3 rounded-md bg-gradient-to-br from-red-50 to-red-100/50 p-5">
                  <div className="flex items-center gap-3 text-red-700">
                    <div className="p-2 rounded-full bg-red-200">
                      <XCircle className="h-5 w-5" />
                    </div>
                    <p className="font-bold text-base">{t('paid.rejectedTitle')}</p>
                  </div>
                  {invoice.rejectionComment && (
                    <div className="text-sm text-red-700 bg-white/50 rounded-md p-3">
                      <p className="font-semibold mb-2">{t('paid.comment')} :</p>
                      <p className="whitespace-pre-wrap leading-relaxed">{invoice.rejectionComment}</p>
                    </div>
                  )}
                  {invoice.rejectionReason && (
                    <div className="text-xs text-red-600 bg-white/50 rounded-md p-2">
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

              {/* Action Buttons - Design amélioré */}
              {canAccept && (
                <div className="space-y-3 pt-2">
                  <Button
                    className="w-full gap-2 h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transition-all duration-300"
                    onClick={handleAccept}
                    disabled={isAccepting}
                    size="lg"
                  >
                    {isAccepting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {t('actions.accepting')}
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        {t('actions.accept')}
                      </>
                    )}
                  </Button>
                  <Button
                    className="w-full gap-2 h-12 text-base font-semibold transition-all duration-300"
                    variant="destructive"
                    onClick={handleRejectClick}
                    size="lg"
                  >
                    <X className="h-5 w-5" />
                    {t('actions.reject')}
                  </Button>
                </div>
              )}

              {canPay && !isPaid && !isRejected && (
                <Button
                  className="w-full gap-2 h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transition-all duration-300"
                  onClick={() => router.push(`/pay/${token}`)}
                  size="lg"
                >
                  💳 {t('actions.payNow')}
                </Button>
              )}

              {!canAccept && !canPay && !isPaid && !isRejected && (
                <div className="space-y-3 rounded-md bg-gradient-to-br from-yellow-50 to-yellow-100/50 p-5">
                  <div className="flex items-center gap-3 text-yellow-700">
                    <div className="p-2 rounded-full bg-yellow-200">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <p className="font-bold text-base">{t('actions.unavailable')}</p>
                  </div>
                  <p className="text-sm text-yellow-700 leading-relaxed">
                    {t('actions.unavailableDescription')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rejection Info (if rejected) - Design amélioré */}
        {isRejected && invoice.rejectionComment && (
          <Card className="bg-gradient-to-br from-red-50 to-red-100/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-200">
                  <XCircle className="h-5 w-5 text-red-700" />
                </div>
                <CardTitle className="text-red-700">{t('rejection.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 text-sm text-red-700">
              <p className="whitespace-pre-wrap leading-relaxed">{invoice.rejectionComment}</p>
              {invoice.rejectionReason && (
                <p className="mt-4 pt-4 text-xs">
                  {t('rejection.reasonLabel')} : <span className="font-semibold">{invoice.rejectionReason}</span>
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reject Invoice Modal */}
      {token && (
        <RejectInvoiceModal
          open={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          onSuccess={handleRejectSuccess}
          token={token}
        />
      )}

      {/* Fullscreen Invoice Sheet - Design amélioré (masqué sur mobile) */}
      {isLargeScreen && (
        <Sheet open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
          <SheetContent side="bottom" className="h-[95vh] w-full max-w-full overflow-y-auto p-0 bg-gradient-to-br from-primary/5 to-white">
            <SheetHeader className="px-6 pt-6 pb-4 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    {commonT('invoice')} {invoice.invoiceNumber}
                  </SheetTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFullscreenOpen(false)}
                  className="hover:bg-primary/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-5xl mx-auto">
                {renderInvoiceContent()}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

