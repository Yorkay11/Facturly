'use client'

import { useEffect, useState, useMemo } from 'react';
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, Package, Wrench, RotateCcw, Sparkles, Loader2, Search, Plus, Save, Calculator, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ItemModalProps } from '@/types/items';
import { useGetProductsQuery, useCreateProductMutation, useGetWorkspaceQuery } from "@/services/facturlyApi";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useTranslations } from 'next-intl';

export function AddItemModal({ isOpen, onClose, onSubmit, initialItem, mode = 'create' }: ItemModalProps) {
  const t = useTranslations('invoices.form.addItemModal');
  const commonT = useTranslations('common');
  const itemsModalT = useTranslations('items.modal');
  
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [productOpen, setProductOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'select' | 'manual'>('select');
  const [hasModifiedFields, setHasModifiedFields] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [showSaveProductDialog, setShowSaveProductDialog] = useState(false);
  const [productType, setProductType] = useState<'service' | 'product'>('service');
  const [originalProductValues, setOriginalProductValues] = useState<{
    description: string;
    unitPrice: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  const { data: productsResponse, isLoading: isLoadingProducts, refetch: refetchProducts } = useGetProductsQuery({ page: 1, limit: 100 });
  const { data: workspace } = useGetWorkspaceQuery();
  const products = productsResponse?.data ?? [];
  const selectedProduct = selectedProductId ? products.find((p) => p.id === selectedProductId) : null;
  
  // Debounce pour la recherche (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Filtrer les produits avec le terme de recherche debounced
  const filteredProducts = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return products;
    }
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    return products.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(searchLower);
      const descMatch = product.description?.toLowerCase().includes(searchLower);
      const skuMatch = product.sku?.toLowerCase().includes(searchLower);
      const typeMatch = product.type?.toLowerCase().includes(searchLower);
      
      return nameMatch || descMatch || skuMatch || typeMatch;
    });
  }, [products, debouncedSearchTerm]);
  
  const [createProduct, { isLoading: isCreatingProduct }] = useCreateProductMutation();
  
  const workspaceCurrency = workspace?.defaultCurrency || "EUR";

  // Calculer le total en temps réel
  const totalAmount = useMemo(() => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(unitPrice) || 0;
    return qty * price;
  }, [quantity, unitPrice]);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setDescription('');
    setQuantity('1');
    setUnitPrice('');
    setSelectedProductId('');
    setOriginalProductValues(null);
    setHasModifiedFields(false);
    setActiveTab('select');
    setIsManualEntry(false);
    setShowSaveProductDialog(false);
    setProductType('service');
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };
  
  // Réinitialiser les champs quand le modal s'ouvre
  useEffect(() => {
    if (initialItem && mode === 'edit') {
      setDescription(initialItem.description);
      setQuantity(initialItem.quantity.toString());
      setUnitPrice(initialItem.unitPrice.toString());
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
      
      setOriginalProductValues({
        description: product.name,
        unitPrice: formattedPrice,
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
        unitPrice !== originalProductValues.unitPrice;
      setHasModifiedFields(isModified);
    } else {
      setHasModifiedFields(false);
    }
  }, [description, unitPrice, selectedProductId, originalProductValues]);
  
  // Restaurer les valeurs du produit
  const restoreProductValues = () => {
    if (originalProductValues) {
      setDescription(originalProductValues.description);
      setUnitPrice(originalProductValues.unitPrice);
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
        vatRate: 0, // TVA non gérée pour le moment
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
        // currency n'est pas envoyé car le backend utilise automatiquement workspace.defaultCurrency
        taxRate: '0', // TVA non gérée pour le moment
      }).unwrap();
      
      // Rafraîchir la liste des produits
      await refetchProducts();
      
      // Ajouter l'article à la facture
      onSubmit({
        description,
        quantity: parseInt(quantity, 10) || 0,
        unitPrice: parseFloat(unitPrice) || 0,
        vatRate: 0, // TVA non gérée pour le moment
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
      vatRate: 0, // TVA non gérée pour le moment
    }, initialItem?.id);
    setShowSaveProductDialog(false);
    onClose();
  };

  return (
    <>
      <ResponsiveModal
        open={isOpen}
        onOpenChange={onClose}
        modalMaxWidth="sm:max-w-[640px]"
        contentClassName="rounded-2xl sm:rounded-[20px] border border-border/40 bg-background shadow-2xl shadow-black/5 p-0 overflow-hidden"
        closeButtonClassName="right-4 top-4 h-8 w-8 rounded-full bg-muted/60 hover:bg-muted text-foreground/70"
      >
        <div className="px-5 pt-5 pb-5">
          <DialogHeader className="p-0 pb-4 text-left space-y-1">
            <DialogTitle className="text-[17px] font-semibold tracking-tight text-foreground">
              {mode === 'edit' ? t('title.edit') : t('title.create')}
            </DialogTitle>
            <DialogDescription className="text-[15px] text-muted-foreground">
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
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger value="select" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Search className="h-4 w-4" />
                  <span className="font-medium">{t('tabs.select')}</span>
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Package className="h-4 w-4" />
                  <span className="font-medium">{t('tabs.manual')}</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="select" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-medium text-foreground">{t('fields.product')}</Label>
                    <Popover open={productOpen} onOpenChange={setProductOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={productOpen}
                          className={cn(
                            "w-full justify-between h-11 rounded-xl border-0 bg-muted/30 text-[15px] font-normal",
                            !selectedProductId && "text-muted-foreground",
                            selectedProductId && "bg-primary/10 border-primary/30 text-foreground"
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
                        <Command shouldFilter={false}>
                          <CommandInput 
                            placeholder={t('fields.searchPlaceholder')} 
                            className="h-9"
                            value={searchTerm}
                            onValueChange={setSearchTerm}
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
                                  {filteredProducts.length === 0 && products.length === 0 ? (
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
                                    filteredProducts.map((product) => (
                                      <CommandItem
                                        key={product.id}
                                        value={product.name}
                                        onSelect={() => handleProductSelect(product.id)}
                                        className="cursor-pointer rounded-lg mx-1 my-0.5 data-[selected=true]:bg-primary/10 data-[selected=true]:text-foreground"
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
                                              {product.sku && (
                                                <span className="text-muted-foreground">
                                                  {t('fields.productDetails.sku')}: {product.sku}
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
                      <Card className="rounded-xl border border-primary/30 bg-primary/5">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-md bg-primary/10">
                                {selectedProduct.type === 'service' ? (
                                  <Wrench className="h-3.5 w-3.5 text-primary" />
                                ) : (
                                  <Package className="h-3.5 w-3.5 text-primary" />
                                )}
                              </div>
                              <span className="text-sm font-semibold text-foreground">
                                {t('fields.selectedProduct')}
                              </span>
                              {hasModifiedFields && (
                                <Badge variant="outline" className="text-xs border-orange-300 text-orange-700 bg-orange-50">
                                  {t('fields.modified')}
                                </Badge>
                              )}
                            </div>
                            {hasModifiedFields && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={restoreProductValues}
                                className="h-7 text-xs gap-1.5 hover:bg-primary/10"
                              >
                                <RotateCcw className="h-3 w-3" />
                                {t('fields.restore')}
                              </Button>
                            )}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-foreground">{selectedProduct.name}</span>
                            </div>
                            {selectedProduct.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {selectedProduct.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 pt-1">
                              <span className="text-sm font-semibold text-primary">
                                {parseFloat(selectedProduct.unitPrice || selectedProduct.price || '0').toFixed(2)} {selectedProduct.currency}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  
                  {/* Message si aucun produit sélectionné */}
                  {!selectedProductId && (
                    <Card className="border-dashed border-muted-foreground/30 bg-muted/20">
                      <CardContent className="pt-6 pb-6">
                        <div className="flex flex-col items-center justify-center text-center space-y-2">
                          <div className="p-2 rounded-full bg-muted">
                            <Search className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {t('fields.selectProductMessage')}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="manual" className="space-y-4 mt-4">
                <Card className="rounded-xl border border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h3 className="text-sm font-semibold text-foreground">
                          {t('fields.manualEntry.title')}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {t('fields.manualEntry.description')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : null}
          
          {/* Formulaire d'ajout d'article - Affiché seulement si un produit est sélectionné OU en saisie manuelle OU en mode édition */}
          {(mode === 'edit' || (mode === 'create' && (selectedProductId || activeTab === 'manual'))) && (
            <>
              <div className="border-t border-border/40 my-6"></div>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section Détails de l'article */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border/40"></div>
                    <span className="text-[13px] font-semibold text-foreground uppercase tracking-wide">{t('fields.itemDetails')}</span>
                    <div className="h-px flex-1 bg-border/40"></div>
                  </div>

                  <div className="space-y-4">
                    {/* Description */}
                    <div className="space-y-1.5">
                      <Label htmlFor="description" className="text-[13px] font-medium text-foreground">
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
                        autoFocus
                        required
                        placeholder={t('fields.description.placeholder')}
                        disabled={!!selectedProductId && !isManualEntry && !hasModifiedFields && activeTab === 'select'}
                        className="h-11 rounded-xl border-0 bg-muted/30 text-[15px] focus-visible:ring-2 focus-visible:ring-ring/20"
                      />
                    </div>

                    {/* Quantité et Prix en grille */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="quantity" className="text-[13px] font-medium text-foreground">
                          {t('fields.quantity.label')}
                        </Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          required
                          className="h-11 rounded-xl border-0 bg-muted/30 text-[15px] focus-visible:ring-2 focus-visible:ring-ring/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="unitPrice" className="text-[13px] font-medium text-foreground">
                          {t('fields.unitPrice.label')} <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
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
                            }}
                            required
                            placeholder={t('fields.unitPrice.placeholder')}
                            disabled={!!selectedProductId && !isManualEntry && !hasModifiedFields && activeTab === 'select'}
                            className="h-11 rounded-xl border-0 bg-muted/30 text-[15px] focus-visible:ring-2 focus-visible:ring-ring/20 pr-16"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground font-medium">
                            {workspaceCurrency}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prévisualisation de l'article */}
                {description && quantity && unitPrice && (
                  <Card className="rounded-xl border border-primary/20 bg-primary/5">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Eye className="h-4 w-4 text-primary" />
                        <span className="text-[14px] font-semibold text-foreground">Aperçu</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-[15px] font-medium text-foreground mb-1">{description}</p>
                            <p className="text-[13px] text-muted-foreground">
                              {quantity} × {parseFloat(unitPrice || '0').toFixed(2)} {workspaceCurrency}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">
                              {totalAmount.toFixed(2)} {workspaceCurrency}
                            </p>
                            <p className="text-[12px] text-muted-foreground">Total</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Footer avec boutons */}
                <DialogFooter className="flex flex-row justify-end gap-2 pt-4 border-t border-border/40 mt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose} 
                    className="h-9 rounded-xl text-[15px] font-medium border-border/60"
                  >
                    {t('buttons.cancel')}
                  </Button>
                  <Button 
                    type="submit" 
                    className="h-9 rounded-xl px-4 text-[15px] font-semibold min-w-[120px]"
                    disabled={!description || !quantity || !unitPrice || parseFloat(quantity) <= 0 || parseFloat(unitPrice) <= 0}
                  >
                    {mode === 'edit' ? t('buttons.update') : t('buttons.add')}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </div>
      </ResponsiveModal>
      
      {/* Dialogue de confirmation pour sauvegarder le produit */}
      <AlertDialog open={showSaveProductDialog} onOpenChange={setShowSaveProductDialog}>
        <AlertDialogContent className="rounded-2xl border border-border/40 bg-background shadow-2xl">
          <AlertDialogHeader className="pb-4">
            <AlertDialogTitle className="flex items-center gap-2 text-[17px] font-semibold">
              <Save className="h-5 w-5 text-primary" />
              {t('saveDialog.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] text-muted-foreground">
              {t('saveDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="save-product-type" className="text-[13px] font-medium text-foreground">
                {t('saveDialog.fields.type.label')} <span className="text-destructive">*</span>
              </Label>
              <Select value={productType} onValueChange={(value) => setProductType(value as 'service' | 'product')}>
                <SelectTrigger className="h-11 rounded-xl border-0 bg-muted/30 text-[15px]">
                  <SelectValue placeholder={t('saveDialog.fields.type.placeholder')} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-border/40">
                  <SelectItem value="service">{itemsModalT('fields.typeService')}</SelectItem>
                  <SelectItem value="product">{itemsModalT('fields.typeProduct')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Information sur la devise de l'entreprise */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-[13px] text-muted-foreground">
                {t('saveDialog.fields.currencyInfo', { currency: workspaceCurrency })}
              </p>
            </div>
            <div className="rounded-xl border border-border/40 bg-muted/30 p-4 space-y-2">
              <p className="text-[14px] font-semibold text-foreground">{t('saveDialog.fields.summary.title')}</p>
              <div className="text-[13px] text-muted-foreground space-y-1.5">
                <p><span className="font-medium">{t('saveDialog.fields.summary.name')}:</span> {description}</p>
                <p><span className="font-medium">{t('saveDialog.fields.summary.price')}:</span> {unitPrice} {workspaceCurrency}</p>
                <p><span className="font-medium">{t('saveDialog.fields.summary.type')}:</span> {productType === 'service' ? t('types.service') : t('types.product')}</p>
              </div>
            </div>
          </div>
          <AlertDialogFooter className="gap-2 pt-4 border-t border-border/40">
            <AlertDialogCancel 
              onClick={handleAddWithoutSaving}
              className="h-9 rounded-xl text-[15px] font-medium border-border/60"
            >
              {t('saveDialog.buttons.addOnly')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSaveProductAndAdd} 
              disabled={isCreatingProduct}
              className="h-9 rounded-xl px-4 text-[15px] font-semibold"
            >
              {isCreatingProduct && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('saveDialog.buttons.saveAndAdd')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
