"use client";

import CheckoutButton from "./CheckoutButton";
import { ProductId } from "@/lib/pricing";

export default function UpsellModal({
  userId,
  productId,
}: {
  userId: string;
  productId: ProductId;
}) {
  const titles = {
    [ProductId.RESUME]: "Unlock Resume Builder",
    [ProductId.COVER_LETTER]: "Unlock Cover Letter Builder",
    [ProductId.BUNDLE]: "Unlock the Full Premium Bundle",
  };

  const descriptions = {
    [ProductId.RESUME]: "Get instant access to the premium Resume Builder for only $14.99.",
    [ProductId.COVER_LETTER]: "Get instant access to the premium Cover Letter Builder for only $8.99.",
    [ProductId.BUNDLE]: "Unlock both Resume + Cover Letter Builders for only $29.99.",
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-xl max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">{titles[productId]}</h2>

        <p className="mb-6 text-gray-600">{descriptions[productId]}</p>

        <CheckoutButton userId={userId} productId={productId} />

        <p className="mt-4 text-sm text-gray-500">
          Already purchased? Refresh after payment.
        </p>
      </div>
    </div>
  );
}
