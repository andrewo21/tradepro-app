export const dynamic = "force-dynamic";

import { ReactNode } from "react";
import { getUserEntitlements } from "@/lib/entitlements";
import { getServerUserId } from "@/lib/userId";
import { overrides } from "@/config/overrides";
import UpsellModal from "@/components/UpsellModal";
import { ProductId } from "@/lib/pricing";
import BrBuilderSaveBar from "@/components/BrBuilderSaveBar";
import BrResumeAssistant from "@/components/assistant/BrResumeAssistant";

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
