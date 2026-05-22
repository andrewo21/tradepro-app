export const dynamic = "force-dynamic";

import { ReactNode } from "react";
import { getUserEntitlements } from "@/lib/entitlements";
import { getServerUserId } from "@/lib/userId";
import { overrides } from "@/config/overrides";
import UpsellModal from "@/components/UpsellModal";
import { ProductId } from "@/lib/pricing";
import nextDynamic from "next/dynamic";

// Both components subscribe to Zustand persist stores and use localStorage/window.
// Skip SSR to prevent React #418 hydration mismatches.
const BrBuilderSaveBar   = nextDynamic(() => import("@/components/BrBuilderSaveBar"),                     { ssr: false, loading: () => null });
const BrResumeAssistant  = nextDynamic(() => import("@/components/assistant/BrResumeAssistant"),           { ssr: false, loading: () => null });

async function BrBuilderGate({ children }: { children: ReactNode }) {
  const userId = await getServerUserId();
  const entitlements = await getUserEntitlements(userId);
  const devOverride = overrides.devMode || overrides.access;
  const allowed = devOverride || entitlements.resume || entitlements.bundle;

  if (!allowed) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <UpsellModal userId={userId} productId={ProductId.RESUME} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <BrBuilderSaveBar />
      {children}
      <BrResumeAssistant />
    </div>
  );
}

export default function BrBuilderLayout({ children }: { children: ReactNode }) {
  return <BrBuilderGate>{children}</BrBuilderGate>;
}
