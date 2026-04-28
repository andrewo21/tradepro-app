// config/overrides.ts
// ---------------------------------------------------------
// MASTER OVERRIDE SWITCH FOR TRADEPRO
// This is the ONLY file you will edit when the business opens.
// Everything else in the system reads from here.
// ---------------------------------------------------------

export const overrides = {
  // Global dev mode
  devMode: process.env.NEXT_PUBLIC_DEV_MODE === "true",

  // Master feature switches
  // Set to true to bypass Stripe and unlock for all users (founder / dev mode).
  // Set to false (or use OVERRIDE_ACCESS=false) to require a real purchase.
  access: process.env.OVERRIDE_ACCESS !== "false",   // default true unless explicitly disabled
  premium: process.env.OVERRIDE_PREMIUM !== "false", // default true unless explicitly disabled
  watermark: true,     // Show watermark on exports/previews?

  // Stripe behavior
  stripeEnabled: process.env.STRIPE_ENABLED === "true",
};
