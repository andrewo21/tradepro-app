// lib/ats/live/liveAtsScore.ts
// Deterministic resume strength scorer.
// Calibration targets:
//   Empty resume      → ~5
//   Name + title only → ~15
//   Basic info filled → ~25
//   Decent resume     → ~40-50
//   Strong resume     → ~60-70
//   With job match    → up to 88

export interface LiveAtsFlag {
  field:    string;
  message:  string;
  severity: "error" | "warning" | "info";
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
  score:     number;
  flags:     LiveAtsFlag[];
  breakdown: LiveAtsBreakdown;
  label:     "Needs Work" | "Building" | "Good" | "Strong";
}

const BASE          = 5;
const CAP_NO_JD     = 72;   // hard cap without job description
const CAP_WITH_JD   = 88;   // Job Target Compare can push to here

function hasMetrics(text: string): boolean {
  return /[\d$%]/.test(text);
}

function hasActionVerb(text: string): boolean {
  return /^(led|managed|built|created|developed|designed|improved|increased|reduced|delivered|executed|implemented|oversaw|directed|coordinated|spearheaded|launched|established|achieved|generated|saved|grew|trained|mentored|supervised|negotiated|secured|optimized|streamlined|deployed|maintained|operated|inspected|repaired|installed|configured|troubleshot|handled|completed|performed|resolved|supported|produced)/i
    .test(text.trim());
}

export function computeLiveAtsScore(store: any): LiveAtsResult {
  let raw = BASE;
  const flags: LiveAtsFlag[] = [];
  const bd: LiveAtsBreakdown = {
    personal: 0, summary: 0, experience: 0,
    skills:   0, education: 0, certifications: 0,
  };

  // ── Personal (max 9) ──────────────────────────────────────────────────────
  const p = store.personalInfo || {};
  if (p.firstName && p.lastName) { raw += 2.5; bd.personal += 2.5; }
  else flags.push({ field: "personalInfo.firstName", message: "Full name is missing", severity: "error" });

  if (p.tradeTitle) { raw += 2.5; bd.personal += 2.5; }
  else flags.push({ field: "personalInfo.tradeTitle", message: "Professional title is missing", severity: "error" });

  if (p.phone)    { raw += 1;   bd.personal += 1;   }
  if (p.email)    { raw += 1;   bd.personal += 1;   }
  if (p.city)     { raw += 0.5; bd.personal += 0.5; }
  if (p.linkedin) { raw += 1.5; bd.personal += 1.5; }
  else flags.push({ field: "personalInfo.linkedin", message: "LinkedIn URL missing — adds trust with recruiters", severity: "warning" });

  // ── Summary (max 9) ───────────────────────────────────────────────────────
  const summary     = store.summary || "";
  const wordCount   = summary.trim().split(/\s+/).filter(Boolean).length;

  if (wordCount >= 15)  { raw += 3;   bd.summary += 3;   }
  if (wordCount >= 45)  { raw += 3;   bd.summary += 3;   }
  if (hasMetrics(summary)) { raw += 3; bd.summary += 3; }
  if (wordCount === 0)  flags.push({ field: "summary", message: "Professional summary is empty", severity: "error" });
  else if (wordCount < 45) flags.push({ field: "summary", message: `Summary is ${wordCount} words — aim for 45+`, severity: "warning" });

  // ── Experience (max 28) ───────────────────────────────────────────────────
  const experience = (store.experience || []) as any[];
  let expPts = 0;

  for (const [i, job] of experience.slice(0, 3).entries()) {
    const label = job.jobTitle ? `"${job.jobTitle}"` : `Job ${i + 1}`;

    if (job.jobTitle && job.company) expPts += 2;
    else if (!job.jobTitle) flags.push({
      field: `experience[${i}].jobTitle`,
      message: `${label}: job title missing — Missing Data`,
      severity: "error",
    });

    if (job.startDate && job.endDate) expPts += 1.5;
    else {
      if (!job.startDate) flags.push({ field: `experience[${i}].startDate`, message: `${label}: start date missing — Missing Data`, severity: "error" });
      if (!job.endDate)   flags.push({ field: `experience[${i}].endDate`,   message: `${label}: end date missing — Missing Data`,   severity: "error" });
    }

    const bullets = [
      ...(job.responsibilities || []),
      ...(job.achievements || []),
    ].filter((b: any) => b.text?.trim());

    if (bullets.length === 0) {
      flags.push({ field: `experience[${i}].bullets`, message: `${label}: no bullet points added`, severity: "warning" });
    }

    for (const b of bullets.slice(0, 5)) {
      expPts += 0.8;
      if (hasActionVerb(b.text)) expPts += 0.5;
      if (hasMetrics(b.text))    expPts += 1.5;
      else flags.push({ field: `experience[${i}].bullet`, message: `${label}: bullet has no metrics — add a number or $/%`, severity: "info" });
    }
  }

  expPts = Math.min(28, Math.round(expPts));
  raw   += expPts;
  bd.experience = expPts;

  // ── Skills (max 7) ────────────────────────────────────────────────────────
  const skills      = (store.skills || []).filter((s: any) => s.text?.trim());
  const skillPts    = Math.min(7, Math.round(skills.length * 0.7));
  raw              += skillPts;
  bd.skills         = skillPts;
  if (skills.length < 5) flags.push({ field: "skills", message: `Only ${skills.length} skill(s) — aim for 8–12`, severity: "warning" });

  // ── Education (max 5) ─────────────────────────────────────────────────────
  const edu = (store.education || []).filter((e: any) => e.school?.trim() || e.degree?.trim());
  if (edu.length === 0) flags.push({ field: "education", message: "Education section is empty", severity: "warning" });
  else {
    raw += 3; bd.education = 3;
    if (edu[0]?.school && edu[0]?.degree) { raw += 2; bd.education += 2; }
  }

  // ── Certifications (max 4) ────────────────────────────────────────────────
  const certs    = (store.certifications || []).filter((c: any) => c.text?.trim());
  const certPts  = Math.min(4, certs.length * 2);
  raw           += certPts;
  bd.certifications = certPts;

  // ── Final ─────────────────────────────────────────────────────────────────
  const score = Math.max(BASE, Math.min(CAP_NO_JD, Math.round(raw)));
  const label: LiveAtsResult["label"] =
    score >= 58 ? "Strong"   :
    score >= 42 ? "Good"     :
    score >= 25 ? "Building" : "Needs Work";

  return { score, flags, breakdown: bd, label };
}

export const ATS_CAP_NO_JD   = CAP_NO_JD;
export const ATS_CAP_WITH_JD = CAP_WITH_JD;

export function atsLabelColor(label: LiveAtsResult["label"]): string {
  switch (label) {
    case "Strong":   return "#16a34a";
    case "Good":     return "#d97706";
    case "Building": return "#2563eb";
    default:         return "#dc2626";
  }
}
