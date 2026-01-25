"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from '@/i18n/routing';
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from 'next-intl';
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
  useGetWorkspaceQuery,
  useUpdateWorkspaceMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetSubscriptionQuery,
  useCreateSubscriptionMutation,
  useCancelSubscriptionMutation,
  useCreateCheckoutSessionMutation,
  useChangePlanMutation,
  useCreatePortalSessionMutation,
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
import { AlertCircle, CheckCircle2, Crown, Zap, Infinity, CreditCard, TrendingUp, BadgeCheck, Receipt, Globe, DollarSign, Percent, FileText, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditsPurchaseModal } from "@/components/billing/credits-purchase-modal";

type UserFormValues = {
  firstName: string;
  lastName: string;
  password?: string;
};

type WorkspaceFormValues = {
  name?: string | null;
  type?: 'INDIVIDUAL' | 'COMPANY';
  legalName?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  defaultCurrency: string;
};

type SettingsFormValues = {
  language: string;
  timezone: string;
  invoicePrefix: string;
  dateFormat: string;
  currency: string;
  paymentTerms: number;
};

function SettingsContent() {
  const t = useTranslations('settings');
  const commonT = useTranslations('common');
  const locale = useLocale();
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  
  // Sections avec traductions
  const sections = useMemo(() => [
    { value: "profile", label: t('tabs.profile') },
    { value: "workspace", label: t('tabs.workspace') },
    { value: "billing", label: t('tabs.billing') },
    { value: "subscription", label: t('tabs.subscription') },
  ], [t]);
  
  // Valider que le tab est dans la liste des sections valides
  const validTabs = useMemo(() => sections.map(s => s.value), [sections]);
  const defaultTab = tabParam && validTabs.includes(tabParam) ? tabParam : "profile";
  
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Créer les schémas de validation avec les traductions
  const userSchema = useMemo(() => z.object({
    firstName: z.string().min(2, t('profile.validation.firstNameMin')),
    lastName: z.string().min(2, t('profile.validation.lastNameMin')),
    password: z.string().min(8, t('profile.validation.passwordMin')).optional().or(z.literal("")),
  }), [t]);
  
  const workspaceSchema = useMemo(() => z.object({
    type: z.enum(['INDIVIDUAL', 'COMPANY'], {
      required_error: t('workspace.validation.typeRequired'),
    }),
    name: z.string().min(2, t('workspace.validation.nameMin')).nullable().optional(),
    legalName: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    postalCode: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    defaultCurrency: z.string().min(1, t('workspace.validation.currencyRequired')),
  }).refine((data) => {
    // Pour COMPANY, le name est recommandé mais pas obligatoire
    // Pour INDIVIDUAL, le name peut être null
    if (data.type === 'COMPANY' && !data.name) {
      return false; // On peut rendre le name optionnel même pour COMPANY
    }
    return true;
  }, {
    message: t('workspace.validation.nameRequiredForCompany'),
    path: ['name'],
  }), [t]);
  
  const settingsSchema = useMemo(() => z.object({
    language: z.string().min(1, t('billing.validation.languageRequired')),
    timezone: z.string().min(1, t('billing.validation.timezoneRequired')),
    invoicePrefix: z.string().min(1, t('billing.validation.invoicePrefixRequired')),
    dateFormat: z.string().min(1, t('billing.validation.dateFormatRequired')),
    currency: z.string().min(1, t('billing.validation.currencyRequired')),
    paymentTerms: z.number().min(0, t('billing.validation.paymentTermsPositive')),
  }), [t]);

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
  const { data: workspace, isLoading: isLoadingWorkspace } = useGetWorkspaceQuery();
  const { data: settings, isLoading: isLoadingSettings } = useGetSettingsQuery();
  const { data: subscription, isLoading: isLoadingSubscription, refetch: refetchSubscription } = useGetSubscriptionQuery();
  
  // Plans disponibles - définis localement (plus d'API GET /plans)
  const availablePlans = useMemo(() => {
    return [
      { plan: "pro" as const, interval: "month" as const },
      { plan: "pro" as const, interval: "year" as const },
      { plan: "enterprise" as const, interval: "month" as const },
      { plan: "enterprise" as const, interval: "year" as const },
    ];
  }, []);
  
  // Mutations
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [updateWorkspace, { isLoading: isUpdatingWorkspace }] = useUpdateWorkspaceMutation();
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
  const [isProcessingPlan, setIsProcessingPlan] = useState(false);
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
  
  // État de chargement combiné pour les boutons d'abonnement
  const isLoadingSubscriptionAction = isCreatingCheckout || isChangingPlanStripe || isProcessingPlan || isCreatingPortal;
  
  // Forms
  const userForm = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      password: "",
    },
  });
  
  const workspaceForm = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceSchema),
      defaultValues: {
      type: "COMPANY",
      name: "",
      legalName: "",
      addressLine1: "",
      addressLine2: "",
      postalCode: "",
      city: "",
      country: "",
      defaultCurrency: "XOF",
    },
  });
  
  const settingsForm = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      language: "fr",
      timezone: "Africa/Dakar",
      invoicePrefix: "FAC",
      dateFormat: "DD/MM/YYYY",
      currency: "XOF",
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
    if (workspace) {
      workspaceForm.reset({
        type: workspace.type || "COMPANY",
        name: workspace.name || "",
        legalName: workspace.legalName || "",
        addressLine1: workspace.addressLine1 || "",
        addressLine2: workspace.addressLine2 || "",
        postalCode: workspace.postalCode || "",
        city: workspace.city || "",
        country: workspace.country || "",
        defaultCurrency: workspace.defaultCurrency || "XOF",
      });
    }
  }, [workspace, workspaceForm]);
  
  // Récupérer le type actuel du workspace pour l'affichage conditionnel
  const workspaceType = workspaceForm.watch("type");
  
  useEffect(() => {
    if (settings) {
      settingsForm.reset({
        language: settings.language,
        timezone: settings.timezone,
        invoicePrefix: settings.invoicePrefix,
        dateFormat: settings.dateFormat,
        currency: settings.currency,
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
      
      toast.success(t('profile.success.updated'), {
        description: t('profile.success.updatedDescription'),
      });
      userForm.reset({ ...values, password: "" });
    } catch (error) {
      const errorMessage = error && typeof error === "object" && "data" in error
        ? (error.data as { message?: string })?.message ?? t('profile.errors.updateError')
        : t('profile.errors.genericError');
      
      toast.error(commonT('error'), {
        description: errorMessage,
      });
    }
  };
  
  const onWorkspaceSubmit = async (values: WorkspaceFormValues) => {
    try {
      await updateWorkspace({
        type: values.type,
        name: values.name || (values.type === 'INDIVIDUAL' ? null : undefined),
        legalName: values.legalName || undefined,
        addressLine1: values.addressLine1 || undefined,
        addressLine2: values.addressLine2 || undefined,
        postalCode: values.postalCode || undefined,
        city: values.city || undefined,
        country: values.country || undefined,
        defaultCurrency: values.defaultCurrency || undefined,
      }).unwrap();
      
      toast.success(t('workspace.success.updated'), {
        description: t('workspace.success.updatedDescription'),
      });
    } catch (error) {
      const errorMessage = error && typeof error === "object" && "data" in error
        ? (error.data as { message?: string })?.message ?? t('workspace.errors.updateError')
        : t('workspace.errors.genericError');
      
      toast.error(commonT('error'), {
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
        paymentTerms: values.paymentTerms,
      }).unwrap();
      
      toast.success(t('billing.success.updated'), {
        description: t('billing.success.updatedDescription'),
      });
    } catch (error) {
      const errorMessage = error && typeof error === "object" && "data" in error
        ? (error.data as { message?: string })?.message ?? t('billing.errors.updateError')
        : t('billing.errors.genericError');
      
      toast.error(commonT('error'), {
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

    // Vérifier que le plan est disponible
    const isPlanAvailable = availablePlans.some(item => item.plan === plan && item.interval === interval);
    if (!isPlanAvailable) {
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
    if (!selectedPlan || isLoadingSubscriptionAction) return;

    setIsProcessingPlan(true);
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
      setIsProcessingPlan(false);
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
          setIsProcessingPlan(false);
          startPollingSubscription();
        } catch (retryError: any) {
          setIsProcessingPlan(false);
          toast.error("Erreur", {
            description: retryError?.data?.message || "Impossible de changer de plan",
          });
        }
      } else if (errorMessage.includes("Aucun abonnement actif")) {
        setIsProcessingPlan(false);
        toast.error("Aucun abonnement", {
          description: "Vous n'avez pas d'abonnement actif. Utilisez 'S'abonner' pour créer un nouvel abonnement.",
        });
      } else {
        setIsProcessingPlan(false);
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
          const planNames: Record<"free" | "pro" | "enterprise" | "pay_as_you_go", string> = {
            free: t('subscription.plans.free'),
            pro: t('subscription.plans.pro'),
            enterprise: t('subscription.plans.enterprise'),
            pay_as_you_go: t('subscription.plans.pay_as_you_go', { defaultValue: 'Pay-as-you-go' })
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
  
  // Construire les plans à afficher
  const plans = useMemo(() => {
    const planNames: Record<"free" | "pro" | "enterprise", string> = {
      free: t('subscription.plans.free'),
      pro: t('subscription.plans.pro'),
      enterprise: t('subscription.plans.enterprise')
    };
    
    const planPrices: Record<string, Record<"month" | "year", string>> = {
      pro: { month: "5", year: "48" },
      enterprise: { month: "20", year: "192" }
    };
    
    return availablePlans.map(item => ({
      plan: item.plan,
      interval: item.interval,
      name: planNames[item.plan],
      price: planPrices[item.plan]?.[item.interval] || "0",
    }));
  }, [availablePlans]);
  const isLoading = isLoadingUser || isLoadingWorkspace || isLoadingSettings;
  
  return (
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { label: t('breadcrumb.dashboard'), href: "/dashboard" },
          { label: t('breadcrumb.settings') },
        ]}
        className="text-xs"
      />
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight text-primary">{t('title')}</h1>
        <p className="text-sm text-foreground/70">
          {t('subtitle')}
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
                <CardTitle className="text-primary">{t('profile.title')}</CardTitle>
                <CardDescription>
                  {t('profile.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        {t('profile.fields.firstName')} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        placeholder={t('profile.fields.firstName')}
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
                        {t('profile.fields.lastName')} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        placeholder={t('profile.fields.lastName')}
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
                      <Label htmlFor="email">{t('profile.fields.email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-foreground/60">
                        {t('profile.fields.emailCannotBeChanged')}
                      </p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="password">{t('profile.fields.password')}</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder={t('profile.fields.passwordPlaceholder')}
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
                        {t('profile.fields.passwordHint')}
                      </p>
                    </div>
                  </div>
                  <Button type="submit" disabled={isUpdatingUser}>
                    {isUpdatingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('profile.buttons.update')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Entreprise */}
          <TabsContent value="workspace">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">{t('workspace.title')}</CardTitle>
                <CardDescription>
                  {t('workspace.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={workspaceForm.handleSubmit(onWorkspaceSubmit)} className="space-y-4">
                  {/* Sélecteur de type */}
                  <div className="space-y-2">
                    <Label htmlFor="workspace-type">
                      {t('workspace.fields.type')} <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      name="type"
                      control={workspaceForm.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} disabled={isUpdatingWorkspace}>
                          <SelectTrigger className={workspaceForm.formState.errors.type ? "border-destructive" : ""}>
                            <SelectValue placeholder={t('workspace.fields.typePlaceholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INDIVIDUAL">{t('workspace.fields.typeIndividual')}</SelectItem>
                            <SelectItem value="COMPANY">{t('workspace.fields.typeCompany')}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {workspaceForm.formState.errors.type && (
                      <p className="text-xs text-destructive">
                        {workspaceForm.formState.errors.type.message}
                      </p>
                    )}
                    <p className="text-xs text-foreground/60">
                      {workspaceType === 'INDIVIDUAL' 
                        ? t('workspace.fields.typeIndividualHint')
                        : t('workspace.fields.typeCompanyHint')}
                    </p>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Le champ name est optionnel pour INDIVIDUAL */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="workspace-name">
                        {t('workspace.fields.name')} 
                        {workspaceType === 'COMPANY' && <span className="text-destructive">*</span>}
                        {workspaceType === 'INDIVIDUAL' && (
                          <span className="text-xs text-foreground/60 ml-2">
                            ({t('workspace.fields.nameOptional')})
                          </span>
                        )}
                      </Label>
                      <Input
                        id="workspace-name"
                        placeholder={workspaceType === 'INDIVIDUAL' 
                          ? t('workspace.fields.namePlaceholderIndividual')
                          : t('workspace.fields.namePlaceholder')}
                        {...workspaceForm.register("name")}
                        disabled={isUpdatingWorkspace}
                        className={workspaceForm.formState.errors.name ? "border-destructive" : ""}
                      />
                      {workspaceForm.formState.errors.name && (
                        <p className="text-xs text-destructive">
                          {workspaceForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="legal-name">{t('workspace.fields.legalName')}</Label>
                      <Input
                        id="legal-name"
                        placeholder={t('workspace.fields.legalName')}
                        {...workspaceForm.register("legalName")}
                        disabled={isUpdatingWorkspace}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="default-currency">
                        {t('workspace.fields.defaultCurrency')} <span className="text-destructive">*</span>
                      </Label>
                      <Controller
                        name="defaultCurrency"
                        control={workspaceForm.control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value} disabled={isUpdatingWorkspace}>
                            <SelectTrigger className={workspaceForm.formState.errors.defaultCurrency ? "border-destructive" : ""}>
                              <SelectValue placeholder={t('workspace.fields.defaultCurrency')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EUR">EUR (€)</SelectItem>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="XOF">XOF (CFA)</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {workspaceForm.formState.errors.defaultCurrency && (
                        <p className="text-xs text-destructive">
                          {workspaceForm.formState.errors.defaultCurrency.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address-line1">{t('workspace.fields.addressLine1')}</Label>
                      <Input
                        id="address-line1"
                        placeholder={t('workspace.fields.addressLine1')}
                        {...workspaceForm.register("addressLine1")}
                        disabled={isUpdatingWorkspace}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address-line2">{t('workspace.fields.addressLine2')}</Label>
                      <Input
                        id="address-line2"
                        placeholder={t('workspace.fields.addressLine2')}
                        {...workspaceForm.register("addressLine2")}
                        disabled={isUpdatingWorkspace}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal-code">{t('workspace.fields.postalCode')}</Label>
                      <Input
                        id="postal-code"
                        placeholder={t('workspace.fields.postalCode')}
                        {...workspaceForm.register("postalCode")}
                        disabled={isUpdatingWorkspace}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">{t('workspace.fields.city')}</Label>
                      <Input
                        id="city"
                        placeholder={t('workspace.fields.city')}
                        {...workspaceForm.register("city")}
                        disabled={isUpdatingWorkspace}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country" className="flex items-center gap-2">
                        {t('workspace.fields.country')} <span className="text-muted-foreground text-xs">(optionnel)</span>
                      </Label>
                      <Controller
                        name="country"
                        control={workspaceForm.control}
                        render={({ field }) => (
                          <Select 
                            onValueChange={(value) => field.onChange(value === 'none' ? null : value)} 
                            value={field.value || 'none'} 
                            disabled={isUpdatingWorkspace}
                          >
                            <SelectTrigger className={workspaceForm.formState.errors.country ? "border-destructive" : ""}>
                              <SelectValue placeholder={t('workspace.fields.countryPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">{t('workspace.fields.countryNotSpecified')}</SelectItem>
                              <SelectItem value="SN">🇸🇳 Sénégal</SelectItem>
                              <SelectItem value="CI">🇨🇮 Côte d'Ivoire</SelectItem>
                              <SelectItem value="ML">🇲🇱 Mali</SelectItem>
                              <SelectItem value="BF">🇧🇫 Burkina Faso</SelectItem>
                              <SelectItem value="BJ">🇧🇯 Bénin</SelectItem>
                              <SelectItem value="TG">🇹🇬 Togo</SelectItem>
                              <SelectItem value="NE">🇳🇪 Niger</SelectItem>
                              <SelectItem value="GN">🇬🇳 Guinée</SelectItem>
                              <SelectItem value="GH">🇬🇭 Ghana</SelectItem>
                              <SelectItem value="NG">🇳🇬 Nigeria</SelectItem>
                              <SelectItem value="CM">🇨🇲 Cameroun</SelectItem>
                              <SelectItem value="GA">🇬🇦 Gabon</SelectItem>
                              <SelectItem value="TD">🇹🇩 Tchad</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <p className="text-xs text-muted-foreground">
                        {t('workspace.fields.countryHint')}
                      </p>
                      {workspaceForm.formState.errors.country && (
                        <p className="text-xs text-destructive">
                          {workspaceForm.formState.errors.country.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button type="submit" disabled={isUpdatingWorkspace}>
                    {isUpdatingWorkspace && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('workspace.buttons.update')}
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
                    {t('billing.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('billing.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
                    

                    {/* Section Format */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                        <FileText className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-semibold text-primary">{t('billing.sections.format')}</h3>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="invoice-prefix" className="flex items-center gap-2">
                            {t('billing.fields.invoicePrefix')} <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="invoice-prefix"
                            placeholder="FAC"
                            {...settingsForm.register("invoicePrefix")}
                            disabled={isUpdatingSettings}
                            className={settingsForm.formState.errors.invoicePrefix ? "border-destructive" : ""}
                          />
                          <p className="text-xs text-muted-foreground">
                            {t('billing.fields.invoicePrefixExample')}
                          </p>
                          {settingsForm.formState.errors.invoicePrefix && (
                            <p className="text-xs text-destructive">
                              {settingsForm.formState.errors.invoicePrefix.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="date-format" className="flex items-center gap-2">
                            {t('billing.fields.dateFormat')} <span className="text-destructive">*</span>
                          </Label>
                          <Controller
                            name="dateFormat"
                            control={settingsForm.control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value} disabled={isUpdatingSettings}>
                                <SelectTrigger className={settingsForm.formState.errors.dateFormat ? "border-destructive" : ""}>
                                  <SelectValue placeholder={t('billing.fields.dateFormat')} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2026)</SelectItem>
                                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2026-12-31)</SelectItem>
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
                        <h3 className="text-sm font-semibold text-primary">{t('billing.sections.financial')}</h3>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="currency" className="flex items-center gap-2">
                            {t('billing.fields.currency')} <span className="text-destructive">*</span>
                          </Label>
                          <Controller
                            name="currency"
                            control={settingsForm.control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value} disabled={isUpdatingSettings}>
                                <SelectTrigger className={settingsForm.formState.errors.currency ? "border-destructive" : ""}>
                                  <SelectValue placeholder={t('billing.fields.currency')} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="XOF">XOF (CFA) - Franc CFA (Afrique de l'Ouest)</SelectItem>
                                  <SelectItem value="XAF">XAF (CFA) - Franc CFA (Afrique Centrale)</SelectItem>
                                  <SelectItem value="NGN">NGN (₦) - Naira nigérian</SelectItem>
                                  <SelectItem value="GHS">GHS (₵) - Cedi ghanéen</SelectItem>
                                  <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                                  <SelectItem value="USD">USD ($) - Dollar américain</SelectItem>
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
                          <Label htmlFor="payment-terms" className="flex items-center gap-2">
                            {t('billing.fields.paymentTerms')} <span className="text-destructive">*</span>
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
                            {t('billing.fields.paymentTermsHint')}
                          </p>
                          {settingsForm.formState.errors.paymentTerms && (
                            <p className="text-xs text-destructive">
                              {settingsForm.formState.errors.paymentTerms.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="rounded-md bg-primary/5 border border-primary/20 p-3">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-muted-foreground">
                            <p className="font-medium text-primary mb-1">{t('billing.fields.taxRateInfo.title')}</p>
                            <p>{t('billing.fields.taxRateInfo.description')}</p>
                          </div>
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
                              <p className="text-sm font-semibold text-primary">{t('billing.sequence.title')}</p>
                              <p className="text-xs text-muted-foreground">{t('billing.sequence.subtitle')}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">{t('billing.sequence.current')}</p>
                              <p className="text-3xl font-bold text-primary mt-3">{settings?.invoiceSequence ?? 0}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground mb-1">{t('billing.sequence.next')}</p>
                              <p className="text-lg font-semibold text-primary">
                                {settings?.invoicePrefix ?? "FAC"}-{new Date().getFullYear()}-{(settings?.invoiceSequence ?? 0).toString().padStart(3, "0")}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-primary/20">
                            {t('billing.sequence.description')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                      <Button type="submit" disabled={isUpdatingSettings} size="lg">
                        {isUpdatingSettings ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('billing.buttons.saving')}
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {t('billing.buttons.save')}
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
                const planNames: Record<"free" | "pro" | "enterprise" | "pay_as_you_go", string> = {
                  free: t('subscription.plans.free'),
                  pro: t('subscription.plans.pro'),
                  enterprise: t('subscription.plans.enterprise'),
                  pay_as_you_go: t('subscription.plans.pay_as_you_go', { defaultValue: 'Pay-as-you-go' })
                };
                const planPrices: Record<"pro" | "enterprise", Record<"month" | "year", string>> = {
                  pro: { month: "5", year: "48" },
                  enterprise: { month: "20", year: "192" }
                };
                const currentPlanName = planNames[subscription.plan] || subscription.plan;
                const currentPrice = subscription.plan === "free" || subscription.plan === "pay_as_you_go"
                  ? subscription.plan === "free" ? "0,00 €" : "À la carte"
                  : subscription.interval && planPrices[subscription.plan]?.[subscription.interval] 
                    ? `${planPrices[subscription.plan][subscription.interval]} €` 
                    : "N/A";
                
                return (
                  <Card className="border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-primary flex items-center gap-2">
                        <BadgeCheck className="h-5 w-5" />
                        {t('subscription.currentPlan.title')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-semibold">{currentPlanName}</p>
                          <p className="text-sm text-muted-foreground">
                            {subscription.plan === "free" 
                              ? t('subscription.currentPlan.free')
                              : subscription.plan === "pay_as_you_go"
                              ? "Pay-as-you-go"
                              : subscription.interval === "month" 
                                ? t('subscription.currentPlan.monthly')
                                : subscription.interval === "year"
                                ? t('subscription.currentPlan.yearly')
                                : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-primary">{currentPrice}</p>
                          <p className="text-xs text-muted-foreground">
                            {subscription.plan === "free" || subscription.plan === "pay_as_you_go"
                              ? "" 
                              : subscription.interval === "month" 
                                ? t('subscription.currentPlan.perMonth')
                                : subscription.interval === "year"
                                ? t('subscription.currentPlan.perYear')
                                : ""}
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

              {/* PHASE 4 : Achat de crédits (Pay-as-you-go) */}
              {(subscription?.plan === "free" || subscription?.plan === "pay_as_you_go") && (
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-primary flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      {t('subscription.credits.title')}
                    </CardTitle>
                    <CardDescription>
                      {t('subscription.credits.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {subscription.plan === "pay_as_you_go" && (
                      <div className="rounded-lg bg-muted p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {t('subscription.credits.available')}
                            </p>
                            <p className="text-2xl font-bold text-primary">
                              {(subscription as any).credits || 0}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {t('subscription.credits.totalSent')}
                            </p>
                            <p className="text-lg font-semibold">
                              {(subscription as any).totalInvoicesSent || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <Button
                      onClick={() => setIsCreditsModalOpen(true)}
                      className="w-full"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      {t('subscription.credits.cta')}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Plans disponibles */}
              {plans.length > 0 && (
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-primary flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      {t('subscription.availablePlans.title')}
                    </CardTitle>
                    <CardDescription>
                      {t('subscription.availablePlans.description')}
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
                          {t('subscription.availablePlans.monthly')}
                        </button>
                        <button
                          onClick={() => setBillingInterval("year")}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-all relative ${
                            billingInterval === "year"
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {t('subscription.availablePlans.yearly')}
                          {billingInterval === "year" && (
                            <span className="absolute -top-1.5 -right-1.5 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              {t('subscription.availablePlans.save20')}
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
                          name: t('subscription.plans.free'),
                          price: "0.00",
                          currency: "EUR",
                          billingInterval: "monthly" as const,
                          invoiceLimit: subscription?.invoiceLimit?.effective || 10,
                          description: t('subscription.currentPlan.free'),
                          metadata: {
                            features: t.raw('subscription.features.free')
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
                                  {t('subscription.availablePlans.current')}
                                </span>
                              </div>
                            )}

                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-bold text-primary">{freePlan.name}</h3>
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                  {t('subscription.availablePlans.free')}
                                </span>
                              </div>
                              
                              <div className="mb-3">
                                <div className="flex items-baseline gap-1">
                                  <span className="text-3xl font-bold text-primary">
                                    {t('subscription.availablePlans.free')}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 italic">
                                  {t('subscription.availablePlans.sameMonthlyYearly')}
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
                                  <span className="text-xs text-muted-foreground">{t('subscription.availablePlans.limit')}</span>
                                  <span className="text-xs font-semibold">
                                    {freePlan.invoiceLimit ? `${freePlan.invoiceLimit} ${t('subscription.availablePlans.invoicesPerMonth')}` : t('subscription.availablePlans.unlimited')}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-auto pt-4">
                              <Button
                                variant={isCurrentPlan ? "outline" : "default"}
                                size="sm"
                                className="w-full"
                                disabled={isCurrentPlan || isLoadingSubscriptionAction || isLoadingSubscription}
                                onClick={() => {
                                  if (!isCurrentPlan && !isLoadingSubscriptionAction) {
                                    // Créer un plan virtuel pour le plan gratuit
                                    // Plan gratuit - pas de souscription via Stripe
                                    toast.info(t('subscription.availablePlans.backToFree'), {
                                      description: t('subscription.availablePlans.backToFreeInfo'),
                                    });
                                  }
                                }}
                              >
                                {isCurrentPlan ? (
                                  <>
                                    <BadgeCheck className="mr-2 h-4 w-4" />
                                    {t('subscription.availablePlans.current')}
                                  </>
                                ) : (
                                  t('subscription.availablePlans.backToFree')
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
                        
                        // Déterminer les limites de factures selon le plan
                        const invoiceLimits: Record<"free" | "pro" | "enterprise", number | null> = {
                          free: subscription?.invoiceLimit?.effective || 10,
                          pro: 100,
                          enterprise: null // Illimité
                        };
                        const invoiceLimit = invoiceLimits[planItem.plan];
                        
                        // Features par plan (alignées avec la landing page)
                        const planFeatures: Record<"free" | "pro" | "enterprise", string[]> = {
                          free: t.raw('subscription.features.free'),
                          pro: t.raw('subscription.features.pro'),
                          enterprise: t.raw('subscription.features.enterprise')
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
                                  {t('subscription.availablePlans.current')}
                                </span>
                              </div>
                            )}

                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-bold text-primary">{planItem.name}</h3>
                                <Crown className="h-5 w-5 text-primary/60" />
                              </div>
                              
                              <div className="mb-3">
                                <div className="flex items-baseline gap-1">
                                  <span className="text-3xl font-bold text-primary">
                                    {planItem.price === "0" ? t('subscription.availablePlans.free') : `${planItem.price} €`}
                                  </span>
                                  {planItem.price !== "0" && (
                                    <span className="text-sm text-muted-foreground">
                                      /{planItem.interval === "month" ? t('subscription.currentPlan.perMonth').replace('/', '').trim() : t('subscription.currentPlan.perYear').replace('/', '').trim()}
                                    </span>
                                  )}
                                </div>
                                {planItem.price !== "0" && planItem.interval === "year" && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                      {t('subscription.availablePlans.save20')}
                                    </span>
                                  </div>
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
                                  <span className="text-xs text-muted-foreground">{t('subscription.availablePlans.limit')}</span>
                                  <span className="text-xs font-semibold">
                                    {invoiceLimit ? (
                                      `${invoiceLimit} ${planItem.interval === "month" ? t('subscription.availablePlans.invoicesPerMonth') : t('subscription.availablePlans.invoicesPerYear')}`
                                    ) : (
                                      <span className="flex items-center gap-1 text-emerald-600">
                                        <Infinity className="h-3.5 w-3.5" />
                                        {t('subscription.availablePlans.unlimited')}
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
                                disabled={isCurrentPlan || isLoadingSubscriptionAction || isLoadingSubscription}
                                onClick={() => {
                                  if (isLoadingSubscriptionAction) return;
                                  setSelectedPlan({ plan: planItem.plan, interval: planItem.interval });
                                  handleConfirmPlanChange();
                                }}
                              >
                                {isCurrentPlan ? (
                                  <>
                                    <BadgeCheck className="mr-2 h-4 w-4" />
                                    {t('subscription.availablePlans.current')}
                                  </>
                                ) : isLoadingSubscriptionAction ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('subscription.availablePlans.processing')}
                                  </>
                                ) : (() => {
                                  const hasActivePaidSubscription = 
                                    subscription?.status === "active" && 
                                    subscription?.plan !== "free";
                                  return hasActivePaidSubscription ? t('subscription.availablePlans.changePlan') : t('subscription.availablePlans.subscribe');
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

            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Dialog de preview supprimé - plus nécessaire selon la nouvelle doc */}

      {/* Dialog de confirmation d'annulation */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('subscription.cancelDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('subscription.cancelDialog.description')}
            </DialogDescription>
          </DialogHeader>

          {subscription && (
            <div className="space-y-3">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-1">{t('subscription.cancelDialog.important')}</p>
                  <p className="text-sm">
                    {t('subscription.cancelDialog.activeUntil', { 
                      date: new Date(subscription.currentPeriodEnd).toLocaleDateString(locale === 'fr' ? "fr-FR" : "en-US")
                    })}
                  </p>
                </AlertDescription>
              </Alert>

              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">{t('subscription.cancelDialog.limitAfterCancel')}</p>
                <p className="text-sm font-semibold">
                  {t('subscription.cancelDialog.freePlanLimit', { count: subscription?.invoiceLimit?.effective || 10 })}
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
              {t('subscription.cancelDialog.keep')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={isCanceling}
            >
              {isCanceling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('subscription.cancelDialog.canceling')}
                </>
              ) : (
                t('subscription.cancelDialog.confirm')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PHASE 4 : Modal d'achat de crédits */}
      <CreditsPurchaseModal
        open={isCreditsModalOpen}
        onOpenChange={setIsCreditsModalOpen}
      />
    </div>
  );
}

export default function SettingsPage() {
  const t = useTranslations('settings');
  
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 space-y-6">
        <Breadcrumb
          items={[
            { label: t('breadcrumb.dashboard'), href: "/dashboard" },
            { label: t('breadcrumb.settings'), href: "/settings" },
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
