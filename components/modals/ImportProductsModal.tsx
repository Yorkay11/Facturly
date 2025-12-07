"use client";

import React, { useState, useRef, useEffect } from "react";
import { IoCloudUploadOutline, IoCloseOutline, IoCheckmarkCircleOutline, IoAlertCircleOutline, IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBulkImportProductsMutation } from "@/services/facturlyApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImportProductsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface EditableCSVRow {
  id: number;
  name: string;
  description: string;
  type: "product" | "service";
  price: string;
  currency: string;
  taxRate: string;
  unitOfMeasure: string;
  sku: string;
}

interface ImportResult {
  total: number;
  successCount: number;
  failedCount: number;
  created: Array<{ line: number; name: string }>;
  failed: Array<{ line: number; error: string }>;
}

const ITEMS_PER_PAGE = 10;

export const ImportProductsModal = ({ open, onClose, onSuccess }: ImportProductsModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<EditableCSVRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bulkImportProducts, { isLoading: isImporting }] = useBulkImportProductsMutation();

  const parseCSV = (csvText: string): EditableCSVRow[] => {
    const lines = csvText.split("\n").filter((line) => line.trim());
    if (lines.length === 0) return [];

    // Détecter le séparateur (virgule ou point-virgule)
    const firstLine = lines[0];
    const separator = firstLine.includes(";") ? ";" : ",";

    // Parser la première ligne pour obtenir les en-têtes
    const headers = firstLine
      .split(separator)
      .map((h) => h.trim().toLowerCase().replace(/"/g, ""));

    // Mapper les colonnes possibles
    const nameIndex = headers.findIndex((h) => ["nom", "name", "produit", "product", "service", "prestation"].includes(h));
    const descriptionIndex = headers.findIndex((h) => ["description", "desc", "détail", "detail"].includes(h));
    const typeIndex = headers.findIndex((h) => ["type", "catégorie", "categorie"].includes(h));
    const priceIndex = headers.findIndex((h) => ["prix", "price", "tarif", "tarif ht", "price ht"].includes(h));
    const currencyIndex = headers.findIndex((h) => ["devise", "currency", "monnaie"].includes(h));
    const taxRateIndex = headers.findIndex((h) => ["tva", "tax", "tax rate", "taux tva", "taux"].includes(h));
    const unitIndex = headers.findIndex((h) => ["unité", "unit", "unite"].includes(h));
    const skuIndex = headers.findIndex((h) => ["sku", "référence", "reference", "ref", "code"].includes(h));

    const rows: EditableCSVRow[] = [];

    // Parser les lignes de données (ignorer la première ligne d'en-têtes)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = line.split(separator).map((v) => v.trim().replace(/^"|"$/g, ""));

      // Le nom est obligatoire
      const name = nameIndex >= 0 ? values[nameIndex] : values[0];
      if (!name || name.length < 2) continue;

      // Le prix est obligatoire
      const price = priceIndex >= 0 ? values[priceIndex] : values[1];
      if (!price || isNaN(parseFloat(price))) continue;

      // Type par défaut : service
      let type: "product" | "service" = "service";
      if (typeIndex >= 0 && values[typeIndex]) {
        const typeValue = values[typeIndex].toLowerCase();
        if (typeValue.includes("produit") || typeValue === "product") {
          type = "product";
        }
      }

      rows.push({
        id: i,
        name: name || "",
        description: descriptionIndex >= 0 ? (values[descriptionIndex] || "") : "",
        type,
        price: price || "",
        currency: currencyIndex >= 0 ? (values[currencyIndex] || "EUR") : "EUR",
        taxRate: taxRateIndex >= 0 ? (values[taxRateIndex] || "20") : "20",
        unitOfMeasure: unitIndex >= 0 ? (values[unitIndex] || "") : "",
        sku: skuIndex >= 0 ? (values[skuIndex] || "") : "",
      });
    }

    return rows;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv"))) {
      setFile(selectedFile);
      setImportResult(null);
      setShowPreview(false);
      setCurrentPage(1);

      try {
        const text = await selectedFile.text();
        const parsed = parseCSV(text);

        if (parsed.length === 0) {
          toast.error("Fichier vide", {
            description: "Le fichier CSV ne contient aucune donnée valide.",
          });
          setFile(null);
          return;
        }

        if (parsed.length > 1000) {
          toast.error("Limite dépassée", {
            description: "Le fichier contient plus de 1000 produits. Veuillez diviser votre fichier en plusieurs parties.",
          });
          setFile(null);
          return;
        }

        setPreviewData(parsed);
        setShowPreview(true);
      } catch (error) {
        toast.error("Erreur", {
          description: "Une erreur est survenue lors de la lecture du fichier.",
        });
        setFile(null);
      }
    } else {
      toast.error("Format invalide", {
        description: "Veuillez sélectionner un fichier CSV.",
      });
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv"))) {
      setFile(droppedFile);
      setImportResult(null);
      setShowPreview(false);
      setCurrentPage(1);

      try {
        const text = await droppedFile.text();
        const parsed = parseCSV(text);

        if (parsed.length === 0) {
          toast.error("Fichier vide", {
            description: "Le fichier CSV ne contient aucune donnée valide.",
          });
          setFile(null);
          return;
        }

        if (parsed.length > 1000) {
          toast.error("Limite dépassée", {
            description: "Le fichier contient plus de 1000 produits. Veuillez diviser votre fichier en plusieurs parties.",
          });
          setFile(null);
          return;
        }

        setPreviewData(parsed);
        setShowPreview(true);
      } catch (error) {
        toast.error("Erreur", {
          description: "Une erreur est survenue lors de la lecture du fichier.",
        });
        setFile(null);
      }
    } else {
      toast.error("Format invalide", {
        description: "Veuillez déposer un fichier CSV.",
      });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFieldChange = (id: number, field: keyof EditableCSVRow, value: string) => {
    setPreviewData((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleTypeChange = (id: number, value: "product" | "service") => {
    setPreviewData((prev) =>
      prev.map((row) => (row.id === id ? { ...row, type: value } : row))
    );
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;

    setIsProcessing(true);
    setImportResult(null);

    try {
      // Préparer les données pour l'API
      const products = previewData.map((row) => ({
        name: row.name.trim(),
        description: row.description.trim() || undefined,
        type: row.type,
        price: row.price.trim(),
        currency: row.currency.trim() || "EUR",
        taxRate: row.taxRate.trim() || "20",
        unitOfMeasure: row.unitOfMeasure.trim() || undefined,
        sku: row.sku.trim() || undefined,
      }));

      // Appel à l'API bulk
      const response = await bulkImportProducts({ products }).unwrap();

      // Transformer la réponse au format attendu par l'UI
      const result: ImportResult = {
        total: response.total,
        successCount: response.successCount,
        failedCount: response.failedCount,
        created: response.created.map((item) => ({
          line: item.line,
          name: item.name,
        })),
        failed: response.failed.map((item) => ({
          line: item.line,
          error: item.error,
        })),
      };

      setImportResult(result);
      setShowPreview(false);

      if (result.successCount > 0) {
        toast.success("Import terminé", {
          description: `${result.successCount} produit(s) importé(s) avec succès${result.failedCount > 0 ? `, ${result.failedCount} erreur(s)` : ""}.`,
        });
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error("Import échoué", {
          description: "Aucun produit n'a pu être importé.",
        });
      }
    } catch (error) {
      let errorMessage = "Une erreur est survenue lors de l'import.";
      if (error && typeof error === "object" && "data" in error) {
        const errorData = error.data as { message?: string };
        errorMessage = errorData?.message ?? errorMessage;
      }
      toast.error("Erreur", {
        description: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing && !isImporting) {
      setFile(null);
      setPreviewData([]);
      setImportResult(null);
      setShowPreview(false);
      setCurrentPage(1);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onClose();
    }
  };

  // Calculer la pagination
  const totalPages = Math.ceil(previewData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageData = previewData.slice(startIndex, endIndex);

  // Réinitialiser à la page 1 quand le modal s'ouvre
  useEffect(() => {
    if (!open) {
      setFile(null);
      setPreviewData([]);
      setImportResult(null);
      setShowPreview(false);
      setCurrentPage(1);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-7xl max-h-[97vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importer des produits depuis un CSV</DialogTitle>
          <DialogDescription>
            Téléchargez un fichier CSV avec les informations de vos produits. Le nom et le prix sont obligatoires, les autres champs sont optionnels.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!file ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                "hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <IoCloudUploadOutline className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground mb-2">
                Cliquez pour sélectionner ou glissez-déposez un fichier CSV
              </p>
              <p className="text-xs text-muted-foreground">
                Format attendu : Nom, Prix, Type, Description, TVA, Devise, etc.
              </p>
            </div>
          ) : showPreview ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5">
                <div className="flex items-center gap-3">
                  <IoCheckmarkCircleOutline className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {previewData.length} produit(s) détecté(s) • {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setFile(null);
                    setPreviewData([]);
                    setShowPreview(false);
                    setCurrentPage(1);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  disabled={isProcessing || isImporting}
                >
                  <IoCloseOutline className="h-4 w-4" />
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-[400px]">
                  <Table>
                    <TableHeader className="bg-primary/5 sticky top-0">
                      <TableRow>
                        <TableHead className="min-w-[150px]">Nom *</TableHead>
                        <TableHead className="min-w-[200px]">Description</TableHead>
                        <TableHead className="min-w-[100px]">Type</TableHead>
                        <TableHead className="min-w-[100px]">Prix *</TableHead>
                        <TableHead className="min-w-[100px]">Devise</TableHead>
                        <TableHead className="min-w-[80px]">TVA</TableHead>
                        <TableHead className="min-w-[100px]">Unité</TableHead>
                        <TableHead className="min-w-[120px]">Référence</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentPageData.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            <Input
                              value={row.name}
                              onChange={(e) => handleFieldChange(row.id, "name", e.target.value)}
                              className="h-8 text-sm"
                              placeholder="Nom *"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.description}
                              onChange={(e) => handleFieldChange(row.id, "description", e.target.value)}
                              className="h-8 text-sm"
                              placeholder="Description"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={row.type}
                              onValueChange={(value: "product" | "service") => handleTypeChange(row.id, value)}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="service">Service</SelectItem>
                                <SelectItem value="product">Produit</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.price}
                              onChange={(e) => handleFieldChange(row.id, "price", e.target.value)}
                              className="h-8 text-sm"
                              type="number"
                              step="0.01"
                              placeholder="Prix *"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={row.currency}
                              onValueChange={(value) => handleFieldChange(row.id, "currency", value)}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="EUR">EUR</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="XOF">XOF</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={row.taxRate}
                              onValueChange={(value) => handleFieldChange(row.id, "taxRate", value)}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">0%</SelectItem>
                                <SelectItem value="5.5">5.5%</SelectItem>
                                <SelectItem value="10">10%</SelectItem>
                                <SelectItem value="20">20%</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.unitOfMeasure}
                              onChange={(e) => handleFieldChange(row.id, "unitOfMeasure", e.target.value)}
                              className="h-8 text-sm"
                              placeholder="Unité"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.sku}
                              onChange={(e) => handleFieldChange(row.id, "sku", e.target.value)}
                              className="h-8 text-sm"
                              placeholder="Référence"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t px-4 py-3">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} sur {totalPages} • {previewData.length} produit(s) au total
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <IoChevronBackOutline className="h-4 w-4" />
                      </Button>
                      <div className="text-sm font-medium">
                        {currentPage} / {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <IoChevronForwardOutline className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5">
                <div className="flex items-center gap-3">
                  <IoCheckmarkCircleOutline className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setFile(null);
                    setPreviewData([]);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  disabled={isProcessing || isImporting}
                >
                  <IoCloseOutline className="h-4 w-4" />
                </Button>
              </div>

              {importResult && (
                <div className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {importResult.successCount > 0 && (
                      <div className="flex items-center gap-2 text-primary">
                        <IoCheckmarkCircleOutline className="h-4 w-4" />
                        <span>{importResult.successCount} produit(s) importé(s)</span>
                      </div>
                    )}
                    {importResult.failedCount > 0 && (
                      <div className="flex items-center gap-2 text-destructive">
                        <IoAlertCircleOutline className="h-4 w-4" />
                        <span>{importResult.failedCount} erreur(s)</span>
                      </div>
                    )}
                  </div>
                  {importResult.failed.length > 0 && (
                    <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                      {importResult.failed.map((error, index) => (
                        <p key={index} className="text-xs text-destructive">
                          Ligne {error.line}: {error.error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-xs font-medium mb-2">Format CSV attendu :</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Colonnes possibles : Nom, Prix, Type, Description, TVA, Devise, Unité, Référence (SKU)</p>
              <p>• Le nom et le prix sont obligatoires, les autres champs sont optionnels</p>
              <p>• La première ligne doit contenir les en-têtes</p>
              <p>• Séparateur : virgule (,) ou point-virgule (;)</p>
              <p>• Type : "service" ou "product" (par défaut : service)</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing || isImporting}>
            {importResult ? "Fermer" : "Annuler"}
          </Button>
          {showPreview && !importResult && (
            <Button onClick={handleImport} disabled={isProcessing || isImporting || previewData.length === 0}>
              {isProcessing || isImporting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Import en cours...
                </div>
              ) : (
                `Valider et importer (${previewData.length})`
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportProductsModal;
