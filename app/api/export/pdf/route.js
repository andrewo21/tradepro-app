// app/api/export/pdf/route.js

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.template) {
      return NextResponse.json(
        { error: "Missing 'template' in request body" },
        { status: 400 }
      );
    }

    // Call your pdf-service over HTTP
    const response = await fetch(process.env.PDF_SERVICE_URL + "/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error("PDF service error:", await response.text());
      return NextResponse.json(
        { error: "PDF generation failed" },
        { status: 500 }
      );
    }

    const pdfBuffer = await response.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=resume.pdf",
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
