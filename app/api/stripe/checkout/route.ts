import { NextResponse } from "next/server";
import { Stripe } from "stripe";
import { ProductId, PRICE_IDS } from "@/lib/pricing";

// ---------------------------------------------------------
// 🔧 ONE-WORD STRIPE TOGGLE
// ---------------------------------------------------------
const STRIPE_ENABLED = process.env.STRIPE_ENABLED === "true";

// If Stripe is disabled, we don't even initialize the client
const stripe =
  STRIPE_ENABLED && process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

// ---------------------------------------------------------
// 🔧 CHECKOUT ROUTE
// ---------------------------------------------------------
export async function POST(req: Request) {
  try {
    // If Stripe is OFF → return a clean success response
    if (!STRIPE_ENABLED || !stripe) {
      console.warn("⚠️ Stripe checkout skipped (STRIPE_ENABLED=false)");
      return NextResponse.json(
        {
          message: "Stripe is disabled in development.",
          checkoutUrl: null,
        },
        { status: 200 }
      );
    }

    // Parse request body
    const { productId } = await req.json();

    if (!productId || !PRICE_IDS[productId as ProductId]) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: PRICE_IDS[productId as ProductId],
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}
