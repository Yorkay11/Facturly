"use client"

import { useTranslations } from "next-intl"
import { useMemo } from "react"
import Marquee from "react-fast-marquee"
import Image from "next/image"

type Country = {
  name: string
  flagPath: string | null
}

// Mapping des noms de pays normalisés aux noms de fichiers SVG
const countriesWithFlags: Record<string, string> = {
  "senegal": "/images/countries/flag-for-flag-senegal-svgrepo-com.svg",
  "cote d'ivoire": "/images/countries/flag-for-flag-cote-divoire-svgrepo-com.svg",
  "cote divoire": "/images/countries/flag-for-flag-cote-divoire-svgrepo-com.svg",
  "ivory coast": "/images/countries/flag-for-flag-cote-divoire-svgrepo-com.svg",
  "togo": "/images/countries/flag-for-flag-togo-svgrepo-com.svg",
  "benin": "/images/countries/flag-for-flag-benin-svgrepo-com.svg",
  "burkina faso": "/images/countries/flag-for-flag-burkina-faso-svgrepo-com.svg",
  "mali": "/images/countries/flag-for-flag-mali-svgrepo-com.svg",
  "niger": "/images/countries/flag-for-flag-niger-svgrepo-com.svg",
  "guinee": "/images/countries/flag-for-flag-guinea-svgrepo-com.svg",
  "ghana": "/images/countries/flag-for-flag-ghana-svgrepo-com.svg",
  "nigeria": "/images/countries/flag-for-flag-nigeria-svgrepo-com.svg",
  "cameroun": "/images/countries/flag-for-flag-cameroon-svgrepo-com.svg",
  "cameroon": "/images/countries/flag-for-flag-cameroon-svgrepo-com.svg",
  "congo": "/images/countries/flag-for-flag-congo-brazzaville-svgrepo-com.svg",
  "rdc": "/images/countries/flag-for-flag-republic-of-the-congo-svgrepo-com.svg",
  "RDC": "/images/countries/flag-for-flag-republic-of-the-congo-svgrepo-com.svg",
  "republic of congo": "/images/countries/flag-for-flag-republic-of-the-congo-svgrepo-com.svg",
  "drc": "/images/countries/flag-for-flag-republic-of-the-congo-svgrepo-com.svg",
  "gabon": "/images/countries/flag-for-flag-gabon-svgrepo-com.svg",
  "centrafrique": "/images/countries/flag-for-flag-central-african-republic-svgrepo-com.svg",
  "central african republic": "/images/countries/flag-for-flag-central-african-republic-svgrepo-com.svg",
  "tchad": "/images/countries/flag-for-flag-tchad-svgrepo-com.svg",
  "chad": "/images/countries/flag-for-flag-tchad-svgrepo-com.svg",
}

function normalize(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .trim()
}

export function CountriesBanner() {
  const t = useTranslations("landing.socialProof.stats")

  // 🔹 Récupération de la liste des pays depuis countriesDescription
  const countriesList = useMemo<string[]>(() => {
    const countriesDescription = t("countriesDescription")
    if (!countriesDescription || typeof countriesDescription !== "string") return []
    
    // Parser la chaîne séparée par des virgules
    return countriesDescription
      .split(",")
      .map(country => country.trim())
      .filter(country => country.length > 0)
  }, [t])

  const countries = useMemo<Country[]>(() => {
    if (!countriesList?.length || !Array.isArray(countriesList)) return []

    return countriesList.map((name) => {
      const key = normalize(name)
      const flagPath = countriesWithFlags[key] ?? null
      return { name, flagPath }
    })
  }, [countriesList])

  return (
    <section className="w-full fixed top-0 left-0 right-0 z-[100] overflow-hidden bg-purple-800 to-b from-background via-primary/10 to-background shadow-sm">
      <Marquee
        speed={50}
        gradient
        gradientColor="#1A1A1A"
        gradientWidth={80}
        pauseOnHover
        className=""
      >
        {countries.map((country, index) => (
          <div
            key={`${country.name}-${index}`}
            className="inline-flex items-center gap-3 px-4 md:px-6 mx-3 group"
          >
            {country.flagPath ? (
              <div className="relative w-4 h-4 md:w-6 md:h-6 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                <Image
                  src={country.flagPath}
                  alt={`Drapeau ${country.name}`}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <span className="text-2xl md:text-3xl transition-transform duration-300 group-hover:scale-110">
                🌍
              </span>
            )}

            <span className="text-xs md:text-xs font-semibold text-white whitespace-nowrap opacity-80 group-hover:opacity-100 transition-opacity">
              {country.name}
            </span>

            <span className="text-white mx-1">•</span>
          </div>
        ))}
      </Marquee>
    </section>
  )
}