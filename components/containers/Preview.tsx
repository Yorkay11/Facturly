"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { useItemsStore } from "@/hooks/useItemStore";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";
import { useInvoiceMetadata } from "@/hooks/useInvoiceMetadata";
import { format } from "date-fns";
import { invoiceTemplates } from "@/types/invoiceTemplate";
import {
  TemplateInvoice,
  TemplateProfessional,
  TemplateModern,
  TemplateMinimal,
  TemplateElegant,
  TemplateCompact,
  TemplateColorful,
  TemplateClassicSerif,
  type InvoiceTemplateProps,
} from "@/templates/invoices";
import { useGetCompanyQuery, useGetClientByIdQuery, useGetSubscriptionQuery } from "@/services/facturlyApi";
import { getBackendTemplateName } from "@/types/invoiceTemplate";
import Skeleton from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Maximize2, FileDown } from "lucide-react";

const templateRegistry: Record<string, React.ComponentType<InvoiceTemplateProps>> = {
  invoice: TemplateInvoice,
  professional: TemplateProfessional,
  modern: TemplateModern,
  minimal: TemplateMinimal,
  elegant: TemplateElegant,
  compact: TemplateCompact,
  colorful: TemplateColorful,
  classicSerif: TemplateClassicSerif,
};

const TemplateSelector = ({
  activeTemplate,
  onChange,
}: {
  activeTemplate: string;
  onChange: (templateId: string) => void;
}) => {
  return (
    <Select value={activeTemplate} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-[200px] border-primary/40">
        <SelectValue placeholder="Sélectionner un template" />
      </SelectTrigger>
      <SelectContent>
        {invoiceTemplates.map((template) => (
          <SelectItem key={template.id} value={template.id}>
            {template.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

interface PreviewProps {
  invoiceId?: string;
}

const Preview = ({ invoiceId }: PreviewProps = {}) => {
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { items } = useItemsStore();
  const metadataStore = useInvoiceMetadata();
  const [activeTemplate, setActiveTemplate] = useState(invoiceTemplates[0].id);
  const [isHydrated, setIsHydrated] = useState(false);

  // Récupérer les données de l'entreprise, du client et de la subscription
  const { data: company } = useGetCompanyQuery();
  const { data: client } = useGetClientByIdQuery(metadataStore.clientId || "", {
    skip: !metadataStore.clientId,
  });
  const { data: subscription } = useGetSubscriptionQuery();
  
  // Vérifier si l'utilisateur peut générer des PDF (Pro ou Enterprise uniquement)
  const canGeneratePDF = subscription?.plan === "pro" || subscription?.plan === "enterprise";
  const isFreePlan = subscription?.plan === "free";

  const currentTemplate = invoiceTemplates.find((tpl) => tpl.id === activeTemplate) ?? invoiceTemplates[0];
  const metadata = {
    receiver: metadataStore.receiver,
    subject: metadataStore.subject,
    issueDate: metadataStore.issueDate,
    dueDate: metadataStore.dueDate,
    notes: metadataStore.notes,
  };
  const TemplateComponent = templateRegistry[currentTemplate.id] ?? TemplateInvoice;

  useEffect(() => {
    const timer = setTimeout(() => setIsHydrated(true), 400);
    return () => clearTimeout(timer);
  }, [items, activeTemplate])
  
  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    [items]
  );
  const vatAmount = useMemo(
    () => items.reduce((total, item) => total + (item.unitPrice * item.quantity * item.vatRate) / 100, 0),
    [items]
  );
  const totalAmount = subtotal + vatAmount;
  const currencyCode = metadataStore.currency ? metadataStore.currency.toUpperCase() : "EUR";
  const amountFormatter = useMemo(
    () =>
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: 2,
      }),
    [currencyCode]
  );

  const formatDate = (date?: Date) => (date ? format(date, "dd/MM/yyyy") : "--/--/----");

  const handleGeneratePDF = async () => {
    if (!invoiceId) {
      toast.error("Erreur", {
        description: "La facture doit être sauvegardée avant de générer le PDF.",
      });
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://facturlybackend-production.up.railway.app";
      
      // Obtenir le token d'authentification
      const cookies = document.cookie.split("; ");
      const tokenCookie = cookies.find((cookie) => cookie.startsWith("facturly_access_token="));
      const token = tokenCookie ? tokenCookie.split("=")[1] : null;

      if (!token) {
        toast.error("Erreur", {
          description: "Vous devez être connecté pour générer le PDF.",
        });
        setIsGeneratingPDF(false);
        return;
      }

      // Mapper le template frontend au nom backend
      const backendTemplateName = getBackendTemplateName(activeTemplate);
      
      // Construire l'URL avec le paramètre template optionnel
      const pdfUrl = `${BASE_URL}/invoices/${invoiceId}/pdf${backendTemplateName ? `?template=${backendTemplateName}` : ""}`;

      // Créer un lien temporaire pour télécharger le PDF
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `facture-${invoiceId}.pdf`;
      
      // Ajouter le token dans les headers via fetch puis créer un blob
      const response = await fetch(pdfUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("La génération de PDF est réservée aux plans Pro ou Entreprise.");
        }
        throw new Error("Erreur lors de la génération du PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      link.click();
      
      // Nettoyer
      window.URL.revokeObjectURL(url);
      
      toast.success("PDF généré", {
        description: "Le PDF a été téléchargé avec succès.",
      });
    } catch (error: any) {
      console.error("Erreur lors de la génération du PDF:", error);
      toast.error("Erreur", {
        description: error?.message || "Impossible de générer le PDF. Veuillez réessayer.",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Card className="w-full flex-1 space-y-6 border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-slate-900">Aperçu</p>
          <p className="text-xs text-slate-500">Synchronisé avec les informations saisies.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <TemplateSelector activeTemplate={activeTemplate} onChange={setActiveTemplate} />
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 sm:w-auto border-primary/40 text-primary hover:bg-primary/10"
            onClick={() => setIsFullscreenOpen(true)}
          >
            <Maximize2 className="h-4 w-4" />
            Aperçu grand écran
          </Button>
        </div>
      </div>

      {isHydrated ? (
        <div data-invoice-preview>
          <TemplateComponent
            metadata={metadata}
            company={company}
            client={client}
            items={items}
            subtotal={subtotal}
            vatAmount={vatAmount}
            totalAmount={totalAmount}
            formatAmount={(value) => amountFormatter.format(value)}
            formatDate={formatDate}
            template={currentTemplate}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-[280px] rounded-xl" />
        </div>
      )}

      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        {isFreePlan && (
          <Alert className="mb-2 border-amber-200 bg-amber-50">
            <Lock className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Génération PDF réservée</AlertTitle>
            <AlertDescription className="text-amber-700">
              La génération de PDF est disponible uniquement avec les plans Pro ou Entreprise.
              <Link 
                href="/settings?tab=subscription" 
                className="ml-1 inline-flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-900 underline"
              >
                Passer au plan Pro
                <ArrowRight className="h-3 w-3" />
              </Link>
            </AlertDescription>
          </Alert>
        )}
        <Button 
          variant="default" 
          size="sm" 
          className="w-full sm:w-auto gap-2"
          onClick={handleGeneratePDF}
          disabled={!isHydrated || !company || !client || !invoiceId || isGeneratingPDF || !canGeneratePDF}
        >
          <FileDown className={`h-4 w-4 ${isGeneratingPDF ? "animate-spin" : ""}`} />
          {isGeneratingPDF ? "Génération..." : "Générer PDF"}
        </Button>
      </div>

      <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] p-6 overflow-y-auto translate-x-[-50%] translate-y-[-50%] left-[50%] top-[50%]">
          <DialogHeader>
            <DialogTitle>Aperçu de la facture</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="flex flex-col gap-4 mb-6">
              <TemplateSelector activeTemplate={activeTemplate} onChange={setActiveTemplate} />
            </div>
            {isHydrated ? (
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <TemplateComponent
                  metadata={metadata}
                  company={company}
                  client={client}
                  items={items}
                  subtotal={subtotal}
                  vatAmount={vatAmount}
                  totalAmount={totalAmount}
                  formatAmount={(value) => amountFormatter.format(value)}
                  formatDate={formatDate}
                  template={currentTemplate}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-[280px] rounded-xl" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default Preview;
