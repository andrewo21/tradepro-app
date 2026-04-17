// app/api/export/pdf/route.js

import { NextResponse } from "next/server";
import { generatePdfFromResume } from "../../../../lib/pdf/generatePdf";

// Prevent Next.js from running this during build
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();

    const pdf = await generatePdfFromResume({
      templateKey: body.templateKey,
      rawResumeData: body.resumeData,
      premiumUnlocked: body.premiumUnlocked,
      showWatermark: body.showWatermark,
    });

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
      },
    });
  } catch (err) {
    console.error("PDF export error:", err);
    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 }
    );
  }
}
