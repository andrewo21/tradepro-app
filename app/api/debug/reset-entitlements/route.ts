import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const ENTITLEMENTS_FILE = path.join(process.cwd(), "data", "entitlements.json");

// Only available when STRIPE_ENABLED is true (test mode) or NEXT_PUBLIC_DEV_MODE is true.
// Resets one or all users' entitlements back to the unpurchased state.
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

    const raw = await fs.readFile(ENTITLEMENTS_FILE, "utf-8").catch(() => "{}");
    const store = JSON.parse(raw) as Record<string, unknown>;

    if (userId) {
      delete store[userId];
    } else {
      // Reset all users
      for (const key of Object.keys(store)) {
        delete store[key];
      }
    }

    await fs.writeFile(ENTITLEMENTS_FILE, JSON.stringify(store, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      message: userId
        ? `Entitlements reset for user: ${userId}`
        : "All entitlements reset.",
      store,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to reset entitlements.", detail: err?.message },
      { status: 500 }
    );
  }
}
