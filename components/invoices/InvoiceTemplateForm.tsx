"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  type InvoiceTemplate,
  type CreateInvoiceTemplateDto,
} from "@/services/facturlyApi";

const templateFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  baseTemplate: z.string().default("invoice"),
  isDefault: z.boolean().default(false),
  logoUrl: z.string().url().optional().or(z.literal("")),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur hex invalide"),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Couleur hex invalide"),
  backgroundColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Couleur hex invalide"),
  headerText: z.string().optional(),
  footerText: z.string().optional(),
  showLogo: z.boolean().default(true),
  showCompanyDetails: z.boolean().default(true),
  showPaymentTerms: z.boolean().default(true),
  customHtml: z.string().optional(),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

interface InvoiceTemplateFormProps {
  template?: InvoiceTemplate;
  onSubmit: (data: CreateInvoiceTemplateDto) => void | Promise<void>;
  onCancel: () => void;
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

export function InvoiceTemplateForm({
  template,
  onSubmit,
  onCancel,
}: InvoiceTemplateFormProps) {
  const t = useTranslations("invoices.templates");

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: template
      ? {
          name: template.name,
          baseTemplate: template.baseTemplate,
          isDefault: template.isDefault,
          logoUrl: template.logoUrl || "",
          accentColor: template.accentColor,
          textColor: template.textColor,
          backgroundColor: template.backgroundColor,
          headerText: template.headerText || "",
          footerText: template.footerText || "",
          showLogo: template.showLogo,
          showCompanyDetails: template.showCompanyDetails,
          showPaymentTerms: template.showPaymentTerms,
          customHtml: template.customHtml || "",
        }
      : {
          name: "",
          baseTemplate: "invoice",
          isDefault: false,
          logoUrl: "",
          accentColor: "#3b82f6",
          textColor: "#1F1B2E",
          backgroundColor: "#ffffff",
          headerText: "",
          footerText: "",
          showLogo: true,
          showCompanyDetails: true,
          showPaymentTerms: true,
          customHtml: "",
        },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    const submitData: CreateInvoiceTemplateDto = {
      ...data,
      logoUrl: data.logoUrl || undefined,
      headerText: data.headerText || undefined,
      footerText: data.footerText || undefined,
      customHtml: data.customHtml || undefined,
    };
    await onSubmit(submitData);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">
            {t("name") || "Nom du template"} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            {...form.register("name")}
            placeholder="Mon Template Personnalisé"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="baseTemplate">
            {t("baseTemplate") || "Template de base"}
          </Label>
          <Select
            value={form.watch("baseTemplate")}
            onValueChange={(value) => form.setValue("baseTemplate", value)}
          >
            <SelectTrigger id="baseTemplate">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BASE_TEMPLATES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isDefault"
            checked={form.watch("isDefault")}
            onCheckedChange={(checked) => form.setValue("isDefault", checked)}
          />
          <Label htmlFor="isDefault">
            {t("setAsDefault") || "Définir comme template par défaut"}
          </Label>
        </div>
      </div>

      {/* Personnalisation Logo */}
      <div className="space-y-4">
        <h3 className="font-semibold">
          {t("logo") || "Logo"}
        </h3>
        <div>
          <Label htmlFor="logoUrl">{t("logoUrl") || "URL du logo"}</Label>
          <Input
            id="logoUrl"
            type="url"
            {...form.register("logoUrl")}
            placeholder="https://example.com/logo.png"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="showLogo"
            checked={form.watch("showLogo")}
            onCheckedChange={(checked) => form.setValue("showLogo", checked)}
          />
          <Label htmlFor="showLogo">
            {t("showLogo") || "Afficher le logo"}
          </Label>
        </div>
      </div>

      {/* Personnalisation Couleurs */}
      <div className="space-y-4">
        <h3 className="font-semibold">
          {t("colors") || "Couleurs"}
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="accentColor">
              {t("accentColor") || "Couleur d'accent"}
            </Label>
            <div className="flex gap-2">
              <Input
                id="accentColor"
                type="color"
                {...form.register("accentColor")}
                className="h-10 w-20 p-1"
              />
              <Input
                {...form.register("accentColor")}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="textColor">
              {t("textColor") || "Couleur du texte"}
            </Label>
            <div className="flex gap-2">
              <Input
                id="textColor"
                type="color"
                {...form.register("textColor")}
                className="h-10 w-20 p-1"
              />
              <Input
                {...form.register("textColor")}
                placeholder="#1F1B2E"
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="backgroundColor">
              {t("backgroundColor") || "Couleur de fond"}
            </Label>
            <div className="flex gap-2">
              <Input
                id="backgroundColor"
                type="color"
                {...form.register("backgroundColor")}
                className="h-10 w-20 p-1"
              />
              <Input
                {...form.register("backgroundColor")}
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Personnalisation Mise en Page */}
      <div className="space-y-4">
        <h3 className="font-semibold">
          {t("layout") || "Mise en page"}
        </h3>
        <div>
          <Label htmlFor="headerText">
            {t("headerText") || "Texte en-tête"}
          </Label>
          <Textarea
            id="headerText"
            {...form.register("headerText")}
            placeholder="Merci pour votre confiance"
            rows={2}
          />
        </div>
        <div>
          <Label htmlFor="footerText">
            {t("footerText") || "Texte pied de page"}
          </Label>
          <Textarea
            id="footerText"
            {...form.register("footerText")}
            placeholder="Paiement par mobile money accepté"
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="showCompanyDetails"
              checked={form.watch("showCompanyDetails")}
              onCheckedChange={(checked) =>
                form.setValue("showCompanyDetails", checked)
              }
            />
            <Label htmlFor="showCompanyDetails">
              {t("showCompanyDetails") || "Afficher les détails de l'entreprise"}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="showPaymentTerms"
              checked={form.watch("showPaymentTerms")}
              onCheckedChange={(checked) =>
                form.setValue("showPaymentTerms", checked)
              }
            />
            <Label htmlFor="showPaymentTerms">
              {t("showPaymentTerms") || "Afficher les conditions de paiement"}
            </Label>
          </div>
        </div>
      </div>

      {/* HTML Personnalisé (optionnel) */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="customHtml">
            {t("customHtml") || "HTML personnalisé (optionnel)"}
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            {t("customHtmlDescription") ||
              "HTML Handlebars personnalisé. Si défini, remplace le template de base."}
          </p>
          <Textarea
            id="customHtml"
            {...form.register("customHtml")}
            placeholder="<html>...</html>"
            rows={10}
            className="font-mono text-xs"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("cancel") || "Annuler"}
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? t("saving") || "Enregistrement..."
            : template
              ? t("update") || "Mettre à jour"
              : t("create") || "Créer"}
        </Button>
      </div>
    </form>
  );
}
