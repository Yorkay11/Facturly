"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-primary/10 p-4">
        <Card className="w-full max-w-md bg-gradient-to-br from-red-50 to-white">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 text-destructive mb-2">
              <div className="p-2 rounded-full bg-red-200">
                <AlertCircle className="h-5 w-5" />
              </div>
              <CardTitle className="text-destructive text-xl">Token invalide</CardTitle>
            </div>
            <CardDescription className="text-base leading-relaxed">
              Le lien de la facture est invalide ou manquant.
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
              <CardTitle className="text-destructive text-xl">Erreur</CardTitle>
            </div>
            <CardDescription className="text-base leading-relaxed">
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
            <TableRow>
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
                  Aucun article dans cette facture
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
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
            <TableRow className="bg-primary/5">
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 p-4 py-8 md:py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Logo Facturly avec animation */}
        <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
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
        </div>

        {/* Header avec statut - Design amélioré */}
        <div className="text-center space-y-4 mb-8 animate-in fade-in slide-in-from-top-6 duration-700">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-md bg-gradient-to-br from-primary/10 to-primary/5">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Facture {invoice.invoiceNumber}
              </h1>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="text-primary hover:bg-primary/10 transition-all"
              onClick={() => setIsFullscreenOpen(true)}
              title="Agrandir la facture"
            >
              <Maximize2 className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <InvoiceStatusBadge status={invoice.status} />
            {isPaid && (
              <Badge variant="secondary" className="text-sm px-4 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                Payée
              </Badge>
            )}
            {isRejected && (
              <Badge variant="destructive" className="text-sm px-4 py-1.5">
                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                Refusée
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
                  <CardTitle className="text-xl font-bold" style={{ color: template.accentColor }}>Actions</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {isPaid
                      ? "Cette facture a été payée."
                      : isRejected
                      ? "Cette facture a été refusée."
                      : canAccept
                      ? "Acceptez ou refusez cette facture."
                      : "Aucune action disponible pour le moment."}
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
                    <p className="font-bold text-base">Facture payée</p>
                  </div>
                  <p className="text-sm text-green-700 leading-relaxed">
                    Le paiement de <span className="font-semibold">{formatCurrency(invoice.totalAmount, invoice.currency)}</span> a été
                    effectué avec succès.
                  </p>
                  {invoice.payments && invoice.payments.length > 0 && (
                    <div className="mt-3 pt-3 space-y-2">
                      {invoice.payments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between text-xs text-green-700 bg-white/50 rounded-md p-2">
                          <span className="font-medium">{formatCurrency(payment.amount, invoice.currency)}</span>
                          <span className="opacity-70">{formatDate(payment.paymentDate)}</span>
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
                    <p className="font-bold text-base">Facture refusée</p>
                  </div>
                  {invoice.rejectionComment && (
                    <div className="text-sm text-red-700 bg-white/50 rounded-md p-3">
                      <p className="font-semibold mb-2">Commentaire :</p>
                      <p className="whitespace-pre-wrap leading-relaxed">{invoice.rejectionComment}</p>
                    </div>
                  )}
                  {invoice.rejectionReason && (
                    <div className="text-xs text-red-600 bg-white/50 rounded-md p-2">
                      <span className="font-semibold">Raison :</span> {invoice.rejectionReason}
                    </div>
                  )}
                  {invoice.rejectedAt && (
                    <div className="text-xs text-red-600">
                      Refusée le {formatDate(invoice.rejectedAt)}
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
                        Traitement...
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        Accepter la facture
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
                    Refuser la facture
                  </Button>
                </div>
              )}

              {canPay && !isPaid && !isRejected && (
                <Button
                  className="w-full gap-2 h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transition-all duration-300"
                  onClick={() => router.push(`/pay/${token}`)}
                  size="lg"
                >
                  💳 Payer maintenant
                </Button>
              )}

              {!canAccept && !canPay && !isPaid && !isRejected && (
                <div className="space-y-3 rounded-md bg-gradient-to-br from-yellow-50 to-yellow-100/50 p-5">
                  <div className="flex items-center gap-3 text-yellow-700">
                    <div className="p-2 rounded-full bg-yellow-200">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <p className="font-bold text-base">Action indisponible</p>
                  </div>
                  <p className="text-sm text-yellow-700 leading-relaxed">
                    Cette facture ne peut pas être acceptée ou payée pour le moment. Veuillez
                    contacter l&apos;émetteur.
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
                <CardTitle className="text-red-700">Information de refus</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 text-sm text-red-700">
              <p className="whitespace-pre-wrap leading-relaxed">{invoice.rejectionComment}</p>
              {invoice.rejectionReason && (
                <p className="mt-4 pt-4 text-xs">
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

      {/* Fullscreen Invoice Dialog - Design amélioré */}
      <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] p-0 overflow-hidden bg-gradient-to-br from-primary/5 to-white">
          <DialogHeader className="px-6 pt-6 pb-4 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Facture {invoice.invoiceNumber}
                </DialogTitle>
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
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-5xl mx-auto">
              {renderInvoiceContent()}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

