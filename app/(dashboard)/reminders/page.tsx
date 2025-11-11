import { mockReminders } from "@/data/mockReminders";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BadgeAlert, BellRing, Filter, Mail } from "lucide-react";
import Link from "next/link";
import Breadcrumb from "@/components/ui/breadcrumb";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);

const statusConfig: Record<"pending" | "in_progress" | "resolved", { label: string; className: string }> = {
  pending: {
    label: "En attente",
    className: "bg-accent text-accent-foreground border border-accent/50",
  },
  in_progress: {
    label: "En cours",
    className: "bg-primary/10 text-primary border border-primary/30",
  },
  resolved: {
    label: "Résolue",
    className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  },
};

export default function RemindersPage() {
  const totalPending = mockReminders.filter((reminder) => reminder.status !== "resolved").length;
  const totalAmount = mockReminders
    .filter((reminder) => reminder.status !== "resolved")
    .reduce((sum, reminder) => sum + reminder.amount, 0);

  return (
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { label: "Tableau de bord", href: "/dashboard" },
          { label: "Relances" },
        ]}
        className="text-xs"
      />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-primary">Relances & Rapports</h1>
            <p className="mt-1 text-sm text-foreground/70">
              Visualisez les factures en retard, planifiez vos relances et pilotez votre trésorerie.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2 border-primary/40 text-primary hover:bg-primary/10">
              <Filter className="h-4 w-4" />
              Filtres (mock)
            </Button>
            <Button className="gap-2" asChild>
              <Link href="/invoices/new">
                <BellRing className="h-4 w-4" />
                Créer une relance
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">Relances actives</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-semibold text-primary">{totalPending}</p>
              <p className="text-xs text-foreground/60">Factures nécessitant une action</p>
            </CardContent>
          </Card>
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">Montant en retard</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-semibold text-primary">{formatCurrency(totalAmount, "EUR")}</p>
              <p className="text-xs text-foreground/60">Basé sur les données mockées</p>
            </CardContent>
          </Card>
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">Dernière action</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-semibold text-primary">18/01/2025</p>
              <p className="text-xs text-foreground/60">Relance email Agence Horizon</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-primary/20">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-primary">Relances en cours</CardTitle>
            <CardDescription>
              Liste des factures à relancer. Les actions sont fictives, prêtes à connecter à l&apos;API Nest.
            </CardDescription>
          </div>
          <Input placeholder="Rechercher un client ou une facture" className="max-w-sm" />
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-primary/5">
              <TableRow>
                <TableHead>Facture</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date échéance</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Dernière action</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockReminders.map((reminder) => (
                <TableRow key={reminder.id} className="hover:bg-primary/5">
                  <TableCell className="text-sm font-semibold text-primary">
                    <Link href={`/invoices/${reminder.id.replace("r", "")}`} className="hover:underline">
                      {reminder.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-foreground/70">{reminder.client}</TableCell>
                  <TableCell className="text-sm text-foreground/60">{formatDate(reminder.dueDate)}</TableCell>
                  <TableCell className="text-sm font-semibold text-primary">
                    {formatCurrency(reminder.amount, reminder.currency)}
                  </TableCell>
                  <TableCell className="text-sm text-foreground/60">{reminder.lastAction}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusConfig[reminder.status].className}`}>
                      {statusConfig[reminder.status].label}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="gap-2 text-primary">
                      <Mail className="h-4 w-4" />
                      Relancer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <BadgeAlert className="h-4 w-4" />
            Conseils de suivi (mock)
          </CardTitle>
          <CardDescription>
            Suggestions basées sur vos relances. À connecter avec un moteur de recommandations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-foreground/70">
          <p>
            • Relancer les clients à J+3, J+7 et J+15 avec un mix email / téléphone.
          </p>
          <p>
            • Activer des relances automatiques via SMS pour les retards supérieurs à 7 jours.
          </p>
          <p>
            • Prévoir un reporting mensuel pour identifier les clients à risque.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
