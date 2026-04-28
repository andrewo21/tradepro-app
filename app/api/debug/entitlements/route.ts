export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getUserEntitlements } from "@/lib/entitlements";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || "demo-user";

  try {
    const entitlements = await getUserEntitlements(userId);
    return NextResponse.json({ userId, entitlements });
  } catch (err: any) {
    console.error("Entitlements fetch error:", err?.message || err);
    return NextResponse.json(
      { error: "Failed to fetch entitlements." },
      { status: 500 }
    );
  }
}
