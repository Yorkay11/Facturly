"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
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

/** Vue mobile simplifiée : dashboard en carte avec animation scroll (sans le MacBook 3D) */
function MobileDashboardPreview({
  title,
  src,
  badge,
}: {
  title: React.ReactNode;
  src: string;
  badge?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.2"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.4], [0.5, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.92, 1]);
  const y = useTransform(scrollYProgress, [0, 0.4], [24, 0]);

  return (
    <div ref={ref} className="min-h-0 flex flex-col items-center justify-start  mt-20 pb-10 px-4 md:hidden">
      <motion.h2
        style={{ opacity: useTransform(scrollYProgress, [0, 0.25], [1, 0.7]) }}
        className="mb-8 text-center text-xl sm:text-4xl font-bold text-neutral-800 dark:text-white px-2"
      >
        {title}
      </motion.h2>
      <motion.div
        style={{ opacity, scale, y }}
        className="relative w-full max-w-[340px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-background/80 backdrop-blur-sm"
      >
        <div className="relative aspect-[1160/700] w-full">
          <Image
            src={src}
            alt="Dashboard Facturly"
            fill
            className="object-cover object-left-top"
            sizes="(max-width: 768px) 340px, 340px"
            priority
          />
        </div>
        {badge && (
          <div className="absolute bottom-3 left-3">{badge}</div>
        )}
      </motion.div>
    </div>
  );
}

export function MacbookScrollDemo() {
  const t = useTranslations("landing.dashboardPreview");

  const title = (
    <span>
      {t("title")} <br /> {t("titleLine2")}
    </span>
  );
  const badge = (
    <div className="-rotate-12 transform">
      <FacturlyBadge className="h-10 w-10" />
    </div>
  );

  return (
    <div className="w-full h-full overflow-hidden bg-transparent dark:bg-transparent">
      {/* Mobile : vue simplifiée */}
      <MobileDashboardPreview
        title={title}
        src="/images/dashboard-preview.png"
        badge={badge}
      />
      {/* Desktop : MacBook 3D complet */}
      <div className="hidden md:block">
        <MacbookScroll
          title={title}
          badge={badge}
          src="/images/dashboard-preview.png"
          showGradient={false}
        />
      </div>
    </div>
  );
}
