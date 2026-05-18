export const dynamic = "force-dynamic";

// /api/ai/br/ats-analyze
// Thin HTTP wrapper. All logic lives in /lib/ats/.
// Brazil only — no US usage.

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { runWithJob }  from "@/lib/ats/modes/with_job";
import { runGeneral }  from "@/lib/ats/modes/general";
import { runRecruiterAssessment } from "@/lib/ats/scoring/recruiter_assessment";
import { cleanExtractedText } from "@/lib/ats/utils/text_cleaning";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI não configurado." }, { status: 500 });
    }

    const body = await req.json();
    const {
      resumeText,
      jobDescription,
      candidateName,
      jobTitle,
      companyName,
      date,
      profession,
    } = body;

    if (!resumeText?.trim()) {
      return NextResponse.json(
        { error: "Campo obrigatório ausente: resumeText." },
        { status: 400 }
      );
    }

    const client   = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const resume   = cleanExtractedText(resumeText);
    const hasJob   = !!(jobDescription?.trim());

    if (hasJob) {
      // MODE A — Smart recruiter assessment (GPT-4o reads both documents as a human recruiter)
      // This replaces rigid keyword matching with genuine compatibility analysis.
      const cleanedJD = cleanExtractedText(jobDescription);
      const locale    = body.locale || "en";

      const assessment = await runRecruiterAssessment(client, resume, cleanedJD, locale);

      // Map to the output shape the UI expects
      return NextResponse.json({
        mode:                  "with_job",
        final_ats_score:       assessment.overall_score,
        strength_label:        scoreToLabel(assessment.overall_score, locale),
        skills_coverage_score: assessment.skills_found.length > 0
          ? Math.round((assessment.skills_found.length / (assessment.skills_found.length + assessment.skills_missing.length)) * 100)
          : null,
        semantic_match_score:  null,
        structure_score:       null,
        skills_found:          assessment.skills_found,
        skills_missing:        assessment.skills_missing,
        match_summary:         assessment.match_summary,
        suggestions_pt_br:     assessment.improvements,
        suggestions:           assessment.improvements,
        specific_enhancements: [
          ...assessment.strengths.map(s => `✓ ${s}`),
          ...assessment.gaps.map(g => `⚠ ${g}`),
        ],
        raw_extraction: {},
      });
    } else {
      // MODE B — General strength analysis with profession benchmark
      const result = await runGeneral(client, {
        resumeText:    resume,
        candidateName,
        profession:    profession || null,
        locale:        body.locale || null,
      });
      return NextResponse.json(result);
    }

  } catch (err: any) {
    const detail = err?.message || String(err);
    console.error("br/ats-analyze error:", detail);
    return NextResponse.json({ error: "Análise falhou.", detail }, { status: 500 });
  }
}

function scoreToLabel(score: number, locale: string): string {
  const isEN = locale !== "pt-BR";
  if (score >= 75) return isEN ? "Strong"            : "Forte";
  if (score >= 55) return isEN ? "Good"              : "Mediano";
  if (score >= 35) return isEN ? "Building"          : "Em desenvolvimento";
  return                  isEN ? "Needs Improvement" : "Precisa de ajustes";
}
