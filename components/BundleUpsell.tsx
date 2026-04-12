"use client";

import CheckoutButton from "@/components/CheckoutButton";
import { ProductId } from "@/lib/pricing";

export default function BundleUpsell({
  userId,
  entitlements,
}: {
  userId: string;
  entitlements: any;
}) {
  const hasResume = entitlements.resume || entitlements.bundle;
  const hasCoverLetter = entitlements.coverLetter || entitlements.bundle;

  // Already has everything → no upsell
  if (entitlements.bundle) return null;

  // Resume only → Upsell Cover Letter
  if (hasResume && !hasCoverLetter) {
    return (
      <div className="mt-8 p-6 border rounded-lg bg-blue-50 text-center shadow">
        <h3 className="text-xl font-semibold mb-2">Unlock Cover Letters</h3>
        <p className="text-gray-700 mb-4">
          Add the Cover Letter Builder for just $8.99.
        </p>
        <CheckoutButton userId={userId} productId={ProductId.COVER_LETTER} />
      </div>
    );
  }

  // Cover Letter only → Upsell Resume
  if (hasCoverLetter && !hasResume) {
    return (
      <div className="mt-8 p-6 border rounded-lg bg-blue-50 text-center shadow">
        <h3 className="text-xl font-semibold mb-2">Unlock Resume Builder</h3>
        <p className="text-gray-700 mb-4">
          Add the Resume Builder for just $8.99.
        </p>
        <CheckoutButton userId={userId} productId={ProductId.RESUME} />
      </div>
    );
  }

  // Neither → Upsell Bundle
  return (
    <div className="mt-8 p-6 border rounded-lg bg-blue-50 text-center shadow">
      <h3 className="text-xl font-semibold mb-2">Unlock the Full Bundle</h3>
      <p className="text-gray-700 mb-4">
        Get Resume + Cover Letter for only $29.99.
      </p>
      <CheckoutButton userId={userId} productId={ProductId.BUNDLE} />
    </div>
  );
}
