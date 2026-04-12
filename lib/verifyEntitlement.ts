import { UserEntitlements } from "./entitlements";
import { overrides } from "@/config/overrides";

// ⭐ Unified access logic — same rules everywhere
export function hasResumeAccess(entitlements: UserEntitlements): boolean {
  // Founder-safe override system
  if (overrides.devMode || overrides.access) {
    return true;
  }
  return entitlements.resume || entitlements.bundle;
}

export function hasCoverLetterAccess(entitlements: UserEntitlements): boolean {
  if (overrides.devMode || overrides.access) {
    return true;
  }
  return entitlements.coverLetter || entitlements.bundle;
}

export function hasBundleAccess(entitlements: UserEntitlements): boolean {
  if (overrides.devMode || overrides.premium) {
    return true;
  }
  return entitlements.bundle;
}
