// Google Analytics 4 types
declare global {
  interface Window {
    gtag?: (
      command: "config" | "event" | "js" | "set",
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA4_ID;

// Event parameters type
export interface EventParams {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Logs a page view to Google Analytics
 * @param url - The URL of the page being viewed
 */
export const pageview = (url: string): void => {
  if (typeof window === "undefined" || !window.gtag || !GA_TRACKING_ID) {
    return;
  }

  window.gtag("config", GA_TRACKING_ID, {
    page_path: url,
  });
};

/**
 * Logs an event to Google Analytics
 * @param action - The event action name
 * @param params - Optional event parameters
 */
export const event = ({
  action,
  params,
}: {
  action: string;
  params?: EventParams;
}): void => {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("event", action, params);
};
