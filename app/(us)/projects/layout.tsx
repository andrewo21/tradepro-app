export const dynamic = "force-dynamic";

import { ReactNode } from "react";
import { getUserEntitlements } from "@/lib/entitlements";
import { overrides } from "@/config/overrides";
import { getServerUserId } from "@/lib/userId";
import UpsellModal from "@/components/UpsellModal";
import { ProductId } from "@/lib/pricing";

async function ProjectGate({ children }: { children: ReactNode }) {
  const userId = await getServerUserId();
  const entitlements = await getUserEntitlements(userId);

  const devOverride = overrides.devMode || overrides.access || overrides.premium;
  const allowed = devOverride || entitlements.bundle;

  if (!allowed) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="bg-neutral-900 text-white py-10 px-6 text-center">
          <h1 className="text-3xl font-bold mb-2">Project Portfolio Builder</h1>
          <p className="text-neutral-400 text-lg">Showcase the jobs that prove what you can do.</p>
        </div>
        <UpsellModal userId={userId} productId={ProductId.BUNDLE} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {children}
    </div>
  );
}

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return <ProjectGate>{children}</ProjectGate>;
}
