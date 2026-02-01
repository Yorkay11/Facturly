"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { FileText, Send, CreditCard, Wallet, Shield } from "lucide-react";
import { CTASection } from "@/components/landing/cta-section";

const steps = [
  { key: "step1" as const, icon: FileText },
  { key: "step2" as const, icon: Send },
  { key: "step3" as const, icon: CreditCard },
  { key: "step4" as const, icon: Wallet },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function HowItWorksContent() {
  const t = useTranslations("howItWorks");

  return (
    <div className="max-w-[1320px] mx-auto px-4 md:px-6 py-12 md:py-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-14 md:mb-20"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
          {t("title")}
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
          {t("subtitle")}
        </p>
      </motion.div>

      {/* Timeline steps */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="relative"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {steps.map(({ key, icon: Icon }, index) => (
            <motion.div
              key={key}
              variants={item}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="group relative"
            >
              <div className="flex gap-5 p-5 md:p-6 rounded-xl bg-card/60 border border-border/80 hover:border-primary/20 hover:bg-card/80 transition-all duration-300 h-full">
                <div className="flex-shrink-0">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                    <h2 className="text-lg md:text-xl font-semibold text-foreground">
                      {t(`steps.${key}.title`)}
                    </h2>
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                    {t(`steps.${key}.description`)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Security block */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-12 md:mt-16"
      >
        <div className="flex gap-4 p-5 md:p-6 rounded-xl bg-primary/5 border border-primary/10">
          <Shield className="h-8 w-8 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base md:text-lg font-semibold text-foreground mb-1">
              {t("security.title")}
            </h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {t("security.description")}
            </p>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <div className="mt-16">
        <CTASection />
      </div>
    </div>
  );
}
