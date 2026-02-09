"use client";

import React from "react";
import Image from "next/image";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { useTranslations } from "next-intl";

export function HeroScrollDemo() {
  const t = useTranslations("landing.dashboardPreview");

  return (
    <div className="flex flex-col overflow-hidden w-full">
      <ContainerScroll
        titleComponent={
          <>
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground">
              {t("title")} <br />
              <span className="text-3xl md:text-4xl lg:text-5xl font-bold mt-1 leading-none text-foreground">
                {t("titleLine2")}
              </span>
            </h2>
          </>
        }
      >
        <Image
          src="/images/dashboard-preview.png"
          alt="Dashboard Facturly"
          width={1400}
          height={720}
          className="mx-auto rounded-2xl object-cover h-full object-left-top"
          draggable={false}
          priority
          sizes="(max-width: 768px) 100vw, 1400px"
        />
      </ContainerScroll>
    </div>
  );
}
