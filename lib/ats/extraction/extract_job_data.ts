// lib/ats/extraction/extract_job_data.ts
// ONLY file allowed to make AI calls for job description data.
// Accepts raw text. Returns clean JSON. Never scores. Never suggests.

import OpenAI from "openai";
import { truncateText } from "../utils/text_cleaning";

export interface JobExtraction {
  required_skills: string[];           // explicit skills, certs, competencies
  experience_requirements: string[];   // years, project scale, industry background
  responsibilities: string[];
  keywords: string[];
  tools: string[];
  seniority: string | null;
}

export async function extractJobData(
  client: OpenAI,
  jobText: string
): Promise<JobExtraction> {
  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0,  // deterministic
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a job description requirements extractor. Works for any language.
Extract structured data from the job description.

ABSOLUTE RULE: extract ONLY what is in the text. Never invent anything.

CRITICAL DISTINCTION — required_skills vs experience_requirements:
- required_skills: ONLY concrete technical skills, certifications, tools, software.
  Examples: "PMP certification", "AutoCAD", "project management", "OSHA 30"
  NEVER include: years of experience, project sizes, "ability to", "background in"
- experience_requirements: years, project scale, background context.
  Examples: "10+ years experience", "projects over $30M", "commercial construction background"

❌ WRONG required_skills: "10+ years in PM role", "ability to manage large-scale projects",
   "background in commercial construction", "strong understanding of X"
✅ CORRECT required_skills: "PMP", "AutoCAD", "Procore", "LEED AP", "estimating software"

The distinction matters: "ability to manage projects" is NOT a skill to add to a skills section.
"Procore certification" IS a skill to add.

Return JSON with exactly these fields:
{
  "required_skills": ["only concrete skills/certs/tools"],
  "experience_requirements": ["years of experience", "project scale", "background context"],
  "responsibilities": ["main job responsibilities"],
  "keywords": ["important terms and keywords"],
  "tools": ["software and technology tools"],
  "seniority": "junior" | "mid" | "senior" | null
}`,
      },
      {
        role: "user",
        content: truncateText(jobText),
      },
    ],
  });

  const raw = JSON.parse(completion.choices[0]?.message?.content || "{}");

  return {
    required_skills:
      Array.isArray(raw.required_skills) ? raw.required_skills : [],
    experience_requirements:
      Array.isArray(raw.experience_requirements) ? raw.experience_requirements : [],
    responsibilities:
      Array.isArray(raw.responsibilities) ? raw.responsibilities : [],
    keywords:
      Array.isArray(raw.keywords) ? raw.keywords : [],
    tools:
      Array.isArray(raw.tools) ? raw.tools : [],
    seniority: raw.seniority || null,
  };
}
