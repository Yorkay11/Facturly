"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Zap, User, DollarSign, Send, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetSelector?: string; // Sélecteur CSS pour pointer vers un élément
}

export function InvoiceTutorial({ 
  onComplete, 
  onSkip 
}: { 
  onComplete: () => void;
  onSkip: () => void;
}) {
  const t = useTranslations('invoices.tutorial');
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps: TutorialStep[] = [
    {
      id: 1,
      title: t('step1.title'),
      description: t('step1.description'),
      icon: <Zap className="h-6 w-6 text-primary" />,
    },
    {
      id: 2,
      title: t('step2.title'),
      description: t('step2.description'),
      icon: <User className="h-6 w-6 text-primary" />,
      targetSelector: '[data-tutorial="client-select"]',
    },
    {
      id: 3,
      title: t('step3.title'),
      description: t('step3.description'),
      icon: <DollarSign className="h-6 w-6 text-primary" />,
      targetSelector: '[data-tutorial="amount-input"]',
    },
    {
      id: 4,
      title: t('step4.title'),
      description: t('step4.description'),
      icon: <Send className="h-6 w-6 text-primary" />,
      targetSelector: '[data-tutorial="send-button"]',
    },
    {
      id: 5,
      title: t('step5.title'),
      description: t('step5.description'),
      icon: <CheckCircle2 className="h-6 w-6 text-primary" />,
    },
  ];

  useEffect(() => {
    // Scroll vers l'élément cible si défini
    if (steps[currentStep].targetSelector) {
      const element = document.querySelector(steps[currentStep].targetSelector);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Ajouter un highlight temporaire
        element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
        }, 2000);
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
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog open={isVisible} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {currentStepData.icon}
              {t('title')}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            {t('subtitle', { current: currentStep + 1, total: steps.length })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Progress */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              {t('progress', { current: currentStep + 1, total: steps.length })}
            </p>
          </div>

          {/* Step Content */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{currentStepData.title}</h3>
            <p className="text-sm text-muted-foreground">
              {currentStepData.description}
            </p>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === currentStep
                    ? "bg-primary w-8"
                    : index < currentStep
                    ? "bg-primary/50 w-2"
                    : "bg-muted w-2"
                )}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-xs"
          >
            {t('skip')}
          </Button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                size="sm"
              >
                {t('previous')}
              </Button>
            )}
            <Button onClick={handleNext} size="sm">
              {currentStep === steps.length - 1 ? t('finish') : t('next')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
