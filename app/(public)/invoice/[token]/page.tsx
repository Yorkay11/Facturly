"use client";

import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, FileText, XCircle, Check, X, Loader2, Maximize2 } from "lucide-react";
import { useState } from "react";

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

export default function PublicInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

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

  const handleAccept = async () => {
    if (!token || !invoiceData) return;

    try {
      const response = await acceptInvoice(token).unwrap();
      toast.success("Facture acceptée", {
        description: "Vous allez être redirigé vers la page de paiement.",
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
      let errorMessage = "Une erreur est survenue lors de l'acceptation de la facture.";
      if (error && typeof error === "object" && error !== null && "data" in error) {
        errorMessage = (error.data as { message?: string })?.message ?? errorMessage;
      }
      toast.error("Erreur", {
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
    toast.success("Facture refusée", {
      description: "La facture a été refusée avec succès.",
    });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Token invalide</CardTitle>
            <CardDescription>Le lien de la facture est invalide ou manquant.</CardDescription>
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
                ? (error.data as { message?: string })?.message ||
                  "Impossible de charger la facture."
                : "La facture demandée n'existe pas ou le lien a expiré."}
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

  // Template Classic par défaut (couleurs du template)
  const template = {
    accentColor: "#6C4AB6",
    backgroundColor: "#F5F2FF",
    textColor: "#1F1B2E",
    name: "Classique Violet",
  };

  // Fonction pour rendre la facture (réutilisable pour le plein écran)
  const renderInvoiceContent = () => (
    <div
      className="rounded-xl border-2 shadow-2xl space-y-10 p-10 md:p-16 bg-white"
      style={{
        backgroundColor: template.backgroundColor || "#fff",
        color: template.textColor || "#1F1B2E",
        borderColor: `${template.accentColor}20`,
      }}
    >
      {/* Header avec émetteur et destinataire */}
      <div className="flex flex-col gap-8 md:flex-row md:justify-between md:items-start">
        <div className="space-y-6 flex-1">
          {/* Émetteur */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: template.accentColor }}>
              Émetteur
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
              {invoice.issuer?.taxId && (
                <p className="text-xs opacity-70 mt-2">SIRET : {invoice.issuer.taxId}</p>
              )}
              {invoice.issuer?.vatNumber && (
                <p className="text-xs opacity-70">TVA : {invoice.issuer.vatNumber}</p>
              )}
              {invoice.issuer?.email && (
                <p className="text-xs opacity-70 mt-2">{invoice.issuer.email}</p>
              )}
            </div>
          </div>

          {/* Destinataire */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: template.accentColor }}>
              Destinataire
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
          <p className="text-xs font-bold uppercase opacity-70 tracking-wider">Informations</p>
          <div className="space-y-2">
            <div>
              <p className="text-xs opacity-70">Numéro</p>
              <p className="text-base font-bold" style={{ color: template.accentColor }}>
                {invoice.invoiceNumber}
              </p>
            </div>
            <div>
              <p className="text-xs opacity-70">Émise le</p>
              <p className="text-sm font-semibold">{formatDate(invoice.issueDate)}</p>
            </div>
            <div>
              <p className="text-xs opacity-70">Échéance</p>
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
            <TableRow className="border-b-2" style={{ borderColor: `${template.accentColor}30` }}>
              <TableHead className="text-sm font-bold py-4" style={{ color: template.accentColor }}>
                Description
              </TableHead>
              <TableHead className="text-right text-sm font-bold py-4" style={{ color: template.accentColor }}>
                Quantité
              </TableHead>
              <TableHead className="text-right text-sm font-bold py-4" style={{ color: template.accentColor }}>
                Prix unitaire
              </TableHead>
              <TableHead className="text-right text-sm font-bold py-4" style={{ color: template.accentColor }}>
                Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
              items.map((item) => (
                <TableRow key={item.id} className="border-b hover:bg-primary/5 transition-colors">
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
                  Aucun article dans cette facture
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow className="border-t-2" style={{ borderColor: `${template.accentColor}30` }}>
              <TableCell colSpan={3} className="text-right text-sm font-semibold py-4 opacity-70">
                Sous-total HT
              </TableCell>
              <TableCell className="text-right text-base font-semibold py-4">
                {formatCurrency(invoice.subtotalAmount, invoice.currency)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} className="text-right text-sm font-semibold py-3 opacity-70">
                TVA
              </TableCell>
              <TableCell className="text-right text-base font-semibold py-3">
                {formatCurrency(invoice.taxAmount, invoice.currency)}
              </TableCell>
            </TableRow>
            {invoice.amountPaid !== "0.00" && (
              <>
                <TableRow>
                  <TableCell colSpan={3} className="text-right text-sm font-semibold py-3 opacity-70">
                    Montant payé
                  </TableCell>
                  <TableCell className="text-right text-base font-semibold py-3 text-green-600">
                    {formatCurrency(invoice.amountPaid, invoice.currency)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className="text-right text-sm font-semibold py-3 opacity-70">
                    Restant à payer
                  </TableCell>
                  <TableCell className="text-right text-base font-semibold py-3">
                    {formatCurrency(invoice.remainingAmount, invoice.currency)}
                  </TableCell>
                </TableRow>
              </>
            )}
            <TableRow className="border-t-2 bg-primary/5" style={{ borderColor: `${template.accentColor}40` }}>
              <TableCell colSpan={3} className="text-right text-base font-bold py-4">
                Total TTC
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
              Notes
            </p>
            <p className="text-sm leading-relaxed opacity-80 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 p-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header avec statut */}
        <div className="text-center space-y-3 mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <FileText className="h-8 w-8" style={{ color: template.accentColor }} />
            <h1 className="text-4xl font-bold tracking-tight" style={{ color: template.textColor }}>
              Facture {invoice.invoiceNumber}
            </h1>
            <Button
              variant="outline"
              size="icon"
              className="ml-2 border-primary/40 text-primary hover:bg-primary/10"
              onClick={() => setIsFullscreenOpen(true)}
              title="Agrandir la facture"
            >
              <Maximize2 className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2">
            <InvoiceStatusBadge status={invoice.status} />
            {isPaid && (
              <Badge variant="secondary" className="text-base px-4 py-2">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Payée
              </Badge>
            )}
            {isRejected && (
              <Badge variant="destructive" className="text-base px-4 py-2">
                <XCircle className="h-4 w-4 mr-2" />
                Refusée
              </Badge>
            )}
          </div>
        </div>

        {/* Invoice Template */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Main Invoice Template - Style professionnel agrandi */}
          {renderInvoiceContent()}

          {/* Actions Card - Plus compact */}
          <Card className="border-2 shadow-lg self-start sticky top-4" style={{ borderColor: `${template.accentColor}30` }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg" style={{ color: template.accentColor }}>Actions</CardTitle>
              <CardDescription className="text-xs">
                {isPaid
                  ? "Cette facture a été payée."
                  : isRejected
                  ? "Cette facture a été refusée."
                  : canAccept
                  ? "Acceptez ou refusez cette facture."
                  : "Aucune action disponible pour le moment."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Messages */}
              {isPaid && (
                <div className="space-y-2 rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="font-semibold">Facture payée</p>
                  </div>
                  <p className="text-sm text-green-600">
                    Le paiement de {formatCurrency(invoice.totalAmount, invoice.currency)} a été
                    effectué avec succès.
                  </p>
                  {invoice.payments && invoice.payments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {invoice.payments.map((payment) => (
                        <div key={payment.id} className="text-xs text-green-600">
                          {formatCurrency(payment.amount, invoice.currency)} payé le{" "}
                          {formatDate(payment.paymentDate)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {isRejected && (
                <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <XCircle className="h-5 w-5" />
                    <p className="font-semibold">Facture refusée</p>
                  </div>
                  {invoice.rejectionComment && (
                    <div className="text-sm text-red-600">
                      <p className="font-semibold mb-1">Commentaire :</p>
                      <p className="whitespace-pre-wrap">{invoice.rejectionComment}</p>
                    </div>
                  )}
                  {invoice.rejectionReason && (
                    <div className="text-xs text-red-600 mt-2">
                      Raison : {invoice.rejectionReason}
                    </div>
                  )}
                  {invoice.rejectedAt && (
                    <div className="text-xs text-red-600">
                      Refusée le {formatDate(invoice.rejectedAt)}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {canAccept && (
                <div className="space-y-3">
                  <Button
                    className="w-full gap-2"
                    onClick={handleAccept}
                    disabled={isAccepting}
                    size="lg"
                  >
                    {isAccepting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Accepter la facture
                      </>
                    )}
                  </Button>
                  <Button
                    className="w-full gap-2"
                    variant="destructive"
                    onClick={handleRejectClick}
                    size="lg"
                  >
                    <X className="h-4 w-4" />
                    Refuser la facture
                  </Button>
                </div>
              )}

              {canPay && !isPaid && !isRejected && (
                <Button
                  className="w-full gap-2"
                  onClick={() => router.push(`/pay/${token}`)}
                  size="lg"
                >
                  Payer maintenant
                </Button>
              )}

              {!canAccept && !canPay && !isPaid && !isRejected && (
                <div className="space-y-2 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <AlertCircle className="h-5 w-5" />
                    <p className="font-semibold">Action indisponible</p>
                  </div>
                  <p className="text-sm text-yellow-600">
                    Cette facture ne peut pas être acceptée ou payée pour le moment. Veuillez
                    contacter l&apos;émetteur.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rejection Info (if rejected) */}
        {isRejected && invoice.rejectionComment && (
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="text-red-700">Information de refus</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-red-600">
              <p className="whitespace-pre-wrap">{invoice.rejectionComment}</p>
              {invoice.rejectionReason && (
                <p className="mt-2 text-xs">
                  Raison : <span className="font-semibold">{invoice.rejectionReason}</span>
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

      {/* Fullscreen Invoice Dialog */}
      <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] p-6 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold" style={{ color: template.accentColor }}>
              Facture {invoice.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-6 overflow-y-auto">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              {renderInvoiceContent()}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

