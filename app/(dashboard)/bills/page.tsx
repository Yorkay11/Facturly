"use client";

import Link from "next/link";
import { FileText, Eye } from "lucide-react";
import { useState } from "react";

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
import Breadcrumb from "@/components/ui/breadcrumb";
import Skeleton from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetBillsQuery } from "@/services/facturlyApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const formatCurrency = (value: string | number, currency: string) => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(numValue);
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; className: string }> = {
    RECEIVED: {
      label: "Reçue",
      className: "bg-blue-100 text-blue-700 border border-blue-300",
    },
    VIEWED: {
      label: "Consultée",
      className: "bg-blue-100 text-blue-700 border border-blue-300",
    },
    PAID: {
      label: "Payée",
      className: "bg-emerald-100 text-emerald-700 border border-emerald-300",
    },
    OVERDUE: {
      label: "En retard",
      className: "bg-red-100 text-red-700 border border-red-300",
    },
    CANCELLED: {
      label: "Annulée",
      className: "bg-gray-100 text-gray-600 border border-gray-300",
    },
  };

  const config = statusMap[status];

  if (!config) {
    return (
      <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
        {status}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
};

export default function BillsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: billsResponse, isLoading, isError } = useGetBillsQuery({
    page: 1,
    limit: 100,
    status: statusFilter !== "all" ? (statusFilter as "RECEIVED" | "VIEWED" | "PAID" | "OVERDUE" | "CANCELLED") : undefined,
  });

  const bills = billsResponse?.data ?? [];
  const totalBills = billsResponse?.meta?.total ?? 0;

  // Filtrer par recherche
  const filteredBills = bills.filter((bill) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      bill.invoice.invoiceNumber.toLowerCase().includes(query) ||
      bill.invoice.issuer?.name.toLowerCase().includes(query) ||
      ""
    );
  });

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Tableau de bord", href: "/dashboard" },
          { label: "Factures reçues" },
        ]}
        className="text-xs"
      />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Factures reçues</h1>
          <p className="text-sm text-foreground/60 mt-1">
            Consultez et gérez les factures que vous avez reçues de vos fournisseurs.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total factures</CardDescription>
            <CardTitle className="text-2xl">{totalBills}</CardTitle>
          </CardHeader>
        </Card>
            <Card>
          <CardHeader className="pb-3">
            <CardDescription>En attente</CardDescription>
            <CardTitle className="text-2xl">
              {bills.filter((b) => b.status === "RECEIVED" || b.status === "VIEWED" || b.status === "OVERDUE").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Payées</CardDescription>
            <CardTitle className="text-2xl">
              {bills.filter((b) => b.status === "PAID").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des factures reçues</CardTitle>
          <CardDescription>
            {totalBills} facture{totalBills > 1 ? "s" : ""} reçue{totalBills > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-2">
              <Input
                placeholder="Rechercher par numéro ou fournisseur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="RECEIVED">Reçues</SelectItem>
                <SelectItem value="VIEWED">Consultées</SelectItem>
                <SelectItem value="PAID">Payées</SelectItem>
                <SelectItem value="OVERDUE">En retard</SelectItem>
                <SelectItem value="CANCELLED">Annulées</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-destructive bg-destructive/10 p-6 text-sm text-destructive">
              <p className="font-semibold">Erreur de chargement</p>
              <p>Impossible de charger les factures reçues. Veuillez réessayer plus tard.</p>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="rounded-xl border border-border bg-secondary/60 p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-foreground/40" />
              <p className="text-sm font-medium text-foreground/70 mb-1">Aucune facture reçue</p>
              <p className="text-xs text-foreground/50">
                {searchQuery
                  ? "Aucune facture ne correspond à votre recherche."
                  : "Vous n&apos;avez pas encore reçu de factures."}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Date d&apos;émission</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill) => (
                    <TableRow key={bill.id} className="hover:bg-primary/5">
                      <TableCell className="font-medium text-primary">
                        {bill.invoice.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/70">
                        {bill.invoice.issuer?.name || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/60">
                        {formatDate(bill.invoice.issueDate)}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/60">
                        {formatDate(bill.invoice.dueDate)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatCurrency(bill.invoice.totalAmount, bill.invoice.currency)}
                      </TableCell>
                      <TableCell>{getStatusBadge(bill.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/bills/${bill.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

