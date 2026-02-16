"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from '@/i18n/routing';
import { Mail, RefreshCcw, Edit, Trash2, Link as LinkIcon, Copy, AlertCircle, Calendar, FileText, Send, Eye, XCircle, CheckCircle2, Clock, Ban, User, Percent } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import InvoiceStatusBadge from "@/components/invoices/InvoiceStatusBadge";
import { Badge } from "@/components/ui/badge";
import Skeleton from "@/components/ui/skeleton";
import { useGetInvoiceByIdQuery, useDeleteInvoiceMutation, useCancelInvoiceMutation, useSendInvoiceMutation, useSendQuoteMutation, useMarkInvoicePaidMutation, useGetInvoiceRemindersQuery, useCreateInvoiceMutation, facturlyApi } from "@/services/facturlyApi";
import { store } from "@/lib/redux/store";
import { toast } from "sonner";
import Breadcrumb from "@/components/ui/breadcrumb";
import { ReminderModal } from "@/components/modals/ReminderModal";
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export default function InvoiceDetailPage() {
  const t = useTranslations('invoices.detail');
  const invoicesT = useTranslations('invoices');
  const commonT = useTranslations('common');
  const locale = useLocale();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Dans Next.js 16, useParams retourne directement les paramètres
  // Vérifier que l'ID existe et n'est pas "undefined" (chaîne)
  const rawId = params?.id;
  const invoiceId = typeof rawId === "string" && rawId !== "undefined" && rawId.trim() !== "" 
    ? rawId 
    : undefined;
  
  // Ne pas appeler le hook si invoiceId n'est pas valide
  const shouldSkip = !invoiceId;
  
  const { data: invoice, isLoading, isError, refetch } = useGetInvoiceByIdQuery(
    invoiceId || "",
    { skip: shouldSkip }
  );

  // Gérer le retour de Moneroo après paiement
  useEffect(() => {
    // Moneroo renvoie plusieurs paramètres dans l'URL de retour :
    // - paymentStatus: statut réel du paiement (success, cancelled, failed, pending)
    // - paymentId: ID du paiement Moneroo
    const monerooStatus = searchParams?.get('paymentStatus');
    const paymentId = searchParams?.get('paymentId');
    
    // Utiliser uniquement paymentStatus de Moneroo (source de vérité)
    const finalStatus = monerooStatus;
    
    if (!finalStatus) return; // Pas de retour de paiement
    
    // Recharger les données de la facture pour voir le statut mis à jour
    refetch();
    
    if (finalStatus === 'success') {
      toast.success(t('toasts.paymentSuccess') || 'Paiement réussi', {
        description: t('toasts.paymentSuccessDescription') || 'Le paiement a été traité avec succès.',
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
        description: t('toasts.paymentPendingDescription') || 'Le paiement est en cours de traitement. Vous serez notifié une fois confirmé.',
        duration: 5000,
      });
    }
    
    // Nettoyer l'URL en retirant tous les paramètres de paiement
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [searchParams, refetch, t]);
  const { data: reminders, isLoading: isLoadingReminders } = useGetInvoiceRemindersQuery(
    invoiceId || "",
    { skip: shouldSkip }
  );
  const [deleteInvoice, { isLoading: isDeleting }] = useDeleteInvoiceMutation();
  const [cancelInvoice, { isLoading: isCancelling }] = useCancelInvoiceMutation();
  const [markInvoicePaid, { isLoading: isMarkingPaid }] = useMarkInvoicePaidMutation();
  const [createInvoice, { isLoading: isDuplicating }] = useCreateInvoiceMutation();
  const [sendQuote, { isLoading: isSendingQuote }] = useSendQuoteMutation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showMarkPaidDialog, setShowMarkPaidDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [paymentNotes, setPaymentNotes] = useState("");

  // Réinitialiser les valeurs quand le modal s'ouvre
  useEffect(() => {
    if (showMarkPaidDialog && invoice) {
      const remainingAmount = parseFloat(invoice.totalAmount) - parseFloat(invoice.amountPaid || "0");
      setPaymentAmount(remainingAmount > 0 ? remainingAmount.toFixed(2) : "");
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setPaymentMethod("bank_transfer");
      setPaymentNotes("");
    }
  }, [showMarkPaidDialog, invoice]);

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

  // Fonction pour vérifier si la date d'échéance est dépassée
  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'paid' || status === 'cancelled') return false;
    return new Date(dueDate) < new Date();
  };

  // Vérifier si on peut relancer (date d'échéance dépassée ET facture non payée)
  const canSendReminder = invoice && invoice.status !== "draft" && invoice.status !== "quote" && invoice.status !== "paid" && invoice.status !== "cancelled" && isOverdue(invoice.dueDate, invoice.status);

  type TimelineVariant = 'created' | 'sent' | 'draft' | 'viewed' | 'rejected' | 'payment' | 'due' | 'overdue' | 'cancelled';

  // Timeline dynamique basée sur les données réelles de la facture
  const timeline = useMemo(() => {
    if (!invoice) return [];

    const events: Array<{ title: string; date: string; description: string; timestamp: number; variant: TimelineVariant }> = [];
    const clientName = invoice.client?.name || "";
    const clientEmail = invoice.client?.email || "";

    if (invoice.createdAt) {
      events.push({ title: t('timeline.created'), date: formatDate(invoice.createdAt), description: t('timeline.createdDescription'), timestamp: new Date(invoice.createdAt).getTime(), variant: 'created' });
    } else if (invoice.issueDate) {
      events.push({ title: t('timeline.created'), date: formatDate(invoice.issueDate), description: t('timeline.createdDescription'), timestamp: new Date(invoice.issueDate).getTime(), variant: 'created' });
    }

    if (invoice.sentAt) {
      events.push({ title: t('timeline.sent'), date: formatDate(invoice.sentAt), description: t('timeline.sentDescription', { email: clientEmail || clientName }), timestamp: new Date(invoice.sentAt).getTime(), variant: 'sent' });
    } else if (invoice.status === "draft") {
      events.push({ title: t('timeline.draft'), date: formatDate(invoice.issueDate), description: t('timeline.draftDescription'), timestamp: new Date(invoice.issueDate).getTime(), variant: 'draft' });
    }

    if (invoice.viewedAt) {
      events.push({ title: t('timeline.viewed'), date: formatDate(invoice.viewedAt), description: t('timeline.viewedDescription'), timestamp: new Date(invoice.viewedAt).getTime(), variant: 'viewed' });
    }

    if (invoice.rejectedAt) {
      let description = t('timeline.rejectedDescription');
      if (invoice.rejectionComment) description = t('timeline.rejectedWithComment', { comment: invoice.rejectionComment });
      else if (invoice.rejectionReason) description = t('timeline.rejectedWithReason', { reason: invoice.rejectionReason });
      events.push({ title: t('timeline.rejected'), date: formatDate(invoice.rejectedAt), description, timestamp: new Date(invoice.rejectedAt).getTime(), variant: 'rejected' });
    }

    if (invoice.payments && invoice.payments.length > 0) {
      [...invoice.payments]
        .sort((a, b) => {
          const dateA = a.paymentDate || a.paidAt || a.createdAt || '';
          const dateB = b.paymentDate || b.paidAt || b.createdAt || '';
          if (!dateA || !dateB) return 0;
          return new Date(dateA).getTime() - new Date(dateB).getTime();
        })
        .forEach((payment) => {
          const paymentAmount = formatCurrency(payment.amount, invoice.currency);
          let description = t('timeline.paymentReceivedDescription');
          if (payment.method) {
            const methodTranslation = t(`paymentMethods.${payment.method}` as any);
            const notes = payment.notes ? t('timeline.paymentReceivedWithNotes', { notes: payment.notes }) : '';
            description = t('timeline.paymentReceivedWithMethod', { method: methodTranslation, notes });
          }
          const paymentDate = payment.paymentDate || payment.paidAt || payment.createdAt || '';
          events.push({ title: t('timeline.paymentReceivedAmount', { amount: paymentAmount }), date: paymentDate ? formatDate(paymentDate) : '', description, timestamp: paymentDate ? new Date(paymentDate).getTime() : 0, variant: 'payment' });
        });
    } else if (invoice.status === "paid" && parseFloat(invoice.amountPaid) > 0) {
      events.push({ title: t('timeline.paymentReceived'), date: invoice.updatedAt ? formatDate(invoice.updatedAt) : formatDate(invoice.dueDate), description: t('timeline.paymentReceivedDescription'), timestamp: invoice.updatedAt ? new Date(invoice.updatedAt).getTime() : new Date(invoice.dueDate).getTime(), variant: 'payment' });
    }

    if (invoice.status !== "paid" && invoice.status !== "cancelled") {
      const dueDate = new Date(invoice.dueDate);
      const isOverdue = dueDate < new Date();
      const remainingAmount = formatCurrency((parseFloat(invoice.totalAmount) - parseFloat(invoice.amountPaid)).toString(), invoice.currency);
      events.push({
        title: isOverdue ? t('timeline.dueDateOverdue') : t('timeline.dueDate'),
        date: formatDate(invoice.dueDate),
        description: isOverdue ? t('timeline.dueDateOverdueDescription', { remaining: remainingAmount }) : t('timeline.dueDateDescription', { date: formatDate(invoice.dueDate), remaining: remainingAmount }),
        timestamp: dueDate.getTime(),
        variant: isOverdue ? 'overdue' : 'due',
      });
    }

    if (invoice.status === "cancelled" && invoice.updatedAt) {
      events.push({ title: t('timeline.cancelled'), date: formatDate(invoice.updatedAt), description: t('timeline.cancelledDescription'), timestamp: new Date(invoice.updatedAt).getTime(), variant: 'cancelled' });
    }

    return [...events].sort((a, b) => b.timestamp - a.timestamp).map(({ timestamp, ...rest }) => rest);
  }, [invoice]);

  const handleDelete = async () => {
    if (!invoiceId || !invoice) return;

    try {
      if (invoice.status === "draft") {
        await deleteInvoice(invoiceId).unwrap();
        toast.success(t('deleteDialog.deleteSuccess'), {
          description: t('deleteDialog.deleteSuccessDescription', { number: invoice.invoiceNumber }),
        });
        router.push("/invoices");
      } else {
        await cancelInvoice(invoiceId).unwrap();
        toast.success(t('deleteDialog.cancelSuccess'), {
          description: t('deleteDialog.cancelSuccessDescription', { number: invoice.invoiceNumber }),
        });
        setShowDeleteDialog(false);
      }
    } catch (error) {
      let errorMessage = t('deleteDialog.error');
      if (error && typeof error === "object" && error !== null && "data" in error) {
        errorMessage = (error.data as { message?: string })?.message ?? errorMessage;
      }
      toast.error(commonT('error'), {
        description: errorMessage,
      });
    }
  };

  // Fonction pour dupliquer une facture
  const handleDuplicate = async () => {
    if (!invoiceId || !invoice) return;

    try {
      // Récupérer la facture complète avec RTK Query
      const invoiceResult = await store.dispatch(
        facturlyApi.endpoints.getInvoiceById.initiate(invoiceId)
      );
      
      if ('error' in invoiceResult || !invoiceResult.data) {
        throw new Error('Erreur lors de la récupération de la facture');
      }
      
      const fullInvoice = invoiceResult.data;
      
      // Préparer les données de la nouvelle facture
      const today = new Date().toISOString().split('T')[0];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      const newDueDate = dueDate.toISOString().split('T')[0];
      
      const duplicatePayload = {
        clientId: fullInvoice.client.id,
        issueDate: today,
        dueDate: newDueDate,
        currency: fullInvoice.currency,
        items: fullInvoice.items?.map((item: any) => ({
          productId: item.product?.id || undefined,
          description: item.description,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
        })) || [],
        notes: fullInvoice.notes || undefined,
        recipientEmail: fullInvoice.recipientEmail || undefined,
        templateName: fullInvoice.templateName || undefined,
      };
      
      // Créer la nouvelle facture
      const newInvoice = await createInvoice(duplicatePayload).unwrap();
      
      toast.success(invoicesT('duplicate.success') || 'Facture dupliquée avec succès', {
        description: invoicesT('duplicate.successDescription', { number: invoice.invoiceNumber }) || `La facture ${invoice.invoiceNumber} a été dupliquée`,
      });
      
      // Rediriger vers la nouvelle facture en mode édition
      router.push(`/invoices/${newInvoice.id}/edit`);
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || invoicesT('duplicate.error') || 'Erreur lors de la duplication';
      toast.error(commonT('error'), {
        description: errorMessage,
      });
    }
  };

  // Afficher un message d'erreur si l'ID est invalide
  if (shouldSkip) {
    return (
      <div className="space-y-4">
        <Breadcrumb
          items={[
            { label: invoicesT('breadcrumb.dashboard'), href: "/dashboard" },
            { label: invoicesT('breadcrumb.invoices'), href: "/invoices" },
            { label: t('breadcrumb.details') },
          ]}
          className="text-xs"
        />
        <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-semibold mb-2">{t('errors.invalidId')}</p>
          <p className="mb-4">{t('errors.invalidIdDescription')}</p>
          <Button variant="outline" onClick={() => router.push('/invoices')}>
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

  if (isError || !invoice) {
    return (
      <div className="space-y-4">
        <Breadcrumb
          items={[
            { label: invoicesT('breadcrumb.dashboard'), href: "/dashboard" },
            { label: invoicesT('breadcrumb.invoices'), href: "/invoices" },
            { label: t('breadcrumb.details') },
          ]}
          className="text-xs"
        />
        <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-semibold mb-2">{t('errors.loadingError')}</p>
          <p className="mb-4">{t('errors.loadingErrorDescription')}</p>
          <Button variant="outline" onClick={() => router.push('/invoices')}>
            {t('errors.backToList')}
          </Button>
        </div>
      </div>
    );
  }

  // À ce point, invoice est garanti d'exister (vérifié ci-dessus)
  // Utiliser une assertion non-null pour TypeScript
  const invoiceData = invoice!;
  const items = invoiceData.items ?? [];
  const clientName = invoiceData.client.name;
  const clientEmail = invoiceData.client.email;

  // Construire le lien public de visualisation depuis le token
  const getPublicInvoiceLink = () => {
    if (!invoiceData.paymentLinkToken) return null;
    // Utiliser window.location.origin pour l'URL du frontend
    const frontendUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `${frontendUrl}/invoice/${invoiceData.paymentLinkToken}`;
  };

  const handleCopyPaymentLink = () => {
    if (invoiceData.paymentLink) {
      navigator.clipboard.writeText(invoiceData.paymentLink);
      toast.success(t('toasts.linkCopied'), {
        description: t('toasts.paymentLinkCopied'),
      });
    }
  };

  const handleCopyPublicLink = () => {
    const publicLink = getPublicInvoiceLink();
    if (publicLink) {
      navigator.clipboard.writeText(publicLink);
      toast.success(t('toasts.linkCopied'), {
        description: t('toasts.publicLinkCopied'),
      });
    }
  };

  const handleMarkPaid = async () => {
    if (!invoiceId || !invoiceData) return;

    const amount = paymentAmount || invoiceData.totalAmount;
    const remainingAmount = parseFloat(invoiceData.totalAmount) - parseFloat(invoiceData.amountPaid || "0");

    if (parseFloat(amount) > remainingAmount) {
      toast.error(commonT('error'), {
        description: t('markPaidDialog.errorAmountExceeded', { 
          amount: formatCurrency(remainingAmount.toString(), invoice.currency) 
        }),
      });
      return;
    }

    try {
      await markInvoicePaid({
        id: invoiceId,
        payload: {
          amount,
          paymentDate,
          method: paymentMethod,
          notes: paymentNotes || undefined,
        },
      }).unwrap();
      toast.success(t('markPaidDialog.success'), {
        description: t('markPaidDialog.successDescription', { 
          amount: formatCurrency(amount, invoiceData.currency) 
        }),
      });
      setShowMarkPaidDialog(false);
      setPaymentAmount("");
      setPaymentNotes("");
    } catch (error) {
      let errorMessage = t('markPaidDialog.error');
      if (error && typeof error === "object" && error !== null && "data" in error) {
        errorMessage = (error.data as { message?: string })?.message ?? errorMessage;
      }
      toast.error(commonT('error'), {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-muted/30 to-background">
      <div className="w-full px-4 py-8 sm:px-6 sm:py-10">
        <nav className="mb-8">
          <Breadcrumb
            items={[
              { label: invoicesT('breadcrumb.dashboard'), href: "/dashboard" },
              { label: invoicesT('breadcrumb.invoices'), href: "/invoices" },
              { label: invoiceData.invoiceNumber },
            ]}
            className="text-xs text-muted-foreground"
          />
        </nav>

        <header className="mb-8 pb-6 border-b border-border/40">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {invoiceData.invoiceNumber}
                </h1>
                <InvoiceStatusBadge status={invoiceData.status} />
              </div>
              <p className="text-[15px] text-muted-foreground">
                {clientName}
              </p>
              <p className="text-2xl font-semibold text-primary tabular-nums">
                {formatCurrency(invoiceData.totalAmount, invoiceData.currency)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 sm:shrink-0">
              {(invoiceData.status === "draft" || invoiceData.status === "cancelled") && (
                <>
                  <Button 
                    size="sm"
                    className="h-9 gap-2 rounded-xl px-4 text-[15px] font-medium"
                    onClick={() => router.push(`/invoices/${invoiceId}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                    {invoiceData.status === "cancelled" ? t('buttons.editAndResend') : t('buttons.edit')}
                  </Button>
                  {invoiceData.status === "draft" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-9 gap-2 rounded-xl px-4 text-[15px] font-medium"
                    disabled={isSendingQuote || !invoiceData.client?.phone}
                    onClick={async () => {
                      if (!invoiceId) return;
                      try {
                        await sendQuote({ id: invoiceId }).unwrap();
                        toast.success(t('toasts.quoteSent') ?? 'Devis envoyé', {
                          description: t('toasts.quoteSentDescription') ?? 'Le devis a été envoyé par WhatsApp. Le client peut l\'accepter pour le transformer en facture et payer.',
                        });
                        refetch();
                      } catch (err: unknown) {
                        const msg = err && typeof err === 'object' && 'data' in err && err.data && typeof (err.data as { message?: string }).message === 'string'
                          ? (err.data as { message: string }).message
                          : t('toasts.quoteSendError') ?? 'Erreur lors de l\'envoi du devis';
                        toast.error(commonT('error'), { description: msg });
                      }
                    }}
                  >
                    <FileText className="h-4 w-4" />
                    {t('buttons.sendAsQuote')}
                  </Button>
                  )}
                </>
              )}
              <Button
                size="sm"
                variant="outline"
                className="h-9 gap-2 rounded-xl px-4 text-[15px] font-medium border-border/60"
                onClick={handleDuplicate}
                disabled={isDuplicating}
              >
                <Copy className="h-4 w-4" />
                {invoicesT('duplicate.button') || 'Dupliquer'}
              </Button>
              {invoiceData.status !== "draft" && invoiceData.paymentLinkToken && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 gap-2 rounded-xl px-4 text-[15px] font-medium border-border/60"
                    onClick={handleCopyPublicLink}
                  >
                    <LinkIcon className="h-4 w-4" />
                    {t('buttons.copyPublicLink')}
                  </Button>
                  {invoiceData.paymentLink && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 gap-2 rounded-xl px-4 text-[15px] font-medium border-border/60"
                      onClick={handleCopyPaymentLink}
                    >
                      <LinkIcon className="h-4 w-4" />
                      {t('buttons.copyPaymentLink')}
                    </Button>
                  )}
                </>
              )}
              {canSendReminder && (
                <>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="h-9 gap-2 rounded-xl px-4 text-[15px] font-medium border-border/60"
                    onClick={() => setShowReminderModal(true)}
                  >
                    <Mail className="h-4 w-4" />
                    {t('buttons.sendReminder')}
                  </Button>
                  <Button 
                    size="sm"
                    className="h-9 gap-2 rounded-xl px-4 text-[15px] font-semibold"
                    onClick={() => {
                      setPaymentAmount((parseFloat(invoiceData.totalAmount) - parseFloat(invoiceData.amountPaid || "0")).toString());
                      setShowMarkPaidDialog(true);
                    }}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    {t('buttons.markAsPaid')}
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="destructive"
                className="h-9 gap-2 rounded-xl px-4 text-[15px] font-medium"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting || isCancelling || invoiceData.status === "cancelled"}
              >
                {invoiceData.status === "draft" ? (
                  <Trash2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                {invoiceData.status === "draft" ? t('buttons.delete') : t('buttons.cancel')}
              </Button>
            </div>
          </div>
        </header>

        {/* Informations principales */}
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Colonne gauche */}
          <div className="space-y-6">
            {/* Informations générales */}
            <Card className="rounded-xl border border-border/40 bg-background shadow-sm">
              <CardHeader className="pb-4 border-b border-border/40 px-6 pt-6">
                <CardTitle className="text-[15px] font-semibold">{t('summary.title')}</CardTitle>
                <CardDescription className="text-[13px] mt-1">{t('summary.description')}</CardDescription>
              </CardHeader>
              <CardContent className="px-6 py-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-start gap-3.5 rounded-lg p-4 bg-muted/20 hover:bg-muted/30 transition-all hover:shadow-sm">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-[12px] font-medium text-muted-foreground mb-1.5">{t('summary.client')}</p>
                      <p className="text-[15px] font-semibold text-foreground truncate" title={clientName}>{clientName}</p>
                      {clientEmail && <p className="text-[13px] text-muted-foreground mt-1 truncate" title={clientEmail}>{clientEmail}</p>}
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5 rounded-lg p-4 bg-muted/20 hover:bg-muted/30 transition-all hover:shadow-sm">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-[12px] font-medium text-muted-foreground mb-1.5">{t('summary.issueDate')}</p>
                      <p className="text-[15px] font-semibold text-foreground tabular-nums">{formatDate(invoiceData.issueDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5 rounded-lg p-4 bg-muted/20 hover:bg-muted/30 transition-all hover:shadow-sm">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-[12px] font-medium text-muted-foreground mb-1.5">{t('summary.dueDate')}</p>
                      <p className="text-[15px] font-semibold text-foreground tabular-nums">{formatDate(invoiceData.dueDate)}</p>
                    </div>
                  </div>
                  {parseFloat(invoiceData.taxAmount ?? "0") > 0 && (
                    <div className="flex items-start gap-3.5 rounded-lg p-4 bg-muted/20 hover:bg-muted/30 transition-all hover:shadow-sm">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Percent className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="text-[12px] font-medium text-muted-foreground mb-1.5">TVA</p>
                        <p className="text-[15px] font-semibold text-foreground tabular-nums">{formatCurrency(invoiceData.taxAmount ?? "0", invoiceData.currency)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Articles */}
            <Card className="rounded-xl border border-border/40 bg-background shadow-sm">
              <CardHeader className="pb-4 border-b border-border/40 px-6 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[15px] font-semibold">{t('items.title') || 'Articles'}</CardTitle>
                    <CardDescription className="text-[13px] mt-1">{t('items.description') || 'Détails des articles facturés'}</CardDescription>
                  </div>
                  {items.length > 0 && (
                    <span className="text-[13px] text-muted-foreground font-medium">{items.length} {items.length === 1 ? 'ligne' : 'lignes'}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-6 py-6">
                <div className="rounded-lg border border-border/40 overflow-hidden bg-background">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border/40">
                        <TableHead className="font-semibold text-[13px] h-11">{t('items.description')}</TableHead>
                        <TableHead className="text-right w-20 font-semibold text-[13px]">{t('items.quantity')}</TableHead>
                        <TableHead className="text-right font-semibold text-[13px]">{t('items.unitPrice')}</TableHead>
                        <TableHead className="text-right font-semibold w-28 text-[13px]">{t('items.total')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.length > 0 ? (
                        <>
                          {items.map((item, idx) => (
                            <TableRow key={item.id} className="hover:bg-muted/20 transition-colors border-b border-border/30 last:border-0">
                              <TableCell className="font-medium text-[15px] py-3.5">{item.description}</TableCell>
                              <TableCell className="text-right text-muted-foreground tabular-nums text-[15px] py-3.5">{item.quantity}</TableCell>
                              <TableCell className="text-right text-muted-foreground tabular-nums text-[15px] py-3.5">{formatCurrency(item.unitPrice, invoiceData.currency)}</TableCell>
                              <TableCell className="text-right font-semibold tabular-nums text-[15px] py-3.5">{formatCurrency(item.totalAmount, invoiceData.currency)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="bg-muted/20 border-t-2 border-border/50 font-semibold">
                            <TableCell colSpan={3} className="text-right text-[15px] py-4">
                              Total
                            </TableCell>
                            <TableCell className="text-right text-primary tabular-nums text-[15px] font-semibold py-4">
                              {formatCurrency(invoiceData.totalAmount, invoiceData.currency)}
                            </TableCell>
                          </TableRow>
                        </>
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-12">
                            {t('items.empty')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {invoiceData.notes && (
              <Card className="rounded-xl border border-border/40 bg-background shadow-sm">
                <CardHeader className="pb-4 border-b border-border/40 px-6 pt-6">
                  <CardTitle className="text-[15px] font-semibold">{t('notes.title')}</CardTitle>
                  <CardDescription className="text-[13px] mt-1">{t('notes.description')}</CardDescription>
                </CardHeader>
                <CardContent className="px-6 py-6">
                  <div className="rounded-lg bg-muted/20 p-5 border border-border/30">
                    <p className="text-[15px] text-foreground/90 whitespace-pre-wrap leading-relaxed">{invoiceData.notes}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Paiements */}
            {invoiceData.payments && invoiceData.payments.length > 0 && (
              <Card className="rounded-xl border border-border/40 bg-background shadow-sm">
                <CardHeader className="pb-4 border-b border-border/40 px-6 pt-6">
                  <CardTitle className="text-[15px] font-semibold">{t('payments.title')}</CardTitle>
                  <CardDescription className="text-[13px] mt-1">{t('payments.description')}</CardDescription>
                </CardHeader>
                <CardContent className="px-6 py-6">
                  <div className="space-y-3">
                    {invoiceData.payments.map((payment) => {
                      const paymentDate = payment.paymentDate || payment.paidAt || payment.createdAt;
                      return (
                        <div key={payment.id} className="rounded-lg border border-l-4 border-l-primary/50 bg-muted/20 p-4 transition-all hover:bg-muted/30 hover:shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1.5 min-w-0 flex-1">
                              <p className="text-[15px] font-semibold text-foreground tabular-nums">{formatCurrency(payment.amount, invoiceData.currency)}</p>
                              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[13px] text-muted-foreground">
                                {paymentDate && <span>{t('payments.date', { date: formatDate(paymentDate) })}</span>}
                                <span>{t('payments.method', { method: payment.method })}</span>
                              </div>
                              {payment.notes && <p className="text-[13px] text-muted-foreground mt-2.5 pt-2.5 border-t border-border/30">{payment.notes}</p>}
                            </div>
                            <Badge variant={payment.status === "completed" ? "default" : "secondary"} className="shrink-0 text-[12px] font-medium">
                              {payment.status === "completed" ? t('payments.completed') : payment.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="rounded-xl border border-border/40 bg-background shadow-sm">
              <CardHeader className="pb-4 border-b border-border/40 px-6 pt-6">
                <CardTitle className="text-[15px] font-semibold">{t('timeline.title')}</CardTitle>
                <CardDescription className="text-[13px] mt-1">{t('timeline.description')}</CardDescription>
              </CardHeader>
              <CardContent className="px-6 py-6">
              {timeline.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-primary/40 via-border to-transparent rounded-full" />
                  <div className="space-y-1">
                    {timeline.map((event, index) => {
                      const isFirst = index === 0;
                      const config = {
                        created: { Icon: FileText, dot: 'bg-primary', iconBg: 'bg-primary/10 text-primary' },
                        sent: { Icon: Send, dot: 'bg-primary', iconBg: 'bg-primary/10 text-primary' },
                        draft: { Icon: FileText, dot: 'bg-muted-foreground/50', iconBg: 'bg-muted text-muted-foreground' },
                        viewed: { Icon: Eye, dot: 'bg-blue-500', iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
                        rejected: { Icon: XCircle, dot: 'bg-destructive', iconBg: 'bg-destructive/10 text-destructive' },
                        payment: { Icon: CheckCircle2, dot: 'bg-emerald-500', iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
                        due: { Icon: Clock, dot: 'bg-amber-500', iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
                        overdue: { Icon: AlertCircle, dot: 'bg-destructive', iconBg: 'bg-destructive/10 text-destructive' },
                        cancelled: { Icon: Ban, dot: 'bg-muted-foreground', iconBg: 'bg-muted text-muted-foreground' },
                      }[event.variant] ?? { Icon: FileText, dot: 'bg-primary', iconBg: 'bg-primary/10 text-primary' };
                      const { Icon, dot, iconBg } = config;
                      return (
                        <div
                          key={index}
                          className={`relative flex gap-3 pl-1 ${isFirst ? 'pt-0' : 'pt-4'}`}
                        >
                          <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-background ${iconBg}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className={`min-w-0 flex-1 pb-4 ${isFirst ? 'rounded-lg bg-muted/30 ring-1 ring-primary/20' : ''} px-4 py-3`}>
                            <div className="flex items-baseline justify-between gap-2">
                              <p className="text-[15px] font-semibold text-foreground">{event.title}</p>
                              <span className="text-[13px] text-muted-foreground tabular-nums shrink-0">{event.date}</span>
                            </div>
                            <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">{event.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 text-muted-foreground mb-3">
                    <Clock className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{t('timeline.empty') || 'Aucun événement'}</p>
                  <p className="text-xs text-muted-foreground mt-1">L’historique apparaîtra ici</p>
                </div>
              )}
            </CardContent>
          </Card>

            {reminders && reminders.length > 0 && (
              <Card className="rounded-xl border border-border/40 bg-background shadow-sm">
                <CardHeader className="pb-4 border-b border-border/40 px-6 pt-6">
                  <CardTitle className="text-[15px] font-semibold">{t('reminders.title')}</CardTitle>
                  <CardDescription className="text-[13px] mt-1">
                    {t('reminders.description', { count: reminders.length, plural: reminders.length > 1 ? 's' : '' })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 py-6">
                  <div className="space-y-3">
                    {reminders.map((reminder) => (
                      <div key={reminder.id} className="rounded-lg border border-border/40 bg-muted/20 p-4 transition-all hover:bg-muted/30 hover:shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-[15px] font-semibold text-foreground">{t('reminders.reminderNumber', { number: reminder.reminderNumber })}</p>
                            <p className="text-[13px] text-muted-foreground mt-1.5">
                              {t('reminders.sentOn', { date: formatDate(reminder.sentAt), days: reminder.daysAfterDue, plural: reminder.daysAfterDue > 1 ? 's' : '' })}
                            </p>
                          </div>
                          <Badge variant={reminder.reminderType === "manual" ? "default" : "secondary"} className="shrink-0 text-[12px] font-medium">
                            {reminder.reminderType === "manual" ? t('reminders.manual') : t('reminders.automatic')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <ReminderModal
        open={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        preselectedInvoiceId={invoiceId}
      />

      <ResponsiveModal
        open={showMarkPaidDialog}
        onOpenChange={setShowMarkPaidDialog}
        modalMaxWidth="sm:max-w-[480px]"
        contentClassName="rounded-2xl sm:rounded-[20px] border border-border/40 bg-background shadow-2xl shadow-black/5 p-0 overflow-hidden"
        closeButtonClassName="right-4 top-4 h-8 w-8 rounded-full bg-muted/60 hover:bg-muted text-foreground/70"
      >
        <div className="px-5 pt-5 pb-4 border-b border-border/40">
          <DialogHeader className="p-0 text-left space-y-1">
            <DialogTitle className="text-[17px] font-semibold tracking-tight text-foreground">
              {t('markPaidDialog.title')}
            </DialogTitle>
            <DialogDescription className="text-[15px] text-muted-foreground">
              {t('markPaidDialog.description', { invoiceNumber: invoice.invoiceNumber })}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="payment-amount" className="text-[13px] font-medium text-foreground">
              {t('markPaidDialog.amountLabel')}
            </Label>
            <div className="relative">
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                min="0"
                max={parseFloat(invoice.totalAmount) - parseFloat(invoice.amountPaid || "0")}
                value={paymentAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || value === "0" || value === "0.") {
                    setPaymentAmount(value);
                    return;
                  }
                  const numValue = parseFloat(value);
                  const remaining = parseFloat(invoice.totalAmount) - parseFloat(invoice.amountPaid || "0");
                  if (!isNaN(numValue) && numValue > 0 && numValue <= remaining) {
                    setPaymentAmount(value);
                  }
                }}
                className="h-11 rounded-xl border-0 bg-muted/30 text-[15px] focus-visible:ring-2 focus-visible:ring-ring/20 pl-12"
                placeholder={formatCurrency(
                  (parseFloat(invoice.totalAmount) - parseFloat(invoice.amountPaid || "0")).toString(),
                  invoice.currency
                )}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground font-medium">
                {invoice.currency}
              </span>
            </div>
            {paymentAmount &&
              !isNaN(parseFloat(paymentAmount)) &&
              parseFloat(paymentAmount) > 0 &&
              parseFloat(paymentAmount) > (parseFloat(invoice.totalAmount) - parseFloat(invoice.amountPaid || "0")) && (
              <p className="flex items-center gap-2 text-[13px] text-destructive mt-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {t('markPaidDialog.errorAmountExceeded', {
                  amount: formatCurrency(
                    (parseFloat(invoice.totalAmount) - parseFloat(invoice.amountPaid || "0")).toString(),
                    invoice.currency
                  ),
                })}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payment-date" className="text-[13px] font-medium text-foreground">
              {t('markPaidDialog.dateLabel')}
            </Label>
            <Input
              id="payment-date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="h-11 rounded-xl border-0 bg-muted/30 text-[15px] focus-visible:ring-2 focus-visible:ring-ring/20"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-foreground">{t('markPaidDialog.methodLabel')}</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="payment-method" className="h-11 rounded-xl border-0 bg-muted/30 text-[15px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-border/40">
                <SelectItem value="bank_transfer">{t('paymentMethods.bank_transfer')}</SelectItem>
                <SelectItem value="cash">{t('paymentMethods.cash')}</SelectItem>
                <SelectItem value="check">{t('paymentMethods.check')}</SelectItem>
                <SelectItem value="online_payment">{t('paymentMethods.online_payment')}</SelectItem>
                <SelectItem value="card">{t('paymentMethods.card')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payment-notes" className="text-[13px] font-medium text-foreground">
              {t('markPaidDialog.notesLabel')}
            </Label>
            <Textarea
              id="payment-notes"
              placeholder={t('markPaidDialog.notesPlaceholder')}
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              rows={2}
              className="resize-none rounded-xl border-0 bg-muted/30 text-[15px] focus-visible:ring-2 focus-visible:ring-ring/20"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2 pt-4 border-t border-border/40 mt-4 px-5 pb-5">
          <Button
            variant="outline"
            className="h-9 rounded-xl text-[15px] font-medium border-border/60"
            onClick={() => setShowMarkPaidDialog(false)}
            disabled={isMarkingPaid}
          >
            {t('markPaidDialog.cancel')}
          </Button>
          <Button
            className="h-9 rounded-xl px-4 text-[15px] font-semibold"
            onClick={handleMarkPaid}
            disabled={
              isMarkingPaid ||
              !paymentAmount ||
              !paymentDate ||
              parseFloat(paymentAmount) <= 0 ||
              parseFloat(paymentAmount) > (parseFloat(invoiceData.totalAmount) - parseFloat(invoiceData.amountPaid || "0"))
            }
          >
            {isMarkingPaid ? (
              <>
                <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                {t('markPaidDialog.processing')}
              </>
            ) : (
              t('markPaidDialog.save')
            )}
          </Button>
        </DialogFooter>
      </ResponsiveModal>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {invoiceData.status === "draft" ? t('deleteDialog.deleteTitle') : t('deleteDialog.cancelTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {invoiceData.status === "draft"
                ? t('deleteDialog.deleteDescription', { number: invoiceData.invoiceNumber })
                : t('deleteDialog.cancelDescription', { number: invoiceData.invoiceNumber })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting || isCancelling}
            >
              {isDeleting || isCancelling ? t('deleteDialog.processing') : invoiceData.status === "draft" ? t('deleteDialog.delete') : t('deleteDialog.cancelAction')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
