"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  useGetCompanyQuery,
  useUpdateCompanyMutation,
} from "@/services/facturlyApi";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Schémas de validation
const companySchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  legalName: z.string().min(2, "La raison sociale est obligatoire"),
  taxId: z.string().min(1, "Le numéro d'identification fiscale est obligatoire"),
  vatNumber: z.string().min(1, "Le numéro de TVA est obligatoire"),
  addressLine1: z.string().min(1, "L'adresse ligne 1 est obligatoire"),
  addressLine2: z.string().min(1, "L'adresse ligne 2 est obligatoire"),
  postalCode: z.string().min(1, "Le code postal est obligatoire"),
  city: z.string().min(1, "La ville est obligatoire"),
  country: z.string().min(1, "Le pays est obligatoire"),
  defaultCurrency: z.string().min(1, "La devise est obligatoire"),
});

type CompanyFormValues = z.infer<typeof companySchema>;

const COUNTRIES = [
  // Afrique de l'Ouest
  { value: "BJ", label: "Bénin" },
  { value: "BF", label: "Burkina Faso" },
  { value: "CV", label: "Cap-Vert" },
  { value: "CI", label: "Côte d'Ivoire" },
  { value: "GM", label: "Gambie" },
  { value: "GH", label: "Ghana" },
  { value: "GN", label: "Guinée" },
  { value: "GW", label: "Guinée-Bissau" },
  { value: "LR", label: "Liberia" },
  { value: "ML", label: "Mali" },
  { value: "MR", label: "Mauritanie" },
  { value: "NE", label: "Niger" },
  { value: "NG", label: "Nigeria" },
  { value: "SN", label: "Sénégal" },
  { value: "SL", label: "Sierra Leone" },
  { value: "TG", label: "Togo" },
  
  // Afrique centrale
  { value: "CM", label: "Cameroun" },
  { value: "CF", label: "République centrafricaine" },
  { value: "TD", label: "Tchad" },
  { value: "CG", label: "Congo" },
  { value: "CD", label: "République démocratique du Congo" },
  { value: "GQ", label: "Guinée équatoriale" },
  { value: "GA", label: "Gabon" },
  { value: "ST", label: "São Tomé-et-Príncipe" },
  
  // Afrique de l'Est
  { value: "BI", label: "Burundi" },
  { value: "KM", label: "Comores" },
  { value: "DJ", label: "Djibouti" },
  { value: "ER", label: "Érythrée" },
  { value: "ET", label: "Éthiopie" },
  { value: "KE", label: "Kenya" },
  { value: "MG", label: "Madagascar" },
  { value: "MW", label: "Malawi" },
  { value: "MU", label: "Maurice" },
  { value: "MZ", label: "Mozambique" },
  { value: "RW", label: "Rwanda" },
  { value: "SC", label: "Seychelles" },
  { value: "SO", label: "Somalie" },
  { value: "SS", label: "Soudan du Sud" },
  { value: "TZ", label: "Tanzanie" },
  { value: "UG", label: "Ouganda" },
  { value: "ZM", label: "Zambie" },
  { value: "ZW", label: "Zimbabwe" },
  
  // Afrique du Nord
  { value: "DZ", label: "Algérie" },
  { value: "EG", label: "Égypte" },
  { value: "LY", label: "Libye" },
  { value: "MA", label: "Maroc" },
  { value: "SD", label: "Soudan" },
  { value: "TN", label: "Tunisie" },
  
  // Afrique australe
  { value: "AO", label: "Angola" },
  { value: "BW", label: "Botswana" },
  { value: "LS", label: "Lesotho" },
  { value: "NA", label: "Namibie" },
  { value: "ZA", label: "Afrique du Sud" },
  { value: "SZ", label: "Eswatini" },
  
  // Autres pays africains
  { value: "EH", label: "Sahara occidental" },
];

const CURRENCIES = [
  { value: "EUR", label: "EUR (€)" },
  { value: "USD", label: "USD ($)" },
  { value: "XOF", label: "XOF (CFA)" },
];

interface OnboardingModalProps {
  open: boolean;
  onComplete?: () => void;
}

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Queries
  const { data: company, isLoading: isLoadingCompany, refetch: refetchCompany } = useGetCompanyQuery();

  // Mutations
  const [updateCompany, { isLoading: isUpdatingCompany }] = useUpdateCompanyMutation();

  // Forms
  const companyForm = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      legalName: "",
      taxId: "",
      vatNumber: "",
      addressLine1: "",
      addressLine2: "",
      postalCode: "",
      city: "",
      country: "",
      defaultCurrency: "EUR",
    },
  });

  // Remplir les formulaires avec les données existantes
  useEffect(() => {
    if (company) {
      companyForm.reset({
        name: company.name || "",
        legalName: company.legalName || "",
        taxId: company.taxId || "",
        vatNumber: company.vatNumber || "",
        addressLine1: company.addressLine1 || "",
        addressLine2: company.addressLine2 || "",
        postalCode: company.postalCode || "",
        city: company.city || "",
        country: company.country || "",
        defaultCurrency: company.defaultCurrency || "EUR",
      });
    }
  }, [company, companyForm]);

  // Calculer le pourcentage de complétion
  const getCompletionPercentage = () => {
    if (!company) return 0;
    return company.profileCompletion || 0;
  };

  // Vérifier si le profil est complet
  const isProfileComplete = () => {
    if (!company) return false;
    return (company.profileCompletion || 0) >= 100;
  };

  // Handlers
  const onCompanySubmit = async (values: CompanyFormValues) => {
    try {
      await updateCompany({
        name: values.name,
        legalName: values.legalName || undefined,
        taxId: values.taxId || undefined,
        vatNumber: values.vatNumber || undefined,
        addressLine1: values.addressLine1 || undefined,
        addressLine2: values.addressLine2 || undefined,
        postalCode: values.postalCode || undefined,
        city: values.city || undefined,
        country: values.country || undefined,
        defaultCurrency: values.defaultCurrency,
      }).unwrap();

      toast.success("Entreprise mise à jour", {
        description: "Les informations de votre entreprise ont été mises à jour.",
      });

      // Rafraîchir les données
      const updatedCompanyResult = await refetchCompany();
      const companyCompletion = updatedCompanyResult.data?.profileCompletion || 0;

      // Vérifier si tout est complet
      if (companyCompletion >= 100) {
        handleComplete();
      }
    } catch (error: any) {
      toast.error("Erreur", {
        description: error?.data?.message || "Impossible de mettre à jour votre entreprise.",
      });
    }
  };

  const handleComplete = () => {
    setIsDismissed(true);
    if (onComplete) {
      onComplete();
    }
  };


  // Ne pas afficher si l'onboarding a été fermé
  if (isDismissed) {
    return null;
  }

  // Vérifier si le profil est vraiment complet avant de ne pas afficher
  const shouldShow = open && !isDismissed;
  if (!shouldShow) {
    return null;
  }

  const isLoading = isLoadingCompany;
  const completionPercentage = getCompletionPercentage();

  return (
    <Dialog open={shouldShow} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Complétez votre profil</DialogTitle>
          <DialogDescription>
            Pour utiliser Facturly au mieux, nous avons besoin de quelques informations supplémentaires.
          </DialogDescription>
        </DialogHeader>

        {/* Barre de progression */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-medium">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Étapes */}
        <div className="space-y-6">
          {/* Informations entreprise */}
          {(
            <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Building2 className="h-5 w-5 text-primary" />
                <span>Informations de l'entreprise</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Nom de l'entreprise <span className="text-destructive">*</span></Label>
                <Input
                  id="companyName"
                  {...companyForm.register("name")}
                  placeholder="Ma Société SARL"
                  disabled={isUpdatingCompany}
                  className={companyForm.formState.errors.name ? "border-destructive" : ""}
                />
                {companyForm.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {companyForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="legalName">Nom légal <span className="text-destructive">*</span></Label>
                  <Input
                    id="legalName"
                    {...companyForm.register("legalName")}
                    placeholder="Ma Société SARL"
                    disabled={isUpdatingCompany}
                    className={companyForm.formState.errors.legalName ? "border-destructive" : ""}
                  />
                  {companyForm.formState.errors.legalName && (
                    <p className="text-sm text-destructive">
                      {companyForm.formState.errors.legalName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultCurrency">Devise <span className="text-destructive">*</span></Label>
                  <Controller
                    name="defaultCurrency"
                    control={companyForm.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={isUpdatingCompany}>
                        <SelectTrigger className={companyForm.formState.errors.defaultCurrency ? "border-destructive" : ""}>
                          <SelectValue placeholder="Sélectionner une devise" />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {companyForm.formState.errors.defaultCurrency && (
                    <p className="text-sm text-destructive">
                      {companyForm.formState.errors.defaultCurrency.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="taxId">Numéro SIRET / Tax ID <span className="text-destructive">*</span></Label>
                  <Input
                    id="taxId"
                    {...companyForm.register("taxId")}
                    placeholder="12345678901234"
                    disabled={isUpdatingCompany}
                    className={companyForm.formState.errors.taxId ? "border-destructive" : ""}
                  />
                  {companyForm.formState.errors.taxId && (
                    <p className="text-sm text-destructive">
                      {companyForm.formState.errors.taxId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vatNumber">Numéro de TVA <span className="text-destructive">*</span></Label>
                  <Input
                    id="vatNumber"
                    {...companyForm.register("vatNumber")}
                    placeholder="FR12345678901"
                    disabled={isUpdatingCompany}
                    className={companyForm.formState.errors.vatNumber ? "border-destructive" : ""}
                  />
                  {companyForm.formState.errors.vatNumber && (
                    <p className="text-sm text-destructive">
                      {companyForm.formState.errors.vatNumber.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine1">Adresse ligne 1 <span className="text-destructive">*</span></Label>
                <Input
                  id="addressLine1"
                  {...companyForm.register("addressLine1")}
                  placeholder="123 Rue de la République"
                  disabled={isUpdatingCompany}
                  className={companyForm.formState.errors.addressLine1 ? "border-destructive" : ""}
                />
                {companyForm.formState.errors.addressLine1 && (
                  <p className="text-sm text-destructive">
                    {companyForm.formState.errors.addressLine1.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine2">Adresse ligne 2 <span className="text-destructive">*</span></Label>
                <Input
                  id="addressLine2"
                  {...companyForm.register("addressLine2")}
                  placeholder="Bâtiment A, Bureau 101"
                  disabled={isUpdatingCompany}
                  className={companyForm.formState.errors.addressLine2 ? "border-destructive" : ""}
                />
                {companyForm.formState.errors.addressLine2 && (
                  <p className="text-sm text-destructive">
                    {companyForm.formState.errors.addressLine2.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Code postal <span className="text-destructive">*</span></Label>
                  <Input
                    id="postalCode"
                    {...companyForm.register("postalCode")}
                    placeholder="75001"
                    disabled={isUpdatingCompany}
                    className={companyForm.formState.errors.postalCode ? "border-destructive" : ""}
                  />
                  {companyForm.formState.errors.postalCode && (
                    <p className="text-sm text-destructive">
                      {companyForm.formState.errors.postalCode.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ville <span className="text-destructive">*</span></Label>
                  <Input
                    id="city"
                    {...companyForm.register("city")}
                    placeholder="Paris"
                    disabled={isUpdatingCompany}
                    className={companyForm.formState.errors.city ? "border-destructive" : ""}
                  />
                  {companyForm.formState.errors.city && (
                    <p className="text-sm text-destructive">
                      {companyForm.formState.errors.city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Pays <span className="text-destructive">*</span></Label>
                  <Controller
                    name="country"
                    control={companyForm.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={isUpdatingCompany}>
                        <SelectTrigger className={companyForm.formState.errors.country ? "border-destructive" : ""}>
                          <SelectValue placeholder="Sélectionner un pays" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {companyForm.formState.errors.country && (
                    <p className="text-sm text-destructive">
                      {companyForm.formState.errors.country.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isUpdatingCompany}>
                  {isUpdatingCompany ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      Terminer
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

