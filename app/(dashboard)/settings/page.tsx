import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Breadcrumb from "@/components/ui/breadcrumb";

const sections = [
  { value: "profile", label: "Profil" },
  { value: "company", label: "Entreprise" },
  { value: "notifications", label: "Notifications" },
  { value: "billing", label: "Facturation" },
  { value: "security", label: "Sécurité" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { label: "Tableau de bord", href: "/dashboard" },
          { label: "Paramètres" },
        ]}
        className="text-xs"
      />
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight text-primary">Paramètres</h1>
        <p className="text-sm text-foreground/70">
          Configurez votre compte, personnalisez vos documents et préparez l&apos;intégration backend à venir.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="flex-wrap bg-primary/10">
          {sections.map((section) => (
            <TabsTrigger key={section.value} value={section.value} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {section.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Informations personnelles</CardTitle>
              <CardDescription>
                Ces champs sont illustratifs. Ils seront connectés à Nest une fois l&apos;API disponible.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground/70">Nom complet</label>
                  <Input placeholder="York Wona (mock)" disabled />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70">Email</label>
                  <Input placeholder="contact@yorkw.company" disabled />
                </div>
              </div>
              <Button disabled className="w-fit bg-primary/20 text-primary hover:bg-primary/30">
                Mettre à jour (à venir)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Entreprise & Mentions</CardTitle>
              <CardDescription>
                Logo, mentions légales et coordonnées seront configurables ici.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground/70">
                Upload logo, numéro SIRET, TVA intracom, adresse... Intégration backend planifiée.
              </p>
              <Button variant="outline" disabled className="w-fit border-primary/40 text-primary">
                Importer un logo
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Notifications</CardTitle>
              <CardDescription>
                Personnalisez les rappels mails/SMS et les relances automatiques.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground/70">
                Les préférences de relance seront pilotées via Nest (webhooks, jobs). Interface à définir.
              </p>
              <Separator />
              <p className="text-xs text-foreground/50">
                Tip: prévoir l&apos;intégration d&apos;un fournisseur email (Resend, Mailjet) et SMS (Twilio).
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Facturation & Abonnements</CardTitle>
              <CardDescription>
                Gestion des plans, cartes bancaires et factures Facturly à venir.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground/70">
                Mise en place Stripe/Braintree prévue. Cette section affichera l&apos;historique de paiements et permettra la mise à jour des moyens de paiement.
              </p>
              <Button variant="outline" disabled className="w-fit border-primary/40 text-primary">
                Voir les plans (bientôt)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Sécurité</CardTitle>
              <CardDescription>
                Authentification, sessions et contrôle d&apos;accès.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground/70">
                La connexion se fera via Nest (JWT). Ajoutez ici MFA, gestion des appareils et journaux d&apos;activité.
              </p>
              <Button variant="destructive" disabled className="w-fit bg-accent text-accent-foreground hover:bg-accent/90">
                Révoquer toutes les sessions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
