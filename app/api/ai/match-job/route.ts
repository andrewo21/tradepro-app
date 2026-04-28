export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
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

Your job is to analyze a job description against a candidate's current resume content and provide:
1. A list of HIGH-PRIORITY keywords from the job description that are MISSING from the resume
2. A list of keywords that are already PRESENT in the resume (good matches)
3. A fully rewritten professional summary that naturally incorporates the most critical missing keywords while staying true to the candidate's real experience
4. 2-3 specific bullet point suggestions they should add or strengthen

Rules:
- Only suggest keywords that are genuinely relevant to the candidate's real experience — never fabricate experience
- Write in professional English, no first-person pronouns
- ATS keywords should feel natural, not keyword-stuffed
- Focus on construction/trades industry terminology
- Return ONLY valid JSON in this exact format with no other text:
{
  "missingKeywords": ["keyword1", "keyword2", ...],
  "presentKeywords": ["keyword1", "keyword2", ...],
  "optimizedSummary": "...",
  "bulletSuggestions": ["suggestion1", "suggestion2", "suggestion3"]
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
    });
  } catch (err: any) {
    const detail = err?.message || String(err);
    console.error("match-job error:", detail);
    return NextResponse.json({ error: "Job match failed.", detail }, { status: 500 });
  }
}
