"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useCreateClientMutation } from "@/services/facturlyApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const [activeTab, setActiveTab] = useState("informations");

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
      setActiveTab("informations");
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

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
    // S'assurer qu'on est sur la dernière étape avant de soumettre
    if (!isLastTab) {
      handleNext();
      return;
    }

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
        setActiveTab("informations");
        onSuccess({ id: newClient.id, name: newClient.name });
      } else if (!onSuccess) {
        // Sinon, afficher le toast et fermer le modal (comportement par défaut)
        toast.success("Client créé", {
          description: "Le client a été créé avec succès.",
        });
        form.reset();
        setActiveTab("informations");
        onClose();
      }
    } catch (err) {
      // L'erreur sera gérée par le useEffect existant
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      form.reset();
      setActiveTab("informations");
      onClose();
    }
  };

  // Réinitialiser l'onglet actif quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      setActiveTab("informations");
    }
  }, [open]);

  const tabs = [
    { id: "informations", label: "Informations" },
    { id: "adresse", label: "Adresse" },
    { id: "complementaires", label: "Complémentaires" },
  ];

  const handleNext = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  const currentTabIndex = tabs.findIndex((tab) => tab.id === activeTab);
  const isFirstTab = currentTabIndex === 0;
  const isLastTab = currentTabIndex === tabs.length - 1;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un client</DialogTitle>
          <DialogDescription>
            Remplissez les informations du client par sections. Les champs marqués d&apos;un astérisque (*) sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        {/* Indicateur de progression avec dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {tabs.map((tab, index) => (
            <div key={tab.id} className="flex items-center gap-2">
              <div
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  index === currentTabIndex
                    ? "bg-primary w-8"
                    : index < currentTabIndex
                    ? "bg-primary/60"
                    : "bg-muted"
                )}
              />
            </div>
          ))}
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (isLastTab) {
              form.handleSubmit(onSubmit)(e);
            }
          }} 
          className="space-y-4"
          onKeyDown={(e) => {
            // Empêcher la soumission avec Entrée si on n'est pas sur la dernière étape
            if (e.key === "Enter" && !isLastTab) {
              e.preventDefault();
              handleNext();
            }
          }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="hidden">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} />
              ))}
            </TabsList>

            {/* Section 1: Informations de base */}
            <TabsContent value="informations" className="space-y-4 mt-0">
              <div className="space-y-4">
                <div className="space-y-2">
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                </div>
              </div>
            </TabsContent>

            {/* Section 2: Adresse */}
            <TabsContent value="adresse" className="space-y-4 mt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client-addressLine1">Adresse ligne 1</Label>
                  <Input
                    id="client-addressLine1"
                    placeholder="12 rue de l'innovation"
                    {...form.register("addressLine1")}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-addressLine2">Adresse ligne 2</Label>
                  <Input
                    id="client-addressLine2"
                    placeholder="Complément d'adresse (optionnel)"
                    {...form.register("addressLine2")}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                </div>
              </div>
            </TabsContent>

            {/* Section 3: Informations complémentaires */}
            <TabsContent value="complementaires" className="space-y-4 mt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client-taxId">Numéro d&apos;identification fiscale</Label>
                  <Input
                    id="client-taxId"
                    placeholder="SIRET, TVA, etc."
                    {...form.register("taxId")}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-notes">Notes</Label>
                  <Input
                    id="client-notes"
                    placeholder="Notes supplémentaires (optionnel)"
                    {...form.register("notes")}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          <DialogFooter className="flex items-center justify-between">
            <div className="flex gap-2">
              {!isFirstTab && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <IoChevronBackOutline className="h-4 w-4" />
                  Précédent
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Annuler
              </Button>
              {!isLastTab ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                  className="gap-2"
                >
                  Suivant
                  <IoChevronForwardOutline className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Enregistrement...
                    </div>
                  ) : (
                    "Enregistrer"
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientModal;
