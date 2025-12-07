"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
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
import Skeleton from "@/components/ui/skeleton";
import ClientModal from "@/components/modals/ClientModal";
import ImportClientsModal from "@/components/modals/ImportClientsModal";
import { useGetClientsQuery, useGetInvoicesQuery, useDeleteClientMutation } from "@/services/facturlyApi";
import { toast } from "sonner";
import { IoCloudUploadOutline } from "react-icons/io5";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const ITEMS_PER_PAGE = 20;

export default function ClientsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: clientsResponse, isLoading, isError, refetch: refetchClients } = useGetClientsQuery({ page: currentPage, limit: ITEMS_PER_PAGE });
  const { data: invoicesResponse } = useGetInvoicesQuery({ page: 1, limit: 1 });
  const [deleteClient, { isLoading: isDeleting }] = useDeleteClientMutation();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<{ id: string; name: string } | null>(null);

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

  const handleDeleteClick = (client: { id: string; name: string }) => {
    setClientToDelete({ id: client.id, name: client.name });
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;

    try {
      await deleteClient(clientToDelete.id).unwrap();
      toast.success("Client supprimé", {
        description: `Le client ${clientToDelete.name} a été supprimé avec succès.`,
      });
      setClientToDelete(null);
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
          { label: "Clients" },
        ]}
        className="text-xs"
      />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-primary">Clients</h1>
            <p className="mt-1 text-sm text-foreground/70">
              Gérez votre carnet d&apos;adresses, consultez l&apos;historique des factures et préparez vos relances.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setImportModalOpen(true)}>
              <IoCloudUploadOutline className="h-4 w-4" />
              Importer CSV
            </Button>
            <Button className="gap-2" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Nouveau client
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-4 lg:flex-row">
          <Card className="flex-1 border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">Clients actifs</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-semibold text-primary">{totalClients}</p>
            </CardContent>
          </Card>
          <Card className="flex-1 border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">Factures cumulées</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-semibold text-primary">{totalInvoices}</p>
            </CardContent>
          </Card>
          <Card className="flex-1 border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">Dernier ajout</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-semibold text-primary">{lastClientDate}</p>
              <p className="text-xs text-foreground/60">Date de création du dernier client</p>
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
          Erreur lors du chargement des clients. Vérifiez l&apos;API.
        </div>
      ) : clients && clients.length ? (
        <Card className="border-primary/20">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-primary">Répertoire</CardTitle>
              <p className="text-sm text-foreground/60">Recherchez vos clients, filtrez par nom, email ou ville.</p>
            </div>
            <Input placeholder="Rechercher par nom, email... (mock)" className="max-w-sm" />
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-primary/5">
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Pays</TableHead>
                  <TableHead className="text-right">Date d&apos;ajout</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients
                  .filter((client) => client.id) // Filtrer les clients sans ID
                  .map((client) => (
                    <TableRow 
                      key={client.id} 
                      className="hover:bg-primary/5"
                    >
                      <TableCell className="font-medium text-primary">
                        <Link href={`/clients/${client.id}`} className="hover:underline">
                          {client.name}
                        </Link>
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
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteClick(client)}
                        disabled={isDeleting}
                        title="Supprimer"
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
                Page {currentPage} sur {totalPages} • {totalClients} client(s) au total
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
          <p className="text-xl font-semibold text-primary">Aucun client enregistré</p>
          <p className="max-w-md text-center text-sm text-foreground/60">
            Créez votre premier client pour constituer votre carnet d’adresses et préparer l’envoi de factures personnalisées.
          </p>
          <Button className="gap-2" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Ajouter un client
          </Button>
        </div>
      )}
      <ClientModal 
        open={isModalOpen} 
        onClose={() => {
          setModalOpen(false);
        }}
        onSuccess={() => {
          toast.success("Client créé", {
            description: "Le client a été créé avec succès.",
          });
          setModalOpen(false);
          // RTK Query invalide déjà le cache, pas besoin de refetch manuel
        }}
      />
      <ImportClientsModal
        open={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => {
          toast.success("Import réussi", {
            description: "Les clients ont été importés avec succès.",
          });
          setImportModalOpen(false);
          // RTK Query invalide déjà le cache, pas besoin de refetch manuel
        }}
      />

      <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le client ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le client {clientToDelete?.name} ? Cette action est irréversible et supprimera également toutes les données associées.
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
