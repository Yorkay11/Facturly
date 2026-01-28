"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { Link, useRouter } from '@/i18n/routing';
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
          <Card className="border-primary/20">
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-10 w-full max-w-sm" />
            </CardHeader>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          {t('loadError')}
        </div>
      ) : clients && clients.length ? (
        <div className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-primary">{t('directory')}</CardTitle>
                <p className="text-sm text-foreground/60">{t('directoryDescription')}</p>
              </div>
              <Input placeholder={t('searchPlaceholder')} className="max-w-sm" />
            </CardHeader>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {clients
              .filter((client) => client.id)
              .map((client) => {
                const getInitials = () => {
                  if (!client.name) return "?";
                  const parts = client.name.trim().split(/\s+/);
                  if (parts.length >= 2) {
                    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                  }
                  return client.name.substring(0, 2).toUpperCase();
                };

                return (
                  <Card
                    key={client.id}
                    className="group relative border-slate-200 hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => handleRowClick(client.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="h-12 w-12 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate group-hover:text-primary transition-colors">
                            {client.name}
                          </h3>
                          {client.city && client.country && (
                            <p className="text-xs text-slate-500 truncate">
                              {client.city}, {client.country}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(e, client);
                          }}
                          disabled={isDeleting}
                          title={t('deleteAction')}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {client.email && (
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <FaEnvelope className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <FaPhone className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">{client.phone}</span>
                          </div>
                        )}
                        {client.city && !client.country && (
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <FaMapMarkerAlt className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">{client.city}</span>
                          </div>
                        )}
                        {client.createdAt && (
                          <div className="flex items-center gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
                            <FaCalendarAlt className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>{formatDate(client.createdAt)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>

          {totalPages > 1 && (
            <Card className="border-primary/20">
              <CardContent className="px-6 py-4">
                <div className="flex items-center justify-between">
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
              </CardContent>
            </Card>
          )}
        </div>
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
