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
  useGetMeQuery,
  useUpdateUserMutation,
  useGetCompanyQuery,
  useUpdateCompanyMutation,
} from "@/services/facturlyApi";
import { toast } from "sonner";
import { Loader2, CheckCircle2, ArrowRight, ArrowLeft, User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Schémas de validation
const userSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
});

const companySchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  legalName: z.string().optional(),
  taxId: z.string().optional(),
  vatNumber: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  defaultCurrency: z.string().min(1, "La devise est obligatoire"),
});

type UserFormValues = z.infer<typeof userSchema>;
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
  const [currentStep, setCurrentStep] = useState<"user" | "company">("user");
  const [isDismissed, setIsDismissed] = useState(false);

  // Queries
  const { data: user, isLoading: isLoadingUser, refetch: refetchUser } = useGetMeQuery();
  const { data: company, isLoading: isLoadingCompany, refetch: refetchCompany } = useGetCompanyQuery();

  // Mutations
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [updateCompany, { isLoading: isUpdatingCompany }] = useUpdateCompanyMutation();

  // Forms
  const userForm = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  });

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

  // Déterminer l'étape initiale en fonction de ce qui manque
  useEffect(() => {
    if (user && company && open) {
      const userCompletion = user.profileCompletion || 0;
      const companyCompletion = company.profileCompletion || 0;
      
      // Commencer par l'étape qui a le moins de complétion
      if (userCompletion < companyCompletion) {
        setCurrentStep("user");
      } else if (companyCompletion < 100) {
        setCurrentStep("company");
      } else {
        setCurrentStep("user");
      }
    }
  }, [user, company, open]);

  // Remplir les formulaires avec les données existantes
  useEffect(() => {
    if (user) {
      userForm.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });
    }
  }, [user, userForm]);

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
    if (!user || !company) return 0;
    const userCompletion = user.profileCompletion || 0;
    const companyCompletion = company.profileCompletion || 0;
    return Math.round((userCompletion + companyCompletion) / 2);
  };

  // Vérifier si le profil est complet
  const isProfileComplete = () => {
    if (!user || !company) return false;
    return (user.profileCompletion || 0) >= 100 && (company.profileCompletion || 0) >= 100;
  };

  // Handlers
  const onUserSubmit = async (values: UserFormValues) => {
    try {
      await updateUser({
        firstName: values.firstName,
        lastName: values.lastName,
      }).unwrap();

      toast.success("Profil mis à jour", {
        description: "Vos informations personnelles ont été mises à jour.",
      });

      // Rafraîchir les données utilisateur et entreprise
      const [updatedUserResult, updatedCompanyResult] = await Promise.all([
        refetchUser(),
        refetchCompany(),
      ]);
      
      const userCompletion = updatedUserResult.data?.profileCompletion || 0;
      const companyCompletion = updatedCompanyResult.data?.profileCompletion || 0;

      // Vérifier quelle étape afficher ensuite
      if (userCompletion >= 100 && companyCompletion >= 100) {
        handleComplete();
      } else if (companyCompletion < 100) {
        setCurrentStep("company");
      } else {
        // Si l'utilisateur n'est toujours pas complet, rester sur user
        setCurrentStep("user");
      }
    } catch (error: any) {
      toast.error("Erreur", {
        description: error?.data?.message || "Impossible de mettre à jour votre profil.",
      });
    }
  };

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
      const [updatedUserResult, updatedCompanyResult] = await Promise.all([
        refetchUser(),
        refetchCompany(),
      ]);
      
      const userCompletion = updatedUserResult.data?.profileCompletion || 0;
      const companyCompletion = updatedCompanyResult.data?.profileCompletion || 0;

      // Vérifier si tout est complet
      if (userCompletion >= 100 && companyCompletion >= 100) {
        handleComplete();
      } else if (userCompletion < 100) {
        setCurrentStep("user");
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

  const isLoading = isLoadingUser || isLoadingCompany;
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
          {/* Étape 1: Profil utilisateur */}
          {currentStep === "user" && (
            <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <User className="h-5 w-5 text-primary" />
                <span>Informations personnelles</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    {...userForm.register("firstName")}
                    placeholder="John"
                    disabled={isUpdatingUser}
                  />
                  {userForm.formState.errors.firstName && (
                    <p className="text-sm text-destructive">
                      {userForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    {...userForm.register("lastName")}
                    placeholder="Doe"
                    disabled={isUpdatingUser}
                  />
                  {userForm.formState.errors.lastName && (
                    <p className="text-sm text-destructive">
                      {userForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isUpdatingUser}>
                  {isUpdatingUser ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      Continuer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Étape 2: Informations entreprise */}
          {currentStep === "company" && (
            <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Building2 className="h-5 w-5 text-primary" />
                <span>Informations de l'entreprise</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                <Input
                  id="companyName"
                  {...companyForm.register("name")}
                  placeholder="Ma Société SARL"
                  disabled={isUpdatingCompany}
                />
                {companyForm.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {companyForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="legalName">Nom légal</Label>
                  <Input
                    id="legalName"
                    {...companyForm.register("legalName")}
                    placeholder="Ma Société SARL"
                    disabled={isUpdatingCompany}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultCurrency">Devise *</Label>
                  <Controller
                    name="defaultCurrency"
                    control={companyForm.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={isUpdatingCompany}>
                        <SelectTrigger>
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
                  <Label htmlFor="taxId">Numéro SIRET / Tax ID</Label>
                  <Input
                    id="taxId"
                    {...companyForm.register("taxId")}
                    placeholder="12345678901234"
                    disabled={isUpdatingCompany}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vatNumber">Numéro de TVA</Label>
                  <Input
                    id="vatNumber"
                    {...companyForm.register("vatNumber")}
                    placeholder="FR12345678901"
                    disabled={isUpdatingCompany}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine1">Adresse ligne 1</Label>
                <Input
                  id="addressLine1"
                  {...companyForm.register("addressLine1")}
                  placeholder="123 Rue de la République"
                  disabled={isUpdatingCompany}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine2">Adresse ligne 2</Label>
                <Input
                  id="addressLine2"
                  {...companyForm.register("addressLine2")}
                  placeholder="Bâtiment A, Bureau 101"
                  disabled={isUpdatingCompany}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Code postal</Label>
                  <Input
                    id="postalCode"
                    {...companyForm.register("postalCode")}
                    placeholder="75001"
                    disabled={isUpdatingCompany}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    {...companyForm.register("city")}
                    placeholder="Paris"
                    disabled={isUpdatingCompany}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Controller
                    name="country"
                    control={companyForm.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={isUpdatingCompany}>
                        <SelectTrigger>
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
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCurrentStep("user")}
                  disabled={isUpdatingCompany}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
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

