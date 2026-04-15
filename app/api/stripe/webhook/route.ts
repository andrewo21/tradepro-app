import Stripe from "stripe";
import { NextResponse } from "next/server";
import { grantEntitlement } from "@/lib/entitlements";
import { ProductId, PRODUCT_LABELS } from "@/lib/pricing";
import { sendThankYouEmail } from "@/lib/sendgrid";

export const runtime = "nodejs"; // Required for raw body access

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle successful checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // -----------------------------
    // 1. Existing entitlement logic
    // -----------------------------
    const userId = session.metadata?.userId;
    const productId = session.metadata?.productId as ProductId | undefined;

    if (!userId || !productId) {
      console.error(
        "⚠️ Missing userId or productId in session metadata. Skipping entitlement grant."
      );
    } else {
      try {
        const updated = await grantEntitlement(userId, productId);
        console.log("💰 Payment completed for user:", userId);
        console.log("⭐ Entitlements updated:", updated);
      } catch (err) {
        console.error("❌ Failed to grant entitlement:", err);
      }
    }

    // -----------------------------
    // 2. NEW: Send thank-you email
    // -----------------------------
    const customerName = session.customer_details?.name || "Customer";
    const customerEmail = session.customer_details?.email;
    const productName = productId ? PRODUCT_LABELS[productId] : "Your Purchase";

    if (customerEmail) {
      try {
        await sendThankYouEmail({
          customerName,
          customerEmail,
          productName,
        });
        console.log("📧 Thank-you email sent to:", customerEmail);
      } catch (err) {
        console.error("❌ Failed to send thank-you email:", err);
      }
    } else {
      console.error("⚠️ No customer email found — cannot send thank-you email.");
    }
  }

  return NextResponse.json({ received: true });
}
