import { ReactNode } from "react";
import { getUserEntitlements } from "@/lib/entitlements";
import { hasResumeAccess } from "@/lib/verifyEntitlement";
import UpsellModal from "@/components/UpsellModal";
import BundleUpsell from "@/components/BundleUpsell";
import { ProductId } from "@/lib/pricing";
import { overrides } from "@/config/overrides";

// ⭐ Client boundary wrapper
function ClientGate({ allowed, userId, entitlements, children }: any) {
  if (!allowed) {
    return <UpsellModal userId={userId} productId={ProductId.RESUME} />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      {children}
      <BundleUpsell userId={userId} entitlements={entitlements} />
    </div>
  );
}

export default async function ResumeLayout({ children }: { children: ReactNode }) {
  const userId = "demo-user";
  const entitlements = await getUserEntitlements(userId);

  const devOverride = overrides.devMode || overrides.access;
  const allowed = devOverride || hasResumeAccess(entitlements);

  // ⭐ Server layout returns ONLY server-safe JSX
  return (
    <ClientGate
      allowed={allowed}
      userId={userId}
      entitlements={entitlements}
    >
      {children}
    </ClientGate>
  );
}
