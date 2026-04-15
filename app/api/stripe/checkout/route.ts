import { NextResponse } from "next/server";
import { Stripe } from "stripe";
import { ProductId, PRICE_IDS } from "@/lib/pricing";

const STRIPE_ENABLED = process.env.STRIPE_ENABLED === "true";

const stripe =
  STRIPE_ENABLED && process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

export async function POST(req: Request) {
  try {
    if (!STRIPE_ENABLED || !stripe) {
      return NextResponse.json(
        { message: "Stripe disabled", checkoutUrl: null },
        { status: 200 }
      );
    }

    const { productId } = await req.json();

    if (!productId || !PRICE_IDS[productId as ProductId]) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: PRICE_IDS[productId as ProductId],
          quantity: 1,
        },
      ],
      customer_creation: "always",
      billing_address_collection: "auto",
      customer_update: { name: "auto" },

      metadata: {
        productId,
      },

      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
