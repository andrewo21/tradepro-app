import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { letter } = await req.json();

    if (!letter) {
      return NextResponse.json(
        { error: "Missing letter content" },
        { status: 400 }
      );
    }

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    const { width, height } = page.getSize();
    const margin = 50;
    const maxWidth = width - margin * 2;

    // Manual text wrapping
    const words = letter.split(/\s+/);
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth > maxWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) lines.push(currentLine);

    // Draw text
    let y = height - margin;

    for (const line of lines) {
      if (y < margin) {
        const newPage = pdfDoc.addPage();
        y = newPage.getSize().height - margin;
      }

      page.drawText(line, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });

      y -= fontSize * 1.4;
    }

    // Save PDF as Uint8Array
    const pdfBytes = await pdfDoc.save();

    // ⭐ Convert Uint8Array → ReadableStream (SAFE FOR NEXT.JS)
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(pdfBytes);
        controller.close();
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=cover-letter.pdf",
      },
    });
  } catch (err: any) {
    console.error("COVER LETTER PDF ERROR:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: err.message },
      { status: 500 }
    );
  }
}
