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

    if (!resumeText?.trim()) {
      return NextResponse.json({ error: "Resume text is required." }, { status: 400 });
    }
    if (!jobDescription?.trim()) {
      return NextResponse.json({ error: "Job description is required." }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // ── PASS 1: Deep analysis of both documents ────────────────────────────────
    const analysisCompletion = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a world-class resume strategist and ATS optimization expert specializing in skilled trades, construction, and technical industries.

Your task is to perform a DEEP analysis of both a candidate's resume and a job description, then extract structured data.

ANALYSIS TASKS:
1. Extract ALL candidate information from their resume — every job, every bullet, every skill, every certification, every education entry. Miss nothing.
2. Deeply analyze the job description — identify the role, required skills, preferred qualifications, key responsibilities, industry keywords, and ATS trigger words.
3. Cross-reference: identify which of the candidate's experiences, skills, and achievements are most relevant to THIS specific job.
4. Flag any missing keywords from the job description that the candidate's background could legitimately support.

Return ONLY valid JSON in this exact format:
{
  "candidate": {
    "firstName": "",
    "lastName": "",
    "tradeTitle": "",
    "phone": "",
    "email": "",
    "city": "",
    "state": "",
    "allJobs": [
      {
        "jobTitle": "",
        "company": "",
        "startDate": "",
        "endDate": "",
        "allBullets": ["exact bullet text from resume"]
      }
    ],
    "allSkills": ["skill1", "skill2"],
    "education": [{ "school": "", "degree": "", "year": "" }],
    "certifications": ["cert1"],
    "rawSummary": ""
  },
  "jobAnalysis": {
    "targetJobTitle": "",
    "employerName": "",
    "requiredSkills": ["skill1"],
    "preferredSkills": ["skill1"],
    "keyResponsibilities": ["responsibility1"],
    "industryKeywords": ["keyword1"],
    "atsTriggerWords": ["word1"],
    "seniorityLevel": "",
    "industryType": ""
  },
  "matchScore": {
    "presentKeywords": ["keyword found in resume"],
    "missingKeywords": ["keyword missing but candidate could claim"],
    "strongestMatches": ["top 3 most relevant experiences"]
  }
}`,
        },
        {
          role: "user",
          content: `CANDIDATE RESUME:\n${resumeText}\n\n---\n\nJOB DESCRIPTION:\n${jobDescription}`,
        },
      ],
    });

    const analysisRaw = analysisCompletion.choices?.[0]?.message?.content || "{}";
    const analysis = JSON.parse(analysisRaw);

    // ── PASS 2: Build the optimized resume using the analysis ─────────────────
    const buildCompletion = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a master resume writer and ATS optimization expert. Using the deep analysis provided, build a perfectly optimized resume tailored specifically for the target job.

RULES — FOLLOW STRICTLY:
1. NEVER fabricate experience, skills, or qualifications the candidate does not have
2. Rewrite every bullet point using strong past-tense action verbs (Led, Managed, Delivered, Implemented, Oversaw, Executed, Coordinated, Achieved, Drove, Streamlined)
3. Quantify achievements where the original data hints at numbers — if no numbers exist, use strong qualitative language
4. Naturally weave in the job's ATS trigger words and industry keywords throughout — summary, bullets, and skills
5. Prioritize and re-order bullet points so the most relevant-to-this-job content appears first
6. Write the summary specifically for THIS job — it should read like it was written for this role
7. Skills list should include all candidate skills PLUS any missing ATS keywords their background legitimately supports
8. Professional English only — no first-person pronouns
9. Every bullet must be a complete, polished, impactful statement — no vague or weak language

Return ONLY valid JSON:
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
  "skills": ["skill1", "skill2"],
  "experience": [
    {
      "jobTitle": "",
      "company": "",
      "startDate": "",
      "endDate": "",
      "responsibilities": ["polished bullet 1", "polished bullet 2"],
      "achievements": []
    }
  ],
  "education": [{ "school": "", "degree": "", "year": "", "gpa": "" }],
  "atsScore": {
    "presentKeywords": ["keyword1"],
    "missingKeywords": [],
    "score": 95
  }
}`,
        },
        {
          role: "user",
          content: `Build the optimized resume using this analysis:\n${JSON.stringify(analysis, null, 2)}`,
        },
      ],
    });

    const buildRaw = buildCompletion.choices?.[0]?.message?.content || "{}";
    const built = JSON.parse(buildRaw);

    return NextResponse.json({
      success: true,
      resume: built,
      matchAnalysis: analysis.matchScore,
      jobTitle: analysis.jobAnalysis?.targetJobTitle || "",
      employer: analysis.jobAnalysis?.employerName || "",
    });

  } catch (err: any) {
    const detail = err?.message || String(err);
    console.error("build-targeted-resume error:", detail);
    return NextResponse.json({ error: "Failed to build targeted resume.", detail }, { status: 500 });
  }
}
