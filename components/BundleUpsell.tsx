"use client";

import CheckoutButton from "@/components/CheckoutButton";
import { ProductId, resolveCheckoutProduct, PRODUCT_PRICES } from "@/lib/pricing";

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

  // Resume only → upsell Cover Letter + Bundle upgrade
  if (hasResume && !hasCoverLetter) {
    const bundleUpgradePrice = PRODUCT_PRICES[resolveCheckoutProduct(ProductId.BUNDLE, entitlements)];
    return (
      <div className="mt-8 p-6 border rounded-lg bg-blue-50 text-center shadow space-y-4">
        <h3 className="text-xl font-semibold">Unlock More Tools</h3>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <div className="flex-1 border rounded-lg bg-white p-4">
            <p className="font-medium mb-1">Add Cover Letter Builder</p>
            <p className="text-gray-600 text-sm mb-3">$8.99 one-time</p>
            <CheckoutButton userId={userId} productId={ProductId.COVER_LETTER} />
          </div>
          <div className="flex-1 border-2 border-blue-500 rounded-lg bg-white p-4">
            <p className="font-medium mb-1">Upgrade to Premium Bundle</p>
            <p className="text-gray-600 text-sm mb-1">{bundleUpgradePrice} <span className="line-through text-gray-400">$29.99</span></p>
            <p className="text-green-600 text-xs mb-3">You save $14.99 — resume credit applied</p>
            <CheckoutButton
              userId={userId}
              productId={ProductId.BUNDLE}
              label={`Upgrade — ${bundleUpgradePrice}`}
            />
          </div>
        </div>
      </div>
    );
  }

  // Cover Letter only → upsell Resume + Bundle upgrade
  if (hasCoverLetter && !hasResume) {
    const bundleUpgradePrice = PRODUCT_PRICES[resolveCheckoutProduct(ProductId.BUNDLE, entitlements)];
    return (
      <div className="mt-8 p-6 border rounded-lg bg-blue-50 text-center shadow space-y-4">
        <h3 className="text-xl font-semibold">Unlock More Tools</h3>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <div className="flex-1 border rounded-lg bg-white p-4">
            <p className="font-medium mb-1">Add Resume Builder</p>
            <p className="text-gray-600 text-sm mb-3">$14.99 one-time</p>
            <CheckoutButton userId={userId} productId={ProductId.RESUME} />
          </div>
          <div className="flex-1 border-2 border-blue-500 rounded-lg bg-white p-4">
            <p className="font-medium mb-1">Upgrade to Premium Bundle</p>
            <p className="text-gray-600 text-sm mb-1">{bundleUpgradePrice} <span className="line-through text-gray-400">$29.99</span></p>
            <p className="text-green-600 text-xs mb-3">You save $8.99 — cover letter credit applied</p>
            <CheckoutButton
              userId={userId}
              productId={ProductId.BUNDLE}
              label={`Upgrade — ${bundleUpgradePrice}`}
            />
          </div>
        </div>
      </div>
    );
  }

  // Neither → upsell full Bundle
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
