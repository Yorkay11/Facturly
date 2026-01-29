"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  useGetVapidPublicKeyQuery,
  useRegisterPushSubscriptionMutation,
} from "@/services/facturlyApi";

function hasToken(): boolean {
  if (typeof window === "undefined") return false;
  return document.cookie
    .split("; ")
    .some((c) => c.startsWith("facturly_access_token="));
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/**
 * Registers for Web Push when permission is already granted.
 * Use requestAndSubscribe() (e.g. "Enable notifications" button) to request permission then subscribe.
 */
export function useWebPushSubscribe(locale: string) {
  const didAttemptRef = useRef(false);
  const { data: vapidData } = useGetVapidPublicKeyQuery(undefined, {
    skip: typeof window === "undefined" || !hasToken(),
  });
  const [register] = useRegisterPushSubscriptionMutation();
  const vapidPublicKey = vapidData?.vapidPublicKey ?? null;

  const requestAndSubscribe = useCallback(async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) return false;
    const key = vapidData?.vapidPublicKey ?? null;
    if (!key) return false;
    const perm = Notification.permission;
    if (perm === "denied") return false;
    if (perm === "default") {
      const got = await Notification.requestPermission();
      if (got !== "granted") return false;
    }

    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      try {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
        });
      } catch {
        return false;
      }
    }

    const json = sub.toJSON();
    const endpoint = json.endpoint!;
    const keys = json.keys!;
    await register({
      endpoint,
      keys: { p256dh: keys.p256dh!, auth: keys.auth! },
      locale,
    });
    return true;
  }, [vapidData?.vapidPublicKey, locale, register]);

  useEffect(() => {
    if (typeof window === "undefined" || !hasToken() || !vapidPublicKey) return;
    if (didAttemptRef.current) return;
    if (Notification.permission !== "granted") return;

    didAttemptRef.current = true;
    requestAndSubscribe();
  }, [vapidPublicKey, requestAndSubscribe]);

  return { requestAndSubscribe, vapidReady: !!vapidPublicKey };
}
