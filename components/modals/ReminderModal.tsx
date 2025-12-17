"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetInvoicesQuery, useSendReminderMutation, type InvoiceSummary } from "@/services/facturlyApi";
import { toast } from "sonner";
import { useTranslations, useLocale } from 'next-intl';

type ReminderFormValues = {
  invoiceId: string;
};

interface ReminderModalProps {
  open: boolean;
  onClose: () => void;
  preselectedInvoiceId?: string;
}

export const ReminderModal = ({ open, onClose, preselectedInvoiceId }: ReminderModalProps) => {
  const t = useTranslations('reminders.modal');
  const commonT = useTranslations('common');
  const locale = useLocale();

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

  // Créer le schéma de validation avec les traductions
  const reminderSchema = z.object({
    invoiceId: z.string().min(1, t('validation.invoiceRequired')),
  });
  const [sendReminder, { isLoading, isSuccess, isError, error }] = useSendReminderMutation();
  
  // Récupérer les factures en retard et envoyées
  const { data: overdueInvoices } = useGetInvoicesQuery({ 
    page: 1, 
    limit: 100, 
    status: "overdue" 
  });
  const { data: sentInvoices } = useGetInvoicesQuery({ 
    page: 1, 
    limit: 100, 
    status: "sent" 
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const overdueFromSent = sentInvoices?.data?.filter((invoice) => {
    const dueDate = new Date(invoice.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  }) ?? [];

  const availableInvoices = [
    ...(overdueInvoices?.data ?? []),
    ...overdueFromSent,
  ];

  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      invoiceId: preselectedInvoiceId || "",
    },
  });

  const selectedInvoice = availableInvoices.find(
    (inv) => inv.id === form.watch("invoiceId")
  );

  useEffect(() => {
    if (preselectedInvoiceId) {
      form.setValue("invoiceId", preselectedInvoiceId);
    }
  }, [preselectedInvoiceId, form]);

  useEffect(() => {
    if (isSuccess) {
      toast.success(t('success.sent'), {
        description: t('success.sentDescription'),
      });
      form.reset();
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  useEffect(() => {
    if (isError && error) {
      const errorMessage = error && "data" in error
        ? (error.data as { message?: string })?.message ?? t('errors.sendError')
        : t('errors.genericError');
      
      toast.error(commonT('error'), {
        description: errorMessage,
      });
    }
  }, [error, isError, t, commonT]);

  const onSubmit = async (values: ReminderFormValues) => {
    if (!values.invoiceId) {
      toast.error(commonT('error'), {
        description: t('validation.selectInvoice'),
      });
      return;
    }

    const invoice = availableInvoices.find((inv) => inv.id === values.invoiceId);
    if (!invoice) {
      toast.error(commonT('error'), {
        description: t('validation.invoiceNotFound'),
      });
      return;
    }

    try {
      const response = await sendReminder(values.invoiceId).unwrap();
      toast.success(t('success.sent'), {
        description: t('success.sentWithNumber', { number: response.reminderNumber }),
      });
      form.reset();
      onClose();
    } catch (err) {
      // L'erreur sera gérée par le useEffect
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoice">
              {t('fields.invoice')} <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="invoiceId"
              control={form.control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoading || !!preselectedInvoiceId}
                >
                  <SelectTrigger id="invoice" className={form.formState.errors.invoiceId ? "border-destructive" : ""}>
                    <SelectValue placeholder={t('fields.invoicePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableInvoices.length === 0 ? (
                      <div className="px-2 py-6 text-center text-sm text-foreground/60">
                        {t('empty.noInvoices')}
                      </div>
                    ) : (
                      availableInvoices.map((invoice) => (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          <div className="flex flex-col">
                            <span className="font-semibold">{invoice.invoiceNumber}</span>
                            <span className="text-xs text-foreground/60">
                              {invoice.client.name} • {formatCurrency(invoice.totalAmount, invoice.currency)} • {t('fields.dueDate')} {formatDate(invoice.dueDate)}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.invoiceId && (
              <p className="text-xs text-destructive">{form.formState.errors.invoiceId.message}</p>
            )}
          </div>

          {selectedInvoice && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold text-primary">{selectedInvoice.invoiceNumber}</p>
                  <p className="text-xs text-foreground/70">
                    {t('fields.client')} {selectedInvoice.client.name}
                  </p>
                  {(() => {
                    // InvoiceSummary retourné par useGetInvoicesQuery n'a pas recipientEmail
                    // On utilise uniquement l'email du client s'il existe
                    let clientEmail: string | undefined = undefined;
                    if (selectedInvoice.client && 'email' in selectedInvoice.client) {
                      const email = selectedInvoice.client.email;
                      if (typeof email === 'string') {
                        clientEmail = email;
                      }
                    }
                    return clientEmail ? (
                      <p className="text-xs text-foreground/70">
                        {t('fields.email')} {clientEmail}
                      </p>
                    ) : null;
                  })()}
                  <p className="text-xs text-foreground/70">
                    {t('fields.amount')} {formatCurrency(selectedInvoice.totalAmount, selectedInvoice.currency)}
                  </p>
                  <p className="text-xs text-foreground/70">
                    {t('fields.dueDate')} {formatDate(selectedInvoice.dueDate)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              {t('buttons.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || availableInvoices.length === 0}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('buttons.sending')}
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  {t('buttons.send')}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReminderModal;

