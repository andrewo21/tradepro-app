import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const SITE_URL = process.env.NEXT_PUBLIC_SITE;
    const PDFSHIFT_API_KEY = process.env.PDFSHIFT_API_KEY;

    console.log("=== PDF EXPORT START ===");
    console.log("SITE_URL:", SITE_URL);
    console.log("PDFSHIFT_API_KEY exists:", !!PDFSHIFT_API_KEY);

    if (!SITE_URL || !PDFSHIFT_API_KEY) {
      console.error("Missing environment variables");
      return new Response(
        JSON.stringify({ error: "Server not configured for PDF" }),
        { status: 500 }
      );
    }

    // Read incoming payload
    const payload = await req.json().catch((err) => {
      console.error("Error parsing JSON body:", err);
      return undefined;
    });

    console.log("Incoming payload:", payload);

    if (!payload) {
      console.error("Payload is missing or undefined");
      return new Response(
        JSON.stringify({ error: "Missing payload" }),
        { status: 400 }
      );
    }

    // Encode payload
    const base64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
    const encoded = encodeURIComponent(base64);

    console.log("Base64 payload:", base64);
    console.log("Encoded payload:", encoded);

    const printUrl = `${SITE_URL}/resume/print?payload=${encoded}`;
    console.log("Final print URL:", printUrl);

    // Call PDFShift
    const pdfRes = await fetch("https://api.pdfshift.io/v3/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(`${PDFSHIFT_API_KEY}:`).toString("base64")
      },
      body: JSON.stringify({ source: printUrl })
    });

    console.log("PDFShift status:", pdfRes.status);

    if (!pdfRes.ok) {
      const text = await pdfRes.text();
      console.error("PDFShift error response:", text);
      return new Response(
        JSON.stringify({ error: "PDF generation failed" }),
        { status: 500 }
      );
    }

    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
    console.log("PDF generated successfully. Size:", pdfBuffer.length);

    console.log("=== PDF EXPORT COMPLETE ===");

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
