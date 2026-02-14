"use client";

import React, { useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { IntroDisclosure } from "@/components/ui/intro-disclosure";
import { FuryMascot } from "@/components/mascot";
import { toast } from "sonner";
import type { FuryMood } from "@/components/mascot";
import DashboardIntelligence from "@/components/landing/bento/dashboard-intelligence";
import InvoiceCreation from "@/components/landing/bento/invoice-creation";
import ClientManagement from "@/components/landing/bento/client-management";
import PaymentTracking from "@/components/landing/bento/payment-tracking";

const FEATURE_ID = "facturly-intro";

// Composants bento (code UI du landing) + humeur Fury par étape
const STEP_PREVIEWS: { Component: React.ComponentType; furyMood: FuryMood }[] = [
  { Component: DashboardIntelligence, furyMood: "welcome" },
  { Component: InvoiceCreation, furyMood: "focus" },
  { Component: ClientManagement, furyMood: "smile" },
  { Component: PaymentTracking, furyMood: "happy" },
];

export function FacturlyIntroTutorial({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const t = useTranslations("dashboard.intro");

  const steps = useMemo(
    () => [
      {
        title: t("step1.title"),
        short_description: t("step1.shortDescription"),
        full_description: t("step1.fullDescription"),
        media: {
          type: "image" as const,
          src: "/mascot/fury_welcome.webp",
          alt: "Facturly",
        },
      },
      {
        title: t("step2.title"),
        short_description: t("step2.shortDescription"),
        full_description: t("step2.fullDescription"),
        media: {
          type: "image" as const,
          src: "/mascot/fury_focus.webp",
          alt: "Factures",
        },
        action: {
          label: t("actionCreateInvoice"),
          href: "/invoices/new",
        },
      },
      {
        title: t("step3.title"),
        short_description: t("step3.shortDescription"),
        full_description: t("step3.fullDescription"),
        media: {
          type: "image" as const,
          src: "/mascot/fury_smile.webp",
          alt: "Clients",
        },
        action: {
          label: t("actionClients"),
          href: "/clients",
        },
      },
      {
        title: t("step4.title"),
        short_description: t("step4.shortDescription"),
        full_description: t("step4.fullDescription"),
        media: {
          type: "image" as const,
          src: "/mascot/fury_happy.webp",
          alt: "Facturly",
        },
      },
    ],
    [t]
  );

  const handleComplete = () => {
    setOpen(false);
    toast.success("Tutoriel terminé");
  };

  const handleSkip = () => {
    setOpen(false);
    toast.info("Tutoriel passé");
  };

  const labels = {
    skip: t("skip"),
    previous: t("previous"),
    next: t("next"),
    done: t("done"),
    dontShowAgain: t("dontShowAgain"),
  };

  const renderStepPreview = useCallback((_step: unknown, stepIndex: number) => {
    const config = STEP_PREVIEWS[Math.min(stepIndex, STEP_PREVIEWS.length - 1)];
    if (!config) return null;
    const { Component, furyMood } = config;
    return (
      <div className="relative w-full h-full min-h-0 absolute inset-0 bg-background">
        <div className="absolute inset-0 w-full h-full">
          <Component />
        </div>
        <div className="absolute bottom-4 right-4 z-20 drop-shadow-md pointer-events-none">
          <FuryMascot mood={furyMood} size="xs" animated={true} />
        </div>
      </div>
    );
  }, []);

  return (
    <IntroDisclosure
      open={open}
      setOpen={setOpen}
      title={t("title")}
      steps={steps}
      featureId={FEATURE_ID}
      showProgressBar={true}
      onComplete={handleComplete}
      onSkip={handleSkip}
      labels={labels}
      renderStepPreview={renderStepPreview}
    />
  );
}
