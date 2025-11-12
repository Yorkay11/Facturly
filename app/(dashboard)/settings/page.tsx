"use client";

import { useEffect, useState } from "react";
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
} from "@/services/facturlyApi";
import { toast } from "sonner";

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

export default function SettingsPage() {
  // Queries
  const { data: user, isLoading: isLoadingUser } = useGetMeQuery();
  const { data: company, isLoading: isLoadingCompany } = useGetCompanyQuery();
  const { data: settings, isLoading: isLoadingSettings } = useGetSettingsQuery();
  const { data: subscription, isLoading: isLoadingSubscription } = useGetSubscriptionQuery();
  const { data: plansResponse, isLoading: isLoadingPlans } = useGetPlansQuery();
  
  // Mutations
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [updateCompany, { isLoading: isUpdatingCompany }] = useUpdateCompanyMutation();
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
        <Tabs defaultValue="profile" className="space-y-6">
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
                              <SelectItem value="GBP">GBP (£)</SelectItem>
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
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">Paramètres de facturation</CardTitle>
                <CardDescription>
                  Configurez les paramètres par défaut pour vos factures (langue, devise, TVA, etc.).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="language">
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
                      <Label htmlFor="timezone">
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
                    <div className="space-y-2">
                      <Label htmlFor="invoice-prefix">
                        Préfixe facture <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="invoice-prefix"
                        placeholder="FAC"
                        {...settingsForm.register("invoicePrefix")}
                        disabled={isUpdatingSettings}
                        className={settingsForm.formState.errors.invoicePrefix ? "border-destructive" : ""}
                      />
                      {settingsForm.formState.errors.invoicePrefix && (
                        <p className="text-xs text-destructive">
                          {settingsForm.formState.errors.invoicePrefix.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date-format">
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
                              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
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
                    <div className="space-y-2">
                      <Label htmlFor="currency">
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
                              <SelectItem value="GBP">GBP (£)</SelectItem>
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
                      <Label htmlFor="tax-rate">
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
                      <Label htmlFor="payment-terms">
                        Termes de paiement (jours) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="payment-terms"
                        type="number"
                        placeholder="30"
                        {...settingsForm.register("paymentTerms", { valueAsNumber: true })}
                        disabled={isUpdatingSettings}
                        className={settingsForm.formState.errors.paymentTerms ? "border-destructive" : ""}
                      />
                      {settingsForm.formState.errors.paymentTerms && (
                        <p className="text-xs text-destructive">
                          {settingsForm.formState.errors.paymentTerms.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <p className="text-sm font-semibold text-primary">Séquence actuelle</p>
                    <p className="text-2xl font-bold text-primary">{settings?.invoiceSequence ?? 0}</p>
                    <p className="text-xs text-foreground/60">
                      Le numéro de séquence est automatiquement incrémenté à chaque nouvelle facture.
                    </p>
                  </div>
                  <Button type="submit" disabled={isUpdatingSettings}>
                    {isUpdatingSettings && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enregistrer les paramètres
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Abonnement */}
          <TabsContent value="subscription">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">Abonnement & Plans</CardTitle>
                <CardDescription>
                  Gérez votre abonnement et consultez les plans disponibles.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoadingSubscription ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : subscription ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-primary">Plan actuel</p>
                          <p className="text-xl font-bold text-primary">{subscription.plan.name}</p>
                          <p className="text-xs text-foreground/60">
                            {subscription.plan.price === "0.00" ? "Gratuit" : `${subscription.plan.price} ${subscription.plan.currency}/${subscription.plan.billingInterval === "monthly" ? "mois" : "an"}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-foreground/60">Statut</p>
                          <p className={`text-sm font-semibold ${subscription.status === "active" ? "text-emerald-600" : "text-gray-600"}`}>
                            {subscription.status === "active" ? "Actif" : subscription.status}
                          </p>
                        </div>
                      </div>
                      {subscription.plan.invoiceLimit && (
                        <div className="mt-4 pt-4 border-t border-primary/20">
                          <p className="text-xs text-foreground/60">
                            Limite : {subscription.plan.invoiceLimit} factures par mois
                          </p>
                        </div>
                      )}
                    </div>
                    {subscription.cancelAtPeriodEnd && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        <p className="font-semibold">Abonnement annulé</p>
                        <p className="text-xs">
                          Votre abonnement sera annulé à la fin de la période en cours ({new Date(subscription.currentPeriodEnd).toLocaleDateString("fr-FR")}).
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-primary/30 bg-white py-8 text-center">
                    <p className="text-sm text-foreground/60">Aucun abonnement actif</p>
                  </div>
                )}
                
                {isLoadingPlans ? (
                  <div className="space-y-3">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : plans.length > 0 ? (
                  <div className="space-y-4">
                    <Separator />
                    <div>
                      <p className="text-sm font-semibold text-primary mb-3">Plans disponibles</p>
                      <div className="grid gap-4 md:grid-cols-2">
                        {plans.map((plan) => (
                          <div
                            key={plan.id}
                            className="rounded-lg border border-primary/20 bg-white p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-semibold text-primary">{plan.name}</p>
                              <p className="text-lg font-bold text-primary">
                                {plan.price === "0.00" ? "Gratuit" : `${plan.price} ${plan.currency}/${plan.billingInterval === "monthly" ? "mois" : "an"}`}
                              </p>
                            </div>
                            <p className="text-xs text-foreground/60 mb-3">{plan.description}</p>
                            {plan.metadata?.features && Array.isArray(plan.metadata.features) && (
                              <ul className="text-xs text-foreground/70 space-y-1 mb-3">
                                {plan.metadata.features.map((feature: string, index: number) => (
                                  <li key={index}>• {feature}</li>
                                ))}
                              </ul>
                            )}
                            <Button
                              variant={plan.code === subscription?.plan.code ? "outline" : "default"}
                              size="sm"
                              className="w-full"
                              disabled={plan.code === subscription?.plan.code || isLoadingSubscription}
                            >
                              {plan.code === subscription?.plan.code ? "Plan actuel" : "Changer de plan"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
