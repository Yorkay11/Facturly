"use client";

import Link from "next/link";
import { Plus, Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import Breadcrumb from "@/components/ui/breadcrumb";
import Skeleton from "@/components/ui/skeleton";
import { useGetInvoicesQuery, useDeleteInvoiceMutation, useCancelInvoiceMutation } from "@/services/facturlyApi";
import { toast } from "sonner";

import InvoiceStatusBadge from "@/components/invoices/InvoiceStatusBadge";

const formatCurrency = (value: string | number, currency: string) => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(numValue);
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export default function InvoicesPage() {
  const router = useRouter();
  const { data: invoicesResponse, isLoading, isError } = useGetInvoicesQuery({ page: 1, limit: 100 });
  const [deleteInvoice, { isLoading: isDeleting }] = useDeleteInvoiceMutation();
  const [cancelInvoice, { isLoading: isCancelling }] = useCancelInvoiceMutation();
  const [invoiceToDelete, setInvoiceToDelete] = useState<{ id: string; number: string; status: string } | null>(null);
  
  const invoices = invoicesResponse?.data ?? [];
  const totalInvoices = invoicesResponse?.meta?.total ?? 0;

  const handleDeleteClick = (invoice: { id: string; invoiceNumber: string; status: string }) => {
    setInvoiceToDelete({ id: invoice.id, number: invoice.invoiceNumber, status: invoice.status });
  };

  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return;

    try {
      // Pour les brouillons, on supprime. Pour les autres, on annule.
      if (invoiceToDelete.status === "draft") {
        await deleteInvoice(invoiceToDelete.id).unwrap();
        toast.success("Facture supprimée", {
          description: `La facture ${invoiceToDelete.number} a été supprimée avec succès.`,
        });
      } else {
        await cancelInvoice(invoiceToDelete.id).unwrap();
        toast.success("Facture annulée", {
          description: `La facture ${invoiceToDelete.number} a été annulée avec succès.`,
        });
      }
      setInvoiceToDelete(null);
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
  
  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Tableau de bord", href: "/dashboard" },
          { label: "Factures" },
        ]}
        className="text-xs"
      />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-primary">Factures</h1>
            <p className="mt-1 text-sm text-foreground/70">
              Suivez vos brouillons, factures envoyées et paiements reçus.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 border-primary/40 text-primary hover:bg-primary/10">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
            <Button className="gap-2" asChild>
              <Link href="/invoices/new">
                <Plus className="h-4 w-4" />
                Nouvelle facture
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <Input
              placeholder="Rechercher (client, numéro...)"
              className="max-w-sm"
            />
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="sent">Envoyée</SelectItem>
                <SelectItem value="paid">Payée</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-foreground/60">
            {invoices ? `${invoices.length} facture(s) affichées` : "Chargement..."}
          </div>
        </div>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive bg-destructive/10 p-6 text-sm text-destructive">
            Erreur lors du chargement des factures. Vérifiez l&apos;API.
          </div>
        )}

        {!isLoading && !isError && invoices && invoices.length > 0 && (
          <div className="relative z-0 overflow-x-auto rounded-xl border border-primary/20 bg-white shadow-sm">
            <Table>
              <TableHeader className="bg-primary/5">
                <TableRow>
                  <TableHead className="w-[140px]">Numéro</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date émission</TableHead>
                  <TableHead>Date échéance</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-primary/5">
                    <TableCell className="font-medium text-primary">
                      <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                        {invoice.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-foreground/70">
                      {invoice.client.name}
                    </TableCell>
                    <TableCell className="text-sm text-foreground/60">
                      {formatDate(invoice.issueDate)}
                    </TableCell>
                    <TableCell className="text-sm text-foreground/60">
                      {formatDate(invoice.dueDate)}
                    </TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={invoice.status as "draft" | "sent" | "paid" | "overdue" | "cancelled"} />
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      {formatCurrency(invoice.totalAmount, invoice.currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteClick(invoice)}
                        disabled={isDeleting || isCancelling || invoice.status === "cancelled"}
                        title={invoice.status === "draft" ? "Supprimer" : "Annuler"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!isLoading && !isError && (!invoices || invoices.length === 0) && (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-primary/30 bg-white py-16 shadow-sm">
            <p className="text-xl font-semibold text-primary">Aucune facture pour le moment</p>
            <p className="max-w-md text-center text-sm text-foreground/60">
              Créez votre première facture pour expédier des documents professionnels et suivre vos paiements.
            </p>
            <Button className="gap-2" asChild>
              <Link href="/invoices/new">
                <Plus className="h-4 w-4" />
                Créer une facture
              </Link>
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={!!invoiceToDelete} onOpenChange={(open) => !open && setInvoiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {invoiceToDelete?.status === "draft" ? "Supprimer la facture ?" : "Annuler la facture ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {invoiceToDelete?.status === "draft" 
                ? `Êtes-vous sûr de vouloir supprimer la facture ${invoiceToDelete?.number} ? Cette action est irréversible.`
                : `Êtes-vous sûr de vouloir annuler la facture ${invoiceToDelete?.number} ? Cette action changera le statut de la facture.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting || isCancelling}
            >
              {isDeleting || isCancelling ? "Traitement..." : invoiceToDelete?.status === "draft" ? "Supprimer" : "Annuler"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
