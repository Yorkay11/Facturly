"use client";

import { Plus, Trash2, Search, ChevronRight } from "lucide-react";
import Skeleton from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { IoChevronBackOutline, IoChevronForwardOutline, IoBriefcaseOutline, IoCubeOutline } from "react-icons/io5";
import { useRouter } from '@/i18n/routing';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { CreateProductModal } from "@/components/modals/ProductModal";
import ImportProductsModal from "@/components/modals/ImportProductsModal";
import { useGetProductsQuery, Product, useDeleteProductMutation, useCreateProductMutation, useGetWorkspaceQuery } from "@/services/facturlyApi";
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
  const locale = useLocale();
  const router = useRouter();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: productsResponse, isLoading, isError } = useGetProductsQuery({ page: currentPage, limit: ITEMS_PER_PAGE });
  const { data: workspace } = useGetWorkspaceQuery();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [createProduct] = useCreateProductMutation();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);

  const rawProducts = productsResponse?.data ?? [];
  const totalProducts = productsResponse?.meta?.total ?? 0;
  const totalPages = productsResponse?.meta?.totalPages ?? 1;

  const products = useMemo(() => {
    if (!searchQuery.trim()) return rawProducts;
    const q = searchQuery.trim().toLowerCase();
    return rawProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }, [rawProducts, searchQuery]);

  const handleDeleteClick = (e: React.MouseEvent, product: { id: string; name: string }) => {
    e.stopPropagation(); // Empêcher la navigation vers la page de détails
    setProductToDelete({ id: product.id, name: product.name });
  };

  const handleCardClick = (productId: string) => {
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
  const averagePrice = rawProducts.length > 0
    ? rawProducts.reduce((sum, p) => sum + getPrice(p), 0) / rawProducts.length
    : 0;
  const latestProduct = rawProducts.length > 0
    ? rawProducts.reduce((acc, p) => {
        if (!acc || !p.updatedAt) return acc || p;
        if (!acc.updatedAt) return p;
        return new Date(p.updatedAt) > new Date(acc.updatedAt) ? p : acc;
      }, null as Product | null)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="w-full px-4 py-8 sm:px-6 sm:py-10">
        <nav className="mb-8">
          <Breadcrumb
            items={[
              { label: t('breadcrumb.dashboard'), href: "/dashboard" },
              { label: t('breadcrumb.items') },
            ]}
            className="text-xs text-muted-foreground"
          />
        </nav>

        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {t('title')}
              </h1>
              <p className="mt-2 text-base text-muted-foreground">
                {t('subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-full border-border/80 bg-background/80 px-4 text-sm font-medium shadow-sm backdrop-blur-sm"
                onClick={() => setImportModalOpen(true)}
              >
                <IoCloudUploadOutline className="h-3.5 w-3.5" />
                {t('buttons.importCsv')}
              </Button>
              <Button
                size="sm"
                className="h-9 gap-2 rounded-full px-4 text-sm font-medium shadow-sm"
                onClick={() => setModalOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                {t('buttons.new')}
              </Button>
            </div>
          </div>
        </header>

        {/* Stats - cartes premium */}
        <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t('stats.available')}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground tabular-nums sm:text-3xl">
              {totalProducts}
            </p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t('stats.averagePrice')}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground tabular-nums sm:text-3xl">
              {rawProducts.length > 0
                ? new Intl.NumberFormat(locale === 'fr' ? "fr-FR" : "en-US", {
                    style: "currency",
                    currency: rawProducts[0]?.currency || "EUR",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(averagePrice)
                : "—"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{t('stats.averagePriceDescription')}</p>
          </div>
          {latestProduct?.updatedAt && (
            <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t('stats.lastUpdate')}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {new Date(latestProduct.updatedAt).toLocaleDateString(locale === 'fr' ? "fr-FR" : "en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t('stats.lastUpdateDescription')}</p>
            </div>
          )}
        </section>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full max-w-md rounded-xl" />
            <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm">
              <div className="divide-y divide-border/50">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm">
            <p className="text-sm text-destructive">{t('errors.loadingError')}</p>
          </div>
        ) : rawProducts.length ? (
          <>
            {/* Catalogue - liste type iOS */}
            <section className="rounded-2xl border border-border/50 bg-card/50 shadow-sm backdrop-blur-sm overflow-hidden">
              <div className="border-b border-border/50 px-5 py-4 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                      {t('catalog.title')}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">{t('catalog.description')}</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder={t('catalog.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-10 rounded-xl border-border/80 bg-muted/30 pl-9 text-sm focus-visible:ring-primary/40"
                    />
                  </div>
                </div>
              </div>

              {products.length === 0 ? (
                <div className="px-5 py-12 text-center sm:px-6">
                  <Search className="mx-auto h-10 w-10 text-muted-foreground/50" />
                  <p className="mt-3 text-sm font-medium text-muted-foreground">
                    {t('catalog.noSearchResults', { query: searchQuery })}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{t('catalog.noSearchResultsHint')}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 rounded-full"
                    onClick={() => setSearchQuery("")}
                  >
                    {t('catalog.clearSearch')}
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {products.map((product) => {
                    const price = getPrice(product);
                    const currency = product.currency || "EUR";
                    const formattedPrice = new Intl.NumberFormat(locale === 'fr' ? "fr-FR" : "en-US", {
                      style: "currency",
                      currency,
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(price);
                    const isService = product.type === "service";
                    const typeLabel = isService
                      ? t('modal.fields.typeService')
                      : t('modal.fields.typeProduct');
                    return (
                      <div
                        key={product.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleCardClick(product.id)}
                        onKeyDown={(e) => e.key === "Enter" && handleCardClick(product.id)}
                        className="group flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30 active:bg-muted/50 sm:px-6"
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isService ? "bg-primary/15 text-primary" : "bg-primary/10 text-primary/80"}`}
                        >
                          {isService ? (
                            <IoBriefcaseOutline className="h-5 w-5" />
                          ) : (
                            <IoCubeOutline className="h-5 w-5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                          {product.description && (
                            <p className="truncate text-xs text-muted-foreground">{product.description}</p>
                          )}
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-[10px] font-medium uppercase tracking-wider">
                          {typeLabel}
                        </Badge>
                        <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                          {formattedPrice}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(e, product);
                          }}
                          disabled={isDeleting}
                          title={t('buttons.delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {totalPages > 1 && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  {t('pagination.pageInfo', { current: currentPage, total: totalPages, count: totalProducts })}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-full px-3"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || isLoading}
                  >
                    <IoChevronBackOutline className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[4rem] text-center text-sm font-medium">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-full px-3"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    <IoChevronForwardOutline className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-6 rounded-2xl border border-dashed border-border/80 bg-card/50 py-16 shadow-sm backdrop-blur-sm">
            <FuryMascot mood="focus" size="lg" />
            <p className="text-xl font-semibold tracking-tight text-foreground">{t('noItems')}</p>
            <p className="max-w-md text-center text-sm text-muted-foreground">
              {t('noItemsDescription')}
            </p>
            <Button
              size="sm"
              className="gap-2 rounded-full px-5 shadow-sm"
              onClick={() => setModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              {t('buttons.add')}
            </Button>
          </div>
        )}
      </div>

      <CreateProductModal 
        open={isModalOpen} 
        setOpen={setModalOpen}
        workspaceCurrency={workspace?.defaultCurrency ?? 'EUR'}
        onSubmitProduct={async (data) => {
          await createProduct({
            name: data.name,
            description: data.description || undefined,
            type: 'service',
            price: data.price,
          }).unwrap();
          toast.success(t('success.createSuccess'), {
            description: t('success.createSuccessDescription'),
          });
          setModalOpen(false);
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
