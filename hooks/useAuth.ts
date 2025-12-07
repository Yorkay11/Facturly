import { useMemo } from "react";
import { useGetMeQuery } from "@/services/facturlyApi";

/**
 * Hook personnalisé pour vérifier l'authentification de l'utilisateur
 * Optimise la vérification en vérifiant d'abord la présence du cookie avant de faire l'appel API
 */
export function useAuth() {
  // Vérifier d'abord si le cookie existe (évite un appel API inutile si pas de token)
  const hasToken = useMemo(() => {
    if (typeof window === "undefined") return false;
    return document.cookie.split("; ").some((cookie) => 
      cookie.startsWith("facturly_access_token=")
    );
  }, []);

  // Ne faire l'appel API que si le cookie existe
  const { data: user, isLoading, error } = useGetMeQuery(undefined, {
    skip: typeof window === "undefined" || !hasToken,
  });

  const isAuthenticated = useMemo(() => {
    // Si pas de token, l'utilisateur n'est pas authentifié
    if (!hasToken) return false;
    // Si on est en train de charger, on ne peut pas encore déterminer
    if (isLoading) return false;
    // Si on a une erreur ou pas d'utilisateur, pas authentifié
    if (error || !user) return false;
    // Sinon, authentifié
    return true;
  }, [hasToken, isLoading, error, user]);

  return {
    user,
    isLoading,
    isAuthenticated,
    hasToken,
  };
}

