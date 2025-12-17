"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InvoiceLimit } from "@/services/facturlyApi";
import { AlertTriangle, X, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from '@/i18n/routing';
import { useState } from "react";
import { useTranslations } from 'next-intl';

interface InvoiceLimitBannerProps {
  invoiceLimit?: InvoiceLimit;
  planCode?: string; // Code du plan (ex: "free", "pro", "enterprise")
}

export function InvoiceLimitBanner({ invoiceLimit, planCode }: InvoiceLimitBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const t = useTranslations('invoiceLimit');
  const tDashboard = useTranslations('dashboard');

  // Ne pas afficher si :
  // - Pas de limite (plan illimité)
  // - Plan payant (planCode !== "free" signifie que plan !== null)
  // - Banner fermé
  if (!invoiceLimit || invoiceLimit.isUnlimited || planCode !== "free" || isDismissed) {
    return null;
  }

  const isNearLimit = invoiceLimit.isNearLimit;
  const isLimitReached = invoiceLimit.isLimitReached;
  const percentage = invoiceLimit.percentage ?? 0;
  const remaining = invoiceLimit.remaining ?? 0;

  return (
    <Alert
      variant={isLimitReached ? "destructive" : "default"}
      className="relative border-2 shadow-sm overflow-hidden bg-transparent"
    >
      {/* Gradient animé en vague */}
      <div className="absolute inset-0 animate-wave-gradient" />
      <div className="relative z-10 text-white">
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 text-white"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">{t('close')}</span>
      </button>

      <div className="flex items-start gap-4 pr-8">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 text-white" />
        <div className="flex-1 space-y-2">
          <AlertTitle className="text-base text-white">
            {isLimitReached
              ? t('limitReached')
              : isNearLimit
              ? t('nearLimit')
              : t('freePlan')}
          </AlertTitle>
          <AlertDescription className="space-y-3 text-white/90">
            <p>
              {isLimitReached ? (
                <>
                  Vous avez atteint votre limite de <strong className="text-white">{invoiceLimit.effective ?? 0}</strong> factures pour cette période. Passez au plan Pro pour créer des factures illimitées.
                </>
              ) : isNearLimit ? (
                <>
                  Vous avez utilisé <strong className="text-white">{percentage}%</strong> de votre limite. Il vous reste{" "}
                  <strong className="text-white">{remaining}</strong> {remaining !== 1 ? tDashboard('invoices') : tDashboard('invoice')} pour cette période.
                </>
              ) : (
                <>
                  Vous avez utilisé <strong className="text-white">{invoiceLimit.used}</strong> sur <strong className="text-white">{invoiceLimit.effective ?? 0}</strong>{" "}
                  factures disponibles ce mois. Il vous reste <strong className="text-white">{remaining}</strong> {remaining !== 1 ? tDashboard('invoices') : tDashboard('invoice')}.
                </>
              )}
            </p>

            {/* Barre de progression compacte */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/80">
                  {t('progress', { used: invoiceLimit.used, effective: invoiceLimit.effective ?? 0 })}
                </span>
                <span className="font-medium text-white">{percentage}%</span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-md bg-white/20">
                <div
                  className={`h-full transition-all duration-300 ease-in-out ${
                    isLimitReached ? "bg-red-400" : isNearLimit ? "bg-amber-400" : "bg-white"
                  }`}
                  style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
                />
              </div>
            </div>

            {/* Bouton d'action */}
            <div className="flex gap-2 pt-1">
              <Button 
                asChild 
                size="sm" 
                variant={isLimitReached ? "default" : "outline"} 
                className={
                  isLimitReached 
                    ? "bg-white text-purple-900 hover:bg-white/95 hover:shadow-lg border-white transition-all duration-200 font-semibold" 
                    : "border-white/50 text-white hover:bg-white/15 hover:border-white/70 hover:text-white bg-white/5 backdrop-blur-sm transition-all duration-200 font-medium"
                }
              >
                <Link href="/settings?tab=subscription">
                  {isLimitReached ? t('upgradeToPro') : t('viewPlans')}
                </Link>
              </Button>
              {!isLimitReached && (
                <Button 
                  asChild 
                  size="sm" 
                  className="bg-white text-purple-900 hover:bg-white/95 hover:shadow-lg hover:scale-[1.02] border-white shadow-md transition-all duration-200 font-semibold"
                >
                  <Link href="/settings?tab=subscription">{t('upgradeNow')}</Link>
                </Button>
              )}
            </div>
          </AlertDescription>
        </div>
      </div>
      </div>
    </Alert>
  );
}

