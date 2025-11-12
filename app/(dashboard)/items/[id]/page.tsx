"use client";

import Link from "next/link";
import { ArrowLeft, FileEdit, History, Plus, Trash2 } from "lucide-react";
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
  const { data: invoicesResponse } = useGetInvoicesQuery({ page: 1, limit: 10 });
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

  const relatedInvoices = invoicesResponse?.data?.slice(0, 4) ?? [];

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
            Fiche détaillée mockée. Les données proviennent du catalogue statique en attendant l’API Nest.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2">
            <FileEdit className="h-4 w-4" />
            Modifier (bientôt)
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Dupliquer (mock)
          </Button>
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
          <CardDescription>Données illustratives pour le produit #{product?.id.slice(0, 8)}.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs uppercase text-foreground/50">Tarif HT estimé</p>
            <p className="text-2xl font-semibold text-primary">
              {parseFloat(product.price ?? "0").toFixed(2)} {product.currency ?? "€"}
            </p>
            <p className="text-xs text-foreground/50">TVA par défaut : {product.taxRate ?? "0"}%</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase text-foreground/50">Dernière utilisation</p>
            <p className="text-2xl font-semibold">10/01/2025</p>
            <p className="text-xs text-foreground/50">Facture #INV-2025-003 (mock)</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="self-start">
          <CardHeader>
            <CardTitle>Description</CardTitle>
            <CardDescription>
              Placeholder : ajoutez ici la description marketing, les inclusions, le temps estimé...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-foreground/70">
            <p>
              Cette prestation est un exemple. Lors de l’intégration backend, vous pourrez synchroniser la fiche
              depuis la base de données et afficher les métadonnées complètes (catégorie, tags, TVA personnalisée...).
            </p>
            <Separator />
            <ul className="list-disc space-y-2 pl-4">
              <li>Durée estimée : 3 jours</li>
              <li>Type : Forfait</li>
              <li>Notes internes : à définir</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Historique factures</CardTitle>
              <CardDescription>Dernières factures contenant ce produit (mock).</CardDescription>
            </div>
            <History className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {relatedInvoices.length > 0 ? (
              relatedInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="rounded-lg border border-border/60 bg-secondary/60 p-3 text-foreground/70"
                >
                  <p className="font-semibold text-foreground">{invoice.invoiceNumber}</p>
                  <p className="text-xs">Client : {invoice.client.name}</p>
                  <p className="text-xs">Montant : {invoice.totalAmount} {invoice.currency}</p>
                  <p className="text-xs">Statut : {invoice.status}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-foreground/60">Aucune facture associée</p>
            )}
            <Button variant="ghost" className="w-full justify-center text-primary">
              Voir plus (mock)
            </Button>
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
