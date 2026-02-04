"use client"

import { memo, useCallback, useState } from "react"
import { useTranslations } from "next-intl"
import { useJoinWaitlistMutation } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { FaArrowRight, FaSpinner } from "react-icons/fa6"
import { FaCheckCircle } from "react-icons/fa"
import Image from "next/image"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Déporté pour éviter la re-déclaration au rendu
const COUNTRIES = [
  { code: "TG", name: "Togo" },
  { code: "CI", name: "Côte d'Ivoire" },
  { code: "SN", name: "Sénégal" },
  { code: "BJ", name: "Bénin" },
  { code: "BF", name: "Burkina Faso" },
  { code: "ML", name: "Mali" },
  { code: "NE", name: "Niger" },
  { code: "CM", name: "Cameroun" },
  { code: "GA", name: "Gabon" },
  { code: "CG", name: "Congo" },
  { code: "CD", name: "RDC" },
  { code: "OTHER", name: "Autre" }
] as const;

const COUNTRY_FLAGS: Record<string, string> = {
  TG: "/images/countries/flag-for-flag-togo-svgrepo-com.svg",
  CI: "/images/countries/flag-for-flag-cote-divoire-svgrepo-com.svg",
  SN: "/images/countries/flag-for-flag-senegal-svgrepo-com.svg",
  BJ: "/images/countries/flag-for-flag-benin-svgrepo-com.svg",
  BF: "/images/countries/flag-for-flag-burkina-faso-svgrepo-com.svg",
  ML: "/images/countries/flag-for-flag-mali-svgrepo-com.svg",
  NE: "/images/countries/flag-for-flag-niger-svgrepo-com.svg",
  CM: "/images/countries/flag-for-flag-cameroon-svgrepo-com.svg",
  GA: "/images/countries/flag-for-flag-gabon-svgrepo-com.svg",
  CG: "/images/countries/flag-for-flag-congo-brazzaville-svgrepo-com.svg",
  CD: "/images/countries/flag-for-flag-republic-of-the-congo-svgrepo-com.svg",
}

function WaitlistFormComponent() {
  const t = useTranslations("landing.waitlist")
  const [formData, setFormData] = useState({ name: "", email: "", country: "" })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [joinWaitlist, { isLoading }] = useJoinWaitlistMutation()

  // Handler générique pour les inputs
  const handleChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const { email, name, country } = formData
    
    if (!email || isLoading) return

    try {
      await joinWaitlist({ email, name, country }).unwrap()
      setIsSubmitted(true)
      toast.success(t("success.title"), { description: t("success.description") })
    } catch (error: any) {
      const message = error.status === 409 ? t("error.alreadyExists") : t("error.generic")
      toast.error(message)
    }
  }, [formData, isLoading, joinWaitlist, t])

  // Composant de succès extrait pour la lisibilité
  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-primary/5 border border-primary/20 rounded-2xl text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
          <FaCheckCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">{t("success.title")}</h3>
        <p className="text-muted-foreground max-w-xs mx-auto">{t("success.description")}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4">
      <div className="space-y-3">
        <Input
          type="text"
          placeholder={t("fields.name")}
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="bg-background/50 backdrop-blur-sm h-12 transition-all focus:ring-2 focus:ring-primary/20"
        />
        <Input
          type="email"
          placeholder={t("fields.email")}
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          required
          className="bg-background/50 backdrop-blur-sm h-12 transition-all focus:ring-2 focus:ring-primary/20"
        />
        <Select value={formData.country} onValueChange={(val) => handleChange("country", val)}>
          <SelectTrigger className="bg-background/50 backdrop-blur-sm h-12">
            <SelectValue placeholder={t("fields.country")} />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.name}>
                <div className="flex items-center gap-3">
                  {COUNTRY_FLAGS[c.code] ? (
                    <div className="relative w-5 h-4 overflow-hidden rounded-sm shadow-sm">
                      <Image
                        src={COUNTRY_FLAGS[c.code]}
                        alt={c.name}
                        fill
                        className="object-cover"
                        sizes="20px"
                      />
                    </div>
                  ) : (
                    <span className="w-5 text-center">🌍</span>
                  )}
                  <span className="text-sm">{c.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        disabled={isLoading || !formData.email}
        className="w-full h-12 rounded-full font-semibold group shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
      >
        {isLoading ? (
          <FaSpinner className="animate-spin" />
        ) : (
          <>
            {t("cta")}
            <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </Button>

      <p className="text-center text-[10px] uppercase tracking-wider text-muted-foreground/60">
        {t("privacyNote")}
      </p>
    </form>
  )
}

export default memo(WaitlistFormComponent)