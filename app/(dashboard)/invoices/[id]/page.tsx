"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, RefreshCcw, Edit, Trash2, Link as LinkIcon } from "lucide-react";
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
import { useGetInvoiceByIdQuery, useDeleteInvoiceMutation, useCancelInvoiceMutation, useSendInvoiceMutation, useMarkInvoicePaidMutation } from "@/services/facturlyApi";
import { toast } from "sonner";
import Breadcrumb from "@/components/ui/breadcrumb";
import { ReminderModal } from "@/components/modals/ReminderModal";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

export default function InvoiceDetailPage() {
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
  const [deleteInvoice, { isLoading: isDeleting }] = useDeleteInvoiceMutation();
  const [cancelInvoice, { isLoading: isCancelling }] = useCancelInvoiceMutation();
  const [markInvoicePaid, { isLoading: isMarkingPaid }] = useMarkInvoicePaidMutation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showMarkPaidDialog, setShowMarkPaidDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [paymentNotes, setPaymentNotes] = useState("");

  const handleDelete = async () => {
    if (!invoiceId || !invoice) return;

    try {
      if (invoice.status === "draft") {
        await deleteInvoice(invoiceId).unwrap();
        toast.success("Facture supprimée", {
          description: `La facture ${invoice.invoiceNumber} a été supprimée avec succès.`,
        });
        router.push("/invoices");
      } else {
        await cancelInvoice(invoiceId).unwrap();
        toast.success("Facture annulée", {
          description: `La facture ${invoice.invoiceNumber} a été annulée avec succès.`,
        });
        setShowDeleteDialog(false);
      }
    } catch (error) {
      let errorMessage = "Une erreur est survenue lors de la suppression.";
      if (error && typeof error === "object" && error !== null && "data" in error) {
        errorMessage = (error.data as { message?: string })?.message ?? errorMessage;
      }
      toast.error("Erreur", {
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
            { label: "Tableau de bord", href: "/dashboard" },
            { label: "Factures", href: "/invoices" },
            { label: "Détails" },
          ]}
          className="text-xs"
        />
        <div className="rounded-xl border border-destructive bg-destructive/10 p-6 text-sm text-destructive">
          <p className="font-semibold mb-2">ID de facture invalide</p>
          <p className="mb-4">L&apos;identifiant de la facture est manquant ou invalide.</p>
          <Button variant="outline" onClick={() => router.push('/invoices')}>
            Retour à la liste des factures
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
            { label: "Tableau de bord", href: "/dashboard" },
            { label: "Factures", href: "/invoices" },
            { label: "Détails" },
          ]}
          className="text-xs"
        />
        <div className="rounded-xl border border-destructive bg-destructive/10 p-6 text-sm text-destructive">
          <p className="font-semibold mb-2">Impossible de charger la facture</p>
          <p className="mb-4">La facture demandée n&apos;existe pas ou une erreur est survenue.</p>
          <Button variant="outline" onClick={() => router.push('/invoices')}>
            Retour à la liste des factures
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
      toast.success("Lien copié", {
        description: "Le lien de paiement a été copié dans le presse-papiers.",
      });
    }
  };

  const handleCopyPublicLink = () => {
    const publicLink = getPublicInvoiceLink();
    if (publicLink) {
      navigator.clipboard.writeText(publicLink);
      toast.success("Lien copié", {
        description: "Le lien public de visualisation a été copié dans le presse-papiers.",
      });
    }
  };

  const handleMarkPaid = async () => {
    if (!invoiceId || !invoice) return;

    const amount = paymentAmount || invoice.totalAmount;
    const remainingAmount = parseFloat(invoice.totalAmount) - parseFloat(invoice.amountPaid);

    if (parseFloat(amount) > remainingAmount) {
      toast.error("Erreur", {
        description: `Le montant ne peut pas dépasser ${formatCurrency(remainingAmount.toString(), invoice.currency)}.`,
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
      toast.success("Facture marquée comme payée", {
        description: `Le paiement de ${formatCurrency(amount, invoice.currency)} a été enregistré.`,
      });
      setShowMarkPaidDialog(false);
      setPaymentAmount("");
      setPaymentNotes("");
    } catch (error) {
      let errorMessage = "Une erreur est survenue lors de l'enregistrement du paiement.";
      if (error && typeof error === "object" && error !== null && "data" in error) {
        errorMessage = (error.data as { message?: string })?.message ?? errorMessage;
      }
      toast.error("Erreur", {
        description: errorMessage,
      });
    }
  };

  const timeline = [
    {
      title: "Facture créée",
      date: formatDate(invoice.issueDate),
      description: "Document généré et enregistré dans Facturly.",
    },
    {
      title: invoice.sentAt ? "Envoyée au client" : "Brouillon",
      date: invoice.sentAt ? formatDate(invoice.sentAt) : formatDate(invoice.issueDate),
      description: invoice.sentAt ? `Email envoyé à ${clientEmail ?? clientName}.` : "Facture en brouillon, non envoyée.",
    },
    {
      title: invoice.status === "paid" ? "Paiement reçu" : "En attente",
      date: formatDate(invoice.dueDate),
      description:
        invoice.status === "paid"
          ? "Paiement confirmé et rapproché."
          : "Paiement en attente, planifier une relance.",
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Tableau de bord", href: "/dashboard" },
          { label: "Factures", href: "/invoices" },
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
            Facture destinée à {clientName}. Total dû : {formatCurrency(invoice.totalAmount, invoice.currency)}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {invoice.status === "draft" && (
            <Button 
              className="gap-2 bg-primary hover:bg-primary/90"
              onClick={() => router.push(`/invoices/${invoiceId}/edit`)}
            >
              <Edit className="h-4 w-4" />
              Modifier
            </Button>
          )}
          {invoice.status !== "draft" && invoice.paymentLinkToken && (
            <>
              <Button
                variant="outline"
                className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
                onClick={handleCopyPublicLink}
              >
                <LinkIcon className="h-4 w-4" />
                Copier le lien public
              </Button>
              {invoice.paymentLink && (
                <Button
                  variant="outline"
                  className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
                  onClick={handleCopyPaymentLink}
                >
                  <LinkIcon className="h-4 w-4" />
                  Copier le lien de paiement
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
                Envoyer un rappel
              </Button>
              <Button 
                className="gap-2"
                onClick={() => {
                  setPaymentAmount((parseFloat(invoice.totalAmount) - parseFloat(invoice.amountPaid)).toString());
                  setShowMarkPaidDialog(true);
                }}
              >
                <RefreshCcw className="h-4 w-4" />
                Marquer comme payé
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
            {invoice.status === "draft" ? "Supprimer" : "Annuler"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-primary/20">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-primary">Résumé</CardTitle>
              <CardDescription>Détails principaux de la facture.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs uppercase text-foreground/50">Client</p>
              <p className="text-sm font-semibold text-foreground">{clientName}</p>
              <p className="text-xs text-foreground/60">{clientEmail ?? "Email non disponible"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase text-foreground/50">Montant</p>
              <p className="text-sm font-semibold text-primary">
                {formatCurrency(invoice.totalAmount, invoice.currency)}
              </p>
              <p className="text-xs text-foreground/60">TVA incluse ({formatCurrency(invoice.taxAmount, invoice.currency)})</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase text-foreground/50">Date d&apos;émission</p>
              <p className="text-sm text-foreground">{formatDate(invoice.issueDate)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase text-foreground/50">Échéance</p>
              <p className="text-sm text-foreground">{formatDate(invoice.dueDate)}</p>
            </div>
          </CardContent>
          <Separator className="mx-6" />
          <CardContent className="space-y-4">
            <Table>
              <TableHeader className="bg-primary/5">
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead className="text-right">P.U.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
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
                      Aucun item dans cette facture
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-primary/20 self-start">
          <CardHeader>
            <CardTitle className="text-primary">Timeline</CardTitle>
            <CardDescription>Suivi des événements de la facture.</CardDescription>
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
      </div>

      {invoice.notes && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Notes</CardTitle>
            <CardDescription>Notes associées à cette facture.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-foreground/70">
            <p className="whitespace-pre-wrap">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}

      {invoice.payments && invoice.payments.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Paiements</CardTitle>
            <CardDescription>Historique des paiements reçus pour cette facture.</CardDescription>
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
                      {payment.status === "completed" ? "Complété" : payment.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-foreground/60">
                    <p>Date : {formatDate(payment.paymentDate)}</p>
                    <p>Méthode : {payment.method}</p>
                    {payment.notes && <p>Notes : {payment.notes}</p>}
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
            <DialogTitle>Marquer comme payé</DialogTitle>
            <DialogDescription>
              Enregistrez un paiement reçu pour la facture {invoice.invoiceNumber}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Montant *</Label>
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder={invoice.totalAmount}
              />
              <p className="text-xs text-foreground/60">
                Restant à payer : {formatCurrency(
                  (parseFloat(invoice.totalAmount) - parseFloat(invoice.amountPaid)).toString(),
                  invoice.currency
                )}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-date">Date de paiement *</Label>
              <Input
                id="payment-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-method">Méthode de paiement *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="payment-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                  <SelectItem value="check">Chèque</SelectItem>
                  <SelectItem value="cash">Espèces</SelectItem>
                  <SelectItem value="online_payment">Paiement en ligne</SelectItem>
                  <SelectItem value="card">Carte bancaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-notes">Notes (optionnel)</Label>
              <Textarea
                id="payment-notes"
                placeholder="Ajouter des notes sur le paiement..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMarkPaidDialog(false)} disabled={isMarkingPaid}>
              Annuler
            </Button>
            <Button onClick={handleMarkPaid} disabled={isMarkingPaid || !paymentAmount || !paymentDate}>
              {isMarkingPaid ? "Traitement..." : "Enregistrer le paiement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {invoice.status === "draft" ? "Supprimer la facture ?" : "Annuler la facture ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {invoice.status === "draft"
                ? `Êtes-vous sûr de vouloir supprimer la facture ${invoice.invoiceNumber} ? Cette action est irréversible.`
                : `Êtes-vous sûr de vouloir annuler la facture ${invoice.invoiceNumber} ? Cette action changera le statut de la facture.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting || isCancelling}
            >
              {isDeleting || isCancelling ? "Traitement..." : invoice.status === "draft" ? "Supprimer" : "Annuler"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
