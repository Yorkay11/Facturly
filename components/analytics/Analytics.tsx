"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Google Analytics 4
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void;
  }
}

interface AnalyticsProps {
  ga4Id?: string;
  plausibleDomain?: string;
}

function AnalyticsInner({ ga4Id, plausibleDomain }: AnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialiser Google Analytics 4
  useEffect(() => {
    if (!ga4Id) return;

    // Charger le script Google Analytics
    const script1 = document.createElement("script");
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
    document.head.appendChild(script1);

    // Initialiser gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer?.push(args);
    }
    window.gtag = gtag as typeof window.gtag;

    gtag("js", new Date());
    gtag("config", ga4Id, {
      page_path: pathname,
      send_page_view: false, // On gère manuellement pour Next.js
    });

    return () => {
      // Nettoyer le script si nécessaire
      const existingScript = document.querySelector(
        `script[src*="googletagmanager.com/gtag/js"]`
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [ga4Id]);

  // Initialiser Plausible Analytics
  useEffect(() => {
    if (!plausibleDomain) return;

    const script = document.createElement("script");
    script.defer = true;
    script.dataset.domain = plausibleDomain;
    script.src = "https://plausible.io/js/script.js";
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector(
        `script[src*="plausible.io/js/script.js"]`
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [plausibleDomain]);

  // Tracker les changements de page pour GA4
  useEffect(() => {
    if (!ga4Id || !window.gtag) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    window.gtag("config", ga4Id, {
      page_path: url,
    });
  }, [pathname, searchParams, ga4Id]);

  return null;
}

export function Analytics({ ga4Id, plausibleDomain }: AnalyticsProps) {
  return (
    <Suspense fallback={null}>
      <AnalyticsInner ga4Id={ga4Id} plausibleDomain={plausibleDomain} />
    </Suspense>
  );
}

// Hook pour tracker des événements personnalisés
export function useAnalytics() {
  const trackEvent = (
    eventName: string,
    eventParams?: Record<string, any>
  ) => {
    // Google Analytics 4
    if (window.gtag) {
      window.gtag("event", eventName, eventParams);
    }

    // Plausible Analytics
    if (window.plausible) {
      window.plausible(eventName, {
        props: eventParams,
      });
    }
  };

  const trackPageView = (url: string) => {
    // Google Analytics 4
    if (window.gtag) {
      window.gtag("config", process.env.NEXT_PUBLIC_GA4_ID || "", {
        page_path: url,
      });
    }

    // Plausible gère automatiquement les page views
  };

  return { trackEvent, trackPageView };
}

