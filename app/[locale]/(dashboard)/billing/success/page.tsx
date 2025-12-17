"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from '@/i18n/routing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useGetSubscriptionQuery } from "@/services/facturlyApi";
import Breadcrumb from "@/components/ui/breadcrumb";
import { Link } from '@/i18n/routing';

function BillingSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  
  const { data: subscription, isLoading, refetch } = useGetSubscriptionQuery();

  useEffect(() => {
    // Rafraîchir l'abonnement après quelques secondes pour s'assurer que le webhook a été traité
    if (sessionId) {
      const timer = setTimeout(() => {
        refetch();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sessionId, refetch]);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Breadcrumb
        items={[
          { label: "Paramètres", href: "/settings" },
          { label: "Paiement réussi", href: "/billing/success" },
        ]}
      />

      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-900">Paiement réussi !</CardTitle>
            <CardDescription className="text-base mt-2">
              Votre abonnement a été activé avec succès.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Vérification de votre abonnement...
                </span>
              </div>
            ) : subscription ? (
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                       <p className="text-sm text-muted-foreground">Plan actuel</p>
                       <p className="text-lg font-semibold">
                         {subscription.plan === "free" ? "Gratuit" : subscription.plan === "pro" ? "Pro" : "Enterprise"}
                       </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Statut</p>
                      <p className="text-lg font-semibold text-green-600 capitalize">
                        {subscription.status}
                      </p>
                    </div>
                  </div>
                </div>

                {sessionId && (
                  <div className="text-sm text-muted-foreground text-center">
                    <p>Session ID: {sessionId}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Votre abonnement sera mis à jour automatiquement dans quelques instants.
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center pt-4">
              <Button asChild>
                <Link href="/settings?tab=subscription">
                  Voir mon abonnement
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">
                  Retour au tableau de bord
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 space-y-6">
        <Breadcrumb
          items={[
            { label: "Paramètres", href: "/settings" },
            { label: "Paiement réussi", href: "/billing/success" },
          ]}
        />
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="py-8">
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Chargement...
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <BillingSuccessContent />
    </Suspense>
  );
}

