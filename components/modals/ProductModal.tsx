"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useCreateProductMutation } from "@/services/facturlyApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().optional(),
  type: z.enum(["product", "service"], {
    required_error: "Le type est obligatoire",
  }),
  price: z.string()
    .min(1, "Le prix est obligatoire")
    .refine(
      (val) => {
        const trimmed = val.trim();
        if (!trimmed) return false;
        const num = parseFloat(trimmed);
        return !isNaN(num) && isFinite(num) && num >= 0;
      },
      "Le prix doit être un nombre positif"
    ),
  currency: z.string().min(1, "La devise est obligatoire"),
  taxRate: z.string().min(1, "Le taux de TVA est obligatoire"),
  unitOfMeasure: z.string().optional(),
  sku: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (product: { id: string; name: string; price: string; taxRate: string }) => void;
}

export const ProductModal = ({ open, onClose, onSuccess }: ProductModalProps) => {
  const [createProduct, { isLoading, isSuccess, isError, error, data }] = useCreateProductMutation();
  const [activeTab, setActiveTab] = useState("informations");

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      type: "service",
      price: "",
      currency: "EUR",
      taxRate: "20",
      unitOfMeasure: "",
      sku: "",
    },
  });

  useEffect(() => {
    if (isSuccess && data) {
      const createdProduct = {
        id: data.id || "",
        name: data.name || "",
        price: data.price || "",
        taxRate: data.taxRate || "",
      };
      
      if (onSuccess) {
        // Si onSuccess est fourni, appeler le callback (le parent gère le toast et la fermeture)
        onSuccess(createdProduct);
        form.reset();
        setActiveTab("informations");
      } else {
        // Sinon, comportement par défaut
        toast.success("Prestation créée", {
          description: "La prestation a été créée avec succès.",
        });
        form.reset();
        setActiveTab("informations");
        onClose();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, data]);

  useEffect(() => {
    if (isError && error) {
      const errorMessage = error && "data" in error
        ? (error.data as { message?: string })?.message ?? "Une erreur est survenue lors de la création de la prestation."
        : "Vérifiez vos informations ou réessayez plus tard.";
      
      toast.error("Erreur", {
        description: errorMessage,
      });
    }
  }, [error, isError]);

  const onSubmit = async (values: ProductFormValues) => {
    // S'assurer qu'on est sur la dernière étape avant de soumettre
    if (!isLastTab) {
      handleNext();
      return;
    }

    // S'assurer que le prix est bien une string valide
    const priceValue = values.price?.trim() || "";
    if (!priceValue || isNaN(parseFloat(priceValue)) || parseFloat(priceValue) < 0) {
      toast.error("Erreur", {
        description: "Le prix doit être un nombre valide et positif.",
      });
      form.setError("price", { message: "Le prix est obligatoire" });
      return;
    }

    // S'assurer que la TVA est bien définie
    const taxRateValue = values.taxRate || form.getValues("taxRate") || "20";
    if (!taxRateValue || taxRateValue.trim() === "") {
      toast.error("Erreur", {
        description: "Le taux de TVA est obligatoire.",
      });
      form.setError("taxRate", { message: "Le taux de TVA est obligatoire" });
      return;
    }

    // S'assurer que la devise est bien définie
    const currencyValue = values.currency || form.getValues("currency") || "EUR";
    if (!currencyValue || currencyValue.trim() === "") {
      toast.error("Erreur", {
        description: "La devise est obligatoire.",
      });
      form.setError("currency", { message: "La devise est obligatoire" });
      return;
    }

    // Préparer les données pour l'API
    const productData = {
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      type: values.type,
      price: priceValue,
      currency: currencyValue.trim(),
      taxRate: taxRateValue.trim(),
      unitOfMeasure: values.unitOfMeasure?.trim() || undefined,
      sku: values.sku?.trim() || undefined,
    };

    // Log pour déboguer (à retirer en production)
    console.log("Données envoyées au backend:", productData);

    createProduct(productData);
  };

  const handleClose = () => {
    if (!isLoading) {
      form.reset();
      setActiveTab("informations");
      onClose();
    }
  };

  // Réinitialiser l'onglet actif et les valeurs par défaut quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      setActiveTab("informations");
      form.reset({
        name: "",
        description: "",
        type: "service",
        price: "",
        currency: "EUR",
        taxRate: "20",
        unitOfMeasure: "",
        sku: "",
      });
    }
  }, [open, form]);

  const tabs = [
    { id: "informations", label: "Informations" },
    { id: "tarification", label: "Tarification" },
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
          <DialogTitle>Ajouter une prestation</DialogTitle>
          <DialogDescription>
            Remplissez les informations de la prestation par sections. Les champs marqués d&apos;un astérisque (*) sont obligatoires.
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
                  <Label htmlFor="product-name">
                    Nom <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="product-name"
                    placeholder="Nom de la prestation"
                    {...form.register("name")}
                    disabled={isLoading}
                    className={form.formState.errors.name ? "border-destructive" : ""}
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-description">Description</Label>
                  <Input
                    id="product-description"
                    placeholder="Description courte (optionnel)"
                    {...form.register("description")}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Type <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="type"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                        <SelectTrigger className={form.formState.errors.type ? "border-destructive" : ""}>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="product">Produit</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.type && (
                    <p className="text-xs text-destructive">{form.formState.errors.type.message}</p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Section 2: Tarification */}
            <TabsContent value="tarification" className="space-y-4 mt-0">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="product-price">
                      Tarif HT <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="product-price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...form.register("price", {
                        setValueAs: (value) => {
                          // Convertir en string et nettoyer
                          if (value === "" || value === null || value === undefined) return "";
                          const num = parseFloat(String(value));
                          return isNaN(num) ? "" : String(num);
                        },
                      })}
                      disabled={isLoading}
                      className={form.formState.errors.price ? "border-destructive" : ""}
                    />
                    {form.formState.errors.price && (
                      <p className="text-xs text-destructive">{form.formState.errors.price.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Taux de TVA <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      name="taxRate"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                          <SelectTrigger className={form.formState.errors.taxRate ? "border-destructive" : ""}>
                            <SelectValue placeholder="TVA" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0%</SelectItem>
                            <SelectItem value="5.5">5.5%</SelectItem>
                            <SelectItem value="10">10%</SelectItem>
                            <SelectItem value="20">20%</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {form.formState.errors.taxRate && (
                      <p className="text-xs text-destructive">{form.formState.errors.taxRate.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-currency">
                    Devise <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="currency"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                        <SelectTrigger className={form.formState.errors.currency ? "border-destructive" : ""}>
                          <SelectValue placeholder="Devise" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="XOF">XOF (CFA)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.currency && (
                    <p className="text-xs text-destructive">{form.formState.errors.currency.message}</p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Section 3: Informations complémentaires */}
            <TabsContent value="complementaires" className="space-y-4 mt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product-unitOfMeasure">Unité</Label>
                  <Input
                    id="product-unitOfMeasure"
                    placeholder="heure, unité, etc. (optionnel)"
                    {...form.register("unitOfMeasure")}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-sku">Référence (SKU)</Label>
                  <Input
                    id="product-sku"
                    placeholder="Référence produit (optionnel)"
                    {...form.register("sku")}
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
                      Création...
                    </div>
                  ) : (
                    "Créer la prestation"
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

export default ProductModal;
