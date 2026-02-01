"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("pwa");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) {
      setIsInstalled(true);
      return;
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => { /* registered */ })
        .catch((e) => console.error("SW registration failed:", e));
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowInstallPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    sessionStorage.setItem("pwa-install-dismissed", "true");
  };

  if (isInstalled || !showInstallPrompt || !deferredPrompt) return <>{children}</>;
  if (typeof window !== "undefined" && sessionStorage.getItem("pwa-install-dismissed")) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <div
        role="dialog"
        aria-label={t("install.title")}
        className={cn(
          "fixed z-[100] flex flex-col overflow-hidden rounded-xl border bg-background/95 shadow-xl backdrop-blur-sm",
          "animate-in fade-in-0 slide-in-from-bottom-4 duration-300",
          "bottom-2 left-2 right-2 w-[calc(100%-1rem)] rounded-xl px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] gap-2",
          "sm:bottom-4 sm:left-auto sm:right-4 sm:w-[300px] sm:max-w-[300px] sm:rounded-xl sm:px-4 sm:py-4 sm:gap-3 sm:shadow-2xl"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-10 sm:w-10">
              <Download className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <h3 className="font-semibold text-foreground text-sm sm:text-base">
                {t("install.title")}
              </h3>
              <p className="mt-0.5 hidden text-sm text-muted-foreground sm:block">
                {t("install.description")}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={handleDismiss}
            aria-label={t("install.dismiss")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ul className="hidden gap-x-3 text-xs text-muted-foreground sm:flex sm:flex-wrap">
          <li className="flex items-center gap-1.5">
            <span className="text-primary">✓</span>
            <span>{t("install.benefits.offline")}</span>
          </li>
          <li className="flex items-center gap-1.5">
            <span className="text-primary">✓</span>
            <span>{t("install.benefits.faster")}</span>
          </li>
          <li className="flex items-center gap-1.5">
            <span className="text-primary">✓</span>
            <span>{t("install.benefits.homeScreen")}</span>
          </li>
        </ul>

        <div className="flex gap-2 pt-1 sm:pt-0">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={handleDismiss}
          >
            {t("install.dismiss")}
          </Button>
          <Button size="sm" className="flex-1 gap-1.5 sm:flex-none" onClick={handleInstallClick}>
            <Download className="h-4 w-4" />
            {t("install.install")}
          </Button>
        </div>
      </div>
    </>
  );
}
