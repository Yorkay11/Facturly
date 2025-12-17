"use client";

import { Link, useRouter } from '@/i18n/routing';
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { useTranslations } from 'next-intl';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useLoginMutation } from "@/services/facturlyApi";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") ?? "/dashboard";
  const [login, { isLoading, isSuccess, isError, error, data }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');

  // Le schéma est créé dans le composant pour utiliser les traductions
  const loginSchema = z.object({
    email: z.string().email(t('invalidEmail')),
    password: z.string().min(6, t('passwordTooShort')),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
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

      toast.success(t('loginSuccess'), {
        description: `${tCommon('welcome')} ${userName}`,
      });

      router.push(redirectTo);
    }
  }, [data, isSuccess, redirectTo, router]);

  useEffect(() => {
    if (isError && error) {
      if (typeof window !== "undefined") {
        document.cookie = "facturly_access_token=; path=/; max-age=0";
        document.cookie = "facturly_refresh_token=; path=/; max-age=0";
      }
      
      // Récupérer le code d'erreur et le message depuis l'erreur RTK Query
      const errorData = error && "data" in error ? (error.data as { code?: string; message?: string }) : null;
      const errorCode = errorData?.code;
      const errorMessage = errorData?.message || "Vérifiez vos identifiants ou réessayez plus tard.";
      
      // Messages d'erreur spécifiques selon le code
      const errorMessages: Record<string, string> = {
        AUTH_UNAUTHORIZED: "Identifiants incorrects. Veuillez réessayer.",
        AUTH_TOKEN_EXPIRED: "Votre session a expiré. Veuillez vous reconnecter.",
        AUTH_TOKEN_INVALID: "Session invalide. Veuillez vous reconnecter.",
        AUTH_TOKEN_MISSING: "Vous devez être connecté pour accéder à cette page.",
      };
      
      const displayMessage = errorCode && errorMessages[errorCode] 
        ? errorMessages[errorCode] 
        : errorMessage;
      
      toast.error(t('loginError'), {
        description: displayMessage,
      });
    }
  }, [error, isError]);

  const onSubmit = (values: LoginFormValues) => {
    login(values);
  };

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
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-semibold text-primary">{t('login')}</CardTitle>
                <CardDescription className="text-foreground/60">
                  {t('welcomeBack')}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="vous@entreprise.com"
                      className="pl-9"
                      {...form.register("email")}
                    />
                  </div>
                  {form.formState.errors.email ? (
                    <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-9 pr-9"
                      {...form.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/60 transition-colors"
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
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
                </div>
                <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {t('signIn')}
                </Button>
              </form>
              <div className="space-y-3 text-center text-sm text-foreground/60">
                <Link href="#" className="text-primary hover:underline">
                  {t('forgotPassword')}
                </Link>
                <Separator />
                <p>
                  {t('dontHaveAccount')} {" "}
                  <Link href="/register" className="text-primary hover:underline">
                    {t('createAccount')}
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/95 to-primary/90 items-center justify-center p-12">
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
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
          <div className="w-full max-w-md">
            <Card className="border-primary/20 shadow-lg">
              <CardContent className="p-6">
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
