import { NextResponse } from "next/server";

// Read-only diagnostics — never exposes actual key values, only shape checks.
// Only available when STRIPE_ENABLED=true or NEXT_PUBLIC_DEV_MODE=true.
export async function GET() {
  const isTest =
    process.env.STRIPE_ENABLED === "true" ||
    process.env.NEXT_PUBLIC_DEV_MODE === "true";

  if (!isTest) {
    return NextResponse.json({ error: "Not available in production." }, { status: 403 });
  }

  const sk = process.env.STRIPE_SECRET_KEY || "";
  const wh = process.env.STRIPE_WEBHOOK_SECRET || "";

  const checks = {
    STRIPE_ENABLED: process.env.STRIPE_ENABLED === "true",
    OVERRIDE_ACCESS: process.env.OVERRIDE_ACCESS,
    OVERRIDE_PREMIUM: process.env.OVERRIDE_PREMIUM,

    STRIPE_SECRET_KEY: sk
      ? sk.startsWith("sk_test_")
        ? "✓ test key"
        : sk.startsWith("sk_live_")
        ? "✗ LIVE KEY — must use sk_test_ for test mode"
        : "✗ unrecognised format"
      : "✗ MISSING",

    STRIPE_WEBHOOK_SECRET: wh
      ? wh.startsWith("whsec_")
        ? "✓ present"
        : "✗ unexpected format"
      : "✗ MISSING",

    STRIPE_PRICE_ID_RESUME: process.env.STRIPE_PRICE_ID_RESUME
      ? `✓ ${process.env.STRIPE_PRICE_ID_RESUME.slice(0, 12)}...`
      : "✗ MISSING",

    STRIPE_PRICE_ID_COVER_LETTER: process.env.STRIPE_PRICE_ID_COVER_LETTER
      ? `✓ ${process.env.STRIPE_PRICE_ID_COVER_LETTER.slice(0, 12)}...`
      : "✗ MISSING",

    STRIPE_PRICE_ID_BUNDLE: process.env.STRIPE_PRICE_ID_BUNDLE
      ? `✓ ${process.env.STRIPE_PRICE_ID_BUNDLE.slice(0, 12)}...`
      : "✗ MISSING",

    // KV storage — check all possible prefixed var names Vercel may have created
    KV_REST_API_URL: process.env.KV_REST_API_URL
      ? "✓ present"
      : process.env.TRADEPRO_KV_REST_API_URL
      ? "✓ present (prefixed as TRADEPRO_KV)"
      : process.env.KV_URL
      ? "✓ present (KV_URL)"
      : "✗ MISSING — KV not connected or env vars not injected",

    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN
      ? "✓ present"
      : process.env.TRADEPRO_KV_REST_API_TOKEN
      ? "✓ present (prefixed as TRADEPRO_KV)"
      : "✗ MISSING",
  };

  const problems = Object.entries(checks)
    .filter(([, v]) => typeof v === "string" && v.startsWith("✗"))
    .map(([k, v]) => `${k}: ${v}`);

  return NextResponse.json({
    ok: problems.length === 0,
    problems,
    checks,
  });
}
