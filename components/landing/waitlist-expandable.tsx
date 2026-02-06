"use client"

import { useId } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { useJoinWaitlistMutation } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ResponsiveModal } from "@/components/ui/responsive-modal"
import { toast } from "sonner"
import { FaArrowRight, FaSpinner } from "react-icons/fa6"
import { FaCheckCircle } from "react-icons/fa"
import { memo, useCallback, useState } from "react"
import { X } from "lucide-react"

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
  { code: "OTHER", name: "Autre" },
] as const

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

interface WaitlistExpandableProps {
  isOpen: boolean
  onClose: () => void
}

interface WaitlistFormProps {
  formData: { name: string; email: string; country: string }
  handleChange: (field: string, value: string) => void
  handleSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  isSubmitted: boolean
}

function WaitlistForm({
  formData,
  handleChange,
  handleSubmit,
  isLoading,
  isSubmitted,
}: WaitlistFormProps) {
  const t = useTranslations("landing.waitlist")
  const nameId = useId()
  const emailId = useId()
  const countryId = useId()

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-foreground/10 rounded-full flex items-center justify-center mb-4 sm:mb-6 text-primary-foreground">
          <FaCheckCircle className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-primary-foreground mb-2">
          {t("success.title")}
        </h3>
        <p className="text-primary-foreground/80 max-w-md mx-auto text-sm sm:text-base">
          {t("success.description")}
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 sm:space-y-5 max-w-md mx-auto"
    >
      <div>
        <Label
          htmlFor={nameId}
          className="block text-[10px] font-mono font-normal text-primary-foreground mb-2 tracking-[0.5px] uppercase"
        >
          {t("fields.name").replace(/\(.*\)/g, "").trim().toUpperCase()}
        </Label>
        <Input
          type="text"
          id={nameId}
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder={t("fields.name")}
          className="w-full px-4 py-2.5 rounded-lg bg-card border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-foreground/20 transition-all text-sm h-10"
        />
      </div>

      <div>
        <Label
          htmlFor={emailId}
          className="block text-[10px] font-mono font-normal text-primary-foreground mb-2 tracking-[0.5px] uppercase"
        >
          EMAIL *
        </Label>
        <Input
          type="email"
          id={emailId}
          required
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder={t("fields.email")}
          className="w-full px-4 py-2.5 rounded-lg bg-card border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-foreground/20 transition-all text-sm h-10"
        />
      </div>

      <div>
        <Label
          htmlFor={countryId}
          className="block text-[10px] font-mono font-normal text-primary-foreground mb-2 tracking-[0.5px] uppercase"
        >
          {t("fields.country").toUpperCase()}
        </Label>
        <Select
          value={formData.country}
          onValueChange={(val) => handleChange("country", val)}
        >
          <SelectTrigger
            id={countryId}
            className="w-full px-4 py-2.5 rounded-lg bg-card border-0 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-foreground/20 transition-all text-sm h-10"
          >
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
        className="w-full px-8 py-2.5 rounded-full bg-primary-foreground text-primary font-medium hover:bg-primary-foreground/90 active:scale-[0.98] transition-all duration-100 tracking-[-0.03em] h-10 group"
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

      <p className="text-center text-[10px] uppercase tracking-wider text-primary-foreground/60">
        {t("privacyNote")}
      </p>
    </form>
  )
}

export const WaitlistExpandable = memo(function WaitlistExpandable({
  isOpen,
  onClose,
}: WaitlistExpandableProps) {
  const t = useTranslations("landing.waitlist")
  const [formData, setFormData] = useState({ name: "", email: "", country: "" })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [joinWaitlist, { isLoading }] = useJoinWaitlistMutation()

  const handleChange = useCallback(
    (field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const { email, name, country } = formData
      if (!email || isLoading) return
      try {
        await joinWaitlist({ email, name, country }).unwrap()
        setIsSubmitted(true)
        toast.success(t("success.title"), {
          description: t("success.description"),
        })
      } catch (error: unknown) {
        const err = error as { status?: number }
        const message =
          err.status === 409 ? t("error.alreadyExists") : t("error.generic")
        toast.error(message)
      }
    },
    [formData, isLoading, joinWaitlist, t]
  )

  const handleClose = () => {
    if (!isLoading) onClose()
  }

  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={(v) => !v && handleClose()}
      contentClassName="bg-primary"
      modalMaxWidth="md:max-w-[1100px]"
      sheetMaxHeight="max-h-[90vh]"
      closeButtonClassName="text-primary-foreground hover:bg-primary-foreground/10 active:scale-95 transition-transform duration-100 cursor-pointer p-2 border border-white rounded-full"
      closeButtonContent={isLoading ? <FaSpinner className="h-4 w-4 animate-spin" /> : undefined}
    >
      <div className="relative z-10 flex flex-col lg:flex-row h-full w-full max-w-[1100px] mx-auto items-center p-6 sm:p-10 lg:p-16 gap-8 lg:gap-16">
        <div className="flex-1 flex flex-col justify-center space-y-3 w-full max-lg:hidden">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-primary-foreground leading-none tracking-[-0.03em]">
            {t("title")}
          </h2>
          <p className="text-primary-foreground/80 text-base sm:text-lg max-w-lg">
            {t("subtitle")}
          </p>

          <div className="space-y-4 sm:space-y-6 pt-4">
            <div className="flex gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm sm:text-base text-primary-foreground leading-[150%]">
                  {t("benefit1")}
                </p>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm sm:text-base text-primary-foreground leading-[150%]">
                  {t("benefit2")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full">
          <div className="lg:hidden mb-4">
            <h2 className="text-2xl font-medium text-primary-foreground leading-none tracking-[-0.03em]">
              {t("title")}
            </h2>
            <p className="text-primary-foreground/80 text-sm mt-2 max-w-lg">
              {t("subtitle")}
            </p>
          </div>
          <WaitlistForm
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            isSubmitted={isSubmitted}
          />
        </div>
      </div>
    </ResponsiveModal>
  )
})
