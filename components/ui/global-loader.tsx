"use client";

import { MultiStepLoader } from "@/components/ui/multi-step-loader";

interface GlobalLoaderProps {
  isLoading: boolean;
  message?: string;
  whiteOverlay?: boolean;
}

const defaultLoadingStates = [
  { text: "Chargement en cours..." },
  { text: "Vérification des données..." },
  { text: "Synchronisation..." },
  { text: "Préparation de l'affichage..." },
];

export function GlobalLoader({
  isLoading,
  message,
}: GlobalLoaderProps) {
  const loadingStates = message ? [{ text: message }] : defaultLoadingStates;

  return (
    <MultiStepLoader 
      loading={isLoading} 
      loadingStates={loadingStates}
      duration={500}
      loop={!message}
    />
  );
}
