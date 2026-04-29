export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { grantEntitlement, getUserEntitlements } from "@/lib/entitlements";
import { getUserIdFromCookieHeader } from "@/lib/userId";
import { overrides } from "@/config/overrides";

// Brazilian product IDs
export enum BrProductId {
  RESUME       = "br_curriculo_padrao",
  COVER_LETTER = "br_carta_apresentacao",
  BUNDLE       = "br_pacote_premium",
}

// Maps to entitlement system
const ENTITLEMENT_MAP: Record<BrProductId, "resume" | "coverLetter" | "bundle"> = {
  [BrProductId.RESUME]:       "resume",
  [BrProductId.COVER_LETTER]: "coverLetter",
  [BrProductId.BUNDLE]:       "bundle",
};

const BR_PRICE_IDS: Record<BrProductId, string> = {
  [BrProductId.RESUME]:       process.env.STRIPE_BR_PRICE_ID_RESUME       as string,
  [BrProductId.COVER_LETTER]: process.env.STRIPE_BR_PRICE_ID_COVER_LETTER as string,
  [BrProductId.BUNDLE]:       process.env.STRIPE_BR_PRICE_ID_BUNDLE        as string,
};

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
    const cookieUserId = getUserIdFromCookieHeader(req.headers.get("cookie"));
    const userId: string = body.userId || cookieUserId;
    const productId: BrProductId = body.productId || BrProductId.RESUME;

    // Dev bypass
    if (!overrides.stripeEnabled || !process.env.STRIPE_SECRET_KEY) {
      const entitlementKey = ENTITLEMENT_MAP[productId] || "resume";
      // Use the existing entitlement grant by importing ProductId
      const { ProductId } = await import("@/lib/pricing");
      const prodMap: Record<string, any> = {
        resume: ProductId.RESUME,
        coverLetter: ProductId.COVER_LETTER,
        bundle: ProductId.BUNDLE,
      };
      const entitlements = await grantEntitlement(userId, prodMap[entitlementKey]);
      return NextResponse.json({ success: true, entitlements });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe não configurado." }, { status: 500 });
    }

    const priceId = BR_PRICE_IDS[productId];
    if (!priceId) {
      return NextResponse.json(
        { error: `Preço não configurado para: ${productId}. Adicione STRIPE_BR_PRICE_ID_* ao Vercel.` },
        { status: 400 }
      );
    }

    const origin = req.headers.get("origin") || "https://tradeprotech.com.br";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "brl",
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      payment_method_types: ["card", "pix"],
      success_url: `${origin}/br/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}&userId=${encodeURIComponent(userId)}&productId=${encodeURIComponent(productId)}`,
      cancel_url: `${origin}/br/precos`,
      metadata: { userId, productId, locale: "pt-BR" },
      locale: "pt-BR",
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    const detail = err?.message || String(err);
    console.error("Brazil checkout error:", detail);
    return NextResponse.json({ error: "Falha ao criar sessão de pagamento.", detail }, { status: 500 });
  }
}
