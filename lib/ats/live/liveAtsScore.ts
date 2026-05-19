// lib/ats/live/liveAtsScore.ts
//
// ATS scoring that matches how real ATS platforms work:
//   - Placement multipliers: keywords in title/summary score 3x
//   - Certification weighting: PMP-type certs score 2x a generic skill
//   - Bullet quality: metrics-driven bullets score more than vague ones
//   - General cap at 75: above 75 requires job description comparison
//   - 100 is only achievable with a strong job match

export interface LiveAtsFlag {
  field:    string;
  message:  string;
  severity: "error" | "warning" | "info";
  step:     string;
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
  label:     "Not Started" | "Weak" | "Building" | "Good" | "Strong";
}

// General analysis caps at 75 — above 75 requires job description
const GENERAL_CAP = 75;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hasMetrics(text: string): boolean {
  return /[\d$%]/.test(text);
}

function hasActionVerb(text: string): boolean {
  return /^(led|managed|built|created|developed|designed|improved|increased|reduced|delivered|executed|implemented|oversaw|directed|coordinated|spearheaded|launched|established|achieved|generated|saved|grew|trained|mentored|supervised|negotiated|secured|optimized|streamlined|deployed|maintained|operated|inspected|repaired|installed|resolved|handled|completed|produced|supported|coordinated|facilitated|administered|analyzed|planned|motivated|recruited|evaluated|directed)/i
    .test(text.trim());
}

// Placement multiplier — keyword in title/summary > skill list > buried bullet
function bulletScore(text: string): number {
  if (!text?.trim()) return 0;
  let pts = 0.5;                             // exists
  if (text.trim().length > 40)  pts += 0.5; // has substance
  if (hasActionVerb(text))      pts += 1.0; // action verb (placement: bullet level)
  if (hasMetrics(text))         pts += 2.5; // metrics (highest reward — matches recruiter weighting)
  return pts;
}

// Certifications score 2x a regular skill (matches real ATS weighting)
function isCertification(text: string): boolean {
  return /\b(pmp|osha|leed|cpa|cfa|aws|azure|gcp|cisco|comptia|mba|pe |p\.e\.|certified|certificate|license|six sigma|agile|scrum|prince2|itil|capm|cissp|ccna|rhce|mcse|ceh|cism|cisa|phr|sphr|shrm)\b/i
    .test(text);
}

// ─── Main scorer ──────────────────────────────────────────────────────────────

export function computeLiveAtsScore(store: any): LiveAtsResult {
  const flags: LiveAtsFlag[] = [];
  const bd: LiveAtsBreakdown = {
    personal: 0, summary: 0, experience: 0,
    skills:   0, education: 0, certifications: 0,
  };

  // ── PERSONAL (max 14) — placement: title in personal = 3x multiplier ──────
  const p = store.personalInfo || {};

  if (p.firstName && p.lastName) { bd.personal += 4; }
  else flags.push({ field: "personalInfo.firstName", message: "Full name is missing", severity: "error", step: "personal" });

  if (p.tradeTitle) {
    bd.personal += 6; // title placement multiplier — worth most of personal section
  } else {
    flags.push({ field: "personalInfo.tradeTitle", message: "Professional title is missing — this is a primary ATS keyword field", severity: "error", step: "personal" });
  }

  if (p.phone)    bd.personal += 1;
  if (p.email)    bd.personal += 1;
  if (p.city)     bd.personal += 0.5;
  if (p.linkedin) { bd.personal += 1.5; }
  else flags.push({ field: "personalInfo.linkedin", message: "LinkedIn URL adds credibility and searchability", severity: "warning", step: "personal" });

  // ── SUMMARY (max 18) — placement: summary is the highest-value section ─────
  // Real ATS gives 3x weight to keywords found in summary vs bullets
  const summary    = store.summary || "";
  const wordCount  = summary.trim().split(/\s+/).filter(Boolean).length;

  if (wordCount >= 10)  bd.summary += 4;
  if (wordCount >= 40)  bd.summary += 4;   // good length
  if (wordCount >= 60)  bd.summary += 2;   // strong length
  if (hasMetrics(summary)) bd.summary += 5; // metrics in summary = 3x multiplier

  // Placement bonus: does summary mention job title? (highest ATS value position)
  const titleWords = (p.tradeTitle || "").toLowerCase().split(/\s+/).filter(w => w.length > 3);
  if (titleWords.length > 0 && titleWords.some(w => summary.toLowerCase().includes(w))) {
    bd.summary += 3; // title in summary = strong placement signal
  }

  if (wordCount === 0) flags.push({ field: "summary", message: "Professional summary is empty — this is the highest-value ATS placement position", severity: "error", step: "summary" });
  else if (wordCount < 40) flags.push({ field: "summary", message: `Summary is ${wordCount} words — 40+ words with metrics scores significantly higher`, severity: "warning", step: "summary" });

  // ── EXPERIENCE (max 36) — quality-weighted, not just presence ─────────────
  const experience = (store.experience || []) as any[];
  let expRaw = 0;

  for (const [i, job] of experience.slice(0, 4).entries()) {
    const label = job.jobTitle ? `"${job.jobTitle}"` : `Job ${i + 1}`;

    // Title placement: job title is a key ATS field (2x multiplier for having title)
    if (job.jobTitle && job.company) {
      expRaw += 3; // title + company present
    } else if (!job.jobTitle) {
      flags.push({ field: `experience[${i}].jobTitle`, message: `${label}: job title missing — ATS cannot categorize this role`, severity: "error", step: "experience" });
    }

    if (job.startDate && job.endDate) {
      expRaw += 1.5;
    } else {
      if (!job.startDate) flags.push({ field: `experience[${i}].startDate`, message: `${label}: start date missing — ATS flags incomplete employment history`, severity: "error", step: "experience" });
      if (!job.endDate)   flags.push({ field: `experience[${i}].endDate`, message: `${label}: end date missing — ATS flags incomplete employment history`, severity: "error", step: "experience" });
    }

    const bullets = [
      ...(job.responsibilities || []),
      ...(job.achievements || []),
    ].filter((b: any) => b.text?.trim());

    if (bullets.length === 0) {
      flags.push({ field: `experience[${i}].bullets`, message: `${label}: no bullet points — ATS sees an empty role`, severity: "warning", step: "experience" });
    }

    // Quality-weighted bullet scoring
    let jobBulletScore = 0;
    for (const b of bullets.slice(0, 8)) {
      jobBulletScore += bulletScore(b.text);
    }
    expRaw += Math.min(10, jobBulletScore);

    // Flag vague bullets
    const vagueCount = bullets.filter((b: any) => b.text?.trim().length > 10 && !hasMetrics(b.text)).length;
    if (vagueCount > 2) {
      flags.push({ field: `experience[${i}].bullets`, message: `${label}: ${vagueCount} bullets have no numbers or metrics — these score poorly in ATS`, severity: "info", step: "experience" });
    }
  }

  bd.experience = Math.min(36, Math.round(expRaw));

  // ── SKILLS (max 10) — certifications 2x weight ────────────────────────────
  const skills = (store.skills || []).filter((s: any) => s.text?.trim());
  const certs  = (store.certifications || []).filter((c: any) => c.text?.trim());

  // Regular skills: each worth 0.7, max 8 pts
  const regularSkillPts = Math.min(8, skills.length * 0.7);
  // In-skill certifications (e.g., if someone lists PMP in skills): 1.4 pts each (2x)
  const certInSkills = skills.filter((s: any) => isCertification(s.text)).length;
  const certBonus    = Math.min(2, certInSkills * 0.7); // extra credit for certs in skills
  bd.skills = Math.min(10, Math.round(regularSkillPts + certBonus));

  if (skills.length === 0) flags.push({ field: "skills", message: "No skills listed — ATS cannot find keyword matches", severity: "warning", step: "skills" });
  else if (skills.length < 6) flags.push({ field: "skills", message: `Only ${skills.length} skills — most roles expect 8-12 relevant skills`, severity: "warning", step: "skills" });

  // ── EDUCATION (max 8) ─────────────────────────────────────────────────────
  const edu = (store.education || []).filter((e: any) => e.school?.trim() || e.degree?.trim());
  if (edu.length === 0) flags.push({ field: "education", message: "Education section is empty", severity: "warning", step: "education" });
  else {
    bd.education += 4;
    if (edu[0]?.school && edu[0]?.degree) bd.education += 4;
  }

  // ── CERTIFICATIONS (max 6) — 2x weight vs regular skills ─────────────────
  // Certifications are weighted 2x in real ATS systems
  bd.certifications = Math.min(6, Math.round(certs.length * 3));
  if (certs.length === 0) {
    // Only flag as info — not everyone has formal certs
    if (skills.length > 0) {
      flags.push({ field: "certifications", message: "No certifications listed — industry certs significantly boost ATS scores", severity: "info", step: "education" });
    }
  }

  // ── FINAL — cap at 75 without job description ─────────────────────────────
  const raw   = bd.personal + bd.summary + bd.experience + bd.skills + bd.education + bd.certifications;
  const score = Math.min(GENERAL_CAP, Math.round(raw));

  const label: LiveAtsResult["label"] =
    score === 0     ? "Not Started" :
    score < 25      ? "Weak"        :
    score < 50      ? "Building"    :
    score < 65      ? "Good"        : "Strong";

  return { score, flags, breakdown: bd, label };
}

export const ATS_GENERAL_CAP = GENERAL_CAP;
export const ATS_JD_CAP      = 100;

export function atsLabelColor(label: LiveAtsResult["label"]): string {
  switch (label) {
    case "Strong":      return "#16a34a";
    case "Good":        return "#d97706";
    case "Building":    return "#2563eb";
    case "Weak":        return "#dc2626";
    default:            return "#9ca3af";
  }
}
