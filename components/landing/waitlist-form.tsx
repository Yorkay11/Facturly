"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useJoinWaitlistMutation } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { FaArrowRight, FaSpinner } from "react-icons/fa6"
import { motion } from "framer-motion"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FaCheckCircle } from "react-icons/fa"

export function WaitlistForm() {
  const t = useTranslations("landing.waitlist")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [country, setCountry] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [joinWaitlist, { isLoading }] = useJoinWaitlistMutation()

  const countries = [
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
  ]

  const handleSubmit = async (e: React.FormEvent) => {
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
  }

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
            {countries.map((c) => (
              <SelectItem key={c.code} value={c.name}>
                {c.name}
              </SelectItem>
            ))}
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
