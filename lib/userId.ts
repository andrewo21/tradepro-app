// lib/userId.ts
// Lightweight browser-cookie based user identity — no auth required.
// Each browser gets a stable UUID on first visit that persists across sessions.

export const USER_ID_COOKIE = "tradepro_uid";

/** Generate a simple UUID v4 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * CLIENT-SIDE: read userId from cookie, or generate + set a new one.
 * Call this from client components only.
 */
export function getOrCreateUserId(): string {
  if (typeof document === "undefined") return "ssr";

  const existing = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${USER_ID_COOKIE}=`))
    ?.split("=")[1];

  if (existing) return existing;

  const newId = generateUUID();
  // 1-year expiry, SameSite=Lax, no HttpOnly so JS can read it
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${USER_ID_COOKIE}=${newId}; expires=${expires}; path=/; SameSite=Lax`;
  return newId;
}

/**
 * SERVER-SIDE: read userId from the Next.js cookie store.
 * Returns "anonymous" if cookie not present (should not happen after provider mounts).
 */
export async function getServerUserId(): Promise<string> {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  return store.get(USER_ID_COOKIE)?.value || "anonymous";
}

/**
 * Read userId from a raw cookie header string (for API routes using NextRequest).
 */
export function getUserIdFromCookieHeader(cookieHeader: string | null): string {
  if (!cookieHeader) return "anonymous";
  const match = cookieHeader
    .split("; ")
    .find((row) => row.startsWith(`${USER_ID_COOKIE}=`));
  return match?.split("=")[1] || "anonymous";
}
