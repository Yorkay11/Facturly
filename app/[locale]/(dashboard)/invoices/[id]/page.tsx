"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from '@/i18n/routing';
import { Mail, RefreshCcw, Edit, Trash2, Link as LinkIcon, Copy, AlertCircle, Calendar, User, DollarSign, FileText, Clock, CheckCircle2, XCircle, Building2, CreditCard, Receipt } from "lucide-react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

  // Timeline dynamique basée sur les données réelles de la facture
  // Doit être appelé AVANT tous les return conditionnels pour respecter les règles des Hooks
  const timeline = useMemo(() => {
    if (!invoice) {
      return [];
    }

    const events: Array<{ title: string; date: string; description: string; timestamp: number }> = [];
    const clientName = invoice.client?.name || "";
    const clientEmail = invoice.client?.email || "";

    // 1. Création de la facture
    if (invoice.createdAt) {
      events.push({
        title: t('timeline.created'),
        date: formatDate(invoice.createdAt),
        description: t('timeline.createdDescription'),
        timestamp: new Date(invoice.createdAt).getTime(),
      });
    } else if (invoice.issueDate) {
      events.push({
        title: t('timeline.created'),
        date: formatDate(invoice.issueDate),
        description: t('timeline.createdDescription'),
        timestamp: new Date(invoice.issueDate).getTime(),
      });
    }

    // 2. Envoi de la facture
    if (invoice.sentAt) {
      events.push({
        title: t('timeline.sent'),
        date: formatDate(invoice.sentAt),
        description: t('timeline.sentDescription', { email: clientEmail || clientName }),
        timestamp: new Date(invoice.sentAt).getTime(),
      });
    } else if (invoice.status === "draft") {
      events.push({
        title: t('timeline.draft'),
        date: formatDate(invoice.issueDate),
        description: t('timeline.draftDescription'),
        timestamp: new Date(invoice.issueDate).getTime(),
      });
    }

    // 3. Visualisation par le client
    if (invoice.viewedAt) {
      events.push({
        title: t('timeline.viewed'),
        date: formatDate(invoice.viewedAt),
        description: t('timeline.viewedDescription'),
        timestamp: new Date(invoice.viewedAt).getTime(),
      });
    }

    // 4. Rejet de la facture
    if (invoice.rejectedAt) {
      let description = t('timeline.rejectedDescription');
      if (invoice.rejectionComment) {
        description = t('timeline.rejectedWithComment', { comment: invoice.rejectionComment });
      } else if (invoice.rejectionReason) {
        description = t('timeline.rejectedWithReason', { reason: invoice.rejectionReason });
      }
      events.push({
        title: t('timeline.rejected'),
        date: formatDate(invoice.rejectedAt),
        description,
        timestamp: new Date(invoice.rejectedAt).getTime(),
      });
    }

    // 5. Paiements reçus
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
            description = t('timeline.paymentReceivedWithMethod', { 
              method: methodTranslation,
              notes 
            });
          }
          const paymentDate = payment.paymentDate || payment.paidAt || payment.createdAt || '';
          events.push({
            title: t('timeline.paymentReceivedAmount', { amount: paymentAmount }),
            date: paymentDate ? formatDate(paymentDate) : '',
            description,
            timestamp: paymentDate ? new Date(paymentDate).getTime() : 0,
          });
        });
    } else if (invoice.status === "paid" && parseFloat(invoice.amountPaid) > 0) {
      // Si payée mais pas de paiements détaillés, utiliser la date de mise à jour
      events.push({
        title: t('timeline.paymentReceived'),
        date: invoice.updatedAt ? formatDate(invoice.updatedAt) : formatDate(invoice.dueDate),
        description: t('timeline.paymentReceivedDescription'),
        timestamp: invoice.updatedAt 
          ? new Date(invoice.updatedAt).getTime() 
          : new Date(invoice.dueDate).getTime(),
      });
    }

    // 6. Échéance
    if (invoice.status !== "paid" && invoice.status !== "cancelled") {
      const dueDate = new Date(invoice.dueDate);
      const now = new Date();
      const isOverdue = dueDate < now;
      const remainingAmount = formatCurrency(
        (parseFloat(invoice.totalAmount) - parseFloat(invoice.amountPaid)).toString(),
        invoice.currency
      );
      
      events.push({
        title: isOverdue ? t('timeline.dueDateOverdue') : t('timeline.dueDate'),
        date: formatDate(invoice.dueDate),
        description: isOverdue
          ? t('timeline.dueDateOverdueDescription', { remaining: remainingAmount })
          : t('timeline.dueDateDescription', { date: formatDate(invoice.dueDate), remaining: remainingAmount }),
        timestamp: dueDate.getTime(),
      });
    }

    // 7. Annulation
    if (invoice.status === "cancelled" && invoice.updatedAt) {
      events.push({
        title: t('timeline.cancelled'),
        date: formatDate(invoice.updatedAt),
        description: t('timeline.cancelledDescription'),
        timestamp: new Date(invoice.updatedAt).getTime(),
      });
    }

    // Trier par date (plus récent en premier)
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
        {/* Header */}
        <div className="space-y-4">
          <Breadcrumb
            items={[
              { label: invoicesT('breadcrumb.dashboard'), href: "/dashboard" },
              { label: invoicesT('breadcrumb.invoices'), href: "/invoices" },
              { label: invoiceData.invoiceNumber }]}
            className="text-xs"
          />
          
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 shadow-sm">
                  <Receipt className="h-7 w-7 text-primary" />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      {invoiceData.invoiceNumber}
                    </h1>
                    <InvoiceStatusBadge status={invoiceData.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('title.description', { 
                      clientName, 
                      amount: formatCurrency(invoiceData.totalAmount, invoiceData.currency) 
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {invoiceData.status === "draft" && (
                <>
                  <Button 
                    size="sm"
                    className="gap-2 shadow-sm"
                    onClick={() => router.push(`/invoices/${invoiceId}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                    {t('buttons.edit')}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="gap-2 shadow-sm"
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
                </>
              )}
              <Button
                size="sm"
                variant="outline"
                className="gap-2 shadow-sm"
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
                    className="gap-2 shadow-sm"
                    onClick={handleCopyPublicLink}
                  >
                    <LinkIcon className="h-4 w-4" />
                    {t('buttons.copyPublicLink')}
                  </Button>
                  {invoiceData.paymentLink && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 shadow-sm"
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
                    className="gap-2 shadow-sm"
                    onClick={() => setShowReminderModal(true)}
                  >
                    <Mail className="h-4 w-4" />
                    {t('buttons.sendReminder')}
                  </Button>
                  <Button 
                    size="sm"
                    className="gap-2 shadow-sm"
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
                className="gap-2 shadow-sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting || isCancelling || invoiceData.status === "cancelled"}
              >
                <Trash2 className="h-4 w-4" />
                {invoiceData.status === "draft" ? t('buttons.delete') : t('buttons.cancel')}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Invoice Details Card */}
          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">{t('summary.title')}</CardTitle>
                  <CardDescription className="text-sm">{t('summary.description')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Key Information Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-muted/50 to-muted/30 p-5 transition-all hover:shadow-md hover:border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {t('summary.client')}
                      </p>
                      <p className="text-base font-semibold">{clientName}</p>
                      {clientEmail && (
                        <p className="text-xs text-muted-foreground">{clientEmail}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 to-primary/5 p-5 transition-all hover:shadow-md hover:border-primary/30">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {t('summary.amount')}
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(invoiceData.totalAmount, invoiceData.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('summary.taxIncluded', { taxAmount: formatCurrency(invoiceData.taxAmount, invoiceData.currency) })}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-muted/50 to-muted/30 p-5 transition-all hover:shadow-md hover:border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {t('summary.issueDate')}
                      </p>
                      <p className="text-base font-semibold">{formatDate(invoiceData.issueDate)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-muted/50 to-muted/30 p-5 transition-all hover:shadow-md hover:border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {t('summary.dueDate')}
                      </p>
                      <p className="text-base font-semibold">{formatDate(invoiceData.dueDate)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Items Table */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">{t('items.title') || 'Articles'}</h3>
                <div className="rounded-xl border bg-muted/30 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow className="border-b">
                        <TableHead className="font-semibold">{t('items.description')}</TableHead>
                        <TableHead className="text-right font-semibold">{t('items.quantity')}</TableHead>
                        <TableHead className="text-right font-semibold">{t('items.unitPrice')}</TableHead>
                        <TableHead className="text-right font-semibold">{t('items.total')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.length > 0 ? (
                        items.map((item, idx) => (
                          <TableRow key={item.id} className={idx % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                            <TableCell className="font-medium">{item.description}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{item.quantity}</TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {formatCurrency(item.unitPrice, invoiceData.currency)}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-primary">
                              {formatCurrency(item.totalAmount, invoiceData.currency)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
                            {t('items.empty')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline Card */}
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">{t('timeline.title')}</CardTitle>
                    <CardDescription className="text-xs">{t('timeline.description')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-4">
                  {timeline.length > 0 ? (
                    timeline.map((event, index) => (
                      <div key={index} className="relative pl-8">
                        {index < timeline.length - 1 && (
                          <div className="absolute left-3 top-6 h-full w-0.5 bg-gradient-to-b from-primary/30 to-transparent" />
                        )}
                        <div className="absolute left-0 top-1.5 h-6 w-6 rounded-full border-2 border-primary bg-background shadow-sm flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        </div>
                        <div className="rounded-lg border bg-gradient-to-br from-muted/50 to-muted/30 p-4 space-y-1.5">
                          <p className="text-sm font-semibold">{event.title}</p>
                          <p className="text-xs text-muted-foreground font-medium">{event.date}</p>
                          <p className="text-xs text-muted-foreground/80 leading-relaxed">{event.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {t('timeline.empty') || 'Aucun événement'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reminders Card */}
            {reminders && reminders.length > 0 && (
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">{t('reminders.title')}</CardTitle>
                      <CardDescription className="text-xs">
                        {t('reminders.description', { 
                          count: reminders.length, 
                          plural: reminders.length > 1 ? 's' : '' 
                        })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reminders.map((reminder) => (
                      <div key={reminder.id} className="rounded-lg border bg-gradient-to-br from-muted/50 to-muted/30 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-2">
                            <p className="text-sm font-semibold">
                              {t('reminders.reminderNumber', { number: reminder.reminderNumber })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t('reminders.sentOn', { 
                                date: formatDate(reminder.sentAt),
                                days: reminder.daysAfterDue,
                                plural: reminder.daysAfterDue > 1 ? 's' : ''
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t('reminders.recipient', { email: reminder.recipientEmail })}
                            </p>
                          </div>
                          <Badge variant={reminder.reminderType === "manual" ? "default" : "secondary"} className="shrink-0">
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

        {/* Notes Section */}
        {invoiceData.notes && (
          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">{t('notes.title')}</CardTitle>
                  <CardDescription className="text-xs">{t('notes.description')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-gradient-to-br from-muted/50 to-muted/30 p-5">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {invoiceData.notes}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payments Section */}
        {invoiceData.payments && invoiceData.payments.length > 0 && (
          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">{t('payments.title')}</CardTitle>
                  <CardDescription className="text-xs">{t('payments.description')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoiceData.payments.map((payment) => {
                  const paymentDate = payment.paymentDate || payment.paidAt || payment.createdAt;
                  return (
                    <div key={payment.id} className="rounded-xl border bg-gradient-to-br from-muted/50 to-muted/30 p-5 transition-all hover:shadow-md hover:border-primary/20">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                            <CheckCircle2 className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              <p className="text-xl font-bold">
                                {formatCurrency(payment.amount, invoiceData.currency)}
                              </p>
                              <Badge 
                                variant={payment.status === "completed" ? "default" : "secondary"}
                                className="shrink-0"
                              >
                                {payment.status === "completed" ? (
                                  <span className="flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3 w-3" />
                                    {t('payments.completed')}
                                  </span>
                                ) : (
                                  payment.status
                                )}
                              </Badge>
                            </div>
                            <div className="space-y-1.5 text-xs text-muted-foreground">
                              {paymentDate && (
                                <p className="flex items-center gap-2">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {t('payments.date', { date: formatDate(paymentDate) })}
                                </p>
                              )}
                              <p className="flex items-center gap-2">
                                <CreditCard className="h-3.5 w-3.5" />
                                {t('payments.method', { method: payment.method })}
                              </p>
                              {payment.notes && (
                                <div className="mt-3 pt-3 border-t">
                                  <p className="text-xs text-muted-foreground leading-relaxed">{payment.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
    </div>

      <ReminderModal
        open={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        preselectedInvoiceId={invoiceId}
      />

      <Dialog open={showMarkPaidDialog} onOpenChange={setShowMarkPaidDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{t('markPaidDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('markPaidDialog.description', { invoiceNumber: invoice.invoiceNumber })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">{t('markPaidDialog.amountLabel')}</Label>
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
                  className="pl-12"
                  placeholder={formatCurrency(
                    (parseFloat(invoice.totalAmount) - parseFloat(invoice.amountPaid || "0")).toString(),
                    invoice.currency
                  )}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  {invoice.currency}
                </span>
              </div>
              {paymentAmount &&
                !isNaN(parseFloat(paymentAmount)) &&
                parseFloat(paymentAmount) > 0 &&
                parseFloat(paymentAmount) > (parseFloat(invoice.totalAmount) - parseFloat(invoice.amountPaid || "0")) && (
                <p className="flex items-center gap-2 text-sm text-destructive">
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

            <div className="space-y-2">
              <Label htmlFor="payment-date">{t('markPaidDialog.dateLabel')}</Label>
              <Input
                id="payment-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('markPaidDialog.methodLabel')}</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="payment-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">{t('paymentMethods.bank_transfer')}</SelectItem>
                  <SelectItem value="cash">{t('paymentMethods.cash')}</SelectItem>
                  <SelectItem value="check">{t('paymentMethods.check')}</SelectItem>
                  <SelectItem value="online_payment">{t('paymentMethods.online_payment')}</SelectItem>
                  <SelectItem value="card">{t('paymentMethods.card')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-notes">{t('markPaidDialog.notesLabel')}</Label>
              <Textarea
                id="payment-notes"
                placeholder={t('markPaidDialog.notesPlaceholder')}
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowMarkPaidDialog(false)}
              disabled={isMarkingPaid}
            >
              {t('markPaidDialog.cancel')}
            </Button>
            <Button
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
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                  {t('markPaidDialog.processing')}
                </>
              ) : (
                t('markPaidDialog.save')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
