"use client";

import { useState, useEffect } from "react";

export function useBetaBanner() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Vérifier localStorage côté client uniquement
    const savedPreference = localStorage.getItem("betaBannerHidden");
    if (savedPreference === "true") {
      setIsVisible(false);
    }

    // Écouter les changements dans localStorage (pour synchroniser entre onglets)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "betaBannerHidden") {
        setIsVisible(e.newValue !== "true");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Écouter les événements personnalisés pour synchroniser dans le même onglet
    const handleCustomStorageChange = () => {
      const savedPreference = localStorage.getItem("betaBannerHidden");
      setIsVisible(savedPreference !== "true");
    };

    window.addEventListener("betaBannerVisibilityChanged", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("betaBannerVisibilityChanged", handleCustomStorageChange);
    };
  }, []);

  return isVisible;
}

