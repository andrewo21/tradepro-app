export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { recordDownload, MAX_DOWNLOADS } from "@/lib/entitlements";

export async function POST(req: NextRequest) {
  try {
    const { userId, type } = await req.json();

    if (!userId || !type || !["resume", "coverLetter"].includes(type)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const entitlements = await recordDownload(userId, type);

    const downloadsUsed =
      type === "resume"
        ? entitlements.resumeDownloads
        : entitlements.coverLetterDownloads;

    const remaining = Math.max(0, MAX_DOWNLOADS - downloadsUsed);
    const revoked =
      type === "resume" ? !entitlements.resume : !entitlements.coverLetter;

    return NextResponse.json({
      success: true,
      entitlements,
      downloadsUsed,
      remaining,
      revoked,
      maxDownloads: MAX_DOWNLOADS,
    });
  } catch (err: any) {
    const detail = err?.message || String(err);
    console.error("record-download error:", detail);
    return NextResponse.json({ error: "Failed to record download.", detail }, { status: 500 });
  }
}
