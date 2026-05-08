export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { checkRateLimit, getIP } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const { allowed, retryAfter } = await checkRateLimit(`ai:${getIP(req)}`, 10, 60);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down and try again." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI not configured." }, { status: 500 });
    }

    const { resumeText, jobDescription } = await req.json();

    if (!resumeText?.trim()) return NextResponse.json({ error: "Resume text is required." }, { status: 400 });
    if (!jobDescription?.trim()) return NextResponse.json({ error: "Job description is required." }, { status: 400 });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // ── PASS 1: Extract structured data from both documents ────────────────────
    const extractCompletion = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an expert resume data extractor. Extract ALL information from the resume and job posting with perfect accuracy.

CRITICAL EXTRACTION RULES:
- Extract EVERY bullet point from EVERY job. Count them exactly. Do not skip, merge, or summarize any bullet.
- If a job has 9 bullets, extract all 9. If it has 2, extract both. The count must be exact.
- Extract text verbatim — do not rephrase during extraction.
- Extract ALL skills, ALL education entries, ALL certifications exactly as written.

Return ONLY valid JSON:
{
  "candidate": {
    "firstName": "",
    "lastName": "",
    "tradeTitle": "",
    "phone": "",
    "email": "",
    "city": "",
    "state": "",
    "summary": "",
    "jobs": [
      {
        "jobTitle": "",
        "company": "",
        "startDate": "",
        "endDate": "",
        "bullets": ["exact bullet 1", "exact bullet 2", "exact bullet 3"]
      }
    ],
    "skills": ["skill1", "skill2"],
    "education": [{ "school": "", "degree": "", "year": "", "gpa": "" }],
    "certifications": []
  },
  "jobPosting": {
    "title": "",
    "company": "",
    "requiredSkills": [],
    "preferredSkills": [],
    "responsibilities": [],
    "atsKeywords": [],
    "industryTerms": [],
    "seniorityLevel": ""
  }
}`,
        },
        {
          role: "user",
          content: `RESUME:\n${resumeText}\n\n---\n\nJOB POSTING:\n${jobDescription}`,
        },
      ],
    });

    const extractRaw = extractCompletion.choices?.[0]?.message?.content || "{}";
    const extracted = JSON.parse(extractRaw);

    const candidate = extracted.candidate || {};
    const jobPosting = extracted.jobPosting || {};

    // Verify bullet counts before passing to optimizer
    const bulletCounts = (candidate.jobs || []).map((j: any) => ({
      title: j.jobTitle,
      count: (j.bullets || []).length,
    }));

    // ── PASS 2: Optimize with strict rules ─────────────────────────────────────
    const optimizeCompletion = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a master resume optimizer. You will optimize a candidate's resume for a specific job posting.

═══════════════════════════════════════════════
ABSOLUTE RULES — NEVER VIOLATE ANY OF THESE
═══════════════════════════════════════════════

HONESTY CONSTRAINT (CRITICAL):
- NEVER invent job titles, employers, dates, degrees, certifications, tools, or technologies
- NEVER add experience the candidate did not have
- NEVER fabricate any numbers, metrics, or achievements
- You may ONLY: rephrase, reorder, emphasize, condense, clarify, align wording with the job posting
- You may infer and clarify ONLY what is already implied by the candidate's own text

BULLET PRESERVATION RULE (CRITICAL):
- Count the bullets in each job. The output MUST have the exact same count.
- If a job has 9 bullets in → output must have exactly 9 bullets.
- If a job has 2 bullets in → output must have exactly 2 bullets.
- DO NOT delete any bullet. DO NOT merge bullets. DO NOT collapse multiple bullets into one.
- Every single original bullet must have exactly one corresponding output bullet.

BULLET OPTIMIZATION LOGIC:
For each bullet, compare it to the job posting:
- HIGHLY RELEVANT: Strongly optimize — powerful action verb, measurable impact if already implied (never invent numbers), weave in job posting language naturally
- SOMEWHAT RELEVANT: Lightly optimize — clarify impact, tighten wording, align terminology
- NOT RELEVANT: Keep it — light grammar/clarity cleanup only, do not hide or remove it

SKILLS RULE:
- Only include skills the candidate explicitly has or clearly demonstrated
- You may reflect ATS keywords from the job posting in skills ONLY if the candidate's experience supports them
- Never add skills the user does not have

═══════════════════════════════════════════════
OUTPUT STRUCTURE
═══════════════════════════════════════════════

Return ONLY valid JSON with no explanations or meta text:
{
  "personalInfo": {
    "firstName": "",
    "lastName": "",
    "tradeTitle": "",
    "phone": "",
    "email": "",
    "city": "",
    "state": ""
  },
  "summary": "",
  "skills": [],
  "experience": [
    {
      "jobTitle": "",
      "company": "",
      "startDate": "",
      "endDate": "",
      "responsibilities": [],
      "achievements": []
    }
  ],
  "education": [{ "school": "", "degree": "", "year": "", "gpa": "" }],
  "atsScore": {
    "presentKeywords": [],
    "missingKeywords": [],
    "score": 0
  }
}

VERIFICATION BEFORE RESPONDING:
Before returning your JSON, mentally verify:
1. Each job's responsibilities array length matches the original bullet count: ${JSON.stringify(bulletCounts)}
2. No invented facts anywhere
3. All bullets preserved (none deleted, none merged)`,
        },
        {
          role: "user",
          content: `CANDIDATE DATA:\n${JSON.stringify(candidate, null, 2)}\n\nJOB POSTING DATA:\n${JSON.stringify(jobPosting, null, 2)}`,
        },
      ],
    });

    const optimizeRaw = optimizeCompletion.choices?.[0]?.message?.content || "{}";
    const optimized = JSON.parse(optimizeRaw);

    return NextResponse.json({
      success: true,
      resume: optimized,
      jobTitle: jobPosting.title || "",
      employer: jobPosting.company || "",
      atsScore: optimized.atsScore || {},
    });

  } catch (err: any) {
    const detail = err?.message || String(err);
    console.error("build-targeted-resume error:", detail);
    return NextResponse.json({ error: "Failed to build targeted resume.", detail }, { status: 500 });
  }
}
