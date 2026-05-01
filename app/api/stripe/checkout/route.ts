export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { grantEntitlement, getUserEntitlements } from "@/lib/entitlements";
import { ProductId, PRICE_IDS, resolveCheckoutProduct } from "@/lib/pricing";
import { overrides } from "@/config/overrides";
import { getUserIdFromCookieHeader } from "@/lib/userId";
import { checkRateLimit, getIP } from "@/lib/rateLimit";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Stripe = require("stripe");
  return new Stripe(secretKey, { apiVersion: "2024-06-20" });
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 10 checkout attempts per IP per minute
    const { allowed, retryAfter } = await checkRateLimit(`checkout:${getIP(req)}`, 10, 60);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const cookieUserId = getUserIdFromCookieHeader(req.headers.get("cookie"));
    const userId: string = body.userId || cookieUserId;
    const desiredProductId: ProductId = body.productId || ProductId.RESUME;

    // If Stripe is disabled or not configured, grant immediately (dev/founder mode)
    if (!overrides.stripeEnabled || !process.env.STRIPE_SECRET_KEY) {
      const entitlements = await grantEntitlement(userId, desiredProductId);
      return NextResponse.json({
        success: true,
        entitlements,
        message: "Entitlement granted (Stripe not enabled).",
      });
    }

    // Look up what this user already owns to determine upgrade eligibility
    const owned = await getUserEntitlements(userId);

    // Resolve to the correct product/price (may be an upgrade product)
    const chargeProductId = resolveCheckoutProduct(desiredProductId, owned);

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured." }, { status: 500 });
    }

    const priceId = PRICE_IDS[chargeProductId];
    if (!priceId) {
      return NextResponse.json(
        { error: `No Stripe price ID configured for product: ${chargeProductId}` },
        { status: 400 }
      );
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&userId=${encodeURIComponent(userId)}&productId=${encodeURIComponent(desiredProductId)}`,
      cancel_url: `${origin}/checkout/cancel`,
      metadata: { userId, productId: desiredProductId, chargeProductId },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    const detail = err?.message || String(err);
    console.error("Stripe checkout error:", detail);
    return NextResponse.json(
      { error: "Failed to create checkout session.", detail },
      { status: 500 }
    );
  }
}
