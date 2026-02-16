"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(1, "Nom requis"),
  description: z.string().optional(),
  price: z.string().min(1, "Prix requis"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
  workspaceCurrency: string;
  onSubmitProduct: (data: FormValues) => Promise<void>;
  /** Mode édition : id du produit à modifier */
  productId?: string;
  /** Valeurs initiales pour pré-remplir le formulaire (mode édition) */
  initialValues?: Partial<FormValues>;
}

export function CreateProductModal({
  open,
  setOpen,
  workspaceCurrency,
  onSubmitProduct,
  productId,
  initialValues,
}: Props) {
  const t = useTranslations("items.modal.fields");
  const tModal = useTranslations("items.modal");
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!productId;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
    },
  });

  // Pré-remplir le formulaire à l'ouverture en mode édition
  useEffect(() => {
    if (!open) return;
    if (initialValues) {
      form.reset({
        name: initialValues.name ?? "",
        description: initialValues.description ?? "",
        price: initialValues.price ?? "",
      });
    }
    setCurrentStep(0);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps -- on ne réinitialise qu'à l'ouverture

  const steps = [
    { label: "Informations" },
    { label: "Tarification" },
  ];

  const price = parseFloat(form.watch("price") || "0");

  const next = async () => {
    if (currentStep === 0) {
      const valid = await form.trigger(["name"]);
      if (!valid) return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const back = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      await onSubmitProduct(data);
      form.reset();
      setCurrentStep(0);
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={setOpen}
      modalMaxWidth="sm:max-w-[500px]"
      contentClassName="max-h-[90vh] overflow-y-auto px-4 py-4 sm:px-5 sm:py-5"
    >
      <DialogHeader className="space-y-1 pb-3">
        <DialogTitle className="text-lg">
          {isEditMode ? tModal("editTitle") : tModal("addTitle")}
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          {isEditMode ? tModal("editDescription") : tModal("description")}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2 mb-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{steps[currentStep].label}</span>
          <span>{currentStep + 1} / {steps.length}</span>
        </div>
        <div className="relative h-[2px] w-full rounded-full bg-muted">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nom du produit</label>
                <Input
                  placeholder={t("namePlaceholder")}
                  {...form.register("name")}
                  className={cn(
                    "h-10 rounded-lg border-border focus-visible:ring-primary/40",
                    form.formState.errors.name && "border-destructive"
                  )}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder={t("descriptionPlaceholder")}
                  {...form.register("description")}
                  rows={3}
                  className="rounded-lg border-border focus-visible:ring-primary/40 resize-none"
                />
              </div>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Prix HT (hors taxes)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={t("pricePlaceholder")}
                  {...form.register("price")}
                  className="h-10 rounded-lg border-border focus-visible:ring-primary/40"
                />
                {price > 0 && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{price.toFixed(2)} {workspaceCurrency}</span>
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between pt-3">
          {currentStep > 0 ? (
            <Button type="button" variant="ghost" onClick={back} className="h-9 px-3 text-sm">
              Retour
            </Button>
          ) : (
            <span />
          )}
          {currentStep < steps.length - 1 ? (
            <Button type="button" onClick={next} className="h-9 px-4 text-sm font-medium">
              Continuer
            </Button>
          ) : (
            <Button type="submit" disabled={isLoading} className="h-9 px-4 text-sm font-medium">
              {isLoading
                ? (isEditMode ? tModal("buttons.updating") : "Création...")
                : (isEditMode ? tModal("buttons.update") : "Créer le produit")}
            </Button>
          )}
        </div>
      </form>
    </ResponsiveModal>
  );
}
