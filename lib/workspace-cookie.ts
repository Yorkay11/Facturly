import { WORKSPACE_ID_COOKIE } from "@/services/api/base";

const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function setWorkspaceIdCookie(workspaceId: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${WORKSPACE_ID_COOKIE}=${workspaceId}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
}

export function clearWorkspaceIdCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${WORKSPACE_ID_COOKIE}=; path=/; max-age=0`;
}

export function getWorkspaceIdFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${WORKSPACE_ID_COOKIE}=`));
  const raw = match?.split("=")[1]?.trim();
  return raw && raw.length > 0 ? raw : null;
}
