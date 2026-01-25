"use client";

import { useEffect } from "react";
import { useRouter } from '@/i18n/routing';
import { useGetWorkspaceQuery } from "@/services/facturlyApi";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { Skeleton } from "@/components/ui/skeleton";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: workspace, isLoading, refetch } = useGetWorkspaceQuery();

  // Si le profil est déjà complet, rediriger vers le dashboard
  useEffect(() => {
    if (!isLoading && workspace) {
      const workspaceCompletion = workspace.profileCompletion ?? 0;
      // PHASE 3.1 : Onboarding simplifié - Pour INDIVIDUAL, toujours complet (defaultCurrency a une valeur par défaut)
      // Pour COMPANY, seulement le nom est requis
      const hasMissingWorkspaceInfo = workspace.type === 'COMPANY' 
        ? !workspace.name
        : false; // INDIVIDUAL n'a plus besoin de defaultCurrency (valeur par défaut)
      
      // Si le profil est complet, rediriger
      if (workspaceCompletion >= 100 && !hasMissingWorkspaceInfo) {
        router.push('/dashboard');
      }
    }
  }, [workspace, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Le workspace existe toujours maintenant (créé automatiquement à l'inscription)
  // Si le profil est déjà complet, rediriger vers le dashboard
  if (!workspace) {
    // Le workspace devrait toujours exister, mais au cas où...
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const workspaceCompletion = workspace.profileCompletion ?? 0;
  // PHASE 3.1 : Onboarding simplifié - Pour INDIVIDUAL, toujours complet (defaultCurrency a une valeur par défaut)
  // Pour COMPANY, seulement le nom est requis
  const hasMissingWorkspaceInfo = workspace.type === 'COMPANY' 
    ? !workspace.name
    : false; // INDIVIDUAL n'a plus besoin de defaultCurrency (valeur par défaut)
  
  if (workspaceCompletion >= 100 && !hasMissingWorkspaceInfo) {
    return null; // La redirection va se faire via useEffect
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-4xl">
        <OnboardingWizard 
          workspace={workspace}
          onComplete={async () => {
            await refetch();
            // Redirection guidée vers la création de la première facture
            router.push('/invoices/new?from=onboarding');
          }}
        />
      </div>
    </div>
  );
}
