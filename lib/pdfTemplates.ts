// lib/pdfTemplates.ts
// Professional vector PDF renderers using pdfkit.
// All layout uses explicit Y coordinates — no cursor bleeding between columns.

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

/** Draw a section header with horizontal rule, returns new Y */
function sectionHead(doc: any, title: string, x: number, y: number, width: number, color = "#1f2937"): number {
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(color)
    .text(title.toUpperCase(), x, y, { width, characterSpacing: 0.7 });
  const lineY = y + 13;
  doc.moveTo(x, lineY).lineTo(x + width, lineY).lineWidth(0.5).stroke(color);
  return lineY + 6;
}

/** Estimate how many lines a text will take at given width and font size */
function estimateLines(text: string, width: number, fontSize = 9): number {
  // Approximate: Helvetica at 9pt is ~5.5px per char, width in points
  const charsPerLine = Math.floor(width / (fontSize * 0.55));
  return Math.max(1, Math.ceil(text.length / charsPerLine));
}

/** Estimate height a bullet will take */
function estimateBulletHeight(text: string, width: number): number {
  const lines = estimateLines(text, width - 10, 9);
  return lines * 13 + 4; // 13pt per line + gap
}

/** Draw bullet, returns new Y */
function bullet(doc: any, text: string, x: number, y: number, width: number, dotColor = "#374151"): number {
  doc.circle(x + 4, y + 4, 1.5).fill(dotColor);
  doc.font("Helvetica").fontSize(9).fillColor("#374151")
    .text(text, x + 10, y, { width: width - 10, lineGap: 1.5 });
  return doc.y + 2;
}

/** Draw a job block with proper page overflow handling, returns new Y */
function jobBlock(doc: any, job: any, x: number, y: number, width: number, dotColor = "#374151"): number {
  const dates = [job.startDate, job.endDate].filter(Boolean).join(" – ");
  const dateW = 90;
  const BOTTOM_MARGIN = PAGE_H - 50;

  // Page break if the job header won't fit
  if (y > BOTTOM_MARGIN - 40) {
    doc.addPage();
    y = 40;
  }

  doc.font("Helvetica-Bold").fontSize(10).fillColor("#111827")
    .text(job.jobTitle || "", x, y, { width: width - dateW - 5 });
  const titleBottom = doc.y;

  if (dates) {
    doc.font("Helvetica").fontSize(8.5).fillColor("#6b7280")
      .text(dates, x + width - dateW, y, { width: dateW, align: "right" });
  }

  doc.y = titleBottom;
  if (job.company) {
    doc.font("Helvetica").fontSize(9).fillColor("#4b5563")
      .text(job.company, x, doc.y + 1, { width });
  }

  let curY = doc.y + 4;
  const bullets = getBullets(job);

  bullets.forEach(b => {
    const estimatedH = estimateBulletHeight(b, width);

    // If this bullet won't fit on the current page, start a new page
    if (curY + estimatedH > BOTTOM_MARGIN) {
      doc.addPage();
      curY = 40;
    }

    curY = bullet(doc, b, x, curY, width, dotColor);
  });

  return curY + 6;
}

// ── 1. Standard Contemporary ──────────────────────────────────────────────────

export function drawStandardContemporaryPDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education, certifications } = data;
  const skills = getSkills(data);

  // Header
  doc.font("Helvetica-Bold").fontSize(20).fillColor("#111827").text(name || "", L, 30);
  const titleY = doc.y + 2;
  if (title) doc.font("Helvetica").fontSize(10).fillColor("#6b7280").text(title, L, titleY);

  const cp = [contact?.phone, contact?.email, contact?.location, contact?.linkedin].filter(Boolean);
  doc.font("Helvetica").fontSize(8.5).fillColor("#6b7280")
    .text(cp.join("  |  "), L, 34, { width: CONTENT_W, align: "right" });

  doc.moveTo(L, 60).lineTo(R, 60).lineWidth(0.75).stroke("#d1d5db");

  let y = 70;

  if (summary?.trim()) {
    y = sectionHead(doc, "Professional Summary", L, y, CONTENT_W);
    doc.font("Helvetica").fontSize(9.5).fillColor("#374151")
      .text(summary, L, y, { width: CONTENT_W, lineGap: 2 });
    y = doc.y + 8;
  }

  if (skills.length > 0) {
    y = sectionHead(doc, "Core Skills", L, y, CONTENT_W);
    const col = CONTENT_W / 2;
    const mid = Math.ceil(skills.length / 2);
    const skillStartY = y;
    skills.slice(0, mid).forEach((s, i) => {
      const sy = skillStartY + i * 13;
      doc.circle(L + 4, sy + 4, 1.5).fill("#374151");
      doc.font("Helvetica").fontSize(9).fillColor("#374151").text(s, L + 10, sy, { width: col - 15 });
    });
    skills.slice(mid).forEach((s, i) => {
      const sy = skillStartY + i * 13;
      doc.circle(L + col + 4, sy + 4, 1.5).fill("#374151");
      doc.font("Helvetica").fontSize(9).fillColor("#374151").text(s, L + col + 10, sy, { width: col - 15 });
    });
    y = skillStartY + Math.ceil(skills.length / 2) * 13 + 10;
  }

  if (experience?.length > 0) {
    y = sectionHead(doc, "Experience", L, y, CONTENT_W);
    experience.forEach((job: any) => {
      if (y > PAGE_H - 80) { doc.addPage(); y = 40; }
      y = jobBlock(doc, job, L, y, CONTENT_W);
    });
  }

  if (education?.length > 0) {
    if (y > PAGE_H - 80) { doc.addPage(); y = 40; }
    y = sectionHead(doc, "Education", L, y, CONTENT_W);
    education.forEach((edu: any) => {
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#111827")
        .text([edu.degree, edu.school].filter(Boolean).join(" — "), L, y, { width: CONTENT_W });
      y = doc.y + 1;
      if (edu.year) {
        doc.font("Helvetica").fontSize(8.5).fillColor("#6b7280").text(edu.year, L, y);
        y = doc.y + 4;
      }
    });
  }
}

// ── 2. Standard Classic (dark header) ────────────────────────────────────────

export function drawStandardClassicPDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education } = data;
  const skills = getSkills(data);

  doc.rect(0, 0, PAGE_W, 60).fill("#111827");
  doc.font("Helvetica-Bold").fontSize(20).fillColor("#ffffff").text(name || "", L, 16);
  if (title) doc.font("Helvetica").fontSize(10).fillColor("#d1d5db").text(title, L, 36);

  const cp = [contact?.phone, contact?.email, contact?.location].filter(Boolean);
  doc.font("Helvetica").fontSize(8.5).fillColor("#9ca3af")
    .text(cp.join("  |  "), L, 20, { width: CONTENT_W, align: "right" });

  let y = 72;

  if (summary?.trim()) {
    y = sectionHead(doc, "Professional Summary", L, y, CONTENT_W);
    doc.font("Helvetica").fontSize(9.5).fillColor("#374151").text(summary, L, y, { width: CONTENT_W, lineGap: 2 });
    y = doc.y + 8;
  }

  if (skills.length > 0) {
    y = sectionHead(doc, "Core Skills", L, y, CONTENT_W);
    const col = CONTENT_W / 2;
    const mid = Math.ceil(skills.length / 2);
    const skillStartY = y;
    skills.slice(0, mid).forEach((s, i) => {
      const sy = skillStartY + i * 13;
      doc.circle(L + 4, sy + 4, 1.5).fill("#374151");
      doc.font("Helvetica").fontSize(9).fillColor("#374151").text(s, L + 10, sy, { width: col - 15 });
    });
    skills.slice(mid).forEach((s, i) => {
      const sy = skillStartY + i * 13;
      doc.circle(L + col + 4, sy + 4, 1.5).fill("#374151");
      doc.font("Helvetica").fontSize(9).fillColor("#374151").text(s, L + col + 10, sy, { width: col - 15 });
    });
    y = skillStartY + Math.ceil(skills.length / 2) * 13 + 10;
  }

  if (experience?.length > 0) {
    y = sectionHead(doc, "Experience", L, y, CONTENT_W);
    experience.forEach((job: any) => {
      if (y > PAGE_H - 80) { doc.addPage(); y = 40; }
      y = jobBlock(doc, job, L, y, CONTENT_W);
    });
  }

  if (education?.length > 0) {
    if (y > PAGE_H - 80) { doc.addPage(); y = 40; }
    y = sectionHead(doc, "Education", L, y, CONTENT_W);
    education.forEach((edu: any) => {
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#111827")
        .text([edu.degree, edu.school].filter(Boolean).join(" — "), L, y, { width: CONTENT_W });
      y = doc.y + 1;
      if (edu.year) { doc.font("Helvetica").fontSize(8.5).fillColor("#6b7280").text(edu.year, L, y); y = doc.y + 4; }
    });
  }
}

// ── 3. Modern Blue ────────────────────────────────────────────────────────────

export function drawModernBluePDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education } = data;
  const skills = getSkills(data);
  const BLUE = "#1d4ed8";

  doc.rect(0, 0, PAGE_W, 78).fill(BLUE);
  doc.font("Helvetica-Bold").fontSize(22).fillColor("#ffffff").text(name || "", L, 16);
  if (title) doc.font("Helvetica").fontSize(11).fillColor("#bfdbfe").text(title, L, 40);
  const cp = [contact?.phone, contact?.email, contact?.location].filter(Boolean);
  doc.font("Helvetica").fontSize(8.5).fillColor("#dbeafe").text(cp.join("  |  "), L, 62, { width: CONTENT_W });

  let y = 90;

  if (summary?.trim()) {
    doc.font("Helvetica-Bold").fontSize(10).fillColor(BLUE).text("SUMMARY", L, y);
    y = doc.y + 4;
    doc.font("Helvetica").fontSize(9.5).fillColor("#374151").text(summary, L, y, { width: CONTENT_W, lineGap: 2 });
    y = doc.y + 8;
  }

  if (skills.length > 0) {
    doc.font("Helvetica-Bold").fontSize(10).fillColor(BLUE).text("SKILLS", L, y);
    y = doc.y + 4;
    doc.font("Helvetica").fontSize(9).fillColor("#374151").text(skills.join("   •   "), L, y, { width: CONTENT_W });
    y = doc.y + 8;
  }

  if (experience?.length > 0) {
    doc.font("Helvetica-Bold").fontSize(10).fillColor(BLUE).text("EXPERIENCE", L, y);
    doc.moveTo(L, doc.y + 4).lineTo(R, doc.y + 4).lineWidth(0.5).stroke(BLUE);
    y = doc.y + 8;
    experience.forEach((job: any) => {
      if (y > PAGE_H - 80) { doc.addPage(); y = 40; }
      y = jobBlock(doc, job, L, y, CONTENT_W);
    });
  }

  if (education?.length > 0) {
    if (y > PAGE_H - 80) { doc.addPage(); y = 40; }
    doc.font("Helvetica-Bold").fontSize(10).fillColor(BLUE).text("EDUCATION", L, y);
    doc.moveTo(L, doc.y + 4).lineTo(R, doc.y + 4).lineWidth(0.5).stroke(BLUE);
    y = doc.y + 8;
    education.forEach((edu: any) => {
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#111827")
        .text([edu.degree, edu.school].filter(Boolean).join(" — "), L, y, { width: CONTENT_W });
      y = doc.y + 1;
      if (edu.year) { doc.font("Helvetica").fontSize(8.5).fillColor("#6b7280").text(edu.year, L, y); y = doc.y + 4; }
    });
  }
}

// ── 4. Basic Two Column ─────────────────────────────────────────────────────

export function drawBasicTwoColumnPDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education } = data;
  const skills = getSkills(data);
  const SIDE_W = 160;
  const MAIN_X = SIDE_W + 20;
  const MAIN_W = PAGE_W - MAIN_X - 30;

  doc.rect(0, 0, SIDE_W, PAGE_H).fill("#f3f4f6");

  // Sidebar — fully explicit Y
  let sY = 24;
  doc.font("Helvetica-Bold").fontSize(15).fillColor("#111827").text(name || "", 15, sY, { width: SIDE_W - 20 });
  sY = doc.y + 2;
  if (title) { doc.font("Helvetica").fontSize(9).fillColor("#6b7280").text(title, 15, sY, { width: SIDE_W - 20 }); sY = doc.y + 8; }

  doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#6b7280").text("CONTACT", 15, sY, { characterSpacing: 0.5 });
  sY = doc.y + 3;
  [contact?.phone, contact?.email, contact?.location].filter(Boolean).forEach(c => {
    doc.font("Helvetica").fontSize(8.5).fillColor("#374151").text(c, 15, sY, { width: SIDE_W - 20 });
    sY = doc.y + 2;
  });
  sY += 6;

  if (skills.length > 0) {
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#6b7280").text("SKILLS", 15, sY, { characterSpacing: 0.5 });
    sY = doc.y + 3;
    skills.forEach(s => {
      doc.circle(22, sY + 4, 1.5).fill("#6b7280");
      doc.font("Helvetica").fontSize(8.5).fillColor("#374151").text(s, 28, sY, { width: SIDE_W - 33 });
      sY = doc.y + 2;
    });
    sY += 6;
  }

  if (education?.length > 0) {
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#6b7280").text("EDUCATION", 15, sY, { characterSpacing: 0.5 });
    sY = doc.y + 3;
    education.forEach((edu: any) => {
      if (edu.degree) { doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#374151").text(edu.degree, 15, sY, { width: SIDE_W - 20 }); sY = doc.y + 1; }
      const schoolYr = [edu.school, edu.year].filter(Boolean).join(" · ");
      if (schoolYr) { doc.font("Helvetica").fontSize(8).fillColor("#6b7280").text(schoolYr, 15, sY, { width: SIDE_W - 20 }); sY = doc.y + 5; }
    });
  }

  // Main content — separate Y tracker
  let mY = 24;

  if (summary?.trim()) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#374151").text("PROFESSIONAL SUMMARY", MAIN_X, mY, { characterSpacing: 0.4 });
    mY = doc.y + 3;
    doc.moveTo(MAIN_X, mY).lineTo(PAGE_W - 30, mY).lineWidth(0.5).stroke("#d1d5db");
    mY += 5;
    doc.font("Helvetica").fontSize(9.5).fillColor("#374151").text(summary, MAIN_X, mY, { width: MAIN_W, lineGap: 2 });
    mY = doc.y + 10;
  }

  if (experience?.length > 0) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#374151").text("EXPERIENCE", MAIN_X, mY, { characterSpacing: 0.4 });
    mY = doc.y + 3;
    doc.moveTo(MAIN_X, mY).lineTo(PAGE_W - 30, mY).lineWidth(0.5).stroke("#d1d5db");
    mY += 5;
    experience.forEach((job: any) => {
      if (mY > PAGE_H - 80) { doc.addPage(); mY = 40; }
      mY = jobBlock(doc, job, MAIN_X, mY, MAIN_W);
    });
  }
}

// ── 5. Sidebar Green ──────────────────────────────────────────────────────────

export function drawSidebarGreenPDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education } = data;
  const skills = getSkills(data);
  const GREEN = "#166534";
  const GREEN_BG = "#f0fdf4";
  const SIDE_W = 155;
  const MAIN_X = SIDE_W + 20;
  const MAIN_W = PAGE_W - MAIN_X - 30;

  doc.rect(0, 0, SIDE_W, PAGE_H).fill(GREEN_BG);

  let sY = 20;
  doc.font("Helvetica-Bold").fontSize(14).fillColor(GREEN).text(name || "", 15, sY, { width: SIDE_W - 20 });
  sY = doc.y + 2;
  if (title) { doc.font("Helvetica").fontSize(9).fillColor("#374151").text(title, 15, sY, { width: SIDE_W - 20 }); sY = doc.y + 8; }

  [contact?.phone, contact?.email, contact?.location].filter(Boolean).forEach(c => {
    doc.font("Helvetica").fontSize(8.5).fillColor("#4b5563").text(c, 15, sY, { width: SIDE_W - 20 });
    sY = doc.y + 2;
  });
  sY += 8;

  if (skills.length > 0) {
    doc.font("Helvetica-Bold").fontSize(8).fillColor(GREEN).text("SKILLS", 15, sY, { characterSpacing: 0.5 });
    sY = doc.y + 3;
    doc.moveTo(15, sY).lineTo(SIDE_W - 10, sY).lineWidth(0.5).stroke(GREEN);
    sY += 4;
    skills.forEach(s => {
      doc.circle(22, sY + 4, 1.5).fill(GREEN);
      doc.font("Helvetica").fontSize(8.5).fillColor("#374151").text(s, 28, sY, { width: SIDE_W - 33 });
      sY = doc.y + 2;
    });
    sY += 6;
  }

  if (education?.length > 0) {
    if (sY < PAGE_H - 80) {
      doc.font("Helvetica-Bold").fontSize(8).fillColor(GREEN).text("EDUCATION", 15, sY, { characterSpacing: 0.5 });
      sY = doc.y + 3;
      doc.moveTo(15, sY).lineTo(SIDE_W - 10, sY).lineWidth(0.5).stroke(GREEN);
      sY += 4;
      education.forEach((edu: any) => {
        if (edu.degree) { doc.font("Helvetica-Bold").fontSize(8.5).fillColor(GREEN).text(edu.degree, 15, sY, { width: SIDE_W - 20 }); sY = doc.y + 1; }
        const schoolYr = [edu.school, edu.year].filter(Boolean).join(" · ");
        if (schoolYr) { doc.font("Helvetica").fontSize(8).fillColor("#6b7280").text(schoolYr, 15, sY, { width: SIDE_W - 20 }); sY = doc.y + 4; }
      });
    }
  }

  // Main — separate Y
  let mY = 20;

  if (summary?.trim()) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(GREEN).text("PROFESSIONAL SUMMARY", MAIN_X, mY, { characterSpacing: 0.4 });
    mY = doc.y + 3;
    doc.moveTo(MAIN_X, mY).lineTo(PAGE_W - 30, mY).lineWidth(0.5).stroke(GREEN);
    mY += 5;
    doc.font("Helvetica").fontSize(9.5).fillColor("#374151").text(summary, MAIN_X, mY, { width: MAIN_W, lineGap: 2 });
    mY = doc.y + 10;
  }

  if (experience?.length > 0) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(GREEN).text("EXPERIENCE", MAIN_X, mY, { characterSpacing: 0.4 });
    mY = doc.y + 3;
    doc.moveTo(MAIN_X, mY).lineTo(PAGE_W - 30, mY).lineWidth(0.5).stroke(GREEN);
    mY += 5;
    experience.forEach((job: any) => {
      if (mY > PAGE_H - 80) { doc.addPage(); mY = 40; }
      mY = jobBlock(doc, job, MAIN_X, mY, MAIN_W);
    });
  }
}

// ── 6. Executive Classic (navy) ───────────────────────────────────────────────

export function drawExecutiveClassicPDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education } = data;
  const skills = getSkills(data);
  const NAVY = "#1e3a5f";

  doc.rect(0, 0, PAGE_W, 72).fill(NAVY);
  doc.font("Helvetica-Bold").fontSize(22).fillColor("#ffffff").text(name || "", L, 14);
  if (title) doc.font("Helvetica").fontSize(11).fillColor("#93c5fd").text(title, L, 38);
  const cp = [contact?.phone, contact?.email, contact?.location].filter(Boolean);
  doc.font("Helvetica").fontSize(8.5).fillColor("#bfdbfe").text(cp.join("  |  "), L, 58, { width: CONTENT_W });

  let y = 84;

  if (summary?.trim()) {
    y = sectionHead(doc, "Executive Summary", L, y, CONTENT_W, NAVY);
    doc.font("Helvetica").fontSize(9.5).fillColor("#374151").text(summary, L, y, { width: CONTENT_W, lineGap: 2 });
    y = doc.y + 8;
  }
  if (skills.length > 0) {
    y = sectionHead(doc, "Core Competencies", L, y, CONTENT_W, NAVY);
    doc.font("Helvetica").fontSize(9).fillColor("#374151").text(skills.join("   •   "), L, y, { width: CONTENT_W });
    y = doc.y + 8;
  }
  if (experience?.length > 0) {
    y = sectionHead(doc, "Professional Experience", L, y, CONTENT_W, NAVY);
    experience.forEach((job: any) => {
      if (y > PAGE_H - 80) { doc.addPage(); y = 40; }
      y = jobBlock(doc, job, L, y, CONTENT_W);
    });
  }
  if (education?.length > 0) {
    if (y > PAGE_H - 80) { doc.addPage(); y = 40; }
    y = sectionHead(doc, "Education", L, y, CONTENT_W, NAVY);
    education.forEach((edu: any) => {
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#111827").text([edu.degree, edu.school].filter(Boolean).join(" — "), L, y, { width: CONTENT_W });
      y = doc.y + 1;
      if (edu.year) { doc.font("Helvetica").fontSize(8.5).fillColor("#6b7280").text(edu.year, L, y); y = doc.y + 4; }
    });
  }
}

// ── 7. Executive Luxe (gold sidebar) ─────────────────────────────────────────

export function drawExecutiveLuxePDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education } = data;
  const skills = getSkills(data);
  const GOLD = "#92400e"; const GOLD_BG = "#fffbeb";
  const SIDE_W = 150; const MAIN_X = SIDE_W + 20; const MAIN_W = PAGE_W - MAIN_X - 30;

  doc.rect(0, 0, SIDE_W, PAGE_H).fill(GOLD_BG);

  let sY = 20;
  doc.font("Helvetica-Bold").fontSize(13).fillColor(GOLD).text(name || "", 15, sY, { width: SIDE_W - 20 });
  sY = doc.y + 2;
  if (title) { doc.font("Helvetica").fontSize(8.5).fillColor("#78350f").text(title, 15, sY, { width: SIDE_W - 20 }); sY = doc.y + 8; }
  [contact?.phone, contact?.email, contact?.location].filter(Boolean).forEach(c => {
    doc.font("Helvetica").fontSize(8).fillColor("#92400e").text(c, 15, sY, { width: SIDE_W - 20 });
    sY = doc.y + 2;
  });
  sY += 8;
  if (skills.length > 0) {
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(GOLD).text("SKILLS", 15, sY, { characterSpacing: 0.5 });
    sY = doc.y + 3;
    doc.moveTo(15, sY).lineTo(SIDE_W - 10, sY).lineWidth(0.5).stroke(GOLD); sY += 4;
    skills.forEach(s => {
      doc.circle(22, sY + 4, 1.5).fill(GOLD);
      doc.font("Helvetica").fontSize(8.5).fillColor("#78350f").text(s, 28, sY, { width: SIDE_W - 33 });
      sY = doc.y + 2;
    });
    sY += 6;
  }
  if (education?.length > 0 && sY < PAGE_H - 80) {
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(GOLD).text("EDUCATION", 15, sY, { characterSpacing: 0.5 });
    sY = doc.y + 3;
    doc.moveTo(15, sY).lineTo(SIDE_W - 10, sY).lineWidth(0.5).stroke(GOLD); sY += 4;
    education.forEach((edu: any) => {
      if (edu.degree) { doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#78350f").text(edu.degree, 15, sY, { width: SIDE_W - 20 }); sY = doc.y + 1; }
      const s = [edu.school, edu.year].filter(Boolean).join(" · ");
      if (s) { doc.font("Helvetica").fontSize(8).fillColor("#92400e").text(s, 15, sY, { width: SIDE_W - 20 }); sY = doc.y + 4; }
    });
  }

  let mY = 20;
  if (summary?.trim()) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(GOLD).text("SUMMARY", MAIN_X, mY, { characterSpacing: 0.4 });
    mY = doc.y + 3;
    doc.moveTo(MAIN_X, mY).lineTo(PAGE_W - 30, mY).lineWidth(0.5).stroke(GOLD); mY += 5;
    doc.font("Helvetica").fontSize(9.5).fillColor("#374151").text(summary, MAIN_X, mY, { width: MAIN_W, lineGap: 2 });
    mY = doc.y + 10;
  }
  if (experience?.length > 0) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(GOLD).text("EXPERIENCE", MAIN_X, mY, { characterSpacing: 0.4 });
    mY = doc.y + 3;
    doc.moveTo(MAIN_X, mY).lineTo(PAGE_W - 30, mY).lineWidth(0.5).stroke(GOLD); mY += 5;
    experience.forEach((job: any) => {
      if (mY > PAGE_H - 80) { doc.addPage(); mY = 40; }
      mY = jobBlock(doc, job, MAIN_X, mY, MAIN_W);
    });
  }
}

// ── 8. Modern Elite (dark amber) ─────────────────────────────────────────────

export function drawModernElitePDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education } = data;
  const skills = getSkills(data);
  const DARK = "#111827"; const AMBER = "#f59e0b";

  doc.rect(0, 0, PAGE_W, 8).fill(AMBER);
  doc.font("Helvetica-Bold").fontSize(22).fillColor(DARK).text(name || "", L, 18);
  doc.rect(L, doc.y + 3, 50, 2).fill(AMBER);
  let y = doc.y + 8;
  if (title) { doc.font("Helvetica").fontSize(11).fillColor("#6b7280").text(title, L, y); y = doc.y + 3; }
  const cp = [contact?.phone, contact?.email, contact?.location].filter(Boolean);
  doc.font("Helvetica").fontSize(8.5).fillColor("#6b7280").text(cp.join("  |  "), L, y, { width: CONTENT_W });
  y = doc.y + 6;
  doc.rect(0, y, PAGE_W, 1).fill(AMBER); y += 8;

  if (summary?.trim()) {
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(DARK).text("PROFILE", L, y); y = doc.y + 4;
    doc.font("Helvetica").fontSize(9.5).fillColor("#374151").text(summary, L, y, { width: CONTENT_W, lineGap: 2 }); y = doc.y + 8;
  }
  if (skills.length > 0) {
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(DARK).text("SKILLS", L, y); y = doc.y + 4;
    doc.font("Helvetica").fontSize(9).fillColor("#374151").text(skills.join("   |   "), L, y, { width: CONTENT_W }); y = doc.y + 8;
  }
  if (experience?.length > 0) {
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(DARK).text("EXPERIENCE", L, y); y = doc.y + 4;
    experience.forEach((job: any) => {
      if (y > PAGE_H - 80) { doc.addPage(); y = 40; }
      y = jobBlock(doc, job, L, y, CONTENT_W);
    });
  }
  if (education?.length > 0) {
    if (y > PAGE_H - 80) { doc.addPage(); y = 40; }
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(DARK).text("EDUCATION", L, y); y = doc.y + 4;
    education.forEach((edu: any) => {
      doc.font("Helvetica-Bold").fontSize(9).fillColor(DARK).text([edu.degree, edu.school].filter(Boolean).join(" — "), L, y, { width: CONTENT_W });
      y = doc.y + 1;
      if (edu.year) { doc.font("Helvetica").fontSize(8.5).fillColor("#9ca3af").text(edu.year, L, y); y = doc.y + 4; }
    });
  }
}

// ── 9. Modern Professional (indigo) ──────────────────────────────────────────

export function drawModernProfessionalPDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education } = data;
  const skills = getSkills(data);
  const GRAY = "#374151"; const ACCENT = "#6366f1";

  doc.font("Helvetica-Bold").fontSize(22).fillColor(GRAY).text(name || "", L, 24);
  doc.rect(L, doc.y + 3, 50, 2).fill(ACCENT);
  let y = doc.y + 8;
  if (title) { doc.font("Helvetica").fontSize(11).fillColor(GRAY).text(title, L, y); y = doc.y + 3; }
  const cp = [contact?.phone, contact?.email, contact?.location].filter(Boolean);
  doc.font("Helvetica").fontSize(8.5).fillColor("#6b7280").text(cp.join("  |  "), L, y, { width: CONTENT_W }); y = doc.y + 10;

  if (summary?.trim()) {
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(ACCENT).text("ABOUT", L, y); y = doc.y + 4;
    doc.font("Helvetica").fontSize(9.5).fillColor(GRAY).text(summary, L, y, { width: CONTENT_W, lineGap: 2 }); y = doc.y + 8;
  }
  if (skills.length > 0) {
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(ACCENT).text("SKILLS", L, y); y = doc.y + 4;
    doc.font("Helvetica").fontSize(9).fillColor(GRAY).text(skills.join("   |   "), L, y, { width: CONTENT_W }); y = doc.y + 8;
  }
  if (experience?.length > 0) {
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(ACCENT).text("EXPERIENCE", L, y); y = doc.y + 4;
    experience.forEach((job: any) => {
      if (y > PAGE_H - 80) { doc.addPage(); y = 40; }
      y = jobBlock(doc, job, L, y, CONTENT_W);
    });
  }
  if (education?.length > 0) {
    if (y > PAGE_H - 80) { doc.addPage(); y = 40; }
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(ACCENT).text("EDUCATION", L, y); y = doc.y + 4;
    education.forEach((edu: any) => {
      doc.font("Helvetica-Bold").fontSize(9).fillColor(GRAY).text([edu.degree, edu.school].filter(Boolean).join(" — "), L, y, { width: CONTENT_W });
      y = doc.y + 1;
      if (edu.year) { doc.font("Helvetica").fontSize(8.5).fillColor("#9ca3af").text(edu.year, L, y); y = doc.y + 4; }
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
      responsibilities: (exp.responsabilidades || exp.responsibilities || [])
        .map((r: any) => r.text || r).filter(Boolean),
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
