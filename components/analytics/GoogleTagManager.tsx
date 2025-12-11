"use client";

import { useEffect } from "react";
import TagManager from "react-gtm-module";

interface GoogleTagManagerProps {
  gtmId: string;
}

export function GoogleTagManager({ gtmId }: GoogleTagManagerProps) {
  useEffect(() => {
    // Initialize GTM with react-gtm-module
    TagManager.initialize({
      gtmId: gtmId,
    });
  }, [gtmId]);

  return null;
}

// Composant séparé pour le noscript qui doit être dans le body
export function GoogleTagManagerNoscript({ gtmId }: { gtmId: string }) {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}
