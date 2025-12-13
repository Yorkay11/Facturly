"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import Breadcrumb from "@/components/ui/breadcrumb";
import Link from "next/link";

export default function BillingCancelPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Breadcrumb
        items={[
          { label: "Paramètres", href: "/settings" },
          { label: "Paiement annulé", href: "/billing/cancel" },
        ]}
      />

      <div className="max-w-2xl mx-auto">
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-orange-100 p-3">
                <XCircle className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-orange-900">Paiement annulé</CardTitle>
            <CardDescription className="text-base mt-2">
              Votre paiement a été annulé. Aucun montant n'a été débité.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <p className="text-sm text-muted-foreground text-center">
                Vous pouvez réessayer à tout moment depuis la page des paramètres.
              </p>
            </div>

            <div className="flex gap-4 justify-center pt-4">
              <Button asChild>
                <Link href="/settings?tab=subscription">
                  Retour aux paramètres
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

