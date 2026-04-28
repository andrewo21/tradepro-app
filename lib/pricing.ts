// lib/pricing.ts

export enum ProductId {
  RESUME = "resume_only",
  COVER_LETTER = "cover_letter_only",
  BUNDLE = "full_premium_bundle",
  // Upgrade products — charged when user already owns part of the bundle
  UPGRADE_RESUME_TO_BUNDLE = "upgrade_resume_to_bundle",       // $15.00 ($29.99 - $14.99)
  UPGRADE_COVER_LETTER_TO_BUNDLE = "upgrade_cover_letter_to_bundle", // $21.00 ($29.99 - $8.99)
}

export const PRICE_IDS: Record<ProductId, string> = {
  [ProductId.RESUME]:                      process.env.STRIPE_PRICE_ID_RESUME as string,
  [ProductId.COVER_LETTER]:                process.env.STRIPE_PRICE_ID_COVER_LETTER as string,
  [ProductId.BUNDLE]:                      process.env.STRIPE_PRICE_ID_BUNDLE as string,
  [ProductId.UPGRADE_RESUME_TO_BUNDLE]:    process.env.STRIPE_PRICE_ID_UPGRADE_RESUME_TO_BUNDLE as string,
  [ProductId.UPGRADE_COVER_LETTER_TO_BUNDLE]: process.env.STRIPE_PRICE_ID_UPGRADE_COVER_LETTER_TO_BUNDLE as string,
};

export const PRODUCT_LABELS: Record<ProductId, string> = {
  [ProductId.RESUME]:                         "Resume Builder",
  [ProductId.COVER_LETTER]:                   "Cover Letter Builder",
  [ProductId.BUNDLE]:                         "Premium Bundle",
  [ProductId.UPGRADE_RESUME_TO_BUNDLE]:       "Upgrade to Premium Bundle",
  [ProductId.UPGRADE_COVER_LETTER_TO_BUNDLE]: "Upgrade to Premium Bundle",
};

export const PRODUCT_PRICES: Record<ProductId, string> = {
  [ProductId.RESUME]:                         "$14.99",
  [ProductId.COVER_LETTER]:                   "$8.99",
  [ProductId.BUNDLE]:                         "$29.99",
  [ProductId.UPGRADE_RESUME_TO_BUNDLE]:       "$15.00",
  [ProductId.UPGRADE_COVER_LETTER_TO_BUNDLE]: "$21.00",
};

import { UserEntitlements } from "./entitlements";

/**
 * Given what a user already owns and what they want to buy,
 * returns the correct ProductId to charge — upgrade price if eligible,
 * full price otherwise.
 */
export function resolveCheckoutProduct(
  desired: ProductId,
  owned: UserEntitlements
): ProductId {
  // Already owns everything — should not reach checkout, but guard anyway
  if (owned.bundle) return desired;

  if (desired === ProductId.BUNDLE) {
    if (owned.resume && !owned.coverLetter) {
      return ProductId.UPGRADE_RESUME_TO_BUNDLE;
    }
    if (owned.coverLetter && !owned.resume) {
      return ProductId.UPGRADE_COVER_LETTER_TO_BUNDLE;
    }
  }

  return desired;
}

/**
 * Human-readable upgrade label for the pricing page button.
 */
export function getUpgradeLabel(
  desired: ProductId,
  owned: UserEntitlements
): string {
  const resolved = resolveCheckoutProduct(desired, owned);
  if (resolved === desired) return "Buy Now";
  return `Upgrade — ${PRODUCT_PRICES[resolved]}`;
}

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
