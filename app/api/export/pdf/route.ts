import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const PDF_SERVICE_URL = process.env.NEXT_PUBLIC_PDF_SERVICE_URL;
    const SITE_URL = process.env.NEXT_PUBLIC_SITE;

    if (!PDF_SERVICE_URL || !SITE_URL) {
      return new Response(
        JSON.stringify({ error: "Server not configured for PDF" }),
        { status: 500 }
      );
    }

    const payload = await req.json();

    const base64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
    const encoded = encodeURIComponent(base64);

    const printUrl = `${SITE_URL}/resume/print?payload=${encoded}`;

    const pdfRes = await fetch(`${PDF_SERVICE_URL}/api/export/pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: printUrl })
    });

    if (!pdfRes.ok) {
      const text = await pdfRes.text();
      console.error("PDF service error:", text);
      return new Response(
        JSON.stringify({ error: "PDF generation failed" }),
        { status: 500 }
      );
    }

    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"'
      }
    });
  } catch (err) {
    console.error("API /api/export/pdf error:", err);
    return new Response(JSON.stringify({ error: "PDF generation failed" }), {
      status: 500
    });
  }
}
