"use client"

import { useState } from "react"
import { Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useGetMeQuery } from "@/services/facturlyApi"
import { useRouter } from "next/navigation"

export function PricingSection() {
  const router = useRouter()
  const [isAnnual, setIsAnnual] = useState(true)
  const { data: user, isLoading } = useGetMeQuery(undefined, {
    skip: typeof window === "undefined",
  })

  const isAuthenticated = !!user && !isLoading

  const pricingPlans = [
    {
      name: "Gratuit",
      monthlyPrice: "0",
      annualPrice: "0",
      description: "Parfait pour démarrer votre activité.",
      features: [
        "Jusqu'à 10 factures par mois",
        "Gestion de clients illimitée",
        "Envoi par email",
        "Tableau de bord de base",
        "Support par email",
      ],
      buttonText: "Commencer gratuitement",
      buttonHref: "/register",
      authenticatedText: "Accéder au tableau de bord",
      authenticatedHref: "/dashboard",
      popular: false,
    },
    {
      name: "Pro",
      monthlyPrice: "29",
      annualPrice: "24",
      description: "Idéal pour les professionnels indépendants.",
      savings: "Économisez 17%",
      features: [
        "Factures illimitées",
        "Paiement en ligne intégré",
        "Rappels automatiques",
        "Statistiques avancées",
        "Personnalisation de factures",
        "Export PDF illimité",
        "Support prioritaire",
      ],
      buttonText: "Essayer Pro",
      buttonHref: "/register",
      authenticatedText: "Accéder au tableau de bord",
      authenticatedHref: "/dashboard",
      popular: true,
    },
    {
      name: "Entreprise",
      monthlyPrice: "199",
      annualPrice: "159",
      description: "Solutions sur mesure pour les équipes.",
      savings: "Économisez 20%",
      features: [
        "Tout du plan Pro",
        "Support dédié",
        "Formation de l'équipe",
        "API personnalisée",
        "Sécurité renforcée",
        "SLA garanti",
        "Intégrations personnalisées",
      ],
      buttonText: "Nous contacter",
      buttonHref: "/contact",
      authenticatedText: "Accéder au tableau de bord",
      authenticatedHref: "/dashboard",
      popular: false,
    },
  ]

  return (
    <section className="w-full px-5 overflow-hidden flex flex-col justify-start items-center my-0 py-8 md:py-14">
      <div className="self-stretch relative flex flex-col justify-center items-center gap-2 py-0">
        <div className="flex flex-col justify-start items-center gap-4">
          <h2 className="text-center text-foreground text-4xl font-semibold leading-tight">
            Tarifs adaptés à votre entreprise
          </h2>
          <p className="self-stretch text-center text-muted-foreground text-sm font-medium leading-[18.20px] max-w-2xl">
            Choisissez un plan qui correspond à vos besoins, des freelances aux entreprises en pleine croissance.
          </p>
        </div>
        <div className="py-8">
          <div className="relative p-1 bg-muted/50 rounded-md border border-border flex justify-start items-center gap-1">
            <button
              onClick={() => setIsAnnual(true)}
              className={`relative px-6 py-2.5 flex justify-center items-center gap-2 rounded-md transition-all duration-300 ${
                isAnnual 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-sm font-medium">Annuel</span>
              {isAnnual && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg">
                  -20%
                </span>
              )}
            </button>
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2.5 flex justify-center items-center gap-2 rounded-md transition-all duration-300 ${
                !isAnnual 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-sm font-medium">Mensuel</span>
            </button>
          </div>
        </div>
      </div>
      <div className="self-stretch px-5 flex flex-col md:flex-row justify-center items-stretch gap-6 md:gap-8 mt-10 max-w-[1200px] mx-auto">
        {pricingPlans.map((plan) => {
          const price = isAnnual ? plan.annualPrice : plan.monthlyPrice
          const monthlyEquivalent = isAnnual ? (parseFloat(plan.annualPrice) / 12).toFixed(2) : plan.monthlyPrice
          
          return (
            <div
              key={plan.name}
              className={`relative flex-1 overflow-hidden rounded-md border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? "border-primary bg-gradient-to-br from-primary via-primary to-primary/90 shadow-2xl scale-105 md:scale-110 z-10"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-1.5 rounded-bl-2xl">
                  <span className="text-xs font-bold">POPULAIRE</span>
                </div>
              )}
              
              <div className="p-6 md:p-8 flex flex-col gap-6">
                {/* En-tête */}
                <div className="flex flex-col gap-3">
                  <h3 className={`text-lg font-semibold ${plan.popular ? "text-primary-foreground" : "text-foreground"}`}>
                    {plan.name}
                  </h3>
                  
                  <p className={`text-sm ${plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {plan.description}
                  </p>
                </div>

                {/* Prix */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold ${plan.popular ? "text-primary-foreground" : "text-foreground"}`}>
                      {price}€
                    </span>
                    <span className={`text-sm ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      /mois
                    </span>
                  </div>
                  {isAnnual && plan.savings && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded">
                        {plan.savings}
                      </span>
                      <span className="text-xs text-muted-foreground line-through">
                        {plan.monthlyPrice}€/mois
                      </span>
                    </div>
                  )}
                  {!isAnnual && plan.savings && (
                    <p className="text-xs text-muted-foreground">
                      {monthlyEquivalent}€/mois en paiement annuel
                    </p>
                  )}
                </div>

                {/* Bouton */}
                <Link 
                  href={isAuthenticated ? (plan.authenticatedHref || "/dashboard") : (plan.buttonHref || "/register")} 
                  className="w-full"
                  onClick={(e) => {
                    if (isAuthenticated) {
                      e.preventDefault()
                      router.push(plan.authenticatedHref || "/dashboard")
                    }
                  }}
                >
                  <Button
                    className={`w-full py-3 rounded-md font-medium text-sm transition-all duration-300 ${
                      plan.popular
                        ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg hover:shadow-xl"
                        : plan.name === "Gratuit"
                        ? "bg-muted text-foreground hover:bg-muted/80"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {isAuthenticated ? (plan.authenticatedText || "Accéder au tableau de bord") : plan.buttonText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                {/* Fonctionnalités */}
                <div className="flex flex-col gap-4 pt-2">
                  <div className={`text-xs font-semibold ${plan.popular ? "text-primary-foreground" : "text-foreground"}`}>
                    {plan.name === "Gratuit" ? "Inclus :" : "Tout du plan Gratuit +"}
                  </div>
                  <div className="flex flex-col gap-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                          plan.popular ? "bg-primary-foreground/20" : "bg-primary/10"
                        }`}>
                          <Check
                            className={`h-3.5 w-3.5 ${
                              plan.popular ? "text-primary-foreground" : "text-primary"
                            }`}
                            strokeWidth={3}
                          />
                        </div>
                        <span className={`text-xs leading-relaxed ${
                          plan.popular ? "text-primary-foreground" : "text-muted-foreground"
                        }`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
