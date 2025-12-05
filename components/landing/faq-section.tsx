"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqData = [
  {
    question: "Qu'est-ce que Facturly et pour qui est-ce fait ?",
    answer:
      "Facturly est une plateforme de gestion de facturation conçue pour les freelances, les petites entreprises et les professionnels qui souhaitent simplifier leur facturation. C'est parfait pour les indépendants qui veulent gagner du temps et les équipes qui cherchent une solution professionnelle de gestion de factures.",
  },
  {
    question: "Comment fonctionne l'envoi de factures par email ?",
    answer:
      "Lorsque vous créez une facture, vous pouvez l'envoyer directement par email à votre client. Il recevra un lien sécurisé pour visualiser la facture, l'accepter et la payer en ligne. Le système suit automatiquement l'état de la facture et vous notifie des paiements.",
  },
  {
    question: "Puis-je intégrer Facturly avec mes outils existants ?",
    answer:
      "Oui ! Facturly offre des intégrations avec les outils comptables les plus populaires. Notre API permet également de connecter Facturly à votre système existant pour une synchronisation automatique des données.",
  },
  {
    question: "Que comprend le plan gratuit ?",
    answer:
      "Le plan gratuit comprend jusqu'à 10 factures par mois, une gestion illimitée de clients, l'envoi par email, un tableau de bord de base et le support par email. C'est parfait pour démarrer et tester la plateforme.",
  },
  {
    question: "Comment fonctionne le paiement en ligne ?",
    answer:
      "Lorsqu'un client accepte une facture, il peut la payer directement en ligne via un lien sécurisé. Les paiements sont traités de manière sécurisée et vous êtes notifié instantanément. La facture est automatiquement marquée comme payée dans votre tableau de bord.",
  },
  {
    question: "Mes données sont-elles sécurisées avec Facturly ?",
    answer:
      "Absolument. Nous utilisons des mesures de sécurité de niveau entreprise incluant le chiffrement de bout en bout, la transmission sécurisée des données et la conformité aux standards de l'industrie. Vos données financières sont protégées et ne sont jamais partagées sans votre autorisation explicite.",
  },
]

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

const FAQItem = ({ question, answer, isOpen, onToggle }: FAQItemProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onToggle()
  }
  return (
    <div
      className={`w-full bg-[rgba(231,236,235,0.08)] shadow-[0px_2px_4px_rgba(0,0,0,0.16)] overflow-hidden rounded-[10px] outline outline-1 outline-border outline-offset-[-1px] transition-all duration-500 ease-out cursor-pointer`}
      onClick={handleClick}
    >
      <div className="w-full px-5 py-[18px] pr-4 flex justify-between items-center gap-5 text-left transition-all duration-300 ease-out">
        <div className="flex-1 text-foreground text-base font-medium leading-6 break-words">{question}</div>
        <div className="flex justify-center items-center">
          <ChevronDown
            className={`w-6 h-6 text-muted-foreground-dark transition-all duration-500 ease-out ${isOpen ? "rotate-180 scale-110" : "rotate-0 scale-100"}`}
          />
        </div>
      </div>
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
        style={{
          transitionProperty: "max-height, opacity, padding",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          className={`px-5 transition-all duration-500 ease-out ${isOpen ? "pb-[18px] pt-2 translate-y-0" : "pb-0 pt-0 -translate-y-2"}`}
        >
          <div className="text-foreground/80 text-sm font-normal leading-6 break-words">{answer}</div>
        </div>
      </div>
    </div>
  )
}

export function FAQSection() {
  const [openItem, setOpenItem] = useState<number | null>(null)
  const toggleItem = (index: number) => {
    // Si l'item cliqué est déjà ouvert, on le ferme. Sinon, on l'ouvre (et les autres se ferment automatiquement)
    setOpenItem(openItem === index ? null : index)
  }
  return (
    <section className="w-full pt-[66px] pb-20 md:pb-40 px-5 relative flex flex-col justify-center items-center">
      <div className="w-[300px] h-[500px] absolute top-[150px] left-1/2 -translate-x-1/2 origin-top-left rotate-[-33.39deg] bg-primary/10 blur-[100px] z-0" />
      <div className="self-stretch pt-8 pb-8 md:pt-14 md:pb-14 flex flex-col justify-center items-center gap-2 relative z-10">
        <div className="flex flex-col justify-start items-center gap-4">
          <h2 className="w-full max-w-[435px] text-center text-foreground text-4xl font-semibold leading-10 break-words">
            Questions fréquentes
          </h2>
          <p className="self-stretch text-center text-muted-foreground text-sm font-medium leading-[18.20px] break-words">
            Tout ce que vous devez savoir sur Facturly et comment cela peut transformer votre gestion de facturation
          </p>
        </div>
      </div>
      <div className="w-full max-w-[600px] pt-0.5 pb-10 flex flex-col justify-start items-start gap-4 relative z-10">
        {faqData.map((faq, index) => (
          <FAQItem key={index} {...faq} isOpen={openItem === index} onToggle={() => toggleItem(index)} />
        ))}
      </div>
    </section>
  )
}
