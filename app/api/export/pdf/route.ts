import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const SITE_URL = process.env.NEXT_PUBLIC_SITE;
    const PDFSHIFT_API_KEY = process.env.PDFSHIFT_API_KEY;

    console.log("=== COVER LETTER PDF EXPORT START ===");

    if (!SITE_URL || !PDFSHIFT_API_KEY) {
      console.error("ERROR: NEXT_PUBLIC_SITE or PDFSHIFT_API_KEY environment variables missing.");
      return new Response(
        JSON.stringify({ error: "Server configuration incomplete" }),
        { status: 500 }
      );
    }

    const payload = await req.json().catch((err) => {
      console.error("Error reading payload:", err);
      return undefined;
    });

    if (!payload) {
      return new Response(
        JSON.stringify({ error: "No letter data received" }),
        { status: 400 }
      );
    }

    // Generate the link for PDFShift to visit
    // This points to your specific cover-letter template page
    const base64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
    const encoded = encodeURIComponent(base64);
    
    const printUrl = `${SITE_URL}/pdf/cover-letter?payload=${encoded}`;
    console.log("Print URL for PDFShift:", printUrl);

    // Call PDFShift API
    const pdfRes = await fetch("https://api.pdfshift.io/v3/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + Buffer.from(`${PDFSHIFT_API_KEY}:`).toString("base64")
      },
      body: JSON.stringify({ 
        source: printUrl,
        format: "A4",
        margin: "0px",
        sandbox: false
      })
    });

    if (!pdfRes.ok) {
      const errorDetail = await pdfRes.text();
      console.error("PDFShift error:", errorDetail);
      return new Response(
        JSON.stringify({ error: "PDF generation service failed" }),
        { status: 500 }
      );
    }

    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
    
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Cover-Letter-TradePro.pdf"',
        "Cache-Control": "no-cache"
      }
    });

  } catch (err) {
    console.error("Critical failure in Cover Letter PDF route:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500
    });
  }
}
