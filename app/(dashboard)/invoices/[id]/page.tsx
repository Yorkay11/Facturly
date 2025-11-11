import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Mail, RefreshCcw } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import InvoiceStatusBadge from "@/components/invoices/InvoiceStatusBadge";
import { mockInvoices } from "@/data/mockInvoices";
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

type InvoiceDetailPageProps = {
  params: { id: string };
};

export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const invoice = mockInvoices.find((entry) => entry.id === params.id);

  if (!invoice) {
    notFound();
  }

  const mainAmount = Math.round(invoice.amount * 0.7 * 100) / 100;
  const secondaryAmount = Math.round((invoice.amount - mainAmount) * 100) / 100;

  const mockItems = [
    {
      description: "Prestation principale",
      quantity: 1,
      unitPrice: mainAmount,
    },
    {
      description: "Support & maintenance",
      quantity: 1,
      unitPrice: secondaryAmount,
    },
  ];

  const timeline = [
    {
      title: "Facture créée",
      date: formatDate(invoice.issueDate),
      description: "Document généré et enregistré dans Facturly.",
    },
    {
      title: "Envoyée au client",
      date: formatDate(invoice.issueDate),
      description: `Email envoyé à ${invoice.client}.`,
    },
    {
      title: invoice.status === "paid" ? "Paiement reçu" : "En attente",
      date: formatDate(invoice.dueDate),
      description:
        invoice.status === "paid"
          ? "Paiement confirmé et rapproché."
          : "Paiement en attente, planifier une relance.",
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Tableau de bord", href: "/dashboard" },
          { label: "Factures", href: "/invoices" },
          { label: invoice.number }]
      }
        className="text-xs"
      />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" asChild className="w-fit gap-2 px-0 text-primary">
            <Link href="/invoices">
              <ArrowLeft className="h-4 w-4" />
              Retour à la liste
            </Link>
          </Button>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <h1 className="text-3xl font-semibold tracking-tight">{invoice.number}</h1>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <p className="text-sm text-foreground/70">
            Facture destinée à {invoice.client}. Total dû : {formatCurrency(invoice.amount, invoice.currency)}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2 border-primary/40 text-primary hover:bg-primary/10">
            <Download className="h-4 w-4" />
            Télécharger (mock)
          </Button>
          <Button variant="outline" className="gap-2 border-primary/40 text-primary hover:bg-primary/10">
            <Mail className="h-4 w-4" />
            Envoyer un rappel
          </Button>
          <Button className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Marquer comme payé
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-primary/20">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-primary">Résumé</CardTitle>
              <CardDescription>Détails principaux de la facture.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs uppercase text-foreground/50">Client</p>
              <p className="text-sm font-semibold text-foreground">{invoice.client}</p>
              <p className="text-xs text-foreground/60">client@example.com (mock)</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase text-foreground/50">Montant</p>
              <p className="text-sm font-semibold text-primary">
                {formatCurrency(invoice.amount, invoice.currency)}
              </p>
              <p className="text-xs text-foreground/60">TVA incluse</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase text-foreground/50">Date d&apos;émission</p>
              <p className="text-sm text-foreground">{formatDate(invoice.issueDate)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase text-foreground/50">Échéance</p>
              <p className="text-sm text-foreground">{formatDate(invoice.dueDate)}</p>
            </div>
          </CardContent>
          <Separator className="mx-6" />
          <CardContent className="space-y-4">
            <Table>
              <TableHeader className="bg-primary/5">
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead className="text-right">P.U.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-sm text-foreground/80">{item.description}</TableCell>
                    <TableCell className="text-right text-sm text-foreground/60">{item.quantity}</TableCell>
                    <TableCell className="text-right text-sm text-foreground/60">
                      {formatCurrency(item.unitPrice, invoice.currency)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-primary">
                      {formatCurrency(item.unitPrice * item.quantity, invoice.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-primary/20 self-start">
          <CardHeader>
            <CardTitle className="text-primary">Timeline</CardTitle>
            <CardDescription>Suivi des événements de la facture.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {timeline.map((event, index) => (
              <div key={index} className="space-y-1 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-sm font-semibold text-primary">{event.title}</p>
                <p className="text-xs text-foreground/60">{event.date}</p>
                <p className="text-xs text-foreground/70">{event.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">Notes internes</CardTitle>
          <CardDescription>
            Ces informations sont fictives. Elles seront connectées à la base de données dans la version API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-foreground/70">
          <p>
            Prévoir une relance téléphonique si le paiement n&apos;est pas reçu 3 jours après l&apos;échéance. Ajouter des pénalités si le retard dépasse 15 jours.
          </p>
          <Separator />
          <p>
            Dernière note : le client a confirmé la réception par email, en attente de signature du responsable financier.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
