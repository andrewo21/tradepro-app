export const dynamic = "force-dynamic";

// Admin — reset a customer's download counter so they can download again.
// Protected by ADMIN_SECRET env variable.
//
// Usage:
//   curl -X POST https://yoursite.com/api/admin/reset-downloads \
//     -H "x-admin-secret: YOUR_ADMIN_SECRET" \
//     -H "Content-Type: application/json" \
//     -d '{"userId":"their-user-id","type":"resume"}'

import { NextRequest, NextResponse } from "next/server";
import { grantEntitlement } from "@/lib/entitlements";
import { ProductId } from "@/lib/pricing";

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-admin-secret");
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, type = "resume" } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const productId =
      type === "cover_letter" ? ProductId.COVER_LETTER :
      type === "both"         ? ProductId.BUNDLE        :
                                ProductId.RESUME;

    const updated = await grantEntitlement(userId, productId);

    return NextResponse.json({
      success: true,
      message: `Downloads reset for ${userId} (${type})`,
      resumeDownloads: updated.resumeDownloads,
      coverLetterDownloads: updated.coverLetterDownloads,
    });
  } catch (err: any) {
    console.error("[admin/reset-downloads]", err);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}
