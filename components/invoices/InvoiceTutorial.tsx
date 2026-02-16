"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Zap,
  User,
  DollarSign,
  Send,
  CheckCircle2,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetSelector?: string;
}

interface StepPreviewProps {
  stepIndex: number;
  t: (key: string, values?: Record<string, string | number>) => string;
}

function StepPreview({ stepIndex, t }: StepPreviewProps) {
  const base = "invoices.tutorial";

  if (stepIndex === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-primary/8 via-primary/5 to-transparent dark:from-primary/12 dark:via-primary/8 border border-border/40 p-6 flex flex-col items-center justify-center min-h-[120px]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm mb-3">
          <Zap className="h-6 w-6" />
        </div>
        <p className="text-[15px] font-semibold text-foreground tracking-tight">
          {t(`${base}.step1.previewTagline`)}
        </p>
      </div>
    );
  }

  if (stepIndex === 1) {
    return (
      <div className="rounded-2xl bg-muted/40 dark:bg-muted/20 border border-border/40 overflow-hidden">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 pt-3 pb-2">
          {t(`${base}.step2.previewPlaceholder`)}
        </p>
        <div className="px-4 pb-4 space-y-1">
          <div className="flex items-center gap-3 rounded-xl bg-background/80 dark:bg-background/60 border border-border/50 px-3 py-2.5 shadow-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <User className="h-4 w-4" />
            </div>
            <span className="text-[15px] font-medium text-foreground">
              {t(`${base}.step2.client1`)}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
          </div>
          <div className="flex items-center gap-3 rounded-xl px-3 py-2 opacity-75">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0" />
            <span className="text-[14px] text-muted-foreground">
              {t(`${base}.step2.client2`)}
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-xl px-3 py-2 opacity-60">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0" />
            <span className="text-[14px] text-muted-foreground">
              {t(`${base}.step2.client3`)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (stepIndex === 2) {
    return (
      <div className="rounded-2xl bg-muted/40 dark:bg-muted/20 border border-border/40 overflow-hidden">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-4 pt-3 pb-2">
          {t(`${base}.step3.previewLabel`)}
        </p>
        <div className="px-4 pb-4">
          <div className="flex items-center gap-3 rounded-xl bg-background/80 dark:bg-background/60 border border-border/50 px-3 py-3 shadow-sm">
            <DollarSign className="h-5 w-5 text-muted-foreground shrink-0" />
            <span className="text-[17px] font-semibold tabular-nums text-foreground tracking-tight">
              {t(`${base}.step3.amountExample`)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (stepIndex === 3) {
    return (
      <div className="rounded-2xl bg-muted/40 dark:bg-muted/20 border border-border/40 p-4 flex flex-col items-center justify-center min-h-[100px]">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-95 transition-opacity cursor-default"
          tabIndex={-1}
        >
          <Send className="h-4 w-4" />
          {t(`${base}.step4.sendButtonLabel`)}
        </button>
      </div>
    );
  }

  if (stepIndex === 4) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-500/15 dark:via-emerald-500/10 border border-emerald-500/20 p-6 flex flex-col items-center justify-center min-h-[120px]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm mb-3">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <p className="text-[15px] font-semibold text-foreground tracking-tight">
          {t(`${base}.step5.successLabel`)}
        </p>
      </div>
    );
  }

  return null;
}

export function InvoiceTutorial({
  onComplete,
  onSkip,
}: {
  onComplete: () => void;
  onSkip: () => void;
}) {
  const t = useTranslations("invoices.tutorial");
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps: TutorialStep[] = [
    {
      id: 1,
      title: t("step1.title"),
      description: t("step1.description"),
      icon: <Zap className="h-5 w-5 text-primary" />,
    },
    {
      id: 2,
      title: t("step2.title"),
      description: t("step2.description"),
      icon: <User className="h-5 w-5 text-primary" />,
      targetSelector: '[data-tutorial="client-select"]',
    },
    {
      id: 3,
      title: t("step3.title"),
      description: t("step3.description"),
      icon: <DollarSign className="h-5 w-5 text-primary" />,
      targetSelector: '[data-tutorial="amount-input"]',
    },
    {
      id: 4,
      title: t("step4.title"),
      description: t("step4.description"),
      icon: <Send className="h-5 w-5 text-primary" />,
      targetSelector: '[data-tutorial="send-button"]',
    },
    {
      id: 5,
      title: t("step5.title"),
      description: t("step5.description"),
      icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
    },
  ];

  useEffect(() => {
    if (steps[currentStep].targetSelector) {
      const element = document.querySelector(steps[currentStep].targetSelector!);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("ring-2", "ring-primary", "ring-offset-2");
        const timeout = setTimeout(() => {
          element.classList.remove("ring-2", "ring-primary", "ring-offset-2");
        }, 2000);
        return () => clearTimeout(timeout);
      }
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkip();
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];

  return (
    <Dialog open={isVisible} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[400px] rounded-[20px] border border-border/40 bg-background/98 dark:bg-background/99 backdrop-blur-2xl shadow-2xl shadow-black/5 p-0 gap-0 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-[17px] font-semibold tracking-tight text-foreground">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                {currentStepData.icon}
              </div>
              <span>{t("title")}</span>
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="h-9 w-9 rounded-full hover:bg-muted/60 text-muted-foreground shrink-0"
              aria-label={t("skip")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-[13px] text-muted-foreground mt-1">
            {t("subtitle", {
              current: currentStep + 1,
              total: steps.length,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 pb-5 space-y-4">
          {/* Progress — Apple-style segments */}
          <div className="flex justify-center gap-1.5">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1 flex-1 max-w-10 rounded-full transition-all duration-300 ease-out",
                  index === currentStep
                    ? "bg-primary"
                    : index < currentStep
                      ? "bg-primary/50"
                      : "bg-muted/60"
                )}
              />
            ))}
          </div>

          {/* Step preview — live mock UI */}
          <div
            key={currentStep}
            className="animate-in fade-in-50 duration-300 slide-in-from-bottom-2"
          >
            <StepPreview stepIndex={currentStep} t={t} />
          </div>

          {/* Step copy */}
          <div className="space-y-1.5">
            <h3 className="font-semibold text-[17px] tracking-tight text-foreground">
              {currentStepData.title}
            </h3>
            <p className="text-[15px] text-muted-foreground leading-relaxed">
              {currentStepData.description}
            </p>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between px-5 py-4 border-t border-border/40 bg-muted/20">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-[15px] font-medium text-muted-foreground hover:bg-muted/60 rounded-xl"
          >
            {t("skip")}
          </Button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                size="sm"
                className="h-9 rounded-xl border-border/60 text-[15px] font-medium"
              >
                {t("previous")}
              </Button>
            )}
            <Button
              onClick={handleNext}
              size="sm"
              className="h-9 rounded-xl px-4 font-semibold text-[15px]"
            >
              {currentStep === steps.length - 1 ? t("finish") : t("next")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
