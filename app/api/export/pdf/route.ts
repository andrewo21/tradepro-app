export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { PDF_TEMPLATE_REGISTRY, addPageNumbers } from "@/lib/pdfTemplates";
import path from "path";
import fs from "fs";

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

// ── ATS Report PDF ─────────────────────────────────────────────────────────────
function drawATSReport(doc: any, data: any) {
  const W = doc.page.width;
  const L = 50; const R = W - 50; const CW = R - L;
  const GREEN = "#166534"; const LIGHT_GREEN = "#dcfce7";
  const AMBER = "#d97706"; const RED = "#dc2626";

  function scoreColor(label: string) {
    if (label === "Forte") return GREEN;
    if (label === "Mediano") return AMBER;
    return RED;
  }
  const SC = scoreColor(data.strength_label);

  // Header bar
  doc.rect(0, 0, W, 72).fill(GREEN);
  doc.fillColor("white").font("Helvetica-Bold").fontSize(18)
    .text("Relatório de Análise ATS", L, 18);
  doc.font("Helvetica").fontSize(10).fillColor("#bbf7d0")
    .text("TradePro Technologies — Brasil", L, 42);
  if (data.date) doc.text(data.date, R - 60, 42);

  let y = 90;

  // Candidate info
  if (data.candidateName) {
    doc.font("Helvetica-Bold").fontSize(14).fillColor("#111827")
      .text(data.candidateName, L, y);
    y = doc.y + 3;
  }
  if (data.profession) {
    doc.font("Helvetica").fontSize(11).fillColor("#6b7280").text(data.profession, L, y);
    y = doc.y + 6;
  }
  doc.font("Helvetica").fontSize(10).fillColor("#6b7280")
    .text(data.mode === "with_job" ? "Análise contra vaga específica" : "Avaliação geral do currículo", L, y);
  y = doc.y + 20;

  // Score & label
  doc.rect(L, y, CW, 80).fill(LIGHT_GREEN);
  const score = data.final_ats_score !== null && data.final_ats_score !== undefined
    ? String(data.final_ats_score)
    : String(data.structure_score);
  doc.font("Helvetica-Bold").fontSize(36).fillColor(SC)
    .text(score, L + 20, y + 18, { lineBreak: false });
  doc.font("Helvetica-Bold").fontSize(16).fillColor(SC)
    .text(data.strength_label, L + 90, y + 26, { lineBreak: false });
  doc.font("Helvetica").fontSize(10).fillColor("#374151")
    .text(
      data.mode === "with_job" ? "Pontuação ATS Final" : "Pontuação de Estrutura",
      L + 90, y + 48, { lineBreak: false }
    );
  y += 100;

  // Score bars
  function drawBar(label: string, value: number, barColor: string) {
    doc.font("Helvetica").fontSize(10).fillColor("#374151").text(label, L, y, { lineBreak: false });
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#111827")
      .text(`${Math.round(value)}%`, R - 30, y, { lineBreak: false });
    y += 14;
    doc.rect(L, y, CW, 8).fill("#e5e7eb");
    doc.rect(L, y, (CW * value) / 100, 8).fill(barColor);
    y += 18;
  }

  drawBar("Estrutura do currículo", data.structure_score, GREEN);
  if (data.skills_coverage_score !== undefined && data.skills_coverage_score !== null) {
    drawBar("Cobertura de habilidades da vaga", data.skills_coverage_score, "#2563eb");
  }
  if (data.semantic_match_score !== undefined && data.semantic_match_score !== null) {
    drawBar("Alinhamento semântico com a vaga", data.semantic_match_score, AMBER);
  }
  y += 10;

  // Skills found / missing
  if (data.mode === "with_job") {
    if (data.skills_found?.length) {
      doc.font("Helvetica-Bold").fontSize(11).fillColor(GREEN).text("✓ Habilidades Encontradas", L, y); y = doc.y + 4;
      data.skills_found.slice(0, 10).forEach((s: string) => {
        doc.font("Helvetica").fontSize(10).fillColor("#374151").text(`• ${s}`, L + 10, y, { width: CW - 10 }); y = doc.y + 2;
      });
      y += 8;
    }
    if (data.skills_missing?.length) {
      if (y + 60 > doc.page.height - 60) { doc.addPage(); y = 50; }
      doc.font("Helvetica-Bold").fontSize(11).fillColor(AMBER).text("⚠ Habilidades Faltando", L, y); y = doc.y + 4;
      data.skills_missing.slice(0, 10).forEach((s: string) => {
        doc.font("Helvetica").fontSize(10).fillColor("#374151").text(`• ${s}`, L + 10, y, { width: CW - 10 }); y = doc.y + 2;
      });
      y += 8;
    }
  }

  // Specific enhancements (deterministic, quantified)
  if (data.specific_enhancements?.length) {
    if (y + 80 > doc.page.height - 60) { doc.addPage(); y = 50; }
    doc.moveTo(L, y).lineTo(R, y).lineWidth(0.5).stroke("#d1d5db"); y += 14;
    doc.font("Helvetica-Bold").fontSize(12).fillColor("#1d4ed8").text("📈 Melhorias Específicas", L, y); y = doc.y + 4;
    doc.font("Helvetica").fontSize(9).fillColor("#6b7280")
      .text("Ações concretas com impacto estimado na sua pontuação.", L, y, { width: CW }); y = doc.y + 8;
    data.specific_enhancements.forEach((s: string) => {
      if (y + 35 > doc.page.height - 60) { doc.addPage(); y = 50; }
      doc.circle(L + 4, y + 5, 2).fill("#1d4ed8");
      doc.font("Helvetica").fontSize(10).fillColor("#374151").text(s, L + 13, y, { width: CW - 13, lineGap: 2 });
      y = doc.y + 8;
    });
  }

  // Role recommendations (accepts both field names)
  const roleRecs = data.role_recommendations_pt_br || data.specific_recommendations || [];
  if (roleRecs.length) {
    if (y + 80 > doc.page.height - 60) { doc.addPage(); y = 50; }
    doc.moveTo(L, y).lineTo(R, y).lineWidth(0.5).stroke("#d1d5db"); y += 14;
    const profLabel = data.profession ? `Para ${data.profession} — Recomendações Específicas` : "Recomendações Específicas";
    doc.font("Helvetica-Bold").fontSize(12).fillColor("#111827").text(`🎯 ${profLabel}`, L, y); y = doc.y + 4;
    doc.font("Helvetica").fontSize(9).fillColor("#6b7280")
      .text("Comparando seu currículo com o que é esperado para esta área no mercado.", L, y, { width: CW }); y = doc.y + 8;
    roleRecs.forEach((s: string, i: number) => {
      if (y + 40 > doc.page.height - 60) { doc.addPage(); y = 50; }
      doc.font("Helvetica-Bold").fontSize(10).fillColor(GREEN).text(`${i + 1}.`, L, y, { lineBreak: false });
      doc.font("Helvetica").fontSize(10).fillColor("#374151").text(s, L + 18, y, { width: CW - 18, lineGap: 2 });
      y = doc.y + 10;
    });
  }

  // General structure hints
  if (data.suggestions_pt_br?.length) {
    if (y + 80 > doc.page.height - 60) { doc.addPage(); y = 50; }
    doc.moveTo(L, y).lineTo(R, y).lineWidth(0.5).stroke("#d1d5db"); y += 14;
    doc.font("Helvetica-Bold").fontSize(12).fillColor("#111827").text("💡 Dicas Gerais de Estrutura", L, y); y = doc.y + 8;
    data.suggestions_pt_br.forEach((s: string, i: number) => {
      if (y + 40 > doc.page.height - 60) { doc.addPage(); y = 50; }
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#6b7280").text(`${i + 1}.`, L, y, { lineBreak: false });
      doc.font("Helvetica").fontSize(10).fillColor("#374151")
        .text(s, L + 18, y, { width: CW - 18, lineGap: 2 });
      y = doc.y + 10;
    });
  }

  // Footer
  doc.moveTo(L, doc.page.height - 40).lineTo(R, doc.page.height - 40).lineWidth(0.5).stroke("#d1d5db");
  doc.font("Helvetica").fontSize(9).fillColor("#9ca3af")
    .text("TradePro Technologies · tradeprotech.ai · Análise gerada por IA", L, doc.page.height - 28, { width: CW, align: "center" });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const isResume = data.type === "resume";
    const isProjectList = data.type === "project-list";
    const isATSReport = data.type === "ats-report";

    const PDFDocument = (await import("pdfkit")).default;
    const doc = new PDFDocument({ size: "LETTER", margin: 0, autoFirstPage: true, bufferPages: true });

    // Register Carlito (Calibri-compatible) — only if font files exist
    try {
      const fontDir = path.join(process.cwd(), "public", "fonts");
      const regularPath = path.join(fontDir, "Carlito-Regular.ttf");
      const boldPath = path.join(fontDir, "Carlito-Bold.ttf");
      if (fs.existsSync(regularPath) && fs.existsSync(boldPath)) {
        doc.registerFont("Helvetica", fs.readFileSync(regularPath));
        doc.registerFont("Helvetica-Bold", fs.readFileSync(boldPath));
      }
    } catch {
      // fall back to built-in Helvetica
    }

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    await new Promise<void>((resolve, reject) => {
      doc.on("end", resolve);
      doc.on("error", reject);

      if (isATSReport) {
        drawATSReport(doc, data);
        addPageNumbers(doc);
      } else if (isProjectList) {
        drawProjectPortfolio(doc, data);
      } else if (isResume) {
        const templateId = (data.selectedTemplate || "standard-contemporary").trim().toLowerCase();
        const vectorDraw = PDF_TEMPLATE_REGISTRY[templateId];
        const legacyDraw = templateRegistry[templateId] || drawStandardContemporary;
        const draw = vectorDraw || legacyDraw;

        // Normalise data fields — support both old (applicantName) and new (name) payload shapes
        const normData = {
          ...data,
          // New shape fields used by pdfTemplates.ts vector renderers
          name:    data.name    || [data.firstName, data.lastName].filter(Boolean).join(" ") || data.applicantName || "",
          title:   data.title   || data.tradeTitle   || "",
          contact: data.contact || {
            phone:    data.applicantPhone    || "",
            email:    data.applicantEmail    || "",
            location: data.applicantAddress  || "",
            linkedin: data.linkedin          || "",
          },
          // Guarantee arrays exist
          skills:         Array.isArray(data.skills)         ? data.skills         : [],
          experience:     Array.isArray(data.experience)     ? data.experience     : [],
          education:      Array.isArray(data.education)      ? data.education      : [],
          certifications: Array.isArray(data.certifications) ? data.certifications : [],
        };

        try {
          draw(doc, normData);
        } catch (drawErr: any) {
          console.error(`PDF draw error [template=${templateId}]:`, drawErr?.message, drawErr?.stack);
          // Fall back to standard-contemporary if chosen template crashes
          if (templateId !== "standard-contemporary") {
            const fallback = PDF_TEMPLATE_REGISTRY["standard-contemporary"];
            fallback(doc, normData);
          } else {
            throw drawErr;
          }
        }
        addPageNumbers(doc);
      } else {
        // Cover letter — choose style based on template param
        const clTemplate = data.coverLetterTemplate || "modern-blue";
        if (clTemplate === "traditional-clean") {
          // Traditional Clean — no color header, serif block letter
          const L2 = 60; const W2 = doc.page.width - 120;
          doc.font("Helvetica-Bold").fontSize(13).fillColor("#111827")
            .text(data.applicantName || "", L2, 50);
          doc.font("Helvetica").fontSize(9).fillColor("#374151");
          [data.applicantAddress, data.applicantCityStateZip, data.applicantPhone, data.applicantEmail]
            .filter(Boolean).forEach(line => {
              doc.text(line, L2, doc.y + 2);
            });
          doc.moveDown(0.8);
          doc.font("Helvetica").fontSize(10).fillColor("#374151").text(data.date || "", L2, doc.y);
          doc.moveDown(0.8);
          if (data.hiringManager || data.companyName) {
            const isBR = data.locale === "pt-BR";
            if (data.hiringManager) {
              doc.font("Helvetica").fontSize(10).fillColor("#374151")
                .text((isBR ? "Att.: " : "Attn: ") + data.hiringManager, L2, doc.y + 2);
            }
            if (data.companyName) {
              doc.font("Helvetica").fontSize(10).fillColor("#374151")
                .text((isBR ? "Empresa: " : "") + data.companyName, L2, doc.y + 2);
            }
            doc.moveDown(0.8);
          }
          doc.font("Helvetica").fontSize(10.5).fillColor("#1f2937")
            .text(data.letter || "", L2, doc.y, { width: W2, lineGap: 4 });
        } else {
          // Modern Blue — blue header
          doc.rect(0, 0, doc.page.width, 110).fill("#1F4E79");
          doc.fillColor("white").font("Helvetica-Bold").fontSize(22)
            .text(data.applicantName || "", 50, 30);
          doc.font("Helvetica").fontSize(9).fillColor("#bfdbfe")
            .text([data.applicantEmail, data.applicantPhone].filter(Boolean).join("  |  "), 50, doc.y + 4);
          [data.applicantAddress, data.applicantCityStateZip].filter(Boolean)
            .forEach(line => doc.text(line, 50, doc.y + 2));
          doc.fillColor("#111827").font("Helvetica").fontSize(10)
            .text(data.date || "", 50, 125);
          if (data.hiringManager || data.companyName) {
            const isBR2 = data.locale === "pt-BR";
            doc.moveDown(0.5);
            const addrLines = [
              data.hiringManager ? (isBR2 ? "Att.: " : "Attn: ") + data.hiringManager : null,
              data.companyName ? (isBR2 ? "Empresa: " : "") + data.companyName : null,
              data.companyAddress,
              data.companyCityStateZip,
            ].filter(Boolean);
            addrLines.forEach((line: any) => doc.font("Helvetica").fontSize(10).fillColor("#374151").text(line, 50, doc.y + 2));
          }
          doc.moveDown(1);
          doc.font("Helvetica").fontSize(10.5).fillColor("#1f2937")
            .text(data.letter || "", 50, doc.y, { width: 512, lineGap: 4 });
        }
      }

      doc.flushPages();
      doc.end();
    });

    const pdfBuffer = Buffer.concat(chunks);
    const filename = isProjectList ? "Project-Portfolio" : isResume ? "Resume" : "Cover-Letter";

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        // 'attachment' forces download in all browsers including Firefox
        "Content-Disposition": `attachment; filename="${filename}.pdf"; filename*=UTF-8''${encodeURIComponent(filename + ".pdf")}`,
        "Content-Length": String(pdfBuffer.length),
        // Prevent caching issues in Firefox
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
        // Tell Firefox this is a binary file
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err: any) {
    console.error("PDF export error:", err?.message || err);
    return NextResponse.json({ error: "PDF generation failed.", detail: err?.message }, { status: 500 });
  }
}
