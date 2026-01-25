"use client"

import { useTranslations } from "next-intl"
import { useMemo } from "react"
import Marquee from "react-fast-marquee"

type Country = {
  name: string
  flag: string
}

const countriesWithFlags: Record<string, string> = {
  "côte d'ivoire": "🇨🇮",
  "ivory coast": "🇨🇮",
  "sénégal": "🇸🇳",
  "senegal": "🇸🇳",
  "mali": "🇲🇱",
  "burkina faso": "🇧🇫",
  "bénin": "🇧🇯",
  "benin": "🇧🇯",
  "togo": "🇹🇬",
  "ghana": "🇬🇭",
  "nigeria": "🇳🇬",
  "cameroun": "🇨🇲",
  "cameroon": "🇨🇲",
  "gabon": "🇬🇦",
  "congo": "🇨🇬",
  "rdc": "🇨🇩",
  "drc": "🇨🇩"
}

export function CountriesBanner() {
  const t = useTranslations("landing.socialProof.stats")

  const countries = useMemo<Country[]>(() => {
    const description = t("countriesDescription")
    if (!description) return []

    return description.split(",").map((rawName) => {
      const name = rawName.trim()
      const flag = countriesWithFlags[name.toLowerCase()] ?? "🌍"
      return { name, flag }
    })
  }, [t])

  return (
    <section className="w-full py-6 md:py-8 overflow-hidden relative bg-gradient-to-b from-background via-muted/20 to-background">
      <Marquee
        speed={50}
        gradient={true}
        gradientColor="hsl(var(--background))"
        gradientWidth={80}
        pauseOnHover={true}
        className="py-2"
      >
        {countries.map((country, index) => (
          <div
            key={`${country.name}-${index}`}
            className="inline-flex items-center gap-3 px-4 py-2 md:px-6 md:py-3 mx-3 group"
          >
            <span className="text-2xl md:text-3xl transition-transform duration-300 group-hover:scale-110">
              {country.flag}
            </span>
            <span className="text-sm md:text-base font-semibold text-foreground whitespace-nowrap opacity-80 group-hover:opacity-100 transition-opacity">
              {country.name}
            </span>
            <span className="text-muted-foreground/40 mx-1">•</span>
          </div>
        ))}
      </Marquee>
    </section>
  )
}