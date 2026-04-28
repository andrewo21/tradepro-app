import { UserEntitlements } from "@/lib/entitlements";
import { ProductId } from "@/lib/pricing";

export default function EntitlementBadge({
  entitlements,
  productId,
}: {
  entitlements: UserEntitlements;
  productId: ProductId;
}) {
  const owned =
    productId === ProductId.RESUME
      ? entitlements.resume || entitlements.bundle
      : productId === ProductId.COVER_LETTER
      ? entitlements.coverLetter || entitlements.bundle
      : entitlements.bundle; // BUNDLE

  if (!owned) return null;

  const labels: Record<ProductId, string> = {
    [ProductId.RESUME]: "Resume Builder Unlocked",
    [ProductId.COVER_LETTER]: "Cover Letter Unlocked",
    [ProductId.BUNDLE]: "Bundle Unlocked",
  };

  return (
    <span className="inline-block bg-green-600 text-white text-xs px-2 py-1 rounded">
      ✓ {labels[productId]}
    </span>
  );
}
