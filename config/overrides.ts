// config/overrides.ts
// ---------------------------------------------------------
// MASTER OVERRIDE SWITCH FOR TRADEPRO
// This is the ONLY file you will edit when the business opens.
// Everything else in the system reads from here.
// ---------------------------------------------------------

const devMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

export const overrides = {
  // Global dev mode — set NEXT_PUBLIC_DEV_MODE=true in .env.local for local dev
  devMode,

  // Master feature switches.
  // In local dev (NEXT_PUBLIC_DEV_MODE=true) these default to true so you don't
  // need Stripe locally. On Vercel they default to false — set OVERRIDE_ACCESS=true
  // only if you want to bypass Stripe in production (e.g. founder mode).
  access: devMode || process.env.OVERRIDE_ACCESS === "true",
  premium: devMode || process.env.OVERRIDE_PREMIUM === "true",
  watermark: true,

  // Stripe behavior
  stripeEnabled: process.env.STRIPE_ENABLED === "true",
};
