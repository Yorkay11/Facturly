"use client";

import { useState } from "react";
import { useRouter } from '@/i18n/routing';
import { useGetWorkspaceQuery } from "@/services/facturlyApi";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { Skeleton } from "@/components/ui/skeleton";
import { Redirect, ConditionalRedirect } from '@/components/navigation';

export default function CreateWorkspacePage() {
  const router = useRouter();
  const { data: workspace, isLoading, refetch } = useGetWorkspaceQuery();
  const [shouldRedirectToDashboard, setShouldRedirectToDashboard] = useState(false);

  // Vérifier si le profil est complet
  const isProfileComplete = workspace && !isLoading ? (() => {
    const workspaceCompletion = workspace.profileCompletion ?? 0;
    const hasMissingWorkspaceInfo = workspace.type === 'COMPANY'
      ? !workspace.name
      : false;
    return workspaceCompletion >= 100 && !hasMissingWorkspaceInfo;
  })() : false;

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

  return (
    <>
      {/* Redirection si le profil est déjà complet */}
      <ConditionalRedirect
        condition={isProfileComplete === true}
        to="/dashboard"
        type="replace"
        checkUnsavedChanges={false}
        showLoader={true}
        loaderType="redirect"
      />

      {/* Redirection après complétion de la création du workspace */}
      {shouldRedirectToDashboard && (
        <Redirect
          to="/dashboard?showIntro=1"
          type="replace"
          checkUnsavedChanges={false}
          showLoader={true}
          loaderType="processing"
          delay={500}
        />
      )}

      {(!workspace || !isProfileComplete) && (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-8">
          <OnboardingWizard
            workspace={workspace || null}
            onComplete={async () => {
              await refetch();
              setShouldRedirectToDashboard(true);
            }}
          />
        </div>
      )}
    </>
  );
}
