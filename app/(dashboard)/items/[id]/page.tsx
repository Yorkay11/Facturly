"use client";

import Link from "next/link";
import { History, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { useGetProductsQuery, useGetInvoicesQuery, useDeleteProductMutation } from "@/services/facturlyApi";
import { toast } from "sonner";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: productsResponse, isLoading, isError } = useGetProductsQuery({ page: 1, limit: 100 });
  const { data: invoicesResponse } = useGetInvoicesQuery({ page: 1, limit: 100 });
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const product = productsResponse?.data?.find((item) => item.id === params.id);

  const handleDelete = async () => {
    if (!product) return;

    try {
      await deleteProduct(product.id).unwrap();
      toast.success("Produit supprimé", {
        description: `Le produit ${product.name} a été supprimé avec succès.`,
      });
      router.push("/items");
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="rounded-xl border border-destructive bg-destructive/10 p-6 text-sm text-destructive">
        Produit introuvable ou erreur API.
      </div>
    );
  }

  // Filtrer les factures qui contiennent ce produit
  // Note: On ne peut pas vérifier directement car InvoiceSummary n'a pas les items
  // On affiche les factures récentes, mais idéalement il faudrait un endpoint pour filtrer par productId
  const relatedInvoices = (invoicesResponse?.data ?? []).slice(0, 4);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Tableau de bord", href: "/dashboard" },
          { label: "Produits", href: "/items" },
          { label: product.name },
        ]}
        className="text-xs"
      />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">{product?.name}</h1>
          <p className="text-sm text-foreground/60">
            Fiche détaillée du produit. Consultez les informations et l&apos;historique d&apos;utilisation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="destructive"
            className="gap-2"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Résumé</CardTitle>
          <CardDescription>Informations du produit #{product?.id.slice(0, 8)}.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs uppercase text-foreground/50">Tarif HT</p>
            <p className="text-2xl font-semibold text-primary">
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: product.currency || "EUR",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(parseFloat(product.price ?? "0"))}
            </p>
            <p className="text-xs text-foreground/50">TVA par défaut : {product.taxRate ?? "0"}%</p>
          </div>
          {product.updatedAt && (
            <div className="space-y-2">
              <p className="text-xs uppercase text-foreground/50">Dernière mise à jour</p>
              <p className="text-2xl font-semibold">
                {new Date(product.updatedAt).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
              <p className="text-xs text-foreground/50">
                {new Date(product.updatedAt).toLocaleDateString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="self-start">
          <CardHeader>
            <CardTitle>Description</CardTitle>
            <CardDescription>
              Informations détaillées du produit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-foreground/70">
            {product.description ? (
              <p className="whitespace-pre-wrap">{product.description}</p>
            ) : (
              <p className="text-foreground/50">Aucune description disponible.</p>
            )}
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-foreground/60">Type :</span>
                <span className="font-medium capitalize">{product.type || "—"}</span>
              </div>
              {product.unit && (
                <div className="flex justify-between">
                  <span className="text-foreground/60">Unité :</span>
                  <span className="font-medium">{product.unit}</span>
                </div>
              )}
              {product.sku && (
                <div className="flex justify-between">
                  <span className="text-foreground/60">Référence :</span>
                  <span className="font-medium">{product.sku}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Historique factures</CardTitle>
              <CardDescription>Dernières factures contenant ce produit.</CardDescription>
            </div>
            <History className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {relatedInvoices.length > 0 ? (
              <>
                {relatedInvoices.map((invoice) => (
                  <Link
                    key={invoice.id}
                    href={`/invoices/${invoice.id}`}
                    className="block rounded-lg border border-border/60 bg-secondary/60 p-3 text-foreground/70 hover:bg-secondary/80 transition-colors"
                  >
                    <p className="font-semibold text-foreground">{invoice.invoiceNumber}</p>
                    <p className="text-xs">Client : {invoice.client.name}</p>
                    <p className="text-xs">
                      Montant : {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: invoice.currency,
                        maximumFractionDigits: 2,
                      }).format(parseFloat(invoice.totalAmount))}
                    </p>
                    <p className="text-xs">Statut : {invoice.status}</p>
                  </Link>
                ))}
                {invoicesResponse?.meta && invoicesResponse.meta.total > relatedInvoices.length && (
                  <Button variant="ghost" className="w-full justify-center text-primary" asChild>
                    <Link href={`/invoices?productId=${product.id}`}>
                      Voir toutes les factures ({invoicesResponse.meta.total})
                    </Link>
                  </Button>
                )}
              </>
            ) : (
              <p className="text-center text-xs text-foreground/60">Aucune facture associée</p>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le produit {product?.name} ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Traitement..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
