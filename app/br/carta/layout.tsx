export const dynamic = "force-dynamic";

import { ReactNode } from "react";
import { getUserEntitlements } from "@/lib/entitlements";
import { getServerUserId } from "@/lib/userId";
import { overrides } from "@/config/overrides";
import UpsellModal from "@/components/UpsellModal";
import { ProductId } from "@/lib/pricing";
import CoverLetterSamplePreview from "@/components/CoverLetterSamplePreview";

async function BrCartaGate({ children }: { children: ReactNode }) {
  const userId = await getServerUserId();
  const entitlements = await getUserEntitlements(userId);
  const devOverride = overrides.devMode || overrides.access;
  const allowed = devOverride || entitlements.coverLetter || entitlements.bundle;

  if (!allowed) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="bg-neutral-900 text-white py-10 px-6 text-center">
          <h1 className="text-3xl font-bold mb-2">Carta de Apresentação</h1>
          <p className="text-neutral-400 text-lg">Cartas honestas e profissionais que soam como você.</p>
        </div>
        <CoverLetterSamplePreview userId={userId} />
        <UpsellModal userId={userId} productId={ProductId.COVER_LETTER} />
      </div>
    );
  }

  return <div className="min-h-screen bg-neutral-50">{children}</div>;
}

export default function BrCartaLayout({ children }: { children: ReactNode }) {
  return <BrCartaGate>{children}</BrCartaGate>;
}
