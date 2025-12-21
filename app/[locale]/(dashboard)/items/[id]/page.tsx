"use client";

import { Link } from '@/i18n/routing';
import { History, Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import { useRouter } from '@/i18n/routing';
import { useParams } from "next/navigation";

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
import ProductModal from "@/components/modals/ProductModal";
import { useGetProductByIdQuery, useGetInvoicesQuery, useDeleteProductMutation } from "@/services/facturlyApi";
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
  const { data: invoicesResponse } = useGetInvoicesQuery({ page: 1, limit: 100 });
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
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
        <div className="rounded-xl border border-destructive bg-destructive/10 p-6 text-sm text-destructive">
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
      <div className="rounded-xl border border-destructive bg-destructive/10 p-6 text-sm text-destructive">
        {t('errors.notFound')}
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
          { label: t('breadcrumb.dashboard'), href: "/dashboard" },
          { label: t('breadcrumb.items'), href: "/items" },
          { label: product.name },
        ]}
        className="text-xs"
      />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">{product?.name}</h1>
          <p className="text-sm text-foreground/60">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setEditModalOpen(true)}
          >
            <Pencil className="h-4 w-4" />
            {t('buttons.edit')}
          </Button>
          <Button
            variant="destructive"
            className="gap-2"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
            {t('buttons.delete')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('summary.title')}</CardTitle>
          <CardDescription>{t('summary.description', { id: product?.id.slice(0, 8) })}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs uppercase text-foreground/50">{t('summary.priceHT')}</p>
            <p className="text-2xl font-semibold text-primary">
              {new Intl.NumberFormat(locale === 'fr' ? "fr-FR" : "en-US", {
                style: "currency",
                currency: product.currency || "EUR",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(parseFloat(product.unitPrice || product.price || "0"))}
            </p>
            <p className="text-xs text-foreground/50">{t('summary.defaultVAT', { rate: product.taxRate ?? "0" })}</p>
          </div>
          {product.updatedAt && (
            <div className="space-y-2">
              <p className="text-xs uppercase text-foreground/50">{t('summary.lastUpdate')}</p>
              <p className="text-2xl font-semibold">
                {new Date(product.updatedAt).toLocaleDateString(locale === 'fr' ? "fr-FR" : "en-US", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
              <p className="text-xs text-foreground/50">
                {new Date(product.updatedAt).toLocaleDateString(locale === 'fr' ? "fr-FR" : "en-US", {
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
            <CardTitle>{t('description.title')}</CardTitle>
            <CardDescription>
              {t('description.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-foreground/70">
            {product.description ? (
              <p className="whitespace-pre-wrap">{product.description}</p>
            ) : (
              <p className="text-foreground/50">{t('description.noDescription')}</p>
            )}
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-foreground/60">{t('description.type')}</span>
                <span className="font-medium capitalize">{product.type === 'service' ? itemsModalT('fields.typeService') : product.type === 'product' ? itemsModalT('fields.typeProduct') : product.type || "—"}</span>
              </div>
              {product.unitOfMeasure && (
                <div className="flex justify-between">
                  <span className="text-foreground/60">{t('description.unit')}</span>
                  <span className="font-medium">{product.unitOfMeasure}</span>
                </div>
              )}
              {product.sku && (
                <div className="flex justify-between">
                  <span className="text-foreground/60">{t('description.reference')}</span>
                  <span className="font-medium">{product.sku}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">{t('invoiceHistory.title')}</CardTitle>
              <CardDescription>{t('invoiceHistory.description')}</CardDescription>
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
                    <p className="text-xs">{t('invoiceHistory.client')} {invoice.client.name}</p>
                    <p className="text-xs">
                      {t('invoiceHistory.amount')} {new Intl.NumberFormat(locale === 'fr' ? "fr-FR" : "en-US", {
                        style: "currency",
                        currency: invoice.currency,
                        maximumFractionDigits: 2,
                      }).format(parseFloat(invoice.totalAmount))}
                    </p>
                    <p className="text-xs">{t('invoiceHistory.status')} {invoice.status}</p>
                  </Link>
                ))}
                {invoicesResponse?.meta && invoicesResponse.meta.total > relatedInvoices.length && (
                  <Button variant="ghost" className="w-full justify-center text-primary" asChild>
                    <Link href={`/invoices?productId=${product.id}`}>
                      {t('invoiceHistory.viewAll', { count: invoicesResponse.meta.total })}
                    </Link>
                  </Button>
                )}
              </>
            ) : (
              <p className="text-center text-xs text-foreground/60">{t('invoiceHistory.noInvoices')}</p>
            )}
          </CardContent>
        </Card>
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
      
      <ProductModal
        open={isEditModalOpen}
        productId={productId}
        onClose={() => setEditModalOpen(false)}
        onSuccess={() => {
          toast.success(itemsT('success.updateSuccess'), {
            description: itemsT('success.updateSuccessDescription'),
          });
          setEditModalOpen(false);
        }}
      />
    </div>
  );
}
