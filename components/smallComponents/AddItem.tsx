'use client'

import { useEffect, useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, Package, Wrench, RotateCcw, Sparkles, Loader2, Search, Plus, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { ItemModalProps } from '@/types/items';
import { useGetProductsQuery, useCreateProductMutation } from "@/services/facturlyApi";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useTranslations } from 'next-intl';

export function AddItemModal({ isOpen, onClose, onSubmit, initialItem, mode = 'create' }: ItemModalProps) {
  const t = useTranslations('invoices.addItemModal');
  const commonT = useTranslations('common');
  const itemsModalT = useTranslations('items.modal');
  
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [vatRate, setVatRate] = useState('20');
  const [productOpen, setProductOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'select' | 'manual'>('select');
  const [hasModifiedFields, setHasModifiedFields] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [showSaveProductDialog, setShowSaveProductDialog] = useState(false);
  const [productType, setProductType] = useState<'service' | 'product'>('service');
  const [productCurrency, setProductCurrency] = useState('EUR');
  const [originalProductValues, setOriginalProductValues] = useState<{
    description: string;
    unitPrice: string;
    vatRate: string;
  } | null>(null);
  
  const { data: productsResponse, isLoading: isLoadingProducts, refetch: refetchProducts } = useGetProductsQuery({ page: 1, limit: 100 });
  const products = productsResponse?.data ?? [];
  const selectedProduct = selectedProductId ? products.find((p) => p.id === selectedProductId) : null;
  
  const [createProduct, { isLoading: isCreatingProduct }] = useCreateProductMutation();

  // Réinitialiser le formulaire
  const resetForm = () => {
    setDescription('');
    setQuantity('1');
    setUnitPrice('');
    setVatRate('20');
    setSelectedProductId('');
    setOriginalProductValues(null);
    setHasModifiedFields(false);
    setActiveTab('select');
    setIsManualEntry(false);
    setShowSaveProductDialog(false);
    setProductType('service');
    setProductCurrency('EUR');
  };
  
  // Réinitialiser les champs quand le modal s'ouvre
  useEffect(() => {
    if (initialItem && mode === 'edit') {
      setDescription(initialItem.description);
      setQuantity(initialItem.quantity.toString());
      setUnitPrice(initialItem.unitPrice.toString());
      setVatRate(initialItem.vatRate.toString());
      setSelectedProductId('');
      setActiveTab('select');
    } else if (isOpen && mode === 'create') {
      resetForm();
    }
  }, [initialItem, mode, isOpen]);
  
  // Réinitialiser quand le modal se ferme
  useEffect(() => {
    if (!isOpen && mode === 'create') {
      const timer = setTimeout(() => {
        resetForm();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mode]);
  
  // Gérer la sélection d'un produit
  const handleProductSelect = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProductId(productId);
      setDescription(product.name);
      const priceValue = product.unitPrice || product.price || '0';
      const price = parseFloat(priceValue);
      const formattedPrice = isNaN(price) ? '0' : price.toFixed(2);
      setUnitPrice(formattedPrice);
      setVatRate(product.taxRate || '20');
      
      setOriginalProductValues({
        description: product.name,
        unitPrice: formattedPrice,
        vatRate: product.taxRate || '20',
      });
      setHasModifiedFields(false);
      setProductOpen(false);
      setIsManualEntry(false);
      setActiveTab('select'); // S'assurer qu'on est dans l'onglet select après sélection
      
      toast.success(t('toasts.productSelected'), {
        description: t('toasts.productSelectedDescription', { name: product.name }),
      });
    }
  };
  
  // Vérifier si les champs ont été modifiés
  useEffect(() => {
    if (selectedProductId && originalProductValues) {
      const isModified = 
        description !== originalProductValues.description ||
        unitPrice !== originalProductValues.unitPrice ||
        vatRate !== originalProductValues.vatRate;
      setHasModifiedFields(isModified);
    } else {
      setHasModifiedFields(false);
    }
  }, [description, unitPrice, vatRate, selectedProductId, originalProductValues]);
  
  // Restaurer les valeurs du produit
  const restoreProductValues = () => {
    if (originalProductValues) {
      setDescription(originalProductValues.description);
      setUnitPrice(originalProductValues.unitPrice);
      setVatRate(originalProductValues.vatRate);
      setHasModifiedFields(false);
      toast.info(t('toasts.valuesRestored'), {
        description: t('toasts.valuesRestoredDescription'),
      });
    }
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si c'est une saisie manuelle (pas de produit sélectionné et on est dans l'onglet manual ou c'est une saisie manuelle), demander si on veut sauvegarder
    if (!selectedProductId && (activeTab === 'manual' || isManualEntry) && mode === 'create') {
      setShowSaveProductDialog(true);
    } else {
      // Sinon, ajouter directement l'article
      onSubmit({
        description,
        quantity: parseInt(quantity, 10) || 0,
        unitPrice: parseFloat(unitPrice) || 0,
        vatRate: parseFloat(vatRate) || 0,
      }, initialItem?.id);
      onClose();
    }
  };
  
  // Sauvegarder le produit et ajouter l'article
  const handleSaveProductAndAdd = async () => {
    try {
      // Créer le produit
      await createProduct({
        name: description,
        type: productType,
        price: unitPrice,
        currency: productCurrency,
        taxRate: vatRate,
      }).unwrap();
      
      // Rafraîchir la liste des produits
      await refetchProducts();
      
      // Ajouter l'article à la facture
      onSubmit({
        description,
        quantity: parseInt(quantity, 10) || 0,
        unitPrice: parseFloat(unitPrice) || 0,
        vatRate: parseFloat(vatRate) || 0,
      }, initialItem?.id);
      
      setShowSaveProductDialog(false);
      onClose();
      
      toast.success(t('toasts.productCreated'), {
        description: t('toasts.productCreatedDescription', { name: description }),
      });
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || t('toasts.createError');
      toast.error(commonT('error'), {
        description: errorMessage,
      });
    }
  };
  
  // Ajouter l'article sans sauvegarder
  const handleAddWithoutSaving = () => {
    onSubmit({
      description,
      quantity: parseInt(quantity, 10) || 0,
      unitPrice: parseFloat(unitPrice) || 0,
      vatRate: parseFloat(vatRate) || 0,
    }, initialItem?.id);
    setShowSaveProductDialog(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{mode === 'edit' ? t('title.edit') : t('title.create')}</DialogTitle>
            <DialogDescription>
              {mode === 'create' 
                ? t('description.create')
                : t('description.edit')}
            </DialogDescription>
          </DialogHeader>
          
          {mode === 'create' ? (
            <Tabs value={activeTab} onValueChange={(value) => {
              const newTab = value as 'select' | 'manual';
              setActiveTab(newTab);
              if (newTab === 'manual') {
                setIsManualEntry(true);
                setSelectedProductId('');
                setOriginalProductValues(null);
                setHasModifiedFields(false);
              } else if (newTab === 'select') {
                setIsManualEntry(false);
              }
            }} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="select" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  {t('tabs.select')}
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {t('tabs.manual')}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="select" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('fields.product')}</Label>
                    <Popover open={productOpen} onOpenChange={setProductOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={productOpen}
                          className={cn(
                            "w-full justify-between",
                            !selectedProductId && "text-muted-foreground",
                            selectedProductId && "border-primary/50 bg-primary/5  hover:text-white "
                          )}
                          type="button"
                        >
                          <div className="flex items-center gap-2">
                            {selectedProductId && selectedProduct ? (
                              <>
                                {selectedProduct.type === 'service' ? (
                                  <Wrench className="h-4 w-4 text-primary" />
                                ) : (
                                  <Package className="h-4 w-4 text-primary" />
                                )}
                                <span className="font-medium">{selectedProduct.name}</span>
                                {hasModifiedFields && (
                                  <Badge variant="outline" className="text-xs">
                                    {t('fields.modified')}
                                  </Badge>
                                )}
                              </>
                            ) : (
                              <span>{t('fields.selectProduct')}</span>
                            )}
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                        <Command shouldFilter={true}>
                          <CommandInput 
                            placeholder={t('fields.searchPlaceholder')} 
                            className="h-9" 
                          />
                          <CommandList>
                            {isLoadingProducts ? (
                              <div className="py-6 text-center text-sm text-muted-foreground">
                                <Loader2 className="mx-auto h-4 w-4 animate-spin mb-2" />
                                {t('fields.loading')}
                              </div>
                            ) : (
                              <>
                                <CommandEmpty>
                                  <div className="py-4 text-center">
                                    <p className="text-sm text-muted-foreground mb-2">{t('fields.noResults')}</p>
                                  </div>
                                </CommandEmpty>
                                <CommandGroup>
                                  {products.length === 0 ? (
                                    <div className="py-6 px-4 text-center space-y-3">
                                      <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                        <Package className="h-6 w-6 text-muted-foreground" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-foreground mb-1">
                                          {t('fields.noProducts.title')}
                                        </p>
                                        <p className="text-xs text-muted-foreground mb-3">
                                          {t('fields.noProducts.description')}
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    products.map((product) => (
                                      <CommandItem
                                        key={product.id}
                                        value={`${product.name} ${product.description || ""} ${product.type || ""} ${product.sku || ""}`}
                                        onSelect={() => handleProductSelect(product.id)}
                                        className="cursor-pointer data-[selected=true]:bg-primary"
                                      >
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                          <div className="mt-0.5">
                                            {product.type === 'service' ? (
                                              <Wrench className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                              <Package className="h-4 w-4 text-muted-foreground" />
                                            )}
                                          </div>
                                          <div className="flex flex-1 flex-col gap-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium truncate">{product.name}</span>
                                              <Badge 
                                                variant="secondary" 
                                                className="text-xs shrink-0 text-bg"
                                              >
                                                {product.type === 'service' ? t('types.service') : t('types.product')}
                                              </Badge>
                                            </div>
                                            {product.description && (
                                              <span className="text-xs text-muted-foreground line-clamp-1">
                                                {product.description}
                                              </span>
                                            )}
                                            <div className="flex items-center gap-3 text-xs">
                                              <span className="font-medium text-primary">
                                                {parseFloat(product.unitPrice || product.price || '0').toFixed(2)} {product.currency}
                                              </span>
                                              <span className="text-muted-foreground">
                                                {t('fields.productDetails.vat')}: {product.taxRate}%
                                              </span>
                                              {product.sku && (
                                                <span className="text-muted-foreground">
                                                  SKU: {product.sku}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          <Check
                                            className={cn(
                                              "ml-2 h-4 w-4 shrink-0 mt-0.5 text-white",
                                              selectedProductId === product.id ? "opacity-100" : "opacity-0 data-[selected=true]:opacity-100"
                                            )}
                                          />
                                        </div>
                                      </CommandItem>
                                    ))
                                  )}
                                </CommandGroup>
                                {selectedProductId && (
                                  <CommandGroup>
                                    <div className="border-t border-border p-1">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setSelectedProductId('');
                                          setDescription('');
                                          setUnitPrice('');
                                          setVatRate('20');
                                          setOriginalProductValues(null);
                                          setHasModifiedFields(false);
                                          setProductOpen(false);
                                        }}
                                      >
                                        {t('fields.clearSelection')}
                                      </Button>
                                    </div>
                                  </CommandGroup>
                                )}
                              </>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    
                    {/* Résumé du produit sélectionné */}
                    {selectedProduct && (
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">
                              {t('fields.selectedProduct')}
                            </span>
                          </div>
                          {hasModifiedFields && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={restoreProductValues}
                              className="h-7 text-xs gap-1"
                            >
                              <RotateCcw className="h-3 w-3" />
                              {t('fields.restore')}
                            </Button>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>
                            <span className="font-medium">{t('fields.productDetails.name')}:</span> {selectedProduct.name}
                          </p>
                          {selectedProduct.description && (
                            <p>
                              <span className="font-medium">{t('fields.productDetails.description')}:</span> {selectedProduct.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4">
                            <span>
                              <span className="font-medium">{t('fields.productDetails.price')}:</span> {parseFloat(selectedProduct.unitPrice || selectedProduct.price || '0').toFixed(2)} {selectedProduct.currency}
                            </span>
                            <span>
                              <span className="font-medium">{t('fields.productDetails.vat')}:</span> {selectedProduct.taxRate}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Message si aucun produit sélectionné */}
                  {!selectedProductId && (
                    <div className="rounded-lg border border-dashed border-muted-foreground/25 bg-muted/30 p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        {t('fields.selectProductMessage')}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="manual" className="space-y-4 mt-4">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {t('fields.manualEntry.title')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('fields.manualEntry.description')}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          ) : null}
          
          {/* Formulaire d'ajout d'article - Affiché seulement si un produit est sélectionné OU en saisie manuelle OU en mode édition */}
          {(mode === 'edit' || (mode === 'create' && (selectedProductId || activeTab === 'manual'))) && (
            <>
              <Separator className="my-4" />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border"></div>
                  <span className="text-sm font-medium text-muted-foreground">{t('fields.itemDetails')}</span>
                  <div className="h-px flex-1 bg-border"></div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">
                        {t('fields.description.label')} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="description"
                        value={description}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setDescription(newValue);
                          // Si on modifie manuellement la description
                          if (selectedProductId) {
                            // Si la nouvelle valeur diffère du produit sélectionné
                            if (newValue !== selectedProduct?.name) {
                              setHasModifiedFields(true);
                            }
                          } else if (activeTab === 'manual' || newValue) {
                            setIsManualEntry(true);
                            setSelectedProductId('');
                            setOriginalProductValues(null);
                            setHasModifiedFields(false);
                          }
                        }}
                        required
                        placeholder={t('fields.description.placeholder')}
                        disabled={!!selectedProductId && !isManualEntry && !hasModifiedFields && activeTab === 'select'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">{t('fields.quantity.label')}</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unitPrice">
                        {t('fields.unitPrice.label')} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="unitPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={unitPrice}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setUnitPrice(newValue);
                          // Si on modifie manuellement le prix
                          if (selectedProductId) {
                            const productPrice = parseFloat(selectedProduct?.price || '0');
                            const newPrice = parseFloat(newValue);
                            if (!isNaN(newPrice) && !isNaN(productPrice) && Math.abs(newPrice - productPrice) > 0.01) {
                              setHasModifiedFields(true);
                            }
                          } else if (activeTab === 'manual' || newValue) {
                            setIsManualEntry(true);
                            setSelectedProductId('');
                            setOriginalProductValues(null);
                            setHasModifiedFields(false);
                          }
                          // Extraire la devise du produit sélectionné si disponible
                          if (selectedProduct?.currency) {
                            setProductCurrency(selectedProduct.currency);
                          }
                        }}
                        required
                        placeholder={t('fields.unitPrice.placeholder')}
                        disabled={!!selectedProductId && !isManualEntry && !hasModifiedFields && activeTab === 'select'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vatRate">
                        {t('fields.vatRate.label')} <span className="text-destructive">*</span>
                      </Label>
                      <Select 
                        value={vatRate} 
                        onValueChange={(value) => {
                          setVatRate(value);
                          // Si on modifie manuellement la TVA
                          if (selectedProductId) {
                            if (value !== selectedProduct?.taxRate) {
                              setHasModifiedFields(true);
                            }
                          } else if (activeTab === 'manual') {
                            setIsManualEntry(true);
                            setSelectedProductId('');
                            setOriginalProductValues(null);
                            setHasModifiedFields(false);
                          }
                        }}
                        disabled={!!selectedProductId && !isManualEntry && !hasModifiedFields && activeTab === 'select'}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('fields.vatRate.placeholder')} />
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
                  <DialogFooter className="mt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                      {t('buttons.cancel')}
                    </Button>
                    <Button type="submit">{mode === 'edit' ? t('buttons.update') : t('buttons.add')}</Button>
                  </DialogFooter>
                </form>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de confirmation pour sauvegarder le produit */}
      <AlertDialog open={showSaveProductDialog} onOpenChange={setShowSaveProductDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Save className="h-5 w-5 text-primary" />
              {t('saveDialog.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('saveDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="save-product-type">
                {t('saveDialog.fields.type.label')} <span className="text-destructive">*</span>
              </Label>
              <Select value={productType} onValueChange={(value) => setProductType(value as 'service' | 'product')}>
                <SelectTrigger>
                  <SelectValue placeholder={t('saveDialog.fields.type.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">{itemsModalT('fields.typeService')}</SelectItem>
                  <SelectItem value="product">{itemsModalT('fields.typeProduct')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="save-product-currency">
                {t('saveDialog.fields.currency.label')} <span className="text-destructive">*</span>
              </Label>
              <Select value={productCurrency} onValueChange={setProductCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder={t('saveDialog.fields.currency.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="XOF">XOF (CFA)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border border-muted-foreground/20 bg-muted/30 p-3 space-y-1">
              <p className="text-sm font-medium">{t('saveDialog.fields.summary.title')}</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><span className="font-medium">{t('saveDialog.fields.summary.name')}:</span> {description}</p>
                <p><span className="font-medium">{t('saveDialog.fields.summary.price')}:</span> {unitPrice} {productCurrency}</p>
                <p><span className="font-medium">{t('saveDialog.fields.summary.vat')}:</span> {vatRate}%</p>
                <p><span className="font-medium">{t('saveDialog.fields.summary.type')}:</span> {productType === 'service' ? t('types.service') : t('types.product')}</p>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleAddWithoutSaving}>
              {t('saveDialog.buttons.addOnly')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveProductAndAdd} disabled={isCreatingProduct}>
              {isCreatingProduct && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('saveDialog.buttons.saveAndAdd')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
