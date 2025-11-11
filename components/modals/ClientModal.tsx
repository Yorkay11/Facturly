"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ClientModalProps {
  open: boolean;
  onClose: () => void;
}

export const ClientModal = ({ open, onClose }: ClientModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Ajouter un client</DialogTitle>
          <DialogDescription>
            Formulaire mocké – les champs seront connectés au backend Nest lors de l’intégration.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client-name">Nom complet</Label>
              <Input id="client-name" placeholder="Nom du contact" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-company">Entreprise</Label>
              <Input id="client-company" placeholder="Société / Organisation" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-email">Email</Label>
              <Input id="client-email" type="email" placeholder="email@exemple.com" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-phone">Téléphone</Label>
              <Input id="client-phone" placeholder="+228 ..." disabled />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client-address">Adresse</Label>
              <Input id="client-address" placeholder="12 rue de l'innovation" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-city">Ville / Pays</Label>
              <Input id="client-city" placeholder="Lomé, Togo" disabled />
            </div>
          </div>
          <p className="text-xs text-foreground/60">
            TODO backend : validation, sauvegarde Prisma via Nest, retour au listing avec toast de succès.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" disabled>
            Annuler
          </Button>
          <Button disabled>Enregistrer (mock)</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClientModal;
