"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateProductMutation } from "@/services/facturlyApi";
import { toast } from "sonner";

const productSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().optional(),
  type: z.enum(["product", "service"], {
    required_error: "Le type est obligatoire",
  }),
  price: z.string().min(1, "Le prix est obligatoire").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    "Le prix doit être un nombre positif"
  ),
  currency: z.string().min(1, "La devise est obligatoire"),
  taxRate: z.string().min(1, "Le taux de TVA est obligatoire"),
  unit: z.string().optional(),
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

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "service",
      price: "",
      currency: "EUR",
      taxRate: "20",
      unit: "",
      sku: "",
    },
  });

  useEffect(() => {
    if (isSuccess && data) {
      const createdProduct = {
        id: data.id || "",
        name: data.name || form.getValues("name"),
        price: data.price || form.getValues("price"),
        taxRate: data.taxRate || form.getValues("taxRate"),
      };
      
      if (onSuccess) {
        // Si onSuccess est fourni, appeler le callback (le parent gère le toast et la fermeture)
        onSuccess(createdProduct);
        form.reset();
      } else {
        // Sinon, comportement par défaut
        toast.success("Prestation créée", {
          description: "La prestation a été créée avec succès.",
        });
        form.reset();
        onClose();
      }
    }
  }, [isSuccess, data, form, onClose, onSuccess]);

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

  const onSubmit = (values: ProductFormValues) => {
    createProduct({
      name: values.name,
      description: values.description || undefined,
      type: values.type,
      price: values.price,
      currency: values.currency,
      taxRate: values.taxRate,
      unit: values.unit || undefined,
      sku: values.sku || undefined,
    });
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
          <DialogTitle>Ajouter une prestation</DialogTitle>
          <DialogDescription>
            Remplissez les informations de la prestation. Les champs marqués d&apos;un astérisque (*) sont obligatoires.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product-price">
                  Tarif HT <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="product-price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register("price")}
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="XOF">XOF (CFA)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.currency && (
                  <p className="text-xs text-destructive">{form.formState.errors.currency.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-unit">Unité</Label>
                <Input
                  id="product-unit"
                  placeholder="heure, unité, etc. (optionnel)"
                  {...form.register("unit")}
                  disabled={isLoading}
                />
              </div>
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
              Créer la prestation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
