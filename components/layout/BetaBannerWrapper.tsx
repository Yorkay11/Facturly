"use client";

import { BetaBanner } from "@/components/layout/BetaBanner";
import { useLoading } from "@/contexts/LoadingContext";

export function BetaBannerWrapper() {
  const { isLoading } = useLoading();
  
  // Ne pas afficher le BetaBanner pendant le chargement
  if (isLoading) return null;
  
  return <BetaBanner />;
}

