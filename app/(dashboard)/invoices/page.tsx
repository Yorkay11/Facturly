import Link from "next/link";
import { Plus, Download } from "lucide-react";

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
import { mockInvoices } from "@/data/mockInvoices";
import InvoiceStatusBadge from "@/components/invoices/InvoiceStatusBadge";
import Breadcrumb from "@/components/ui/breadcrumb";

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Tableau de bord", href: "/dashboard" },
          { label: "Factures" },
        ]}
        className="text-xs"
      />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-primary">Factures</h1>
            <p className="mt-1 text-sm text-foreground/70">
              Suivez vos brouillons, factures envoyées et paiements reçus.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 border-primary/40 text-primary hover:bg-primary/10">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
            <Button className="gap-2" asChild>
              <Link href="/invoices/new">
                <Plus className="h-4 w-4" />
                Nouvelle facture
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <Input
              placeholder="Rechercher (client, numéro...)"
              className="max-w-sm"
            />
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="sent">Envoyée</SelectItem>
                <SelectItem value="paid">Payée</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-foreground/60">
            {mockInvoices.length} facture(s) affichées — données mockées
          </div>
        </div>
      </div>

      {mockInvoices.length ? (
        <div className="overflow-hidden rounded-xl border border-primary/20 bg-white shadow-sm">
          <Table>
            <TableHeader className="bg-primary/5">
              <TableRow>
                <TableHead className="w-[140px]">Numéro</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date émission</TableHead>
                <TableHead>Date échéance</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-primary/5">
                  <TableCell className="font-medium text-primary">
                    <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                      {invoice.number}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-foreground/70">
                    {invoice.client}
                  </TableCell>
                  <TableCell className="text-sm text-foreground/60">
                    {formatDate(invoice.issueDate)}
                  </TableCell>
                  <TableCell className="text-sm text-foreground/60">
                    {formatDate(invoice.dueDate)}
                  </TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell className="text-right font-semibold text-primary">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-primary/30 bg-white py-16 shadow-sm">
          <p className="text-xl font-semibold text-primary">Aucune facture pour le moment</p>
          <p className="max-w-md text-center text-sm text-foreground/60">
            Créez votre première facture pour expédier des documents professionnels et suivre vos paiements.
          </p>
          <Button className="gap-2" asChild>
            <Link href="/invoices/new">
              <Plus className="h-4 w-4" />
              Créer une facture
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
