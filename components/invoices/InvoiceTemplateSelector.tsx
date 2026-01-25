"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  useGetInvoiceTemplatesQuery,
  useGetDefaultInvoiceTemplateQuery,
  type InvoiceTemplate,
} from "@/services/facturlyApi";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InvoiceTemplateSelectorProps {
  value?: string; // ID du template sélectionné
  onChange?: (templateId: string | undefined) => void;
  className?: string;
}

const BASE_TEMPLATES = [
  { value: "invoice", label: "Standard" },
  { value: "invoice-modern", label: "Moderne" },
  { value: "invoice-classic", label: "Classique" },
  { value: "invoice-minimal", label: "Minimaliste" },
  { value: "invoice-elegant", label: "Élégant" },
  { value: "invoice-professional", label: "Professionnel" },
  { value: "invoice-compact", label: "Compact" },
  { value: "invoice-colorful", label: "Coloré" },
];

export function InvoiceTemplateSelector({
  value,
  onChange,
  className,
}: InvoiceTemplateSelectorProps) {
  const t = useTranslations("invoices");
  const { data: templatesResponse, isLoading: isLoadingTemplates } =
    useGetInvoiceTemplatesQuery();
  const { data: defaultTemplate } = useGetDefaultInvoiceTemplateQuery();

  const templates = templatesResponse?.data || [];
  const activeTemplates = templates.filter((t: InvoiceTemplate) => t.isActive);

  const handleChange = (newValue: string) => {
    if (newValue === "none" || newValue === "") {
      onChange?.(undefined);
    } else {
      onChange?.(newValue);
    }
  };

  const isBaseTemplate = value && value.startsWith("base:");
  const baseTemplateValue = isBaseTemplate
    ? BASE_TEMPLATES.find((t) => t.value === value.replace("base:", ""))
    : null;
  const customTemplate = !isBaseTemplate && value
    ? activeTemplates.find((t: InvoiceTemplate) => t.id === value) ||
      (defaultTemplate && value === defaultTemplate.id ? defaultTemplate : null)
    : null;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="template-select">
        {t("template") || "Template de facture"}
      </Label>
      <Select
        value={value || (defaultTemplate?.id || "base:invoice")}
        onValueChange={handleChange}
        disabled={isLoadingTemplates}
      >
        <SelectTrigger id="template-select">
          <SelectValue placeholder="Sélectionner un template">
            {isLoadingTemplates ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : baseTemplateValue ? (
              baseTemplateValue.label
            ) : customTemplate ? (
              customTemplate.name || "Template personnalisé"
            ) : (
              "Template par défaut"
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {/* Templates personnalisés */}
          {activeTemplates.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Templates personnalisés
              </div>
              {activeTemplates.map((template: InvoiceTemplate) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center gap-2">
                    <span>{template.name}</span>
                    {template.isDefault && (
                      <span className="text-xs text-muted-foreground">
                        (Par défaut)
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
              <div className="my-1 border-t" />
            </>
          )}

          {/* Templates de base */}
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Templates de base
          </div>
          {BASE_TEMPLATES.map((template) => (
            <SelectItem key={template.value} value={`base:${template.value}`}>
              {template.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
