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
  useCancelSubscriptionMutation,
  useCreateCheckoutSessionMutation,
  useChangePlanMutation,
  useCreatePortalSessionMutation,
  PlanCatalogItem,
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
  const [cancelSubscription, { isLoading: isCanceling }] = useCancelSubscriptionMutation();
  const [createCheckoutSession, { isLoading: isCreatingCheckout }] = useCreateCheckoutSessionMutation();
  const [changePlan, { isLoading: isChangingPlanStripe }] = useChangePlanMutation();
  const [createPortalSession, { isLoading: isCreatingPortal }] = useCreatePortalSessionMutation();
  
  // États pour la gestion des abonnements
  const [selectedPlan, setSelectedPlan] = useState<{ plan: "free" | "pro" | "enterprise"; interval: "month" | "year" } | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  
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
  async function handlePlanSelect(plan: "free" | "pro" | "enterprise", interval: "month" | "year") {
    if (!subscription) return;

    // Si c'est le même plan et intervalle, ne rien faire
    if (subscription.plan === plan && subscription.interval === interval) {
      return;
    }

    // Pour le plan gratuit, on ne peut pas souscrire via Stripe
    if (plan === "free") {
      toast.info("Revenir au plan gratuit", {
        description: "Pour revenir au plan gratuit, vous devez annuler votre abonnement actif via le portail Stripe.",
      });
      return;
    }

    // Vérifier que le plan est disponible (stripePriceId !== null)
    const catalogItem = plansCatalog.find(item => item.plan === plan && item.interval === interval);
    if (!catalogItem || !catalogItem.stripePriceId) {
      toast.error("Plan non disponible", {
        description: "Ce plan n'est pas configuré pour le moment.",
      });
      return;
    }

    setSelectedPlan({ plan, interval });
    
    // Pas de preview selon la nouvelle doc, on passe directement à la confirmation
    // Mais on peut afficher un message informatif
    toast.info("Confirmation requise", {
      description: "Vous allez être redirigé vers Stripe pour finaliser votre abonnement.",
    });
  }

  async function handleConfirmPlanChange() {
    if (!selectedPlan) return;

    try {
      // Vérifier si l'utilisateur a déjà un abonnement Stripe actif
      const hasActivePaidSubscription = 
        subscription?.status === "active" && 
        subscription?.plan !== "free";

      if (hasActivePaidSubscription) {
        // Utilisateur a déjà un abonnement payant actif : utiliser change-plan
        const result = await changePlan({ 
          plan: selectedPlan.plan, 
          interval: selectedPlan.interval 
        }).unwrap();
        toast.success("Changement de plan en cours", {
          description: "Stripe va créer une facture avec le prorata.",
        });
        setSelectedPlan(null);
        
        // Polling pour vérifier la mise à jour
        startPollingSubscription();
      } else {
        // Nouvel abonnement : utiliser Stripe Checkout
        const { url } = await createCheckoutSession({ 
          plan: selectedPlan.plan, 
          interval: selectedPlan.interval 
        }).unwrap();
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
          const result = await changePlan({ 
            plan: selectedPlan.plan, 
            interval: selectedPlan.interval 
          }).unwrap();
          toast.success("Changement de plan en cours", {
            description: "Stripe va créer une facture avec le prorata.",
          });
          setSelectedPlan(null);
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
    }
  }

  // Fonction de polling pour vérifier la mise à jour de l'abonnement
  function startPollingSubscription() {
    if (!selectedPlan) return;
    
    let attempts = 0;
    const maxAttempts = 5;
    const pollInterval = 2000; // 2 secondes
    const targetPlan = selectedPlan.plan;
    const targetInterval = selectedPlan.interval;

    const poll = setInterval(async () => {
      attempts++;
      try {
        // Refetch de l'abonnement
        const result = await refetchSubscription();
        const currentSubscription = result.data;
        
        // Vérifier si le plan a changé
        if (currentSubscription?.plan === targetPlan && currentSubscription?.interval === targetInterval) {
          clearInterval(poll);
          const planNames: Record<"free" | "pro" | "enterprise", string> = {
            free: "Gratuit",
            pro: "Pro",
            enterprise: "Enterprise"
          };
          toast.success("Plan mis à jour", {
            description: `Vous êtes maintenant sur le plan ${planNames[targetPlan]}`,
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
  
  const plansCatalog = plansResponse ?? [];
  
  // Construire les plans à afficher à partir du catalogue
  const plans = useMemo(() => {
    const planNames: Record<"free" | "pro" | "enterprise", string> = {
      free: "Gratuit",
      pro: "Pro",
      enterprise: "Enterprise"
    };
    
    const planPrices: Record<string, Record<"month" | "year", string>> = {
      pro: { month: "29", year: "24" },
      enterprise: { month: "99", year: "79" }
    };
    
    return plansCatalog
      .filter(item => item.stripePriceId !== null) // Filtrer les plans non configurés
      .map(item => ({
        plan: item.plan,
        interval: item.interval,
        name: planNames[item.plan],
        price: item.plan === "free" ? "0" : planPrices[item.plan]?.[item.interval] || "0",
        stripePriceId: item.stripePriceId,
      }));
  }, [plansCatalog]);
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
              {subscription && (() => {
                const planNames: Record<"free" | "pro" | "enterprise", string> = {
                  free: "Gratuit",
                  pro: "Pro",
                  enterprise: "Enterprise"
                };
                const planPrices: Record<"pro" | "enterprise", Record<"month" | "year", string>> = {
                  pro: { month: "29", year: "24" },
                  enterprise: { month: "99", year: "79" }
                };
                const currentPlanName = planNames[subscription.plan];
                const currentPrice = subscription.plan === "free" 
                  ? "0,00 €" 
                  : planPrices[subscription.plan]?.[subscription.interval] 
                    ? `${planPrices[subscription.plan][subscription.interval]} €` 
                    : "N/A";
                
                return (
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
                          <p className="text-lg font-semibold">{currentPlanName}</p>
                          <p className="text-sm text-muted-foreground">
                            {subscription.plan === "free" 
                              ? "Plan gratuit avec limite de factures" 
                              : subscription.interval === "month" 
                                ? "Facturation mensuelle" 
                                : "Facturation annuelle"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-primary">{currentPrice}</p>
                          <p className="text-xs text-muted-foreground">
                            {subscription.plan === "free" 
                              ? "" 
                              : subscription.interval === "month" 
                                ? "/ mois" 
                                : "/ an"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Limite de factures */}
              {subscription?.invoiceLimit && (
                <InvoiceLimitCard 
                  invoiceLimit={subscription.invoiceLimit} 
                  showUpgradeButton={true}
                  planCode={subscription.plan === "free" ? "free" : subscription.plan}
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
                          onClick={() => setBillingInterval("month")}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            billingInterval === "month"
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Mensuel
                        </button>
                        <button
                          onClick={() => setBillingInterval("year")}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-all relative ${
                            billingInterval === "year"
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Annuel
                          {billingInterval === "year" && (
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
                        const isCurrentPlan = subscription?.plan === "free"; // Plan actuel si plan === "free"
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
                                    // Plan gratuit - pas de souscription via Stripe
                                    toast.info("Revenir au plan gratuit", {
                                      description: "Pour revenir au plan gratuit, vous devez annuler votre abonnement actif via le portail Stripe.",
                                    });
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
                        .filter((planItem) => {
                          // Filtrer par intervalle de facturation
                          return planItem.interval === billingInterval;
                        })
                        .map((planItem) => {
                        // Vérifier si c'est le plan actuel
                        const isCurrentPlan = subscription?.plan === planItem.plan && 
                                             subscription?.interval === planItem.interval;
                        const isFreePlan = planItem.plan === "free";
                        
                        // Déterminer les limites de factures selon le plan
                        const invoiceLimits: Record<"free" | "pro" | "enterprise", number | null> = {
                          free: subscription?.invoiceLimit?.effective || 10,
                          pro: 100,
                          enterprise: null // Illimité
                        };
                        const invoiceLimit = invoiceLimits[planItem.plan];
                        
                        // Features par plan
                        const planFeatures: Record<"free" | "pro" | "enterprise", string[]> = {
                          free: [
                            `${invoiceLimit} factures par mois`,
                            "Génération de PDF",
                            "Support par email"
                          ],
                          pro: [
                            "100 factures par mois",
                            "Génération de PDF",
                            "Support prioritaire",
                            "Statistiques avancées"
                          ],
                          enterprise: [
                            "Factures illimitées",
                            "Génération de PDF",
                            "Support dédié",
                            "Statistiques avancées",
                            "API personnalisée"
                          ]
                        };
                        
                        return (
                          <div
                            key={`${planItem.plan}-${planItem.interval}`}
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
                                <h3 className="text-lg font-bold text-primary">{planItem.name}</h3>
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
                                    {planItem.price === "0" ? "Gratuit" : `${planItem.price} €`}
                                  </span>
                                  {planItem.price !== "0" && (
                                    <span className="text-sm text-muted-foreground">
                                      /{planItem.interval === "month" ? "mois" : "an"}
                                    </span>
                                  )}
                                </div>
                                {planItem.price !== "0" && planItem.interval === "year" && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                      Économisez 20%
                                    </span>
                                  </div>
                                )}
                                {isFreePlan && (
                                  <p className="text-xs text-muted-foreground mt-1 italic">
                                    Identique en mensuel et annuel
                                  </p>
                                )}
                              </div>

                              <ul className="space-y-2 mb-4">
                                {planFeatures[planItem.plan].map((feature: string, index: number) => (
                                  <li key={index} className="flex items-start gap-2 text-xs">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-foreground/80">{feature}</span>
                                  </li>
                                ))}
                              </ul>

                              <div className="mt-4 pt-4 border-t border-border/50">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-xs text-muted-foreground">Limite</span>
                                  <span className="text-xs font-semibold">
                                    {invoiceLimit ? (
                                      `${invoiceLimit} factures/${planItem.interval === "month" ? "mois" : "an"}`
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
                                onClick={() => {
                                  setSelectedPlan({ plan: planItem.plan, interval: planItem.interval });
                                  handleConfirmPlanChange();
                                }}
                              >
                                {isCurrentPlan ? (
                                  <>
                                    <BadgeCheck className="mr-2 h-4 w-4" />
                                    Plan actuel
                                  </>
                                ) : (() => {
                                  const hasActivePaidSubscription = 
                                    subscription?.status === "active" && 
                                    subscription?.plan !== "free";
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

      {/* Dialog de preview supprimé - plus nécessaire selon la nouvelle doc */}

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

              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Limite après annulation</p>
                <p className="text-sm font-semibold">
                  Plan gratuit : {subscription?.invoiceLimit?.effective || 10} factures par mois
                </p>
              </div>
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
