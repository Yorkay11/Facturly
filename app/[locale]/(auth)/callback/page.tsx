"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('auth');

  useEffect(() => {
    const handleCallback = async () => {
      // Récupérer le token depuis l'URL (le backend devrait le passer en query param)
      const token = searchParams?.get('token');
      const accessToken = searchParams?.get('accessToken');
      const error = searchParams?.get('error');
      const redirectTo = searchParams?.get('redirect') || '/dashboard';

      if (error) {
        // Gérer l'erreur
        console.error('OAuth error:', error);
        toast.error(t('loginError'), {
          description: error === 'access_denied' 
            ? t('oauthAccessDenied') 
            : t('oauthError'),
        });
        router.push('/login');
        return;
      }

      // Le backend peut renvoyer le token sous différents noms
      const finalToken = token || accessToken;

      if (finalToken) {
        // Stocker le token dans un cookie
        if (typeof window !== "undefined") {
          document.cookie = `facturly_access_token=${finalToken}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
        }

        toast.success(t('loginSuccess'), {
          description: t('oauthSuccess'),
        });

        // Rediriger vers la page demandée
        router.push(redirectTo);
      } else {
        // Pas de token, rediriger vers login
        toast.error(t('loginError'), {
          description: t('oauthNoToken'),
        });
        router.push('/login');
      }
    };

    handleCallback();
  }, [searchParams, router, t]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <Card className="border-primary/20 shadow-lg">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-foreground/60">
              {t('processing')}...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <Card className="border-primary/20 shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}

