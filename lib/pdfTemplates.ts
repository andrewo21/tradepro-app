// lib/pdfTemplates.ts
// Professional vector PDF renderers using pdfkit.
// Text is real PDF text — scalable, searchable, ATS-parseable, <300KB.

// ── Shared helpers ────────────────────────────────────────────────────────────

const PAGE_W = 612; // 8.5in at 72dpi
const PAGE_H = 792; // 11in at 72dpi
const L = 45;       // left margin
const R = PAGE_W - 45; // right margin
const CONTENT_W = R - L;

function getSkills(data: any): string[] {
  return (data.skills || [])
    .map((s: any) => typeof s === "string" ? s : (s.text || ""))
    .filter(Boolean);
}

function getBullets(job: any): string[] {
  return [
    ...(job.responsibilities || []),
    ...(job.achievements || []),
  ]
    .map((b: any) => typeof b === "string" ? b : (b.text || ""))
    .filter(Boolean);
}

function safeText(doc: any, text: string, x: number, y: number, opts: any = {}) {
  if (!text) return;
  doc.text(text, x, y, opts);
}

function sectionRule(doc: any, y: number, color = "#d1d5db") {
  doc.moveTo(L, y).lineTo(R, y).lineWidth(0.5).stroke(color);
}

function sectionHeader(doc: any, title: string, y: number, color = "#1f2937") {
  doc.font("Helvetica-Bold").fontSize(9).fillColor(color)
    .text(title.toUpperCase(), L, y, { characterSpacing: 0.8 });
  const lineY = doc.y + 2;
  sectionRule(doc, lineY);
  doc.moveDown(0.4);
}

function bulletLine(doc: any, text: string, indent: number, width: number) {
  const bx = L + indent;
  const by = doc.y;
  doc.circle(bx - 6, by + 4, 1.5).fill("#374151");
  doc.font("Helvetica").fontSize(9).fillColor("#374151")
    .text(text, bx, by, { width: width - indent, lineGap: 1 });
}

function experienceBlock(doc: any, job: any, contentW: number, indent = 0) {
  const dates = [job.startDate, job.endDate].filter(Boolean).join(" – ");
  const titleY = doc.y;

  doc.font("Helvetica-Bold").fontSize(10).fillColor("#111827")
    .text(job.jobTitle || "", L + indent, titleY, { width: contentW - indent - 100, continued: false });

  if (dates) {
    doc.font("Helvetica").fontSize(9).fillColor("#6b7280")
      .text(dates, R - 100, titleY, { width: 100, align: "right" });
  }

  if (job.company) {
    doc.font("Helvetica").fontSize(9).fillColor("#4b5563")
      .text(job.company, L + indent, doc.y + 1);
  }

  const bullets = getBullets(job);
  if (bullets.length > 0) {
    doc.moveDown(0.3);
    bullets.forEach(b => {
      bulletLine(doc, b, indent + 8, contentW);
    });
  }
  doc.moveDown(0.6);
}

// ── 1. Standard Contemporary ──────────────────────────────────────────────────

export function drawStandardContemporaryPDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education, certifications } = data;
  const skills = getSkills(data);

  // Header — white with bottom border
  doc.rect(0, 0, PAGE_W, 60).fill("#ffffff");
  doc.font("Helvetica-Bold").fontSize(20).fillColor("#111827")
    .text(name || "", L, 18);
  if (title) {
    doc.font("Helvetica").fontSize(10).fillColor("#6b7280")
      .text(title, L, doc.y + 2);
  }

  // Contact right-aligned
  const contactParts = [contact?.phone, contact?.email, contact?.location, contact?.linkedin].filter(Boolean);
  if (contactParts.length) {
    doc.font("Helvetica").fontSize(8).fillColor("#6b7280")
      .text(contactParts.join("  |  "), L, 22, { width: CONTENT_W, align: "right" });
  }

  doc.moveTo(L, 62).lineTo(R, 62).lineWidth(0.75).stroke("#d1d5db");
  doc.y = 72;

  if (summary?.trim()) {
    sectionHeader(doc, "Professional Summary", doc.y);
    doc.font("Helvetica").fontSize(9.5).fillColor("#374151")
      .text(summary, L, doc.y, { width: CONTENT_W, lineGap: 2 });
    doc.moveDown(0.8);
  }

  if (skills.length > 0) {
    sectionHeader(doc, "Core Skills", doc.y);
    const col = CONTENT_W / 2;
    const mid = Math.ceil(skills.length / 2);
    const startY = doc.y;
    skills.slice(0, mid).forEach((s, i) => {
      doc.circle(L + 4, startY + i * 14 + 4, 1.5).fill("#374151");
      doc.font("Helvetica").fontSize(9).fillColor("#374151")
        .text(s, L + 10, startY + i * 14, { width: col - 15 });
    });
    skills.slice(mid).forEach((s, i) => {
      doc.circle(L + col + 4, startY + i * 14 + 4, 1.5).fill("#374151");
      doc.font("Helvetica").fontSize(9).fillColor("#374151")
        .text(s, L + col + 10, startY + i * 14, { width: col - 15 });
    });
    doc.y = startY + Math.ceil(skills.length / 2) * 14 + 8;
    doc.moveDown(0.4);
  }

  if (experience?.length > 0) {
    sectionHeader(doc, "Experience", doc.y);
    experience.forEach((job: any) => {
      if (doc.y > PAGE_H - 100) { doc.addPage(); doc.y = 40; }
      experienceBlock(doc, job, CONTENT_W);
    });
  }

  if (education?.length > 0) {
    sectionHeader(doc, "Education", doc.y);
    education.forEach((edu: any) => {
      const parts = [edu.degree, edu.school, edu.year].filter(Boolean);
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#111827")
        .text(parts[0] || "", L, doc.y);
      if (parts.length > 1) {
        doc.font("Helvetica").fontSize(8.5).fillColor("#6b7280")
          .text(parts.slice(1).join("  |  "), L, doc.y + 1);
      }
      doc.moveDown(0.5);
    });
  }

  if (certifications?.length > 0) {
    sectionHeader(doc, "Certifications", doc.y);
    certifications.forEach((cert: string) => {
      bulletLine(doc, cert, 8, CONTENT_W);
    });
  }
}

// ── 2. Standard Classic (dark header) ────────────────────────────────────────

export function drawStandardClassicPDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education, certifications } = data;
  const skills = getSkills(data);

  // Dark header bar
  doc.rect(0, 0, PAGE_W, 60).fill("#111827");
  doc.font("Helvetica-Bold").fontSize(20).fillColor("#ffffff")
    .text(name || "", L, 16);
  const contactParts = [contact?.phone, contact?.email, contact?.location].filter(Boolean);
  if (contactParts.length) {
    doc.font("Helvetica").fontSize(8).fillColor("#9ca3af")
      .text(contactParts.join("  |  "), L, 40, { width: CONTENT_W, align: "right" });
  }
  if (title) {
    doc.font("Helvetica").fontSize(10).fillColor("#d1d5db")
      .text(title, L, 38);
  }
  doc.y = 72;

  if (summary?.trim()) {
    sectionHeader(doc, "Professional Summary", doc.y);
    doc.font("Helvetica").fontSize(9.5).fillColor("#374151")
      .text(summary, L, doc.y, { width: CONTENT_W, lineGap: 2 });
    doc.moveDown(0.8);
  }

  if (skills.length > 0) {
    sectionHeader(doc, "Core Skills", doc.y);
    const col = CONTENT_W / 2;
    const mid = Math.ceil(skills.length / 2);
    const startY = doc.y;
    skills.slice(0, mid).forEach((s, i) => {
      doc.circle(L + 4, startY + i * 14 + 4, 1.5).fill("#374151");
      doc.font("Helvetica").fontSize(9).fillColor("#374151").text(s, L + 10, startY + i * 14, { width: col - 15 });
    });
    skills.slice(mid).forEach((s, i) => {
      doc.circle(L + col + 4, startY + i * 14 + 4, 1.5).fill("#374151");
      doc.font("Helvetica").fontSize(9).fillColor("#374151").text(s, L + col + 10, startY + i * 14, { width: col - 15 });
    });
    doc.y = startY + Math.ceil(skills.length / 2) * 14 + 8;
    doc.moveDown(0.4);
  }

  if (experience?.length > 0) {
    sectionHeader(doc, "Experience", doc.y);
    experience.forEach((job: any) => {
      if (doc.y > PAGE_H - 100) { doc.addPage(); doc.y = 40; }
      experienceBlock(doc, job, CONTENT_W);
    });
  }

  if (education?.length > 0) {
    sectionHeader(doc, "Education", doc.y);
    education.forEach((edu: any) => {
      const parts = [edu.degree, edu.school, edu.year].filter(Boolean);
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#111827").text(parts[0] || "", L, doc.y);
      if (parts.length > 1) doc.font("Helvetica").fontSize(8.5).fillColor("#6b7280").text(parts.slice(1).join("  |  "), L, doc.y + 1);
      doc.moveDown(0.5);
    });
  }
}

// ── 3. Modern Blue ────────────────────────────────────────────────────────────

export function drawModernBluePDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education, certifications } = data;
  const skills = getSkills(data);
  const BLUE = "#1d4ed8";

  doc.rect(0, 0, PAGE_W, 80).fill(BLUE);
  doc.font("Helvetica-Bold").fontSize(22).fillColor("#ffffff").text(name || "", L, 18);
  if (title) doc.font("Helvetica").fontSize(11).fillColor("#bfdbfe").text(title, L, doc.y + 3);
  const cp = [contact?.phone, contact?.email, contact?.location].filter(Boolean);
  if (cp.length) doc.font("Helvetica").fontSize(8).fillColor("#dbeafe").text(cp.join("  |  "), L, 62, { width: CONTENT_W });
  doc.y = 92;

  if (summary?.trim()) {
    doc.font("Helvetica-Bold").fontSize(10).fillColor(BLUE).text("SUMMARY", L, doc.y);
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(9.5).fillColor("#374151").text(summary, L, doc.y, { width: CONTENT_W, lineGap: 2 });
    doc.moveDown(0.8);
  }

  if (skills.length > 0) {
    doc.font("Helvetica-Bold").fontSize(10).fillColor(BLUE).text("SKILLS", L, doc.y);
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(9).fillColor("#374151")
      .text(skills.join("   •   "), L, doc.y, { width: CONTENT_W });
    doc.moveDown(0.8);
  }

  if (experience?.length > 0) {
    doc.font("Helvetica-Bold").fontSize(10).fillColor(BLUE).text("EXPERIENCE", L, doc.y);
    sectionRule(doc, doc.y + 13, BLUE);
    doc.moveDown(0.6);
    experience.forEach((job: any) => {
      if (doc.y > PAGE_H - 100) { doc.addPage(); doc.y = 40; }
      experienceBlock(doc, job, CONTENT_W);
    });
  }

  if (education?.length > 0) {
    doc.font("Helvetica-Bold").fontSize(10).fillColor(BLUE).text("EDUCATION", L, doc.y);
    sectionRule(doc, doc.y + 13, BLUE);
    doc.moveDown(0.6);
    education.forEach((edu: any) => {
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#111827").text([edu.degree, edu.school].filter(Boolean).join(" — "), L, doc.y);
      if (edu.year) doc.font("Helvetica").fontSize(8.5).fillColor("#6b7280").text(edu.year, L, doc.y + 1);
      doc.moveDown(0.5);
    });
  }
}

// ── 4. Basic Two Column ───────────────────────────────────────────────────────

export function drawBasicTwoColumnPDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education, certifications } = data;
  const skills = getSkills(data);
  const SIDE_W = 165;
  const MAIN_X = SIDE_W + 15;
  const MAIN_W = PAGE_W - MAIN_X - 30;

  // Sidebar background
  doc.rect(0, 0, SIDE_W, PAGE_H).fill("#f3f4f6");

  // Name & title
  doc.font("Helvetica-Bold").fontSize(16).fillColor("#111827").text(name || "", 15, 24, { width: SIDE_W - 20 });
  if (title) doc.font("Helvetica").fontSize(9).fillColor("#6b7280").text(title, 15, doc.y + 3, { width: SIDE_W - 20 });

  // Contact
  doc.moveDown(0.8);
  doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#6b7280").text("CONTACT", 15, doc.y, { characterSpacing: 0.5 });
  doc.moveDown(0.3);
  [contact?.phone, contact?.email, contact?.location].filter(Boolean).forEach(c => {
    doc.font("Helvetica").fontSize(8.5).fillColor("#374151").text(c, 15, doc.y, { width: SIDE_W - 20 });
    doc.moveDown(0.3);
  });

  // Skills
  if (skills.length > 0) {
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#6b7280").text("SKILLS", 15, doc.y, { characterSpacing: 0.5 });
    doc.moveDown(0.3);
    skills.forEach(s => {
      doc.circle(22, doc.y + 4, 1.5).fill("#6b7280");
      doc.font("Helvetica").fontSize(8.5).fillColor("#374151").text(s, 28, doc.y, { width: SIDE_W - 33 });
      doc.moveDown(0.3);
    });
  }

  // Education in sidebar
  if (education?.length > 0) {
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#6b7280").text("EDUCATION", 15, doc.y, { characterSpacing: 0.5 });
    doc.moveDown(0.3);
    education.forEach((edu: any) => {
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#374151").text(edu.degree || "", 15, doc.y, { width: SIDE_W - 20 });
      doc.font("Helvetica").fontSize(8).fillColor("#6b7280").text([edu.school, edu.year].filter(Boolean).join(" · "), 15, doc.y + 1, { width: SIDE_W - 20 });
      doc.moveDown(0.6);
    });
  }

  // Main content
  let mainY = 24;

  if (summary?.trim()) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#374151").text("PROFESSIONAL SUMMARY", MAIN_X, mainY, { characterSpacing: 0.5 });
    doc.moveTo(MAIN_X, doc.y + 3).lineTo(PAGE_W - 30, doc.y + 3).lineWidth(0.5).stroke("#d1d5db");
    mainY = doc.y + 8;
    doc.font("Helvetica").fontSize(9.5).fillColor("#374151").text(summary, MAIN_X, mainY, { width: MAIN_W, lineGap: 2 });
    mainY = doc.y + 10;
  }

  if (experience?.length > 0) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#374151").text("EXPERIENCE", MAIN_X, mainY, { characterSpacing: 0.5 });
    doc.moveTo(MAIN_X, doc.y + 3).lineTo(PAGE_W - 30, doc.y + 3).lineWidth(0.5).stroke("#d1d5db");
    mainY = doc.y + 8;
    experience.forEach((job: any) => {
      doc.y = mainY;
      const dates = [job.startDate, job.endDate].filter(Boolean).join(" – ");
      doc.font("Helvetica-Bold").fontSize(9.5).fillColor("#111827").text(job.jobTitle || "", MAIN_X, mainY, { width: MAIN_W - 80 });
      if (dates) doc.font("Helvetica").fontSize(8.5).fillColor("#6b7280").text(dates, PAGE_W - 110, mainY, { width: 80, align: "right" });
      doc.font("Helvetica").fontSize(8.5).fillColor("#6b7280").text(job.company || "", MAIN_X, doc.y + 1);
      doc.moveDown(0.3);
      getBullets(job).forEach(b => {
        doc.circle(MAIN_X + 6, doc.y + 4, 1.5).fill("#6b7280");
        doc.font("Helvetica").fontSize(9).fillColor("#374151").text(b, MAIN_X + 12, doc.y, { width: MAIN_W - 12, lineGap: 1 });
      });
      mainY = doc.y + 10;
    });
  }
}

// ── 5. Sidebar Green ──────────────────────────────────────────────────────────

export function drawSidebarGreenPDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education, certifications } = data;
  const skills = getSkills(data);
  const GREEN = "#166534";
  const GREEN_BG = "#f0fdf4";
  const SIDE_W = 160;
  const MAIN_X = SIDE_W + 15;
  const MAIN_W = PAGE_W - MAIN_X - 30;

  doc.rect(0, 0, SIDE_W, PAGE_H).fill(GREEN_BG);

  doc.font("Helvetica-Bold").fontSize(15).fillColor(GREEN).text(name || "", 15, 22, { width: SIDE_W - 20 });
  if (title) doc.font("Helvetica").fontSize(9).fillColor("#374151").text(title, 15, doc.y + 3, { width: SIDE_W - 20 });

  const cp = [contact?.phone, contact?.email, contact?.location].filter(Boolean);
  if (cp.length) {
    doc.moveDown(0.6);
    cp.forEach(c => {
      doc.font("Helvetica").fontSize(8.5).fillColor("#4b5563").text(c, 15, doc.y, { width: SIDE_W - 20 });
      doc.moveDown(0.25);
    });
  }

  if (skills.length > 0) {
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").fontSize(8).fillColor(GREEN).text("SKILLS", 15, doc.y, { characterSpacing: 0.5 });
    doc.moveTo(15, doc.y + 3).lineTo(SIDE_W - 10, doc.y + 3).lineWidth(0.5).stroke(GREEN);
    doc.moveDown(0.4);
    skills.forEach(s => {
      doc.circle(22, doc.y + 4, 1.5).fill(GREEN);
      doc.font("Helvetica").fontSize(8.5).fillColor("#374151").text(s, 28, doc.y, { width: SIDE_W - 33 });
      doc.moveDown(0.3);
    });
  }

  if (education?.length > 0) {
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").fontSize(8).fillColor(GREEN).text("EDUCATION", 15, doc.y, { characterSpacing: 0.5 });
    doc.moveTo(15, doc.y + 3).lineTo(SIDE_W - 10, doc.y + 3).lineWidth(0.5).stroke(GREEN);
    doc.moveDown(0.4);
    education.forEach((edu: any) => {
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(GREEN).text(edu.degree || "", 15, doc.y, { width: SIDE_W - 20 });
      doc.font("Helvetica").fontSize(8).fillColor("#6b7280").text([edu.school, edu.year].filter(Boolean).join(" · "), 15, doc.y + 1, { width: SIDE_W - 20 });
      doc.moveDown(0.5);
    });
  }

  // Main content
  let mainY = 22;

  if (summary?.trim()) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(GREEN).text("PROFESSIONAL SUMMARY", MAIN_X, mainY, { characterSpacing: 0.5 });
    doc.moveTo(MAIN_X, doc.y + 3).lineTo(PAGE_W - 30, doc.y + 3).lineWidth(0.5).stroke(GREEN);
    mainY = doc.y + 8;
    doc.font("Helvetica").fontSize(9.5).fillColor("#374151").text(summary, MAIN_X, mainY, { width: MAIN_W, lineGap: 2 });
    mainY = doc.y + 10;
  }

  if (experience?.length > 0) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(GREEN).text("EXPERIENCE", MAIN_X, mainY, { characterSpacing: 0.5 });
    doc.moveTo(MAIN_X, doc.y + 3).lineTo(PAGE_W - 30, doc.y + 3).lineWidth(0.5).stroke(GREEN);
    mainY = doc.y + 8;
    experience.forEach((job: any) => {
      if (mainY > PAGE_H - 100) { doc.addPage(); mainY = 40; }
      doc.y = mainY;
      const dates = [job.startDate, job.endDate].filter(Boolean).join(" – ");
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#111827").text(job.jobTitle || "", MAIN_X, mainY, { width: MAIN_W - 80 });
      if (dates) doc.font("Helvetica").fontSize(8.5).fillColor("#6b7280").text(dates, PAGE_W - 110, mainY, { width: 80, align: "right" });
      doc.font("Helvetica").fontSize(8.5).fillColor("#6b7280").text(job.company || "", MAIN_X, doc.y + 1);
      doc.moveDown(0.3);
      getBullets(job).forEach(b => {
        doc.circle(MAIN_X + 6, doc.y + 4, 1.5).fill(GREEN);
        doc.font("Helvetica").fontSize(9).fillColor("#374151").text(b, MAIN_X + 12, doc.y, { width: MAIN_W - 12, lineGap: 1 });
      });
      mainY = doc.y + 10;
    });
  }
}

// ── 6. Executive Classic (premium — navy) ─────────────────────────────────────

export function drawExecutiveClassicPDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education } = data;
  const skills = getSkills(data);
  const NAVY = "#1e3a5f";

  doc.rect(0, 0, PAGE_W, 75).fill(NAVY);
  doc.font("Helvetica-Bold").fontSize(22).fillColor("#ffffff").text(name || "", L, 16);
  if (title) doc.font("Helvetica").fontSize(11).fillColor("#93c5fd").text(title, L, doc.y + 3);
  const cp = [contact?.phone, contact?.email, contact?.location].filter(Boolean);
  if (cp.length) doc.font("Helvetica").fontSize(8).fillColor("#bfdbfe").text(cp.join("  |  "), L, 62, { width: CONTENT_W });
  doc.y = 88;

  if (summary?.trim()) {
    sectionHeader(doc, "Executive Summary", doc.y, NAVY);
    doc.font("Helvetica").fontSize(9.5).fillColor("#374151").text(summary, L, doc.y, { width: CONTENT_W, lineGap: 2 });
    doc.moveDown(0.8);
  }

  if (skills.length > 0) {
    sectionHeader(doc, "Core Competencies", doc.y, NAVY);
    doc.font("Helvetica").fontSize(9).fillColor("#374151")
      .text(skills.join("   •   "), L, doc.y, { width: CONTENT_W });
    doc.moveDown(0.8);
  }

  if (experience?.length > 0) {
    sectionHeader(doc, "Professional Experience", doc.y, NAVY);
    experience.forEach((job: any) => {
      if (doc.y > PAGE_H - 100) { doc.addPage(); doc.y = 40; }
      experienceBlock(doc, job, CONTENT_W);
    });
  }

  if (education?.length > 0) {
    sectionHeader(doc, "Education", doc.y, NAVY);
    education.forEach((edu: any) => {
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#111827").text([edu.degree, edu.school].filter(Boolean).join(" — "), L, doc.y);
      if (edu.year) doc.font("Helvetica").fontSize(8.5).fillColor("#6b7280").text(edu.year, L, doc.y + 1);
      doc.moveDown(0.5);
    });
  }
}

// ── 7. Executive Luxe (premium — gold/navy sidebar) ───────────────────────────

export function drawExecutiveLuxePDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education } = data;
  const skills = getSkills(data);
  const GOLD = "#92400e";
  const GOLD_BG = "#fffbeb";
  const SIDE_W = 155;
  const MAIN_X = SIDE_W + 15;
  const MAIN_W = PAGE_W - MAIN_X - 30;

  doc.rect(0, 0, SIDE_W, PAGE_H).fill(GOLD_BG);

  doc.font("Helvetica-Bold").fontSize(14).fillColor(GOLD).text(name || "", 15, 20, { width: SIDE_W - 20 });
  if (title) doc.font("Helvetica").fontSize(8.5).fillColor("#78350f").text(title, 15, doc.y + 3, { width: SIDE_W - 20 });
  doc.moveDown(0.6);
  [contact?.phone, contact?.email, contact?.location].filter(Boolean).forEach(c => {
    doc.font("Helvetica").fontSize(8).fillColor("#92400e").text(c, 15, doc.y, { width: SIDE_W - 20 });
    doc.moveDown(0.25);
  });

  if (skills.length > 0) {
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(GOLD).text("SKILLS", 15, doc.y, { characterSpacing: 0.5 });
    doc.moveTo(15, doc.y + 3).lineTo(SIDE_W - 10, doc.y + 3).lineWidth(0.5).stroke(GOLD);
    doc.moveDown(0.4);
    skills.forEach(s => {
      doc.circle(22, doc.y + 4, 1.5).fill(GOLD);
      doc.font("Helvetica").fontSize(8.5).fillColor("#78350f").text(s, 28, doc.y, { width: SIDE_W - 33 });
      doc.moveDown(0.3);
    });
  }

  if (education?.length > 0) {
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(GOLD).text("EDUCATION", 15, doc.y, { characterSpacing: 0.5 });
    doc.moveTo(15, doc.y + 3).lineTo(SIDE_W - 10, doc.y + 3).lineWidth(0.5).stroke(GOLD);
    doc.moveDown(0.4);
    education.forEach((edu: any) => {
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#78350f").text(edu.degree || "", 15, doc.y, { width: SIDE_W - 20 });
      doc.font("Helvetica").fontSize(8).fillColor("#92400e").text([edu.school, edu.year].filter(Boolean).join(" · "), 15, doc.y + 1, { width: SIDE_W - 20 });
      doc.moveDown(0.5);
    });
  }

  let mainY = 20;
  if (summary?.trim()) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(GOLD).text("SUMMARY", MAIN_X, mainY, { characterSpacing: 0.5 });
    doc.moveTo(MAIN_X, doc.y + 3).lineTo(PAGE_W - 30, doc.y + 3).lineWidth(0.5).stroke(GOLD);
    mainY = doc.y + 8;
    doc.font("Helvetica").fontSize(9.5).fillColor("#374151").text(summary, MAIN_X, mainY, { width: MAIN_W, lineGap: 2 });
    mainY = doc.y + 10;
  }
  if (experience?.length > 0) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(GOLD).text("EXPERIENCE", MAIN_X, mainY, { characterSpacing: 0.5 });
    doc.moveTo(MAIN_X, doc.y + 3).lineTo(PAGE_W - 30, doc.y + 3).lineWidth(0.5).stroke(GOLD);
    mainY = doc.y + 8;
    experience.forEach((job: any) => {
      if (mainY > PAGE_H - 100) { doc.addPage(); mainY = 40; }
      doc.y = mainY;
      experienceBlock(doc, job, MAIN_W);
      mainY = doc.y;
    });
  }
}

// ── 8. Modern Elite (premium — dark with amber) ───────────────────────────────

export function drawModernElitePDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education } = data;
  const skills = getSkills(data);
  const DARK = "#111827"; const AMBER = "#f59e0b";

  doc.rect(0, 0, PAGE_W, 8).fill(AMBER);
  doc.font("Helvetica-Bold").fontSize(22).fillColor(DARK).text(name || "", L, 18);
  doc.rect(L, doc.y + 4, 50, 2).fill(AMBER);
  if (title) doc.font("Helvetica").fontSize(11).fillColor("#6b7280").text(title, L, doc.y + 8);
  const cp = [contact?.phone, contact?.email, contact?.location].filter(Boolean);
  if (cp.length) doc.font("Helvetica").fontSize(8.5).fillColor("#6b7280").text(cp.join("  |  "), L, doc.y + 4);
  doc.rect(0, doc.y + 10, PAGE_W, 1).fill(AMBER);
  doc.y = doc.y + 18;

  if (summary?.trim()) {
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(DARK).text("PROFILE", L, doc.y);
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(9.5).fillColor("#374151").text(summary, L, doc.y, { width: CONTENT_W, lineGap: 2 });
    doc.moveDown(0.8);
  }
  if (skills.length > 0) {
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(DARK).text("SKILLS", L, doc.y);
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(9).fillColor("#374151").text(skills.join("   |   "), L, doc.y, { width: CONTENT_W });
    doc.moveDown(0.8);
  }
  if (experience?.length > 0) {
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(DARK).text("EXPERIENCE", L, doc.y);
    doc.moveDown(0.4);
    experience.forEach((job: any) => {
      if (doc.y > PAGE_H - 100) { doc.addPage(); doc.y = 40; }
      experienceBlock(doc, job, CONTENT_W);
    });
  }
  if (education?.length > 0) {
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(DARK).text("EDUCATION", L, doc.y);
    doc.moveDown(0.3);
    education.forEach((edu: any) => {
      doc.font("Helvetica-Bold").fontSize(9).fillColor(DARK).text([edu.degree, edu.school].filter(Boolean).join(" — "), L, doc.y);
      if (edu.year) doc.font("Helvetica").fontSize(8.5).fillColor("#6b7280").text(edu.year, L, doc.y + 1);
      doc.moveDown(0.5);
    });
  }
}

// ── 9. Modern Professional (premium — indigo accent) ─────────────────────────

export function drawModernProfessionalPDF(doc: any, data: any) {
  const { name, title, contact, summary, experience, education } = data;
  const skills = getSkills(data);
  const GRAY = "#374151"; const ACCENT = "#6366f1";

  doc.font("Helvetica-Bold").fontSize(22).fillColor(GRAY).text(name || "", L, 24);
  doc.rect(L, doc.y + 4, 50, 2).fill(ACCENT);
  if (title) doc.font("Helvetica").fontSize(11).fillColor(GRAY).text(title, L, doc.y + 8);
  const cp = [contact?.phone, contact?.email, contact?.location].filter(Boolean);
  if (cp.length) doc.font("Helvetica").fontSize(8.5).fillColor("#6b7280").text(cp.join("  |  "), L, doc.y + 4);
  doc.y = doc.y + 16;

  if (summary?.trim()) {
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(ACCENT).text("ABOUT", L, doc.y);
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(9.5).fillColor(GRAY).text(summary, L, doc.y, { width: CONTENT_W, lineGap: 2 });
    doc.moveDown(0.8);
  }
  if (skills.length > 0) {
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(ACCENT).text("SKILLS", L, doc.y);
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(9).fillColor(GRAY).text(skills.join("   |   "), L, doc.y, { width: CONTENT_W });
    doc.moveDown(0.8);
  }
  if (experience?.length > 0) {
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(ACCENT).text("EXPERIENCE", L, doc.y);
    doc.moveDown(0.4);
    experience.forEach((job: any) => {
      if (doc.y > PAGE_H - 100) { doc.addPage(); doc.y = 40; }
      experienceBlock(doc, job, CONTENT_W);
    });
  }
  if (education?.length > 0) {
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(ACCENT).text("EDUCATION", L, doc.y);
    doc.moveDown(0.3);
    education.forEach((edu: any) => {
      doc.font("Helvetica-Bold").fontSize(9).fillColor(GRAY).text([edu.degree, edu.school].filter(Boolean).join(" — "), L, doc.y);
      if (edu.year) doc.font("Helvetica").fontSize(8.5).fillColor("#9ca3af").text(edu.year, L, doc.y + 1);
      doc.moveDown(0.5);
    });
  }
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
