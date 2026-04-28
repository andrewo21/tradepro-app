export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

// ── Template registry (mirrors server.js) ────────────────────────────────────

function drawModernBlue(doc: any, data: any) {
  const leftMargin = 40;
  doc.rect(0, 0, doc.page.width, 130).fill("#1d4ed8");
  doc.fillColor("white").font("Helvetica-Bold").fontSize(28).text(data.applicantName || "", leftMargin, 35);
  doc.fontSize(14).font("Helvetica").text(data.tradeTitle || "", leftMargin, doc.y + 5);
  doc.fontSize(9).text(`${data.applicantPhone || ""} | ${data.applicantEmail || ""} | ${data.applicantAddress || ""}`, leftMargin, doc.y + 10);
  doc.fillColor("black").moveDown(6).font("Helvetica-Bold").fontSize(14).text("Summary", leftMargin);
  doc.font("Helvetica").fontSize(10).text(data.summary || "", leftMargin, doc.y + 5, { width: 520 });
  if (Array.isArray(data.skills) && data.skills.length > 0) {
    const skillStrings = data.skills.map((s: any) => typeof s === "string" ? s : (s.text || "")).filter(Boolean);
    if (skillStrings.length > 0) {
      doc.moveDown(2).font("Helvetica-Bold").fontSize(14).text("Skills", leftMargin);
      doc.font("Helvetica").fontSize(10).text(skillStrings.join("  |  "), leftMargin, doc.y + 5, { width: 520 });
    }
  }
  doc.moveDown(2).font("Helvetica-Bold").fontSize(14).text("Experience", leftMargin);
  (data.experience || []).forEach((job: any) => {
    doc.moveDown(1).font("Helvetica-Bold").fontSize(11).text(`${job.jobTitle || ""} — ${job.company || ""}`, leftMargin);
    const bullets = [...(job.responsibilities || []), ...(job.achievements || [])];
    bullets.forEach((r: any) => {
      const txt = typeof r === "string" ? r : (r.text || "");
      if (txt) doc.font("Helvetica").fontSize(10).text(`• ${txt}`, leftMargin + 15, doc.y, { width: 500 });
    });
  });
}

function drawStandardContemporary(doc: any, data: any) {
  const leftMargin = 40;
  doc.fillColor("#1a202c").font("Helvetica-Bold").fontSize(20).text(data.applicantName || "", leftMargin, 50);
  doc.font("Helvetica").fontSize(10).fillColor("#4b5563").text(`${data.applicantAddress || ""} | ${data.applicantEmail || ""} | ${data.applicantPhone || ""}`, leftMargin, doc.y + 5);
  doc.moveTo(leftMargin, doc.y + 10).lineTo(570, doc.y + 10).stroke("#d1d5db");
  doc.fillColor("black").moveDown(2).font("Helvetica-Bold").fontSize(12).text("SUMMARY", leftMargin);
  doc.font("Helvetica").fontSize(10).text(data.summary || "", leftMargin, doc.y + 5, { width: 520 });
  if (data.skills && data.skills.length > 0) {
    doc.moveDown(2).font("Helvetica-Bold").fontSize(12).text("SKILLS", leftMargin);
    const mid = Math.ceil(data.skills.length / 2);
    const sy = doc.y + 5;
    data.skills.slice(0, mid).forEach((s: any, i: number) => {
      const txt = typeof s === "string" ? s : (s.text || "");
      doc.font("Helvetica").fontSize(9).text(`• ${txt}`, leftMargin, sy + i * 12);
    });
    data.skills.slice(mid).forEach((s: any, i: number) => {
      const txt = typeof s === "string" ? s : (s.text || "");
      doc.font("Helvetica").fontSize(9).text(`• ${txt}`, 300, sy + i * 12);
    });
    doc.moveDown(mid * 0.8 + 1);
  }
  doc.moveDown(1).font("Helvetica-Bold").fontSize(12).text("EXPERIENCE", leftMargin);
  (data.experience || []).forEach((job: any) => {
    doc.moveDown(0.5).font("Helvetica-Bold").fontSize(11).text(`${job.jobTitle || ""} — ${job.company || ""}`, leftMargin);
    const bullets = [...(job.responsibilities || []), ...(job.achievements || [])];
    bullets.forEach((r: any) => {
      const txt = typeof r === "string" ? r : (r.text || "");
      if (txt) doc.font("Helvetica").fontSize(9).text(`• ${txt}`, leftMargin + 10, doc.y, { width: 510 });
    });
  });
}

const templateRegistry: Record<string, (doc: any, data: any) => void> = {
  "modern-blue": drawModernBlue,
  "standard-contemporary": drawStandardContemporary,
};

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const isResume = data.type === "resume";

    const PDFDocument = (await import("pdfkit")).default;
    const doc = new PDFDocument({ size: "LETTER", margin: 50 });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    await new Promise<void>((resolve, reject) => {
      doc.on("end", resolve);
      doc.on("error", reject);

      if (isResume) {
        const templateId = data.selectedTemplate || "standard-contemporary";
        const draw = templateRegistry[templateId] || drawStandardContemporary;
        draw(doc, data);
      } else {
        // Cover letter
        doc.rect(0, 0, doc.page.width, 130).fill("#1F4E79");
        doc.fillColor("white").font("Helvetica-Bold").fontSize(26).text(data.applicantName || "", 50, 40);
        doc.font("Helvetica").fontSize(10).text(`${data.applicantEmail || ""} | ${data.applicantPhone || ""}`, 50, 75);
        doc.text(data.applicantAddress || "", 50, 90);
        doc.text(data.applicantCityStateZip || "", 50, 103);
        doc.fillColor("black").font("Helvetica").fontSize(11).text(data.date || "", 50, 150);
        doc.moveDown(2).fontSize(12).text(data.letter || "", { width: 500, lineGap: 3 });
      }

      doc.end();
    });

    const pdfBuffer = Buffer.concat(chunks);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${isResume ? "Resume" : "Cover-Letter"}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (err: any) {
    console.error("PDF export error:", err?.message || err);
    return NextResponse.json({ error: "PDF generation failed." }, { status: 500 });
  }
}
