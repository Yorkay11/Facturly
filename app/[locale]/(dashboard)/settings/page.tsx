"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useRouter } from '@/i18n/routing';
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from 'next-intl';
import { DirectionAwareTabs } from "@/components/ui/direction-aware-tabs";
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
} from "@/services/facturlyApi";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Receipt, DollarSign, FileText } from "lucide-react";

// Drapeaux des pays (même source que l'onboarding)
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

const SETTINGS_COUNTRIES: { value: string; label: string }[] = [
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

type UserFormValues = {
  firstName: string;
  lastName: string;
  password?: string;
};

type WorkspaceFormValues = {
  name?: string | null;
  type?: 'FREELANCE' | 'INDIVIDUAL' | 'COMPANY';
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
  ], [t]);
  
  // Valider que le tab est dans la liste des sections valides
  const validTabs = useMemo(() => sections.map(s => s.value), [sections]);
  const defaultTab = tabParam && validTabs.includes(tabParam) ? tabParam : "profile";
  
  const [activeTab, setActiveTab] = useState(defaultTab);
  const activeTabId = sections.findIndex((s) => s.value === activeTab);

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
  
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [updateWorkspace, { isLoading: isUpdatingWorkspace }] = useUpdateWorkspaceMutation();
  const [updateSettings, { isLoading: isUpdatingSettings }] = useUpdateSettingsMutation();
  
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
      type: "FREELANCE",
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
        name: values.name || (values.type === 'INDIVIDUAL' || values.type === 'FREELANCE' ? null : undefined),
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
        <DirectionAwareTabs
          className="w-full mb-6"
          tabs={[
            {
              id: 0,
              label: sections[0].label,
              content: (
                <>
          {/* Profil utilisateur */}
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
                </>
              ),
            },
            {
              id: 1,
              label: sections[1].label,
              content: (
                <>
          {/* Entreprise */}
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
                        <Select onValueChange={field.onChange} value={field.value} disabled>
                          <SelectTrigger className={workspaceForm.formState.errors.type ? "border-destructive" : ""}>
                            <SelectValue placeholder={t('workspace.fields.typePlaceholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FREELANCE">{t('workspace.fields.typeFreelance')}</SelectItem>
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
                        {(workspaceType === 'INDIVIDUAL' || workspaceType === 'FREELANCE') && (
                          <span className="text-xs text-foreground/60 ml-2">
                            ({t('workspace.fields.nameOptional')})
                          </span>
                        )}
                      </Label>
                      <Input
                        id="workspace-name"
                        placeholder={workspaceType === 'INDIVIDUAL' || workspaceType === 'FREELANCE' 
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
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || "XOF"}
                            disabled={isUpdatingWorkspace}
                          >
                            <SelectTrigger className={workspaceForm.formState.errors.defaultCurrency ? "border-destructive" : ""}>
                              <SelectValue placeholder={t('workspace.fields.defaultCurrency')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="XOF">XOF — FCFA (UEMOA, Afrique de l'Ouest)</SelectItem>
                              <SelectItem value="XAF">XAF — FCFA (CEMAC, Afrique centrale)</SelectItem>
                              <SelectItem value="EUR">EUR — Euro (€)</SelectItem>
                              <SelectItem value="USD">USD — Dollar américain ($)</SelectItem>
                              <SelectItem value="NGN">NGN — Naira nigérian (₦)</SelectItem>
                              <SelectItem value="GHS">GHS — Cedi ghanéen (₵)</SelectItem>
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
                        {t('workspace.fields.country')}
                      </Label>
                      <Controller
                        name="country"
                        control={workspaceForm.control}
                        render={({ field }) => (
                          <Select
                            onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}
                            value={field.value || 'none'}
                            disabled={isUpdatingWorkspace}
                          >
                            <SelectTrigger className={workspaceForm.formState.errors.country ? "border-destructive" : ""}>
                              <SelectValue placeholder={t('workspace.fields.countryPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                              {SETTINGS_COUNTRIES.map(({ value, label }) => (
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
                                    {value === "none" ? t('workspace.fields.countryNotSpecified') : label}
                                  </span>
                                </SelectItem>
                              ))}
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
                  <Button type="submit" disabled={isUpdatingWorkspace || !workspaceForm.formState.isDirty}>
                    {isUpdatingWorkspace && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('workspace.buttons.update')}
                  </Button>
                </form>
              </CardContent>
            </Card>
                </>
              ),
            },
            {
              id: 2,
              label: sections[2].label,
              content: (
                <>
          {/* Paramètres de facturation */}
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
                      <p className="text-sm text-muted-foreground">
                        {t('billing.fields.currencyDefinedInWorkspace', {
                          currency: workspace?.defaultCurrency ?? settings?.currency ?? 'XOF',
                        })}
                      </p>
                      <div className="grid gap-4 md:grid-cols-2">
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
                </>
              ),
            },
          ]}
          value={activeTabId >= 0 ? activeTabId : 0}
          onValueChange={(id) => handleTabChange(sections[id].value)}
        />
      )}

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
