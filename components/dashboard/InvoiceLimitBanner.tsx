"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InvoiceLimit } from "@/services/facturlyApi";
import { AlertTriangle, X, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

interface InvoiceLimitBannerProps {
  invoiceLimit?: InvoiceLimit;
  planCode?: string; // Code du plan (ex: "free", "pro", "enterprise")
}

export function InvoiceLimitBanner({ invoiceLimit, planCode }: InvoiceLimitBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Ne pas afficher si :
  // - Pas de limite (plan illimité)
  // - Plan payant
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
      className="relative border-2 shadow-lg"
    >
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Fermer</span>
      </button>

      <div className="flex items-start gap-4 pr-8">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <AlertTitle className="text-base">
            {isLimitReached
              ? "Limite de factures atteinte"
              : isNearLimit
              ? "Limite de factures proche"
              : "Plan gratuit - Limite de factures"}
          </AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              {isLimitReached ? (
                <>
                  Vous avez atteint votre limite de <strong>{invoiceLimit.effective} factures</strong> pour cette
                  période. Passez au plan Pro pour créer des factures illimitées.
                </>
              ) : isNearLimit ? (
                <>
                  Vous avez utilisé <strong>{percentage}%</strong> de votre limite. Il vous reste{" "}
                  <strong>{remaining} facture{remaining !== 1 ? "s" : ""}</strong> pour cette période.
                </>
              ) : (
                <>
                  Vous avez utilisé <strong>{invoiceLimit.used}</strong> sur <strong>{invoiceLimit.effective}</strong>{" "}
                  factures disponibles ce mois. Il vous reste <strong>{remaining} facture{remaining !== 1 ? "s" : ""}</strong>.
                </>
              )}
            </p>

            {/* Barre de progression compacte */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {invoiceLimit.used} / {invoiceLimit.effective} factures
                </span>
                <span className="font-medium">{percentage}%</span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full transition-all duration-300 ease-in-out ${
                    isLimitReached ? "bg-red-500" : isNearLimit ? "bg-amber-500" : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
                />
              </div>
            </div>

            {/* Bouton d'action */}
            <div className="flex gap-2 pt-1">
              <Button asChild size="sm" variant={isLimitReached ? "default" : "outline"}>
                <Link href="/settings?tab=subscription">
                  {isLimitReached ? "Passer au plan Pro" : "Voir les plans"}
                </Link>
              </Button>
              {!isLimitReached && (
                <Button asChild size="sm" variant="default">
                  <Link href="/settings?tab=subscription">Upgrade maintenant</Link>
                </Button>
              )}
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}

