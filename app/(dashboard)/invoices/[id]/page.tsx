"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Mail, RefreshCcw, Edit, Trash2 } from "lucide-react";
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
import Skeleton from "@/components/ui/skeleton";
import { useGetInvoiceByIdQuery, useDeleteInvoiceMutation, useCancelInvoiceMutation } from "@/services/facturlyApi";
import { toast } from "sonner";
import Breadcrumb from "@/components/ui/breadcrumb";

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
          <Button variant="outline" className="gap-2 border-primary/40 text-primary hover:bg-primary/10">
            <Download className="h-4 w-4" />
            Télécharger (mock)
          </Button>
          {invoice.status !== "draft" && (
            <>
              <Button variant="outline" className="gap-2 border-primary/40 text-primary hover:bg-primary/10">
                <Mail className="h-4 w-4" />
                Envoyer un rappel
              </Button>
              <Button className="gap-2">
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

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">Notes internes</CardTitle>
          <CardDescription>
            Ces informations sont fictives. Elles seront connectées à la base de données dans la version API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-foreground/70">
          <p>
            Prévoir une relance téléphonique si le paiement n&apos;est pas reçu 3 jours après l&apos;échéance. Ajouter des pénalités si le retard dépasse 15 jours.
          </p>
          <Separator />
          <p>
            Dernière note : le client a confirmé la réception par email, en attente de signature du responsable financier.
          </p>
        </CardContent>
      </Card>

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
