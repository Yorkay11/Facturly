"use client";

import { useParams } from "next/navigation";
import { useRouter } from '@/i18n/routing';
import { ArrowLeft, Mail, RefreshCcw, Edit, Trash2, Link as LinkIcon, Copy } from "lucide-react";
import { useState, useMemo } from "react";
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
import { useGetInvoiceByIdQuery, useDeleteInvoiceMutation, useCancelInvoiceMutation, useSendInvoiceMutation, useMarkInvoicePaidMutation, useGetInvoiceRemindersQuery, useCreateInvoiceMutation, facturlyApi } from "@/services/facturlyApi";
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
  const router = useRouter();
  
  // Dans Next.js 16, useParams retourne directement les paramètres
  // Vérifier que l'ID existe et n'est pas "undefined" (chaîne)
  const rawId = params?.id;
  const invoiceId = typeof rawId === "string" && rawId !== "undefined" && rawId.trim() !== "" 
    ? rawId 
    : undefined;
  
  // Ne pas appeler le hook si invoiceId n'est pas valide
  const shouldSkip = !invoiceId;
  
  const { data: invoice, isLoading, isError } = useGetInvoiceByIdQuery(
    invoiceId || "",
    { skip: shouldSkip }
  );
  const { data: reminders, isLoading: isLoadingReminders } = useGetInvoiceRemindersQuery(
    invoiceId || "",
    { skip: shouldSkip }
  );
  const [deleteInvoice, { isLoading: isDeleting }] = useDeleteInvoiceMutation();
  const [cancelInvoice, { isLoading: isCancelling }] = useCancelInvoiceMutation();
  const [markInvoicePaid, { isLoading: isMarkingPaid }] = useMarkInvoicePaidMutation();
  const [createInvoice, { isLoading: isDuplicating }] = useCreateInvoiceMutation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showMarkPaidDialog, setShowMarkPaidDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [paymentNotes, setPaymentNotes] = useState("");

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
      invoice.payments
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
    return events.sort((a, b) => b.timestamp - a.timestamp).map(({ timestamp, ...rest }) => rest);
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
        <div className="rounded-xl border border-destructive bg-destructive/10 p-6 text-sm text-destructive">
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
        <div className="rounded-xl border border-destructive bg-destructive/10 p-6 text-sm text-destructive">
          <p className="font-semibold mb-2">{t('errors.loadingError')}</p>
          <p className="mb-4">{t('errors.loadingErrorDescription')}</p>
          <Button variant="outline" onClick={() => router.push('/invoices')}>
            {t('errors.backToList')}
          </Button>
        </div>
      </div>
    );
  }

  const items = invoice.items ?? [];
  const clientName = invoice.client.name;
  const clientEmail = invoice.client.email;

  // Construire le lien public de visualisation depuis le token
  const getPublicInvoiceLink = () => {
    if (!invoice.paymentLinkToken) return null;
    // Utiliser window.location.origin pour l'URL du frontend
    const frontendUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `${frontendUrl}/invoice/${invoice.paymentLinkToken}`;
  };

  const handleCopyPaymentLink = () => {
    if (invoice.paymentLink) {
      navigator.clipboard.writeText(invoice.paymentLink);
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
    if (!invoiceId || !invoice) return;

    const amount = paymentAmount || invoice.totalAmount;
    const remainingAmount = parseFloat(invoice.totalAmount) - parseFloat(invoice.amountPaid);

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
          amount: formatCurrency(amount, invoice.currency) 
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
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: invoicesT('breadcrumb.dashboard'), href: "/dashboard" },
          { label: invoicesT('breadcrumb.invoices'), href: "/invoices" },
          { label: invoice.invoiceNumber }]}
        className="text-xs"
      />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <h1 className="text-3xl font-semibold tracking-tight">{invoice.invoiceNumber}</h1>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <p className="text-sm text-foreground/70">
            {t('title.description', { 
              clientName, 
              amount: formatCurrency(invoice.totalAmount, invoice.currency) 
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {invoice.status === "draft" && (
            <Button 
              className="gap-2 bg-primary hover:bg-primary/90"
              onClick={() => router.push(`/invoices/${invoiceId}/edit`)}
            >
              <Edit className="h-4 w-4" />
              {t('buttons.edit')}
            </Button>
          )}
          <Button
            variant="outline"
            className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
            onClick={handleDuplicate}
            disabled={isDuplicating}
          >
            <Copy className="h-4 w-4" />
            {invoicesT('duplicate.button') || 'Dupliquer'}
          </Button>
          {invoice.status !== "draft" && invoice.paymentLinkToken && (
            <>
              <Button
                variant="outline"
                className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
                onClick={handleCopyPublicLink}
              >
                <LinkIcon className="h-4 w-4" />
                {t('buttons.copyPublicLink')}
              </Button>
              {invoice.paymentLink && (
                <Button
                  variant="outline"
                  className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
                  onClick={handleCopyPaymentLink}
                >
                  <LinkIcon className="h-4 w-4" />
                  {t('buttons.copyPaymentLink')}
                </Button>
              )}
            </>
          )}
          {invoice.status !== "draft" && invoice.status !== "paid" && invoice.status !== "cancelled" && (
            <>
              <Button 
                variant="outline" 
                className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
                onClick={() => setShowReminderModal(true)}
              >
                <Mail className="h-4 w-4" />
                {t('buttons.sendReminder')}
              </Button>
              <Button 
                className="gap-2"
                onClick={() => {
                  setPaymentAmount((parseFloat(invoice.totalAmount) - parseFloat(invoice.amountPaid)).toString());
                  setShowMarkPaidDialog(true);
                }}
              >
                <RefreshCcw className="h-4 w-4" />
                {t('buttons.markAsPaid')}
              </Button>
            </>
          )}
          <Button
            variant="destructive"
            className="gap-2"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting || isCancelling || invoice.status === "cancelled"}
          >
            <Trash2 className="h-4 w-4" />
            {invoice.status === "draft" ? t('buttons.delete') : t('buttons.cancel')}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-primary/20">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-primary">{t('summary.title')}</CardTitle>
              <CardDescription>{t('summary.description')}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs uppercase text-foreground/50">{t('summary.client')}</p>
              <p className="text-sm font-semibold text-foreground">{clientName}</p>
              <p className="text-xs text-foreground/60">{clientEmail ?? t('summary.emailNotAvailable')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase text-foreground/50">{t('summary.amount')}</p>
              <p className="text-sm font-semibold text-primary">
                {formatCurrency(invoice.totalAmount, invoice.currency)}
              </p>
              <p className="text-xs text-foreground/60">{t('summary.taxIncluded', { taxAmount: formatCurrency(invoice.taxAmount, invoice.currency) })}</p>
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
            <CardTitle className="text-primary">{t('timeline.title')}</CardTitle>
            <CardDescription>{t('timeline.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {timeline.map((event, index) => (
              <div key={index} className="space-y-1 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-sm font-semibold text-primary">{event.title}</p>
                <p className="text-xs text-foreground/60">{event.date}</p>
                <p className="text-xs text-foreground/70">{event.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {reminders && reminders.length > 0 && (
          <Card className="border-primary/20 self-start">
            <CardHeader>
              <CardTitle className="text-primary">{t('reminders.title')}</CardTitle>
              <CardDescription>
                {t('reminders.description', { 
                  count: reminders.length, 
                  plural: reminders.length > 1 ? 's' : '' 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="space-y-1 rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-primary">
                      {t('reminders.reminderNumber', { number: reminder.reminderNumber })}
                    </p>
                    <Badge variant={reminder.reminderType === "manual" ? "default" : "secondary"}>
                      {reminder.reminderType === "manual" ? t('reminders.manual') : t('reminders.automatic')}
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground/60">
                    {t('reminders.sentOn', { 
                      date: formatDate(reminder.sentAt),
                      days: reminder.daysAfterDue,
                      plural: reminder.daysAfterDue > 1 ? 's' : ''
                    })}
                  </p>
                  <p className="text-xs text-foreground/70">
                    {t('reminders.recipient', { email: reminder.recipientEmail })}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {invoice.notes && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">{t('notes.title')}</CardTitle>
            <CardDescription>{t('notes.description')}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-foreground/70">
            <p className="whitespace-pre-wrap">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}

      {invoice.payments && invoice.payments.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">{t('payments.title')}</CardTitle>
            <CardDescription>{t('payments.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoice.payments.map((payment) => (
                <div key={payment.id} className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-primary">
                      {formatCurrency(payment.amount, invoice.currency)}
                    </p>
                    <Badge variant={payment.status === "completed" ? "secondary" : "outline"}>
                      {payment.status === "completed" ? t('payments.completed') : payment.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-foreground/60">
                    {(() => {
                      const paymentDate = payment.paymentDate || payment.paidAt || payment.createdAt;
                      return paymentDate ? (
                        <p>{t('payments.date', { date: formatDate(paymentDate) })}</p>
                      ) : null;
                    })()}
                    <p>{t('payments.method', { method: payment.method })}</p>
                    {payment.notes && <p>{t('payments.notes', { notes: payment.notes })}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <ReminderModal
        open={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        preselectedInvoiceId={invoiceId}
      />

      <Dialog open={showMarkPaidDialog} onOpenChange={setShowMarkPaidDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('markPaidDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('markPaidDialog.description', { invoiceNumber: invoice.invoiceNumber })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">{t('markPaidDialog.amountLabel')}</Label>
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder={invoice.totalAmount}
              />
              <p className="text-xs text-foreground/60">
                {t('markPaidDialog.remaining', {
                  amount: formatCurrency(
                    (parseFloat(invoice.totalAmount) - parseFloat(invoice.amountPaid)).toString(),
                    invoice.currency
                  )
                })}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-date">{t('markPaidDialog.dateLabel')}</Label>
              <Input
                id="payment-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-method">{t('markPaidDialog.methodLabel')}</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="payment-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">{t('paymentMethods.bank_transfer')}</SelectItem>
                  <SelectItem value="check">{t('paymentMethods.check')}</SelectItem>
                  <SelectItem value="cash">{t('paymentMethods.cash')}</SelectItem>
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
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMarkPaidDialog(false)} disabled={isMarkingPaid}>
              {t('markPaidDialog.cancel')}
            </Button>
            <Button onClick={handleMarkPaid} disabled={isMarkingPaid || !paymentAmount || !paymentDate}>
              {isMarkingPaid ? t('markPaidDialog.processing') : t('markPaidDialog.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {invoice.status === "draft" ? t('deleteDialog.deleteTitle') : t('deleteDialog.cancelTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {invoice.status === "draft"
                ? t('deleteDialog.deleteDescription', { number: invoice.invoiceNumber })
                : t('deleteDialog.cancelDescription', { number: invoice.invoiceNumber })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting || isCancelling}
            >
              {isDeleting || isCancelling ? t('deleteDialog.processing') : invoice.status === "draft" ? t('deleteDialog.delete') : t('deleteDialog.cancelAction')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
