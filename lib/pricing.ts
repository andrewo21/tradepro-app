// lib/pricing.ts

export enum ProductId {
  RESUME = "resume_only",
  COVER_LETTER = "cover_letter_only",
  BUNDLE = "full_premium_bundle",
}

export const PRICE_IDS: Record<ProductId, string> = {
  [ProductId.RESUME]: process.env.STRIPE_PRICE_ID_RESUME as string,
  [ProductId.COVER_LETTER]: process.env.STRIPE_PRICE_ID_COVER_LETTER as string,
  [ProductId.BUNDLE]: process.env.STRIPE_PRICE_ID_BUNDLE as string,
};

export const PRODUCT_LABELS: Record<ProductId, string> = {
  [ProductId.RESUME]: "Resume Only",
  [ProductId.COVER_LETTER]: "Cover Letter Only",
  [ProductId.BUNDLE]: "Full Premium Bundle",
};

// Optional helper if you want to fetch label + price ID together
export function getProductInfo(productId: ProductId) {
  const stripePriceId = PRICE_IDS[productId];
  const label = PRODUCT_LABELS[productId];

  if (!stripePriceId) {
    throw new Error(
      `Missing Stripe price ID for productId: ${productId}. Check your env vars.`
    );
  }

  return { productId, stripePriceId, label };
}
