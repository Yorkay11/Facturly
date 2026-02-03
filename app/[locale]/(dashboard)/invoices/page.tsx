"use client";

import { Link } from '@/i18n/routing';
import { Plus, Trash2, Copy, Repeat, Palette, Eye, MessageSquare, Search, Filter, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { format } from 'date-fns';

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
import { Badge } from "@/components/ui/badge";
import { useGetInvoicesQuery, useDeleteInvoiceMutation, useCancelInvoiceMutation, useGetInvoiceByIdQuery, useCreateInvoiceMutation, useSendReminderMutation, facturlyApi } from "@/services/facturlyApi";
import { store } from "@/lib/redux/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import InvoiceStatusBadge from "@/components/invoices/InvoiceStatusBadge";

type FilterType = 'all' | 'overdue' | 'pending' | 'paid' | 'draft' | 'sent';
type SortType = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'due-date-asc';

export default function InvoicesPage() {
  const t = useTranslations('invoices');
  const commonT = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // États pour filtres et recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('due-date-asc'); // Par défaut : tri par date d'échéance (En retard en premier)
  
  const { data: invoicesResponse, isLoading, isError, error } = useGetInvoicesQuery(
    { page: 1, limit: 100 },
    { refetchOnMountOrArgChange: true }
  );
  const [deleteInvoice, { isLoading: isDeleting }] = useDeleteInvoiceMutation();
  const [cancelInvoice, { isLoading: isCancelling }] = useCancelInvoiceMutation();
  const [createInvoice, { isLoading: isDuplicating }] = useCreateInvoiceMutation();
  const [sendReminder, { isLoading: isSendingReminder }] = useSendReminderMutation();
  const [invoiceToDelete, setInvoiceToDelete] = useState<{ id: string; number: string; status: string } | null>(null);
  const [invoiceToDuplicate, setInvoiceToDuplicate] = useState<string | null>(null);
  const [invoiceToRemind, setInvoiceToRemind] = useState<string | null>(null);
  
  const invoices = invoicesResponse?.data ?? [];
  const totalInvoices = invoicesResponse?.meta?.total ?? 0;

  // Fonction pour déterminer si une facture est en retard
  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'paid' || status === 'cancelled') return false;
    return new Date(dueDate) < new Date();
  };

  // Fonction pour déterminer le statut réel (overdue vs sent)
  const getRealStatus = (invoice: { status: string; dueDate: string }) => {
    if (invoice.status === 'sent' && isOverdue(invoice.dueDate, invoice.status)) {
      return 'overdue';
    }
    return invoice.status;
  };

  // Filtrage et tri intelligent
  const filteredAndSortedInvoices = useMemo(() => {
    let filtered = invoices.map(invoice => ({
      ...invoice,
      realStatus: getRealStatus(invoice),
    }));

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice.client.name.toLowerCase().includes(query) ||
        invoice.totalAmount.includes(query)
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        // En attente = sent mais pas encore payée
        filtered = filtered.filter(invoice => invoice.realStatus === 'sent');
      } else if (statusFilter === 'overdue') {
        // En retard = sent + date dépassée
        filtered = filtered.filter(invoice => invoice.realStatus === 'overdue');
      } else {
        filtered = filtered.filter(invoice => invoice.realStatus === statusFilter);
      }
    }

    // Tri intelligent par défaut : En retard → En attente → Payé → Brouillon
    if (sortBy === 'due-date-asc') {
      filtered.sort((a, b) => {
        // Priorité : overdue > sent > paid > draft
        const priority = { overdue: 0, sent: 1, paid: 2, draft: 3, cancelled: 4 };
        const priorityDiff = priority[a.realStatus as keyof typeof priority] - priority[b.realStatus as keyof typeof priority];
        if (priorityDiff !== 0) return priorityDiff;
        // Si même priorité, trier par date d'échéance
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    } else if (sortBy === 'date-desc') {
      filtered.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
    } else if (sortBy === 'date-asc') {
      filtered.sort((a, b) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime());
    } else if (sortBy === 'amount-desc') {
      filtered.sort((a, b) => parseFloat(b.totalAmount) - parseFloat(a.totalAmount));
    } else if (sortBy === 'amount-asc') {
      filtered.sort((a, b) => parseFloat(a.totalAmount) - parseFloat(b.totalAmount));
    }

    return filtered;
  }, [invoices, searchQuery, statusFilter, sortBy]);

  // Statistiques rapides
  const stats = useMemo(() => {
    const overdue = invoices.filter(inv => getRealStatus(inv) === 'overdue').length;
    const pending = invoices.filter(inv => getRealStatus(inv) === 'sent').length;
    const paid = invoices.filter(inv => inv.status === 'paid').length;
    const thisMonthPaid = invoices.filter(inv => {
      if (inv.status !== 'paid') return false;
      // Pour InvoiceSummary, on utilise createdAt comme approximation
      const paidDate = inv.createdAt ? new Date(inv.createdAt) : new Date();
      const now = new Date();
      return paidDate.getMonth() === now.getMonth() && paidDate.getFullYear() === now.getFullYear();
    }).length;

    return { overdue, pending, paid, thisMonthPaid };
  }, [invoices]);

  const formatCurrency = (value: string | number, currency: string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat(locale === 'fr' ? "fr-FR" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  const formatDate = (value: string) =>
    format(new Date(value), locale === 'fr' ? "dd/MM/yyyy" : "MM/dd/yyyy");

  const handleDeleteClick = (invoice: { id: string; invoiceNumber: string; status: string }) => {
    setInvoiceToDelete({ id: invoice.id, number: invoice.invoiceNumber, status: invoice.status });
  };

  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return;

    try {
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

  const handleDuplicate = async (invoiceId: string) => {
    try {
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
      
      const newInvoice = await createInvoice(duplicatePayload).unwrap();
      
      toast.success(t('duplicate.success') || 'Facture dupliquée avec succès', {
        description: t('duplicate.successDescription', { number: invoice.invoiceNumber }) || `La facture ${invoice.invoiceNumber} a été dupliquée`,
      });
      
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

  const handleSendReminder = async (invoiceId: string) => {
    try {
      setInvoiceToRemind(invoiceId);
      await sendReminder(invoiceId).unwrap();
      toast.success('Relance envoyée', {
        description: 'La relance a été envoyée avec succès sur WhatsApp',
      });
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Erreur lors de l\'envoi de la relance';
      toast.error(commonT('error'), {
        description: errorMessage,
      });
    } finally {
      setInvoiceToRemind(null);
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
      
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-primary">{t('title')}</h1>
            <p className="mt-1 text-sm text-foreground/70">
              {t('subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
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

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-xs font-bold text-red-600 uppercase">En retard</span>
            </div>
            <p className="text-2xl font-black text-red-700">{stats.overdue}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-600 uppercase">En attente</span>
            </div>
            <p className="text-2xl font-black text-blue-700">{stats.pending}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-xs font-bold text-green-600 uppercase">Payées</span>
            </div>
            <p className="text-2xl font-black text-green-700">{stats.paid}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-bold text-purple-600 uppercase">Ce mois</span>
            </div>
            <p className="text-2xl font-black text-purple-700">{stats.thisMonthPaid}</p>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder') || "Rechercher (client, numéro, montant...)"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filtres rapides */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === 'overdue' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(statusFilter === 'overdue' ? 'all' : 'overdue')}
                className="gap-1.5"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                En retard ({stats.overdue})
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
                className="gap-1.5"
              >
                <Clock className="h-3.5 w-3.5" />
                En attente ({stats.pending})
              </Button>
              <Button
                variant={statusFilter === 'paid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(statusFilter === 'paid' ? 'all' : 'paid')}
                className="gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Payées ({stats.paid})
              </Button>
            </div>

            {/* Filtre avancé */}
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as FilterType)}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatuses')}</SelectItem>
                <SelectItem value="draft">{t('draft')}</SelectItem>
                <SelectItem value="sent">{t('sent')}</SelectItem>
                <SelectItem value="paid">{t('paid')}</SelectItem>
                <SelectItem value="overdue">{t('overdue')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Tri */}
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortType)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="due-date-asc">Priorité (En retard)</SelectItem>
                <SelectItem value="date-desc">Plus récentes</SelectItem>
                <SelectItem value="date-asc">Plus anciennes</SelectItem>
                <SelectItem value="amount-desc">Montant décroissant</SelectItem>
                <SelectItem value="amount-asc">Montant croissant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-xs text-foreground/60 font-medium">
            {filteredAndSortedInvoices.length} {filteredAndSortedInvoices.length > 1 ? 'factures' : 'facture'}
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-semibold mb-2">{t('errors.loadingError')}</p>
          {error && 'data' in error && (
            <p className="text-xs text-destructive/70">
              {typeof error.data === 'object' && error.data !== null && 'message' in error.data
                ? String(error.data.message)
                : 'Erreur lors du chargement des factures'}
            </p>
          )}
        </div>
      )}

      {/* Table optimisée */}
      {!isLoading && !isError && filteredAndSortedInvoices.length > 0 && (
        <div className="relative z-0 overflow-x-auto rounded-xl border border-primary/20 bg-white shadow-sm">
          <Table>
            <TableHeader className="bg-primary/5">
              <TableRow>
                <TableHead className="w-[140px]">{t('table.number')}</TableHead>
                <TableHead>{t('table.client')}</TableHead>
                <TableHead>{t('table.dueDate')}</TableHead>
                <TableHead>{t('table.status')}</TableHead>
                <TableHead className="text-right">{t('table.amount')}</TableHead>
                <TableHead className="w-[180px] text-right">{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedInvoices.map((invoice) => {
                const realStatus = invoice.realStatus;
                // On ne peut relancer que si la date d'échéance est dépassée ET que la facture n'est pas payée
                const canRemind = realStatus === 'overdue' && invoice.status !== 'paid';
                
                return (
                  <TableRow 
                    key={invoice.id} 
                    className={cn(
                      "hover:bg-primary/5 transition-colors",
                      realStatus === 'overdue' && "bg-red-50/50 border-l-4 border-l-red-500"
                    )}
                  >
                    <TableCell className="font-medium">
                      <Link href={`/invoices/${invoice.id}`} className="text-primary hover:underline font-bold">
                        {invoice.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground">{invoice.client.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-foreground/70">
                        {formatDate(invoice.dueDate)}
                        {realStatus === 'overdue' && (
                          <Badge variant="destructive" className="ml-2 text-[10px]">
                            {Math.ceil((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))}j
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={realStatus as "draft" | "sent" | "paid" | "overdue" | "cancelled"} />
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary text-lg">
                      {formatCurrency(invoice.totalAmount, invoice.currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Bouton Relance WhatsApp - Priorité absolue */}
                        {canRemind && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendReminder(invoice.id);
                            }}
                            disabled={isSendingReminder && invoiceToRemind === invoice.id}
                            className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                            title="Relancer sur WhatsApp"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            {isSendingReminder && invoiceToRemind === invoice.id ? '...' : 'Relancer'}
                          </Button>
                        )}
                        
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
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && filteredAndSortedInvoices.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-primary/30 bg-white py-16 shadow-sm">
          {searchQuery || statusFilter !== 'all' ? (
            <>
              <p className="text-xl font-semibold text-primary">Aucune facture trouvée</p>
              <p className="max-w-md text-center text-sm text-foreground/60">
                Aucune facture ne correspond à vos critères de recherche.
              </p>
              <Button variant="outline" onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}>
                Réinitialiser les filtres
              </Button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}

      {/* Dialogs */}
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
