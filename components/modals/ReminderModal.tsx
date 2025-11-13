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
import { useGetInvoicesQuery, useSendInvoiceMutation, type Invoice, type InvoiceSummary } from "@/services/facturlyApi";
import { toast } from "sonner";

const reminderSchema = z.object({
  invoiceId: z.string().min(1, "Veuillez sélectionner une facture"),
  sendEmail: z.boolean().default(true),
});

type ReminderFormValues = z.infer<typeof reminderSchema>;

interface ReminderModalProps {
  open: boolean;
  onClose: () => void;
  preselectedInvoiceId?: string;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatCurrency = (value: string | number, currency: string) => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(numValue);
};

export const ReminderModal = ({ open, onClose, preselectedInvoiceId }: ReminderModalProps) => {
  const [sendInvoice, { isLoading, isSuccess, isError, error }] = useSendInvoiceMutation();
  
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
      sendEmail: true,
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
      toast.success("Relance envoyée", {
        description: "La relance a été envoyée avec succès.",
      });
      form.reset();
      onClose();
    }
  }, [isSuccess, form, onClose]);

  useEffect(() => {
    if (isError && error) {
      const errorMessage = error && "data" in error
        ? (error.data as { message?: string })?.message ?? "Une erreur est survenue lors de l'envoi de la relance."
        : "Vérifiez vos informations ou réessayez plus tard.";
      
      toast.error("Erreur", {
        description: errorMessage,
      });
    }
  }, [error, isError]);

  const onSubmit = async (values: ReminderFormValues) => {
    if (!values.invoiceId) {
      toast.error("Erreur", {
        description: "Veuillez sélectionner une facture.",
      });
      return;
    }

    const invoice = availableInvoices.find((inv) => inv.id === values.invoiceId);
    if (!invoice) {
      toast.error("Erreur", {
        description: "Facture introuvable.",
      });
      return;
    }

    try {
      // InvoiceSummary retourné par useGetInvoicesQuery n'a pas recipientEmail
      // On utilise uniquement l'email du client s'il existe
      let clientEmail: string | undefined = undefined;
      if (invoice.client && 'email' in invoice.client) {
        const email = invoice.client.email;
        if (typeof email === 'string') {
          clientEmail = email;
        }
      }
      
      await sendInvoice({
        id: values.invoiceId,
        payload: {
          sendEmail: values.sendEmail,
          emailTo: clientEmail,
        },
      }).unwrap();
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
            Créer une relance
          </DialogTitle>
          <DialogDescription>
            Sélectionnez une facture en retard et envoyez une relance au client.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoice">
              Facture <span className="text-destructive">*</span>
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
                    <SelectValue placeholder="Sélectionnez une facture en retard" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableInvoices.length === 0 ? (
                      <div className="px-2 py-6 text-center text-sm text-foreground/60">
                        Aucune facture en retard disponible
                      </div>
                    ) : (
                      availableInvoices.map((invoice) => (
                        <SelectItem key={invoice.id} value={invoice.id}>
                          <div className="flex flex-col">
                            <span className="font-semibold">{invoice.invoiceNumber}</span>
                            <span className="text-xs text-foreground/60">
                              {invoice.client.name} • {formatCurrency(invoice.totalAmount, invoice.currency)} • Échéance: {formatDate(invoice.dueDate)}
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
                    Client: {selectedInvoice.client.name}
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
                        Email: {clientEmail}
                      </p>
                    ) : null;
                  })()}
                  <p className="text-xs text-foreground/70">
                    Montant: {formatCurrency(selectedInvoice.totalAmount, selectedInvoice.currency)}
                  </p>
                  <p className="text-xs text-foreground/70">
                    Date d&apos;échéance: {formatDate(selectedInvoice.dueDate)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || availableInvoices.length === 0}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Envoyer la relance
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

