"use client";

import { Link } from '@/i18n/routing';
import { Plus, Trash2, Copy, Repeat, Palette, Eye, ArrowLeft } from "lucide-react";
import { useState, useMemo } from "react";
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import InteractiveFolder from "@/components/ui/interactive-folder";

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
import { useGetInvoicesQuery, useDeleteInvoiceMutation, useCancelInvoiceMutation, useGetInvoiceByIdQuery, useCreateInvoiceMutation, facturlyApi } from "@/services/facturlyApi";
import { store } from "@/lib/redux/store";
import { toast } from "sonner";

import InvoiceStatusBadge from "@/components/invoices/InvoiceStatusBadge";

export default function InvoicesPage() {
  const t = useTranslations('invoices');
  const commonT = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams?.get('client');
  
  const { data: invoicesResponse, isLoading, isError } = useGetInvoicesQuery({ page: 1, limit: 100 });
  const [deleteInvoice, { isLoading: isDeleting }] = useDeleteInvoiceMutation();
  const [cancelInvoice, { isLoading: isCancelling }] = useCancelInvoiceMutation();
  const [createInvoice, { isLoading: isDuplicating }] = useCreateInvoiceMutation();
  const [invoiceToDelete, setInvoiceToDelete] = useState<{ id: string; number: string; status: string } | null>(null);
  const [invoiceToDuplicate, setInvoiceToDuplicate] = useState<string | null>(null);
  const invoices = invoicesResponse?.data ?? [];
  const totalInvoices = invoicesResponse?.meta?.total ?? 0;

  // Filtrer les factures par client si clientId est présent
  const filteredInvoices = useMemo(() => {
    if (!clientId) return invoices;
    return invoices.filter(invoice => invoice.client?.id === clientId);
  }, [invoices, clientId]);

  // Récupérer les infos du client si on est en mode filtre
  const selectedClient = useMemo(() => {
    if (!clientId || filteredInvoices.length === 0) return null;
    return filteredInvoices[0]?.client;
  }, [clientId, filteredInvoices]);

  // Regrouper les factures par client (pour la vue dossiers)
  const invoicesByClient = useMemo(() => {
    const grouped: Record<string, typeof invoices> = {};
    invoices.forEach((invoice) => {
      const id = invoice.client?.id || 'unknown';
      if (!grouped[id]) {
        grouped[id] = [];
      }
      grouped[id].push(invoice);
    });
    return grouped;
  }, [invoices]);

  const formatCurrency = (value: string | number, currency: string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat(locale === 'fr' ? "fr-FR" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(numValue);
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(locale === 'fr' ? "fr-FR" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const handleDeleteClick = (invoice: { id: string; invoiceNumber: string; status: string }) => {
    setInvoiceToDelete({ id: invoice.id, number: invoice.invoiceNumber, status: invoice.status });
  };

  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return;

    try {
      // Pour les brouillons, on supprime. Pour les autres, on annule.
      if (invoiceToDelete.status === "draft") {
        await deleteInvoice(invoiceToDelete.id).unwrap();
        toast.success(t('deleteDialog.deleteSuccess'), {
          description: t('deleteDialog.deleteSuccessDescription', { number: invoiceToDelete.number }),
        });
      } else {
        await cancelInvoice(invoiceToDelete.id).unwrap();
        toast.success(t('deleteDialog.cancelSuccess'), {
          description: t('deleteDialog.cancelSuccessDescription', { number: invoiceToDelete.number }),
        });
      }
      setInvoiceToDelete(null);
    } catch (error) {
      let errorMessage = t('deleteDialog.error');
      if (error && typeof error === "object" && error !== null && "data" in error) {
        errorMessage = (error.data as { message?: string })?.message ?? errorMessage;
      }
      toast.error(commonT('error'), {
        description: errorMessage,
      });
    }
  };

  // Fonction pour dupliquer une facture
  const handleDuplicate = async (invoiceId: string) => {
    try {
      // Récupérer la facture complète avec RTK Query
      const invoiceResult = await store.dispatch(
        facturlyApi.endpoints.getInvoiceById.initiate(invoiceId)
      );
      
      if ('error' in invoiceResult) {
        throw new Error('Erreur lors de la récupération de la facture');
      }
      
      const invoice = invoiceResult.data;
      
      if (!invoice) {
        throw new Error('Facture introuvable');
      }
      
      // Préparer les données de la nouvelle facture
      const today = new Date().toISOString().split('T')[0];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      const newDueDate = dueDate.toISOString().split('T')[0];
      
      const duplicatePayload = {
        clientId: invoice.client.id,
        issueDate: today,
        dueDate: newDueDate,
        currency: invoice.currency,
        items: invoice.items?.map((item: any) => ({
          productId: item.product?.id || undefined,
          description: item.description,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
        })) || [],
        notes: invoice.notes || undefined,
        recipientEmail: invoice.recipientEmail || undefined,
        templateName: invoice.templateName || undefined,
      };
      
      // Créer la nouvelle facture
      const newInvoice = await createInvoice(duplicatePayload).unwrap();
      
      toast.success(t('duplicate.success') || 'Facture dupliquée avec succès', {
        description: t('duplicate.successDescription', { number: invoice.invoiceNumber }) || `La facture ${invoice.invoiceNumber} a été dupliquée`,
      });
      
      // Rediriger vers la nouvelle facture en mode édition
      router.push(`/invoices/${newInvoice.id}/edit`);
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || t('duplicate.error') || 'Erreur lors de la duplication';
      toast.error(commonT('error'), {
        description: errorMessage,
      });
    } finally {
      setInvoiceToDuplicate(null);
    }
  };
  
  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t('breadcrumb.dashboard'), href: "/dashboard" },
          { label: t('breadcrumb.invoices') },
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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 border-primary/40 text-primary hover:bg-primary/10" asChild>
              <Link href="/recurring-invoices">
                <Repeat className="h-4 w-4" />
                <span className="hidden sm:inline">{t('recurring')}</span>
              </Link>
            </Button>
            <Button className="gap-2" asChild>
              <Link href="/invoices/new">
                <Plus className="h-4 w-4" />
                {t('new.label')}
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link href="/invoices/templates">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">{t('templates.breadcrumb.templates')}</span>
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <Input
              placeholder={t('searchPlaceholder')}
              className="max-w-sm"
            />
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('filterPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatuses')}</SelectItem>
                <SelectItem value="draft">{t('draft')}</SelectItem>
                <SelectItem value="sent">{t('sent')}</SelectItem>
                <SelectItem value="paid">{t('paid')}</SelectItem>
                <SelectItem value="overdue">{t('overdue')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-foreground/60">
            {invoices ? t('displayed', { count: invoices.length, plural: invoices.length > 1 ? 's' : '' }) : t('loading')}
          </div>
        </div>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
            {t('errors.loadingError')}
          </div>
        )}

        {/* Vue filtrée par client - Tableau des factures */}
        {!isLoading && !isError && clientId && filteredInvoices && filteredInvoices.length > 0 && (
          <div className="space-y-4">
            {/* Header avec retour */}
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/invoices')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour aux dossiers
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-primary">
                  Factures de {selectedClient?.name || 'Client'}
                </h2>
                <p className="text-sm text-foreground/60">
                  {filteredInvoices.length} {filteredInvoices.length > 1 ? 'factures' : 'facture'}
                </p>
              </div>
            </div>

            {/* Tableau des factures */}
            <div className="relative z-0 overflow-x-auto rounded-xl border border-primary/20 bg-white shadow-sm">
              <Table>
                <TableHeader className="bg-primary/5">
                  <TableRow>
                    <TableHead className="w-[140px]">{t('table.number')}</TableHead>
                    <TableHead>{t('table.issueDate')}</TableHead>
                    <TableHead>{t('table.dueDate')}</TableHead>
                    <TableHead>{t('table.status')}</TableHead>
                    <TableHead className="text-right">{t('table.amount')}</TableHead>
                    <TableHead className="w-[100px] text-right">{t('table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-primary/5">
                      <TableCell className="font-medium text-primary">
                        <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                          {invoice.invoiceNumber}
                        </Link>
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
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                            asChild
                            title={t('table.view') || 'Voir'}
                          >
                            <Link href={`/invoices/${invoice.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInvoiceToDuplicate(invoice.id);
                              handleDuplicate(invoice.id);
                            }}
                            disabled={isDuplicating}
                            title={t('duplicate.button') || 'Dupliquer la facture'}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(invoice);
                            }}
                            disabled={isDeleting || isCancelling || invoice.status === "cancelled"}
                            title={invoice.status === "draft" ? t('deleteDialog.delete') : t('deleteDialog.cancelAction')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Vue par défaut - Dossiers par client */}
        {!isLoading && !isError && !clientId && invoices && invoices.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-8">
            {Object.entries(invoicesByClient).map(([id, clientInvoices]) => {
              const client = clientInvoices[0]?.client;
              return (
                <InteractiveFolder
                  key={id}
                  folderName={client?.name ?? 'Client inconnu'}
                />
              );
            })}
          </div>
        )}

        {/* Message si aucun résultat pour le client sélectionné */}
        {!isLoading && !isError && clientId && filteredInvoices && filteredInvoices.length === 0 && (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-primary/30 bg-white py-16 shadow-sm">
            <p className="text-xl font-semibold text-primary">Aucune facture trouvée</p>
            <p className="max-w-md text-center text-sm text-foreground/60">
              Ce client n'a pas encore de factures.
            </p>
            <Button variant="outline" onClick={() => router.push('/invoices')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour aux dossiers
            </Button>
          </div>
        )}

        {!isLoading && !isError && (!invoices || invoices.length === 0) && (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-primary/30 bg-white py-16 shadow-sm">
            <p className="text-xl font-semibold text-primary">{t('empty.title')}</p>
            <p className="max-w-md text-center text-sm text-foreground/60">
              {t('empty.description')}
            </p>
            <Button className="gap-2" asChild>
              <Link href="/invoices/new">
                <Plus className="h-4 w-4" />
                {t('create')}
              </Link>
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={!!invoiceToDelete} onOpenChange={(open) => !open && setInvoiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {invoiceToDelete?.status === "draft" ? t('deleteDialog.deleteTitle') : t('deleteDialog.cancelTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {invoiceToDelete?.status === "draft" 
                ? t('deleteDialog.deleteDescription', { number: invoiceToDelete?.number ?? '' })
                : t('deleteDialog.cancelDescription', { number: invoiceToDelete?.number ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting || isCancelling}
            >
              {isDeleting || isCancelling ? t('deleteDialog.processing') : invoiceToDelete?.status === "draft" ? t('deleteDialog.delete') : t('deleteDialog.cancelAction')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
