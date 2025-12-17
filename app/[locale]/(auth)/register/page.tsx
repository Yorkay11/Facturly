"use client";

import { Link } from '@/i18n/routing';
import Image from "next/image";
import { useRouter } from '@/i18n/routing';
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Mail, User, Building2, Eye, EyeOff, ChevronRight, ChevronLeft } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useRegisterMutation } from "@/services/facturlyApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations('auth.register');
  const tCommon = useTranslations('common');
  const [register, { isLoading, isSuccess, isError, error, data }] = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Créer le schéma de validation avec les traductions dynamiques
  const registerSchema = useMemo(() => z.object({
    firstName: z.string().min(2, t('validation.firstNameMinLength')),
    lastName: z.string().min(2, t('validation.lastNameMinLength')),
    email: z.string().email(t('validation.invalidEmail')),
    password: z
      .string()
      .min(8, t('validation.passwordMinLength'))
      .max(128, t('validation.passwordMaxLength'))
      .regex(/[A-Z]/, t('validation.passwordUppercase'))
      .regex(/[a-z]/, t('validation.passwordLowercase'))
      .regex(/[0-9]/, t('validation.passwordNumber')),
    confirmPassword: z.string().min(1, t('validation.confirmPasswordRequired')),
    companyName: z.string().min(2, t('validation.companyNameMinLength')),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('validation.passwordsMismatch'),
    path: ["confirmPassword"],
  }), [t]);

  type RegisterFormValues = z.infer<typeof registerSchema>;

  const steps = [
    { id: 1, label: t('steps.personalInfo') },
    { id: 2, label: t('steps.security') },
  ];

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema as any),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      companyName: "",
    },
  });

  useEffect(() => {
    if (isSuccess && data) {
      if (typeof window !== "undefined") {
        document.cookie = `facturly_access_token=${data.accessToken}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
      }

      const userName = data.firstName && data.lastName 
        ? `${data.firstName} ${data.lastName}` 
        : data.email;

      toast.success(t('toasts.success'), {
        description: t('toasts.successDescription', { name: userName }),
      });

      router.push("/dashboard");
    }
  }, [data, isSuccess, router]);

  useEffect(() => {
    if (isError && error) {
      if (typeof window !== "undefined") {
        document.cookie = "facturly_access_token=; path=/; max-age=0";
        document.cookie = "facturly_refresh_token=; path=/; max-age=0";
      }
      
      // Récupérer le code d'erreur et le message depuis l'erreur RTK Query
      const errorData = error && "data" in error ? (error.data as { code?: string; message?: string }) : null;
      const errorCode = errorData?.code;
      const errorMessage = errorData?.message || t('errors.default');
      
      // Vérifier si c'est une erreur 403 (bêta complète)
      const errorStatus = error && "status" in error ? error.status : null;
      if (errorStatus === 403) {
        toast.error(t('toasts.betaFull'), {
          description: errorMessage || t('toasts.betaFullDescription'),
        });
        return;
      }
      
      // Messages d'erreur spécifiques selon le code
      const errorMessages: Record<string, string> = {
        CONFLICT_EMAIL_EXISTS: t('errors.emailExists'),
        AUTH_UNAUTHORIZED: t('errors.unauthorized'),
        AUTH_TOKEN_EXPIRED: t('errors.tokenExpired'),
        AUTH_TOKEN_INVALID: t('errors.tokenInvalid'),
      };
      
      const displayMessage = errorCode && errorMessages[errorCode] 
        ? errorMessages[errorCode] 
        : errorMessage;
      
      toast.error(t('toasts.error'), {
        description: displayMessage,
      });
    }
  }, [error, isError]);

  const handleNext = async () => {
    // Valider les champs de l'étape 1 avant de passer à l'étape 2
    if (currentStep === 1) {
      const fieldsToValidate: (keyof RegisterFormValues)[] = ["firstName", "lastName", "email", "companyName"];
      
      // Déclencher la validation et attendre le résultat
      const isValid = await form.trigger(fieldsToValidate);
      
      if (isValid) {
        setCurrentStep(2);
        // Scroll to top pour voir la nouvelle étape
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
      } else {
        // Attendre un peu pour que les erreurs soient mises à jour dans le DOM
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Trouver le premier champ avec une erreur et le mettre en focus
        const errors = form.formState.errors;
        const firstErrorField = fieldsToValidate.find(field => errors[field]);
        
        if (firstErrorField) {
          // Attendre un peu plus pour que le DOM soit mis à jour avec les erreurs
          setTimeout(() => {
            const fieldElement = document.getElementById(firstErrorField);
            if (fieldElement) {
              fieldElement.focus();
              fieldElement.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 100);
          
          const errorMessage = errors[firstErrorField]?.message || "Erreur de validation";
          toast.error("Erreur de validation", {
            description: errorMessage,
          });
        } else {
          toast.error("Veuillez remplir tous les champs obligatoires");
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Scroll to top pour voir la nouvelle étape
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onSubmit = async (values: RegisterFormValues) => {
    // Sur la dernière étape uniquement, soumettre le formulaire
    if (currentStep === steps.length) {
      // Valider tous les champs avant de soumettre
      const isValid = await form.trigger();
      if (!isValid) {
        toast.error(t('toasts.correctErrors'));
        return;
      }

      register({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        companyName: values.companyName,
      });
    }
  };

  const isLastStep = currentStep === steps.length;

  return (
    <div className="flex min-h-screen">
      {/* Section gauche : Logo avec fond sombre */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/95 to-primary/90 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6 max-w-md">
          <Image
            src="/logos/logo.png"
            alt="Facturly"
            width={300}
            height={100}
            className="w-auto h-24 object-contain brightness-0 invert"
            priority
          />
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white">
              {t('heroTitle')}
            </h2>
            <p className="text-white/80 text-lg">
              {t('heroDescription')}
            </p>
          </div>
        </div>
      </div>

      {/* Section droite : Formulaire */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-semibold text-primary">{t('cardTitle')}</CardTitle>
                <CardDescription className="text-foreground/60">
                  {t('cardDescription')}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Indicateur de progression */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        index + 1 === currentStep
                          ? "w-8 bg-primary"
                          : index + 1 < currentStep
                          ? "w-2 bg-primary/50"
                          : "w-2 bg-muted-foreground/30"
                      )}
                    />
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          "h-0.5 w-4 transition-all duration-300",
                          index + 1 < currentStep ? "bg-primary/50" : "bg-muted-foreground/30"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" onKeyDown={async (e) => {
                if (e.key === "Enter" && !isLastStep) {
                  e.preventDefault();
                  await handleNext();
                }
              }}>
                {/* Étape 1 : Informations personnelles */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">{t('fields.firstName')}</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                          <Input
                            id="firstName"
                            type="text"
                            placeholder={t('placeholders.firstName')}
                            className="pl-9"
                            {...form.register("firstName")}
                          />
                        </div>
                        {form.formState.errors.firstName ? (
                          <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>
                        ) : null}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">{t('fields.lastName')}</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                          <Input
                            id="lastName"
                            type="text"
                            placeholder={t('placeholders.lastName')}
                            className="pl-9"
                            {...form.register("lastName")}
                          />
                        </div>
                        {form.formState.errors.lastName ? (
                          <p className="text-xs text-destructive">{form.formState.errors.lastName.message}</p>
                        ) : null}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('fields.email')}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                        <Input
                          id="email"
                          type="email"
                          placeholder={t('placeholders.email')}
                          className="pl-9"
                          {...form.register("email")}
                        />
                      </div>
                      {form.formState.errors.email ? (
                        <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">{t('fields.companyName')}</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                        <Input
                          id="companyName"
                          type="text"
                          placeholder={t('placeholders.companyName')}
                          className="pl-9"
                          {...form.register("companyName")}
                        />
                      </div>
                      {form.formState.errors.companyName ? (
                        <p className="text-xs text-destructive">{form.formState.errors.companyName.message}</p>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* Étape 2 : Sécurité */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">{t('fields.password')}</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder={t('placeholders.password')}
                          className="pl-9 pr-9"
                          {...form.register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/60 transition-colors"
                          aria-label={showPassword ? t('ariaLabels.hidePassword') : t('ariaLabels.showPassword')}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {form.formState.errors.password ? (
                        <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                      ) : null}
                      <p className="text-xs text-foreground/50">
                        {t('passwordHint')}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">{t('fields.confirmPassword')}</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder={t('placeholders.confirmPassword')}
                          className="pl-9 pr-9"
                          {...form.register("confirmPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/60 transition-colors"
                          aria-label={showConfirmPassword ? t('ariaLabels.hideConfirmPassword') : t('ariaLabels.showConfirmPassword')}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {form.formState.errors.confirmPassword ? (
                        <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* Boutons de navigation */}
                <div className="flex gap-3 pt-4">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      className="flex-1"
                      disabled={isLoading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      {t('buttons.previous')}
                    </Button>
                  )}
                  <Button
                    type={isLastStep ? "submit" : "button"}
                    onClick={!isLastStep ? handleNext : undefined}
                    className={cn("flex-1 gap-2", currentStep === 1 && "ml-auto")}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('buttons.creating')}
                      </>
                    ) : isLastStep ? (
                      t('buttons.createAccount')
                    ) : (
                      <>
                        {t('buttons.next')}
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <div className="space-y-3 text-center text-sm text-foreground/60">
                <Separator />
                <p>
                  {t('alreadyHaveAccount')} {" "}
                  <Link href="/login" className="text-primary hover:underline">
                    {t('signInLink')}
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
          <p className="mt-6 text-center text-xs text-foreground/50">
            {t('terms')}
          </p>
        </div>
      </div>
    </div>
  );
}

