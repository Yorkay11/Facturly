"use client";

import { useParams, useRouter } from "next/navigation";
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

export default function PublicPayPage() {
  const params = useParams();
  const router = useRouter();
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
      toast.success("Paiement effectué", {
        description: `Le paiement de ${formatCurrency(invoiceData.invoice.totalAmount, invoiceData.invoice.currency)} a été effectué avec succès.`,
      });
      // Recharger les données pour voir le statut mis à jour
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      let errorMessage = "Une erreur est survenue lors du paiement.";
      if (error && typeof error === "object" && error !== null && "data" in error) {
        errorMessage = (error.data as { message?: string })?.message ?? errorMessage;
      }
      toast.error("Erreur", {
        description: errorMessage,
      });
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Token invalide</CardTitle>
            <CardDescription>Le lien de paiement est invalide ou manquant.</CardDescription>
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
              <CardTitle className="text-destructive">Erreur</CardTitle>
            </div>
            <CardDescription>
              {error && typeof error === "object" && "data" in error
                ? (error.data as { message?: string })?.message || "Impossible de charger la facture."
                : "La facture demandée n&apos;existe pas ou le lien a expiré."}
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
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-semibold tracking-tight">Facture {invoice.invoiceNumber}</h1>
          </div>
          {isPaid && (
            <Badge variant="secondary" className="text-base px-4 py-2">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Facture payée
            </Badge>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="border-primary/20">
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-primary">Détails de la facture</CardTitle>
                <CardDescription>Informations sur la facture à payer.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs uppercase text-foreground/50">Émetteur</p>
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
                <p className="text-xs uppercase text-foreground/50">Montant total</p>
                <p className="text-sm font-semibold text-primary">
                  {formatCurrency(invoice.totalAmount, invoice.currency)}
                </p>
                <p className="text-xs text-foreground/60">
                  Restant à payer : {formatCurrency(invoiceData.remainingAmount, invoice.currency)}
                </p>
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
              <CardTitle className="text-primary">Paiement</CardTitle>
              <CardDescription>
                {isPaid
                  ? "Cette facture a été payée."
                  : canPay
                  ? "Effectuez le paiement de cette facture."
                  : "Cette facture ne peut pas être payée pour le moment."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isPaid ? (
                <div className="space-y-2 rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="font-semibold">Facture payée</p>
                  </div>
                  <p className="text-sm text-green-600">
                    Le paiement de {formatCurrency(invoice.totalAmount, invoice.currency)} a été effectué avec succès.
                  </p>
                </div>
              ) : canPay ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment-method">Méthode de paiement</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger id="payment-method">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online_payment">Paiement en ligne</SelectItem>
                        <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                        <SelectItem value="check">Chèque</SelectItem>
                        <SelectItem value="cash">Espèces</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment-email">Email (optionnel)</Label>
                    <Input
                      id="payment-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={paymentEmail}
                      onChange={(e) => setPaymentEmail(e.target.value)}
                    />
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
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-foreground/70">Montant à payer</span>
                      <span className="text-lg font-semibold text-primary">
                        {formatCurrency(invoiceData.remainingAmount, invoice.currency)}
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
                    {isPaying ? "Traitement du paiement..." : "Payer maintenant"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <AlertCircle className="h-5 w-5" />
                    <p className="font-semibold">Paiement indisponible</p>
                  </div>
                  <p className="text-sm text-yellow-600">
                    Cette facture ne peut pas être payée pour le moment. Veuillez contacter l&apos;émetteur.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {invoice.notes && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Notes</CardTitle>
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

