"use client";

import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpdateWorkspaceMutation, useGetWorkspaceQuery, Workspace } from "@/services/facturlyApi";
import { toast } from "sonner";
import { Loader2, Building2, User, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingWizardProps {
  workspace: Workspace;
  onComplete: () => void;
}

type WorkspaceType = 'INDIVIDUAL' | 'COMPANY';

export function OnboardingWizard({ workspace, onComplete }: OnboardingWizardProps) {
  const t = useTranslations('onboarding');
  const [selectedType, setSelectedType] = useState<WorkspaceType>(workspace?.type || 'INDIVIDUAL');
  const [updateWorkspace, { isLoading }] = useUpdateWorkspaceMutation();
  const { refetch } = useGetWorkspaceQuery();

  // Schéma de validation professionnel
  const workspaceSchema = useMemo(() => z.object({
    type: z.enum(['INDIVIDUAL', 'COMPANY']),
    name: z.string().optional().nullable(),
    defaultCurrency: z.string().min(1, t('validation.defaultCurrencyRequired')),
    country: z.string().optional(),
  }).refine((data) => {
    if (data.type === 'COMPANY' && (!data.name || data.name.trim().length < 2)) {
      return false;
    }
    return true;
  }, {
    message: t('validation.nameMin'),
    path: ['name'],
  }), [t]);

  type WorkspaceFormValues = z.infer<typeof workspaceSchema>;

  const form = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceSchema),
    mode: 'onChange',
    defaultValues: {
      type: workspace?.type || 'INDIVIDUAL',
      name: workspace?.name || '',
      defaultCurrency: workspace?.defaultCurrency || 'XOF',
      country: workspace?.country || '',
    },
  });

  const workspaceType = form.watch("type");
  const isFormValid = form.formState.isValid;

  const handleTypeSelect = (type: WorkspaceType) => {
    setSelectedType(type);
    form.setValue('type', type, { shouldValidate: true });
    if (type === 'INDIVIDUAL') {
      form.setValue('name', null, { shouldValidate: true });
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const isValid = await form.trigger();
    if (!isValid) {
      const errors = form.formState.errors;
      if (errors.name) {
        toast.error(t('validation.nameMin'));
      }
      if (errors.defaultCurrency) {
        toast.error(t('validation.defaultCurrencyRequired'));
      }
      return;
    }

    const values = form.getValues();
    
    try {
      await updateWorkspace({
        type: values.type,
        name: values.name?.trim() || (values.type === 'INDIVIDUAL' ? null : undefined),
        defaultCurrency: values.defaultCurrency,
        country: values.country || undefined,
      }).unwrap();

      toast.success(t('success.title'), {
        description: t('success.description'),
      });

      await refetch();
      onComplete();
    } catch (error: any) {
      toast.error(t('errors.title'), {
        description: error?.data?.message || t('errors.description'),
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header avec progression visuelle */}
      <div className="mb-6 text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="h-1 w-8 bg-primary rounded-full" />
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <div className="h-1 w-8 bg-muted rounded-full" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          {t('description')}
        </p>
      </div>

      <Card className="border shadow-lg">
        <CardContent className="pt-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section Type de profil */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">{t('type.title')}</Label>
                <p className="text-xs text-muted-foreground">
                  {t('type.description')}
                </p>
              </div>
              
              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleTypeSelect('INDIVIDUAL')}
                  className={cn(
                    "group relative p-4 rounded-lg border-2 text-left transition-all duration-200 h-full",
                    selectedType === 'INDIVIDUAL'
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/30 hover:shadow-sm bg-card"
                  )}
                >
                  {selectedType === 'INDIVIDUAL' && (
                    <div className="absolute top-3 right-3">
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg transition-colors flex-shrink-0",
                      selectedType === 'INDIVIDUAL' ? "bg-primary/10" : "bg-muted"
                    )}>
                      <User className={cn(
                        "h-5 w-5 transition-colors",
                        selectedType === 'INDIVIDUAL' ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1 space-y-0.5 min-w-0">
                      <h3 className="font-semibold text-sm">{t('type.individual.title')}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {t('type.individual.subtitle')}
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeSelect('COMPANY')}
                  className={cn(
                    "group relative p-4 rounded-lg border-2 text-left transition-all duration-200 h-full",
                    selectedType === 'COMPANY'
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/30 hover:shadow-sm bg-card"
                  )}
                >
                  {selectedType === 'COMPANY' && (
                    <div className="absolute top-3 right-3">
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg transition-colors flex-shrink-0",
                      selectedType === 'COMPANY' ? "bg-primary/10" : "bg-muted"
                    )}>
                      <Building2 className={cn(
                        "h-5 w-5 transition-colors",
                        selectedType === 'COMPANY' ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1 space-y-0.5 min-w-0">
                      <h3 className="font-semibold text-sm">{t('type.workspaceCompany.title')}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {t('type.workspaceCompany.subtitle')}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t" />

            {/* Section Informations */}
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">{t('basic.title')}</Label>
                <p className="text-xs text-muted-foreground">
                  {t('basic.description')}
                </p>
              </div>

              <div className="grid gap-4">
                {/* Nom */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-medium">
                    {workspaceType === 'INDIVIDUAL' 
                      ? t('basic.fields.nameLabelIndividual')
                      : t('basic.fields.nameLabelCompany')}
                    {workspaceType === 'COMPANY' && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                    {workspaceType === 'INDIVIDUAL' && (
                      <span className="text-muted-foreground font-normal ml-1 text-xs">
                        {t('basic.fields.nameOptional')}
                      </span>
                    )}
                  </Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder={
                      workspaceType === 'INDIVIDUAL' 
                        ? t('basic.fields.namePlaceholderIndividual')
                        : t('basic.fields.namePlaceholder')
                    }
                    disabled={isLoading}
                    className={cn(
                      "h-10 text-sm",
                      form.formState.errors.name && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                  {workspaceType === 'INDIVIDUAL' && !form.formState.errors.name && (
                    <p className="text-xs text-muted-foreground">
                      {t('basic.fields.nameHintIndividual')}
                    </p>
                  )}
                </div>

                {/* Devise */}
                <div className="space-y-1.5">
                  <Label htmlFor="defaultCurrency" className="text-xs font-medium">
                    {t('basic.fields.defaultCurrency')} <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="defaultCurrency"
                    control={form.control}
                    render={({ field }) => (
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value} 
                        disabled={isLoading}
                      >
                        <SelectTrigger 
                          className={cn(
                            "h-10 text-sm",
                            form.formState.errors.defaultCurrency && "border-destructive focus-visible:ring-destructive"
                          )}
                        >
                          <SelectValue placeholder={t('basic.fields.defaultCurrencyPlaceholder')} />
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
                  {form.formState.errors.defaultCurrency && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.defaultCurrency.message}
                    </p>
                  )}
                </div>

                {/* Pays */}
                <div className="space-y-1.5">
                  <Label htmlFor="country" className="text-xs font-medium">
                    {t('basic.fields.country')} <span className="text-muted-foreground text-xs">(optionnel)</span>
                  </Label>
                  <Controller
                    name="country"
                    control={form.control}
                    render={({ field }) => (
                      <Select 
                        onValueChange={(value) => field.onChange(value === 'none' ? null : value)} 
                        value={field.value || 'none'} 
                        disabled={isLoading}
                      >
                        <SelectTrigger 
                          className={cn(
                            "h-10 text-sm",
                            form.formState.errors.country && "border-destructive focus-visible:ring-destructive"
                          )}
                        >
                          <SelectValue placeholder={t('basic.fields.countryPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t('basic.fields.countryNotSpecified')}</SelectItem>
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
                  {form.formState.errors.country && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.country.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t('basic.fields.countryHint')}
                  </p>
                </div>
              </div>
            </div>

            {/* Message informatif */}
            <div className="bg-muted/50 rounded-md p-3 border border-border/50">
              <p className="text-xs text-muted-foreground text-center">
                {t('basic.note')}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-3 border-t">
              <Button
                type="submit"
                size="default"
                disabled={isLoading || !isFormValid}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('buttons.finishing')}
                  </>
                ) : (
                  <>
                    {t('buttons.finish')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
