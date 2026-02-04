"use client"

import { memo, useCallback, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { useJoinWaitlistMutation } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { FaArrowRight, FaSpinner } from "react-icons/fa6"
import { motion } from "framer-motion"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FaCheckCircle } from "react-icons/fa"

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
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [country, setCountry] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [joinWaitlist, { isLoading }] = useJoinWaitlistMutation()

  const countries = useMemo(
    () => [
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
    ],
    []
  )

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    try {
      await joinWaitlist({ email, name, country }).unwrap()
      setIsSubmitted(true)
      toast.success(t("success.title"), {
        description: t("success.description"),
      })
    } catch (error: any) {
      if (error.status === 409) {
        toast.error(t("error.alreadyExists"))
      } else {
        toast.error(t("error.generic"))
      }
    }
  }, [email, name, country, joinWaitlist, t])

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-8 bg-primary/5 border border-primary/20 rounded-2xl text-center"
      >
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
          <FaCheckCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">{t("success.title")}</h3>
        <p className="text-muted-foreground max-w-xs mx-auto">
          {t("success.description")}
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4">
      <div className="space-y-3">
        <Input
          type="text"
          placeholder={t("fields.name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-background/50 backdrop-blur-sm border-border focus:border-primary/50 h-12"
        />
        <Input
          type="email"
          placeholder={t("fields.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-background/50 backdrop-blur-sm border-border focus:border-primary/50 h-12"
        />
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border focus:border-primary/50 h-12">
            <SelectValue placeholder={t("fields.country")} />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {countries.map((c) => {
              const flagSrc = c.code !== "OTHER" ? COUNTRY_FLAGS[c.code] : null
              return (
                <SelectItem key={c.code} value={c.name}>
                  <span className="flex items-center gap-2">
                    {flagSrc ? (
                      <img
                        src={flagSrc}
                        alt=""
                        width={20}
                        height={20}
                        className="w-5 h-5 flex-shrink-0 object-contain rounded-sm"
                        role="presentation"
                        loading="lazy"
                      />
                    ) : (
                      <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-base" aria-hidden="true">🌍</span>
                    )}
                    <span>{c.name}</span>
                  </span>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold group transition-all duration-300 shadow-lg shadow-primary/20"
      >
        {isLoading ? (
          <FaSpinner className="animate-spin mr-2" />
        ) : (
          <>
            {t("cta")}
            <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        {t("privacyNote")}
      </p>
    </form>
  )
}

export default memo(WaitlistFormComponent)
