// ==================== API Base Configuration ====================

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";

// URL de l'API backend - OBLIGATOIRE
// Définir NEXT_PUBLIC_API_URL dans .env.local ou .env
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXT_PUBLIC_API_URL est OBLIGATOIRE en production. ' +
      'Définissez cette variable dans votre fichier .env.local ou dans les variables d\'environnement de votre plateforme de déploiement.'
    );
  } else {
    console.warn(
      '⚠️  ATTENTION: NEXT_PUBLIC_API_URL n\'est pas défini. ' +
      'L\'application ne pourra pas communiquer avec le backend. ' +
      'Définissez NEXT_PUBLIC_API_URL dans .env.local (ex: http://localhost:3001)'
    );
  }
}

// Fonction pour nettoyer les cookies et rediriger vers la page de connexion
export const WORKSPACE_ID_COOKIE = "facturly_workspace_id";

export function logoutAndRedirect() {
  if (typeof window !== "undefined") {
    document.cookie = "facturly_access_token=; path=/; max-age=0";
    document.cookie = "facturly_refresh_token=; path=/; max-age=0";
    document.cookie = `${WORKSPACE_ID_COOKIE}=; path=/; max-age=0`;
    window.location.href = "/login";
  }
}

// Base query standard
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers) => {
    if (typeof window !== "undefined") {
      // Ajouter le token d'authentification
      const cookies = document.cookie.split("; ");
      const tokenCookie = cookies.find((cookie) => cookie.startsWith("facturly_access_token="));
      if (tokenCookie) {
        const token = tokenCookie.split("=")[1];
        headers.set("authorization", `Bearer ${token}`);
      }

      const pathname = window.location.pathname;
      const localeMatch = pathname.match(/^\/(fr|en)(\/|$)/);
      const locale = localeMatch ? localeMatch[1] : 'fr';
      headers.set("x-locale", locale);

      const widCookie = cookies.find((c) => c.startsWith(`${WORKSPACE_ID_COOKIE}=`));
      const wid = widCookie?.split("=")[1]?.trim();
      if (wid) headers.set("x-workspace-id", wid);
    }
    return headers;
  },
});

// Configuration du retry
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 seconde

// Fonction pour déterminer si une erreur est transitoire (réseau)
function isRetryableError(error: FetchBaseQueryError | undefined): boolean {
  if (!error) return false;
  
  // Erreurs réseau (FETCH_ERROR, PARSING_ERROR)
  if (error.status === 'FETCH_ERROR' || error.status === 'PARSING_ERROR') {
    return true;
  }
  
  // Erreurs HTTP 5xx (erreurs serveur temporaires)
  if (typeof error.status === 'number' && error.status >= 500 && error.status < 600) {
    return true;
  }
  
  // Erreur 408 (Request Timeout)
  if (error.status === 408) {
    return true;
  }
  
  // Erreur 429 (Too Many Requests) - peut être temporaire
  if (error.status === 429) {
    return true;
  }
  
  return false;
}

// Fonction pour attendre avant de réessayer
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Base query avec gestion des erreurs d'authentification et retry automatique
export const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result;
  let retryCount = 0;
  
  // Boucle de retry pour les erreurs transitoires
  do {
    result = await baseQuery(args, api, extraOptions);
    
    // Si succès ou erreur non retryable, sortir de la boucle
    if (!result.error || !isRetryableError(result.error)) {
      break;
    }
    
    // Incrémenter le compteur de retry
    retryCount++;
    
    // Attendre avant de réessayer (backoff exponentiel)
    if (retryCount < MAX_RETRIES) {
      const delayMs = RETRY_DELAY * Math.pow(2, retryCount - 1);
      await delay(delayMs);
    }
  } while (retryCount < MAX_RETRIES);
  
  // Traiter les réponses 204 (No Content) comme des succès
  // Vérifier à la fois dans meta.response et dans error (car fetchBaseQuery peut créer une erreur pour 204)
  const responseStatus = result.meta?.response?.status || (result.error as any)?.status;
  if (responseStatus === 204) {
    return { data: undefined };
  }
  
  // Traiter les réponses null comme valides (pour /workspaces/me quand l'utilisateur n'a pas encore de workspace)
  const url = typeof args === "string" ? args : (args as FetchArgs).url ?? "";
  if (String(url).endsWith("/workspaces/me") && result.data === null) {
    // null est une valeur valide ici (pas encore de workspace créé)
    return { data: null };
  }
  
  // Gérer les erreurs d'authentification (sauf pour la requête login elle‑même)
  if (result.error && result.error.status === 401) {
    const url = typeof args === "string" ? args : (args as FetchArgs).url ?? "";
    const isLoginRequest = String(url).endsWith("/auth/login");
    if (isLoginRequest) {
      // Mauvaise auth sur la page login : ne pas rediriger, laisser l’erreur au formulaire
      return result;
    }

    const errorData = result.error.data as { code?: string; message?: string };
    const errorCode = errorData?.code;

    const logoutCodes = [
      "AUTH_TOKEN_EXPIRED",
      "AUTH_TOKEN_INVALID",
      "AUTH_TOKEN_MISSING",
      "AUTH_UNAUTHORIZED",
    ];

    // Logout si code d'erreur spécifique OU si pas de code (401 générique = session invalide)
    if (!errorCode || logoutCodes.includes(errorCode)) {
      logoutAndRedirect();
    }
  }
  
  return result;
};

// Tag types pour le cache RTK Query
export const tagTypes = [
  "Invoice",
  "RecurringInvoice",
  "Client",
  "Product",
  "User",
  "Workspace",
  "Settings",
  "Subscription",
  "Payment",
  "Dashboard",
  "Bill",
  "Notification",
  "Reports",
  "InvoiceTemplate",
] as const;

// Type pour les tags (extrait depuis tagTypes)
export type TagTypes = typeof tagTypes[number];
