"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, AlertCircle } from "lucide-react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetInvoicesQuery, useSendReminderMutation, type InvoiceSummary } from "@/services/facturlyApi";
import { toast } from "sonner";
import { useTranslations, useLocale } from 'next-intl';
import { FuryMascot } from "@/components/mascot/FuryMascot";
import { cn } from "@/lib/utils";

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
    <ResponsiveModal
      open={open}
      onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}
      modalMaxWidth="sm:max-w-[600px]"
      contentClassName="rounded-2xl sm:rounded-[20px] border border-border/40 bg-background shadow-2xl shadow-black/5 p-0 overflow-hidden"
      closeButtonClassName="right-4 top-4 h-8 w-8 rounded-full bg-muted/60 hover:bg-muted text-foreground/70"
    >
      <div className="px-5 pt-5 pb-4 border-b border-border/40">
        <DialogHeader className="p-0 text-left space-y-1">
          <DialogTitle className="text-[17px] font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            {t('title')}
          </DialogTitle>
          <DialogDescription className="text-[15px] text-muted-foreground">
            {t('description')}
          </DialogDescription>
        </DialogHeader>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="px-5 py-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="invoice" className="text-[13px] font-medium text-foreground">
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
                <SelectTrigger 
                  id="invoice" 
                  className={cn(
                    "h-11 rounded-xl border-0 bg-muted/30 text-[15px] focus-visible:ring-2 focus-visible:ring-ring/20",
                    form.formState.errors.invoiceId && "border border-destructive focus-visible:ring-destructive/30"
                  )}
                >
                  <SelectValue placeholder={t('fields.invoicePlaceholder')} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-border/40">
                  {availableInvoices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-2 py-6 text-center">
                      <FuryMascot mood="reminder" size="md" className="mb-3" />
                      <p className="text-sm text-muted-foreground">{t('empty.noInvoices')}</p>
                    </div>
                  ) : (
                    availableInvoices.map((invoice) => (
                      <SelectItem key={invoice.id} value={invoice.id}>
                        <div className="flex flex-col">
                          <span className="font-semibold text-[15px]">{invoice.invoiceNumber}</span>
                          <span className="text-[13px] text-muted-foreground">
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
            <p className="text-[13px] text-destructive mt-1">{form.formState.errors.invoiceId.message}</p>
          )}
        </div>

        {selectedInvoice && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <p className="text-[15px] font-semibold text-primary">{selectedInvoice.invoiceNumber}</p>
                <p className="text-[13px] text-foreground/70">
                  {t('fields.client')} {selectedInvoice.client.name}
                </p>
                {(() => {
                  let clientEmail: string | undefined = undefined;
                  if (selectedInvoice.client && 'email' in selectedInvoice.client) {
                    const email = selectedInvoice.client.email;
                    if (typeof email === 'string') {
                      clientEmail = email;
                    }
                  }
                  return clientEmail ? (
                    <p className="text-[13px] text-foreground/70">
                      {t('fields.email')} {clientEmail}
                    </p>
                  ) : null;
                })()}
                <p className="text-[13px] text-foreground/70">
                  {t('fields.amount')} {formatCurrency(selectedInvoice.totalAmount, selectedInvoice.currency)}
                </p>
                <p className="text-[13px] text-foreground/70">
                  {t('fields.dueDate')} {formatDate(selectedInvoice.dueDate)}
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-row justify-end gap-2 pt-4 border-t border-border/40 mt-4">
          <Button 
            type="button" 
            variant="outline" 
            className="h-9 rounded-xl text-[15px] font-medium border-border/60"
            onClick={handleClose} 
            disabled={isLoading}
          >
            {t('buttons.cancel')}
          </Button>
          <Button 
            type="submit" 
            className="h-9 rounded-xl px-4 text-[15px] font-semibold"
            disabled={isLoading || availableInvoices.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('buttons.sending')}
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                {t('buttons.send')}
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </ResponsiveModal>
  );
};

export default ReminderModal;

