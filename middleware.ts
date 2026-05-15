import { NextRequest, NextResponse } from "next/server";

// ── Maintenance mode ──────────────────────────────────────────────────────────
// Set MAINTENANCE_MODE=true in your Vercel environment variables to lock the site.
// Access the live site by visiting any page with ?preview=<MAINTENANCE_BYPASS_KEY>
// This sets a cookie so you won't need the param on every page.

const MAINTENANCE_ON    = process.env.MAINTENANCE_MODE === "true";
const BYPASS_KEY        = process.env.MAINTENANCE_BYPASS_KEY || "tradepro-dev-2026";
const BYPASS_COOKIE     = "tp_maintenance_bypass";
const MAINTENANCE_PATH  = "/maintenance";

// Routes that are always accessible regardless of maintenance mode
const ALWAYS_ALLOWED = [
  MAINTENANCE_PATH,
  "/_next",
  "/favicon",
  "/icons",
  "/api/",          // keep API routes alive (webhooks, etc.)
  "/robots",
  "/sitemap",
];

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Always allow static assets and exempt paths
  if (ALWAYS_ALLOWED.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (!MAINTENANCE_ON) {
    return NextResponse.next();
  }

  // Check if user has a valid bypass cookie
  const bypassCookie = req.cookies.get(BYPASS_COOKIE)?.value;
  if (bypassCookie === BYPASS_KEY) {
    return NextResponse.next();
  }

  // Check if user is supplying the bypass key in the URL (?preview=KEY)
  const previewKey = searchParams.get("preview");
  if (previewKey === BYPASS_KEY) {
    // Set the bypass cookie and redirect to the page without the param
    const url = req.nextUrl.clone();
    url.searchParams.delete("preview");
    const res = NextResponse.redirect(url);
    res.cookies.set(BYPASS_COOKIE, BYPASS_KEY, {
      path:     "/",
      httpOnly: true,
      maxAge:   60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    });
    return res;
  }

  // Redirect everyone else to the maintenance page
  const maintenanceUrl = req.nextUrl.clone();
  maintenanceUrl.pathname = MAINTENANCE_PATH;
  maintenanceUrl.search   = "";
  return NextResponse.rewrite(maintenanceUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
