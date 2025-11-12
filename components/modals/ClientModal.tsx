"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateClientMutation } from "@/services/facturlyApi";
import { toast } from "sonner";

const clientSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.union([
    z.string().email("Adresse email invalide"),
    z.literal(""),
  ]).optional(),
  phone: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (client: { id: string; name: string }) => void;
}

export const ClientModal = ({ open, onClose, onSuccess }: ClientModalProps) => {
  const [createClient, { isLoading, isSuccess, isError, error }] = useCreateClientMutation();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      postalCode: "",
      city: "",
      country: "",
      taxId: "",
      notes: "",
    },
  });

  // Note: La gestion du succès est maintenant dans onSubmit
  // Ce useEffect est gardé uniquement pour les cas où onSuccess n'est pas fourni
  // (compatibilité avec l'ancien comportement)
  useEffect(() => {
    if (isSuccess && !onSuccess) {
      toast.success("Client créé", {
        description: "Le client a été créé avec succès.",
      });
      form.reset();
      onClose();
    }
  }, [isSuccess, form, onClose, onSuccess]);

  useEffect(() => {
    if (isError && error) {
      const errorMessage = error && "data" in error
        ? (error.data as { message?: string })?.message ?? "Une erreur est survenue lors de la création du client."
        : "Vérifiez vos informations ou réessayez plus tard.";
      
      toast.error("Erreur", {
        description: errorMessage,
      });
    }
  }, [error, isError]);

  const onSubmit = async (values: ClientFormValues) => {
    try {
      const newClient = await createClient({
        name: values.name,
        email: values.email || undefined,
        phone: values.phone || undefined,
        addressLine1: values.addressLine1 || undefined,
        addressLine2: values.addressLine2 || undefined,
        postalCode: values.postalCode || undefined,
        city: values.city || undefined,
        country: values.country || undefined,
        taxId: values.taxId || undefined,
        notes: values.notes || undefined,
      }).unwrap();
      
      // Appeler le callback onSuccess si fourni (il gérera le toast et la fermeture)
      if (onSuccess && newClient) {
        form.reset();
        onSuccess({ id: newClient.id, name: newClient.name });
      } else if (!onSuccess) {
        // Sinon, afficher le toast et fermer le modal (comportement par défaut)
        toast.success("Client créé", {
          description: "Le client a été créé avec succès.",
        });
        form.reset();
        onClose();
      }
    } catch (err) {
      // L'erreur sera gérée par le useEffect existant
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Ajouter un client</DialogTitle>
          <DialogDescription>
            Remplissez les informations du client. Les champs marqués d&apos;un astérisque (*) sont obligatoires.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="client-name">
                Nom complet <span className="text-destructive">*</span>
              </Label>
              <Input
                id="client-name"
                placeholder="Nom du contact"
                {...form.register("name")}
                disabled={isLoading}
                className={form.formState.errors.name ? "border-destructive" : ""}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-email">Email</Label>
              <Input
                id="client-email"
                type="email"
                placeholder="email@exemple.com"
                {...form.register("email")}
                disabled={isLoading}
                className={form.formState.errors.email ? "border-destructive" : ""}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-phone">Téléphone</Label>
              <Input
                id="client-phone"
                placeholder="+228 ..."
                {...form.register("phone")}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="client-addressLine1">Adresse ligne 1</Label>
              <Input
                id="client-addressLine1"
                placeholder="12 rue de l'innovation"
                {...form.register("addressLine1")}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="client-addressLine2">Adresse ligne 2</Label>
              <Input
                id="client-addressLine2"
                placeholder="Complément d'adresse (optionnel)"
                {...form.register("addressLine2")}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-postalCode">Code postal</Label>
              <Input
                id="client-postalCode"
                placeholder="75001"
                {...form.register("postalCode")}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-city">Ville</Label>
              <Input
                id="client-city"
                placeholder="Paris"
                {...form.register("city")}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-country">Pays</Label>
              <Input
                id="client-country"
                placeholder="France"
                {...form.register("country")}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-taxId">Numéro d&apos;identification fiscale</Label>
              <Input
                id="client-taxId"
                placeholder="SIRET, TVA, etc."
                {...form.register("taxId")}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="client-notes">Notes</Label>
              <Input
                id="client-notes"
                placeholder="Notes supplémentaires (optionnel)"
                {...form.register("notes")}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientModal;
