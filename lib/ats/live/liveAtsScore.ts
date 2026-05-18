// lib/ats/live/liveAtsScore.ts
// Proportionate ATS scoring. Starts at 0. Every real improvement moves the number.
//
// Design principles:
//   - 0 on a blank resume. No participation trophies.
//   - Quality of content matters, not just presence.
//   - A weak bullet scores less than a strong one.
//   - Max 80 without a job description.
//   - With JD comparison (Step 7): up to 95.

export interface LiveAtsFlag {
  field:    string;
  message:  string;
  severity: "error" | "warning" | "info";
  step:     string;   // which step this flag belongs to
}

export interface LiveAtsBreakdown {
  personal:       number;
  summary:        number;
  experience:     number;
  skills:         number;
  education:      number;
  certifications: number;
}

export interface LiveAtsResult {
  score:     number;          // 0–80 (95 with JD match)
  flags:     LiveAtsFlag[];
  breakdown: LiveAtsBreakdown;
  label:     "Not Started" | "Weak" | "Building" | "Good" | "Strong";
}

const CAP = 100;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hasMetrics(text: string): boolean {
  return /[\d$%]/.test(text);
}

function hasActionVerb(text: string): boolean {
  return /^(led|managed|built|created|developed|designed|improved|increased|reduced|delivered|executed|implemented|oversaw|directed|coordinated|spearheaded|launched|established|achieved|generated|saved|grew|trained|mentored|supervised|negotiated|secured|optimized|streamlined|deployed|maintained|operated|inspected|repaired|installed|configured|resolved|handled|completed|produced|supported|performed|coordinated|facilitated|administered|analyzed|planned|overseeded|motivated|recruited|evaluated)/i
    .test(text.trim());
}

function bulletQuality(text: string): number {
  if (!text.trim()) return 0;
  let pts = 0.5;                              // exists
  if (text.trim().length > 30) pts += 0.5;   // has substance
  if (hasActionVerb(text))     pts += 1.0;   // starts with action verb
  if (hasMetrics(text))        pts += 2.0;   // has numbers/$ (highest reward)
  return pts;
}

// ─── Main scorer ──────────────────────────────────────────────────────────────

export function computeLiveAtsScore(store: any): LiveAtsResult {
  const flags: LiveAtsFlag[] = [];
  const bd: LiveAtsBreakdown = {
    personal: 0, summary: 0, experience: 0,
    skills:   0, education: 0, certifications: 0,
  };

  // ── PERSONAL (max 12) ─────────────────────────────────────────────────────
  const p = store.personalInfo || {};
  if (p.firstName && p.lastName) { bd.personal += 5; }
  else flags.push({ field: "personalInfo.firstName", message: "Full name is missing", severity: "error", step: "personal" });

  if (p.tradeTitle) { bd.personal += 5; }
  else flags.push({ field: "personalInfo.tradeTitle", message: "Professional title is missing", severity: "error", step: "personal" });

  if (p.phone) bd.personal += 1.5;
  if (p.email) bd.personal += 1.5;
  if (p.city)  bd.personal += 1;
  if (p.linkedin) { bd.personal += 2.5; }
  else flags.push({ field: "personalInfo.linkedin", message: "LinkedIn URL missing — adds credibility", severity: "warning", step: "personal" });

  // ── SUMMARY (max 15) ──────────────────────────────────────────────────────
  const summary    = store.summary || "";
  const wordCount  = summary.trim().split(/\s+/).filter(Boolean).length;

  if (wordCount >= 10)  bd.summary += 4;
  if (wordCount >= 35)  bd.summary += 5;
  if (wordCount >= 60)  bd.summary += 2;
  if (hasMetrics(summary)) bd.summary += 5;

  // Bonus: mentions job title
  const titleWords = (p.tradeTitle || "").toLowerCase().split(/\s+/).filter(Boolean);
  if (titleWords.length > 0 && titleWords.some(w => w.length > 3 && summary.toLowerCase().includes(w))) {
    bd.summary += 2;
  }

  if (wordCount === 0) flags.push({ field: "summary", message: "Professional summary is empty", severity: "error", step: "summary" });
  else if (wordCount < 35) flags.push({ field: "summary", message: `Summary is ${wordCount} words — aim for 40+`, severity: "warning", step: "summary" });
  if (!hasMetrics(summary) && wordCount > 0) flags.push({ field: "summary", message: "Summary has no numbers — add one metric", severity: "info", step: "summary" });

  // ── EXPERIENCE (max 35) ───────────────────────────────────────────────────
  const experience = (store.experience || []) as any[];
  let expRaw = 0;

  for (const [i, job] of experience.slice(0, 4).entries()) {
    const label = job.jobTitle ? `"${job.jobTitle}"` : `Job ${i + 1}`;

    if (job.jobTitle && job.company) expRaw += 2;
    else if (!job.jobTitle) flags.push({ field: `experience[${i}].jobTitle`, message: `${label}: job title missing`, severity: "error", step: "experience" });

    if (job.startDate && job.endDate) expRaw += 1.5;
    else {
      if (!job.startDate) flags.push({ field: `experience[${i}].startDate`, message: `${label}: start date missing`, severity: "error", step: "experience" });
      if (!job.endDate)   flags.push({ field: `experience[${i}].endDate`,   message: `${label}: end date missing`,   severity: "error", step: "experience" });
    }

    const bullets = [
      ...(job.responsibilities || []),
      ...(job.achievements     || []),
    ].filter((b: any) => b.text?.trim());

    if (bullets.length === 0) {
      flags.push({ field: `experience[${i}].bullets`, message: `${label}: no bullet points yet`, severity: "warning", step: "experience" });
    }

    let bulletScore = 0;
    for (const b of bullets.slice(0, 8)) {
      bulletScore += bulletQuality(b.text);
    }
    expRaw += Math.min(10, bulletScore); // up to 8 pts per job from bullet quality

    // Warn on vague bullets
    const vagueCount = bullets.filter((b: any) => !hasMetrics(b.text) && !hasActionVerb(b.text)).length;
    if (vagueCount > 1) flags.push({ field: `experience[${i}].bullets`, message: `${label}: ${vagueCount} bullets are vague — add action verbs and numbers`, severity: "info", step: "experience" });
  }

  bd.experience = Math.min(44, Math.round(expRaw));

  // ── SKILLS (max 10) ───────────────────────────────────────────────────────
  const skills = (store.skills || []).filter((s: any) => s.text?.trim());
  // Proportionate: each skill = 0.8 pts, max 10
  bd.skills = Math.min(12, Math.round(skills.length * 1.0));
  if (skills.length === 0) flags.push({ field: "skills", message: "No skills listed", severity: "warning", step: "skills" });
  else if (skills.length < 5) flags.push({ field: "skills", message: `Only ${skills.length} skill(s) — aim for 8–12`, severity: "warning", step: "skills" });

  // ── EDUCATION (max 8) ─────────────────────────────────────────────────────
  const edu = (store.education || []).filter((e: any) => e.school?.trim() || e.degree?.trim());
  if (edu.length === 0) flags.push({ field: "education", message: "Education section is empty", severity: "warning", step: "education" });
  else {
    bd.education += 5;
    if (edu[0]?.school && edu[0]?.degree) bd.education += 5;
  }

  // ── CERTIFICATIONS (max 5) ────────────────────────────────────────────────
  const certs = (store.certifications || []).filter((c: any) => c.text?.trim());
  bd.certifications = Math.min(6, certs.length * 3);

  // ── FINAL ─────────────────────────────────────────────────────────────────
  const raw = bd.personal + bd.summary + bd.experience + bd.skills + bd.education + bd.certifications;
  const score = Math.min(CAP, Math.round(raw));

  const label: LiveAtsResult["label"] =
    score === 0              ? "Not Started" :
    score < 20              ? "Weak"        :
    score < 42              ? "Building"    :
    score < 62              ? "Good"        : "Strong";

  return { score, flags, breakdown: bd, label };
}

export const ATS_CAP   = CAP;
export const ATS_CAP_JD = 95;

export function atsLabelColor(label: LiveAtsResult["label"]): string {
  switch (label) {
    case "Strong":      return "#16a34a";
    case "Good":        return "#d97706";
    case "Building":    return "#2563eb";
    case "Weak":        return "#dc2626";
    default:            return "#9ca3af"; // Not Started
  }
}
