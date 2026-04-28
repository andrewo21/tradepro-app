import { NextRequest, NextResponse } from "next/server";
import { grantEntitlement } from "@/lib/entitlements";
import { ProductId, PRICE_IDS } from "@/lib/pricing";
import { overrides } from "@/config/overrides";

// Only import Stripe on the server when the key is present
function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Stripe = require("stripe");
  return new Stripe(secretKey, { apiVersion: "2024-06-20" });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId: string = body.userId || "demo-user";
    const productId: ProductId = body.productId || ProductId.RESUME;

    // If Stripe is disabled or not configured, grant entitlement immediately (dev/founder mode)
    if (!overrides.stripeEnabled || !process.env.STRIPE_SECRET_KEY) {
      const entitlements = await grantEntitlement(userId, productId);
      return NextResponse.json({
        success: true,
        entitlements,
        message: "Entitlement granted (Stripe not enabled).",
      });
    }

    // Stripe is enabled — create a Checkout Session
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured." }, { status: 500 });
    }

    const priceId = PRICE_IDS[productId];
    if (!priceId) {
      return NextResponse.json(
        { error: `No Stripe price ID configured for product: ${productId}` },
        { status: 400 }
      );
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&userId=${encodeURIComponent(userId)}&productId=${encodeURIComponent(productId)}`,
      cancel_url: `${origin}/checkout/cancel`,
      metadata: { userId, productId },
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
