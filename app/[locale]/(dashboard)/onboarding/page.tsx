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
      const hasMissingWorkspaceInfo = workspace.type === 'COMPANY' 
        ? (!workspace.name || !workspace.defaultCurrency)
        : !workspace.defaultCurrency;
      
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

  // Si le workspace existe, vérifier si le profil est déjà complet
  if (workspace) {
    const workspaceCompletion = workspace.profileCompletion ?? 0;
    const hasMissingWorkspaceInfo = workspace.type === 'COMPANY' 
      ? (!workspace.name || !workspace.defaultCurrency)
      : !workspace.defaultCurrency;
    
    if (workspaceCompletion >= 100 && !hasMissingWorkspaceInfo) {
      return null; // La redirection va se faire via useEffect
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-4xl">
        <OnboardingWizard 
          workspace={workspace ?? null}
          onComplete={async () => {
            await refetch();
            router.push('/dashboard');
          }}
        />
      </div>
    </div>
  );
}
