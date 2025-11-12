'use client'

import { useEffect, useState } from 'react';
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

export function AddItemModal({ isOpen, onClose, onSubmit, initialItem, mode = 'create' }: ItemModalProps) {
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
      const price = parseFloat(product.price);
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
      
      toast.success("Produit sélectionné", {
        description: `${product.name} a été ajouté. Complétez la quantité ci-dessous.`,
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
      toast.info("Valeurs restaurées", {
        description: "Les valeurs du produit ont été restaurées.",
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
        description: undefined,
        type: productType,
        price: unitPrice,
        currency: productCurrency,
        taxRate: vatRate,
        unit: undefined,
        sku: undefined,
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
      
      toast.success("Produit créé et article ajouté", {
        description: `${description} a été sauvegardé dans le catalogue et ajouté à la facture.`,
      });
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "Une erreur est survenue lors de la création du produit.";
      toast.error("Erreur", {
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
            <DialogTitle>{mode === 'edit' ? 'Modifier la ligne' : 'Ajouter un article à la facture'}</DialogTitle>
            <DialogDescription>
              {mode === 'create' 
                ? 'Sélectionnez un produit existant ou saisissez manuellement les informations.'
                : 'Modifiez les informations de la ligne de facture.'}
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
                  Sélectionner
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Saisie manuelle
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="select" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Produit/Prestation</Label>
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
                                    Modifié
                                  </Badge>
                                )}
                              </>
                            ) : (
                              <span >Sélectionner un produit</span>
                            )}
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                        <Command shouldFilter={true}>
                          <CommandInput 
                            placeholder="Rechercher par nom, description ou SKU..." 
                            className="h-9" 
                          />
                          <CommandList>
                            {isLoadingProducts ? (
                              <div className="py-6 text-center text-sm text-muted-foreground">
                                <Loader2 className="mx-auto h-4 w-4 animate-spin mb-2" />
                                Chargement des produits...
                              </div>
                            ) : (
                              <>
                                <CommandEmpty>
                                  <div className="py-4 text-center">
                                    <p className="text-sm text-muted-foreground mb-2">Aucun produit trouvé.</p>
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
                                          Aucun produit disponible
                                        </p>
                                        <p className="text-xs text-muted-foreground mb-3">
                                          Passez à la saisie manuelle pour ajouter un article.
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
                                                {product.type === 'service' ? 'Prestation' : 'Produit'}
                                              </Badge>
                                            </div>
                                            {product.description && (
                                              <span className="text-xs text-muted-foreground line-clamp-1">
                                                {product.description}
                                              </span>
                                            )}
                                            <div className="flex items-center gap-3 text-xs">
                                              <span className="font-medium text-primary">
                                                {parseFloat(product.price).toFixed(2)} {product.currency}
                                              </span>
                                              <span className="text-muted-foreground">
                                                TVA: {product.taxRate}%
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
                                        Effacer la sélection
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
                              Produit sélectionné
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
                              Restaurer
                            </Button>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>
                            <span className="font-medium">Nom:</span> {selectedProduct.name}
                          </p>
                          {selectedProduct.description && (
                            <p>
                              <span className="font-medium">Description:</span> {selectedProduct.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4">
                            <span>
                              <span className="font-medium">Prix:</span> {parseFloat(selectedProduct.price).toFixed(2)} {selectedProduct.currency}
                            </span>
                            <span>
                              <span className="font-medium">TVA:</span> {selectedProduct.taxRate}%
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
                        Sélectionnez un produit pour continuer, ou passez à la saisie manuelle.
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
                      Saisie manuelle
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ajoutez un article directement à la facture. Vous pourrez choisir de le sauvegarder dans le catalogue après validation.
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
                  <span className="text-sm font-medium text-muted-foreground">Détails de l&apos;article</span>
                  <div className="h-px flex-1 bg-border"></div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Description <span className="text-destructive">*</span>
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
                        placeholder="Nom du produit ou de la prestation"
                        disabled={!!selectedProductId && !isManualEntry && !hasModifiedFields && activeTab === 'select'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantité</Label>
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
                        Prix unitaire <span className="text-destructive">*</span>
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
                        placeholder="0.00"
                        disabled={!!selectedProductId && !isManualEntry && !hasModifiedFields && activeTab === 'select'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vatRate">
                        Taux de TVA <span className="text-destructive">*</span>
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
                          <SelectValue placeholder="Sélectionnez le taux de TVA" />
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
                      Annuler
                    </Button>
                    <Button type="submit">{mode === 'edit' ? 'Mettre à jour' : "Ajouter l'article"}</Button>
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
              Sauvegarder dans le catalogue ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous sauvegarder cet article dans votre catalogue de produits ? Il pourra être réutilisé pour d&apos;autres factures.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="save-product-type">
                Type <span className="text-destructive">*</span>
              </Label>
              <Select value={productType} onValueChange={(value) => setProductType(value as 'service' | 'product')}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="product">Produit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="save-product-currency">
                Devise <span className="text-destructive">*</span>
              </Label>
              <Select value={productCurrency} onValueChange={setProductCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Devise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="XOF">XOF (CFA)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border border-muted-foreground/20 bg-muted/30 p-3 space-y-1">
              <p className="text-sm font-medium">Résumé</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><span className="font-medium">Nom:</span> {description}</p>
                <p><span className="font-medium">Prix:</span> {unitPrice} {productCurrency}</p>
                <p><span className="font-medium">TVA:</span> {vatRate}%</p>
                <p><span className="font-medium">Type:</span> {productType === 'service' ? 'Service' : 'Produit'}</p>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleAddWithoutSaving}>
              Non, ajouter uniquement
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveProductAndAdd} disabled={isCreatingProduct}>
              {isCreatingProduct && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Oui, sauvegarder et ajouter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
