"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileEdit, History, Plus } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { products } from "@/data/datas";
import { mockInvoices } from "@/data/mockInvoices";

interface ProductPageProps {
  params: { id: string };
}

const getProduct = (id: string) => products.find((product) => product.id === id);

export default function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = params;
  const product = getProduct(id);

  if (!product) {
    notFound();
  }

  const relatedInvoices = mockInvoices.slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" asChild className="w-fit gap-2 px-0 text-primary">
            <Link href="/items">
              <ArrowLeft className="h-4 w-4" />
              Retour au catalogue
            </Link>
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight">{product?.name}</h1>
          <p className="text-sm text-foreground/60">
            Fiche détaillée mockée. Les données proviennent du catalogue statique en attendant l’API Nest.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2">
            <FileEdit className="h-4 w-4" />
            Modifier (bientôt)
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Dupliquer (mock)
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Résumé</CardTitle>
          <CardDescription>Données illustratives pour le produit #{product?.id.padStart(3, "0")}.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs uppercase text-foreground/50">Tarif HT estimé</p>
            <p className="text-2xl font-semibold text-primary">115,00 €</p>
            <p className="text-xs text-foreground/50">TVA par défaut : 20%</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase text-foreground/50">Dernière utilisation</p>
            <p className="text-2xl font-semibold">10/01/2025</p>
            <p className="text-xs text-foreground/50">Facture #INV-2025-003 (mock)</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="self-start">
          <CardHeader>
            <CardTitle>Description</CardTitle>
            <CardDescription>
              Placeholder : ajoutez ici la description marketing, les inclusions, le temps estimé...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-foreground/70">
            <p>
              Cette prestation est un exemple. Lors de l’intégration backend, vous pourrez synchroniser la fiche
              depuis la base de données et afficher les métadonnées complètes (catégorie, tags, TVA personnalisée...).
            </p>
            <Separator />
            <ul className="list-disc space-y-2 pl-4">
              <li>Durée estimée : 3 jours</li>
              <li>Type : Forfait</li>
              <li>Notes internes : à définir</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Historique factures</CardTitle>
              <CardDescription>Dernières factures contenant ce produit (mock).</CardDescription>
            </div>
            <History className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {relatedInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="rounded-lg border border-border/60 bg-secondary/60 p-3 text-foreground/70"
              >
                <p className="font-semibold text-foreground">{invoice.number}</p>
                <p className="text-xs">Client : {invoice.client}</p>
                <p className="text-xs">Montant : {invoice.amount} {invoice.currency}</p>
                <p className="text-xs">Statut : {invoice.status}</p>
              </div>
            ))}
            <Button variant="ghost" className="w-full justify-center text-primary">
              Voir plus (mock)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
