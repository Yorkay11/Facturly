"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useGetWorkspaceQuery } from "@/services/facturlyApi";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { CreateWorkspaceModal } from "@/components/workspace/CreateWorkspaceModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Redirect } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { FaPlus } from "react-icons/fa6";

export default function CreateWorkspacePage() {
  const router = useRouter();
  const t = useTranslations("createWorkspace");
  const { data: workspace, isLoading, refetch } = useGetWorkspaceQuery();
  const [shouldRedirectToDashboard, setShouldRedirectToDashboard] = useState(false);
  const [addWorkspaceModalOpen, setAddWorkspaceModalOpen] = useState(false);

  const isProfileComplete =
    workspace &&
    !isLoading
      ? (() => {
          const workspaceCompletion = workspace.profileCompletion ?? 0;
          const hasMissingWorkspaceInfo =
            workspace.type === "COMPANY" ? !workspace.name : false;
          return workspaceCompletion >= 100 && !hasMissingWorkspaceInfo;
        })()
      : false;

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

  // Profil déjà complet : afficher la page avec un bouton pour ouvrir le modal "créer un autre espace"
  if (isProfileComplete) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4">
        <CreateWorkspaceModal
          open={addWorkspaceModalOpen}
          onOpenChange={(open) => {
            setAddWorkspaceModalOpen(open);
            if (!open) router.replace("/dashboard");
          }}
          isAdditionalWorkspace={true}
        />
        <p className="text-[15px] text-muted-foreground mb-4 text-center">
          {t("profileCompleteHint")}
        </p>
        <Button
          onClick={() => setAddWorkspaceModalOpen(true)}
          className="rounded-xl gap-2"
        >
          <FaPlus className="h-4 w-4" />
          {t("openModalToAddAnother")}
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.replace("/dashboard")}
          className="mt-3 text-muted-foreground"
        >
          {t("backToDashboard")}
        </Button>
      </div>
    );
  }

  return (
    <>
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
