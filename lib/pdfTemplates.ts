// lib/pdfTemplates.ts
// pdfkit renderers that exactly match each React template.
// Every layout decision derived directly from the React source.

const PAGE_W = 612;
const PAGE_H = 792;
const L = 45;
const R = PAGE_W - 45;
const CONTENT_W = R - L;

// ── Shared helpers ────────────────────────────────────────────────────────────

function getSkills(data: any): string[] {
  return (data.skills || []).map((s: any) => typeof s === "string" ? s : (s.text || "")).filter(Boolean);
}

function getBullets(job: any): string[] {
  return [...(job.responsibilities || []), ...(job.achievements || [])]
    .map((b: any) => typeof b === "string" ? b : (b.text || ""))
    .filter(Boolean);
}

function estimateTextHeight(text: string, width: number, fontSize = 9, lineGap = 1.5): number {
  const charsPerLine = Math.max(1, Math.floor(width / (fontSize * 0.53)));
  const lines = Math.max(1, Math.ceil(text.length / charsPerLine));
  return lines * (fontSize + lineGap) + 2;
}

function checkPageBreak(doc: any, y: number, neededHeight: number, margin = 50, onNewPage?: () => void): number {
  if (y + neededHeight > PAGE_H - margin) {
    doc.addPage();
    if (onNewPage) onNewPage();
    return 40;
  }
  return y;
}

/** Draw bullet and return new Y */
function drawBullet(doc: any, text: string, x: number, y: number, width: number, dotColor = "#374151", onNewPage?: () => void): number {
  const neededH = estimateTextHeight(text, width - 10);
  y = checkPageBreak(doc, y, neededH, 50, onNewPage);
  doc.circle(x + 4, y + 4, 1.5).fill(dotColor);
  doc.font("Helvetica").fontSize(9).fillColor("#374151")
    .text(text, x + 10, y, { width: width - 10, lineGap: 1.5 });
  return doc.y + 2;
}

/** Draw section header with rule, return new Y */
function sectionRule(doc: any, title: string, x: number, y: number, width: number, color = "#1f2937"): number {
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(color)
    .text(title.toUpperCase(), x, y, { width: width - 60, characterSpacing: 0.8 });
  const ruleY = y + 12;
  doc.moveTo(x, ruleY).lineTo(x + width, ruleY).lineWidth(0.5).stroke("#d1d5db");
  return ruleY + 6;
}

/** Draw a job block with overflow handling, return new Y */
function jobBlock(
  doc: any, job: any, x: number, y: number, width: number,
  dotColor = "#374151", titleColor = "#111827", companyColor = "#4b5563", dateColor = "#6b7280",
  onNewPage?: () => void
): number {
  const dates = [job.startDate, job.endDate].filter(Boolean).join(" – ");
  const dateW = 90;
  const bullets = getBullets(job);

  if (y + 26 > PAGE_H - 40) {
    doc.addPage();
    if (onNewPage) onNewPage();
    y = 40;
  }

  doc.font("Helvetica-Bold").fontSize(10).fillColor(titleColor)
    .text(job.jobTitle || "", x, y, { width: width - dateW - 5 });
  const afterTitle = doc.y;

  if (dates) {
    doc.font("Helvetica").fontSize(8.5).fillColor(dateColor)
      .text(dates, x + width - dateW, y, { width: dateW, align: "right" });
  }
  doc.y = afterTitle;
  if (job.company) {
    doc.font("Helvetica").fontSize(9).fillColor(companyColor).text(job.company, x, doc.y + 1, { width });
  }

  let curY = doc.y + 4;
  bullets.forEach(b => {
    const neededH = estimateTextHeight(b, width - 10) + 4;
    if (curY + neededH > PAGE_H - 35) {
      doc.addPage();
      if (onNewPage) onNewPage();
      curY = 40;
    }
    curY = drawBullet(doc, b, x, curY, width, dotColor);
  });
  return curY + 6;
}

/** Two-column skills grid (2 cols), return new Y */
function skillsGrid(doc: any, skills: string[], x: number, y: number, width: number, dotColor = "#374151"): number {
  const col = width / 2;
  const mid = Math.ceil(skills.length / 2);
  const startY = y;
  skills.slice(0, mid).forEach((s, i) => {
    const sy = startY + i * 13;
    doc.circle(x + 4, sy + 4, 1.5).fill(dotColor);
    doc.font("Helvetica").fontSize(9).fillColor("#374151").text(s, x + 10, sy, { width: col - 15 });
  });
  skills.slice(mid).forEach((s, i) => {
    const sy = startY + i * 13;
    doc.circle(x + col + 4, sy + 4, 1.5).fill(dotColor);
    doc.font("Helvetica").fontSize(9).fillColor("#374151").text(s, x + col + 10, sy, { width: col - 15 });
  });
  return startY + Math.ceil(skills.length / 2) * 13 + 8;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. STANDARD CONTEMPORARY
// React: white header, name left + contact right, grey rule, 2-col skills
// ═══════════════════════════════════════════════════════════════════════════════
export function drawStandardContemporaryPDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education, certifications } = data;
  const skills = getSkills(data);

  doc.font("Helvetica-Bold").fontSize(20).fillColor("#111827").text(name || "", L, 28);
  const afterName = doc.y + 2;
  if (title) doc.font("Helvetica").fontSize(10).fillColor("#6b7280").text(title, L, afterName);

  const cp = [contact?.phone, contact?.email, contact?.location].filter(Boolean);
  if (cp.length) doc.font("Helvetica").fontSize(8.5).fillColor("#6b7280")
    .text(cp.join("  |  "), L, 32, { width: CONTENT_W, align: "right" });

  doc.moveTo(L, 60).lineTo(R, 60).lineWidth(0.75).stroke("#d1d5db");
  let y = 70;

  if (summary?.trim()) {
    y = sectionRule(doc, "Professional Summary", L, y, CONTENT_W);
    doc.font("Helvetica").fontSize(9.5).fillColor("#374151").text(summary, L, y, { width: CONTENT_W, lineGap: 2 });
    y = doc.y + 8;
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
    y = checkPageBreak(doc, y, 40);
    y = sectionRule(doc, "Education", L, y, CONTENT_W);
    education.forEach((edu: any) => {
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#111827")
        .text([edu.degree, edu.school].filter(Boolean).join(" — "), L, y, { width: CONTENT_W });
      y = doc.y + 1;
      if (edu.year) { doc.font("Helvetica").fontSize(8.5).fillColor("#6b7280").text(edu.year, L, y); y = doc.y + 4; }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. STANDARD CLASSIC
// React: dark #1a1a1a header bar, name left + contact right
// ═══════════════════════════════════════════════════════════════════════════════
export function drawStandardClassicPDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education } = data;
  const skills = getSkills(data);

  doc.rect(0, 0, doc.page.width, 60).fill("#111827");
  doc.font("Helvetica-Bold").fontSize(20).fillColor("#ffffff").text(name || "", L, 16);
  if (title) doc.font("Helvetica").fontSize(10).fillColor("#d1d5db").text(title, L, 36);
  const cp = [contact?.phone, contact?.email, contact?.location].filter(Boolean);
  doc.font("Helvetica").fontSize(8.5).fillColor("#9ca3af").text(cp.join("  |  "), L, 20, { width: CONTENT_W, align: "right" });

  let y = 72;
  if (summary?.trim()) {
    y = sectionRule(doc, "Professional Summary", L, y, CONTENT_W);
    doc.font("Helvetica").fontSize(9.5).fillColor("#374151").text(summary, L, y, { width: CONTENT_W, lineGap: 2 });
    y = doc.y + 8;
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
    y = checkPageBreak(doc, y, 40);
    y = sectionRule(doc, "Education", L, y, CONTENT_W);
    education.forEach((edu: any) => {
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#111827").text([edu.degree, edu.school].filter(Boolean).join(" — "), L, y, { width: CONTENT_W });
      y = doc.y + 1;
      if (edu.year) { doc.font("Helvetica").fontSize(8.5).fillColor("#6b7280").text(edu.year, L, y); y = doc.y + 4; }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. MODERN BLUE
// React: blue #1d4ed8 header bar, white text, body sections in blue
// ═══════════════════════════════════════════════════════════════════════════════
export function drawModernBluePDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education } = data;
  const skills = getSkills(data);
  const BLUE = "#1d4ed8";

  doc.rect(0, 0, doc.page.width, 78).fill(BLUE);
  doc.font("Helvetica-Bold").fontSize(22).fillColor("#ffffff").text(name || "", L, 16);
  if (title) doc.font("Helvetica").fontSize(11).fillColor("#bfdbfe").text(title, L, 40);
  const cp = [contact?.phone, contact?.email, contact?.location].filter(Boolean);
  doc.font("Helvetica").fontSize(8.5).fillColor("#dbeafe").text(cp.join("  |  "), L, 62, { width: CONTENT_W });

  let y = 90;
  if (summary?.trim()) {
    doc.font("Helvetica-Bold").fontSize(10).fillColor(BLUE).text("SUMMARY", L, y); y = doc.y + 4;
    doc.font("Helvetica").fontSize(9.5).fillColor("#374151").text(summary, L, y, { width: CONTENT_W, lineGap: 2 }); y = doc.y + 8;
  }
  if (skills.length) {
    doc.font("Helvetica-Bold").fontSize(10).fillColor(BLUE).text("SKILLS", L, y); y = doc.y + 4;
    doc.font("Helvetica").fontSize(9).fillColor("#374151").text(skills.join("   •   "), L, y, { width: CONTENT_W }); y = doc.y + 8;
  }
  if (experience?.length) {
    doc.font("Helvetica-Bold").fontSize(10).fillColor(BLUE).text("EXPERIENCE", L, y);
    doc.moveTo(L, doc.y + 4).lineTo(R, doc.y + 4).lineWidth(0.5).stroke(BLUE); y = doc.y + 8;
    experience.forEach((job: any) => { y = jobBlock(doc, job, L, y, CONTENT_W); });
  }
  if (education?.length) {
    y = checkPageBreak(doc, y, 40);
    doc.font("Helvetica-Bold").fontSize(10).fillColor(BLUE).text("EDUCATION", L, y);
    doc.moveTo(L, doc.y + 4).lineTo(R, doc.y + 4).lineWidth(0.5).stroke(BLUE); y = doc.y + 8;
    education.forEach((edu: any) => {
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#111827").text([edu.degree, edu.school].filter(Boolean).join(" — "), L, y, { width: CONTENT_W });
      y = doc.y + 1;
      if (edu.year) { doc.font("Helvetica").fontSize(8.5).fillColor("#6b7280").text(edu.year, L, y); y = doc.y + 4; }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. BASIC TWO COLUMN
// React: grey sidebar 30%, white main 70%, sidebar: name+contact+skills+certs
// ═══════════════════════════════════════════════════════════════════════════════
export function drawBasicTwoColumnPDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education, certifications } = data;
  const skills = getSkills(data);
  const SIDE_W = 160; const MAIN_X = SIDE_W + 20; const MAIN_W = PAGE_W - MAIN_X - 30;

  const drawSidebar4 = () => {
    doc.rect(0, 0, SIDE_W, doc.page.height).fillColor("#f3f4f6").fill();
    doc.fillColor("#000000"); // reset fill to black for text
  };
  drawSidebar4();

  let sY = 24;
  doc.font("Helvetica-Bold").fontSize(15).fillColor("#111827").text(name || "", 15, sY, { width: SIDE_W - 20 }); sY = doc.y + 2;
  if (title) { doc.font("Helvetica").fontSize(9).fillColor("#6b7280").text(title, 15, sY, { width: SIDE_W - 20 }); sY = doc.y + 8; }
  doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#6b7280").text("CONTACT", 15, sY, { characterSpacing: 0.5 }); sY = doc.y + 3;
  [contact?.phone, contact?.email, contact?.location].filter(Boolean).forEach(c => {
    doc.font("Helvetica").fontSize(8.5).fillColor("#374151").text(c, 15, sY, { width: SIDE_W - 20 }); sY = doc.y + 2;
  });
  sY += 6;
  if (skills.length) {
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#6b7280").text("SKILLS", 15, sY, { characterSpacing: 0.5 }); sY = doc.y + 3;
    skills.forEach(s => {
      doc.circle(22, sY + 4, 1.5).fill("#6b7280");
      doc.font("Helvetica").fontSize(8.5).fillColor("#374151").text(s, 28, sY, { width: SIDE_W - 33 }); sY = doc.y + 2;
    }); sY += 6;
  }
  if ((certifications || []).length) {
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#6b7280").text("CERTIFICATIONS", 15, sY, { characterSpacing: 0.5 }); sY = doc.y + 3;
    certifications.forEach((c: string) => {
      doc.circle(22, sY + 4, 1.5).fill("#6b7280");
      doc.font("Helvetica").fontSize(8.5).fillColor("#374151").text(c, 28, sY, { width: SIDE_W - 33 }); sY = doc.y + 2;
    });
  }
  if (education?.length) {
    sY += 6;
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#6b7280").text("EDUCATION", 15, sY, { characterSpacing: 0.5 }); sY = doc.y + 3;
    education.forEach((edu: any) => {
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#374151").text(edu.degree || "", 15, sY, { width: SIDE_W - 20 }); sY = doc.y + 1;
      doc.font("Helvetica").fontSize(8).fillColor("#6b7280").text([edu.school, edu.year].filter(Boolean).join(" · "), 15, sY, { width: SIDE_W - 20 }); sY = doc.y + 5;
    });
  }

  let mY = 24;
  if (summary?.trim()) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#374151").text("PROFESSIONAL SUMMARY", MAIN_X, mY, { characterSpacing: 0.4 }); mY = doc.y + 3;
    doc.moveTo(MAIN_X, mY).lineTo(PAGE_W - 30, mY).lineWidth(0.5).stroke("#d1d5db"); mY += 5;
    doc.font("Helvetica").fontSize(9.5).fillColor("#374151").text(summary, MAIN_X, mY, { width: MAIN_W, lineGap: 2 }); mY = doc.y + 10;
  }
  if (experience?.length) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#374151").text("EXPERIENCE", MAIN_X, mY, { characterSpacing: 0.4 }); mY = doc.y + 3;
    doc.moveTo(MAIN_X, mY).lineTo(PAGE_W - 30, mY).lineWidth(0.5).stroke("#d1d5db"); mY += 5;
    experience.forEach((job: any) => { mY = jobBlock(doc, job, MAIN_X, mY, MAIN_W, "#374151", "#111827", "#4b5563", "#6b7280", drawSidebar4); });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. SIDEBAR GREEN
// React: green #f0fdf4 sidebar, green section headers + rules in sidebar
// ═══════════════════════════════════════════════════════════════════════════════
export function drawSidebarGreenPDF(doc: any, data: any) {
  // Exact match to SidebarGreen.tsx React component
  const { name, title, contact, summary, experience, education, certifications } = data;
  const skills = getSkills(data);
  const GREEN_SECTION = "#1f2937"; // text-gray-800 for section headers
  const GREEN_BG = "#E6F4EA";     // exact hex from React component style={{ backgroundColor: "#E6F4EA" }}
  const SIDE_W = 180;              // ~32% of 612pt letter width
  const MAIN_X = SIDE_W + 15;
  const MAIN_W = PAGE_W - MAIN_X - 35;

  // Draw sidebar background — called on page 1 and every new page
  const drawSidebar5 = () => {
    doc.rect(0, 0, SIDE_W, doc.page.height).fillColor(GREEN_BG).fill();
    doc.fillColor("#1f2937"); // reset to dark for text
  };
  drawSidebar5();

  // SIDEBAR CONTENT — Name (black bold), title, contact, skills, certifications
  // React: h1 inherits text-gray-900 (#111827) from aside — NOT green
  let sY = 20;
  doc.font("Helvetica-Bold").fontSize(16).fillColor("#111827")
    .text(name || "", 15, sY, { width: SIDE_W - 20 }); sY = doc.y + 3;
  if (title) {
    doc.font("Helvetica").fontSize(9.5).fillColor("#374151")
      .text(title, 15, sY, { width: SIDE_W - 20 }); sY = doc.y + 6;
  }
  // Contact
  [contact?.location, contact?.email, contact?.phone].filter(Boolean).forEach(c => {
    doc.font("Helvetica").fontSize(8.5).fillColor("#374151").text(c, 15, sY, { width: SIDE_W - 20 }); sY = doc.y + 2;
  }); sY += 8;

  // Skills — React: SidebarHeader = text-gray-800 + border-gray-400
  if (skills.length) {
    doc.font("Helvetica-Bold").fontSize(8).fillColor(GREEN_SECTION)
      .text("SKILLS", 15, sY, { characterSpacing: 0.5 }); sY = doc.y + 2;
    doc.moveTo(15, sY).lineTo(SIDE_W - 10, sY).lineWidth(0.5).stroke("#9ca3af"); sY += 4;
    skills.forEach(s => {
      doc.circle(21, sY + 4, 1.5).fill("#1f2937");
      doc.font("Helvetica").fontSize(8.5).fillColor("#1f2937")
        .text(s, 27, sY, { width: SIDE_W - 32 }); sY = doc.y + 2;
    }); sY += 6;
  }

  // Certifications — React: in sidebar below skills
  if ((certifications || []).length) {
    doc.font("Helvetica-Bold").fontSize(8).fillColor(GREEN_SECTION)
      .text("CERTIFICATIONS", 15, sY, { characterSpacing: 0.5 }); sY = doc.y + 2;
    doc.moveTo(15, sY).lineTo(SIDE_W - 10, sY).lineWidth(0.5).stroke("#9ca3af"); sY += 4;
    certifications.forEach((c: string) => {
      doc.circle(21, sY + 4, 1.5).fill("#1f2937");
      doc.font("Helvetica").fontSize(8.5).fillColor("#1f2937")
        .text(c, 27, sY, { width: SIDE_W - 32 }); sY = doc.y + 2;
    });
  }

  // MAIN CONTENT — Summary, Experience, Education (React: all in main, NOT sidebar)
  let mY = 20;

  if (summary?.trim()) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(GREEN_SECTION)
      .text("PROFESSIONAL SUMMARY", MAIN_X, mY, { characterSpacing: 0.5 }); mY = doc.y + 2;
    doc.moveTo(MAIN_X, mY).lineTo(PAGE_W - 30, mY).lineWidth(0.5).stroke("#d1d5db"); mY += 5;
    doc.font("Helvetica").fontSize(9.5).fillColor("#374151")
      .text(summary, MAIN_X, mY, { width: MAIN_W, lineGap: 2 }); mY = doc.y + 10;
  }

  if (experience?.length) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(GREEN_SECTION)
      .text("EXPERIENCE", MAIN_X, mY, { characterSpacing: 0.5 }); mY = doc.y + 2;
    doc.moveTo(MAIN_X, mY).lineTo(PAGE_W - 30, mY).lineWidth(0.5).stroke("#d1d5db"); mY += 5;
    experience.forEach((job: any) => {
      mY = jobBlock(doc, job, MAIN_X, mY, MAIN_W, "#374151", "#111827", "#4b5563", "#6b7280", drawSidebar5);
    });
  }

  // Education in MAIN — matches React template (not sidebar)
  if (education?.length) {
    mY = checkPageBreak(doc, mY, 40, 40, drawSidebar5);
    doc.font("Helvetica-Bold").fontSize(9).fillColor(GREEN_SECTION)
      .text("EDUCATION", MAIN_X, mY, { characterSpacing: 0.5 }); mY = doc.y + 2;
    doc.moveTo(MAIN_X, mY).lineTo(PAGE_W - 30, mY).lineWidth(0.5).stroke("#d1d5db"); mY += 5;
    education.forEach((edu: any) => {
      const parts = [edu.degree, edu.school, edu.year].filter(Boolean);
      doc.font("Helvetica").fontSize(9).fillColor("#374151")
        .text(parts.join(" | "), MAIN_X, mY, { width: MAIN_W }); mY = doc.y + 4;
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. EXECUTIVE CLASSIC (premium)
// React: #003A70 navy bar, orange #F28C28 accent rule + title centered, 2-col skills
// ═══════════════════════════════════════════════════════════════════════════════
export function drawExecutiveClassicPDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education, certifications } = data;
  const skills = getSkills(data);
  const NAVY = "#003A70"; const ORANGE = "#F28C28";

  // Navy bar
  doc.rect(0, 0, doc.page.width, 52).fill(NAVY);
  doc.font("Helvetica-Bold").fontSize(20).fillColor("#ffffff").text(name || "", L, 16);
  const cp = [contact?.location, contact?.email, contact?.phone].filter(Boolean);
  doc.font("Helvetica").fontSize(8.5).fillColor("#bfdbfe").text(cp.join("  |  "), L, 20, { width: CONTENT_W, align: "right" });

  // Orange rule + centered title
  doc.moveTo(L, 54).lineTo(R, 54).lineWidth(1.5).stroke(ORANGE);
  if (title) {
    doc.font("Helvetica-Bold").fontSize(11).fillColor(NAVY)
      .text(title.toUpperCase(), L, 60, { width: CONTENT_W, align: "center", characterSpacing: 1 });
  }
  doc.moveTo(L, 76).lineTo(R, 76).lineWidth(0.5).stroke("#d1d5db");

  let y = 86;
  if (summary?.trim()) {
    y = sectionRule(doc, "Professional Summary", L, y, CONTENT_W, NAVY);
    doc.font("Helvetica").fontSize(9.5).fillColor("#374151").text(summary, L, y, { width: CONTENT_W, lineGap: 2 }); y = doc.y + 8;
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
    y = checkPageBreak(doc, y, 40);
    y = sectionRule(doc, "Education", L, y, CONTENT_W, NAVY);
    education.forEach((edu: any) => {
      doc.font("Helvetica-Bold").fontSize(9).fillColor(NAVY).text([edu.degree, edu.school].filter(Boolean).join(" — "), L, y, { width: CONTENT_W });
      y = doc.y + 1;
      if (edu.year) { doc.font("Helvetica").fontSize(8.5).fillColor("#6b7280").text(edu.year, L, y); y = doc.y + 4; }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. EXECUTIVE LUXE (premium)
// React: gold #F4E7C6 sidebar 30%, serif font, skills in sidebar, experience main
// ═══════════════════════════════════════════════════════════════════════════════
export function drawExecutiveLuxePDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education, certifications } = data;
  const skills = getSkills(data);
  const GOLD_BG = "#F4E7C6";
  const SIDE_W = 165; const MAIN_X = SIDE_W + 20; const MAIN_W = PAGE_W - MAIN_X - 30;

  const drawSidebar7 = () => {
    doc.rect(0, 0, SIDE_W, doc.page.height).fillColor(GOLD_BG).fill();
    doc.fillColor("#000000");
  };
  drawSidebar7();

  let sY = 24;
  doc.font("Helvetica-Bold").fontSize(16).fillColor("#111827").text(name || "", 15, sY, { width: SIDE_W - 20 }); sY = doc.y + 2;
  if (title) { doc.font("Helvetica").fontSize(9).fillColor("#374151").text(title, 15, sY, { width: SIDE_W - 20 }); sY = doc.y + 6; }
  [contact?.location, contact?.email, contact?.phone].filter(Boolean).forEach(c => {
    doc.font("Helvetica").fontSize(8.5).fillColor("#374151").text(c, 15, sY, { width: SIDE_W - 20 }); sY = doc.y + 2;
  }); sY += 8;
  if (skills.length) {
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#111827").text("SKILLS", 15, sY, { characterSpacing: 0.5 });
    sY = doc.y + 2;
    doc.moveTo(15, sY).lineTo(SIDE_W - 10, sY).lineWidth(0.5).stroke("#374151"); sY += 4;
    skills.forEach(s => {
      doc.circle(22, sY + 4, 1.5).fill("#111827");
      doc.font("Helvetica").fontSize(8.5).fillColor("#374151").text(s, 28, sY, { width: SIDE_W - 33 }); sY = doc.y + 2;
    }); sY += 6;
  }
  if ((certifications || []).length && sY < PAGE_H - 100) {
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#111827").text("CERTIFICATIONS", 15, sY, { characterSpacing: 0.5 });
    sY = doc.y + 2;
    doc.moveTo(15, sY).lineTo(SIDE_W - 10, sY).lineWidth(0.5).stroke("#374151"); sY += 4;
    certifications.forEach((c: string) => {
      doc.circle(22, sY + 4, 1.5).fill("#111827");
      doc.font("Helvetica").fontSize(8.5).fillColor("#374151").text(c, 28, sY, { width: SIDE_W - 33 }); sY = doc.y + 2;
    });
  }

  let mY = 24;
  if (summary?.trim()) {
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#111827").text("PROFESSIONAL SUMMARY", MAIN_X, mY, { characterSpacing: 0.5 });
    mY = doc.y + 2;
    doc.moveTo(MAIN_X, mY).lineTo(PAGE_W - 30, mY).lineWidth(0.5).stroke("#9ca3af"); mY += 5;
    doc.font("Helvetica").fontSize(9.5).fillColor("#374151").text(summary, MAIN_X, mY, { width: MAIN_W, lineGap: 2 }); mY = doc.y + 10;
  }
  if (experience?.length) {
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#111827").text("EXPERIENCE", MAIN_X, mY, { characterSpacing: 0.5 });
    mY = doc.y + 2;
    doc.moveTo(MAIN_X, mY).lineTo(PAGE_W - 30, mY).lineWidth(0.5).stroke("#9ca3af"); mY += 5;
    experience.forEach((job: any) => { mY = jobBlock(doc, job, MAIN_X, mY, MAIN_W, "#111827", "#111827", "#374151", "#6b7280", drawSidebar7); });
  }
  if (education?.length) {
    mY = checkPageBreak(doc, mY, 40);
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#111827").text("EDUCATION", MAIN_X, mY, { characterSpacing: 0.5 });
    mY = doc.y + 2;
    doc.moveTo(MAIN_X, mY).lineTo(PAGE_W - 30, mY).lineWidth(0.5).stroke("#9ca3af"); mY += 5;
    education.forEach((edu: any) => {
      const parts = [edu.degree, edu.school, edu.year].filter(Boolean);
      doc.font("Helvetica").fontSize(9).fillColor("#374151").text(parts.join(" | "), MAIN_X, mY, { width: MAIN_W }); mY = doc.y + 4;
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. MODERN ELITE (premium)
// React: grey #4B5563 header bar, THREE-COLUMN BODY (1/3 left: summary+skills, 2/3 right: exp+edu)
// ═══════════════════════════════════════════════════════════════════════════════
export function drawModernElitePDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education, certifications } = data;
  const skills = getSkills(data);
  const GREY = "#4B5563";
  const LEFT_W = 155; const RIGHT_X = LEFT_W + 20; const RIGHT_W = PAGE_W - RIGHT_X - 30;

  // Grey header bar (page 1 only — Modern Elite has no sidebar background)
  doc.rect(0, 0, doc.page.width, 58).fill(GREY);
  doc.font("Helvetica-Bold").fontSize(20).fillColor("#ffffff").text(name || "", L, 14);
  if (title) doc.font("Helvetica").fontSize(11).fillColor("#e5e7eb").text(title, L, 34);
  const cp = [contact?.location, contact?.email, contact?.phone].filter(Boolean);
  doc.font("Helvetica").fontSize(8.5).fillColor("#d1d5db").text(cp.join("  |  "), L, 18, { width: CONTENT_W, align: "right" });

  // Two-column body: LEFT = summary + skills, RIGHT = experience + education
  let leftY = 72; let rightY = 72;

  // LEFT COLUMN
  if (summary?.trim()) {
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#374151").text("SUMMARY", L, leftY, { characterSpacing: 0.5 });
    leftY = doc.y + 3;
    doc.moveTo(L, leftY).lineTo(L + LEFT_W, leftY).lineWidth(0.5).stroke("#d1d5db"); leftY += 4;
    doc.font("Helvetica").fontSize(9).fillColor("#374151").text(summary, L, leftY, { width: LEFT_W, lineGap: 2 }); leftY = doc.y + 8;
  }
  if (skills.length) {
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#374151").text("SKILLS", L, leftY, { characterSpacing: 0.5 });
    leftY = doc.y + 3;
    doc.moveTo(L, leftY).lineTo(L + LEFT_W, leftY).lineWidth(0.5).stroke("#d1d5db"); leftY += 4;
    skills.forEach(s => {
      doc.circle(L + 4, leftY + 4, 1.5).fill("#6b7280");
      doc.font("Helvetica").fontSize(8.5).fillColor("#374151").text(s, L + 10, leftY, { width: LEFT_W - 15 }); leftY = doc.y + 2;
    });
  }
  if ((certifications || []).length) {
    leftY += 6;
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#374151").text("CERTIFICATIONS", L, leftY, { characterSpacing: 0.5 });
    leftY = doc.y + 3;
    doc.moveTo(L, leftY).lineTo(L + LEFT_W, leftY).lineWidth(0.5).stroke("#d1d5db"); leftY += 4;
    certifications.forEach((c: string) => {
      doc.circle(L + 4, leftY + 4, 1.5).fill("#6b7280");
      doc.font("Helvetica").fontSize(8.5).fillColor("#374151").text(c, L + 10, leftY, { width: LEFT_W - 15 }); leftY = doc.y + 2;
    });
  }

  // RIGHT COLUMN
  if (experience?.length) {
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#374151").text("EXPERIENCE", RIGHT_X, rightY, { characterSpacing: 0.5 });
    rightY = doc.y + 3;
    doc.moveTo(RIGHT_X, rightY).lineTo(PAGE_W - 30, rightY).lineWidth(0.5).stroke("#d1d5db"); rightY += 4;
    experience.forEach((job: any) => { rightY = jobBlock(doc, job, RIGHT_X, rightY, RIGHT_W); });
  }
  if (education?.length) {
    rightY = checkPageBreak(doc, rightY, 40);
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#374151").text("EDUCATION", RIGHT_X, rightY, { characterSpacing: 0.5 });
    rightY = doc.y + 3;
    doc.moveTo(RIGHT_X, rightY).lineTo(PAGE_W - 30, rightY).lineWidth(0.5).stroke("#d1d5db"); rightY += 4;
    education.forEach((edu: any) => {
      doc.font("Helvetica").fontSize(9).fillColor("#374151").text([edu.degree, edu.school, edu.year].filter(Boolean).join(" | "), RIGHT_X, rightY, { width: RIGHT_W }); rightY = doc.y + 4;
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. MODERN PROFESSIONAL (premium)
// React: CENTERED header (text-center), grey bottom border, "Professional Summary"/"Core Skills"
// ═══════════════════════════════════════════════════════════════════════════════
export function drawModernProfessionalPDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education, certifications } = data;
  const skills = getSkills(data);

  // Centered header block
  doc.font("Helvetica-Bold").fontSize(20).fillColor("#111827")
    .text(name || "", L, 24, { width: CONTENT_W, align: "center" });
  const afterName = doc.y + 2;
  if (title) {
    doc.font("Helvetica").fontSize(11).fillColor("#374151")
      .text(title, L, afterName, { width: CONTENT_W, align: "center" });
  }
  const cp = [contact?.location, contact?.email, contact?.phone].filter(Boolean);
  doc.font("Helvetica").fontSize(9).fillColor("#6b7280")
    .text(cp.join("   "), L, doc.y + 3, { width: CONTENT_W, align: "center" });

  // Bottom border under header
  const headerBottom = doc.y + 8;
  doc.moveTo(L, headerBottom).lineTo(R, headerBottom).lineWidth(0.75).stroke("#d1d5db");
  let y = headerBottom + 10;

  if (summary?.trim()) {
    y = sectionRule(doc, "Professional Summary", L, y, CONTENT_W, "#374151");
    doc.font("Helvetica").fontSize(9.5).fillColor("#374151").text(summary, L, y, { width: CONTENT_W, lineGap: 2 }); y = doc.y + 8;
  }
  if (skills.length) {
    y = sectionRule(doc, "Core Skills", L, y, CONTENT_W, "#374151");
    y = skillsGrid(doc, skills, L, y, CONTENT_W, "#374151");
  }
  if (experience?.length) {
    y = sectionRule(doc, "Experience", L, y, CONTENT_W, "#374151");
    experience.forEach((job: any) => { y = jobBlock(doc, job, L, y, CONTENT_W, "#374151", "#111827", "#374151", "#6b7280"); });
  }
  if (education?.length) {
    y = checkPageBreak(doc, y, 40);
    y = sectionRule(doc, "Education", L, y, CONTENT_W, "#374151");
    education.forEach((edu: any) => {
      const parts = [edu.degree, edu.school, edu.year].filter(Boolean);
      doc.font("Helvetica").fontSize(9).fillColor("#374151").text(parts.join(" | "), L, y, { width: CONTENT_W }); y = doc.y + 4;
    });
  }
  if ((certifications || []).length) {
    y = checkPageBreak(doc, y, 40);
    y = sectionRule(doc, "Certifications", L, y, CONTENT_W, "#374151");
    certifications.forEach((c: string) => {
      doc.circle(L + 4, y + 4, 1.5).fill("#374151");
      doc.font("Helvetica").fontSize(9).fillColor("#374151").text(c, L + 10, y, { width: CONTENT_W - 10 }); y = doc.y + 2;
    });
  }
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
      year: f.anoConclusao || f.year || "",
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
