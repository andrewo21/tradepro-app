export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { checkRateLimit, getIP } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const { allowed, retryAfter } = await checkRateLimit(`ai:${getIP(req)}`, 20, 60);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down and try again." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI not configured." }, { status: 500 });
    }

    const { jobDescription, currentSummary, skills, experience } = await req.json();

    if (!jobDescription?.trim()) {
      return NextResponse.json({ error: "Job description is required." }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const resumeContext = [
      currentSummary ? `CURRENT SUMMARY:\n${currentSummary}` : "",
      skills?.length ? `SKILLS:\n${skills.map((s: any) => s.text || s).filter(Boolean).join(", ")}` : "",
      experience?.length
        ? `EXPERIENCE:\n${experience.map((e: any) =>
            `${e.jobTitle} at ${e.company}\n${[...(e.responsibilities || []), ...(e.achievements || [])].map((b: any) => b.text || b).filter(Boolean).join("\n")}`
          ).join("\n\n")}`
        : "",
    ].filter(Boolean).join("\n\n");

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert ATS (Applicant Tracking System) optimization specialist for skilled trades and construction industries.

Analyze a job description against a candidate's resume and provide:
1. HIGH-PRIORITY keywords from the job description that are MISSING from the resume
2. Keywords already PRESENT in the resume
3. A fully rewritten professional summary incorporating the most critical missing keywords — staying true to the candidate's real experience
4. 2-3 specific bullet point suggestions to add or strengthen
5. A list of SMART SKILL ADDITIONS — keywords from the missing list that are genuinely supported by the candidate's actual experience. These must be skills the candidate demonstrably has based on their work history. Format as clean ATS skill phrases (e.g. "Project Cost Management", "OSHA 30 Compliance"). Maximum 6 skills.

Rules:
- NEVER fabricate experience or suggest skills the candidate doesn't have
- Smart skill additions must be directly evidenced by their job history or implied by their trade/role
- Write in professional English, no first-person pronouns
- ATS keywords should feel natural, not keyword-stuffed
- Focus on construction/trades industry terminology
- Return ONLY valid JSON in this exact format:
{
  "missingKeywords": ["keyword1", "keyword2"],
  "presentKeywords": ["keyword1", "keyword2"],
  "optimizedSummary": "...",
  "bulletSuggestions": ["suggestion1", "suggestion2"],
  "smartSkillAdditions": ["Skill Phrase 1", "Skill Phrase 2"]
}`,
        },
        {
          role: "user",
          content: `JOB DESCRIPTION:\n${jobDescription}\n\n---\n\nCANDIDATE RESUME:\n${resumeContext || "No resume content provided yet."}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices?.[0]?.message?.content || "{}";
    const result = JSON.parse(raw);

    return NextResponse.json({
      missingKeywords: result.missingKeywords || [],
      presentKeywords: result.presentKeywords || [],
      optimizedSummary: result.optimizedSummary || "",
      bulletSuggestions: result.bulletSuggestions || [],
      smartSkillAdditions: result.smartSkillAdditions || [],
    });
  } catch (err: any) {
    const detail = err?.message || String(err);
    console.error("match-job error:", detail);
    return NextResponse.json({ error: "Job match failed.", detail }, { status: 500 });
  }
}
