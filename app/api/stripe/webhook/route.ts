export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { grantEntitlement } from "@/lib/entitlements";
import { ProductId } from "@/lib/pricing";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Stripe = require("stripe");
  return new Stripe(secretKey, { apiVersion: "2024-06-20" });
}

// Tell Next.js not to parse the body — Stripe needs the raw bytes for signature verification
export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: any;

  if (webhookSecret) {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured." }, { status: 500 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
    }
  } else {
    // No webhook secret configured — parse body directly (dev/testing only)
    event = await req.json().catch(() => null);
  }

  if (!event) {
    return NextResponse.json({ error: "Invalid event payload." }, { status: 400 });
  }

  // Handle successful checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data?.object;
    const userId: string = session?.metadata?.userId || "anonymous";
    const productId: ProductId = session?.metadata?.productId as ProductId;

    if (userId && productId) {
      try {
        await grantEntitlement(userId, productId);
        console.log(`Entitlement granted: userId=${userId}, productId=${productId}`);
      } catch (err: any) {
        console.error("Failed to grant entitlement:", err.message);
      }
    }
  }

  return NextResponse.json({ received: true });
}
