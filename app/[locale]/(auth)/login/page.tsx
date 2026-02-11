"use client";

import { Link, useRouter } from '@/i18n/routing';
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useLocale } from 'next-intl';
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { useTranslations } from 'next-intl';
import { removeLocalePrefix } from '@/utils/path-utils';
import { Redirect } from '@/components/navigation';

import { MagicCard } from "@/components/ui/magic-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useLoginMutation } from "@/services/facturlyApi";
import { toast } from "sonner";

import { DotPattern } from "@/components/ui/dot-pattern";
import type { Control } from "react-hook-form";

/** Affiche l’erreur d’un champ ; s’abonne uniquement à ce champ → le parent ne re-render pas à chaque frappe. */
function LoginFieldError({
  control,
  name,
}: {
  control: Control<{ email: string; password: string }>;
  name: "email" | "password";
}) {
  const { errors } = useFormState({ control, name });
  const message = name === "email" ? errors.email?.message : errors.password?.message;
  if (!message) return null;
  return <p className="text-[10px] text-destructive ml-0.5">{message}</p>;
}

function LoginForm() {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  
  // -- State & API --
  const redirectTo = searchParams?.get("redirect") ?? "/dashboard";
  const [login, { isLoading, isSuccess, isError, error, data }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // -- Form Configuration --
  const loginSchema = z.object({
    email: z.string().email(t('invalidEmail')),
    password: z.string().min(6, t('passwordTooShort')),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;

  const { register, handleSubmit, control, formState: { errors, isValid } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange", // Permet au bouton de s'activer dynamiquement
    defaultValues: { email: "", password: "" },
  });

  // -- Handlers --
  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    const apiUrl = `/api/auth/google?redirect=${encodeURIComponent(redirectTo)}&locale=${locale}`;
    window.location.href = apiUrl;
  };

  const onSubmit = (values: LoginFormValues) => {
    login(values);
  };

  // -- Effects : Success & Cookies --
  useEffect(() => {
    if (isSuccess && data) {
      // Gestion des cookies (Côté client)
      if (typeof window !== "undefined") {
        document.cookie = `facturly_access_token=${data.accessToken}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
      }

      const userName = data.firstName && data.lastName 
        ? `${data.firstName} ${data.lastName}` 
        : data.email;

      toast.success(t('loginSuccess'), {
        description: `${tCommon('welcome')} ${userName}`,
      });

      // Déclenche la redirection propre
      setIsRedirecting(true);
    }
  }, [isSuccess, data, t, tCommon]);

  // -- Effects : Errors --
  useEffect(() => {
    if (isError && error) {
      const errorData = "data" in error ? (error.data as { code?: string; message?: string }) : null;
      const errorCode = errorData?.code;
      
      const errorMessages: Record<string, string> = {
        AUTH_UNAUTHORIZED: "Identifiants incorrects. Veuillez réessayer.",
        AUTH_TOKEN_EXPIRED: "Votre session a expiré. Veuillez vous reconnecter.",
      };
      
      const displayMessage = (errorCode && errorMessages[errorCode]) || errorData?.message || "Une erreur est survenue.";
      
      toast.error(t('loginError'), { description: displayMessage });
    }
  }, [error, isError, t]);

  // -- UI Logic --
  // Si on est en train de rediriger, on affiche le composant Redirect global
  if (isRedirecting) {
    return (
      <Redirect
        to={removeLocalePrefix(redirectTo)}
        type="replace"
        showLoader={true}
        loaderType="processing"
        delay={500}
      />
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Section gauche : Identique */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-6 relative overflow-hidden">
        <DotPattern className="text-white opacity-20" glow />
        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-8 max-w-md">
          <Image src="/logos/logo.png" alt="Facturly" width={300} height={100} className="w-auto h-24 brightness-0 invert" priority />
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white">{t('heroTitle')}</h2>
            <p className="text-white/80 text-lg leading-relaxed">{t('heroDescription')}</p>
          </div>
        </div>
      </div>

      {/* Section droite : Formulaire */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-6 bg-gray-50/50">
        <div className="w-full max-w-md space-y-8">
          <MagicCard className="rounded-xl shadow-2xl">
            <CardHeader className="text-center pb-4 pt-6 px-6">
              <CardTitle className="text-xl font-bold">{t('login')}</CardTitle>
              <CardDescription className="text-xs">{t('welcomeBack')}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4 px-6 pb-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[10px] uppercase text-muted-foreground ml-0.5">{t('email')}</Label>
                  <div className="relative group">
                    <Mail className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="vous@entreprise.com"
                      className="pl-9 h-10 text-sm"
                      {...register("email")}
                    />
                  </div>
                  <LoginFieldError control={control} name="email" />
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-[10px] uppercase text-muted-foreground ml-0.5">{t('password')}</Label>
                    <Link href="#" className="text-[10px] text-primary hover:underline">{t('forgotPassword')}</Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="pl-9 pr-9 h-10 text-sm"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <LoginFieldError control={control} name="password" />
                </div>

                <Button
                  type="submit"
                  disabled={!isValid || isLoading}
                  className="w-full gap-2 h-10"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t('signIn')}
                </Button>
              </form>

              {/* Séparateur & Google */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><Separator className="w-full" /></div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white px-2 text-muted-foreground">{t('orContinueWith')}</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full gap-2 h-10"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isLoading}
              >
                {isGoogleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                {t('continueWithGoogle')}
              </Button>
            </CardContent>

            <div className="p-4 bg-gray-50/50 border-t rounded-b-xl text-center">
              <p className="text-xs text-muted-foreground">
                {t('dontHaveAccount')}{" "}
                <Link href="/register" className="text-primary font-semibold hover:underline">{t('createAccount')}</Link>
              </p>
            </div>
          </MagicCard>
        </div>
      </div>
    </div>
  );
}

// Composant SVG Google extrait pour la lisibilité
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/95 to-primary/90 items-center justify-center p-6">
          <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-md">
            <Image
              src="/logos/logo.png"
              alt="Facturly"
              width={300}
              height={100}
              className="w-auto h-24 object-contain brightness-0 invert"
              priority
            />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 lg:p-6 bg-white">
          <div className="w-full max-w-md">
            <Card className="border-primary/20 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
