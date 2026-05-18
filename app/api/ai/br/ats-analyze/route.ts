export const dynamic = "force-dynamic";

// /api/ai/br/ats-analyze
// Thin HTTP wrapper. All logic lives in /lib/ats/.
// Brazil only — no US usage.

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { runWithJob }  from "@/lib/ats/modes/with_job";
import { runGeneral }  from "@/lib/ats/modes/general";
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
      // MODE A — Full ATS analysis with job description
      const result = await runWithJob(client, {
        resumeText:     resume,
        jobDescription: cleanExtractedText(jobDescription),
        candidateName,
        jobTitle,
        companyName,
        date,
        locale:          body.locale || null,
        candidateTitle:  body.candidateTitle || null,
      });
      return NextResponse.json(result);
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
