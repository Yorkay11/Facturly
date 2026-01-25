"use client";

import { useState } from "react";
import { useTranslations } from 'next-intl';
import { CreditCard, Loader2, Sparkles, Package, Zap } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetPlansQuery, usePurchaseCreditsMutation, usePurchasePackMutation } from "@/services/facturlyApi";
import { toast } from "sonner";
import { useRouter } from '@/i18n/routing';

interface CreditsPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal pour l'achat de crédits (Pay-as-you-go)
 * Permet d'acheter des crédits unitaires ou des packs prépayés
 */
export function CreditsPurchaseModal({
  open,
  onOpenChange,
}: CreditsPurchaseModalProps) {
  const t = useTranslations('settings.subscription.credits');
  const commonT = useTranslations('common');
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedPack, setSelectedPack] = useState<"starter" | "pro" | "business" | null>(null);

  const { data: plansData, isLoading: isLoadingPlans } = useGetPlansQuery();
  const [purchaseCredits, { isLoading: isPurchasingCredits }] = usePurchaseCreditsMutation();
  const [purchasePack, { isLoading: isPurchasingPack }] = usePurchasePackMutation();

  const plans = plansData?.data || [];
  const unitPlan = plans.find((p) => p.type === "unit");
  const packs = plans.filter((p) => p.type === "pack");

  const isLoading = isPurchasingCredits || isPurchasingPack;

  const handlePurchaseCredits = async () => {
    if (!quantity || quantity < 1) {
      toast.error(commonT('error'), {
        description: t('errors.invalidQuantity'),
      });
      return;
    }

    try {
      const result = await purchaseCredits({ quantity }).unwrap();
      
      if (result.checkoutUrl) {
        // Redirection vers Moneroo Hosted Checkout
        window.location.href = result.checkoutUrl;
      } else {
        toast.error(commonT('error'), {
          description: t('errors.checkoutUrlMissing'),
        });
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || t('errors.purchaseFailed');
      toast.error(commonT('error'), {
        description: errorMessage,
      });
    }
  };

  const handlePurchasePack = async (packType: "starter" | "pro" | "business") => {
    try {
      const result = await purchasePack({ packType }).unwrap();
      
      if (result.checkoutUrl) {
        // Redirection vers Moneroo Hosted Checkout
        window.location.href = result.checkoutUrl;
      } else {
        toast.error(commonT('error'), {
          description: t('errors.checkoutUrlMissing'),
        });
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || t('errors.purchaseFailed');
      toast.error(commonT('error'), {
        description: errorMessage,
      });
    }
  };

  const totalPrice = unitPlan ? quantity * (unitPlan.pricePerInvoice || 150) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Achat unitaire */}
          {unitPlan && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  {t('unitPurchase.title')}
                </CardTitle>
                <CardDescription>
                  {t('unitPurchase.description', { price: unitPlan.pricePerInvoice || 150 })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">{t('unitPurchase.quantity')}</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    disabled={isLoading}
                  />
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {t('unitPurchase.total')}
                    </span>
                    <span className="text-lg font-semibold">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'XOF',
                        maximumFractionDigits: 0,
                      }).format(totalPrice)} FCFA
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t('unitPurchase.credits', { count: quantity })}
                  </div>
                </div>
                <Button
                  onClick={handlePurchaseCredits}
                  disabled={isLoading || !quantity}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('processing')}
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      {t('unitPurchase.cta')}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Packs prépayés */}
          {packs.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                {t('packs.title')}
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                {packs.map((pack) => {
                  if (pack.type !== "pack" || !pack.packType) return null;
                  
                  const savings = pack.pricePerInvoice && unitPlan?.pricePerInvoice
                    ? Math.round(((unitPlan.pricePerInvoice - pack.pricePerInvoice) / unitPlan.pricePerInvoice) * 100)
                    : 0;

                  return (
                    <Card
                      key={pack.packType}
                      className={`relative ${pack.packType === 'pro' ? 'border-primary' : ''}`}
                    >
                      {pack.packType === 'pro' && (
                        <Badge className="absolute -top-2 right-4 bg-primary">
                          {t('packs.popular')}
                        </Badge>
                      )}
                      <CardHeader>
                        <CardTitle className="capitalize">
                          {t(`packs.${pack.packType}.name`)}
                        </CardTitle>
                        <CardDescription>
                          {t(`packs.${pack.packType}.description`)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'XOF',
                              maximumFractionDigits: 0,
                            }).format(pack.price || 0)} FCFA
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {pack.credits} {t('packs.credits')}
                          </div>
                          {savings > 0 && (
                            <div className="text-xs text-green-600 mt-1">
                              {t('packs.savings', { percent: savings })}
                            </div>
                          )}
                        </div>
                        <div className="text-sm">
                          <div className="text-muted-foreground">
                            {t('packs.pricePerInvoice')}
                          </div>
                          <div className="font-semibold">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'XOF',
                              maximumFractionDigits: 0,
                            }).format(pack.pricePerInvoice || 0)} FCFA
                          </div>
                        </div>
                        <Button
                          onClick={() => handlePurchasePack(pack.packType!)}
                          disabled={isLoading}
                          variant={pack.packType === 'pro' ? 'default' : 'outline'}
                          className="w-full"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t('processing')}
                            </>
                          ) : (
                            <>
                              <CreditCard className="mr-2 h-4 w-4" />
                              {t('packs.cta')}
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {isLoadingPlans && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                {t('loading')}
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
