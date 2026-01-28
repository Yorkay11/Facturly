"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Loader2, Building2, User, CheckCircle2, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { InteractiveDemo } from "./InteractiveDemo";
import Stepper, { Step } from "@/components/ui/stepper";

interface OnboardingWizardProps {
  workspace: Workspace;
  onComplete: () => void;
}

type WorkspaceType = 'INDIVIDUAL' | 'COMPANY';

export function OnboardingWizard({ workspace, onComplete }: OnboardingWizardProps) {
  const t = useTranslations('onboarding');
  const [selectedType, setSelectedType] = useState<WorkspaceType>(workspace?.type || 'INDIVIDUAL');
  const [showAdvanced, setShowAdvanced] = useState(false); // Masquer les options avancées par défaut
  const [showDemo, setShowDemo] = useState(true); // Afficher la démo par défaut
  const [currentStep, setCurrentStep] = useState(1);
  const [updateWorkspace, { isLoading }] = useUpdateWorkspaceMutation();
  const { refetch } = useGetWorkspaceQuery();

  // Schéma de validation simplifié - 3 clics max
  // Pour INDIVIDUAL : Aucun champ requis (tout en option avec valeurs par défaut)
  // Pour COMPANY : Seulement le nom est requis
  const workspaceSchema = useMemo(() => z.object({
    type: z.enum(['INDIVIDUAL', 'COMPANY']),
    name: z.string().optional().nullable(),
    defaultCurrency: z.string().optional(), // Optionnel - valeur par défaut XOF
    country: z.string().optional(),
  }).refine((data) => {
    // Pour COMPANY, le nom est requis
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
  // Pour INDIVIDUAL : toujours valide (aucun champ requis)
  // Pour COMPANY : valide si le nom est rempli
  const isFormValid = workspaceType === 'INDIVIDUAL' 
    ? true 
    : form.formState.isValid;

  const handleTypeSelect = (type: WorkspaceType) => {
    setSelectedType(type);
    form.setValue('type', type, { shouldValidate: true });
    if (type === 'INDIVIDUAL') {
      form.setValue('name', null, { shouldValidate: true });
      // Pour INDIVIDUAL, réinitialiser à l'étape 1 (on aura 2 étapes au total)
      if (currentStep > 2) {
        setCurrentStep(1);
      }
    } else {
      // Pour COMPANY, on reste sur l'étape 1 (on aura 3 étapes au total)
      if (currentStep > 3) {
        setCurrentStep(1);
      }
    }
  };

  const handleStepChange = (step: number) => {
    // Pour INDIVIDUAL, sauter l'étape 2
    if (selectedType === 'INDIVIDUAL' && step === 2) {
      setCurrentStep(3);
    } else {
      setCurrentStep(step);
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
        // Utiliser la valeur par défaut XOF si non spécifiée
        defaultCurrency: values.defaultCurrency || 'XOF',
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

  // Gérer le changement d'étape quand le type change
  useEffect(() => {
    if (selectedType === 'INDIVIDUAL' && currentStep === 2) {
      // Si on est sur l'étape 2 et qu'on passe à INDIVIDUAL, sauter à l'étape 3
      setCurrentStep(3);
    } else if (selectedType === 'COMPANY' && currentStep > 3) {
      // Si on est au-delà de l'étape 3 et qu'on passe à COMPANY, revenir à l'étape 2
      setCurrentStep(2);
    }
  }, [selectedType, currentStep]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Démonstration interactive */}
      {showDemo && (
        <InteractiveDemo onSkip={() => setShowDemo(false)} />
      )}

      {/* Stepper d'onboarding */}
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-6 text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            {t('description')}
          </p>
        </div>

        <Stepper
          currentStep={currentStep}
          onStepChange={(step) => {
            setCurrentStep(step);
          }}
          onFinalStepCompleted={handleSubmit}
          backButtonText="Précédent"
          nextButtonText="Suivant"
          stepCircleContainerClassName="bg-card"
          contentClassName="min-h-[300px]"
          nextButtonProps={{
            onClick: async (e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Validation avant de passer à l'étape suivante
              if (currentStep === 2 && selectedType === 'COMPANY') {
                const isValid = await form.trigger('name');
                if (!isValid) {
                  toast.error(t('validation.nameMin'));
                  return;
                }
              }
              
              // Déterminer la prochaine étape
              let nextStep = currentStep + 1;
              
              // Pour INDIVIDUAL, sauter l'étape 2
              if (selectedType === 'INDIVIDUAL' && nextStep === 2) {
                nextStep = 3;
              }
              
              const totalSteps = 3; // Toujours 3 étapes affichées
              const isLastStep = nextStep > totalSteps;
              
              if (isLastStep) {
                // Dernière étape - soumettre le formulaire
                handleSubmit();
              } else {
                // Passer à l'étape suivante
                setCurrentStep(nextStep);
              }
            }
          }}
        >
          {/* Étape 1 : Type de profil */}
          <Step>
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">{t('type.title')}</Label>
                  <p className="text-sm text-muted-foreground">
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
            </div>
          </Step>

          {/* Étape 2 : Informations de base (seulement pour COMPANY, mais toujours présente) */}
          <Step>
            {selectedType === 'COMPANY' ? (
              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-base font-semibold">{t('basic.title')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('basic.description')}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-sm font-medium">
                        {t('basic.fields.nameLabelCompany')}
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      <Input
                        id="name"
                        {...form.register("name")}
                        placeholder={t('basic.fields.namePlaceholder')}
                        disabled={isLoading}
                        className={cn(
                          "h-10",
                          form.formState.errors.name && "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                      {form.formState.errors.name && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 py-4">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {t('basic.note')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Vous pouvez passer directement aux options avancées.
                  </p>
                </div>
              </div>
            )}
          </Step>

          {/* Étape 3 : Options avancées */}
          <Step>
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">{t('basic.advancedOptions')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('basic.note')}
                  </p>
                </div>

                <div className="grid gap-4">
                  {/* Devise - Optionnel avec valeur par défaut */}
                  <div className="space-y-1.5">
                    <Label htmlFor="defaultCurrency" className="text-sm font-medium">
                      {t('basic.fields.defaultCurrency')} <span className="text-muted-foreground text-xs">(optionnel)</span>
                    </Label>
                    <Controller
                      name="defaultCurrency"
                      control={form.control}
                      render={({ field }) => (
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || 'XOF'} 
                          disabled={isLoading}
                        >
                          <SelectTrigger className="h-10">
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
                  </div>

                  {/* Pays */}
                  <div className="space-y-1.5">
                    <Label htmlFor="country" className="text-sm font-medium">
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
                          <SelectTrigger className="h-10">
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
                  </div>
                </div>
              </div>
            </div>
          </Step>
        </Stepper>
      </div>

      {/* Bouton Skip - en dehors du stepper */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isLoading}
          onClick={async () => {
            try {
              await updateWorkspace({
                type: 'INDIVIDUAL',
                defaultCurrency: 'XOF',
              }).unwrap();
              
              toast.success(t('success.skipped'), {
                description: t('success.skippedDescription'),
              });
              
              await refetch();
              onComplete();
            } catch (error: any) {
              toast.error(t('errors.title'), {
                description: error?.data?.message || t('errors.description'),
              });
            }
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          {t('buttons.skip')}
        </Button>
      </div>
    </div>
  );
}
