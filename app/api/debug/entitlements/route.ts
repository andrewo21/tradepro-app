// app/api/debug/entitlements/route.ts

import { NextResponse } from "next/server";
import { getUserEntitlements } from "@/lib/entitlements";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || "anonymous-user";

  const entitlements = await getUserEntitlements(userId);

  return NextResponse.json({
    userId,
    entitlements,
  });
}
