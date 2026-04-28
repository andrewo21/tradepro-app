import { NextRequest, NextResponse } from "next/server";
import { grantEntitlement, getUserEntitlements } from "@/lib/entitlements";
import { ProductId } from "@/lib/pricing";
import { overrides } from "@/config/overrides";

/**
 * POST /api/stripe/grant
 * Called from the success page to verify a completed Stripe Checkout session
 * and grant the matching entitlement to the user.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId: string = body.userId || "demo-user";
    const productId: ProductId = body.productId as ProductId;
    const sessionId: string = body.sessionId || "";

    if (!productId) {
      return NextResponse.json({ error: "Missing productId." }, { status: 400 });
    }

    // If Stripe is enabled and a session ID was provided, verify it
    if (overrides.stripeEnabled && sessionId && process.env.STRIPE_SECRET_KEY) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Stripe = require("stripe");
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== "paid") {
        return NextResponse.json({ error: "Payment not completed." }, { status: 402 });
      }
    }

    // Grant the entitlement
    const entitlements = await grantEntitlement(userId, productId);
    return NextResponse.json({ success: true, entitlements });
  } catch (err: any) {
    console.error("Grant entitlement error:", err?.message || err);
    return NextResponse.json({ error: "Failed to grant entitlement." }, { status: 500 });
  }
}
