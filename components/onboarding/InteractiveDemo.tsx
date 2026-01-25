"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, SkipForward, Zap, FileText, Send, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: number; // en secondes
}

export function InteractiveDemo({ onSkip }: { onSkip?: () => void }) {
  const t = useTranslations('onboarding.demo');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const steps: DemoStep[] = [
    {
      id: 1,
      title: t('step1.title'),
      description: t('step1.description'),
      icon: <Zap className="h-8 w-8 text-primary" />,
      duration: 8,
    },
    {
      id: 2,
      title: t('step2.title'),
      description: t('step2.description'),
      icon: <FileText className="h-8 w-8 text-primary" />,
      duration: 10,
    },
    {
      id: 3,
      title: t('step3.title'),
      description: t('step3.description'),
      icon: <Send className="h-8 w-8 text-primary" />,
      duration: 8,
    },
    {
      id: 4,
      title: t('step4.title'),
      description: t('step4.description'),
      icon: <CheckCircle2 className="h-8 w-8 text-primary" />,
      duration: 4,
    },
  ];

  const totalDuration = steps.reduce((acc, step) => acc + step.duration, 0);

  useEffect(() => {
    if (!isPlaying) return;

    const currentStepData = steps[currentStep];
    setTimeRemaining(currentStepData.duration);

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Passer à l'étape suivante
          if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1);
            return steps[currentStep + 1].duration;
          } else {
            // Fin de la démo
            setIsPlaying(false);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentStep]);

  const handlePlay = () => {
    if (currentStep === steps.length - 1 && timeRemaining === 0) {
      // Recommencer depuis le début
      setCurrentStep(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setTimeRemaining(steps[currentStep + 1].duration);
    }
  };

  const handleSkip = () => {
    setIsPlaying(false);
    onSkip?.();
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{t('title')}</h3>
              <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-xs"
            >
              {t('skip')}
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t('step', { current: currentStep + 1, total: steps.length })}</span>
              <span>{timeRemaining}s</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Current Step */}
          <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border">
            <div className="flex-shrink-0 mt-1">
              {currentStepData.icon}
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-semibold">{currentStepData.title}</h4>
              <p className="text-sm text-muted-foreground">
                {currentStepData.description}
              </p>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  index === currentStep
                    ? "bg-primary w-8"
                    : index < currentStep
                    ? "bg-primary/50"
                    : "bg-muted"
                )}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            {!isPlaying ? (
              <Button onClick={handlePlay} size="lg" className="gap-2">
                <Play className="h-4 w-4" />
                {currentStep === steps.length - 1 && timeRemaining === 0
                  ? t('restart')
                  : t('play')}
              </Button>
            ) : (
              <Button onClick={handlePause} variant="outline" size="lg" className="gap-2">
                <Pause className="h-4 w-4" />
                {t('pause')}
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button
                onClick={handleNext}
                variant="outline"
                size="lg"
                className="gap-2"
                disabled={isPlaying}
              >
                <SkipForward className="h-4 w-4" />
                {t('next')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
