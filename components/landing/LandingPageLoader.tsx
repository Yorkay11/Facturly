"use client";

import { useEffect, useState } from "react";
import { useLoading } from "@/contexts/LoadingContext";

interface LandingPageLoaderProps {
  children: React.ReactNode;
}

export function LandingPageLoader({ children }: LandingPageLoaderProps) {
  const { setLoading } = useLoading();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Afficher le loader pendant 2 secondes au chargement de la page
    setLoading(true);
    
    const timer = setTimeout(() => {
      setLoading(false);
      setIsLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
      setLoading(false);
    };
  }, [setLoading]);

  // Ne pas afficher le contenu tant que le loader est actif
  if (isLoading) {
    return null;
  }

  return <>{children}</>;
}

