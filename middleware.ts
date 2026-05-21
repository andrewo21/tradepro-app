import { NextRequest, NextResponse } from "next/server";

// ── Maintenance mode ──────────────────────────────────────────────────────────
// MAINTENANCE_MODE=true → public sees countdown page only.
// Private access: visit /admin-preview?pw=YOUR_PREVIEW_PASSWORD
// This sets a 7-day cookie so you can browse freely afterward.

const MAINTENANCE_ON = process.env.MAINTENANCE_MODE === "true";
const PASSWORD       = process.env.PREVIEW_PASSWORD || "";
const COOKIE_NAME    = "tp_preview_access";
const MAINTENANCE    = "/maintenance";

// Always accessible regardless of maintenance state
const ALWAYS_ALLOWED = [
  MAINTENANCE,
  "/admin-preview",  // private access route
  "/_next",
  "/favicon",
  "/icons",
  "/api/",
  "/robots",
  "/sitemap",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow static/exempt paths
  if (ALWAYS_ALLOWED.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // No maintenance — pass through
  if (!MAINTENANCE_ON) {
    return NextResponse.next();
  }

  // Check bypass cookie
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  if (PASSWORD && cookie === PASSWORD) {
    return NextResponse.next();
  }

  // Everyone else sees the countdown page
  const url = req.nextUrl.clone();
  url.pathname = MAINTENANCE;
  url.search   = "";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
