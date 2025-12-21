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
import { useCreateProductMutation, useUpdateProductMutation, useGetProductByIdQuery, useGetWorkspaceQuery } from "@/services/facturlyApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslations } from 'next-intl';

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  productId?: string; // ID du produit à modifier (si fourni, mode édition)
  onSuccess?: (product: { id: string; name: string; price: string; taxRate: string }) => void;
}

export const ProductModal = ({ open, onClose, productId, onSuccess }: ProductModalProps) => {
  const t = useTranslations('items.modal');
  const tValidation = useTranslations('items.modal.validation');
  const itemsT = useTranslations('items');
  const commonT = useTranslations('common');
  
  const isEditMode = !!productId;
  
  // Charger les données du produit en mode édition
  const { data: existingProduct, isLoading: isLoadingProduct } = useGetProductByIdQuery(productId!, {
    skip: !isEditMode || !productId,
  });
  
  const [createProduct, { isLoading: isCreating, isSuccess: isCreateSuccess, isError: isCreateError, error: createError, data }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating, isSuccess: isUpdateSuccess, isError: isUpdateError, error: updateError }] = useUpdateProductMutation();
  
  const isLoading = isCreating || isUpdating;
  const isSuccess = isCreateSuccess || isUpdateSuccess;
  const isError = isCreateError || isUpdateError;
  const error = createError || updateError;
  
  const { data: workspace } = useGetWorkspaceQuery();
  const [activeTab, setActiveTab] = useState("informations");
  
  const workspaceCurrency = workspace?.defaultCurrency || "EUR";

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
      taxRate: "20",
      unitOfMeasure: "",
      sku: "",
    },
  });

  // Pré-remplir le formulaire avec les données du produit en mode édition
  useEffect(() => {
    if (isEditMode && existingProduct && open) {
      form.reset({
        name: existingProduct.name || "",
        description: existingProduct.description || "",
        type: existingProduct.type || "service",
        price: existingProduct.unitPrice || existingProduct.price || "",
        taxRate: existingProduct.taxRate || "20",
        unitOfMeasure: existingProduct.unitOfMeasure || "",
        sku: existingProduct.sku || "",
      });
    } else if (!isEditMode && open) {
      // Réinitialiser le formulaire en mode création
      form.reset({
        name: "",
        description: "",
        type: "service",
        price: "",
        taxRate: "20",
        unitOfMeasure: "",
        sku: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingProduct, isEditMode, open]);

  useEffect(() => {
    if (isSuccess) {
      let productData;
      if (isEditMode && existingProduct) {
        productData = {
          id: existingProduct.id || "",
          name: existingProduct.name || "",
          price: existingProduct.unitPrice || existingProduct.price || "",
          taxRate: existingProduct.taxRate || "",
        };
      } else if (data) {
        productData = {
          id: data.id || "",
          name: data.name || "",
          price: data.price || "",
          taxRate: data.taxRate || "",
        };
      }
      
      if (onSuccess && productData) {
        // Si onSuccess est fourni, appeler le callback (le parent gère le toast et la fermeture)
        onSuccess(productData);
        form.reset();
        setActiveTab("informations");
      } else {
        // Sinon, comportement par défaut
        if (isEditMode) {
          toast.success(itemsT('success.updateSuccess'), {
            description: itemsT('success.updateSuccessDescription'),
          });
        } else {
          toast.success(itemsT('success.createSuccess'), {
            description: itemsT('success.createSuccessDescription'),
          });
        }
        form.reset();
        setActiveTab("informations");
        onClose();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, isEditMode, data, existingProduct, itemsT, onSuccess, onClose]);

  useEffect(() => {
    if (isError && error) {
      const errorMessage = error && "data" in error
        ? (error.data as { message?: string })?.message ?? (isEditMode ? tValidation('updateError') : tValidation('createError'))
        : (isEditMode ? tValidation('updateErrorGeneric') : tValidation('createErrorGeneric'));
      
      toast.error(commonT('error'), {
        description: errorMessage,
      });
    }
  }, [error, isError, isEditMode, tValidation, commonT]);

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

    // Préparer les données pour l'API
    // Note: currency n'est pas envoyé car le backend utilise automatiquement workspace.defaultCurrency
    const productData = {
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      type: values.type,
      price: priceValue,
      taxRate: taxRateValue.trim(),
      unitOfMeasure: values.unitOfMeasure?.trim() || undefined,
      sku: values.sku?.trim() || undefined,
    };

    // Log pour déboguer (à retirer en production)
    console.log("Données envoyées au backend:", productData);

    if (isEditMode && productId) {
      // Mode édition
      updateProduct({
        id: productId,
        payload: productData,
      });
    } else {
      // Mode création
      createProduct(productData);
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
          <DialogTitle>{isEditMode ? t('editTitle') : t('addTitle')}</DialogTitle>
          <DialogDescription>
            {isEditMode ? t('editDescription') : t('description')}
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
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoading || isLoadingProduct}>
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
                    disabled={isLoading || isLoadingProduct}
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
                    disabled={isLoading || isLoadingProduct}
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
                      disabled={isLoading || isLoadingProduct}
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
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading || isLoadingProduct}>
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
                {/* Information sur la devise de l'entreprise */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="text-sm text-muted-foreground">
                    {t('fields.currencyInfo', { currency: workspaceCurrency })}
                  </p>
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
                    disabled={isLoading || isLoadingProduct}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-sku">{t('fields.sku')}</Label>
                  <Input
                    id="product-sku"
                    placeholder={t('fields.skuPlaceholder')}
                    {...form.register("sku")}
                    disabled={isLoading || isLoadingProduct}
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
                  disabled={isLoading || isLoadingProduct}
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
                disabled={isLoading || isLoadingProduct}
              >
                {t('buttons.cancel')}
              </Button>
              {!isLastTab ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading || isLoadingProduct}
                  className="gap-2"
                >
                  {t('buttons.next')}
                  <IoChevronForwardOutline className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading || isLoadingProduct}>
                  {(isLoading || isLoadingProduct) ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      {isEditMode ? t('buttons.updating') : t('buttons.creating')}
                    </div>
                  ) : (
                    isEditMode ? t('buttons.update') : t('buttons.create')
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
