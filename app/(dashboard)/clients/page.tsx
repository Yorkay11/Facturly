"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

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
import { mockClients } from "@/data/mockClients";
import Breadcrumb from "@/components/ui/breadcrumb";
import Skeleton from "@/components/ui/skeleton";
import ClientModal from "@/components/modals/ClientModal";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export default function ClientsPage() {
  const totalInvoices = mockClients.reduce((sum, client) => sum + client.invoicesCount, 0);
  const loading = false;
  const [isModalOpen, setModalOpen] = useState(false);

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
          <Button className="gap-2" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Nouveau client
          </Button>
        </div>
        <div className="flex flex-col gap-4 lg:flex-row">
          <Card className="flex-1 border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">Clients actifs</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-semibold text-primary">{mockClients.length}</p>
              <p className="text-xs text-foreground/60">Données mockées</p>
            </CardContent>
          </Card>
          <Card className="flex-1 border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">Factures cumulées</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-semibold text-primary">{totalInvoices}</p>
              <p className="text-xs text-foreground/60">Factures liées à ces clients</p>
            </CardContent>
          </Card>
          <Card className="flex-1 border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">Dernier ajout</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-semibold text-primary">{formatDate(mockClients[0].lastInvoiceDate)}</p>
              <p className="text-xs text-foreground/60">Dernière facture émise (mock)</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : mockClients.length ? (
        <Card className="border-primary/20">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-primary">Répertoire</CardTitle>
              <p className="text-sm text-foreground/60">Recherchez vos clients, filtrez par entreprise ou nombre de factures.</p>
            </div>
            <Input placeholder="Rechercher par nom, email... (mock)" className="max-w-sm" />
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-primary/5">
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead className="text-right">Factures</TableHead>
                  <TableHead className="text-right">Dernière facture</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockClients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-primary/5">
                    <TableCell className="font-medium text-foreground">{client.name}</TableCell>
                    <TableCell className="text-sm text-foreground/70">{client.company}</TableCell>
                    <TableCell className="text-sm text-foreground/60">{client.email}</TableCell>
                    <TableCell className="text-sm text-foreground/60">{client.phone ?? "—"}</TableCell>
                    <TableCell className="text-right text-sm font-semibold text-primary">{client.invoicesCount}</TableCell>
                    <TableCell className="text-right text-sm text-foreground/60">
                      {formatDate(client.lastInvoiceDate)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
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
      <ClientModal open={isModalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
