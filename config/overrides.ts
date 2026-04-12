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
  access: true,        // Can the user access builders at all?
  premium: true,       // Unlock all premium features?
  watermark: false,    // Show watermark on exports/previews?

  // Stripe behavior
  stripeEnabled: process.env.STRIPE_ENABLED === "true",
};
