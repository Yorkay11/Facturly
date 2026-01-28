"use client";

import { Link } from '@/i18n/routing';
import { Plus, Pause, Play, Edit, Trash2, Calendar, Repeat } from "lucide-react";
import { useState } from "react";
import { useRouter } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
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
import { 
  useGetRecurringInvoicesQuery, 
  useDeleteRecurringInvoiceMutation,
  useUpdateRecurringInvoiceStatusMutation,
} from "@/services/facturlyApi";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

export default function RecurringInvoicesPage() {
  const t = useTranslations('recurringInvoices');
  const router = useRouter();
  const locale = useLocale();
  const dateLocale = locale === 'fr' ? fr : enUS;
  
  const { data: recurringInvoices, isLoading, isError } = useGetRecurringInvoicesQuery();
  const [deleteRecurringInvoice, { isLoading: isDeleting }] = useDeleteRecurringInvoiceMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateRecurringInvoiceStatusMutation();
  
  const [recurringInvoiceToDelete, setRecurringInvoiceToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = async () => {
    if (!recurringInvoiceToDelete) return;
    
    try {
      await deleteRecurringInvoice(recurringInvoiceToDelete).unwrap();
      toast.success(t('deleteSuccess'));
      setRecurringInvoiceToDelete(null);
    } catch (error: any) {
      toast.error(error?.data?.message || t('deleteError'));
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      await updateStatus({ id, status: newStatus }).unwrap();
      toast.success(t('statusUpdateSuccess'));
    } catch (error: any) {
      toast.error(error?.data?.message || t('statusUpdateError'));
    }
  };

  const filteredInvoices = recurringInvoices?.filter((invoice) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      invoice.name?.toLowerCase().includes(search) ||
      invoice.client.name.toLowerCase().includes(search)
    );
  }) || [];

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'monthly':
        return t('frequency.monthly');
      case 'quarterly':
        return t('frequency.quarterly');
      case 'yearly':
        return t('frequency.yearly');
      default:
        return frequency;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-500">{t('status.active')}</Badge>;
      case 'paused':
        return <Badge variant="secondary">{t('status.paused')}</Badge>;
      case 'completed':
        return <Badge variant="outline">{t('status.completed')}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{t('status.cancelled')}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Breadcrumb
        items={[
          { label: t('breadcrumb.dashboard'), href: "/dashboard" },
          { label: t('breadcrumb.recurringInvoices') },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <Button asChild>
          <Link href="/recurring-invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            {t('create')}
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder={t('searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-12">
          <p className="text-destructive">{t('errors.loadingError')}</p>
        </div>
      )}

      {!isLoading && !isError && filteredInvoices.length === 0 && (
        <div className="text-center py-12 border rounded-lg">
          <Repeat className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('empty.title')}</h3>
          <p className="text-muted-foreground mb-4">{t('empty.description')}</p>
          <Button asChild>
            <Link href="/recurring-invoices/new">
              <Plus className="mr-2 h-4 w-4" />
              {t('create')}
            </Link>
          </Button>
        </div>
      )}

      {!isLoading && !isError && filteredInvoices.length > 0 && (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.name')}</TableHead>
                <TableHead>{t('table.client')}</TableHead>
                <TableHead>{t('table.frequency')}</TableHead>
                <TableHead>{t('table.nextGeneration')}</TableHead>
                <TableHead>{t('table.status')}</TableHead>
                <TableHead>{t('table.generated')}</TableHead>
                <TableHead className="text-right">{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    {invoice.name || t('unnamed')}
                  </TableCell>
                  <TableCell>{invoice.client.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Repeat className="h-4 w-4 text-muted-foreground" />
                      {getFrequencyLabel(invoice.frequency)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(invoice.nextGenerationDate), 'PP', { locale: dateLocale })}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {invoice.totalInvoicesGenerated}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleToggleStatus(invoice.id, invoice.status)}
                        disabled={isUpdatingStatus || invoice.status === 'completed' || invoice.status === 'cancelled'}
                        title={invoice.status === 'active' ? t('pause') : t('activate')}
                      >
                        {invoice.status === 'active' ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => router.push(`/recurring-invoices/${invoice.id}`)}
                        title={t('edit')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setRecurringInvoiceToDelete(invoice.id)}
                        disabled={isDeleting}
                        title={t('delete')}
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
      )}

      <AlertDialog open={!!recurringInvoiceToDelete} onOpenChange={() => setRecurringInvoiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteDialog.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {t('deleteDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
