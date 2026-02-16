"use client";

import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useForm, useFormState, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, User } from "lucide-react";
import type { Control } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useRegisterMutation } from "@/services/facturlyApi";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { Redirect } from "@/components/navigation";
import { removeLocalePrefix } from "@/utils/path-utils";

import { DotPattern } from "@/components/ui/dot-pattern";

type RegisterFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

/** Affiche l’erreur d’un champ ; s’abonne uniquement à ce champ → le parent ne re-render pas à chaque frappe. */
function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

/** Affiche l'erreur d'un champ ; s'abonne uniquement à ce champ → le parent ne re-render pas à chaque frappe. */
function RegisterFieldError({
  control,
  name,
}: {
  control: Control<RegisterFormValues>;
  name: keyof RegisterFormValues;
}) {
  const { errors } = useFormState({ control, name });
  const message = errors[name]?.message;
  if (!message) return null;
  return <p className="text-[13px] text-destructive mt-1">{message}</p>;
}

/** Champ mot de passe avec erreur isolée (useFormState sur "password" uniquement). */
function RegisterPasswordField({
  control,
  ...props
}: {
  control: Control<RegisterFormValues>;
  placeholder: string;
  label: string;
  translationNamespace: string;
  compact?: boolean;
  className?: string;
  inputClassName?: string;
}) {
  const { errors } = useFormState({ control, name: "password" });
  return (
    <Controller
      control={control}
      name="password"
      render={({ field }) => (
        <PasswordInput
          id="password"
          name={field.name}
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          error={errors.password?.message}
          translationNamespace={props.translationNamespace}
          compact={props.compact}
          className={props.className}
          inputClassName={props.inputClassName}
          placeholder={props.placeholder}
          label={props.label}
        />
      )}
    />
  );
}

export default function RegisterPage() {
  const locale = useLocale();
  const t = useTranslations('auth.register');
  const tAuth = useTranslations('auth');
  const [registerUser, { isLoading, isSuccess, isError, error, data }] = useRegisterMutation();
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

  type RegisterFormValuesLocal = z.infer<typeof registerSchema>;

  const { register, handleSubmit, control, formState: { isValid } } = useForm<RegisterFormValuesLocal>({
    resolver: zodResolver(registerSchema as z.ZodType<RegisterFormValues>),
    mode: "onChange",
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

      // Toujours rediriger vers le dashboard : si pas de workspace ou profil incomplet,
      // le layout ouvrira le CreateWorkspaceModal au lieu de rediriger vers /create-workspace
      setRedirectPath("/dashboard");
      setShouldRedirect(true);
    }
  }, [data, isSuccess, t]);

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
  }, [error, isError, t]);

  // Redirection après inscription réussie : afficher le loader pendant la redirection
  if (shouldRedirect && redirectPath) {
    return (
      <Redirect
        to={removeLocalePrefix(redirectPath)}
        type="replace"
        checkUnsavedChanges={false}
        showLoader={true}
        loaderType="processing"
        delay={500}
      />
    );
  }

  const onSubmit = (values: RegisterFormValues) => {
    registerUser({
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
    });
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    const redirectTo = '/dashboard';
    const apiUrl = `/api/auth/google?redirect=${encodeURIComponent(redirectTo)}&locale=${locale}`;
    window.location.href = apiUrl;
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left: Hero — Apple-style gradient + pattern */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/95 to-primary/90 items-center justify-center p-8 relative overflow-hidden">
        <DotPattern className="text-white opacity-[0.12]" glow />
        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-8 max-w-sm">
          <Image
            src="/logos/logo.png"
            alt="Facturly"
            width={280}
            height={92}
            className="w-auto h-20 brightness-0 invert"
            priority
          />
          <div className="space-y-3">
            <h2 className="text-[28px] font-semibold tracking-tight text-white">
              {t("heroTitle")}
            </h2>
            <p className="text-[15px] text-white/85 leading-relaxed">
              {t("heroDescription")}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Form — premium card */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 bg-gradient-to-b from-muted/20 to-background overflow-y-auto">
        <div className="w-full max-w-[400px] space-y-6">
          <div className="text-center lg:hidden">
            <Image
              src="/icon.png"
              alt="Facturly"
              width={64}
              height={64}
              className="h-14 w-14 mx-auto object-contain rounded-2xl shadow-lg"
              priority
            />
          </div>

          <div className="rounded-[24px] border border-border/40 bg-background/95 dark:bg-background/98 backdrop-blur-sm shadow-2xl shadow-black/5 overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-5 pb-4 text-center">
              <h1 className="text-[24px] font-semibold tracking-tight text-foreground">
                {t("cardTitle")}
              </h1>
              <p className="mt-1 text-[15px] text-muted-foreground">
                {t("cardDescription")}
              </p>
            </div>

            {/* Form */}
            <div className="px-5 pb-5">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-[13px] font-medium text-foreground">
                      {t("fields.firstName")}
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="firstName"
                        type="text"
                        autoComplete="given-name"
                        placeholder={t("placeholders.firstName")}
                        className="pl-10 h-11 rounded-xl border-0 bg-muted/30 text-[15px] focus-visible:ring-2 focus-visible:ring-ring/20"
                        {...register("firstName")}
                      />
                    </div>
                    <RegisterFieldError control={control} name="firstName" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-[13px] font-medium text-foreground">
                      {t("fields.lastName")}
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="lastName"
                        type="text"
                        autoComplete="family-name"
                        placeholder={t("placeholders.lastName")}
                        className="pl-10 h-11 rounded-xl border-0 bg-muted/30 text-[15px] focus-visible:ring-2 focus-visible:ring-ring/20"
                        {...register("lastName")}
                      />
                    </div>
                    <RegisterFieldError control={control} name="lastName" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[13px] font-medium text-foreground">
                    {t("fields.email")}
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder={t("placeholders.email")}
                      className="pl-10 h-11 rounded-xl border-0 bg-muted/30 text-[15px] focus-visible:ring-2 focus-visible:ring-ring/20"
                      {...register("email")}
                    />
                  </div>
                  <RegisterFieldError control={control} name="email" />
                </div>

                <RegisterPasswordField
                  control={control}
                  placeholder={t("placeholders.password")}
                  label={t("fields.password")}
                  translationNamespace="auth.register.passwordStrength"
                  compact
                  className="space-y-1.5"
                  inputClassName="pl-10 pr-10 h-11 rounded-xl border-0 bg-muted/30 text-[15px] focus-visible:ring-2 focus-visible:ring-ring/20"
                />

                <Button
                  type="submit"
                  disabled={!isValid || isLoading}
                  className="w-full h-11 rounded-xl text-[15px] font-semibold gap-2"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isLoading ? t("buttons.creating") : t("buttons.createAccount")}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-[13px] text-muted-foreground">
                    {tAuth("orContinueWith")}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11 rounded-xl text-[15px] font-medium gap-2 border-border/60 bg-muted/20 hover:bg-muted/40"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                {tAuth("continueWithGoogle")}
              </Button>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border/40 bg-muted/20 text-center">
              <p className="text-[15px] text-muted-foreground">
                {t("alreadyHaveAccount")}{" "}
                <Link
                  href="/login"
                  className="font-semibold text-primary hover:underline"
                >
                  {t("signInLink")}
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-[13px] text-muted-foreground/80 px-2">
            {locale === "fr" ? (
              <>
                En créant un compte, vous acceptez nos{" "}
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary hover:underline transition-colors"
                >
                  conditions d&apos;utilisation
                </Link>{" "}
                et notre{" "}
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary hover:underline transition-colors"
                >
                  politique de confidentialité
                </Link>
                .
              </>
            ) : (
              <>
                By creating an account, you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary hover:underline transition-colors"
                >
                  terms of use
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary hover:underline transition-colors"
                >
                  privacy policy
                </Link>
                .
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

