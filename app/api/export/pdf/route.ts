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

function parseValue(val: string): number {
  if (!val) return 0;
  const clean = val.replace(/[$,\s]/g, "").toUpperCase();
  if (clean.endsWith("MM")) return parseFloat(clean) * 1_000_000;
  if (clean.endsWith("M")) return parseFloat(clean) * 1_000_000;
  if (clean.endsWith("K")) return parseFloat(clean) * 1_000;
  return parseFloat(clean) || 0;
}

function formatValue(num: number): string {
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`;
  return `$${num.toFixed(0)}`;
}

function drawProjectPortfolio(doc: any, data: any) {
  const { portfolio, projects } = data;
  const W = doc.page.width;
  const L = 50;
  const R = W - 50;
  const CONTENT_W = R - L;
  const NAVY = "#1a2e4a";
  const GOLD = "#b8902a";
  const LIGHT = "#f5f6f8";

  const totalValue = (projects || []).reduce((sum: number, p: any) => sum + parseValue(p.contractValue), 0);

  // ── COVER PAGE ──────────────────────────────────────────────────────────────
  // Full dark header
  doc.rect(0, 0, W, 200).fill(NAVY);

  // Name
  doc.fillColor("white").font("Helvetica-Bold").fontSize(28)
    .text(portfolio.name || "Project Portfolio", L, 45, { width: CONTENT_W });

  // Title
  doc.font("Helvetica").fontSize(14).fillColor("#a0b4cc")
    .text(portfolio.title || "", L, doc.y + 4, { width: CONTENT_W });

  // Contact line
  const contactParts = [portfolio.phone, portfolio.email, portfolio.location].filter(Boolean);
  doc.fontSize(10).fillColor("#7a9ab8")
    .text(contactParts.join("  |  "), L, doc.y + 8, { width: CONTENT_W });

  // Gold accent bar
  doc.rect(L, 185, 60, 4).fill(GOLD);

  // Stats row
  doc.fillColor(NAVY);
  const statsY = 215;

  const statBoxes = [
    { label: "Total Portfolio Value", value: formatValue(totalValue) },
    { label: "Projects Completed", value: String((projects || []).length) },
    { label: "Years Experience", value: portfolio.yearsExperience || "—" },
  ];

  const boxW = (CONTENT_W - 20) / 3;
  statBoxes.forEach((s, i) => {
    const x = L + i * (boxW + 10);
    doc.rect(x, statsY, boxW, 65).fill(LIGHT);
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(22)
      .text(s.value, x, statsY + 12, { width: boxW, align: "center" });
    doc.fillColor("#6b7280").font("Helvetica").fontSize(8)
      .text(s.label.toUpperCase(), x, statsY + 40, { width: boxW, align: "center" });
  });

  // Bio
  if (portfolio.bio) {
    doc.fillColor("#374151").font("Helvetica").fontSize(10)
      .text(portfolio.bio, L, statsY + 85, { width: CONTENT_W, lineGap: 4 });
  }

  // Section title
  const projStartY = portfolio.bio ? doc.y + 20 : statsY + 90;
  doc.rect(L, projStartY, CONTENT_W, 28).fill(NAVY);
  doc.fillColor("white").font("Helvetica-Bold").fontSize(11)
    .text("PROJECT HISTORY", L + 10, projStartY + 8, { width: CONTENT_W });

  let curY = projStartY + 40;

  // ── PROJECT CARDS ───────────────────────────────────────────────────────────
  (projects || []).forEach((project: any, idx: number) => {
    const cardH = estimateCardHeight(project);

    // Page break if needed
    if (curY + cardH > doc.page.height - 60) {
      doc.addPage();
      curY = 50;
    }

    // Card background (alternating)
    const cardBg = idx % 2 === 0 ? "#ffffff" : LIGHT;
    doc.rect(L, curY, CONTENT_W, cardH).fill(cardBg).stroke("#e5e7eb");

    // Left accent strip
    doc.rect(L, curY, 5, cardH).fill(NAVY);

    // Project name
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(13)
      .text(project.projectName || "Untitled Project", L + 14, curY + 10, { width: CONTENT_W - 150 });

    // Project type badge (top right)
    if (project.projectType) {
      const badgeText = project.projectType.toUpperCase();
      doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(7)
        .text(badgeText, R - 120, curY + 13, { width: 110, align: "right" });
    }

    // Location | Client | Role
    const subParts = [project.location, project.clientOwner, project.yourRole].filter(Boolean);
    doc.fillColor("#6b7280").font("Helvetica").fontSize(9)
      .text(subParts.join("  ·  "), L + 14, curY + 26, { width: CONTENT_W - 20 });

    // Metrics row
    const metricsY = curY + 42;
    const metrics = [
      { label: "Contract Value", value: project.contractValue || "—" },
      { label: "Square Footage", value: project.squareFootage || "—" },
      { label: "Duration", value: [project.startDate, project.endDate].filter(Boolean).join(" – ") || "—" },
    ];
    const mW = (CONTENT_W - 20) / 3;
    metrics.forEach((m, i) => {
      const mx = L + 14 + i * (mW + 2);
      doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10)
        .text(m.value, mx, metricsY, { width: mW });
      doc.fillColor("#9ca3af").font("Helvetica").fontSize(7)
        .text(m.label.toUpperCase(), mx, metricsY + 14, { width: mW });
    });

    // Scope
    let textY = metricsY + 32;
    if (project.scope) {
      doc.fillColor("#374151").font("Helvetica").fontSize(9)
        .text(project.scope, L + 14, textY, { width: CONTENT_W - 28, lineGap: 2 });
      textY = doc.y + 6;
    }

    // Highlights
    const highlights = (project.highlights || []).filter(Boolean);
    if (highlights.length > 0) {
      highlights.forEach((h: string) => {
        doc.fillColor(NAVY).font("Helvetica").fontSize(8)
          .text(`▸  ${h}`, L + 14, textY, { width: CONTENT_W - 28 });
        textY = doc.y + 2;
      });
    }

    curY += cardH + 8;
  });

  // Footer on last page
  doc.fillColor("#9ca3af").font("Helvetica").fontSize(8)
    .text(`${portfolio.name || ""} — Project Portfolio  ·  Confidential`, L, doc.page.height - 35, { width: CONTENT_W, align: "center" });
}

function estimateCardHeight(project: any): number {
  const highlights = (project.highlights || []).filter(Boolean).length;
  const scopeLines = project.scope ? Math.ceil(project.scope.length / 90) : 0;
  return 90 + (scopeLines * 11) + (highlights * 12);
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const isResume = data.type === "resume";
    const isProjectList = data.type === "project-list";

    const PDFDocument = (await import("pdfkit")).default;
    const doc = new PDFDocument({ size: "LETTER", margin: 50 });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    await new Promise<void>((resolve, reject) => {
      doc.on("end", resolve);
      doc.on("error", reject);

      if (isProjectList) {
        drawProjectPortfolio(doc, data);
      } else if (isResume) {
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
    const filename = isProjectList ? "Project-Portfolio" : isResume ? "Resume" : "Cover-Letter";

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (err: any) {
    console.error("PDF export error:", err?.message || err);
    return NextResponse.json({ error: "PDF generation failed.", detail: err?.message }, { status: 500 });
  }
}
