"use client";

import { useEffect, useRef, useCallback } from "react";
import { store } from "@/lib/redux/store";
import { facturlyApi } from "@/services/facturlyApi";
import { WORKSPACE_ID_COOKIE, type TagTypes } from "@/services/api/base";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type StreamEventType =
  | "connected"
  | "notification_created"
  | "invoice_created"
  | "invoice_updated"
  | "invoice_deleted"
  | "payment_created"
  | "client_created"
  | "client_updated"
  | "client_deleted";

interface StreamEvent {
  type: StreamEventType;
  workspaceId?: string;
  invoiceId?: string;
  clientId?: string;
  paymentId?: string;
  notification?: Record<string, unknown>;
}

const TAGS_BY_EVENT: Record<Exclude<StreamEventType, "connected">, TagTypes[]> = {
  notification_created: ["Notification", "Invoice", "Payment", "Client", "Dashboard"],
  invoice_created: ["Invoice", "Dashboard"],
  invoice_updated: ["Invoice", "Dashboard"],
  invoice_deleted: ["Invoice", "Dashboard"],
  payment_created: ["Payment", "Invoice", "Dashboard"],
  client_created: ["Client", "Dashboard"],
  client_updated: ["Client", "Dashboard"],
  client_deleted: ["Client", "Dashboard"],
};

const ALL_PUSH_TAGS: TagTypes[] = [
  "Notification",
  "Invoice",
  "Payment",
  "Client",
  "Dashboard",
];

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const cookies = document.cookie.split("; ");
  const tokenCookie = cookies.find((c) => c.startsWith("facturly_access_token="));
  const token = tokenCookie?.split("=")[1]?.trim();
  const widCookie = cookies.find((c) => c.startsWith(`${WORKSPACE_ID_COOKIE}=`));
  const workspaceId = widCookie?.split("=")[1]?.trim();
  const pathname = window.location.pathname;
  const localeMatch = pathname.match(/^\/(fr|en)(\/|$)/);
  const locale = localeMatch ? localeMatch[1] : "fr";

  const headers: Record<string, string> = {
    "Cache-Control": "no-cache",
    Accept: "text/event-stream",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (workspaceId) headers["x-workspace-id"] = workspaceId;
  headers["x-locale"] = locale;
  return headers;
}

function hasToken(): boolean {
  if (typeof window === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith("facturly_access_token="));
}

function invalidateForEvent(ev: StreamEvent): void {
  if (ev.type === "connected") return;
  const tags = TAGS_BY_EVENT[ev.type];
  if (tags?.length) store.dispatch(facturlyApi.util.invalidateTags(tags));
}

function invalidateAllPushData(): void {
  store.dispatch(facturlyApi.util.invalidateTags(ALL_PUSH_TAGS));
}

/**
 * Hook: SSE push for notifications + granular data events.
 * Maps event type → tags, invalidates on reconnect and on window focus.
 */
export function useNotificationsPush() {
  const abortRef = useRef<AbortController | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const hasConnectedOnceRef = useRef(false);

  const connect = useCallback(() => {
    if (!API_URL || typeof window === "undefined" || !hasToken()) return;

    const maxRetries = 10;
    const baseDelay = 2000;

    const run = () => {
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }

      const ac = new AbortController();
      abortRef.current = ac;

      fetch(`${API_URL}/notifications/stream`, {
        headers: getAuthHeaders(),
        signal: ac.signal,
      })
        .then((res) => {
          if (!res.ok || !res.body) throw new Error(`SSE ${res.status}`);
          retryCountRef.current = 0;

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          const processStream = async (): Promise<void> => {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() ?? "";

              let dataLine: string | null = null;
              for (const line of lines) {
                if (line.startsWith("data:")) {
                  dataLine = line.slice(5).trim();
                } else if (line === "" && dataLine) {
                  try {
                    const ev = JSON.parse(dataLine) as StreamEvent;
                    if (ev.type === "connected") {
                      if (hasConnectedOnceRef.current) invalidateAllPushData();
                      hasConnectedOnceRef.current = true;
                    } else {
                      invalidateForEvent(ev);
                    }
                  } catch {
                    /* ignore */
                  }
                  dataLine = null;
                }
              }
            }
          };

          return processStream();
        })
        .catch((err) => {
          if (err?.name === "AbortError") return;
          const delay = Math.min(
            baseDelay * Math.pow(1.5, retryCountRef.current),
            60000
          );
          retryCountRef.current = Math.min(retryCountRef.current + 1, maxRetries);
          reconnectTimeoutRef.current = setTimeout(run, delay);
        });
    };

    run();
  }, []);

  useEffect(() => {
    if (!API_URL || typeof window === "undefined" || !hasToken()) return;
    connect();

    const onFocus = () => invalidateAllPushData();
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [connect]);
}
