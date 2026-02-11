"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

const UEMOA_COUNTRIES = [
  { code: "bf", name: "Burkina Faso", flag: "/images/countries/flag-for-flag-burkina-faso-svgrepo-com.svg" },
  { code: "bj", name: "Bénin", flag: "/images/countries/flag-for-flag-benin-svgrepo-com.svg" },
  { code: "ci", name: "Côte d'Ivoire", flag: "/images/countries/flag-for-flag-cote-divoire-svgrepo-com.svg" },
  { code: "ml", name: "Mali", flag: "/images/countries/flag-for-flag-mali-svgrepo-com.svg" },
  { code: "ne", name: "Niger", flag: "/images/countries/flag-for-flag-niger-svgrepo-com.svg" },
  { code: "sn", name: "Sénégal", flag: "/images/countries/flag-for-flag-senegal-svgrepo-com.svg" },
  { code: "tg", name: "Togo", flag: "/images/countries/flag-for-flag-togo-svgrepo-com.svg" },
  { code: "gw", name: "Guinée-Bissau", flag: "/images/countries/flag-for-flag-guinea-svgrepo-com.svg" },
];

const CEMAC_COUNTRIES = [
  { code: "cm", name: "Cameroun", flag: "/images/countries/flag-for-flag-cameroon-svgrepo-com.svg" },
  { code: "cf", name: "Centrafrique", flag: "/images/countries/flag-for-flag-central-african-republic-svgrepo-com.svg" },
  { code: "cg", name: "Congo", flag: "/images/countries/flag-for-flag-congo-brazzaville-svgrepo-com.svg" },
  { code: "ga", name: "Gabon", flag: "/images/countries/flag-for-flag-gabon-svgrepo-com.svg" },
  { code: "td", name: "Tchad", flag: "/images/countries/flag-for-flag-tchad-svgrepo-com.svg" },
];

function CountryFlag({ name, flag }: { name: string; flag: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-card/70 border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-colors">
      <div className="relative w-6 h-6 flex-shrink-0 rounded-full overflow-hidden">
        <Image src={flag} alt={name} fill className="object-contain" unoptimized sizes="24px" />
      </div>
      <span className="text-xs md:text-sm font-medium text-foreground">{name}</span>
    </div>
  );
}

export function SupportedCountriesSection() {
  const t = useTranslations("landing.supportedCountries");

  return (
    <section className="w-full py-14 md:py-20 px-4 md:px-6 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-[1320px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,1.4fr] gap-10 md:gap-14 items-start">
          {/* Texte à gauche */}
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] md:text-xs font-medium uppercase tracking-[0.16em] text-primary mb-4">
              {t("badge")}
            </p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-3">
              {t("title")}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-xl">
              {t("subtitle")}
            </p>

            <div className="mt-6 space-y-2 text-xs md:text-sm text-muted-foreground">
              <p>{t("uemoaDesc")}</p>
              <p>{t("cemacDesc")}</p>
            </div>

            <p className="mt-6 text-xs md:text-sm font-medium text-foreground">
              {t("crossBorder")}
            </p>
          </div>

          {/* Drapeaux à droite */}
          <div className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-sm p-5 md:p-6 lg:p-7 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <h3 className="text-xs md:text-sm font-semibold text-primary uppercase tracking-[0.18em] mb-3">
                  {t("uemoa")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {UEMOA_COUNTRIES.map((c) => (
                    <CountryFlag key={c.code} name={c.name} flag={c.flag} />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs md:text-sm font-semibold text-primary uppercase tracking-[0.18em] mb-3">
                  {t("cemac")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {CEMAC_COUNTRIES.map((c) => (
                    <CountryFlag key={c.code} name={c.name} flag={c.flag} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
