"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
}

export const ProductModal = ({ open, onClose }: ProductModalProps) => {
  const [vatRate, setVatRate] = useState("20");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Ajouter une prestation</DialogTitle>
          <DialogDescription>
            Formulaire mocké pour anticiper l’intégration backend.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-name">Nom</Label>
            <Input id="product-name" placeholder="Nom de la prestation" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-description">Description</Label>
            <Input id="product-description" placeholder="Description courte" disabled />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-price">Tarif HT</Label>
              <Input id="product-price" type="number" step="0.01" placeholder="0.00" disabled />
            </div>
            <div className="space-y-2">
              <Label>Taux de TVA</Label>
              <Select value={vatRate} onValueChange={setVatRate} disabled>
                <SelectTrigger>
                  <SelectValue placeholder="TVA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0%</SelectItem>
                  <SelectItem value="5.5">5.5%</SelectItem>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-foreground/60">
            TODO backend : validation, enregistrement Prisma, actualisation des listes et toasts de feedback.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" disabled>
            Annuler
          </Button>
          <Button disabled>Créer la prestation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
