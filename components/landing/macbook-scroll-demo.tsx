"use client";

import React from "react";
import Image from "next/image";
import { MacbookScroll } from "@/components/ui/macbook-scroll";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

function FacturlyBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden bg-background border border-border",
        className
      )}
    >
      <Image
        src="/logos/icon.png"
        alt="Facturly"
        width={40}
        height={40}
        className="object-contain"
      />
    </div>
  );
}

export function MacbookScrollDemo() {
  const t = useTranslations("landing.dashboardPreview");

  return (
    <div className="w-full overflow-hidden bg-transparent dark:bg-transparent">
      <MacbookScroll
        title={
          <span>
            {t("title")} <br /> {t("titleLine2")}
          </span>
        }
        badge={
          <div className="-rotate-12 transform">
            <FacturlyBadge className="h-10 w-10" />
          </div>
        }
        src="/images/dashboard-preview.png"
        showGradient={false}
      />
    </div>
  );
}
