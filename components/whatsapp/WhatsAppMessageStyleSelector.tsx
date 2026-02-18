"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FaWhatsapp, FaBolt, FaStar, FaHeart, FaFileAlt, FaComments } from "react-icons/fa";
import { cn } from "@/lib/utils";
import type { WhatsAppMessageStyle } from "@/services/api/types/invoice.types";
import { generateWhatsAppMessage } from "@/utils/whatsapp-message";
import { format } from "date-fns";
import { WhatsAppMessagePreview } from "./WhatsAppMessagePreview";

export interface WhatsAppMessageStyleSelectorProps {
  value?: WhatsAppMessageStyle;
  onChange: (value: WhatsAppMessageStyle) => void;
  className?: string;
  // Props pour l'aperçu du message
  invoiceNumber?: string;
  amount?: string;
  currency?: string;
  dueDate?: Date | string;
  companyName?: string;
}

const MESSAGE_STYLES: Array<{
  value: WhatsAppMessageStyle;
  labelKey: string;
  descriptionKey: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badgeVariant: "default" | "secondary" | "outline";
}> = [
  {
    value: "professional_warm",
    labelKey: "styles.professionalWarm.label",
    descriptionKey: "styles.professionalWarm.description",
    icon: FaComments,
    color: "text-blue-600",
    badgeVariant: "default",
  },
  {
    value: "direct",
    labelKey: "styles.direct.label",
    descriptionKey: "styles.direct.description",
    icon: FaBolt,
    color: "text-orange-600",
    badgeVariant: "outline",
  },
  {
    value: "premium",
    labelKey: "styles.premium.label",
    descriptionKey: "styles.premium.description",
    icon: FaStar,
    color: "text-purple-600",
    badgeVariant: "default",
  },
  {
    value: "humane",
    labelKey: "styles.humane.label",
    descriptionKey: "styles.humane.description",
    icon: FaHeart,
    color: "text-pink-600",
    badgeVariant: "secondary",
  },
  {
    value: "compact",
    labelKey: "styles.compact.label",
    descriptionKey: "styles.compact.description",
    icon: FaFileAlt,
    color: "text-slate-600",
    badgeVariant: "outline",
  },
];

export function WhatsAppMessageStyleSelector({
  value = "professional_warm",
  onChange,
  className,
  invoiceNumber,
  amount,
  currency,
  dueDate,
  companyName,
}: WhatsAppMessageStyleSelectorProps) {
  const t = useTranslations("whatsapp.messageStyles");
  const selectedStyle = MESSAGE_STYLES.find((style) => style.value === value);
  const SelectedIcon = selectedStyle?.icon || FaComments;

  // Toujours générer un aperçu (valeurs réelles ou exemples) pour que l'utilisateur voie le message que le client recevra
  const previewMessage = generateWhatsAppMessage({
    invoiceNumber: invoiceNumber || "FAC-001",
    amount: amount || "0,00",
    currency: currency || "XOF",
    dueDate: dueDate
      ? typeof dueDate === "string"
        ? dueDate
        : format(new Date(dueDate), "dd/MM/yyyy")
      : undefined,
    companyName,
    style: value,
  });

  return (
    <div className={cn("space-y-3", className)}>
      <Label htmlFor="whatsapp-style" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
        <FaWhatsapp className="h-3.5 w-3.5 text-green-600" />
        {t("label")}
      </Label>
      <Select
        value={value}
        onValueChange={(val) => onChange(val as WhatsAppMessageStyle)}
      >
        <SelectTrigger 
          id="whatsapp-style" 
          className="h-9 border-slate-200 hover:border-primary/50 focus:ring-1 focus:ring-primary/20 bg-white"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedStyle && (
              <>
                <SelectedIcon className={cn("h-4 w-4 shrink-0", selectedStyle.color)} />
                <SelectValue className="flex-1">
                  <span className="font-medium text-xs">{t(selectedStyle.labelKey)}</span>
                </SelectValue>
              </>
            )}
            {!selectedStyle && <SelectValue />}
          </div>
        </SelectTrigger>
        <SelectContent className="min-w-[280px]">
          {MESSAGE_STYLES.map((style) => {
            const Icon = style.icon;
            const isSelected = style.value === value;
            return (
              <SelectItem 
                key={style.value} 
                value={style.value}
                className="cursor-pointer py-2.5"
              >
                <div className="flex items-start gap-3 w-full">
                  <div className={cn(
                    "mt-0.5 p-1.5 rounded-md bg-slate-50 border border-slate-200",
                    isSelected && "bg-primary/5 border-primary/20"
                  )}>
                    <Icon className={cn("h-4 w-4", style.color)} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900">
                        {t(style.labelKey)}
                      </span>
                      {isSelected && (
                        <Badge variant={style.badgeVariant} className="h-4 px-1.5 text-[10px]">
                          {t("selected") || "Sélectionné"}
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 leading-relaxed block">
                      {t(style.descriptionKey)}
                    </span>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {selectedStyle && (
        <p className="text-[10px] text-slate-500 leading-relaxed">
          {t("helperText")}
        </p>
      )}
      
      {/* Aperçu du message que le client recevra par WhatsApp — largeur fixe */}
      <div className="pt-4 min-w-0">
        <Label className="text-xs font-semibold text-slate-600 mb-3 block flex items-center gap-1.5">
          <FaWhatsapp className="h-3.5 w-3.5 text-[#075e54]" />
          {t("previewLabel")}
        </Label>
        <div
          className="rounded-2xl bg-gradient-to-b from-slate-100/90 to-slate-50/80 dark:from-slate-800/50 dark:to-slate-900/60 p-8 flex justify-center items-start border border-slate-200/70 dark:border-slate-700/50 shadow-sm"
          style={{ minWidth: 320 }}
        >
          <WhatsAppMessagePreview
            message={previewMessage}
            companyName={companyName || undefined}
          />
        </div>
      </div>
    </div>
  );
}
