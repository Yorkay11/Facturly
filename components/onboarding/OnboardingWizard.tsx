"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpdateWorkspaceMutation, useCreateWorkspaceMutation, useGetWorkspaceQuery, Workspace } from "@/services/facturlyApi";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Building2, User, MapPin, FileText, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingWizardProps {
  workspace: Workspace | null;
  onComplete: () => void;
}

// Les labels des étapes seront traduits dynamiquement
const STEP_IDS = ['type', 'basic', 'legal', 'address', 'review'] as const;
const STEP_ICONS = {
  type: Building2,
  basic: User,
  legal: FileText,
  address: MapPin,
  review: CheckCircle2,
} as const;

type StepId = typeof STEP_IDS[number];

export function OnboardingWizard({ workspace, onComplete }: OnboardingWizardProps) {
  const t = useTranslations('onboarding');
  const [currentStep, setCurrentStep] = useState<StepId>('type');
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [updateWorkspace, { isLoading: isUpdating }] = useUpdateWorkspaceMutation();
  const [createWorkspace, { isLoading: isCreating }] = useCreateWorkspaceMutation();
  const { refetch } = useGetWorkspaceQuery();
  
  const isUpdatingOrCreating = isUpdating || isCreating;

  // Créer le schéma de validation avec les traductions
  const workspaceSchema = useMemo(() => z.object({
    type: z.enum(['INDIVIDUAL', 'COMPANY'], { required_error: t('validation.typeRequired') }),
    name: z.string().nullable().optional(),
    defaultCurrency: z.string().min(1, t('validation.defaultCurrencyRequired')),
    legalName: z.string().optional(),
    taxId: z.string().optional(),
    vatNumber: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    postalCode: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
  }), [t]);

  type WorkspaceFormValues = z.infer<typeof workspaceSchema>;

  const form = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      type: workspace?.type || "COMPANY",
      name: workspace?.name || "",
      defaultCurrency: workspace?.defaultCurrency || "EUR",
      legalName: workspace?.legalName || "",
      taxId: workspace?.taxId || "",
      vatNumber: workspace?.vatNumber || "",
      addressLine1: workspace?.addressLine1 || "",
      addressLine2: workspace?.addressLine2 || "",
      postalCode: workspace?.postalCode || "",
      city: workspace?.city || "",
      country: workspace?.country || "",
    },
  });

  const workspaceType = form.watch("type");
  const currentStepIndex = STEP_IDS.findIndex(stepId => stepId === currentStep);
  const progress = ((currentStepIndex + 1) / STEP_IDS.length) * 100;
  
  // Obtenir les labels traduits des étapes
  const getStepLabel = (stepId: StepId) => {
    return t(`steps.${stepId}`);
  };
  
  const getStepIcon = (stepId: StepId) => {
    return STEP_ICONS[stepId];
  };

  const handleNext = async () => {
    // Valider les champs de l'étape actuelle
    const stepFields: Record<StepId, (keyof WorkspaceFormValues)[]> = {
      type: ['type'],
      basic: ['name', 'defaultCurrency'],
      legal: ['legalName', 'taxId', 'vatNumber'],
      address: ['addressLine1', 'addressLine2', 'postalCode', 'city', 'country'],
      review: [],
    };

    const fieldsToValidate = stepFields[currentStep];
    const isValid = await form.trigger(fieldsToValidate as any);

    if (!isValid) {
      return;
    }

    // Si ce n'est pas la dernière étape, passer à la suivante
    if (currentStepIndex < STEP_IDS.length - 1) {
      setCurrentStep(STEP_IDS[currentStepIndex + 1]);
    } else {
      // Dernière étape : sauvegarder
      await handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEP_IDS[currentStepIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    const values = form.getValues();
    
    try {
      // Si le workspace n'existe pas, le créer, sinon le mettre à jour
      if (!workspace) {
        await createWorkspace({
          type: values.type,
          name: values.name || null,
          defaultCurrency: values.defaultCurrency,
          legalName: values.legalName || undefined,
          taxId: values.taxId || undefined,
          vatNumber: values.vatNumber || undefined,
          addressLine1: values.addressLine1 || undefined,
          addressLine2: values.addressLine2 || undefined,
          postalCode: values.postalCode || undefined,
          city: values.city || undefined,
          country: values.country || undefined,
        }).unwrap();
      } else {
        await updateWorkspace({
          type: values.type,
          name: values.name || (values.type === 'INDIVIDUAL' ? null : undefined),
          defaultCurrency: values.defaultCurrency,
          legalName: values.legalName || undefined,
          taxId: values.taxId || undefined,
          vatNumber: values.vatNumber || undefined,
          addressLine1: values.addressLine1 || undefined,
          addressLine2: values.addressLine2 || undefined,
          postalCode: values.postalCode || undefined,
          city: values.city || undefined,
          country: values.country || undefined,
        }).unwrap();
      }

      toast.success("Profil complété", {
        description: "Votre workspace a été configuré avec succès.",
      });

      await refetch();
      // Redirection guidée vers la création de facture
      onComplete();
    } catch (error: any) {
      toast.error(t('errors.title'), {
        description: error?.data?.message || t('errors.description'),
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'type':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">{t('type.title')}</h2>
              <p className="text-muted-foreground">
                {t('type.description')}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => form.setValue('type', 'INDIVIDUAL')}
                className={cn(
                  "group p-6 rounded-xl border-2 text-left transition-all duration-300 relative",
                  workspaceType === 'INDIVIDUAL'
                    ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                    : "border-border hover:border-primary/50 hover:shadow-sm"
                )}
              >
                {workspaceType === 'INDIVIDUAL' && (
                  <span className="absolute top-3 right-3 inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
                    {t('type.individual.badge')}
                  </span>
                )}
                <User className="h-10 w-10 mb-4 text-primary" />
                <h3 className="font-bold text-lg mb-1">{t('type.individual.title')}</h3>
                <p className="text-sm font-medium text-foreground mb-2">
                  {t('type.individual.subtitle')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('type.individual.description')}
                </p>
              </button>
              <button
                type="button"
                onClick={() => form.setValue('type', 'COMPANY')}
                className={cn(
                  "group p-6 rounded-xl border-2 text-left transition-all duration-300",
                  workspaceType === 'COMPANY'
                    ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                    : "border-border hover:border-primary/50 hover:shadow-sm"
                )}
              >
                <Building2 className="h-10 w-10 mb-4 text-primary" />
                <h3 className="font-bold text-lg mb-1">{t('type.workspaceCompany.title')}</h3>
                <p className="text-sm font-medium text-foreground mb-2">
                  {t('type.workspaceCompany.subtitle')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('type.workspaceCompany.description')}
                </p>
              </button>
            </div>
            {form.formState.errors.type && (
              <p className="text-sm text-destructive text-center">
                {form.formState.errors.type.message}
              </p>
            )}
          </div>
        );

      case 'basic':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">{t('basic.title')}</h2>
              <p className="text-muted-foreground">
                {t('basic.description')}
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  {workspaceType === 'INDIVIDUAL' 
                    ? t('basic.fields.nameLabelIndividual')
                    : t('basic.fields.nameLabelCompany')}
                  {workspaceType === 'COMPANY' && <span className="text-destructive">*</span>}
                  {workspaceType === 'INDIVIDUAL' && (
                    <span className="text-xs text-muted-foreground ml-2">{t('basic.fields.nameOptional')}</span>
                  )}
                </Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder={workspaceType === 'INDIVIDUAL' 
                    ? t('basic.fields.namePlaceholderIndividual')
                    : t('basic.fields.namePlaceholder')}
                  disabled={isUpdatingOrCreating}
                  className={form.formState.errors.name ? "border-destructive" : ""}
                />
                {workspaceType === 'INDIVIDUAL' && (
                  <p className="text-xs text-muted-foreground">
                    {t('basic.fields.nameHintIndividual')}
                  </p>
                )}
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultCurrency">
                  {t('basic.fields.defaultCurrency')} <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="defaultCurrency"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={isUpdating}>
                      <SelectTrigger className={form.formState.errors.defaultCurrency ? "border-destructive" : ""}>
                        <SelectValue placeholder={t('basic.fields.defaultCurrencyPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="XOF">XOF (CFA)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.defaultCurrency && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.defaultCurrency.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 'legal':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h2 className="text-2xl font-semibold">{t('legal.title')}</h2>
                <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">
                  {t('legal.optionalBadge')}
                </span>
              </div>
              <p className="text-muted-foreground">
                {t('legal.description')}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {t('legal.skipHint')}
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="legalName">{t('legal.fields.legalName')}</Label>
                <Input
                  id="legalName"
                  {...form.register("legalName")}
                  placeholder={t('legal.fields.legalNamePlaceholder')}
                  disabled={isUpdatingOrCreating}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="taxId">{t('legal.fields.taxId')}</Label>
                  <Input
                    id="taxId"
                    {...form.register("taxId")}
                    placeholder={t('legal.fields.taxIdPlaceholder')}
                    disabled={isUpdatingOrCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vatNumber">{t('legal.fields.vatNumber')}</Label>
                  <Input
                    id="vatNumber"
                    {...form.register("vatNumber")}
                    placeholder={t('legal.fields.vatNumberPlaceholder')}
                    disabled={isUpdatingOrCreating}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'address':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h2 className="text-2xl font-semibold">{t('address.title')}</h2>
                <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">
                  {t('address.optionalBadge')}
                </span>
              </div>
              <p className="text-muted-foreground">
                {t('address.description')}
              </p>
            </div>
            {!showFullAddress ? (
              <div className="text-center py-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFullAddress(true)}
                  className="mx-auto"
                >
                  {t('address.showFullAddress')}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">{t('address.description')}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFullAddress(false)}
                  >
                    {t('address.hideFullAddress')}
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressLine1">{t('address.fields.addressLine1')}</Label>
                  <Input
                    id="addressLine1"
                    {...form.register("addressLine1")}
                    placeholder={t('address.fields.addressLine1Placeholder')}
                    disabled={isUpdatingOrCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressLine2">{t('address.fields.addressLine2')}</Label>
                  <Input
                    id="addressLine2"
                    {...form.register("addressLine2")}
                    placeholder={t('address.fields.addressLine2Placeholder')}
                    disabled={isUpdatingOrCreating}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">{t('address.fields.postalCode')}</Label>
                    <Input
                      id="postalCode"
                      {...form.register("postalCode")}
                      placeholder={t('address.fields.postalCodePlaceholder')}
                      disabled={isUpdatingOrCreating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">{t('address.fields.city')}</Label>
                    <Input
                      id="city"
                      {...form.register("city")}
                      placeholder={t('address.fields.cityPlaceholder')}
                      disabled={isUpdatingOrCreating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">{t('address.fields.country')}</Label>
                    <Input
                      id="country"
                      {...form.register("country")}
                      placeholder={t('address.fields.countryPlaceholder')}
                      disabled={isUpdatingOrCreating}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'review':
        const values = form.getValues();
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold">{t('review.title')}</h2>
              <p className="text-lg text-muted-foreground">
                {t('review.description')}
              </p>
            </div>
            <div className="space-y-6">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">{t('review.summary')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('review.labels.type')}</span>
                    <span className="font-medium">{values.type === 'INDIVIDUAL' ? t('review.types.individual') : t('review.types.workspaceCompany')}</span>
                  </div>
                  {values.name && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('review.labels.name')}</span>
                      <span className="font-medium">{values.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('review.labels.currency')}</span>
                    <span className="font-medium">{values.defaultCurrency}</span>
                  </div>
                  {values.legalName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('review.labels.legalName')}</span>
                      <span className="font-medium">{values.legalName}</span>
                    </div>
                  )}
                  {(values.addressLine1 || values.city) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('review.labels.address')}</span>
                      <span className="font-medium text-right">
                        {[values.addressLine1, values.city, values.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">{t('review.nextSteps.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>{t('review.nextSteps.createInvoice')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>{t('review.nextSteps.addClient')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>{t('review.nextSteps.receivePayment')}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="space-y-4">
        <div className="space-y-2 text-center">
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t('stepCounter', { current: currentStepIndex + 1, total: STEP_IDS.length })}
            </span>
            <span className="font-medium">{t('progress', { percentage: Math.round(progress) })}</span>
          </div>
          <Progress value={progress} className="h-2 transition-all duration-300 ease-out" />
        </div>
        <div className="flex items-center justify-center gap-2">
          {STEP_IDS.map((stepId, index) => {
            const Icon = getStepIcon(stepId);
            const isActive = stepId === currentStep;
            const isCompleted = index < currentStepIndex;
            
            return (
              <div key={stepId} className="flex items-center">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                  isActive && "border-primary bg-primary text-primary-foreground scale-110",
                  isCompleted && "border-primary bg-primary/10 text-primary",
                  !isActive && !isCompleted && "border-muted bg-muted text-muted-foreground"
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                {index < STEP_IDS.length - 1 && (
                  <div className={cn(
                    "w-12 h-0.5 mx-2 transition-all duration-300",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderStepContent()}
        
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0 || isUpdatingOrCreating}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('buttons.previous')}
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            disabled={isUpdatingOrCreating}
          >
            {currentStepIndex === STEP_IDS.length - 1 ? (
              <>
                {isUpdatingOrCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('buttons.finishing')}
                  </>
                ) : (
                  <>
                    {t('buttons.finish')}
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                  </>
                )}
              </>
            ) : (
              <>
                {t('buttons.next')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

