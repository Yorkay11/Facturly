"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { pageview } from "@/lib/gtag";

/**
 * Component that tracks page views in Google Analytics
 * Should be placed in the root layout
 * Automatically tracks page views when the route changes
 */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    // Track page view with current pathname
    // Include search params if available (from window.location)
    const url = pathname + (typeof window !== "undefined" && window.location.search ? window.location.search : "");
    pageview(url);
  }, [pathname]);

  return null;
}
