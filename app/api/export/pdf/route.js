// app/api/export/pdf/route.js

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();

    // ⭐ Accept ALL possible template field names
    const templateKey =
      body.template ||
      body.templateId ||
      body.templateKey ||
      body.selectedTemplate ||
      body.selectedTemplateId ||
      null;

    if (!templateKey) {
      return NextResponse.json(
        { error: "Missing template key" },
        { status: 400 }
      );
    }

    // ⭐ Inject the correct field name for the PDF service
    const payload = {
      ...body,
      template: templateKey,
    };

    // ⭐ Call your pdf-service over HTTP
    const response = await fetch(process.env.PDF_SERVICE_URL + "/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
