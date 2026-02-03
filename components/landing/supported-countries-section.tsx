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
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/60 border border-border/60 hover:border-primary/20 transition-colors">
      <div className="relative w-6 h-6 flex-shrink-0">
        <Image src={flag} alt={name} fill className="object-contain" unoptimized sizes="24px" />
      </div>
      <span className="text-sm font-medium text-foreground">{name}</span>
    </div>
  );
}

export function SupportedCountriesSection() {
  const t = useTranslations("landing.supportedCountries");

  return (
    <section className="w-full py-12 md:py-16 px-4 md:px-6 bg-muted/20">
      <div className="max-w-[1320px] mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            {t("title")}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
          <div className="rounded-xl border border-border bg-card/80 p-5 md:p-6">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-1">
              {t("uemoa")}
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              {t("uemoaDesc")}
            </p>
            <div className="flex flex-wrap gap-2">
              {UEMOA_COUNTRIES.map((c) => (
                <CountryFlag key={c.code} name={c.name} flag={c.flag} />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card/80 p-5 md:p-6">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-1">
              {t("cemac")}
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              {t("cemacDesc")}
            </p>
            <div className="flex flex-wrap gap-2">
              {CEMAC_COUNTRIES.map((c) => (
                <CountryFlag key={c.code} name={c.name} flag={c.flag} />
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm font-medium text-foreground mt-6 px-4">
          {t("crossBorder")}
        </p>
      </div>
    </section>
  );
}
