"use client";

import { useMemo } from "react";
import { WORKSPACE_ID_COOKIE } from "@/services/api/base";
import { getWorkspaceIdFromCookie } from "@/lib/workspace-cookie";

const TOKEN_COOKIE = "facturly_access_token";

function getTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${TOKEN_COOKIE}=`));
  const raw = match?.split("=")[1]?.trim();
  return raw && raw.length > 0 ? raw : null;
}

function getLocaleFromPath(): string {
  if (typeof window === "undefined") return "fr";
  const localeMatch = window.location.pathname.match(/^\/(fr|en)(\/|$)/);
  return localeMatch ? localeMatch[1] : "fr";
}

/**
 * URL et headers pour le chat (useChat).
 * À utiliser côté client uniquement.
 */
export function useChatConfig(): {
  chatApiUrl: string | null;
  chatHeaders: Record<string, string>;
  isReady: boolean;
} {
  return useMemo(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const chatApiUrl = baseUrl ? `${baseUrl.replace(/\/$/, "")}/chat` : null;

    const token = getTokenFromCookie();
    const workspaceId = getWorkspaceIdFromCookie();
    const locale = getLocaleFromPath();

    const chatHeaders: Record<string, string> = {};
    if (token) chatHeaders["Authorization"] = `Bearer ${token}`;
    if (workspaceId) chatHeaders["x-workspace-id"] = workspaceId;
    chatHeaders["x-locale"] = locale;

    const isReady = Boolean(chatApiUrl && token);

    return { chatApiUrl, chatHeaders, isReady };
  }, []);
}
