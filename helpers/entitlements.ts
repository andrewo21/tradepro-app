// helpers/entitlements.ts
// ---------------------------------------------------------
// This file now simply mirrors the master override system.
// All dev overrides and entitlement behavior come from:
// /config/overrides.ts
// ---------------------------------------------------------

import { overrides } from "@/config/overrides";

export const dev = {
  mode: overrides.devMode,
  access: overrides.access,
  premium: overrides.premium,
  watermark: overrides.watermark,
};
