import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const SITE_URL = process.env.NEXT_PUBLIC_SITE;
    const PDFSHIFT_API_KEY = process.env.PDFSHIFT_API_KEY;

    if (!SITE_URL || !PDFSHIFT_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Server not configured for PDF" }),
        { status: 500 }
      );
    }

    const payload = await req.json();

    // Encode payload for print URL
    const base64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
    const encoded = encodeURIComponent(base64);

    const printUrl = `${SITE_URL}/resume/print?payload=${encoded}`;

    // Call PDFShift directly
    const pdfRes = await fetch("https://api.pdfshift.io/v3/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(`${PDFSHIFT_API_KEY}:`).toString("base64")
      },
      body: JSON.stringify({ source: printUrl })
    });

    if (!pdfRes.ok) {
      const text = await pdfRes.text();
      console.error("PDFShift error:", text);
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
