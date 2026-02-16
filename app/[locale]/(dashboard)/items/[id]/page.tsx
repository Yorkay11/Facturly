"use client";

import { Link } from '@/i18n/routing';
import { History, Trash2, Pencil, ArrowLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from '@/i18n/routing';
import { useParams } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import Skeleton from "@/components/ui/skeleton";
import { CreateProductModal } from "@/components/modals/ProductModal";
import { useGetProductByIdQuery, useGetInvoicesQuery, useDeleteProductMutation, useUpdateProductMutation, useGetWorkspaceQuery } from "@/services/facturlyApi";
import { toast } from "sonner";
import { useTranslations, useLocale } from 'next-intl';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('items.detail');
  const itemsT = useTranslations('items');
  const itemsModalT = useTranslations('items.modal');
  const commonT = useTranslations('common');
  const locale = useLocale();
  
  // Dans Next.js 16, useParams retourne directement les paramètres
  // Vérifier que l'ID existe et n'est pas "undefined" (chaîne)
  const rawId = params?.id;
  const productId = typeof rawId === "string" && rawId !== "undefined" && rawId.trim() !== "" 
    ? rawId 
    : undefined;
  
  // Ne pas appeler les hooks si productId n'est pas valide
  const shouldSkip = !productId;
  
  const { data: product, isLoading, isError } = useGetProductByIdQuery(
    productId || "",
    { skip: shouldSkip }
  );
  const { data: workspace } = useGetWorkspaceQuery();
  const { data: invoicesResponse } = useGetInvoicesQuery({ page: 1, limit: 100 });
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const handleDelete = async () => {
    if (!product) return;

    try {
      await deleteProduct(product.id).unwrap();
      toast.success(itemsT('success.deleteSuccess'), {
        description: itemsT('success.deleteSuccessDescription', { name: product.name }),
      });
      router.push("/items");
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

  if (!productId) {
    return (
      <div className="space-y-4">
        <Breadcrumb
          items={[
            { label: t('breadcrumb.dashboard'), href: "/dashboard" },
            { label: t('breadcrumb.items'), href: "/items" },
            { label: t('breadcrumb.details') },
          ]}
          className="text-xs"
        />
        <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-semibold">{t('errors.missingId')}</p>
          <p className="mt-2">{t('errors.missingIdDescription')}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/items")}
          >
            {t('buttons.backToList')}
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

  if (isError || !product) {
    return (
      <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
        {t('errors.notFound')}
      </div>
    );
  }

  const relatedInvoices = (invoicesResponse?.data ?? []).slice(0, 4);
  const priceFormatted = new Intl.NumberFormat(locale === 'fr' ? "fr-FR" : "en-US", {
    style: "currency",
    currency: product.currency || "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseFloat(product.unitPrice || product.price || "0"));
  const typeLabel = product.type === 'service' ? itemsModalT('fields.typeService') : itemsModalT('fields.typeProduct');

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="w-full px-4 py-8 sm:px-6 sm:py-10">
        {/* Breadcrumb minimal */}
        <nav className="mb-8">
          <Breadcrumb
            items={[
              { label: t('breadcrumb.dashboard'), href: "/dashboard" },
              { label: t('breadcrumb.items'), href: "/items" },
              { label: product.name },
            ]}
            className="text-xs text-muted-foreground"
          />
        </nav>

        {/* Hero: nom + badge + prix */}
        <header className="mb-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <Badge variant="secondary" className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {typeLabel}
              </Badge>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {product.name}
              </h1>
              <p className="text-base text-muted-foreground">
                {t('subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-full border-border/80 bg-background/80 px-4 text-sm font-medium shadow-sm backdrop-blur-sm"
                onClick={() => setEditModalOpen(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
                {t('buttons.edit')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-2 rounded-full px-4 text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t('buttons.delete')}
              </Button>
            </div>
          </div>
        </header>

        {/* Prix en vedette */}
        <section className="mb-10 rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm backdrop-blur-sm sm:p-8">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {t('summary.priceHT')}
          </p>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {priceFormatted}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('summary.defaultVAT', { rate: product.taxRate ?? "0" })}
          </p>
          {product.updatedAt && (
            <p className="mt-4 text-xs text-muted-foreground">
              {t('summary.lastUpdate')} · {new Date(product.updatedAt).toLocaleDateString(locale === 'fr' ? "fr-FR" : "en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </section>

        <div className="grid gap-6 md:grid-cols-[1fr_340px]">
          {/* Description */}
          <section className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm backdrop-blur-sm sm:p-8">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {t('description.title')}
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-foreground/90">
              {product.description ? (
                <span className="whitespace-pre-wrap">{product.description}</span>
              ) : (
                <span className="text-muted-foreground">{t('description.noDescription')}</span>
              )}
            </p>
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-muted/40 px-4 py-3">
              <span className="text-sm text-muted-foreground">{t('description.type')}</span>
              <span className="text-sm font-medium text-foreground">{typeLabel}</span>
            </div>
          </section>

          {/* Factures récentes - style liste iOS */}
          <section className="rounded-2xl border border-border/50 bg-card/50 shadow-sm backdrop-blur-sm overflow-hidden">
            <div className="border-b border-border/50 px-5 py-4">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  {t('invoiceHistory.title')}
                </h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('invoiceHistory.description')}
              </p>
            </div>
            <div className="divide-y divide-border/50">
              {relatedInvoices.length > 0 ? (
                <>
                  {relatedInvoices.map((invoice) => (
                    <Link
                      key={invoice.id}
                      href={`/invoices/${invoice.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-muted/30 active:bg-muted/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {invoice.invoiceNumber}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {invoice.client.name} · {new Intl.NumberFormat(locale === 'fr' ? "fr-FR" : "en-US", {
                            style: "currency",
                            currency: invoice.currency,
                            maximumFractionDigits: 0,
                          }).format(parseFloat(invoice.totalAmount))}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                    </Link>
                  ))}
                  {invoicesResponse?.meta && invoicesResponse.meta.total > relatedInvoices.length && (
                    <Link
                      href={`/invoices?productId=${product.id}`}
                      className="flex items-center justify-center gap-2 px-5 py-4 text-sm font-medium text-primary hover:bg-muted/30"
                    >
                      {t('invoiceHistory.viewAll', { count: invoicesResponse.meta.total })}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}
                </>
              ) : (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-muted-foreground">{t('invoiceHistory.noInvoices')}</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Retour liste */}
        <div className="mt-10">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" asChild>
            <Link href="/items">
              <ArrowLeft className="h-4 w-4" />
              {t('buttons.backToList')}
            </Link>
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteDialog.description', { name: product?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? t('buttons.processing') : t('buttons.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreateProductModal
        open={isEditModalOpen}
        setOpen={setEditModalOpen}
        workspaceCurrency={workspace?.defaultCurrency ?? product?.currency ?? 'EUR'}
        productId={product?.id}
        initialValues={
          product
            ? {
                name: product.name,
                description: product.description ?? '',
                price: product.unitPrice || product.price || '',
              }
            : undefined
        }
        onSubmitProduct={async (data) => {
          if (!product?.id) return;
          await updateProduct({
            id: product.id,
            payload: {
              name: data.name,
              description: data.description || undefined,
              type: product.type ?? 'service',
              price: data.price,
            },
          }).unwrap();
          toast.success(itemsT('success.updateSuccess'), {
            description: itemsT('success.updateSuccessDescription'),
          });
          setEditModalOpen(false);
        }}
      />
    </div>
  );
}
