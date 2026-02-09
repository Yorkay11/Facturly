"use client";

import { Plus, Trash2 } from "lucide-react";
import Skeleton from "@/components/ui/skeleton";
import { useState } from "react";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { Link, useRouter } from '@/i18n/routing';

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
import { useTranslations, useLocale } from 'next-intl';
import { FuryMascot } from "@/components/mascot";

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
  const t = useTranslations('items');
  const commonT = useTranslations('common');
  const navigationT = useTranslations('navigation');
  const locale = useLocale();
  const router = useRouter();
  
  const [currentPage, setCurrentPage] = useState(1);
  const { data: productsResponse, isLoading, isError, refetch: refetchProducts } = useGetProductsQuery({ page: currentPage, limit: ITEMS_PER_PAGE });
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);

  const products = productsResponse?.data ?? [];
  const totalProducts = productsResponse?.meta?.total ?? 0;
  const totalPages = productsResponse?.meta?.totalPages ?? 1;

  const handleDeleteClick = (e: React.MouseEvent, product: { id: string; name: string }) => {
    e.stopPropagation(); // Empêcher la navigation vers la page de détails
    setProductToDelete({ id: product.id, name: product.name });
  };

  const handleRowClick = (productId: string) => {
    router.push(`/items/${productId}`);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct(productToDelete.id).unwrap();
      toast.success(t('success.deleteSuccess'), {
        description: t('success.deleteSuccessDescription', { name: productToDelete.name }),
      });
      setProductToDelete(null);
    } catch (error) {
      let errorMessage = t('errors.deleteError');
      if (error && typeof error === "object" && error !== null && "data" in error) {
        errorMessage = (error.data as { message?: string })?.message ?? errorMessage;
      }
      toast.error(commonT('error'), {
        description: errorMessage,
      });
    }
  };
  return (
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { label: t('breadcrumb.dashboard'), href: "/dashboard" },
          { label: t('breadcrumb.items') },
        ]}
        className="text-xs"
      />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-primary">{t('title')}</h1>
            <p className="mt-1 text-sm text-foreground/70">
              {t('subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setImportModalOpen(true)}>
              <IoCloudUploadOutline className="h-4 w-4" />
              {t('buttons.importCsv')}
            </Button>
            <Button className="gap-2" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" />
              {t('buttons.new')}
            </Button>
          </div>
        </div>
        <div className={`grid gap-4 ${products && products.length > 0 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">{t('stats.available')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-semibold text-primary">{totalProducts}</p>
            </CardContent>
          </Card>
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">{t('stats.averagePrice')}</CardTitle>
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
                      return new Intl.NumberFormat(locale === 'fr' ? "fr-FR" : "en-US", {
                        style: "currency",
                        currency: products[0]?.currency || "EUR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(average);
                    })()
                  : "—"}
              </p>
              <p className="text-xs text-foreground/60">{t('stats.averagePriceDescription')}</p>
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
                  <CardTitle className="text-sm font-medium text-primary/80">{t('stats.lastUpdate')}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-2xl font-semibold text-primary">
                    {new Date(latestProduct.updatedAt).toLocaleDateString(locale === 'fr' ? "fr-FR" : "en-US", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-foreground/60">{t('stats.lastUpdateDescription')}</p>
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
        <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          {t('errors.loadingError')}
        </div>
      ) : products && products.length ? (
        <Card className="border-primary/20">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-primary">{t('catalog.title')}</CardTitle>
              <p className="text-sm text-foreground/60">
                {t('catalog.description')}
              </p>
            </div>
            <Input placeholder={t('catalog.searchPlaceholder')} className="max-w-sm" />
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-primary/5">
                <TableRow>
                  <TableHead>{t('table.reference')}</TableHead>
                  <TableHead>{t('table.name')}</TableHead>
                  <TableHead className="text-right">{t('table.priceHT')}</TableHead>
                  <TableHead className="text-right">{t('table.defaultVAT')}</TableHead>
                  <TableHead className="w-[100px] text-right">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const price = getPrice(product);
                  const currency = product.currency || "EUR";
                  const formattedPrice = new Intl.NumberFormat(locale === 'fr' ? "fr-FR" : "en-US", {
                    style: "currency",
                    currency: currency,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(price);
                  
                  return (
                    <TableRow 
                      key={product.id} 
                      className="hover:bg-primary/5 cursor-pointer"
                      onClick={() => handleRowClick(product.id)}
                    >
                      <TableCell className="font-medium text-foreground">#{product.id.slice(0, 8)}</TableCell>
                      <TableCell className="text-sm text-foreground/70">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold text-primary">
                        {formattedPrice}
                      </TableCell>
                      <TableCell className="text-right text-sm text-foreground/60">{product.taxRate ?? "0"}%</TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => handleDeleteClick(e, product)}
                          disabled={isDeleting}
                          title={t('buttons.delete')}
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
                {t('pagination.pageInfo', { current: currentPage, total: totalPages, count: totalProducts })}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  <IoChevronBackOutline className="h-4 w-4" />
                  {t('buttons.previous')}
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
                  {t('buttons.next')}
                  <IoChevronForwardOutline className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <div className="flex flex-col items-center gap-6 rounded-xl border border-dashed border-primary/30 bg-white py-16 shadow-sm">
          <FuryMascot mood="focus" size="lg" />
          <p className="text-xl font-semibold text-primary">{t('noItems')}</p>
          <p className="max-w-md text-center text-sm text-foreground/60">
            {t('noItemsDescription')}
          </p>
          <Button className="gap-2" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            {t('buttons.add')}
          </Button>
        </div>
      )}
      <ProductModal 
        open={isModalOpen} 
        onClose={() => {
          setModalOpen(false);
        }}
        onSuccess={() => {
          toast.success(t('success.createSuccess'), {
            description: t('success.createSuccessDescription'),
          });
          setModalOpen(false);
          // RTK Query invalide déjà le cache, pas besoin de refetch manuel
        }}
      />
      <ImportProductsModal
        open={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => {
          toast.success(t('success.importSuccess'), {
            description: t('success.importSuccessDescription'),
          });
          setImportModalOpen(false);
          // RTK Query invalide déjà le cache, pas besoin de refetch manuel
        }}
      />

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteDialog.description', { name: productToDelete?.name ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? t('buttons.processing') : t('buttons.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
