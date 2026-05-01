export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { grantEntitlement, getUserEntitlements } from "@/lib/entitlements";
import { ProductId, PRODUCT_LABELS } from "@/lib/pricing";
import { overrides } from "@/config/overrides";
import { getUserIdFromCookieHeader } from "@/lib/userId";
import { schedulePostPurchaseEmails } from "@/lib/emailSequences";

/**
 * POST /api/stripe/grant
 * Called from the success page to verify a completed Stripe Checkout session
 * and grant the matching entitlement to the user.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const cookieUserId = getUserIdFromCookieHeader(req.headers.get("cookie"));
    const userId: string = body.userId || cookieUserId;
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

      // Accept "paid" (normal purchase) and "no_payment_required" (100% coupon applied)
      const validStatuses = ["paid", "no_payment_required"];
      if (!validStatuses.includes(session.payment_status)) {
        return NextResponse.json({ error: "Payment not completed." }, { status: 402 });
      }
    }

    // Grant the entitlement
    if (!Object.values(ProductId).includes(productId)) {
      return NextResponse.json({ error: `Unknown productId: ${productId}` }, { status: 400 });
    }
    const entitlements = await grantEntitlement(userId, productId);

    // Trigger post-purchase email sequence if we have a customer email
    try {
      if (overrides.stripeEnabled && sessionId && process.env.STRIPE_SECRET_KEY) {
        const Stripe = require("stripe");
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
        const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["customer_details"] });
        const customerEmail = session.customer_details?.email || session.customer_email || "";
        if (customerEmail) {
          const productName = PRODUCT_LABELS[productId] || productId;
          schedulePostPurchaseEmails(customerEmail, productName, entitlements.coverLetter);
        }
      }
    } catch (emailErr: any) {
      // Never fail the grant because of email errors
      console.error("Email sequence error:", emailErr?.message);
    }

    return NextResponse.json({ success: true, entitlements });
  } catch (err: any) {
    const detail = err?.message || String(err);
    console.error("Grant entitlement error:", detail);
    return NextResponse.json({ error: "Failed to grant entitlement.", detail }, { status: 500 });
  }
}
