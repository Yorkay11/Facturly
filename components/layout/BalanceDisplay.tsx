"use client";

import { useGetWorkspaceQuery } from "@/services/facturlyApi";
import { Button } from "@/components/ui/button";
import { FaWallet } from "react-icons/fa6";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BalanceDisplayProps {
  className?: string;
  variant?: "default" | "compact";
}

export function BalanceDisplay({ className, variant = "default" }: BalanceDisplayProps) {
  const { data: workspace, isLoading } = useGetWorkspaceQuery();
  const locale = useLocale();
  const [dialogOpen, setDialogOpen] = useState(false);

  const balance = workspace?.balance ? parseFloat(workspace.balance) : 0;
  const currency = workspace?.balanceCurrency || workspace?.defaultCurrency || "XOF";

  const formatBalance = (amount: number, curr: string) => {
    return new Intl.NumberFormat(locale === 'fr' ? "fr-FR" : "en-US", {
      style: "currency",
      currency: curr,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatBalanceCompact = (amount: number, curr: string) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M ${curr}`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K ${curr}`;
    }
    return `${Math.round(amount)} ${curr}`;
  };

  if (isLoading) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn("gap-2 h-8", className)}
        disabled
      >
        <FaWallet className="h-3.5 w-3.5" />
        <span className="text-xs">--</span>
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "gap-2 h-8 border-primary/20 hover:border-primary/40 hover:bg-primary/5",
          className
        )}
        onClick={() => setDialogOpen(true)}
      >
        <FaWallet className="h-3.5 w-3.5 text-primary" />
        {variant === "compact" ? (
          <span className="text-xs font-medium">
            {formatBalanceCompact(balance, currency)}
          </span>
        ) : (
          <span className="hidden md:inline text-xs font-medium">
            {formatBalance(balance, currency)}
          </span>
        )}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Solde disponible</DialogTitle>
            <DialogDescription>
              Montant disponible pour retrait
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">
                {formatBalance(balance, currency)}
              </div>
              <p className="text-sm text-muted-foreground">
                Solde retirable
              </p>
            </div>
            <div className="mt-6 space-y-2">
              <Button
                className="w-full"
                onClick={() => {
                  // TODO: Implémenter la fonctionnalité de retrait
                  setDialogOpen(false);
                }}
              >
                Retirer des fonds
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                La fonctionnalité de retrait sera disponible prochainement
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
