"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Breadcrumb from "@/components/ui/breadcrumb";
import Skeleton from "@/components/ui/skeleton";
import {
  useGetMeQuery,
  useUpdateUserMutation,
  useGetCompanyQuery,
  useUpdateCompanyMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetSubscriptionQuery,
  useGetPlansQuery,
  useCreateSubscriptionMutation,
  usePreviewSubscriptionMutation,
  useCancelSubscriptionMutation,
  useCreateCheckoutSessionMutation,
  useChangePlanMutation,
  useCreatePortalSessionMutation,
  Plan,
} from "@/services/facturlyApi";
import { InvoiceLimitCard } from "@/components/dashboard/InvoiceLimitCard";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle2, Calendar, ArrowRight, Crown, Zap, Infinity, CreditCard, TrendingUp, BadgeCheck, Receipt, Globe, DollarSign, Percent, FileText, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Schémas de validation
const userSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").optional().or(z.literal("")),
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

const settingsSchema = z.object({
  language: z.string().min(1, "La langue est obligatoire"),
  timezone: z.string().min(1, "Le fuseau horaire est obligatoire"),
  invoicePrefix: z.string().min(1, "Le préfixe est obligatoire"),
  dateFormat: z.string().min(1, "Le format de date est obligatoire"),
  currency: z.string().min(1, "La devise est obligatoire"),
  taxRate: z.string().min(1, "Le taux de TVA est obligatoire"),
  paymentTerms: z.number().min(0, "Les termes de paiement doivent être positifs"),
});

type UserFormValues = z.infer<typeof userSchema>;
type CompanyFormValues = z.infer<typeof companySchema>;
type SettingsFormValues = z.infer<typeof settingsSchema>;

const sections = [
  { value: "profile", label: "Profil" },
  { value: "company", label: "Entreprise" },
  { value: "billing", label: "Facturation" },
  { value: "subscription", label: "Abonnement" },
];

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  
  // Valider que le tab est dans la liste des sections valides
  const validTabs = useMemo(() => sections.map(s => s.value), []);
  const defaultTab = tabParam && validTabs.includes(tabParam) ? tabParam : "profile";
  
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Mettre à jour l'onglet actif si le paramètre change depuis l'URL
  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam, validTabs, activeTab]);

  // Gérer le changement de tab et mettre à jour l'URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/settings?tab=${value}`, { scroll: false });
  };
  // Queries
  const { data: user, isLoading: isLoadingUser } = useGetMeQuery();
  const { data: company, isLoading: isLoadingCompany } = useGetCompanyQuery();
  const { data: settings, isLoading: isLoadingSettings } = useGetSettingsQuery();
  const { data: subscription, isLoading: isLoadingSubscription, refetch: refetchSubscription } = useGetSubscriptionQuery();
  const { data: plansResponse, isLoading: isLoadingPlans } = useGetPlansQuery();
  
  // Mutations
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [updateCompany, { isLoading: isUpdatingCompany }] = useUpdateCompanyMutation();
  const [updateSettings, { isLoading: isUpdatingSettings }] = useUpdateSettingsMutation();
  const [createSubscription, { isLoading: isChangingPlan }] = useCreateSubscriptionMutation();
  const [previewSubscription, { isLoading: isPreviewing }] = usePreviewSubscriptionMutation();
  const [cancelSubscription, { isLoading: isCanceling }] = useCancelSubscriptionMutation();
  const [createCheckoutSession, { isLoading: isCreatingCheckout }] = useCreateCheckoutSessionMutation();
  const [changePlan, { isLoading: isChangingPlanStripe }] = useChangePlanMutation();
  const [createPortalSession, { isLoading: isCreatingPortal }] = useCreatePortalSessionMutation();
  
  // États pour la gestion des abonnements
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  
  // Forms
  const userForm = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      password: "",
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
  
  const settingsForm = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      language: "fr",
      timezone: "Europe/Paris",
      invoicePrefix: "FAC",
      dateFormat: "DD/MM/YYYY",
      currency: "EUR",
      taxRate: "20.00",
      paymentTerms: 30,
    },
  });
  
  // Remplir les formulaires avec les données de l'API
  useEffect(() => {
    if (user) {
      userForm.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        password: "",
      });
    }
  }, [user, userForm]);
  
  useEffect(() => {
    if (company) {
      companyForm.reset({
        name: company.name,
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
  
  useEffect(() => {
    if (settings) {
      settingsForm.reset({
        language: settings.language,
        timezone: settings.timezone,
        invoicePrefix: settings.invoicePrefix,
        dateFormat: settings.dateFormat,
        currency: settings.currency,
        taxRate: settings.taxRate,
        paymentTerms: settings.paymentTerms,
      });
    }
  }, [settings, settingsForm]);
  
  // Handlers
  const onUserSubmit = async (values: UserFormValues) => {
    try {
      await updateUser({
        firstName: values.firstName,
        lastName: values.lastName,
        password: values.password || undefined,
      }).unwrap();
      
      toast.success("Profil mis à jour", {
        description: "Vos informations personnelles ont été mises à jour avec succès.",
      });
      userForm.reset({ ...values, password: "" });
    } catch (error) {
      const errorMessage = error && typeof error === "object" && "data" in error
        ? (error.data as { message?: string })?.message ?? "Une erreur est survenue lors de la mise à jour du profil."
        : "Vérifiez vos informations ou réessayez plus tard.";
      
      toast.error("Erreur", {
        description: errorMessage,
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
        defaultCurrency: values.defaultCurrency || undefined,
      }).unwrap();
      
      toast.success("Entreprise mise à jour", {
        description: "Les informations de l&apos;entreprise ont été mises à jour avec succès.",
      });
    } catch (error) {
      const errorMessage = error && typeof error === "object" && "data" in error
        ? (error.data as { message?: string })?.message ?? "Une erreur est survenue lors de la mise à jour de l&apos;entreprise."
        : "Vérifiez vos informations ou réessayez plus tard.";
      
      toast.error("Erreur", {
        description: errorMessage,
      });
    }
  };
  
  const onSettingsSubmit = async (values: SettingsFormValues) => {
    try {
      await updateSettings({
        language: values.language,
        timezone: values.timezone,
        invoicePrefix: values.invoicePrefix,
        dateFormat: values.dateFormat,
        currency: values.currency,
        taxRate: values.taxRate,
        paymentTerms: values.paymentTerms,
      }).unwrap();
      
      toast.success("Paramètres mis à jour", {
        description: "Les paramètres de facturation ont été mis à jour avec succès.",
      });
    } catch (error) {
      const errorMessage = error && typeof error === "object" && "data" in error
        ? (error.data as { message?: string })?.message ?? "Une erreur est survenue lors de la mise à jour des paramètres."
        : "Vérifiez vos informations ou réessayez plus tard.";
      
      toast.error("Erreur", {
        description: errorMessage,
      });
    }
  };

  // Fonctions de gestion des abonnements
  async function handlePlanSelect(plan: Plan) {
    if (!subscription) return;

    // Si c'est le même plan, ne rien faire
    // Pour le plan gratuit : plan.code === "free" et subscription.plan === null
    if (plan.code === "free" && subscription.plan === null) {
      return;
    }
    if (subscription?.plan && plan.code === subscription.plan.code) {
      return;
    }

    // Pour le plan gratuit, on ne peut pas faire de preview car il n'existe pas en base
    // On passe directement à la confirmation
    if (plan.code === "free") {
      // Pour revenir au plan gratuit, on doit annuler l'abonnement Stripe actif
      // ou simplement changer le plan vers null
      // Pour l'instant, on affiche un message d'information
      toast.info("Revenir au plan gratuit", {
        description: "Pour revenir au plan gratuit, vous devez annuler votre abonnement actif via le portail Stripe.",
      });
      return;
    }

    setSelectedPlan(plan);
    setShowPreviewDialog(true);

    // Prévisualiser le changement
    try {
      const preview = await previewSubscription({ planId: plan.id }).unwrap();
      setPreviewData(preview);
    } catch (error: any) {
      console.error("Erreur lors de la prévisualisation:", error);
      toast.error("Erreur", {
        description: error?.data?.message || "Impossible de prévisualiser le changement de plan",
      });
      setShowPreviewDialog(false);
    }
  }

  async function handleConfirmPlanChange() {
    if (!selectedPlan) return;

    try {
      const planPrice = parseFloat(selectedPlan.price);
      
      // Vérifier si l'utilisateur a déjà un abonnement actif (payant)
      const hasActivePaidSubscription = 
        subscription?.status === "active" && 
        subscription?.plan !== null;

      if (planPrice === 0) {
        // Plan gratuit : utiliser l'endpoint direct
        await createSubscription({ planId: selectedPlan.id }).unwrap();
        toast.success("Plan changé avec succès", {
          description: `Vous avez souscrit au plan ${selectedPlan.name}`,
        });
        setShowPreviewDialog(false);
        setSelectedPlan(null);
        setPreviewData(null);
      } else if (hasActivePaidSubscription) {
        // Utilisateur a déjà un abonnement payant actif : utiliser change-plan
        const result = await changePlan({ planId: selectedPlan.id }).unwrap();
        toast.success("Changement de plan en cours", {
          description: result.message || "Stripe va créer une facture avec le prorata.",
        });
        setShowPreviewDialog(false);
        setSelectedPlan(null);
        setPreviewData(null);
        
        // Polling pour vérifier la mise à jour
        startPollingSubscription();
      } else {
        // Nouvel abonnement : utiliser Stripe Checkout
        const { url } = await createCheckoutSession({ planId: selectedPlan.id }).unwrap();
        // Rediriger vers Stripe Checkout
        window.location.href = url;
      }
    } catch (error: any) {
      console.error("Erreur lors du changement de plan:", error);
      const errorMessage = error?.data?.message || "Impossible de changer de plan";
      
      // Gestion spécifique des erreurs selon la documentation
      if (errorMessage.includes("déjà un abonnement actif")) {
        toast.error("Abonnement existant", {
          description: "Vous avez déjà un abonnement actif. Le changement de plan va être effectué.",
        });
        // Réessayer avec change-plan
        try {
          const result = await changePlan({ planId: selectedPlan.id }).unwrap();
          toast.success("Changement de plan en cours", {
            description: result.message,
          });
          setShowPreviewDialog(false);
          setSelectedPlan(null);
          setPreviewData(null);
          startPollingSubscription();
        } catch (retryError: any) {
          toast.error("Erreur", {
            description: retryError?.data?.message || "Impossible de changer de plan",
          });
        }
      } else if (errorMessage.includes("Aucun abonnement actif")) {
        toast.error("Aucun abonnement", {
          description: "Vous n'avez pas d'abonnement actif. Utilisez 'S'abonner' pour créer un nouvel abonnement.",
        });
      } else {
        toast.error("Erreur", {
          description: errorMessage,
        });
      }
      setShowPreviewDialog(false);
    }
  }

  // Fonction de polling pour vérifier la mise à jour de l'abonnement
  function startPollingSubscription() {
    if (!selectedPlan) return;
    
    let attempts = 0;
    const maxAttempts = 5;
    const pollInterval = 2000; // 2 secondes
    const targetPlanId = selectedPlan.id;

    const poll = setInterval(async () => {
      attempts++;
      try {
        // Refetch de l'abonnement
        const result = await refetchSubscription();
        const currentSubscription = result.data;
        
        // Vérifier si le plan a changé
        if (currentSubscription?.plan?.id === targetPlanId) {
          clearInterval(poll);
          toast.success("Plan mis à jour", {
            description: `Vous êtes maintenant sur le plan ${selectedPlan.name}`,
          });
        } else if (attempts >= maxAttempts) {
          clearInterval(poll);
          toast.info("Mise à jour en cours", {
            description: "Le changement peut prendre quelques instants. Vous pouvez rafraîchir la page.",
          });
        }
      } catch (error) {
        console.error("Erreur lors du polling:", error);
        if (attempts >= maxAttempts) {
          clearInterval(poll);
        }
      }
    }, pollInterval);
  }

  async function handleOpenPortal() {
    try {
      const { url } = await createPortalSession().unwrap();
      // Rediriger vers le portail client Stripe
      window.location.href = url;
    } catch (error: any) {
      console.error("Erreur lors de l'ouverture du portail:", error);
      toast.error("Erreur", {
        description: error?.data?.message || "Impossible d'ouvrir le portail de gestion",
      });
    }
  }

  async function handleCancelSubscription() {
    try {
      await cancelSubscription().unwrap();
      toast.success("Abonnement annulé", {
        description: "Votre abonnement sera annulé à la fin de la période en cours",
      });
      setShowCancelDialog(false);
    } catch (error: any) {
      console.error("Erreur lors de l'annulation:", error);
      toast.error("Erreur", {
        description: error?.data?.message || "Impossible d'annuler l'abonnement",
      });
    }
  }
  
  const plans = plansResponse?.data ?? [];
  const isLoading = isLoadingUser || isLoadingCompany || isLoadingSettings;
  
  return (
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { label: "Tableau de bord", href: "/dashboard" },
          { label: "Paramètres" },
        ]}
        className="text-xs"
      />
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight text-primary">Paramètres</h1>
        <p className="text-sm text-foreground/70">
          Configurez votre compte, personnalisez vos documents et gérez vos préférences.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="flex-wrap bg-primary/10">
            {sections.map((section) => (
              <TabsTrigger
                key={section.value}
                value={section.value}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Profil utilisateur */}
          <TabsContent value="profile">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">Informations personnelles</CardTitle>
                <CardDescription>
                  Modifiez vos informations personnelles et votre mot de passe.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        Prénom <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="Prénom"
                        {...userForm.register("firstName")}
                        disabled={isUpdatingUser}
                        className={userForm.formState.errors.firstName ? "border-destructive" : ""}
                      />
                      {userForm.formState.errors.firstName && (
                        <p className="text-xs text-destructive">
                          {userForm.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">
                        Nom <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Nom"
                        {...userForm.register("lastName")}
                        disabled={isUpdatingUser}
                        className={userForm.formState.errors.lastName ? "border-destructive" : ""}
                      />
                      {userForm.formState.errors.lastName && (
                        <p className="text-xs text-destructive">
                          {userForm.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-foreground/60">
                        L&apos;email ne peut pas être modifié ici.
                      </p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="password">Nouveau mot de passe</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Laisser vide pour ne pas changer"
                        {...userForm.register("password")}
                        disabled={isUpdatingUser}
                        className={userForm.formState.errors.password ? "border-destructive" : ""}
                      />
                      {userForm.formState.errors.password && (
                        <p className="text-xs text-destructive">
                          {userForm.formState.errors.password.message}
                        </p>
                      )}
                      <p className="text-xs text-foreground/60">
                        Laissez vide si vous ne souhaitez pas changer le mot de passe.
                      </p>
                    </div>
                  </div>
                  <Button type="submit" disabled={isUpdatingUser}>
                    {isUpdatingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Mettre à jour le profil
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Entreprise */}
          <TabsContent value="company">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">Entreprise & Mentions</CardTitle>
                <CardDescription>
                  Configurez les informations de votre entreprise pour les factures.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="company-name">
                        Nom de l&apos;entreprise <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="company-name"
                        placeholder="Nom de l'entreprise"
                        {...companyForm.register("name")}
                        disabled={isUpdatingCompany}
                        className={companyForm.formState.errors.name ? "border-destructive" : ""}
                      />
                      {companyForm.formState.errors.name && (
                        <p className="text-xs text-destructive">
                          {companyForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="legal-name">Raison sociale</Label>
                      <Input
                        id="legal-name"
                        placeholder="Raison sociale"
                        {...companyForm.register("legalName")}
                        disabled={isUpdatingCompany}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="default-currency">
                        Devise par défaut <span className="text-destructive">*</span>
                      </Label>
                      <Controller
                        name="defaultCurrency"
                        control={companyForm.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value} disabled={isUpdatingCompany}>
                            <SelectTrigger className={companyForm.formState.errors.defaultCurrency ? "border-destructive" : ""}>
                              <SelectValue placeholder="Devise" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EUR">EUR (€)</SelectItem>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="XOF">XOF (CFA)</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {companyForm.formState.errors.defaultCurrency && (
                        <p className="text-xs text-destructive">
                          {companyForm.formState.errors.defaultCurrency.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax-id">Numéro d&apos;identification fiscale</Label>
                      <Input
                        id="tax-id"
                        placeholder="SIRET, etc."
                        {...companyForm.register("taxId")}
                        disabled={isUpdatingCompany}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vat-number">Numéro de TVA</Label>
                      <Input
                        id="vat-number"
                        placeholder="FR12345678901"
                        {...companyForm.register("vatNumber")}
                        disabled={isUpdatingCompany}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address-line1">Adresse ligne 1</Label>
                      <Input
                        id="address-line1"
                        placeholder="123 rue de l'innovation"
                        {...companyForm.register("addressLine1")}
                        disabled={isUpdatingCompany}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address-line2">Adresse ligne 2</Label>
                      <Input
                        id="address-line2"
                        placeholder="Complément d'adresse"
                        {...companyForm.register("addressLine2")}
                        disabled={isUpdatingCompany}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal-code">Code postal</Label>
                      <Input
                        id="postal-code"
                        placeholder="75001"
                        {...companyForm.register("postalCode")}
                        disabled={isUpdatingCompany}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Ville</Label>
                      <Input
                        id="city"
                        placeholder="Paris"
                        {...companyForm.register("city")}
                        disabled={isUpdatingCompany}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Pays</Label>
                      <Input
                        id="country"
                        placeholder="France"
                        {...companyForm.register("country")}
                        disabled={isUpdatingCompany}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={isUpdatingCompany}>
                    {isUpdatingCompany && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Mettre à jour l&apos;entreprise
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paramètres de facturation */}
          <TabsContent value="billing">
            <div className="space-y-6">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Paramètres de facturation
                  </CardTitle>
                  <CardDescription>
                    Configurez les paramètres par défaut pour vos factures. Ces valeurs seront utilisées pour toutes vos nouvelles factures.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
                    {/* Section Localisation */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                        <Globe className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-semibold text-primary">Localisation</h3>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="language" className="flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                            Langue <span className="text-destructive">*</span>
                          </Label>
                          <Controller
                            name="language"
                            control={settingsForm.control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value} disabled={isUpdatingSettings}>
                                <SelectTrigger className={settingsForm.formState.errors.language ? "border-destructive" : ""}>
                                  <SelectValue placeholder="Langue" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="fr">Français</SelectItem>
                                  <SelectItem value="en">English</SelectItem>
                                  <SelectItem value="es">Español</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {settingsForm.formState.errors.language && (
                            <p className="text-xs text-destructive">
                              {settingsForm.formState.errors.language.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="timezone" className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            Fuseau horaire <span className="text-destructive">*</span>
                          </Label>
                          <Controller
                            name="timezone"
                            control={settingsForm.control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value} disabled={isUpdatingSettings}>
                                <SelectTrigger className={settingsForm.formState.errors.timezone ? "border-destructive" : ""}>
                                  <SelectValue placeholder="Fuseau horaire" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                                  <SelectItem value="Europe/London">Europe/London</SelectItem>
                                  <SelectItem value="America/New_York">America/New_York</SelectItem>
                                  <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                                  <SelectItem value="Africa/Lome">Africa/Lomé</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {settingsForm.formState.errors.timezone && (
                            <p className="text-xs text-destructive">
                              {settingsForm.formState.errors.timezone.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Section Format */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                        <FileText className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-semibold text-primary">Format des factures</h3>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="invoice-prefix" className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            Préfixe facture <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="invoice-prefix"
                            placeholder="FAC"
                            {...settingsForm.register("invoicePrefix")}
                            disabled={isUpdatingSettings}
                            className={settingsForm.formState.errors.invoicePrefix ? "border-destructive" : ""}
                          />
                          <p className="text-xs text-muted-foreground">
                            Exemple : FAC-2024-001, INV-2024-001
                          </p>
                          {settingsForm.formState.errors.invoicePrefix && (
                            <p className="text-xs text-destructive">
                              {settingsForm.formState.errors.invoicePrefix.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="date-format" className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            Format de date <span className="text-destructive">*</span>
                          </Label>
                          <Controller
                            name="dateFormat"
                            control={settingsForm.control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value} disabled={isUpdatingSettings}>
                                <SelectTrigger className={settingsForm.formState.errors.dateFormat ? "border-destructive" : ""}>
                                  <SelectValue placeholder="Format" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</SelectItem>
                                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</SelectItem>
                                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {settingsForm.formState.errors.dateFormat && (
                            <p className="text-xs text-destructive">
                              {settingsForm.formState.errors.dateFormat.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Section Financier */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-semibold text-primary">Paramètres financiers</h3>
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="currency" className="flex items-center gap-2">
                            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                            Devise <span className="text-destructive">*</span>
                          </Label>
                          <Controller
                            name="currency"
                            control={settingsForm.control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value} disabled={isUpdatingSettings}>
                                <SelectTrigger className={settingsForm.formState.errors.currency ? "border-destructive" : ""}>
                                  <SelectValue placeholder="Devise" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="EUR">EUR (€)</SelectItem>
                                  <SelectItem value="USD">USD ($)</SelectItem>
                                  <SelectItem value="XOF">XOF (CFA)</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {settingsForm.formState.errors.currency && (
                            <p className="text-xs text-destructive">
                              {settingsForm.formState.errors.currency.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tax-rate" className="flex items-center gap-2">
                            <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                            Taux de TVA (%) <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="tax-rate"
                            type="number"
                            step="0.01"
                            placeholder="20.00"
                            {...settingsForm.register("taxRate", { valueAsNumber: false })}
                            disabled={isUpdatingSettings}
                            className={settingsForm.formState.errors.taxRate ? "border-destructive" : ""}
                          />
                          {settingsForm.formState.errors.taxRate && (
                            <p className="text-xs text-destructive">
                              {settingsForm.formState.errors.taxRate.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="payment-terms" className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            Délai de paiement <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="payment-terms"
                            type="number"
                            placeholder="30"
                            {...settingsForm.register("paymentTerms", { valueAsNumber: true })}
                            disabled={isUpdatingSettings}
                            className={settingsForm.formState.errors.paymentTerms ? "border-destructive" : ""}
                          />
                          <p className="text-xs text-muted-foreground">
                            En jours (ex: 30 = 30 jours)
                          </p>
                          {settingsForm.formState.errors.paymentTerms && (
                            <p className="text-xs text-destructive">
                              {settingsForm.formState.errors.paymentTerms.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Info séquence */}
                    <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/5 to-white p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="rounded-lg bg-primary/10 p-2">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-primary">Séquence actuelle</p>
                              <p className="text-xs text-muted-foreground">Numéro de la prochaine facture</p>
                            </div>
                          </div>
                          <p className="text-3xl font-bold text-primary mt-3">{settings?.invoiceSequence ?? 0}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">Prochaine facture</p>
                          <p className="text-lg font-semibold text-primary">
                            {settings?.invoicePrefix ?? "FAC"}-{new Date().getFullYear()}-{(settings?.invoiceSequence ?? 0).toString().padStart(3, "0")}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-primary/20">
                        Le numéro de séquence est automatiquement incrémenté à chaque nouvelle facture créée.
                      </p>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                      <Button type="submit" disabled={isUpdatingSettings} size="lg">
                        {isUpdatingSettings ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Enregistrer les paramètres
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Abonnement */}
          <TabsContent value="subscription">
            <div className="space-y-6">
              {/* Plan actuel */}
              {subscription && (
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-primary flex items-center gap-2">
                      <BadgeCheck className="h-5 w-5" />
                      Plan actuel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold">
                          {subscription.plan === null ? "Gratuit" : subscription.plan.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {subscription.plan === null 
                            ? "Plan gratuit avec limite de factures" 
                            : subscription.plan.billingInterval === "monthly" 
                              ? "Facturation mensuelle" 
                              : "Facturation annuelle"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-primary">
                          {subscription.plan === null 
                            ? "0,00 €" 
                            : new Intl.NumberFormat("fr-FR", {
                                style: "currency",
                                currency: subscription.plan.currency || "EUR",
                              }).format(parseFloat(subscription.plan.price))}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {subscription.plan === null 
                            ? "" 
                            : subscription.plan.billingInterval === "monthly" 
                              ? "/ mois" 
                              : "/ an"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Limite de factures */}
              {subscription?.invoiceLimit && (
                <InvoiceLimitCard 
                  invoiceLimit={subscription.invoiceLimit} 
                  showUpgradeButton={true}
                  planCode={subscription.plan?.code || (subscription.plan === null ? "free" : undefined)}
                />
              )}
             

              {/* Plans disponibles */}
              {!isLoadingPlans && plans.length > 0 && (
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-primary flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Plans disponibles
                    </CardTitle>
                    <CardDescription>
                      Choisissez le plan qui correspond le mieux à vos besoins.
                    </CardDescription>
                    {/* Tabs Mensuel/Annuel */}
                    <div className="mt-4 flex justify-center">
                      <div className="inline-flex items-center gap-2 p-1 bg-muted/50 rounded-lg border border-border">
                        <button
                          onClick={() => setBillingInterval("monthly")}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            billingInterval === "monthly"
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Mensuel
                        </button>
                        <button
                          onClick={() => setBillingInterval("yearly")}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-all relative ${
                            billingInterval === "yearly"
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Annuel
                          {billingInterval === "yearly" && (
                            <span className="absolute -top-1.5 -right-1.5 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              -20%
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {/* Plan gratuit virtuel - affiché tout le temps */}
                      {(() => {
                        const freePlan = {
                          id: "free-implicit",
                          code: "free",
                          name: "Gratuit",
                          price: "0.00",
                          currency: "EUR",
                          billingInterval: "monthly" as const,
                          invoiceLimit: subscription?.invoiceLimit?.effective || 10,
                          description: "Plan gratuit avec limite de factures",
                          metadata: {
                            features: [
                              `${subscription?.invoiceLimit?.effective || 10} factures par mois`,
                              "Génération de PDF",
                              "Support par email"
                            ]
                          }
                        };
                        const isCurrentPlan = subscription?.plan === null; // Plan actuel seulement si plan === null
                        const isFreePlan = true;
                        
                        return (
                          <div
                            key={freePlan.id}
                            className={`relative flex flex-col rounded-xl border-2 p-5 transition-all ${
                              isCurrentPlan
                                ? "border-primary bg-primary/5 shadow-md"
                                : "border-border bg-white hover:border-primary/30 hover:shadow-md"
                            }`}
                          >
                            {isCurrentPlan && (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                                  Plan actuel
                                </span>
                              </div>
                            )}

                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-bold text-primary">{freePlan.name}</h3>
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                  Gratuit
                                </span>
                              </div>
                              
                              <div className="mb-3">
                                <div className="flex items-baseline gap-1">
                                  <span className="text-3xl font-bold text-primary">
                                    Gratuit
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 italic">
                                  Identique en mensuel et annuel
                                </p>
                              </div>

                              {freePlan.metadata?.features && Array.isArray(freePlan.metadata.features) && (
                                <ul className="space-y-2 mb-4">
                                  {freePlan.metadata.features.map((feature: string, index: number) => (
                                    <li key={index} className="flex items-start gap-2 text-xs">
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                      <span className="text-foreground/80">{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}

                              <div className="mt-4 pt-4 border-t border-border/50">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-xs text-muted-foreground">Limite</span>
                                  <span className="text-xs font-semibold">
                                    {freePlan.invoiceLimit ? `${freePlan.invoiceLimit} factures/mois` : "Illimité"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-auto pt-4">
                              <Button
                                variant={isCurrentPlan ? "outline" : "default"}
                                size="sm"
                                className="w-full"
                                disabled={isCurrentPlan || isChangingPlan || isLoadingSubscription}
                                onClick={() => {
                                  if (!isCurrentPlan) {
                                    // Créer un plan virtuel pour le plan gratuit
                                    const virtualFreePlan: Plan = {
                                      id: "free-implicit",
                                      code: "free",
                                      name: "Gratuit",
                                      price: "0.00",
                                      currency: "EUR",
                                      billingInterval: "monthly",
                                      invoiceLimit: subscription?.invoiceLimit?.effective || 10,
                                      description: "Plan gratuit avec limite de factures",
                                      metadata: {
                                        features: [
                                          `${subscription?.invoiceLimit?.effective || 10} factures par mois`,
                                          "Génération de PDF",
                                          "Support par email"
                                        ]
                                      }
                                    };
                                    handlePlanSelect(virtualFreePlan);
                                  }
                                }}
                              >
                                {isCurrentPlan ? (
                                  <>
                                    <BadgeCheck className="mr-2 h-4 w-4" />
                                    Plan actuel
                                  </>
                                ) : (
                                  "Revenir au plan gratuit"
                                )}
                              </Button>
                            </div>
                          </div>
                        );
                      })()}
                      
                      {plans
                        .filter((plan) => {
                          // Filtrer par intervalle de facturation
                          return plan.billingInterval === billingInterval;
                        })
                        .map((plan) => {
                        // Vérifier si c'est le plan actuel (gérer le cas où subscription.plan est null = plan gratuit implicite)
                        const isCurrentPlan = subscription?.plan 
                          ? plan.code === subscription.plan.code 
                          : false;
                        const isFreePlan = false;
                        
                        return (
                          <div
                            key={plan.id}
                            className={`relative rounded-xl border-2 p-5 transition-all ${
                              isCurrentPlan
                                ? "border-primary bg-primary/5 shadow-md"
                                : "border-border bg-white hover:border-primary/30 hover:shadow-md"
                            }`}
                          >
                            {isCurrentPlan && (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                                  Plan actuel
                                </span>
                              </div>
                            )}

                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-bold text-primary">{plan.name}</h3>
                                {isFreePlan ? (
                                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                    Gratuit
                                  </span>
                                ) : (
                                  <Crown className="h-5 w-5 text-primary/60" />
                                )}
                              </div>
                              
                              <div className="mb-3">
                                <div className="flex items-baseline gap-1">
                                  <span className="text-3xl font-bold text-primary">
                                    {plan.price === "0.00" ? "Gratuit" : `${plan.price}`}
                                  </span>
                                  {plan.price !== "0.00" && (
                                    <>
                                      <span className="text-sm text-muted-foreground">{plan.currency}</span>
                                      <span className="text-sm text-muted-foreground">
                                        /{plan.billingInterval === "monthly" ? "mois" : "an"}
                                      </span>
                                    </>
                                  )}
                                </div>
                                {plan.price !== "0.00" && plan.billingInterval === "yearly" && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                      Économisez 20%
                                    </span>
                                    <span className="text-xs text-muted-foreground line-through">
                                      {plan.price === "24" ? "29" : plan.price === "159" ? "199" : plan.price}€/mois
                                    </span>
                                  </div>
                                )}
                                {/* Message spécial pour le plan gratuit */}
                                {isFreePlan && (
                                  <p className="text-xs text-muted-foreground mt-1 italic">
                                    Identique en mensuel et annuel
                                  </p>
                                )}
                                {plan.description && !isFreePlan && (
                                  <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                                )}
                              </div>

                              {plan.metadata?.features && Array.isArray(plan.metadata.features) && (
                                <ul className="space-y-2 mb-4">
                                  {plan.metadata.features.map((feature: string, index: number) => (
                                    <li key={index} className="flex items-start gap-2 text-xs">
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                      <span className="text-foreground/80">{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}

                              <div className="mt-4 pt-4 border-t border-border/50">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-xs text-muted-foreground">Limite</span>
                                  <span className="text-xs font-semibold">
                                    {plan.invoiceLimit ? (
                                      `${plan.invoiceLimit} factures/${plan.billingInterval === "monthly" ? "mois" : "an"}`
                                    ) : (
                                      <span className="flex items-center gap-1 text-emerald-600">
                                        <Infinity className="h-3.5 w-3.5" />
                                        Illimité
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-auto pt-4">
                              <Button
                                variant={isCurrentPlan ? "outline" : "default"}
                                size="sm"
                                className="w-full"
                                disabled={isCurrentPlan || isChangingPlan || isLoadingSubscription}
                                onClick={() => handlePlanSelect(plan)}
                              >
                                {isCurrentPlan ? (
                                  <>
                                    <BadgeCheck className="mr-2 h-4 w-4" />
                                    Plan actuel
                                  </>
                                ) : (() => {
                                  const hasActivePaidSubscription = 
                                    subscription?.status === "active" && 
                                    subscription?.plan !== null;
                                  return hasActivePaidSubscription ? "Changer de plan" : "S'abonner";
                                })()}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {isLoadingPlans && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-64 w-full" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Dialog de prévisualisation du changement de plan */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer le changement de plan</DialogTitle>
            <DialogDescription>
              Prévisualisez les changements avant de confirmer
            </DialogDescription>
          </DialogHeader>
          
          {isPreviewing ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : previewData ? (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Plan actuel</p>
                    <p className="text-xs text-muted-foreground">{previewData.currentPlan.name}</p>
                    {parseFloat(previewData.currentPlan.price) === 0 ? (
                      <p className="text-xs font-semibold mt-1">Gratuit</p>
                    ) : (
                      <div className="mt-1">
                        <p className="text-xs font-semibold">
                          {new Intl.NumberFormat("fr-FR", {
                            style: "currency",
                            currency: previewData.currentPlan.currency || "EUR",
                          }).format(parseFloat(previewData.currentPlan.price))}
                        </p>
                        {previewData.currentPlan.billingInterval && (
                          <p className="text-xs text-muted-foreground">
                            / {previewData.currentPlan.billingInterval === "monthly" ? "mois" : "an"}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
                  <div className="flex-1 text-right">
                    <p className="text-sm font-medium">Nouveau plan</p>
                    <p className="text-xs text-muted-foreground">{previewData.newPlan.name}</p>
                    {parseFloat(previewData.newPlan.price) === 0 ? (
                      <p className="text-xs font-semibold mt-1 text-primary">Gratuit</p>
                    ) : (
                      <div className="mt-1">
                        <p className="text-xs font-semibold text-primary">
                          {new Intl.NumberFormat("fr-FR", {
                            style: "currency",
                            currency: previewData.newPlan.currency || "EUR",
                          }).format(parseFloat(previewData.newPlan.price))}
                        </p>
                        {previewData.newPlan.billingInterval && (
                          <p className="text-xs text-muted-foreground">
                            / {previewData.newPlan.billingInterval === "monthly" ? "mois" : "an"}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Message informatif pour changement de plan avec abonnement actif */}
                {subscription?.status === "active" && 
                 subscription?.plan?.code !== "free" && 
                 parseFloat(previewData.newPlan.price) > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Changement de plan avec prorata automatique</AlertTitle>
                    <AlertDescription>
                      Stripe calculera automatiquement le prorata. Vous serez crédité pour le temps restant de votre plan actuel et facturé pour le nouveau plan. Le changement prendra effet immédiatement.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Avertissement pour changement d'intervalle */}
                {previewData.prorationDetails?.intervalChange && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Changement d'intervalle de facturation</AlertTitle>
                    <AlertDescription>
                      Vous passez d'un plan {previewData.currentPlan.billingInterval === "monthly" ? "mensuel" : "annuel"} à un plan {previewData.newPlan.billingInterval === "monthly" ? "mensuel" : "annuel"}. 
                      La facturation future utilisera le nouvel intervalle.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Avertissement pour downgrade */}
                {previewData.prorationDetails?.isDowngrade && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Rétrogradation de plan</AlertTitle>
                    <AlertDescription>
                      Vous passez à un plan avec moins de fonctionnalités. Le crédit pour le temps non utilisé sera appliqué sur votre prochaine facture.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Prix du nouveau plan */}
                {parseFloat(previewData.newPlan.price) > 0 && (
                  <div className="p-3 rounded-md border border-primary/20 bg-primary/5">
                    <p className="text-xs text-muted-foreground mb-1">Prix du plan</p>
                    <p className="text-lg font-semibold text-primary">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: previewData.newPlan.currency || "EUR",
                      }).format(parseFloat(previewData.newPlan.price))}
                      / {previewData.newPlan.billingInterval === "monthly" ? "mois" : "an"}
                    </p>
                    {subscription?.status === "active" && 
                     subscription?.plan?.code !== "free" && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Le prorata sera calculé automatiquement par Stripe lors du changement.
                      </p>
                    )}
                  </div>
                )}

                {previewData.invoiceLimitChange && (
                  <div className="p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground mb-2">Changement de limite</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">
                        {previewData.invoiceLimitChange.current === null
                          ? "Illimité"
                          : `${previewData.invoiceLimitChange.current} factures/mois`}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">
                        {previewData.invoiceLimitChange.new === null
                          ? "Illimité"
                          : `${previewData.invoiceLimitChange.new} factures/mois`}
                      </span>
                    </div>
                  </div>
                )}

                {previewData.nextBillingDate && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Prochaine facturation :{" "}
                      {new Date(previewData.nextBillingDate).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Chargement de la prévisualisation...</p>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPreviewDialog(false)}
              disabled={isChangingPlan || isCreatingCheckout || isChangingPlanStripe}
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirmPlanChange}
              disabled={isPreviewing || isChangingPlan || isCreatingCheckout || isChangingPlanStripe || !selectedPlan}
            >
              {isChangingPlan || isCreatingCheckout || isChangingPlanStripe ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isChangingPlanStripe 
                    ? "Changement en cours..." 
                    : parseFloat(selectedPlan?.price || "0") > 0 
                      ? "Redirection vers le paiement..." 
                      : "Changement..."}
                </>
              ) : (
                (() => {
                  const planPrice = parseFloat(selectedPlan?.price || "0");
                  const hasActivePaidSubscription = 
                    subscription?.status === "active" && 
                    subscription?.plan !== null;
                  
                  if (planPrice === 0) {
                    return "Confirmer le changement";
                  } else if (hasActivePaidSubscription) {
                    return "Changer de plan";
                  } else {
                    return "S'abonner avec Stripe";
                  }
                })()
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation d'annulation */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler l'abonnement</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir annuler votre abonnement ?
            </DialogDescription>
          </DialogHeader>

          {subscription && (
            <div className="space-y-3">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-1">Important</p>
                  <p className="text-sm">
                    Votre abonnement restera actif jusqu'à la fin de la période en cours (
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString("fr-FR")}).
                    Après cette date, votre compte passera au plan gratuit avec ses limitations.
                  </p>
                </AlertDescription>
              </Alert>

              {subscription?.plan?.invoiceLimit && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Limite après annulation</p>
                  <p className="text-sm font-semibold">
                    Plan gratuit : {subscription.plan.invoiceLimit} factures par mois
                  </p>
                </div>
              )}
              {!subscription?.plan && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Limite après annulation</p>
                  <p className="text-sm font-semibold">
                    Plan gratuit : 10 factures par mois (limite par défaut)
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={isCanceling}
            >
              Conserver mon abonnement
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={isCanceling}
            >
              {isCanceling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Annulation...
                </>
              ) : (
                "Confirmer l'annulation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 space-y-6">
        <Breadcrumb
          items={[
            { label: "Tableau de bord", href: "/dashboard" },
            { label: "Paramètres", href: "/settings" },
          ]}
        />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
