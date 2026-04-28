import { ReactNode } from "react";
import { getUserEntitlements } from "@/lib/entitlements";
import { hasCoverLetterAccess } from "@/lib/verifyEntitlement";
import UpsellModal from "@/components/UpsellModal";
import { ProductId } from "@/lib/pricing";
import { overrides } from "@/config/overrides";

async function CoverLetterGate({ children }: { children: ReactNode }) {
  const userId = "demo-user";
  const entitlements = await getUserEntitlements(userId);

  const devOverride = overrides.devMode || overrides.access;
  const allowed = devOverride || hasCoverLetterAccess(entitlements);

  if (!allowed) {
    return <UpsellModal userId={userId} productId={ProductId.COVER_LETTER} />;
  }

  return <>{children}</>;
}

export default function CoverLetterLayout({ children }: { children: ReactNode }) {
  return <CoverLetterGate>{children}</CoverLetterGate>;
}
