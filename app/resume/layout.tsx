import { ReactNode } from "react";
import { getUserEntitlements } from "@/lib/entitlements";
import { hasResumeAccess } from "@/lib/verifyEntitlement";
import UpsellModal from "@/components/UpsellModal";
import BundleUpsell from "@/components/BundleUpsell";
import WatermarkSync from "@/components/WatermarkSync";
import { ProductId } from "@/lib/pricing";
import { overrides } from "@/config/overrides";

// Server wrapper for async logic
async function ResumeGate({ children }: { children: ReactNode }) {
  const userId = "demo-user";
  const entitlements = await getUserEntitlements(userId);

  const devOverride = overrides.devMode || overrides.access;
  const allowed = devOverride || hasResumeAccess(entitlements);

  if (!allowed) {
    return <UpsellModal userId={userId} productId={ProductId.RESUME} />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-2 py-4 sm:p-6">
      <WatermarkSync
        hasResume={entitlements.resume || entitlements.bundle || devOverride}
        hasBundle={entitlements.bundle || overrides.premium}
      />
      {children}
      <BundleUpsell userId={userId} entitlements={entitlements} />
    </div>
  );
}

export default function ResumeLayout({ children }: { children: ReactNode }) {
  return <ResumeGate>{children}</ResumeGate>;
}
