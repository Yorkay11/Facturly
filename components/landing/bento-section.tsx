import AiCodeReviews from "./bento/ai-code-reviews"
import RealtimeCodingPreviews from "./bento/real-time-previews"
import OneClickIntegrationsIllustration from "./bento/one-click-integrations-illustration"
import MCPConnectivityIllustration from "./bento/mcp-connectivity-illustration" // Updated import
import EasyDeployment from "./bento/easy-deployment"
import ParallelCodingAgents from "./bento/parallel-agents" // Updated import
import type { ComponentType } from "react"

interface BentoCardProps {
  title: string
  description: string
  Component: ComponentType
}

const BentoCard = ({ title, description, Component }: BentoCardProps) => (
  <div className="overflow-hidden rounded-2xl border border-white/20 flex flex-col justify-start items-start relative">
    {/* Background with blur effect */}
    <div
      className="absolute inset-0 rounded-2xl"
      style={{
        background: "rgba(231, 236, 235, 0.08)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    />
    {/* Additional subtle gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />

    <div className="self-stretch p-6 flex flex-col justify-start items-start gap-2 relative z-10">
      <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
        <p className="self-stretch text-foreground text-lg font-normal leading-7">
          {title} <br />
          <span className="text-muted-foreground">{description}</span>
        </p>
      </div>
    </div>
    <div className="self-stretch h-72 relative -mt-0.5 z-10">
      <Component />
    </div>
  </div>
)

export function BentoSection() {
  const cards = [
    {
      title: "Création de factures simplifiée.",
      description: "Créez des factures professionnelles en quelques clics.",
      Component: AiCodeReviews,
    },
    {
      title: "Envoi par email automatique",
      description: "Envoyez vos factures directement par email à vos clients.",
      Component: RealtimeCodingPreviews,
    },
    {
      title: "Suivi des paiements en temps réel",
      description: "Visualisez l'état de vos factures et paiements en direct.",
      Component: OneClickIntegrationsIllustration,
    },
    {
      title: "Gestion de clients et produits",
      description: "Organisez vos contacts et produits pour facturer plus vite.",
      Component: MCPConnectivityIllustration, // Updated component
    },
    {
      title: "Paiement en ligne sécurisé", // Swapped position
      description: "Permettez à vos clients de payer directement en ligne.",
      Component: ParallelCodingAgents, // Updated component
    },
    {
      title: "Tableau de bord intelligent", // Swapped position
      description: "Suivez vos revenus et statistiques en un coup d'œil.",
      Component: EasyDeployment,
    },
  ]

  return (
    <section className="w-full px-5 flex flex-col justify-center items-center overflow-visible bg-transparent">
      <div className="w-full py-8 md:py-16 relative flex flex-col justify-start items-start gap-6">
        <div className="w-[547px] h-[938px] absolute top-[614px] left-[80px] origin-top-left rotate-[-33.39deg] bg-primary/10 blur-[130px] z-0" />
        <div className="self-stretch py-8 md:py-14 flex flex-col justify-center items-center gap-2 z-10">
          <div className="flex flex-col justify-start items-center gap-4">
            <h2 className="w-full max-w-[655px] text-center text-foreground text-4xl md:text-6xl font-semibold leading-tight md:leading-[66px]">
              Simplifiez votre gestion de factures
            </h2>
            <p className="w-full max-w-[600px] text-center text-muted-foreground text-lg md:text-xl font-medium leading-relaxed">
              Toutes les fonctionnalités dont vous avez besoin pour créer, envoyer et suivre vos factures efficacement.
            </p>
          </div>
        </div>
        <div className="self-stretch grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10">
          {cards.map((card) => (
            <BentoCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  )
}
