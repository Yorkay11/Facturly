"use client";

import { useEffect, Suspense, useState } from "react";
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { toast } from "sonner";
import { removeLocalePrefix } from '@/utils/path-utils';
import { Redirect } from '@/components/navigation';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('auth');
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Récupérer le token depuis l'URL (le backend devrait le passer en query param)
      const token = searchParams?.get('token');
      const accessToken = searchParams?.get('accessToken');
      const error = searchParams?.get('error');
      const redirectPath = searchParams?.get('redirect') || '/dashboard';

      if (error) {
        // Gérer l'erreur
        console.error('OAuth error:', error);
        toast.error(t('loginError'), {
          description: error === 'access_denied' 
            ? t('oauthAccessDenied') 
            : t('oauthError'),
        });
        setRedirectTo('/login');
        setShouldRedirect(true);
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

        // Retirer le préfixe de locale si présent (router.push l'ajoute automatiquement)
        const cleanPath = removeLocalePrefix(redirectPath);
        setRedirectTo(cleanPath);
        setShouldRedirect(true);
      } else {
        // Pas de token, rediriger vers login
        toast.error(t('loginError'), {
          description: t('oauthNoToken'),
        });
        setRedirectTo('/login');
        setShouldRedirect(true);
      }
    };

    handleCallback();
  }, [searchParams, router, t]);

  if (shouldRedirect && redirectTo) {
    return (
      <Redirect
        to={redirectTo}
        type="replace"
        checkUnsavedChanges={false}
        showLoader={true}
        loaderType="processing"
        delay={500}
      />
    );
  }

  return null;
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <Redirect
        to="/login"
        showLoader={true}
        loaderType="processing"
        checkUnsavedChanges={false}
      />
    }>
      <CallbackHandler />
    </Suspense>
  );
}

