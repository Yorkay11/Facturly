"use client";

import { Plus, Trash2 } from "lucide-react";
import Skeleton from "@/components/ui/skeleton";
import { useState } from "react";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import ProductModal from "@/components/modals/ProductModal";
import ImportProductsModal from "@/components/modals/ImportProductsModal";
import { useGetProductsQuery, Product, useDeleteProductMutation } from "@/services/facturlyApi";
import { toast } from "sonner";
import { IoCloudUploadOutline } from "react-icons/io5";

const getPrice = (product: Product): number => {
  // Product.unitPrice est toujours une string selon l'API (price est un alias)
  const priceValue = product.unitPrice || product.price;
  if (priceValue) {
    const parsed = parseFloat(priceValue);
    // Vérifier que le résultat est un nombre valide et fini
    if (!isNaN(parsed) && isFinite(parsed)) {
      return parsed;
    }
  }
  // Valeur par défaut si price est invalide ou manquant
  return 0;
};

const ITEMS_PER_PAGE = 20;

export default function ItemsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: productsResponse, isLoading, isError, refetch: refetchProducts } = useGetProductsQuery({ page: currentPage, limit: ITEMS_PER_PAGE });
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);

  const products = productsResponse?.data ?? [];
  const totalProducts = productsResponse?.meta?.total ?? 0;
  const totalPages = productsResponse?.meta?.totalPages ?? 1;

  const handleDeleteClick = (product: { id: string; name: string }) => {
    setProductToDelete({ id: product.id, name: product.name });
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct(productToDelete.id).unwrap();
      toast.success("Produit supprimé", {
        description: `Le produit ${productToDelete.name} a été supprimé avec succès.`,
      });
      setProductToDelete(null);
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
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { label: "Tableau de bord", href: "/dashboard" },
          { label: "Produits" },
        ]}
        className="text-xs"
      />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-primary">Produits & Services</h1>
            <p className="mt-1 text-sm text-foreground/70">
              Centralisez vos prestations pour accélérer la création de factures et de devis.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setImportModalOpen(true)}>
              <IoCloudUploadOutline className="h-4 w-4" />
              Importer CSV
            </Button>
            <Button className="gap-2" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Nouvelle prestation
            </Button>
          </div>
        </div>
        <div className={`grid gap-4 ${products && products.length > 0 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">Prestations disponibles</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-semibold text-primary">{totalProducts}</p>
            </CardContent>
          </Card>
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">Prix moyen</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-semibold text-primary">
                {products && products.length > 0 
                  ? (() => {
                      const total = products.reduce((sum, p) => {
                        const price = getPrice(p);
                        return sum + price;
                      }, 0);
                      const average = total / products.length;
                      return new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: products[0]?.currency || "EUR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(average);
                    })()
                  : "—"}
              </p>
              <p className="text-xs text-foreground/60">Prix moyen des prestations</p>
            </CardContent>
          </Card>
          {products && products.length > 0 && (() => {
            const latestProduct = products.reduce((latest, p) => {
              if (!latest || !p.updatedAt) return latest || p;
              if (!latest.updatedAt) return p;
              return new Date(p.updatedAt) > new Date(latest.updatedAt) ? p : latest;
            }, null as Product | null);
            
            return latestProduct?.updatedAt ? (
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-primary/80">Dernière mise à jour</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-2xl font-semibold text-primary">
                    {new Date(latestProduct.updatedAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-foreground/60">Dernière modification</p>
                </CardContent>
              </Card>
            ) : null;
          })()}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive bg-destructive/10 p-6 text-sm text-destructive">
          Erreur lors du chargement des produits. Vérifiez l&apos;API.
        </div>
      ) : products && products.length ? (
        <Card className="border-primary/20">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-primary">Catalogue</CardTitle>
              <p className="text-sm text-foreground/60">
                Liste de vos produits et services disponibles.
              </p>
            </div>
            <Input placeholder="Rechercher une prestation" className="max-w-sm" />
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-primary/5">
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead className="text-right">Tarif HT</TableHead>
                  <TableHead className="text-right">TVA par défaut</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const price = getPrice(product);
                  const currency = product.currency || "EUR";
                  const formattedPrice = new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: currency,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(price);
                  
                  return (
                    <TableRow key={product.id} className="hover:bg-primary/5">
                      <TableCell className="font-medium text-foreground">#{product.id.slice(0, 8)}</TableCell>
                      <TableCell className="text-sm text-foreground/70">{product.name}</TableCell>
                      <TableCell className="text-right text-sm font-semibold text-primary">
                        {formattedPrice}
                      </TableCell>
                      <TableCell className="text-right text-sm text-foreground/60">{product.taxRate ?? "0"}%</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(product)}
                          disabled={isDeleting}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages} • {totalProducts} produit(s) au total
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  <IoChevronBackOutline className="h-4 w-4" />
                  Précédent
                </Button>
                <div className="text-sm font-medium px-3">
                  {currentPage} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Suivant
                  <IoChevronForwardOutline className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-primary/30 bg-white py-16 shadow-sm">
          <p className="text-xl font-semibold text-primary">Aucun produit enregistré</p>
          <p className="max-w-md text-center text-sm text-foreground/60">
            Ajoutez vos prestations pour pré-remplir vos factures en quelques clics.
          </p>
          <Button className="gap-2" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Ajouter une prestation
          </Button>
        </div>
      )}
      <ProductModal 
        open={isModalOpen} 
        onClose={() => {
          setModalOpen(false);
        }}
        onSuccess={() => {
          toast.success("Prestation créée", {
            description: "La prestation a été créée avec succès.",
          });
          setModalOpen(false);
          // RTK Query invalide déjà le cache, pas besoin de refetch manuel
        }}
      />
      <ImportProductsModal
        open={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => {
          toast.success("Import réussi", {
            description: "Les produits ont été importés avec succès.",
          });
          setImportModalOpen(false);
          // RTK Query invalide déjà le cache, pas besoin de refetch manuel
        }}
      />

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le produit {productToDelete?.name} ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
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
