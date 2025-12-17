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
import { useTranslations } from 'next-intl';

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (product: { id: string; name: string; price: string; taxRate: string }) => void;
}

export const ProductModal = ({ open, onClose, onSuccess }: ProductModalProps) => {
  const t = useTranslations('items.modal');
  const tValidation = useTranslations('items.modal.validation');
  const itemsT = useTranslations('items');
  const commonT = useTranslations('common');
  
  const [createProduct, { isLoading, isSuccess, isError, error, data }] = useCreateProductMutation();
  const [activeTab, setActiveTab] = useState("informations");

  const productSchema = z.object({
    name: z.string().min(2, tValidation('nameMinLength')),
    description: z.string().optional(),
    type: z.enum(["product", "service"], {
      required_error: tValidation('typeRequired'),
    }),
    price: z.string()
      .min(1, tValidation('priceRequired'))
      .refine(
        (val) => {
          const trimmed = val.trim();
          if (!trimmed) return false;
          const num = parseFloat(trimmed);
          return !isNaN(num) && isFinite(num) && num >= 0;
        },
        tValidation('pricePositive')
      ),
    currency: z.string().min(1, tValidation('currencyRequired')),
    taxRate: z.string().min(1, tValidation('taxRateRequired')),
    unitOfMeasure: z.string().optional(),
    sku: z.string().optional(),
  });

  type ProductFormValues = z.infer<typeof productSchema>;

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
        toast.success(itemsT('success.createSuccess'), {
          description: itemsT('success.createSuccessDescription'),
        });
        form.reset();
        setActiveTab("informations");
        onClose();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, data, itemsT, onSuccess, onClose]);

  useEffect(() => {
    if (isError && error) {
      const errorMessage = error && "data" in error
        ? (error.data as { message?: string })?.message ?? tValidation('createError')
        : tValidation('createErrorGeneric');
      
      toast.error(commonT('error'), {
        description: errorMessage,
      });
    }
  }, [error, isError, tValidation, commonT]);

  const onSubmit = async (values: ProductFormValues) => {
    // S'assurer qu'on est sur la dernière étape avant de soumettre
    if (!isLastTab) {
      handleNext();
      return;
    }

    // S'assurer que le prix est bien une string valide
    const priceValue = values.price?.trim() || "";
    if (!priceValue || isNaN(parseFloat(priceValue)) || parseFloat(priceValue) < 0) {
      toast.error(commonT('error'), {
        description: tValidation('priceValid'),
      });
      form.setError("price", { message: tValidation('priceRequired') });
      return;
    }

    // S'assurer que la TVA est bien définie
    const taxRateValue = values.taxRate || form.getValues("taxRate") || "20";
    if (!taxRateValue || taxRateValue.trim() === "") {
      toast.error(commonT('error'), {
        description: tValidation('taxRateRequired'),
      });
      form.setError("taxRate", { message: tValidation('taxRateRequired') });
      return;
    }

    // S'assurer que la devise est bien définie
    const currencyValue = values.currency || form.getValues("currency") || "EUR";
    if (!currencyValue || currencyValue.trim() === "") {
      toast.error(commonT('error'), {
        description: tValidation('currencyRequired'),
      });
      form.setError("currency", { message: tValidation('currencyRequired') });
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
    { id: "informations", label: t('tabs.informations') },
    { id: "tarification", label: t('tabs.tarification') },
    { id: "complementaires", label: t('tabs.complementaires') },
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
          <DialogTitle>{t('addTitle')}</DialogTitle>
          <DialogDescription>
            {t('description')}
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
                  <Label>
                    {t('fields.type')} <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="type"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                        <SelectTrigger className={form.formState.errors.type ? "border-destructive" : ""}>
                          <SelectValue placeholder={t('fields.typePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="service">{t('fields.typeService')}</SelectItem>
                          <SelectItem value="product">{t('fields.typeProduct')}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.type && (
                    <p className="text-xs text-destructive">{form.formState.errors.type.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-name">
                    {t('fields.name')} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="product-name"
                    placeholder={t('fields.namePlaceholder')}
                    {...form.register("name")}
                    disabled={isLoading}
                    className={form.formState.errors.name ? "border-destructive" : ""}
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-description">{t('fields.description')}</Label>
                  <Input
                    id="product-description"
                    placeholder={t('fields.descriptionPlaceholder')}
                    {...form.register("description")}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Section 2: Tarification */}
            <TabsContent value="tarification" className="space-y-4 mt-0">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="product-price">
                      {t('fields.priceHT')} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="product-price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={t('fields.pricePlaceholder')}
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
                      {t('fields.taxRate')} <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      name="taxRate"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                          <SelectTrigger className={form.formState.errors.taxRate ? "border-destructive" : ""}>
                            <SelectValue placeholder={t('fields.taxRatePlaceholder')} />
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
                    {t('fields.currency')} <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="currency"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                        <SelectTrigger className={form.formState.errors.currency ? "border-destructive" : ""}>
                          <SelectValue placeholder={t('fields.currencyPlaceholder')} />
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
                  <Label htmlFor="product-unitOfMeasure">{t('fields.unit')}</Label>
                  <Input
                    id="product-unitOfMeasure"
                    placeholder={t('fields.unitPlaceholder')}
                    {...form.register("unitOfMeasure")}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-sku">{t('fields.sku')}</Label>
                  <Input
                    id="product-sku"
                    placeholder={t('fields.skuPlaceholder')}
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
                  {t('buttons.previous')}
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
                {t('buttons.cancel')}
              </Button>
              {!isLastTab ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {t('buttons.next')}
                  <IoChevronForwardOutline className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      {t('buttons.creating')}
                    </div>
                  ) : (
                    t('buttons.create')
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
