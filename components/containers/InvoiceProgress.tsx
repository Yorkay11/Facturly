'use client';

import React from 'react';
import { Loader2, Save } from 'lucide-react';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export interface InvoiceProgressProps {
  /**
   * Étape actuelle de la création de facture
   * 1 = Client sélectionné
   * 2 = Articles ajoutés
   * 3 = Dates renseignées
   * 4 = Prêt à envoyer
   */
  currentStep: number;
  /**
   * Indique si un brouillon est en cours de sauvegarde
   */
  isSavingDraft?: boolean;
  /**
   * Indique si la facture a été sauvegardée automatiquement
   */
  lastSavedAt?: Date;
  /**
   * Indique si on est en mode édition (facture existante)
   */
  isEditMode?: boolean;
}

const STEPS = [
  { id: 1, key: 'client' },
  { id: 2, key: 'items' },
  { id: 3, key: 'dates' },
  { id: 4, key: 'send' },
] as const;

export function InvoiceProgress({
  currentStep,
  isSavingDraft = false,
  lastSavedAt,
  isEditMode = false,
}: InvoiceProgressProps) {
  const t = useTranslations('invoices.progress');

  // Calculer le pourcentage de progression
  const progressPercentage = (currentStep / STEPS.length) * 100;

  // Formater la date de dernière sauvegarde
  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);

    if (diffSec < 60) {
      return t('saved.justNow');
    }
    if (diffMin < 60) {
      return t('saved.minutesAgo', { count: diffMin });
    }
    const diffHours = Math.floor(diffMin / 60);
    return t('saved.hoursAgo', { count: diffHours });
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        {/* Étapes en ligne horizontale minimaliste */}
        <div className="flex items-center gap-6 flex-1">
          {STEPS.map((step, index) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isPending = step.id > currentStep;

            return (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-2">
                  {/* Numéro de l'étape */}
                  <div
                    className={cn(
                      'flex items-center justify-center w-6 h-6 rounded text-xs font-semibold transition-colors',
                      isCompleted &&
                        'bg-primary text-primary-foreground',
                      isCurrent &&
                        'bg-primary text-primary-foreground',
                      isPending &&
                        'bg-muted text-muted-foreground border border-border'
                    )}
                  >
                    {step.id}
                  </div>
                  {/* Label */}
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isCompleted || isCurrent
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    {t(`steps.${step.key}`)}
                  </span>
                </div>
                {/* Séparateur */}
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'h-px flex-1 transition-colors',
                      step.id < currentStep ? 'bg-primary' : 'bg-border'
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Indicateur de sauvegarde */}
        {(isSavingDraft || lastSavedAt) && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-4 pl-4 border-l border-border">
            {isSavingDraft ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>{t('saving')}</span>
              </>
            ) : lastSavedAt ? (
              <>
                <Save className="h-3 w-3" />
                <span>{formatLastSaved(lastSavedAt)}</span>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
