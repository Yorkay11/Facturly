"use client";

import { Plus } from "lucide-react";
import Skeleton from "@/components/ui/skeleton";
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
import { products } from "@/data/datas";
import Breadcrumb from "@/components/ui/breadcrumb";
import ProductModal from "@/components/modals/ProductModal";

const mockPricing = (index: number) => 45 + index * 15;

export default function ItemsPage() {
  const loading = false;
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { label: "Tableau de bord", href: "/dashboard" },
          { label: "Produits" },
        ]}
        className="text-xs"
      />
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-primary">Produits & Services</h1>
            <p className="mt-1 text-sm text-foreground/70">
              Centralisez vos prestations pour accélérer la création de factures et de devis.
            </p>
          </div>
          <Button className="gap-2" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Nouvelle prestation
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">Prestations disponibles</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-semibold text-primary">{products.length}</p>
              <p className="text-xs text-foreground/60">Catalogue mocké</p>
            </CardContent>
          </Card>
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">Panier moyen estimé</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-semibold text-primary">{(products.length * 35).toFixed(0)} €</p>
              <p className="text-xs text-foreground/60">Estimation fictive</p>
            </CardContent>
          </Card>
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary/80">Dernière mise à jour</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-semibold text-primary">Février 2025</p>
              <p className="text-xs text-foreground/60">Planning actualisation à venir</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : products.length ? (
        <Card className="border-primary/20">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-primary">Catalogue</CardTitle>
              <p className="text-sm text-foreground/60">
                Ces données sont mockées ; la gestion CRUD arrivera avec le backend Nest.
              </p>
            </div>
            <Input placeholder="Rechercher une prestation (mock)" className="max-w-sm" />
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-primary/5">
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead className="text-right">Tarif HT (mock)</TableHead>
                  <TableHead className="text-right">TVA par défaut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product, index) => (
                  <TableRow key={product.id} className="hover:bg-primary/5">
                    <TableCell className="font-medium text-foreground">#{product.id.padStart(3, "0")}</TableCell>
                    <TableCell className="text-sm text-foreground/70">{product.name}</TableCell>
                    <TableCell className="text-right text-sm font-semibold text-primary">
                      {mockPricing(index).toFixed(2)} €
                    </TableCell>
                    <TableCell className="text-right text-sm text-foreground/60">20%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-primary/30 bg-white py-16 shadow-sm">
          <p className="text-xl font-semibold text-primary">Aucun produit enregistré</p>
          <p className="max-w-md text-center text-sm text-foreground/60">
            Ajoutez vos prestations pour pré-remplir vos factures en quelques clics.
          </p>
          <Button className="gap-2" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Ajouter une prestation
          </Button>
        </div>
      )}
      <ProductModal open={isModalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
