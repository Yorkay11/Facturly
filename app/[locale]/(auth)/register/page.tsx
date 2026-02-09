"use client";

import { Link } from '@/i18n/routing';
import Image from "next/image";
import { useRouter } from '@/i18n/routing';
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, User, Building2 } from "lucide-react";
import { Controller } from "react-hook-form";

import { MagicCard } from "@/components/ui/magic-card";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Separator } from "@/components/ui/separator";
import { useRegisterMutation } from "@/services/facturlyApi";
import { toast } from "sonner";
import { useTranslations, useLocale } from 'next-intl';
import { useMemo } from 'react';
import { Redirect } from '@/components/navigation';

import { DotPattern } from "@/components/ui/dot-pattern";
import { Quote } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('auth.register');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
  const [register, { isLoading, isSuccess, isError, error, data }] = useRegisterMutation();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Créer le schéma de validation avec les traductions dynamiques (sans confirmation mot de passe)
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
      .regex(/[0-9]/, t('validation.passwordNumber'))
      .regex(/[!-\/:-@[-`{-~]/, t('validation.passwordSpecial')),
  }), [t]);

  type RegisterFormValues = z.infer<typeof registerSchema>;

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema as z.ZodType<RegisterFormValues>),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

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

      // Vérifier si un workspace existe, sinon rediriger vers l'onboarding
      // Le backend retourne workspace: null si aucun workspace n'existe
      if (!data.workspace) {
        setRedirectPath("/onboarding");
      } else {
        setRedirectPath("/dashboard");
      }
      setShouldRedirect(true);
    }
  }, [data, isSuccess, router, t]);

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

  // Redirection après inscription réussie
  if (shouldRedirect && redirectPath) {
    return (
      <Redirect
        to={redirectPath}
        type="replace"
        checkUnsavedChanges={false}
        showLoader={false} // Désactiver le loader interne de Redirect car GlobalLoader prend le relais
        delay={0}
      />
    );
  }

  const onSubmit = (values: RegisterFormValues) => {
    register({
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
    });
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    // Rediriger vers la route API Google OAuth
    const redirectTo = '/dashboard';
    const apiUrl = `/api/auth/google?redirect=${encodeURIComponent(redirectTo)}&locale=${locale}`;
    window.location.href = apiUrl;
  };

  return (
    <div className="flex min-h-screen">
      {/* Section gauche : Logo avec fond sombre */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-6 relative overflow-hidden">
        <DotPattern className="text-white opacity-20" glow />
        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-8 max-w-md">
          <Image
            src="/logos/logo.png"
            alt="Facturly"
            width={300}
            height={100}
            className="w-auto h-24 object-contain brightness-0 invert"
            priority
          />
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white">
              {t('heroTitle')}
            </h2>
            <p className="text-white/80 text-lg leading-relaxed">
              {t('heroDescription')}
            </p>
          </div>
        </div>
      </div>

      {/* Section droite : Formulaire */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-6 bg-gray-50/50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:hidden">
            <Image
              src="/icon.png"
              alt="Facturly"
              width={64}
              height={64}
              className="h-16 w-16 mx-auto object-contain rounded-xl shadow-md"
              priority
            />
          </div>

          <MagicCard className="border-none shadow-2xl bg-white/80 backdrop-blur-xl">
            <CardHeader className="space-y-0.5 text-center pb-4 pt-6 px-6">
              <CardTitle className="text-xl font-bold tracking-tight">{t('cardTitle')}</CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                {t('cardDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-[10px] font-medium uppercase text-muted-foreground tracking-wider ml-0.5">{t('fields.firstName')}</Label>
                    <div className="relative group">
                      <User className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder={t('placeholders.firstName')}
                        className="pl-9 h-9 text-sm bg-gray-50 border-gray-200 focus:bg-white transition-[background-color,border-color] duration-150"
                        {...form.register("firstName")}
                      />
                    </div>
                    {form.formState.errors.firstName ? (
                      <p className="text-[10px] text-destructive ml-0.5">{form.formState.errors.firstName.message}</p>
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-[10px] font-medium uppercase text-muted-foreground tracking-wider ml-0.5">{t('fields.lastName')}</Label>
                    <div className="relative group">
                      <User className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input
                        id="lastName"
                        type="text"
                        placeholder={t('placeholders.lastName')}
                        className="pl-9 h-9 text-sm bg-gray-50 border-gray-200 focus:bg-white transition-[background-color,border-color] duration-150"
                        {...form.register("lastName")}
                      />
                    </div>
                    {form.formState.errors.lastName ? (
                      <p className="text-[10px] text-destructive ml-0.5">{form.formState.errors.lastName.message}</p>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[10px] font-medium uppercase text-muted-foreground tracking-wider ml-0.5">{t('fields.email')}</Label>
                  <div className="relative group">
                    <Mail className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('placeholders.email')}
                      className="pl-9 h-9 text-sm bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200"
                      {...form.register("email")}
                    />
                  </div>
                  {form.formState.errors.email ? (
                    <p className="text-[10px] text-destructive ml-0.5">{form.formState.errors.email.message}</p>
                  ) : null}
                </div>
                <Controller
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <PasswordInput
                      id="password"
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder={t('placeholders.password')}
                      label={t('fields.password')}
                      error={form.formState.errors.password?.message}
                      translationNamespace="auth.register.passwordStrength"
                      compact
                      className="space-y-1.5"
                    />
                  )}
                />

                <Button
                  type="submit"
                  className="w-full gap-2 h-9 text-sm font-medium shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('buttons.creating')}
                    </>
                  ) : (
                    t('buttons.createAccount')
                  )}
                </Button>
              </form>

              <div className="space-y-3 text-center text-foreground/60 pt-1">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-white px-2 text-muted-foreground font-medium">{tAuth('orContinueWith')}</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-9 bg-white hover:bg-gray-50 text-foreground border-gray-200 font-medium text-sm transition-all"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading || isLoading}
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      {tAuth('processing')}
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      {tAuth('continueWithGoogle')}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
            <div className="p-4 bg-gray-50/50 border-t border-gray-100 rounded-b-xl text-center">
              <p className="text-xs text-muted-foreground">
                {t('alreadyHaveAccount')} {" "}
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  {t('signInLink')}
                </Link>
              </p>
            </div>
          </MagicCard>
          <p className="text-center text-xs text-muted-foreground/60 px-4">
            {locale === 'fr' ? (
              <>
                En créant un compte, vous acceptez nos{' '}
                <Link href="/terms" className="text-muted-foreground hover:text-primary hover:underline transition-colors">
                  conditions d'utilisation
                </Link>
                {' '}et notre{' '}
                <Link href="/privacy" className="text-muted-foreground hover:text-primary hover:underline transition-colors">
                  politique de confidentialité
                </Link>
                .
              </>
            ) : (
              <>
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-muted-foreground hover:text-primary hover:underline transition-colors">
                  terms of use
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-muted-foreground hover:text-primary hover:underline transition-colors">
                  privacy policy
                </Link>
                .
              </>
            )}
          </p>
        </div>
      </div>
      
      {shouldRedirect && redirectPath && (
        <Redirect
          to={redirectPath}
          type="replace"
          checkUnsavedChanges={false}
          showLoader={true}
          loaderType="processing"
          delay={500}
        />
      )}
    </div>
  );
}

