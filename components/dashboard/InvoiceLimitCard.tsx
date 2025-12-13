"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InvoiceLimit } from "@/services/facturlyApi";
import { AlertTriangle, CheckCircle2, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface InvoiceLimitCardProps {
  invoiceLimit?: InvoiceLimit;
  className?: string;
  showUpgradeButton?: boolean;
  planCode?: string; // Code du plan pour personnaliser l'affichage
}

export function InvoiceLimitCard({ invoiceLimit, className, showUpgradeButton = true, planCode }: InvoiceLimitCardProps) {
  if (!invoiceLimit) {
    return null;
  }

  const isUnlimited = invoiceLimit.isUnlimited;
  const isNearLimit = invoiceLimit.isNearLimit;
  const isLimitReached = invoiceLimit.isLimitReached;
  const percentage = invoiceLimit.percentage ?? 0;
  const isFreePlan = planCode === "free";

  // Déterminer la classe CSS pour la barre de progression
  const getProgressClassName = () => {
    if (isLimitReached) return "bg-red-500";
    if (isNearLimit) return "bg-amber-500";
    return "bg-primary";
  };

  return (
    <Card className={className}>
      <CardHeader className={isFreePlan && !isUnlimited ? "border-b-2 border-amber-200 bg-amber-50/50" : ""}>
        <CardTitle className="flex items-center gap-2">
          {isFreePlan && !isUnlimited ? (
            <>
              <span className="text-amber-700">Plan Gratuit - Limite de factures</span>
              {isNearLimit || isLimitReached ? (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              ) : null}
            </>
          ) : (
            <>
              Limite de factures
              {isUnlimited && <Infinity className="h-4 w-4 text-muted-foreground" />}
            </>
          )}
        </CardTitle>
        <CardDescription className={isFreePlan && !isUnlimited ? "text-amber-700/80" : ""}>
          {isUnlimited
            ? "Votre plan permet un nombre illimité de factures"
            : `Période du ${new Date(invoiceLimit.periodStart).toLocaleDateString("fr-FR")} au ${new Date(invoiceLimit.periodEnd).toLocaleDateString("fr-FR")}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {!isUnlimited && (
          <>
            {/* Barre de progression */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {invoiceLimit.used} / {invoiceLimit.effective} factures
                </span>
                <span className="font-medium">{percentage}%</span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full transition-all duration-300 ease-in-out ${getProgressClassName()}`}
                  style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
                />
              </div>
            </div>

            {/* Informations détaillées */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Utilisées</p>
                <p className="text-lg font-semibold">{invoiceLimit.used}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Restantes</p>
                <p className="text-lg font-semibold">
                  {invoiceLimit.remaining !== null ? invoiceLimit.remaining : "∞"}
                </p>
              </div>
            </div>

            {/* Alertes */}
            {isLimitReached && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Limite atteinte</AlertTitle>
                <AlertDescription>
                  Vous avez atteint votre limite de factures pour cette période. Passez au plan Pro pour des
                  factures illimitées.
                </AlertDescription>
              </Alert>
            )}

            {isNearLimit && !isLimitReached && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Limite proche</AlertTitle>
                <AlertDescription>
                  Vous avez utilisé {percentage}% de votre limite. Il vous reste {invoiceLimit.remaining} facture
                  {invoiceLimit.remaining !== 1 ? "s" : ""} pour cette période.
                </AlertDescription>
              </Alert>
            )}

            {!isNearLimit && !isLimitReached && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Limite disponible</AlertTitle>
                <AlertDescription>
                  Vous avez encore {invoiceLimit.remaining} facture{invoiceLimit.remaining !== 1 ? "s" : ""} disponible
                  {invoiceLimit.remaining !== 1 ? "s" : ""} pour cette période.
                </AlertDescription>
              </Alert>
            )}

            {/* Bouton d'upgrade - Toujours visible pour le plan gratuit */}
            {showUpgradeButton && (isFreePlan || isNearLimit || isLimitReached) && (
              <Button 
                asChild 
                className={`w-full ${isFreePlan ? "bg-primary hover:bg-primary/90" : ""}`}
                variant={isFreePlan ? "default" : "default"}
              >
                <Link href="/settings?tab=subscription">
                  {isFreePlan ? "Passer au plan Pro - Factures illimitées" : "Passer au plan Pro"}
                </Link>
              </Button>
            )}
          </>
        )}

        {isUnlimited && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Factures illimitées</AlertTitle>
            <AlertDescription>
              Votre plan actuel vous permet de créer un nombre illimité de factures.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

