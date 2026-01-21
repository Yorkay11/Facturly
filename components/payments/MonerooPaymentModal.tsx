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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
}

export function MonerooPaymentModal({
  open,
  onOpenChange,
  invoiceId,
  amount,
  currency,
  customerName,
  customerEmail,
}: MonerooPaymentModalProps) {
  const t = useTranslations('payments.moneroo');
  const commonT = useTranslations('common');
  const [phoneNumber, setPhoneNumber] = useState("");
  const [initPayment, { isLoading }] = useInitMonerooPaymentMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      toast.error(commonT('error'), {
        description: t('errors.phoneRequired'),
      });
      return;
    }

    // Valider le format du numéro de téléphone (format international)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      toast.error(commonT('error'), {
        description: t('errors.invalidPhoneFormat'),
      });
      return;
    }

    try {
      const result = await initPayment({
        invoiceId,
        phoneNumber: phoneNumber.trim(),
        customerName,
        customerEmail,
      }).unwrap();

      // Rediriger vers la page de paiement Moneroo où l'utilisateur choisira sa méthode
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">{t('phoneNumber')}</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+221771234567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground">{t('phoneHint')}</p>
          </div>

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
            <Button type="submit" disabled={isLoading || !phoneNumber.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('processing')}
                </>
              ) : (
                t('continue')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
