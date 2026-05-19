// lib/ats/scoring/career_pivot.ts
//
// Career Pivot Mode — detects when the user is targeting a different role
// than their current title and offers specific bullet rewrites that translate
// their existing experience into the language of the target role.
//
// No hallucinations: every rewrite is grounded in the user's actual bullets.
// No lying: we reframe, not fabricate.

import OpenAI from "openai";

export interface PivotRewrite {
  original:     string;   // their actual bullet
  rewritten:    string;   // same achievement in target role language
  explanation:  string;   // why this maps (1 sentence)
  experienceId: string;   // which job
  bulletIndex:  number;   // which bullet
  bulletType:   "responsibility" | "achievement";
}

export interface CareerPivotResult {
  is_pivot:        boolean;         // did we detect a role mismatch?
  pivot_summary:   string;          // e.g. "Your PM background translates well to CSM"
  target_role:     string;          // extracted from JD
  current_role:    string;          // from resume title
  rewrites:        PivotRewrite[];  // up to 4 specific bullet rewrites
  summary_rewrite: string | null;   // optional: rewritten summary for target role
}

export async function detectAndPivot(
  client: OpenAI,
  resumeData: any,
  jobDescription: string,
  locale: string = "en"
): Promise<CareerPivotResult> {
  const isEN = locale !== "pt-BR";

  const currentTitle  = resumeData?.personalInfo?.tradeTitle || resumeData?.title || "";
  const currentSummary = resumeData?.summary || "";
  const experience    = resumeData?.experience || [];

  // Build a concise resume snapshot for the AI
  const resumeSnapshot = buildSnapshot(resumeData);

  const systemPrompt = isEN ? `You are a career transition specialist. You help professionals reframe their existing experience for new target roles.

RULES:
1. DETECT PIVOT: Is the target role genuinely different from the candidate's current role?
   Same family = NOT a pivot (Senior PM → Principal PM, PM → Program Manager)
   Different domain = PIVOT (PM → CSM, Engineer → Product Manager, Nurse → Healthcare Admin)

2. REWRITE BULLETS — grounded in reality:
   - Read the candidate's actual bullets
   - Reframe the SAME achievement using the target role's language and metrics
   - Do NOT invent new achievements — only reframe what's already there
   - Show the transferable value explicitly

3. SUMMARY REWRITE — if pivoting:
   - Rewrite the summary to lead with transferable value for the target role
   - Keep actual years of experience and real achievements
   - Neutral professional format, no pronouns

4. NO HALLUCINATIONS — only use facts from the resume snapshot provided

Return JSON:
{
  "is_pivot": true/false,
  "pivot_summary": "1-2 sentence explanation of how their background transfers",
  "target_role": "extracted job title from JD",
  "current_role": "${currentTitle}",
  "rewrites": [
    {
      "original": "exact original bullet text",
      "rewritten": "same achievement reframed in target role language",
      "explanation": "why this maps — 1 sentence",
      "experience_id": "job id from snapshot",
      "bullet_index": 0,
      "bullet_type": "responsibility"
    }
  ],
  "summary_rewrite": "full rewritten summary for target role, or null if not a pivot"
}`
  : `Você é um especialista em transição de carreira. Ajuda profissionais a reformular sua experiência para novas funções-alvo.
Detecte se a vaga é uma transição de carreira genuína. Se sim, reformule até 4 bullets e o resumo profissional.
Retorne JSON com: is_pivot, pivot_summary, target_role, current_role, rewrites[], summary_rewrite`;

  try {
    const completion = await client.chat.completions.create({
      model:           "gpt-4o",
      temperature:     0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `JOB DESCRIPTION:\n${jobDescription}\n\n---\nCANDIDATE RESUME SNAPSHOT:\n${resumeSnapshot}` },
      ],
    });

    const raw = JSON.parse(completion.choices[0]?.message?.content || "{}");
    if (!raw.is_pivot) return { is_pivot: false, pivot_summary: "", target_role: "", current_role: currentTitle, rewrites: [], summary_rewrite: null };

    // Map rewrites, attaching real store references
    const rewrites: PivotRewrite[] = (raw.rewrites || []).slice(0, 4).map((r: any) => {
      // Find the matching bullet in the actual store
      const { expId, bulletIdx, bulletType } = findBullet(experience, r.original);
      return {
        original:     String(r.original || ""),
        rewritten:    String(r.rewritten || ""),
        explanation:  String(r.explanation || ""),
        experienceId: expId,
        bulletIndex:  bulletIdx,
        bulletType,
      };
    }).filter((r: PivotRewrite) => r.rewritten && r.original);

    return {
      is_pivot:        true,
      pivot_summary:   String(raw.pivot_summary || ""),
      target_role:     String(raw.target_role || ""),
      current_role:    currentTitle,
      rewrites,
      summary_rewrite: raw.summary_rewrite ? String(raw.summary_rewrite) : null,
    };
  } catch {
    return { is_pivot: false, pivot_summary: "", target_role: "", current_role: currentTitle, rewrites: [], summary_rewrite: null };
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildSnapshot(resumeData: any): string {
  const p = resumeData?.personalInfo || {};
  const lines: string[] = [];
  lines.push(`Title: ${p.tradeTitle || resumeData?.title || "unknown"}`);
  if (resumeData?.summary) lines.push(`Summary: ${resumeData.summary}`);

  const exp = resumeData?.experience || [];
  exp.slice(0, 3).forEach((job: any, ji: number) => {
    lines.push(`\nJob ${ji} (id: ${job.id || ji}): ${job.jobTitle} at ${job.company}`);
    const bullets = [
      ...(job.responsibilities || []).map((b: any, i: number) => ({ text: typeof b === "string" ? b : b.text, type: "responsibility", idx: i })),
      ...(job.achievements     || []).map((b: any, i: number) => ({ text: typeof b === "string" ? b : b.text, type: "achievement",   idx: i })),
    ].filter((b: any) => b.text?.trim());
    bullets.forEach((b: any) => lines.push(`  [${b.type}:${b.idx}] ${b.text}`));
  });

  return lines.join("\n");
}

function findBullet(experience: any[], originalText: string): { expId: string; bulletIdx: number; bulletType: "responsibility" | "achievement" } {
  for (const job of experience) {
    const resp = (job.responsibilities || []);
    for (let i = 0; i < resp.length; i++) {
      const text = typeof resp[i] === "string" ? resp[i] : resp[i]?.text || "";
      if (text && originalText?.includes(text.slice(0, 30))) {
        return { expId: job.id, bulletIdx: i, bulletType: "responsibility" };
      }
    }
    const ach = (job.achievements || []);
    for (let i = 0; i < ach.length; i++) {
      const text = typeof ach[i] === "string" ? ach[i] : ach[i]?.text || "";
      if (text && originalText?.includes(text.slice(0, 30))) {
        return { expId: job.id, bulletIdx: i, bulletType: "achievement" };
      }
    }
  }
  return { expId: experience[0]?.id || "", bulletIdx: 0, bulletType: "responsibility" };
}
