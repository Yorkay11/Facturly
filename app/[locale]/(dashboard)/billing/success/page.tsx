"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Breadcrumb from "@/components/ui/breadcrumb";
import { Link } from "@/i18n/routing";

export default function BillingSuccessPage() {
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
            <CardTitle className="text-2xl text-green-900">Paiement réussi</CardTitle>
            <CardDescription className="text-base mt-2">
              Votre paiement a bien été enregistré.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link href="/dashboard">Retour au tableau de bord</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/settings">Paramètres</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
