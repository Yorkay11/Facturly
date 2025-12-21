"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { Link, useRouter } from '@/i18n/routing';
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';

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
import Skeleton from "@/components/ui/skeleton";
import ClientModal from "@/components/modals/ClientModal";
import ImportClientsModal from "@/components/modals/ImportClientsModal";
import { useGetClientsQuery, useGetInvoicesQuery, useDeleteClientMutation } from "@/services/facturlyApi";
import { toast } from "sonner";
import { IoCloudUploadOutline } from "react-icons/io5";

const ITEMS_PER_PAGE = 20;

export default function ClientsPage() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('clients');
  const commonT = useTranslations('common');
  const navigationT = useTranslations('navigation');
  
  const [currentPage, setCurrentPage] = useState(1);
  const { data: clientsResponse, isLoading, isError, refetch: refetchClients } = useGetClientsQuery({ page: currentPage, limit: ITEMS_PER_PAGE });
  const { data: invoicesResponse } = useGetInvoicesQuery({ page: 1, limit: 1 });
  const [deleteClient, { isLoading: isDeleting }] = useDeleteClientMutation();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<{ id: string; name: string } | null>(null);

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(locale === 'fr' ? "fr-FR" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const clients = clientsResponse?.data ?? [];
  const totalClients = clientsResponse?.meta?.total ?? 0;
  const totalPages = clientsResponse?.meta?.totalPages ?? 1;
  const totalInvoices = invoicesResponse?.meta?.total ?? 0;
  
  // Trouver le client le plus récent dynamiquement
  const lastClientDate = useMemo(() => {
    if (clients.length === 0) return "—";
    
    // Trouver le client avec la date de création la plus récente
    const clientsWithDates = clients.filter((client) => client.createdAt);
    if (clientsWithDates.length === 0) return "—";
    
    const mostRecentClient = clientsWithDates.reduce((latest, client) => {
      if (!latest) return client;
      if (!client.createdAt) return latest;
      if (!latest.createdAt) return client;
      
      const clientDate = new Date(client.createdAt).getTime();
      const latestDate = new Date(latest.createdAt).getTime();
      
      return clientDate > latestDate ? client : latest;
    }, clientsWithDates[0]);
    
    return mostRecentClient?.createdAt ? formatDate(mostRecentClient.createdAt) : "—";
  }, [clients]);

  const handleDeleteClick = (e: React.MouseEvent, client: { id: string; name: string }) => {
    e.stopPropagation(); // Empêcher la navigation vers la page de détails
    setClientToDelete({ id: client.id, name: client.name });
  };

  const handleRowClick = (clientId: string) => {
    router.push(`/clients/${clientId}`);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;

    try {
      await deleteClient(clientToDelete.id).unwrap();
      toast.success(t('deleteSuccess'), {
        description: t('deleteSuccessDescription', { name: clientToDelete.name }),
      });
      setClientToDelete(null);
    } catch (error) {
      let errorMessage = t('deleteError');
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
          { label: navigationT('dashboard'), href: "/dashboard" },
          { label: t('title') },
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
              {t('importCSV')}
            </Button>
            <Button className="gap-2" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" />
              {t('new')}
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-4 lg:flex-row">
          <Card className="flex-1 border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">{t('activeClients')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-semibold text-primary">{totalClients}</p>
            </CardContent>
          </Card>
          <Card className="flex-1 border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">{t('cumulativeInvoices')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-semibold text-primary">{totalInvoices}</p>
            </CardContent>
          </Card>
          <Card className="flex-1 border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">{t('lastAdded')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-semibold text-primary">{lastClientDate}</p>
              <p className="text-xs text-foreground/60">{t('lastAddedDescription')}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive bg-destructive/10 p-6 text-sm text-destructive">
          {t('loadError')}
        </div>
      ) : clients && clients.length ? (
        <Card className="border-primary/20">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-primary">{t('directory')}</CardTitle>
              <p className="text-sm text-foreground/60">{t('directoryDescription')}</p>
            </div>
            <Input placeholder={t('searchPlaceholder')} className="max-w-sm" />
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-primary/5">
                <TableRow>
                  <TableHead>{t('client')}</TableHead>
                  <TableHead>{t('email')}</TableHead>
                  <TableHead>{t('phone')}</TableHead>
                  <TableHead>{t('city')}</TableHead>
                  <TableHead>{t('country')}</TableHead>
                  <TableHead className="text-right">{t('addDate')}</TableHead>
                  <TableHead className="w-[100px] text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients
                  .filter((client) => client.id) // Filtrer les clients sans ID
                  .map((client) => (
                    <TableRow 
                      key={client.id} 
                      className="hover:bg-primary/5 cursor-pointer"
                      onClick={() => handleRowClick(client.id)}
                    >
                      <TableCell className="font-medium text-primary">
                        {client.name}
                      </TableCell>
                    <TableCell className="text-sm text-foreground/70">
                      {client.email ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-foreground/60">
                      {client.phone ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-foreground/60">
                      {client.city ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-foreground/60">
                      {client.country ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm text-foreground/60">
                      {client.createdAt ? formatDate(client.createdAt) : "—"}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => handleDeleteClick(e, client)}
                        disabled={isDeleting}
                        title={t('deleteAction')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                {t('pageInfo', { current: currentPage, total: totalPages, count: totalClients })}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  <IoChevronBackOutline className="h-4 w-4" />
                  {t('previous')}
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
                  {t('next')}
                  <IoChevronForwardOutline className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-primary/30 bg-white py-16 shadow-sm">
          <p className="text-xl font-semibold text-primary">{t('noClients')}</p>
          <p className="max-w-md text-center text-sm text-foreground/60">
            {t('noClientsDescription')}
          </p>
          <Button className="gap-2" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            {t('add')}
          </Button>
        </div>
      )}
      <ClientModal 
        open={isModalOpen} 
        onClose={() => {
          setModalOpen(false);
        }}
        onSuccess={() => {
          toast.success(t('createSuccess'), {
            description: t('createSuccessDescription'),
          });
          setModalOpen(false);
          // RTK Query invalide déjà le cache, pas besoin de refetch manuel
        }}
      />
      <ImportClientsModal
        open={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => {
          toast.success(t('importSuccess'), {
            description: t('importSuccessDescription'),
          });
          setImportModalOpen(false);
          // RTK Query invalide déjà le cache, pas besoin de refetch manuel
        }}
      />

      <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteDescription', { name: clientToDelete?.name || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{commonT('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? t('processing') : t('deleteAction')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
