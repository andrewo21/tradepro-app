// app/api/export/pdf/route.js

import { NextResponse } from "next/server";
import { generatePdfFromResume } from "../../../../lib/pdf/generatePdf";

// Prevent Next.js from pre-rendering this route during build
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.template) {
      return NextResponse.json(
        { error: "Missing 'template' in request body" },
        { status: 400 }
      );
    }

    // Build the payload for the PDF generator
    const pdf = await generatePdfFromResume({
      templateKey: body.template,          // <-- matches your frontend
      rawResumeData: body,                 // <-- your cleanData is already flattened
      premiumUnlocked: body.premiumUnlocked ?? false,
      showWatermark: !body.premiumUnlocked,
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
