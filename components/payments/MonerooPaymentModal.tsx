"use client";

import { useState } from "react";
import { useTranslations } from 'next-intl';
import { CreditCard, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useInitMonerooPaymentMutation } from "@/services/facturlyApi";
import { toast } from "sonner";

interface MonerooPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  amount: string;
  currency: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string; // Optionnel - peut être fourni depuis le client
}

/**
 * Modal simplifié pour initier un paiement Moneroo
 * 
 * Architecture: Hosted Checkout
 * - Le backend génère un lien Moneroo (checkout_url)
 * - L'utilisateur est redirigé vers l'interface Moneroo
 * - Moneroo gère la sélection de méthode (Orange Money, MTN, Wave, etc.)
 * - Pas besoin de demander le numéro de téléphone ici (optionnel)
 */
export function MonerooPaymentModal({
  open,
  onOpenChange,
  invoiceId,
  amount,
  currency,
  customerName,
  customerEmail,
  customerPhone,
}: MonerooPaymentModalProps) {
  const t = useTranslations('payments.moneroo');
  const commonT = useTranslations('common');
  const [initPayment, { isLoading }] = useInitMonerooPaymentMutation();

  const handlePay = async () => {
    try {
      const result = await initPayment({
        invoiceId,
        phoneNumber: customerPhone, // Optionnel - Moneroo peut le demander dans son UI
        customerName,
        customerEmail,
      }).unwrap();

      // Redirection directe vers le Hosted Checkout Moneroo
      // Moneroo gère la sélection de méthode de paiement dans son interface
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        toast.error(commonT('error'), {
          description: t('errors.checkoutUrlMissing'),
        });
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || t('errors.paymentFailed');
      toast.error(commonT('error'), {
        description: errorMessage,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('amount')}</span>
              <span className="font-semibold">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency,
                  maximumFractionDigits: 2,
                }).format(parseFloat(amount))}
              </span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {t('redirectInfo')}
          </p>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {commonT('cancel')}
            </Button>
            <Button onClick={handlePay} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('processing')}
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  {t('continue')}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
