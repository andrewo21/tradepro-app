// lib/ats/live/liveAtsScore.ts
// Pure deterministic resume strength scorer.
// No AI. No randomness. Same input = same output.
// Starts at 15. Caps at 88 without job description.
// Job Target Compare (Step 7) can push to 95.

export interface LiveAtsFlag {
  field: string;
  message: string;
  severity: "error" | "warning" | "info";
}

export interface LiveAtsBreakdown {
  personal:      number;
  summary:       number;
  experience:    number;
  skills:        number;
  education:     number;
  certifications: number;
}

export interface LiveAtsResult {
  score:      number;          // 15–88 (95 with job match)
  flags:      LiveAtsFlag[];   // explicit "Missing Data" warnings
  breakdown:  LiveAtsBreakdown;
  label:      "Needs Work" | "Building" | "Good" | "Strong";
}

const BASE_SCORE = 15;
const CAP_WITHOUT_JD = 88;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hasMetrics(text: string): boolean {
  return /[\d$%]/.test(text);
}

function hasActionVerb(text: string): boolean {
  const verbs = /^(led|managed|built|created|developed|designed|improved|increased|reduced|delivered|executed|implemented|oversaw|directed|coordinated|spearheaded|launched|established|achieved|generated|saved|grew|trained|mentored|supervised|negotiated|secured|optimized|streamlined|deployed|maintained|operated|inspected|repaired|installed|configured|troubleshot)/i;
  return verbs.test(text.trim());
}

// ─── Main scorer ──────────────────────────────────────────────────────────────

export function computeLiveAtsScore(store: any): LiveAtsResult {
  let raw = BASE_SCORE;
  const flags: LiveAtsFlag[] = [];
  const breakdown: LiveAtsBreakdown = {
    personal: 0, summary: 0, experience: 0,
    skills: 0, education: 0, certifications: 0,
  };

  // ── Personal (max 12) ──────────────────────────────────────────────────────
  const p = store.personalInfo || {};
  if (p.firstName && p.lastName)  { raw += 3;  breakdown.personal += 3; }
  else flags.push({ field: "personalInfo.firstName", message: "Full name is missing", severity: "error" });

  if (p.tradeTitle) { raw += 4; breakdown.personal += 4; }
  else flags.push({ field: "personalInfo.tradeTitle", message: "Professional title is missing", severity: "error" });

  if (p.phone)    { raw += 1; breakdown.personal += 1; }
  if (p.email)    { raw += 1; breakdown.personal += 1; }
  if (p.city)     { raw += 1; breakdown.personal += 1; }
  if (p.linkedin) { raw += 2; breakdown.personal += 2; }
  else flags.push({ field: "personalInfo.linkedin", message: "LinkedIn URL missing — adds credibility", severity: "warning" });

  // ── Summary (max 13) ──────────────────────────────────────────────────────
  const summary = store.summary || "";
  const summaryWords = summary.trim().split(/\s+/).filter(Boolean).length;

  if (summaryWords >= 10)  { raw += 3;  breakdown.summary += 3;  }
  if (summaryWords >= 40)  { raw += 5;  breakdown.summary += 5;  }
  if (summaryWords >= 70)  { raw -= 2;  breakdown.summary -= 2;  } // too long
  if (hasMetrics(summary)) { raw += 3;  breakdown.summary += 3;  }
  if (summaryWords === 0)  {
    flags.push({ field: "summary", message: "Professional summary is empty", severity: "error" });
  } else if (summaryWords < 40) {
    flags.push({ field: "summary", message: `Summary too short (${summaryWords} words) — aim for 40–80`, severity: "warning" });
  }

  // ── Experience (max 35) ───────────────────────────────────────────────────
  const experience = (store.experience || []) as any[];
  let expPoints = 0;

  for (const [i, job] of experience.slice(0, 3).entries()) {
    const jobLabel = job.jobTitle ? `"${job.jobTitle}"` : `Job ${i + 1}`;

    if (job.jobTitle && job.company) { expPoints += 4; }
    else if (!job.jobTitle) {
      flags.push({ field: `experience[${i}].jobTitle`, message: `${jobLabel}: Job title is missing — Missing Data`, severity: "error" });
    }

    // Date validation
    if (job.startDate && (job.endDate || job.endDate === "Present")) {
      expPoints += 2;
    } else {
      if (!job.startDate) {
        flags.push({ field: `experience[${i}].startDate`, message: `${jobLabel}: Start date missing — Missing Data`, severity: "error" });
      }
      if (!job.endDate) {
        flags.push({ field: `experience[${i}].endDate`, message: `${jobLabel}: End date missing — Missing Data`, severity: "error" });
      }
    }

    // Bullet quality
    const bullets = [
      ...(job.responsibilities || []),
      ...(job.achievements || []),
    ].filter((b: any) => b.text?.trim());

    if (bullets.length === 0) {
      flags.push({ field: `experience[${i}].bullets`, message: `${jobLabel}: No bullet points added`, severity: "warning" });
    }

    for (const bullet of bullets.slice(0, 5)) {
      expPoints += 1;                            // existence
      if (hasActionVerb(bullet.text)) expPoints += 1;   // quality
      if (hasMetrics(bullet.text))    expPoints += 2;   // metrics bonus
    }
  }

  expPoints = Math.min(35, Math.round(expPoints));
  raw += expPoints;
  breakdown.experience = expPoints;

  // ── Skills (max 12) ───────────────────────────────────────────────────────
  const skills = (store.skills || []).filter((s: any) => s.text?.trim());
  if (skills.length < 5) {
    flags.push({ field: "skills", message: `Only ${skills.length} skill(s) — aim for 8–12`, severity: "warning" });
  }
  const skillPoints = Math.min(12, Math.round(skills.length * 1.2));
  raw += skillPoints;
  breakdown.skills = skillPoints;

  // ── Education (max 8) ─────────────────────────────────────────────────────
  const edu = (store.education || []).filter((e: any) => e.school?.trim() || e.degree?.trim());
  if (edu.length === 0) {
    flags.push({ field: "education", message: "Education section is empty", severity: "warning" });
  } else {
    raw += 5;
    breakdown.education = 5;
    if (edu[0]?.school && edu[0]?.degree) { raw += 3; breakdown.education += 3; }
  }

  // ── Certifications (max 6) ────────────────────────────────────────────────
  const certs = (store.certifications || []).filter((c: any) => c.text?.trim());
  const certPoints = Math.min(6, certs.length * 3);
  raw += certPoints;
  breakdown.certifications = certPoints;

  // ── Final score ───────────────────────────────────────────────────────────
  const score = Math.max(BASE_SCORE, Math.min(CAP_WITHOUT_JD, Math.round(raw)));

  const label: LiveAtsResult["label"] =
    score >= 75 ? "Strong"    :
    score >= 55 ? "Good"      :
    score >= 35 ? "Building"  : "Needs Work";

  return { score, flags, breakdown, label };
}

// ─── Label color helper ───────────────────────────────────────────────────────

export function atsLabelColor(label: LiveAtsResult["label"]): string {
  switch (label) {
    case "Strong":       return "#16a34a";
    case "Good":         return "#d97706";
    case "Building":     return "#2563eb";
    default:             return "#dc2626";
  }
}
