"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateWorkspaceMutation, useCreateWorkspaceMutation, useGetWorkspaceQuery, Workspace } from "@/services/facturlyApi";
import { toast } from "sonner";
import { Building2, User, Sparkles, CheckCircle2, ArrowRight, ArrowLeft, Globe, Coins, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Drapeaux des pays (images du projet)
const COUNTRY_FLAGS: Record<string, string> = {
  SN: "/images/countries/flag-for-flag-senegal-svgrepo-com.svg",
  CI: "/images/countries/flag-for-flag-cote-divoire-svgrepo-com.svg",
  ML: "/images/countries/flag-for-flag-mali-svgrepo-com.svg",
  BF: "/images/countries/flag-for-flag-burkina-faso-svgrepo-com.svg",
  BJ: "/images/countries/flag-for-flag-benin-svgrepo-com.svg",
  TG: "/images/countries/flag-for-flag-togo-svgrepo-com.svg",
  NE: "/images/countries/flag-for-flag-niger-svgrepo-com.svg",
  GN: "/images/countries/flag-for-flag-guinea-svgrepo-com.svg",
  GH: "/images/countries/flag-for-flag-ghana-svgrepo-com.svg",
  NG: "/images/countries/flag-for-flag-nigeria-svgrepo-com.svg",
  CM: "/images/countries/flag-for-flag-cameroon-svgrepo-com.svg",
  GA: "/images/countries/flag-for-flag-gabon-svgrepo-com.svg",
  TD: "/images/countries/flag-for-flag-tchad-svgrepo-com.svg",
  CF: "/images/countries/flag-for-flag-central-african-republic-svgrepo-com.svg",
  CG: "/images/countries/flag-for-flag-congo-brazzaville-svgrepo-com.svg",
};

const ONBOARDING_COUNTRIES: { value: string; label: string }[] = [
  { value: "none", label: "Non spécifié" },
  { value: "SN", label: "Sénégal" },
  { value: "CI", label: "Côte d'Ivoire" },
  { value: "ML", label: "Mali" },
  { value: "BF", label: "Burkina Faso" },
  { value: "BJ", label: "Bénin" },
  { value: "TG", label: "Togo" },
  { value: "NE", label: "Niger" },
  { value: "GN", label: "Guinée" },
  { value: "GH", label: "Ghana" },
  { value: "NG", label: "Nigeria" },
  { value: "CM", label: "Cameroun" },
  { value: "GA", label: "Gabon" },
  { value: "TD", label: "Tchad" },
  { value: "CF", label: "République centrafricaine" },
  { value: "CG", label: "Congo" },
  { value: "GQ", label: "Guinée équatoriale" },
];

// Libellé et placeholder du numéro d'identification selon le pays
const TAX_ID_BY_COUNTRY: Record<string, { label: string; placeholder: string }> = {
  SN: { label: "NINEA", placeholder: "Ex: 12345678901" },
  CI: { label: "NIF / RC", placeholder: "Ex: CI-ABJ-2024-B-12345" },
  ML: { label: "NIF / RC", placeholder: "Ex: ML-BKO-2024-12345" },
  BF: { label: "NIF / RC", placeholder: "Ex: BF-OUA-2024-12345" },
  BJ: { label: "NIF / RC", placeholder: "Ex: BJ-CO-2024-12345" },
  TG: { label: "NIF / RC", placeholder: "Ex: TG-LOM-2024-12345" },
  NE: { label: "NIF / RC", placeholder: "Ex: NE-NIA-2024-12345" },
  GN: { label: "NIF / RC", placeholder: "Ex: GN-CON-2024-12345" },
  GH: { label: "TIN / BN", placeholder: "Ex: P0000000000 ou BN-123456" },
  NG: { label: "RC / BN / TIN", placeholder: "Ex: RC 123456 ou BN 1234567" },
  CM: { label: "NIU / RC", placeholder: "Ex: 123456789012 ou RC/YDE/2024/B/123" },
  GA: { label: "NIF / RC", placeholder: "Ex: GA-LBV-2024-12345" },
  TD: { label: "NIF / RC", placeholder: "Ex: TD-NDJ-2024-12345" },
  CF: { label: "NIF / RC", placeholder: "Ex: CF-BGF-2024-12345" },
  CG: { label: "NIF / RC", placeholder: "Ex: CG-BZV-2024-12345" },
  GQ: { label: "NIF / CIF", placeholder: "Ex: GQ-2024-12345" },
};
const DEFAULT_TAX_ID = { label: "Numéro d'identification", placeholder: "SIRET, RC, NIF, NINEA…" };

function getTaxIdConfig(countryCode: string | undefined): { label: string; placeholder: string } {
  if (!countryCode || countryCode === "none") return DEFAULT_TAX_ID;
  return TAX_ID_BY_COUNTRY[countryCode] ?? DEFAULT_TAX_ID;
}

// --- Types & Schema ---
type WorkspaceType = 'FREELANCE' | 'INDIVIDUAL' | 'COMPANY';

// Infos détaillées par type de workspace (affichées sous les cartes au step 1)
const WORKSPACE_TYPE_INFO: Record<WorkspaceType, { title: string; description: string }> = {
  FREELANCE: {
    title: "Profil Freelance",
    description: "Idéal si vous travaillez en indépendant dans le digital (développement, design, conseil, rédaction…). Facturly adapte les libellés et vous permet de facturer sans créer de structure juridique dédiée. Vous pourrez ajouter vos informations légales et votre adresse plus tard dans les paramètres si besoin.",
  },
  INDIVIDUAL: {
    title: "Profil Indépendant",
    description: "Conçu pour les artisans, commerçants et travailleurs indépendants ayant une activité régulière (auto-entrepreneur, activité libérale, petit commerce…). La facturation et les mentions légales sont adaptées à votre statut. Vous pourrez renseigner l'adresse et le numéro d'identification dans les paramètres du workspace.",
  },
  COMPANY: {
    title: "Profil Entreprise",
    description: "Pour les sociétés (SARL, SAS, SA…) et structures établies. Nous demanderons à l'étape suivante le nom de l'entité, l'adresse complète du siège et le numéro d'identification (NINEA, NIF, RC…) pour que vos factures soient conformes et professionnelles.",
  },
};

const workspaceSchema = z.object({
  type: z.enum(['FREELANCE', 'INDIVIDUAL', 'COMPANY']),
  name: z.string().optional().nullable(),
  addressLine1: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  defaultCurrency: z.string().min(1, "Devise requise"),
  country: z.string().optional(),
})
  .refine((data) => {
    if (data.type === 'COMPANY' && (!data.name || String(data.name).trim().length < 2)) return false;
    return true;
  }, { message: "Le nom de l'entreprise est requis (min. 2 caractères)", path: ['name'] })
  .refine((data) => {
    if (data.type !== 'COMPANY') return true;
    return !!(data.addressLine1 && String(data.addressLine1).trim().length >= 2);
  }, { message: "L'adresse est requise (min. 2 caractères)", path: ['addressLine1'] })
  .refine((data) => {
    if (data.type !== 'COMPANY') return true;
    return !!(data.taxId && String(data.taxId).trim().length >= 2);
  }, { message: "Le numéro d'identification est requis", path: ['taxId'] });

type WorkspaceFormValues = z.infer<typeof workspaceSchema>;

export function OnboardingWizard({ workspace, onComplete }: { workspace: Workspace | null; onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [updateWorkspace, { isLoading: isUpdating }] = useUpdateWorkspaceMutation();
  const [createWorkspace, { isLoading: isCreating }] = useCreateWorkspaceMutation();
  const { refetch } = useGetWorkspaceQuery();
  const isLoading = isUpdating || isCreating;

  const form = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceSchema),
    mode: 'onChange',
    defaultValues: {
      type: workspace?.type || 'FREELANCE',
      name: workspace?.name || '',
      addressLine1: workspace?.addressLine1 || '',
      addressLine2: workspace?.addressLine2 || '',
      postalCode: workspace?.postalCode || '',
      city: workspace?.city || '',
      taxId: workspace?.taxId || '',
      defaultCurrency: workspace?.defaultCurrency || 'XOF',
      country: workspace?.country || 'SN',
    },
  });

  const selectedType = form.watch("type");
  const nameValue = form.watch("name");
  const addressLine1Value = form.watch("addressLine1");
  const taxIdValue = form.watch("taxId");
  const countryValue = form.watch("country");
  const taxIdConfig = getTaxIdConfig(countryValue);

  const totalSteps = selectedType === "COMPANY" ? 3 : 2;
  const isLastStep = (step === 2 && selectedType !== "COMPANY") || (step === 3 && selectedType === "COMPANY");

  const canProceedFromStep1 = true;
  const canProceedFromStep2 =
    selectedType !== "COMPANY" ||
    (
      typeof nameValue === "string" && nameValue.trim().length >= 2 &&
      typeof addressLine1Value === "string" && addressLine1Value.trim().length >= 2 &&
      typeof taxIdValue === "string" && taxIdValue.trim().length >= 2
    );

  const step2CompanyFields: (keyof WorkspaceFormValues)[] = ["type", "name", "addressLine1", "taxId"];

  const onNextStep = async () => {
    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2 && selectedType === "COMPANY") {
      const result = await form.trigger(step2CompanyFields);
      if (result) setStep(3);
    }
  };

  const handleFinalSubmit = async (values: WorkspaceFormValues) => {
    try {
      const isCompany = values.type === 'COMPANY';
      const createPayload = {
        type: values.type,
        name: isCompany ? values.name : null,
        defaultCurrency: values.defaultCurrency,
        country: values.country || undefined,
      };
      const updatePayload = {
        ...createPayload,
        name: isCompany ? values.name : null,
        addressLine1: isCompany ? (values.addressLine1 || undefined) : undefined,
        addressLine2: isCompany ? (values.addressLine2 || undefined) : undefined,
        postalCode: isCompany ? (values.postalCode || undefined) : undefined,
        city: isCompany ? (values.city || undefined) : undefined,
        taxId: isCompany ? (values.taxId || undefined) : undefined,
      };

      if (!workspace) {
        await createWorkspace(createPayload).unwrap();
        if (isCompany && (values.addressLine1 || values.taxId)) {
          await updateWorkspace(updatePayload).unwrap();
        }
      } else {
        await updateWorkspace(updatePayload).unwrap();
      }

      toast.success("Espace configuré ! Bienvenue à bord.");
      await refetch();
      onComplete();
    } catch (error: any) {
      toast.error(error?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto min-h-[500px] flex flex-col">
      {/* Progress Bar — 2 ou 3 segments selon le type */}
      <div className="flex justify-center gap-2 mb-10">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((i) => (
          <div key={i} className={cn("h-1.5 w-12 rounded-full transition-all duration-500", step >= i ? "bg-primary" : "bg-muted")} />
        ))}
      </div>

      <form onSubmit={form.handleSubmit(handleFinalSubmit)} className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Parlons de vous</h1>
                <p className="text-muted-foreground">Quel type de profil correspond le mieux à votre activité ?</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { id: 'FREELANCE', label: 'Freelance', icon: User, desc: 'Indépendant digital' },
                  { id: 'INDIVIDUAL', label: 'Indépendant', icon: Sparkles, desc: 'Artisan / Commerçant' },
                  { id: 'COMPANY', label: 'Entreprise', icon: Building2, desc: 'Société établie' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => form.setValue('type', item.id as WorkspaceType, { shouldValidate: true })}
                    className={cn(
                      "group flex flex-col items-center p-6 rounded-2xl border-2 transition-all hover:border-primary/50",
                      selectedType === item.id ? "border-primary bg-primary/5 ring-4 ring-primary/5" : "border-border bg-card"
                    )}
                  >
                    <item.icon className={cn("h-8 w-8 mb-3 transition-colors", selectedType === item.id ? "text-primary" : "text-muted-foreground")} />
                    <span className="font-bold text-sm">{item.label}</span>
                    <span className="text-[10px] text-muted-foreground mt-1 text-center">{item.desc}</span>
                  </button>
                ))}
              </div>

              {/* Bloc d'info détaillée selon le type sélectionné */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedType}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl border border-[#470000]/20 bg-[#470000]/5 p-4 text-left"
                >
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                    <div className="space-y-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{WORKSPACE_TYPE_INFO[selectedType].title}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{WORKSPACE_TYPE_INFO[selectedType].description}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          ) : step === 2 && selectedType === "COMPANY" ? (
            <motion.div 
              key="step2-company"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Votre entreprise</h1>
                <p className="text-muted-foreground">Informations du siège et identification.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    Pays du siège
                  </Label>
                  <Controller
                    name="country"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        onValueChange={(v) => field.onChange(v === "none" ? undefined : v)}
                        value={field.value || "SN"}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Choisir un pays" />
                        </SelectTrigger>
                        <SelectContent>
                          {ONBOARDING_COUNTRIES.filter((c) => c.value !== "none").map(({ value, label }) => (
                            <SelectItem key={value} value={value}>
                              <span className="flex items-center gap-2">
                                {COUNTRY_FLAGS[value] ? (
                                  <Image
                                    src={COUNTRY_FLAGS[value]}
                                    alt=""
                                    width={20}
                                    height={14}
                                    className="object-contain shrink-0 rounded-sm"
                                    unoptimized
                                  />
                                ) : (
                                  <span className="inline-block w-5 h-3.5 shrink-0 rounded-sm bg-muted" aria-hidden />
                                )}
                                {label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Nom de l'entité juridique <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Ex: Tech Services SARL"
                    className={cn("h-12 text-base", form.formState.errors.name && "border-destructive focus-visible:ring-destructive")}
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressLine1" className="text-sm font-medium">
                    Adresse <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="addressLine1"
                    {...form.register("addressLine1")}
                    placeholder="Numéro et nom de rue"
                    className={cn("h-12 text-base", form.formState.errors.addressLine1 && "border-destructive focus-visible:ring-destructive")}
                  />
                  {form.formState.errors.addressLine1 && (
                    <p className="text-xs text-destructive">{form.formState.errors.addressLine1.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="addressLine2" className="text-sm font-medium">Complément d'adresse</Label>
                    <Input
                      id="addressLine2"
                      {...form.register("addressLine2")}
                      placeholder="Bâtiment, étage…"
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-sm font-medium">Code postal</Label>
                    <Input
                      id="postalCode"
                      {...form.register("postalCode")}
                      placeholder="Ex: 12500"
                      className="h-12 text-base"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium">Ville</Label>
                  <Input
                    id="city"
                    {...form.register("city")}
                    placeholder="Ex: Dakar"
                    className="h-12 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId" className="text-sm font-medium">
                    {taxIdConfig.label} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="taxId"
                    {...form.register("taxId")}
                    placeholder={taxIdConfig.placeholder}
                    className={cn("h-12 text-base", form.formState.errors.taxId && "border-destructive focus-visible:ring-destructive")}
                  />
                  {form.formState.errors.taxId && (
                    <p className="text-xs text-destructive">{form.formState.errors.taxId.message}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key={step === 2 ? "step2-loc" : "step3"}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Localisation & Devise</h1>
                <p className="text-muted-foreground">Ces réglages nous permettent d'automatiser vos taxes.</p>
              </div>

              <div className="grid gap-6">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Pays de résidence</Label>
                  <Controller
                    name="country"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        onValueChange={(v) => field.onChange(v === "none" ? undefined : v)}
                        value={field.value || "none"}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Choisir un pays" />
                        </SelectTrigger>
                        <SelectContent>
                          {ONBOARDING_COUNTRIES.map(({ value, label }) => (
                            <SelectItem key={value} value={value}>
                              <span className="flex items-center gap-2">
                                {value !== "none" && COUNTRY_FLAGS[value] ? (
                                  <Image
                                    src={COUNTRY_FLAGS[value]}
                                    alt=""
                                    width={20}
                                    height={14}
                                    className="object-contain shrink-0 rounded-sm"
                                    unoptimized
                                  />
                                ) : value !== "none" ? (
                                  <span className="inline-block w-5 h-3.5 shrink-0 rounded-sm bg-muted" aria-hidden />
                                ) : null}
                                {label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2"><Coins className="h-4 w-4 text-primary" /> Devise de facturation</Label>
                  <Controller
                    name="defaultCurrency"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Choisir une devise" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="XOF">FCFA (XOF) — UEMOA, Afrique de l'Ouest</SelectItem>
                          <SelectItem value="XAF">FCFA (XAF) — CEMAC, Afrique Centrale</SelectItem>
                          <SelectItem value="NGN">NGN (₦) — Naira nigérian</SelectItem>
                          <SelectItem value="GHS">GHS (₵) — Cedi ghanéen</SelectItem>
                          <SelectItem value="EUR">EUR (€) — Euro</SelectItem>
                          <SelectItem value="USD">USD ($) — Dollar américain</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Actions */}
        <div className="mt-12 flex items-center justify-between pt-6 border-t">
          {step > 1 ? (
            <Button type="button" variant="ghost" onClick={() => setStep(step - 1)} disabled={isLoading}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
          ) : (
            <div />
          )}

          <div className="flex gap-3">
            {!isLastStep ? (
              <Button
                type="button"
                size="lg"
                onClick={onNextStep}
                disabled={step === 2 && selectedType === "COMPANY" ? !canProceedFromStep2 : !canProceedFromStep1}
                className="px-8 font-semibold transition-all"
              >
                Suivant <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                size="lg"
                disabled={isLoading}
                onClick={form.handleSubmit(handleFinalSubmit)}
                className="px-8 font-semibold bg-primary hover:opacity-90"
              >
                {isLoading ? "Création..." : "Terminer la configuration"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}