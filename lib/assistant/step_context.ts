// lib/assistant/step_context.ts
// Builds a structured analysis of the current resume step.
// Pure functions — no AI, no side effects. Feeds the AI prompt.

import { computeLiveAtsScore } from "../ats/live/liveAtsScore";

export type BuilderStep =
  | "personal"
  | "experience"
  | "skills"
  | "education"
  | "summary"
  | "ats"
  | "preview"
  | "unknown";

export function pathToStep(pathname: string): BuilderStep {
  // US routes (English)
  if (pathname.includes("/personal"))   return "personal";
  if (pathname.includes("/experience")) return "experience";
  if (pathname.includes("/skills"))     return "skills";
  if (pathname.includes("/education"))  return "education";
  if (pathname.includes("/summary"))    return "summary";
  // BR routes (Portuguese) — map to same internal step names
  if (pathname.includes("/pessoal"))     return "personal";
  if (pathname.includes("/experiencia")) return "experience";
  if (pathname.includes("/habilidades")) return "skills";
  if (pathname.includes("/formacao"))    return "education";
  if (pathname.includes("/resumo"))      return "summary";
  // Shared
  if (pathname.includes("/ats"))        return "ats";
  if (pathname.includes("/preview"))    return "preview";
  return "unknown";
}

/** Shallow hash of resume state — used to skip re-analysis if nothing changed */
export function resumeHash(resumeData: Record<string, unknown>): string {
  try {
    const slim = {
      name: (resumeData.personalInfo as any)?.firstName,
      skills: (resumeData.skills as any[])?.length,
      expBullets: (resumeData.experience as any[])
        ?.flatMap((e: any) => [
          ...(e.responsibilities ?? []),
          ...(e.achievements ?? []),
        ])
        .filter((b: any) => b.text?.trim()).length,
      summary: ((resumeData.summary as string) || "").slice(0, 40),
    };
    return JSON.stringify(slim);
  } catch {
    return String(Date.now());
  }
}

// ─── Per-step data slices sent to AI ─────────────────────────────────────────

export function buildStepPayload(step: BuilderStep, resumeData: any, locale: string) {
  const firstName = resumeData?.personalInfo?.firstName || "there";
  const jobTitle  = resumeData?.personalInfo?.tradeTitle || "";

  // Live ATS score + all validation flags passed to CV-1 for full context
  const liveAts    = computeLiveAtsScore(resumeData);
  const globalFlags = liveAts.flags.map(f => `[${f.severity.toUpperCase()}] ${f.message}`);

  switch (step) {
    case "personal":
      return {
        step, firstName, jobTitle, locale,
        liveScore: liveAts.score,
        globalFlags,
        data:   { personalInfo: resumeData.personalInfo },
        issues: buildPersonalIssues(resumeData.personalInfo),
      };

    case "experience":
      return {
        step, firstName, jobTitle, locale,
        liveScore: liveAts.score,
        globalFlags,
        data: {
          experience: resumeData.experience?.map((job: any, idx: number) => ({
            id:           job.id,
            index:        idx,
            jobTitle:     job.jobTitle,
            company:      job.company,
            startDate:    job.startDate,
            endDate:      job.endDate,
            roleSummary:  job.roleSummary,
            // Label for display: "Job Title at Company"
            displayLabel: [job.jobTitle, job.company].filter(Boolean).join(" at ") || `Job ${idx + 1}`,
            responsibilities: (job.responsibilities || [])
              .filter((b: any) => b.text?.trim())
              .map((b: any) => b.text),
            achievements: (job.achievements || [])
              .filter((b: any) => b.text?.trim())
              .map((b: any) => b.text),
          })),
        },
        issues: buildExperienceIssues(resumeData.experience || []),
      };

    case "skills":
      return {
        step, firstName, jobTitle, locale,
        liveScore: liveAts.score,
        globalFlags,
        data: {
          skills: resumeData.skills?.map((s: any) => s.text).filter(Boolean) || [],
        },
        issues: buildSkillsIssues(resumeData.skills || []),
      };

    case "summary":
      return {
        step, firstName, jobTitle, locale,
        liveScore: liveAts.score,
        globalFlags,
        data: {
          summary: resumeData.summary || "",
          wordCount: (resumeData.summary || "").trim().split(/\s+/).filter(Boolean).length,
        },
        issues: buildSummaryIssues(resumeData.summary || "", jobTitle),
      };

    case "education":
      return {
        step, firstName, jobTitle, locale,
        liveScore: liveAts.score,
        globalFlags,
        data: {
          education:       resumeData.education || [],
          certifications:  resumeData.certifications || [],
        },
        issues: buildEducationIssues(resumeData.education || [], resumeData.certifications || []),
      };

    default:
      return { step, firstName, jobTitle, locale, data: {}, issues: [] };
  }
}

// ─── Issue detectors ──────────────────────────────────────────────────────────

function buildPersonalIssues(info: any): string[] {
  const issues: string[] = [];
  if (!info?.phone)    issues.push("Phone number is missing");
  if (!info?.linkedin) issues.push("LinkedIn URL is missing");
  if (!info?.city)     issues.push("City/location is missing");
  if (!info?.tradeTitle) issues.push("Professional title is missing");
  return issues;
}

function buildExperienceIssues(experience: any[]): string[] {
  const issues: string[] = [];
  if (!experience?.length) {
    issues.push("No work experience has been added yet");
    return issues;
  }

  let bulletsWithoutMetrics = 0;
  let shortBullets = 0;
  let emptyBullets = 0;

  for (const job of experience) {
    const allBullets = [
      ...(job.responsibilities || []),
      ...(job.achievements || []),
    ];
    const filledBullets = allBullets.filter((b: any) => b.text?.trim());

    if (filledBullets.length === 0) {
      issues.push(`Job "${job.jobTitle || "untitled"}" has no bullet points`);
    }

    for (const b of filledBullets) {
      const text = b.text as string;
      if (!/[\$%\d]/.test(text)) bulletsWithoutMetrics++;
      if (text.trim().split(/\s+/).length < 8) shortBullets++;
      if (!text.trim()) emptyBullets++;
    }

    if (!job.startDate) issues.push(`Missing start date for "${job.jobTitle || "untitled"}"`);
  }

  if (bulletsWithoutMetrics > 2)
    issues.push(`${bulletsWithoutMetrics} bullets lack metrics (numbers, %, $ values)`);
  if (shortBullets > 1)
    issues.push(`${shortBullets} bullets are too short — aim for 10+ words`);

  return issues;
}

function buildSkillsIssues(skills: any[]): string[] {
  const filled = skills.filter((s: any) => s.text?.trim());
  const issues: string[] = [];
  if (filled.length === 0) issues.push("No skills have been added yet");
  if (filled.length < 5)   issues.push("Less than 5 skills listed — aim for 8–12");
  if (filled.length > 0) {
    const generic = filled.filter((s: any) =>
      /^(communication|teamwork|leadership|hardworking|detail.oriented)$/i.test(s.text.trim())
    );
    if (generic.length > 0)
      issues.push(`${generic.length} skills are too generic and won't impress ATS systems`);
  }
  return issues;
}

function buildSummaryIssues(summary: string, jobTitle: string): string[] {
  const issues: string[] = [];
  const words = summary.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0)   issues.push("Professional summary is completely empty");
  if (words < 40)    issues.push("Summary is too short — aim for 50–80 words");
  if (words > 120)   issues.push("Summary is too long — keep it under 100 words for ATS");
  if (jobTitle && !summary.toLowerCase().includes(jobTitle.toLowerCase().split(" ")[0]))
    issues.push(`Summary doesn't mention your title "${jobTitle}"`);
  if (!/[\$%\d]/.test(summary)) issues.push("Summary has no metrics or numbers — add at least one");
  return issues;
}

function buildEducationIssues(education: any[], certifications: any[]): string[] {
  const issues: string[] = [];
  const filledEdu = education.filter((e: any) => e.school?.trim() || e.degree?.trim());
  const filledCerts = certifications.filter((c: any) => c.text?.trim());
  if (filledEdu.length === 0)  issues.push("No education information added");
  if (filledCerts.length === 0) issues.push("No certifications listed — these boost ATS scores significantly");
  return issues;
}
