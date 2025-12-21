"use client";

import React, { useState, useRef, useEffect } from "react";
import { IoCloudUploadOutline, IoCloseOutline, IoCheckmarkCircleOutline, IoAlertCircleOutline, IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBulkImportClientsMutation } from "@/services/facturlyApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslations } from 'next-intl';

interface ImportClientsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface EditableCSVRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  city: string;
  country: string;
  taxId: string;
  notes: string;
}

interface ImportResult {
  total: number;
  successCount: number;
  failedCount: number;
  created: Array<{ line: number; name: string }>;
  failed: Array<{ line: number; error: string }>;
}

const ITEMS_PER_PAGE = 10;

export const ImportClientsModal = ({ open, onClose, onSuccess }: ImportClientsModalProps) => {
  const t = useTranslations('clients.import');
  const commonT = useTranslations('common');
  
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<EditableCSVRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bulkImportClients, { isLoading: isImporting }] = useBulkImportClientsMutation();

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
    const nameIndex = headers.findIndex((h) => ["nom", "name", "client", "client name"].includes(h));
    const emailIndex = headers.findIndex((h) => ["email", "e-mail", "courriel"].includes(h));
    const phoneIndex = headers.findIndex((h) => ["téléphone", "telephone", "phone", "tel"].includes(h));
    const address1Index = headers.findIndex((h) => ["adresse", "address", "adresse ligne 1", "address line 1"].includes(h));
    const address2Index = headers.findIndex((h) => ["adresse 2", "address 2", "complément", "complement"].includes(h));
    const postalCodeIndex = headers.findIndex((h) => ["code postal", "postal code", "cp", "zip"].includes(h));
    const cityIndex = headers.findIndex((h) => ["ville", "city"].includes(h));
    const countryIndex = headers.findIndex((h) => ["pays", "country"].includes(h));
    const taxIdIndex = headers.findIndex((h) => ["siret", "tva", "tax id", "numéro fiscal", "numero fiscal"].includes(h));
    const notesIndex = headers.findIndex((h) => ["notes", "note", "commentaire", "comment"].includes(h));

    const rows: EditableCSVRow[] = [];

    // Parser les lignes de données (ignorer la première ligne d'en-têtes)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = line.split(separator).map((v) => v.trim().replace(/^"|"$/g, ""));

      // Le nom est obligatoire
      const name = nameIndex >= 0 ? values[nameIndex] : values[0];
      if (!name || name.length < 2) continue;

      rows.push({
        id: i,
        name: name || "",
        email: emailIndex >= 0 ? (values[emailIndex] || "") : "",
        phone: phoneIndex >= 0 ? (values[phoneIndex] || "") : "",
        addressLine1: address1Index >= 0 ? (values[address1Index] || "") : "",
        addressLine2: address2Index >= 0 ? (values[address2Index] || "") : "",
        postalCode: postalCodeIndex >= 0 ? (values[postalCodeIndex] || "") : "",
        city: cityIndex >= 0 ? (values[cityIndex] || "") : "",
        country: countryIndex >= 0 ? (values[countryIndex] || "") : "",
        taxId: taxIdIndex >= 0 ? (values[taxIdIndex] || "") : "",
        notes: notesIndex >= 0 ? (values[notesIndex] || "") : "",
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
          toast.error(t('errors.emptyFile'), {
            description: t('errors.emptyFileDescription'),
          });
          setFile(null);
          return;
        }

        if (parsed.length > 1000) {
          toast.error(t('errors.limitExceeded'), {
            description: t('errors.limitExceededDescription'),
          });
          setFile(null);
          return;
        }

        setPreviewData(parsed);
        setShowPreview(true);
      } catch (error) {
        toast.error(t('errors.readError'), {
          description: t('errors.readErrorDescription'),
        });
        setFile(null);
      }
    } else {
      toast.error(t('errors.invalidFormat'), {
        description: t('errors.invalidFormatDescription'),
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
          toast.error(t('errors.emptyFile'), {
            description: t('errors.emptyFileDescription'),
          });
          setFile(null);
          return;
        }

        if (parsed.length > 1000) {
          toast.error(t('errors.limitExceeded'), {
            description: t('errors.limitExceededDescription'),
          });
          setFile(null);
          return;
        }

        setPreviewData(parsed);
        setShowPreview(true);
      } catch (error) {
        toast.error(t('errors.readError'), {
          description: t('errors.readErrorDescription'),
        });
        setFile(null);
      }
    } else {
      toast.error(t('errors.invalidFormat'), {
        description: t('errors.invalidFormatDrop'),
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

  const handleImport = async () => {
    if (previewData.length === 0) return;

    setIsProcessing(true);
    setImportResult(null);

    try {
      // Préparer les données pour l'API
      // Filtrer les clients sans email (requis) et mapper les données
      const clients = previewData
        .filter((row) => row.email.trim()) // Filtrer les lignes sans email
        .map((row) => ({
          name: row.name.trim(),
          email: row.email.trim(), // Email est requis
          phone: row.phone.trim() || undefined,
          addressLine1: row.addressLine1.trim() || undefined,
          addressLine2: row.addressLine2.trim() || undefined,
          postalCode: row.postalCode.trim() || undefined,
          city: row.city.trim() || undefined,
          country: row.country.trim() || undefined,
          taxId: row.taxId.trim() || undefined,
          notes: row.notes.trim() || undefined,
        }));

      // Appel à l'API bulk
      const response = await bulkImportClients({ clients }).unwrap();

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
        toast.success(t('success.importCompleted'), {
          description: t('success.importCompletedDescription', { 
            successCount: result.successCount, 
            failedCount: result.failedCount,
            errors: result.failedCount
          }),
        });
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(t('errors.importFailed'), {
          description: t('errors.importFailedDescription'),
        });
      }
    } catch (error) {
      let errorMessage = t('errors.importError');
      if (error && typeof error === "object" && "data" in error) {
        const errorData = error.data as { message?: string };
        errorMessage = errorData?.message ?? errorMessage;
      }
      toast.error(commonT('error'), {
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
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description')}
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
                {t('dropZone.title')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('dropZone.format')}
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
                      {t('fileInfo.clientsDetected', { count: previewData.length })} • {t('fileInfo.fileSize', { size: (file.size / 1024).toFixed(2) })}
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
                        <TableHead className="min-w-[150px]">{t('table.name')}</TableHead>
                        <TableHead className="min-w-[180px]">{t('table.email')}</TableHead>
                        <TableHead className="min-w-[120px]">{t('table.phone')}</TableHead>
                        <TableHead className="min-w-[150px]">{t('table.address')}</TableHead>
                        <TableHead className="min-w-[100px]">{t('table.postalCode')}</TableHead>
                        <TableHead className="min-w-[120px]">{t('table.city')}</TableHead>
                        <TableHead className="min-w-[100px]">{t('table.country')}</TableHead>
                        <TableHead className="min-w-[120px]">{t('table.taxId')}</TableHead>
                        <TableHead className="min-w-[150px]">{t('table.notes')}</TableHead>
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
                              placeholder={t('table.name')}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.email}
                              onChange={(e) => handleFieldChange(row.id, "email", e.target.value)}
                              className="h-8 text-sm"
                              type="email"
                              placeholder={t('table.email')}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.phone}
                              onChange={(e) => handleFieldChange(row.id, "phone", e.target.value)}
                              className="h-8 text-sm"
                              placeholder={t('table.phone')}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.addressLine1}
                              onChange={(e) => handleFieldChange(row.id, "addressLine1", e.target.value)}
                              className="h-8 text-sm"
                              placeholder={t('table.address')}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.postalCode}
                              onChange={(e) => handleFieldChange(row.id, "postalCode", e.target.value)}
                              className="h-8 text-sm"
                              placeholder={t('table.postalCode')}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.city}
                              onChange={(e) => handleFieldChange(row.id, "city", e.target.value)}
                              className="h-8 text-sm"
                              placeholder={t('table.city')}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.country}
                              onChange={(e) => handleFieldChange(row.id, "country", e.target.value)}
                              className="h-8 text-sm"
                              placeholder={t('table.country')}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.taxId}
                              onChange={(e) => handleFieldChange(row.id, "taxId", e.target.value)}
                              className="h-8 text-sm"
                              placeholder={t('table.taxId')}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.notes}
                              onChange={(e) => handleFieldChange(row.id, "notes", e.target.value)}
                              className="h-8 text-sm"
                              placeholder={t('table.notes')}
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
                      {t('pagination.pageInfo', { current: currentPage, total: totalPages, count: previewData.length })}
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
                        <span>{t('success.clientsImported', { count: importResult.successCount })}</span>
                      </div>
                    )}
                    {importResult.failedCount > 0 && (
                      <div className="flex items-center gap-2 text-destructive">
                        <IoAlertCircleOutline className="h-4 w-4" />
                        <span>{t('success.errors', { count: importResult.failedCount })}</span>
                      </div>
                    )}
                  </div>
                  {importResult.failed.length > 0 && (
                    <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                      {importResult.failed.map((error, index) => (
                        <p key={index} className="text-xs text-destructive">
                          {t('success.lineError', { line: error.line, error: error.error })}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-xs font-medium mb-2">{t('format.title')}</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• {t('format.columns')}</p>
              <p>• {t('format.nameRequired')}</p>
              <p>• {t('format.headersRequired')}</p>
              <p>• {t('format.separator')}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing || isImporting}>
            {importResult ? t('buttons.close') : t('buttons.cancel')}
          </Button>
          {showPreview && !importResult && (
            <Button onClick={handleImport} disabled={isProcessing || isImporting || previewData.length === 0}>
              {isProcessing || isImporting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {t('buttons.importing')}
                </div>
              ) : (
                t('buttons.import', { count: previewData.length })
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportClientsModal;
