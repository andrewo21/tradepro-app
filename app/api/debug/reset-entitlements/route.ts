export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { resetEntitlements } from "@/lib/entitlements";

// Only available when STRIPE_ENABLED=true or NEXT_PUBLIC_DEV_MODE=true.
export async function POST(req: NextRequest) {
  const isTest =
    process.env.STRIPE_ENABLED === "true" ||
    process.env.NEXT_PUBLIC_DEV_MODE === "true";

  if (!isTest) {
    return NextResponse.json(
      { error: "Reset endpoint only available in dev/test mode." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const userId: string | undefined = body.userId;

    await resetEntitlements(userId);

    return NextResponse.json({
      success: true,
      message: userId
        ? `Entitlements reset for user: ${userId}`
        : "All entitlements reset.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to reset entitlements.", detail: err?.message },
      { status: 500 }
    );
  }
}
