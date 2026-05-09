// lib/pdfTemplates.ts
// pdfkit renderers — 1-inch margins, 11pt base, fixed sidebar continuity, page numbers.

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 72;           // 1 inch
const L = MARGIN;
const R = PAGE_W - MARGIN;
const CONTENT_W = R - L;    // 468pt

const FOOTER_Y = PAGE_H - 36; // bottom-center page number position

// ── Shared helpers ────────────────────────────────────────────────────────────

function getSkills(data: any): string[] {
  return (data.skills || []).map((s: any) => typeof s === "string" ? s : (s.text || "")).filter(Boolean);
}

function getBullets(job: any): string[] {
  return [...(job.responsibilities || []), ...(job.achievements || [])]
    .map((b: any) => typeof b === "string" ? b : (b.text || ""))
    .filter(Boolean);
}

function estimateTextHeight(text: string, width: number, fontSize = 11, lineGap = 2): number {
  const charsPerLine = Math.max(1, Math.floor(width / (fontSize * 0.53)));
  const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
  return lines * (fontSize + lineGap) + 2;
}

function checkPageBreak(doc: any, y: number, neededHeight: number, margin = MARGIN, onNewPage?: () => void): number {
  if (y + neededHeight > PAGE_H - margin) {
    doc.addPage();
    if (onNewPage) onNewPage();
    return MARGIN;
  }
  return y;
}

function drawPageNumber(doc: any, pageNum: number) {
  doc.font("Helvetica").fontSize(10).fillColor("#777777")
    .text(String(pageNum), 0, FOOTER_Y, { width: PAGE_W, align: "center" });
}

/** Draw bullet and return new Y */
function drawBullet(doc: any, text: string, x: number, y: number, width: number, dotColor = "#374151", onNewPage?: () => void): number {
  const neededH = estimateTextHeight(text, width - 12);
  y = checkPageBreak(doc, y, neededH, MARGIN, onNewPage);
  doc.circle(x + 5, y + 5, 1.8).fill(dotColor);
  doc.font("Helvetica").fontSize(11).fillColor("#374151")
    .text(text, x + 13, y, { width: width - 13, lineGap: 2 });
  return doc.y + 3;
}

/** Draw section header with rule, return new Y */
function sectionRule(doc: any, title: string, x: number, y: number, width: number, color = "#1f2937"): number {
  doc.font("Helvetica-Bold").fontSize(12).fillColor(color)
    .text(title.toUpperCase(), x, y, { width, characterSpacing: 0.8, lineBreak: false });
  const ruleY = y + 15;
  doc.moveTo(x, ruleY).lineTo(x + width, ruleY).lineWidth(0.5).stroke("#d1d5db");
  return ruleY + 7;
}

/** Draw a job block with overflow handling, return new Y */
function jobBlock(
  doc: any, job: any, x: number, y: number, width: number,
  dotColor = "#374151", titleColor = "#111827", companyColor = "#4b5563", dateColor = "#6b7280",
  onNewPage?: () => void
): number {
  const dates = [job.startDate, job.endDate].filter(Boolean).join(" – ");
  const dateW = 100;
  const bullets = getBullets(job);

  if (y + 30 > PAGE_H - MARGIN) {
    doc.addPage();
    if (onNewPage) onNewPage();
    y = MARGIN;
  }

  doc.font("Helvetica-Bold").fontSize(11).fillColor(titleColor)
    .text(job.jobTitle || "", x, y, { width: width - dateW - 5 });
  const afterTitle = doc.y;

  if (dates) {
    doc.font("Helvetica").fontSize(10).fillColor(dateColor)
      .text(dates, x + width - dateW, y, { width: dateW, align: "right" });
  }
  doc.y = afterTitle;
  if (job.company) {
    doc.font("Helvetica").fontSize(10).fillColor(companyColor).text(job.company, x, doc.y + 2, { width });
  }

  let curY = doc.y + 5;
  bullets.forEach(b => {
    const neededH = estimateTextHeight(b, width - 13) + 5;
    if (curY + neededH > PAGE_H - MARGIN) {
      doc.addPage();
      if (onNewPage) onNewPage();
      curY = MARGIN;
    }
    curY = drawBullet(doc, b, x, curY, width, dotColor);
  });
  return curY + 8;
}

/** Two-column skills grid, return new Y */
function skillsGrid(doc: any, skills: string[], x: number, y: number, width: number, dotColor = "#374151"): number {
  const col = width / 2;
  const mid = Math.ceil(skills.length / 2);
  const startY = y;
  skills.slice(0, mid).forEach((s, i) => {
    const sy = startY + i * 15;
    doc.circle(x + 5, sy + 5, 1.8).fill(dotColor);
    doc.font("Helvetica").fontSize(11).fillColor("#374151").text(s, x + 13, sy, { width: col - 18 });
  });
  skills.slice(mid).forEach((s, i) => {
    const sy = startY + i * 15;
    doc.circle(x + col + 5, sy + 5, 1.8).fill(dotColor);
    doc.font("Helvetica").fontSize(11).fillColor("#374151").text(s, x + col + 13, sy, { width: col - 18 });
  });
  return startY + Math.ceil(skills.length / 2) * 15 + 10;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. STANDARD CONTEMPORARY
// ═══════════════════════════════════════════════════════════════════════════════
export function drawStandardContemporaryPDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education, certifications } = data;
  const skills = getSkills(data);
  let pageNum = 1;

  doc.font("Helvetica-Bold").fontSize(22).fillColor("#111827").text(name || "", L, 36);
  const afterName = doc.y + 3;
  if (title) doc.font("Helvetica").fontSize(12).fillColor("#6b7280").text(title, L, afterName);

  const cp = [contact?.phone, contact?.email, contact?.location, contact?.linkedin].filter(Boolean);
  if (cp.length) doc.font("Helvetica").fontSize(10).fillColor("#6b7280")
    .text(cp.join("  |  "), L, 40, { width: CONTENT_W, align: "right" });

  doc.moveTo(L, 72).lineTo(R, 72).lineWidth(0.75).stroke("#d1d5db");
  let y = 82;

  if (summary?.trim()) {
    y = sectionRule(doc, "Professional Summary", L, y, CONTENT_W);
    doc.font("Helvetica").fontSize(11).fillColor("#374151").text(summary, L, y, { width: CONTENT_W, lineGap: 2 });
    y = doc.y + 10;
  }
  if (skills.length) {
    y = sectionRule(doc, "Core Skills", L, y, CONTENT_W);
    y = skillsGrid(doc, skills, L, y, CONTENT_W);
  }
  if (experience?.length) {
    y = sectionRule(doc, "Experience", L, y, CONTENT_W);
    experience.forEach((job: any) => { y = jobBlock(doc, job, L, y, CONTENT_W); });
  }
  if (education?.length) {
    y = checkPageBreak(doc, y, 50);
    y = sectionRule(doc, "Education", L, y, CONTENT_W);
    education.forEach((edu: any) => {
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#111827")
        .text([edu.degree, edu.school].filter(Boolean).join(" — "), L, y, { width: CONTENT_W });
      y = doc.y + 3;
    });
  }
  if ((certifications || []).length) {
    y = checkPageBreak(doc, y, 50);
    y = sectionRule(doc, "Certifications & Licenses", L, y, CONTENT_W);
    certifications.forEach((c: string) => {
      doc.circle(L + 5, y + 5, 1.8).fill("#374151");
      doc.font("Helvetica").fontSize(11).fillColor("#374151").text(c, L + 13, y, { width: CONTENT_W - 13 });
      y = doc.y + 3;
    });
  }
  drawPageNumber(doc, pageNum);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. STANDARD CLASSIC
// ═══════════════════════════════════════════════════════════════════════════════
export function drawStandardClassicPDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education, certifications } = data;
  const skills = getSkills(data);
  let pageNum = 1;

  doc.rect(0, 0, PAGE_W, 68).fill("#111827");
  doc.font("Helvetica-Bold").fontSize(22).fillColor("#ffffff").text(name || "", L, 18);
  if (title) doc.font("Helvetica").fontSize(12).fillColor("#d1d5db").text(title, L, 42);
  const cp = [contact?.phone, contact?.email, contact?.location].filter(Boolean);
  doc.font("Helvetica").fontSize(10).fillColor("#9ca3af").text(cp.join("  |  "), L, 22, { width: CONTENT_W, align: "right" });

  let y = 82;
  if (summary?.trim()) {
    y = sectionRule(doc, "Professional Summary", L, y, CONTENT_W);
    doc.font("Helvetica").fontSize(11).fillColor("#374151").text(summary, L, y, { width: CONTENT_W, lineGap: 2 });
    y = doc.y + 10;
  }
  if (skills.length) {
    y = sectionRule(doc, "Core Skills", L, y, CONTENT_W);
    y = skillsGrid(doc, skills, L, y, CONTENT_W);
  }
  if (experience?.length) {
    y = sectionRule(doc, "Experience", L, y, CONTENT_W);
    experience.forEach((job: any) => { y = jobBlock(doc, job, L, y, CONTENT_W); });
  }
  if (education?.length) {
    y = checkPageBreak(doc, y, 50);
    y = sectionRule(doc, "Education", L, y, CONTENT_W);
    education.forEach((edu: any) => {
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#111827").text([edu.degree, edu.school].filter(Boolean).join(" — "), L, y, { width: CONTENT_W });
      y = doc.y + 3;
    });
  }
  if ((certifications || []).length) {
    y = checkPageBreak(doc, y, 50);
    y = sectionRule(doc, "Certifications & Licenses", L, y, CONTENT_W);
    certifications.forEach((c: string) => {
      doc.circle(L + 5, y + 5, 1.8).fill("#374151");
      doc.font("Helvetica").fontSize(11).fillColor("#374151").text(c, L + 13, y, { width: CONTENT_W - 13 });
      y = doc.y + 3;
    });
  }
  drawPageNumber(doc, pageNum);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. MODERN BLUE
// ═══════════════════════════════════════════════════════════════════════════════
export function drawModernBluePDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education, certifications } = data;
  const skills = getSkills(data);
  const BLUE = "#1d4ed8";
  let pageNum = 1;

  doc.rect(0, 0, PAGE_W, 86).fill(BLUE);
  doc.font("Helvetica-Bold").fontSize(22).fillColor("#ffffff").text(name || "", L, 18);
  if (title) doc.font("Helvetica").fontSize(12).fillColor("#bfdbfe").text(title, L, 43);
  const cp = [contact?.phone, contact?.email, contact?.location].filter(Boolean);
  doc.font("Helvetica").fontSize(10).fillColor("#dbeafe").text(cp.join("  |  "), L, 68, { width: CONTENT_W });

  let y = 100;
  if (summary?.trim()) {
    doc.font("Helvetica-Bold").fontSize(12).fillColor(BLUE).text("SUMMARY", L, y); y = doc.y + 5;
    doc.font("Helvetica").fontSize(11).fillColor("#374151").text(summary, L, y, { width: CONTENT_W, lineGap: 2 }); y = doc.y + 10;
  }
  if (skills.length) {
    doc.font("Helvetica-Bold").fontSize(12).fillColor(BLUE).text("SKILLS", L, y); y = doc.y + 5;
    doc.font("Helvetica").fontSize(11).fillColor("#374151").text(skills.join("   •   "), L, y, { width: CONTENT_W }); y = doc.y + 10;
  }
  if (experience?.length) {
    doc.font("Helvetica-Bold").fontSize(12).fillColor(BLUE).text("EXPERIENCE", L, y);
    doc.moveTo(L, doc.y + 5).lineTo(R, doc.y + 5).lineWidth(0.5).stroke(BLUE); y = doc.y + 10;
    experience.forEach((job: any) => { y = jobBlock(doc, job, L, y, CONTENT_W); });
  }
  if (education?.length) {
    y = checkPageBreak(doc, y, 50);
    doc.font("Helvetica-Bold").fontSize(12).fillColor(BLUE).text("EDUCATION", L, y);
    doc.moveTo(L, doc.y + 5).lineTo(R, doc.y + 5).lineWidth(0.5).stroke(BLUE); y = doc.y + 10;
    education.forEach((edu: any) => {
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#111827").text([edu.degree, edu.school].filter(Boolean).join(" — "), L, y, { width: CONTENT_W });
      y = doc.y + 3;
    });
  }
  drawPageNumber(doc, pageNum);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. BASIC TWO COLUMN
// Sidebar: grey #f3f4f6, 30% width. Main: 70%
// ═══════════════════════════════════════════════════════════════════════════════
export function drawBasicTwoColumnPDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education, certifications } = data;
  const skills = getSkills(data);
  const SIDE_W = 170;
  const MAIN_X = SIDE_W + 20;
  const MAIN_W = PAGE_W - MAIN_X - 30;
  let pageNum = 1;

  const drawSidebar4 = () => {
    doc.rect(0, 0, SIDE_W, doc.page.height).fill("#f3f4f6");
  };
  drawSidebar4();

  let sY = 28;
  doc.font("Helvetica-Bold").fontSize(16).fillColor("#111827").text(name || "", 15, sY, { width: SIDE_W - 20 }); sY = doc.y + 3;
  if (title) { doc.font("Helvetica").fontSize(10).fillColor("#6b7280").text(title, 15, sY, { width: SIDE_W - 20 }); sY = doc.y + 10; }
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#6b7280").text("CONTACT", 15, sY, { characterSpacing: 0.5 }); sY = doc.y + 4;
  [contact?.phone, contact?.email, contact?.location].filter(Boolean).forEach(c => {
    doc.font("Helvetica").fontSize(10).fillColor("#374151").text(c, 15, sY, { width: SIDE_W - 20 }); sY = doc.y + 3;
  });
  sY += 8;
  if (skills.length) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#6b7280").text("SKILLS", 15, sY, { characterSpacing: 0.5 }); sY = doc.y + 4;
    skills.forEach(s => {
      doc.circle(22, sY + 5, 1.8).fill("#6b7280");
      doc.font("Helvetica").fontSize(10).fillColor("#374151").text(s, 30, sY, { width: SIDE_W - 35 }); sY = doc.y + 3;
    }); sY += 8;
  }
  if ((certifications || []).length) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#6b7280").text("CERTIFICATIONS", 15, sY, { characterSpacing: 0.5 }); sY = doc.y + 4;
    certifications.forEach((c: string) => {
      doc.circle(22, sY + 5, 1.8).fill("#6b7280");
      doc.font("Helvetica").fontSize(10).fillColor("#374151").text(c, 30, sY, { width: SIDE_W - 35 }); sY = doc.y + 3;
    });
  }
  if (education?.length) {
    sY += 8;
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#6b7280").text("EDUCATION", 15, sY, { characterSpacing: 0.5 }); sY = doc.y + 4;
    education.forEach((edu: any) => {
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#374151").text(edu.degree || "", 15, sY, { width: SIDE_W - 20 }); sY = doc.y + 2;
      doc.font("Helvetica").fontSize(9).fillColor("#6b7280").text(edu.school || "", 15, sY, { width: SIDE_W - 20 }); sY = doc.y + 6;
    });
  }

  let mY = 28;
  if (summary?.trim()) {
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#374151").text("PROFESSIONAL SUMMARY", MAIN_X, mY, { characterSpacing: 0.4 }); mY = doc.y + 4;
    doc.moveTo(MAIN_X, mY).lineTo(PAGE_W - 30, mY).lineWidth(0.5).stroke("#d1d5db"); mY += 6;
    doc.font("Helvetica").fontSize(11).fillColor("#374151").text(summary, MAIN_X, mY, { width: MAIN_W, lineGap: 2 }); mY = doc.y + 12;
  }
  if (experience?.length) {
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#374151").text("EXPERIENCE", MAIN_X, mY, { characterSpacing: 0.4 }); mY = doc.y + 4;
    doc.moveTo(MAIN_X, mY).lineTo(PAGE_W - 30, mY).lineWidth(0.5).stroke("#d1d5db"); mY += 6;
    experience.forEach((job: any) => { mY = jobBlock(doc, job, MAIN_X, mY, MAIN_W, "#374151", "#111827", "#4b5563", "#6b7280", drawSidebar4); });
  }
  drawPageNumber(doc, pageNum);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. SIDEBAR GREEN
// Sidebar: #E6F4EA (~32%), solid on every page. Main: right portion.
// ═══════════════════════════════════════════════════════════════════════════════
export function drawSidebarGreenPDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education, certifications } = data;
  const skills = getSkills(data);
  const GREEN_BG = "#E6F4EA";
  const GREEN_SECTION = "#1f2937";
  const SIDE_W = 185;
  const MAIN_X = SIDE_W + 18;
  const MAIN_W = PAGE_W - MAIN_X - 36;
  let pageNum = 1;

  const drawSidebar5 = () => {
    doc.rect(0, 0, SIDE_W, doc.page.height).fill(GREEN_BG);
    drawPageNumber(doc, pageNum);
    pageNum++;
  };
  drawSidebar5();
  // first page number was incremented, reset to 1 for subsequent logic
  pageNum = 1;

  const onNewPage5 = () => {
    doc.rect(0, 0, SIDE_W, doc.page.height).fill(GREEN_BG);
    pageNum++;
    drawPageNumber(doc, pageNum);
  };

  // Draw page 1 footer separately (happens at end)
  let sY = 24;
  doc.font("Helvetica-Bold").fontSize(17).fillColor("#111827")
    .text(name || "", 16, sY, { width: SIDE_W - 22 }); sY = doc.y + 4;
  if (title) {
    doc.font("Helvetica").fontSize(10).fillColor("#374151")
      .text(title, 16, sY, { width: SIDE_W - 22 }); sY = doc.y + 8;
  }
  [contact?.location, contact?.email, contact?.phone].filter(Boolean).forEach(c => {
    doc.font("Helvetica").fontSize(9.5).fillColor("#374151").text(c, 16, sY, { width: SIDE_W - 22 }); sY = doc.y + 3;
  }); sY += 10;

  if (skills.length) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(GREEN_SECTION)
      .text("SKILLS", 16, sY, { characterSpacing: 0.5 }); sY = doc.y + 3;
    doc.moveTo(16, sY).lineTo(SIDE_W - 12, sY).lineWidth(0.5).stroke("#9ca3af"); sY += 5;
    skills.forEach(s => {
      doc.circle(22, sY + 5, 1.8).fill("#1f2937");
      doc.font("Helvetica").fontSize(10).fillColor("#1f2937")
        .text(s, 30, sY, { width: SIDE_W - 35 }); sY = doc.y + 3;
    }); sY += 8;
  }

  if ((certifications || []).length) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(GREEN_SECTION)
      .text("CERTIFICATIONS", 16, sY, { characterSpacing: 0.5 }); sY = doc.y + 3;
    doc.moveTo(16, sY).lineTo(SIDE_W - 12, sY).lineWidth(0.5).stroke("#9ca3af"); sY += 5;
    certifications.forEach((c: string) => {
      doc.circle(22, sY + 5, 1.8).fill("#1f2937");
      doc.font("Helvetica").fontSize(10).fillColor("#1f2937")
        .text(c, 30, sY, { width: SIDE_W - 35 }); sY = doc.y + 3;
    });
  }

  let mY = 24;
  if (summary?.trim()) {
    doc.font("Helvetica-Bold").fontSize(11).fillColor(GREEN_SECTION)
      .text("PROFESSIONAL SUMMARY", MAIN_X, mY, { characterSpacing: 0.5 }); mY = doc.y + 3;
    doc.moveTo(MAIN_X, mY).lineTo(PAGE_W - 36, mY).lineWidth(0.5).stroke("#d1d5db"); mY += 6;
    doc.font("Helvetica").fontSize(11).fillColor("#374151")
      .text(summary, MAIN_X, mY, { width: MAIN_W, lineGap: 2 }); mY = doc.y + 12;
  }

  if (experience?.length) {
    doc.font("Helvetica-Bold").fontSize(11).fillColor(GREEN_SECTION)
      .text("EXPERIENCE", MAIN_X, mY, { characterSpacing: 0.5 }); mY = doc.y + 3;
    doc.moveTo(MAIN_X, mY).lineTo(PAGE_W - 36, mY).lineWidth(0.5).stroke("#d1d5db"); mY += 6;
    experience.forEach((job: any) => {
      mY = jobBlock(doc, job, MAIN_X, mY, MAIN_W, "#374151", "#111827", "#4b5563", "#6b7280", onNewPage5);
    });
  }

  if (education?.length) {
    mY = checkPageBreak(doc, mY, 50, MARGIN, onNewPage5);
    doc.font("Helvetica-Bold").fontSize(11).fillColor(GREEN_SECTION)
      .text("EDUCATION", MAIN_X, mY, { characterSpacing: 0.5 }); mY = doc.y + 3;
    doc.moveTo(MAIN_X, mY).lineTo(PAGE_W - 36, mY).lineWidth(0.5).stroke("#d1d5db"); mY += 6;
    education.forEach((edu: any) => {
      const parts = [edu.degree, edu.school].filter(Boolean);
      doc.font("Helvetica").fontSize(11).fillColor("#374151")
        .text(parts.join(" — "), MAIN_X, mY, { width: MAIN_W }); mY = doc.y + 5;
    });
  }

  // Page 1 number (drawn after content so it sits on top of sidebar)
  drawPageNumber(doc, 1);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. EXECUTIVE CLASSIC (premium)
// Navy bar header, orange accent rule, centered title
// ═══════════════════════════════════════════════════════════════════════════════
export function drawExecutiveClassicPDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education, certifications } = data;
  const skills = getSkills(data);
  const NAVY = "#003A70"; const ORANGE = "#F28C28";
  let pageNum = 1;

  doc.rect(0, 0, PAGE_W, 58).fill(NAVY);
  doc.font("Helvetica-Bold").fontSize(22).fillColor("#ffffff").text(name || "", L, 18);
  const cp = [contact?.location, contact?.email, contact?.phone].filter(Boolean);
  doc.font("Helvetica").fontSize(10).fillColor("#bfdbfe").text(cp.join("  |  "), L, 22, { width: CONTENT_W, align: "right" });

  doc.moveTo(L, 60).lineTo(R, 60).lineWidth(1.5).stroke(ORANGE);
  if (title) {
    doc.font("Helvetica-Bold").fontSize(12).fillColor(NAVY)
      .text(title.toUpperCase(), L, 66, { width: CONTENT_W, align: "center", characterSpacing: 1 });
  }
  doc.moveTo(L, 84).lineTo(R, 84).lineWidth(0.5).stroke("#d1d5db");

  let y = 94;
  if (summary?.trim()) {
    y = sectionRule(doc, "Professional Summary", L, y, CONTENT_W, NAVY);
    doc.font("Helvetica").fontSize(11).fillColor("#374151").text(summary, L, y, { width: CONTENT_W, lineGap: 2 }); y = doc.y + 10;
  }
  if (skills.length) {
    y = sectionRule(doc, "Core Competencies", L, y, CONTENT_W, NAVY);
    y = skillsGrid(doc, skills, L, y, CONTENT_W, ORANGE);
  }
  if (experience?.length) {
    y = sectionRule(doc, "Professional Experience", L, y, CONTENT_W, NAVY);
    experience.forEach((job: any) => {
      y = jobBlock(doc, job, L, y, CONTENT_W, ORANGE, NAVY, "#374151", "#374151");
    });
  }
  if (education?.length) {
    y = checkPageBreak(doc, y, 50);
    y = sectionRule(doc, "Education", L, y, CONTENT_W, NAVY);
    education.forEach((edu: any) => {
      doc.font("Helvetica-Bold").fontSize(11).fillColor(NAVY).text([edu.degree, edu.school].filter(Boolean).join(" — "), L, y, { width: CONTENT_W });
      y = doc.y + 3;
    });
  }
  if ((certifications || []).length) {
    y = checkPageBreak(doc, y, 50);
    y = sectionRule(doc, "Certifications & Licenses", L, y, CONTENT_W, NAVY);
    certifications.forEach((c: string) => {
      doc.circle(L + 5, y + 5, 1.8).fill(ORANGE);
      doc.font("Helvetica").fontSize(11).fillColor("#374151").text(c, L + 13, y, { width: CONTENT_W - 13 });
      y = doc.y + 3;
    });
  }
  drawPageNumber(doc, pageNum);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. EXECUTIVE LUXE (premium)
// Gold #F4E7C6 sidebar, solid on every page
// ═══════════════════════════════════════════════════════════════════════════════
export function drawExecutiveLuxePDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education, certifications } = data;
  const skills = getSkills(data);
  const GOLD_BG = "#F4E7C6";
  const SIDE_W = 170;
  const MAIN_X = SIDE_W + 22;
  const MAIN_W = PAGE_W - MAIN_X - 34;
  let pageNum = 1;

  const drawSidebar7 = () => {
    doc.rect(0, 0, SIDE_W, doc.page.height).fill(GOLD_BG);
    pageNum++;
    drawPageNumber(doc, pageNum - 1);
  };
  drawSidebar7();
  pageNum = 1;

  const onNewPage7 = () => {
    doc.rect(0, 0, SIDE_W, doc.page.height).fill(GOLD_BG);
    pageNum++;
    drawPageNumber(doc, pageNum);
  };

  let sY = 28;
  doc.font("Helvetica-Bold").fontSize(17).fillColor("#111827").text(name || "", 16, sY, { width: SIDE_W - 22 }); sY = doc.y + 3;
  if (title) { doc.font("Helvetica").fontSize(10).fillColor("#374151").text(title, 16, sY, { width: SIDE_W - 22 }); sY = doc.y + 8; }
  [contact?.location, contact?.email, contact?.phone].filter(Boolean).forEach(c => {
    doc.font("Helvetica").fontSize(10).fillColor("#374151").text(c, 16, sY, { width: SIDE_W - 22 }); sY = doc.y + 3;
  }); sY += 10;
  if (skills.length) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#111827").text("SKILLS", 16, sY, { characterSpacing: 0.5 });
    sY = doc.y + 3;
    doc.moveTo(16, sY).lineTo(SIDE_W - 12, sY).lineWidth(0.5).stroke("#374151"); sY += 5;
    skills.forEach(s => {
      doc.circle(22, sY + 5, 1.8).fill("#111827");
      doc.font("Helvetica").fontSize(10).fillColor("#374151").text(s, 30, sY, { width: SIDE_W - 35 }); sY = doc.y + 3;
    }); sY += 8;
  }
  if ((certifications || []).length) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#111827").text("CERTIFICATIONS", 16, sY, { characterSpacing: 0.5 });
    sY = doc.y + 3;
    doc.moveTo(16, sY).lineTo(SIDE_W - 12, sY).lineWidth(0.5).stroke("#374151"); sY += 5;
    certifications.forEach((c: string) => {
      doc.circle(22, sY + 5, 1.8).fill("#111827");
      doc.font("Helvetica").fontSize(10).fillColor("#374151").text(c, 30, sY, { width: SIDE_W - 35 }); sY = doc.y + 3;
    });
  }

  let mY = 28;
  if (summary?.trim()) {
    doc.font("Helvetica-Bold").fontSize(12).fillColor("#111827").text("PROFESSIONAL SUMMARY", MAIN_X, mY, { characterSpacing: 0.5 });
    mY = doc.y + 3;
    doc.moveTo(MAIN_X, mY).lineTo(PAGE_W - 34, mY).lineWidth(0.5).stroke("#9ca3af"); mY += 6;
    doc.font("Helvetica").fontSize(11).fillColor("#374151").text(summary, MAIN_X, mY, { width: MAIN_W, lineGap: 2 }); mY = doc.y + 12;
  }
  if (experience?.length) {
    doc.font("Helvetica-Bold").fontSize(12).fillColor("#111827").text("EXPERIENCE", MAIN_X, mY, { characterSpacing: 0.5 });
    mY = doc.y + 3;
    doc.moveTo(MAIN_X, mY).lineTo(PAGE_W - 34, mY).lineWidth(0.5).stroke("#9ca3af"); mY += 6;
    experience.forEach((job: any) => { mY = jobBlock(doc, job, MAIN_X, mY, MAIN_W, "#111827", "#111827", "#374151", "#6b7280", onNewPage7); });
  }
  if (education?.length) {
    mY = checkPageBreak(doc, mY, 50, MARGIN, onNewPage7);
    doc.font("Helvetica-Bold").fontSize(12).fillColor("#111827").text("EDUCATION", MAIN_X, mY, { characterSpacing: 0.5 });
    mY = doc.y + 3;
    doc.moveTo(MAIN_X, mY).lineTo(PAGE_W - 34, mY).lineWidth(0.5).stroke("#9ca3af"); mY += 6;
    education.forEach((edu: any) => {
      doc.font("Helvetica").fontSize(11).fillColor("#374151").text([edu.degree, edu.school].filter(Boolean).join(" | "), MAIN_X, mY, { width: MAIN_W }); mY = doc.y + 5;
    });
  }

  drawPageNumber(doc, 1);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. MODERN ELITE (premium)
// Grey header bar, two-column body (left: summary+skills, right: exp+edu)
// ═══════════════════════════════════════════════════════════════════════════════
export function drawModernElitePDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education, certifications } = data;
  const skills = getSkills(data);
  const GREY = "#4B5563";
  const LEFT_W = 160;
  const RIGHT_X = L + LEFT_W + 20;
  const RIGHT_W = PAGE_W - RIGHT_X - MARGIN;
  let pageNum = 1;

  doc.rect(0, 0, PAGE_W, 64).fill(GREY);
  doc.font("Helvetica-Bold").fontSize(22).fillColor("#ffffff").text(name || "", L, 16);
  if (title) doc.font("Helvetica").fontSize(12).fillColor("#e5e7eb").text(title, L, 38);
  const cp = [contact?.location, contact?.email, contact?.phone].filter(Boolean);
  doc.font("Helvetica").fontSize(10).fillColor("#d1d5db").text(cp.join("  |  "), L, 20, { width: CONTENT_W, align: "right" });

  let leftY = 78; let rightY = 78;

  if (summary?.trim()) {
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#374151").text("SUMMARY", L, leftY, { characterSpacing: 0.5 });
    leftY = doc.y + 4;
    doc.moveTo(L, leftY).lineTo(L + LEFT_W, leftY).lineWidth(0.5).stroke("#d1d5db"); leftY += 5;
    doc.font("Helvetica").fontSize(11).fillColor("#374151").text(summary, L, leftY, { width: LEFT_W, lineGap: 2 }); leftY = doc.y + 10;
  }
  if (skills.length) {
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#374151").text("SKILLS", L, leftY, { characterSpacing: 0.5 });
    leftY = doc.y + 4;
    doc.moveTo(L, leftY).lineTo(L + LEFT_W, leftY).lineWidth(0.5).stroke("#d1d5db"); leftY += 5;
    skills.forEach(s => {
      doc.circle(L + 5, leftY + 5, 1.8).fill("#6b7280");
      doc.font("Helvetica").fontSize(10).fillColor("#374151").text(s, L + 13, leftY, { width: LEFT_W - 18 }); leftY = doc.y + 3;
    });
  }
  if ((certifications || []).length) {
    leftY += 8;
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#374151").text("CERTIFICATIONS", L, leftY, { characterSpacing: 0.5 });
    leftY = doc.y + 4;
    doc.moveTo(L, leftY).lineTo(L + LEFT_W, leftY).lineWidth(0.5).stroke("#d1d5db"); leftY += 5;
    certifications.forEach((c: string) => {
      doc.circle(L + 5, leftY + 5, 1.8).fill("#6b7280");
      doc.font("Helvetica").fontSize(10).fillColor("#374151").text(c, L + 13, leftY, { width: LEFT_W - 18 }); leftY = doc.y + 3;
    });
  }

  if (experience?.length) {
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#374151").text("EXPERIENCE", RIGHT_X, rightY, { characterSpacing: 0.5 });
    rightY = doc.y + 4;
    doc.moveTo(RIGHT_X, rightY).lineTo(PAGE_W - MARGIN, rightY).lineWidth(0.5).stroke("#d1d5db"); rightY += 5;
    experience.forEach((job: any) => { rightY = jobBlock(doc, job, RIGHT_X, rightY, RIGHT_W); });
  }
  if (education?.length) {
    rightY = checkPageBreak(doc, rightY, 50);
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#374151").text("EDUCATION", RIGHT_X, rightY, { characterSpacing: 0.5 });
    rightY = doc.y + 4;
    doc.moveTo(RIGHT_X, rightY).lineTo(PAGE_W - MARGIN, rightY).lineWidth(0.5).stroke("#d1d5db"); rightY += 5;
    education.forEach((edu: any) => {
      doc.font("Helvetica").fontSize(11).fillColor("#374151").text([edu.degree, edu.school].filter(Boolean).join(" | "), RIGHT_X, rightY, { width: RIGHT_W }); rightY = doc.y + 5;
    });
  }
  drawPageNumber(doc, pageNum);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. MODERN PROFESSIONAL (premium)
// Centered header, grey bottom border, two-col skills
// ═══════════════════════════════════════════════════════════════════════════════
export function drawModernProfessionalPDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education, certifications } = data;
  const skills = getSkills(data);
  const W = CONTENT_W;
  let pageNum = 1;

  const mpSection = (label: string, y: number): number => {
    doc.font("Helvetica-Bold").fontSize(12).fillColor("#374151")
      .text(label, L, y, { width: W, lineBreak: false, characterSpacing: 0.5 });
    const rY = y + 16;
    doc.moveTo(L, rY).lineTo(L + W, rY).lineWidth(0.5).stroke("#d1d5db");
    return rY + 7;
  };

  doc.font("Helvetica-Bold").fontSize(22).fillColor("#111827")
    .text(name || "", L, 26, { width: W, align: "center", lineBreak: false });
  let y = 54;
  if (title) {
    doc.font("Helvetica").fontSize(12).fillColor("#374151")
      .text(title, L, y, { width: W, align: "center", lineBreak: false });
    y += 18;
  }
  const cp = [contact?.location, contact?.email, contact?.phone].filter(Boolean);
  if (cp.length) {
    doc.font("Helvetica").fontSize(10).fillColor("#6b7280")
      .text(cp.join("   |   "), L, y, { width: W, align: "center", lineBreak: false });
    y += 16;
  }
  doc.moveTo(L, y).lineTo(L + W, y).lineWidth(0.75).stroke("#d1d5db");
  y += 12;

  if (summary?.trim()) {
    y = mpSection("PROFESSIONAL SUMMARY", y);
    doc.font("Helvetica").fontSize(11).fillColor("#374151")
      .text(summary, L, y, { width: W, lineGap: 2 });
    y = doc.y + 10;
  }
  if (skills.length) {
    y = mpSection("CORE SKILLS", y);
    const col = W / 2;
    const mid = Math.ceil(skills.length / 2);
    const sy = y;
    skills.slice(0, mid).forEach((s, i) => {
      const ry = sy + i * 15;
      doc.circle(L + 5, ry + 5, 1.8).fill("#374151");
      doc.font("Helvetica").fontSize(11).fillColor("#374151").text(s, L + 13, ry, { width: col - 18, lineBreak: false });
    });
    skills.slice(mid).forEach((s, i) => {
      const ry = sy + i * 15;
      doc.circle(L + col + 5, ry + 5, 1.8).fill("#374151");
      doc.font("Helvetica").fontSize(11).fillColor("#374151").text(s, L + col + 13, ry, { width: col - 18, lineBreak: false });
    });
    y = sy + Math.ceil(skills.length / 2) * 15 + 10;
  }
  if (experience?.length) {
    y = mpSection("EXPERIENCE", y);
    experience.forEach((job: any) => {
      y = jobBlock(doc, job, L, y, W, "#374151", "#111827", "#374151", "#6b7280");
    });
  }
  if (education?.length) {
    if (y + 50 > PAGE_H - MARGIN) { doc.addPage(); pageNum++; y = MARGIN; }
    y = mpSection("EDUCATION", y);
    education.forEach((edu: any) => {
      doc.font("Helvetica").fontSize(11).fillColor("#374151")
        .text([edu.degree, edu.school].filter(Boolean).join(" — "), L, y, { width: W });
      y = doc.y + 5;
    });
  }
  if ((certifications || []).length) {
    if (y + 50 > PAGE_H - MARGIN) { doc.addPage(); pageNum++; y = MARGIN; }
    y = mpSection("CERTIFICATIONS", y);
    certifications.forEach((c: string) => {
      doc.circle(L + 5, y + 5, 1.8).fill("#374151");
      doc.font("Helvetica").fontSize(11).fillColor("#374151").text(c, L + 13, y, { width: W - 13 });
      y = doc.y + 3;
    });
  }
  drawPageNumber(doc, pageNum);
}

// ── Brazil field mapper ───────────────────────────────────────────────────────
export function mapBrDataToUsFormat(brData: any): any {
  const p = brData.personalInfo || {};
  return {
    name: `${p.nome || ""} ${p.sobrenome || ""}`.trim(),
    title: p.tituloProfissional || "",
    contact: {
      phone: p.telefone || p.whatsapp || "",
      email: p.email || "",
      location: `${p.cidade || ""}${p.cidade && p.estado ? ", " : ""}${p.estado || ""}`,
      linkedin: p.linkedin || "",
    },
    summary: brData.resumoProfissional || "",
    skills: (brData.habilidades || []).map((h: any) => h.text || h).filter(Boolean),
    experience: (brData.experiencia || []).map((exp: any) => ({
      jobTitle: exp.cargo || exp.jobTitle || "",
      company: exp.empresa || exp.company || "",
      startDate: exp.dataInicio || exp.startDate || "",
      endDate: exp.dataFim || exp.endDate || "",
      responsibilities: (exp.responsabilidades || exp.responsibilities || []).map((r: any) => r.text || r).filter(Boolean),
      achievements: [],
    })),
    education: (brData.formacao || []).map((f: any) => ({
      school: f.instituicao || f.school || "",
      degree: f.curso || f.degree || "",
    })),
    certifications: (brData.cursosCertificacoes || []).filter((c: any) => c.nome).map((c: any) => c.nome),
  };
}

// ── Template registry ─────────────────────────────────────────────────────────
export const PDF_TEMPLATE_REGISTRY: Record<string, (doc: any, data: any) => void> = {
  "standard-contemporary": drawStandardContemporaryPDF,
  "standard-classic": drawStandardClassicPDF,
  "modern-blue": drawModernBluePDF,
  "basic-two-column": drawBasicTwoColumnPDF,
  "sidebar-green": drawSidebarGreenPDF,
  "executive-classic": drawExecutiveClassicPDF,
  "executive-luxe": drawExecutiveLuxePDF,
  "modern-elite": drawModernElitePDF,
  "modern-professional": drawModernProfessionalPDF,
};
