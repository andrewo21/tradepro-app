// lib/ats/scoring/recruiter_assessment.ts
//
// TradePro Resume Intelligence™
//
// Architecture:
//   KEYWORDS → GPT-4o-mini extracts required/preferred keywords from the JD (cheap, one-time)
//   SCORE    → Pure deterministic formula: keyword matches × placement weights
//              Same resume + same JD = same score, always.
//              Add a required skill → score goes up. Remove one → score goes down.
//   EXPLAIN  → GPT-4o writes the plain-English breakdown. Never touches the number.

import OpenAI from "openai";
import { truncateText } from "../utils/text_cleaning";

export interface RecruiterAssessment {
  overall_score:  number;
  job_fit_label:  string;
  match_summary:  string;
  strengths:      string[];
  gaps:           string[];
  improvements:   string[];
  skills_found:   string[];
  skills_missing: string[];
}

interface JobKeywords {
  required:  string[];   // must-have: skills, tools, certs, degree
  preferred: string[];   // nice-to-have
  title:     string[];   // job title words
}

// ─── Step 1: Extract keywords from job description ───────────────────────────
// Uses GPT-4o-mini (cheap, fast). Returns structured keyword lists.

async function extractJobKeywords(client: OpenAI, jobDescription: string): Promise<JobKeywords> {
  try {
    const res = await client.chat.completions.create({
      model:           "gpt-4o-mini",
      temperature:     0,
      response_format: { type: "json_object" },
      messages: [{
        role: "system",
        content: `Extract specific keywords from this job description for ATS matching.
Return JSON with exactly these three fields:
{
  "required":  ["skill1", "Timberline", "PMP", "Bachelor's degree"],
  "preferred": ["nice to have item"],
  "title":     ["senior", "project", "manager"]
}
Rules:
- required  = explicitly required skills, tools, software, certifications, degrees, years of experience
- preferred = items marked "preferred", "bonus", "nice to have", or "a plus"
- title     = significant words from the job title (3+ chars, no articles)
- Keep each entry SHORT (1-3 words). Be specific: "Timberline" not "estimating software"
- Include certifications as separate entries: "PMP", "OSHA 30", "CDL"
- Max 25 required, 15 preferred, 6 title keywords
- Return ONLY the JSON object`,
      }, {
        role: "user",
        content: truncateText(jobDescription, 4000),
      }],
    });
    const raw = JSON.parse(res.choices[0]?.message?.content || "{}");
    return {
      required:  toArr(raw.required),
      preferred: toArr(raw.preferred),
      title:     toArr(raw.title),
    };
  } catch {
    return { required: [], preferred: [], title: [] };
  }
}

// ─── Step 2: Deterministic keyword match score ───────────────────────────────
// Placement weights — keywords in prominent positions score higher (ATS standard).
//   Title / first 3 lines:  3× — highest ATS value
//   Summary (first 500 chars): 2× — second highest
//   Body (rest of resume):  1× — base value
//   Preferred keywords:     0.5× — bonus only
//
// Score = (earned weighted points) / (max possible points) × 100, capped at 95.
// Adding any required keyword always increases the score.
// Removing any required keyword always decreases the score.

function computeKeywordMatchScore(resumeText: string, keywords: JobKeywords): number {
  if (!resumeText || (keywords.required.length + keywords.preferred.length) === 0) return 0;

  const rLower = resumeText.toLowerCase();

  // Identify resume sections for placement scoring
  const lines         = resumeText.split("\n");
  const titleSection  = lines.slice(0, 4).join(" ").toLowerCase();      // top 4 lines
  const summarySection = resumeText.substring(0, 600).toLowerCase();    // first 600 chars

  const W_TITLE    = 3;    // required keyword in title area
  const W_SUMMARY  = 2;    // required keyword in summary
  const W_BODY     = 1;    // required keyword anywhere else
  const W_PREFERRED = 0.5; // preferred keyword anywhere

  let earned   = 0;
  let possible = 0;

  // Score required keywords (max per keyword = W_TITLE)
  for (const kw of keywords.required) {
    const kwl = kw.toLowerCase().trim();
    if (!kwl || kwl.length < 2) continue;
    possible += W_TITLE;

    if (rLower.includes(kwl)) {
      if (titleSection.includes(kwl)) {
        earned += W_TITLE;
      } else if (summarySection.includes(kwl)) {
        earned += W_SUMMARY;
      } else {
        earned += W_BODY;
      }
    }
    // not found: +0
  }

  // Score preferred keywords (pure bonus)
  for (const kw of keywords.preferred) {
    const kwl = kw.toLowerCase().trim();
    if (!kwl || kwl.length < 2) continue;
    possible += W_PREFERRED;
    if (rLower.includes(kwl)) earned += W_PREFERRED;
  }

  if (possible === 0) return 0;

  // Scale to 0-95 (nothing is perfect without knowing the full context)
  const raw = (earned / possible) * 100;
  return Math.min(95, Math.round(raw));
}

// ─── Step 3: GPT-4o explains the score in plain English ───────────────────────
// The score is already set. GPT only writes the words. Never changes the number.

async function generateExplanation(
  client: OpenAI,
  resumeText: string,
  jobDescription: string,
  keywords: JobKeywords,
  score: number,
  locale: string,
): Promise<Omit<RecruiterAssessment, "overall_score" | "job_fit_label">> {
  const isEN = locale !== "pt-BR";

  // Tell GPT exactly which keywords matched and which didn't
  const rLower = resumeText.toLowerCase();
  const matched = keywords.required.filter(kw => rLower.includes(kw.toLowerCase()));
  const missing = keywords.required.filter(kw => !rLower.includes(kw.toLowerCase()));

  const context = isEN
    ? `Keywords FOUND in resume: ${matched.join(", ") || "none"}
Keywords MISSING from resume: ${missing.join(", ") || "none"}
Job Fit Score: ${score}/100`
    : `Palavras-chave ENCONTRADAS no currículo: ${matched.join(", ") || "nenhuma"}
Palavras-chave AUSENTES no currículo: ${missing.join(", ") || "nenhuma"}
Pontuação: ${score}/100`;

  const systemPrompt = isEN
    ? `You are TradePro Resume Intelligence™.
The Job Fit Score is ${score}/100 — already calculated mathematically from keyword matching.
Your job is ONLY to explain this score using plain English anyone can understand.

You have been given the exact list of matched and missing keywords above.
Base your explanation entirely on this data — no hallucinations.

RULES:
1. Write like you are talking to a tradesperson, not a tech expert
2. Every point must come from the provided keyword lists
3. skills_found = keywords from the FOUND list
4. skills_missing = keywords from the MISSING list
5. Your explanation must be consistent with ${score}/100
6. NEVER mention "keywords", "ATS", "embeddings", or technical terms
7. DO NOT invent new gaps not in the missing list

Return JSON:
{
  "match_summary": "2-3 plain sentences explaining ${score}/100",
  "strengths": ["specific things from the matched list that help"],
  "gaps": ["specific things from the missing list that hurt"],
  "improvements": ["exact actionable fix for each gap — add X to your resume"],
  "skills_found": ["from the matched keywords list"],
  "skills_missing": ["from the missing keywords list"]
}`
    : `Você é o TradePro Resume Intelligence™.
A pontuação ${score}/100 já foi calculada matematicamente.
Explique em português simples usando APENAS os dados fornecidos acima.
Retorne JSON: match_summary, strengths, gaps, improvements, skills_found, skills_missing`;

  try {
    const completion = await client.chat.completions.create({
      model:           "gpt-4o",
      temperature:     0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: `${context}\n\nJOB DESCRIPTION:\n${truncateText(jobDescription, 3000)}\n\nRESUME:\n${truncateText(resumeText, 4000)}` },
      ],
    });
    const raw = JSON.parse(completion.choices[0]?.message?.content || "{}");
    return {
      match_summary:  String(raw.match_summary || ""),
      strengths:      toArr(raw.strengths),
      gaps:           toArr(raw.gaps),
      improvements:   toArr(raw.improvements),
      skills_found:   toArr(raw.skills_found),
      skills_missing: toArr(raw.skills_missing),
    };
  } catch {
    return { match_summary: "", strengths: [], gaps: [], improvements: [], skills_found: [], skills_missing: [] };
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function runRecruiterAssessment(
  client: OpenAI,
  resumeText: string,
  jobDescription: string,
  locale: string = "en",
  candidateTitle?: string | null,
): Promise<RecruiterAssessment> {
  // Step 1: Extract what the job requires
  const keywords = await extractJobKeywords(client, jobDescription);

  // Step 2: Score deterministically — adding/removing keywords changes the number
  const overall_score = computeKeywordMatchScore(resumeText, keywords);

  // Step 3: GPT explains the score in plain English — never sets the number
  const explanation = await generateExplanation(client, resumeText, jobDescription, keywords, overall_score, locale);

  return {
    overall_score,
    job_fit_label: scoreToLabel(overall_score, locale),
    ...explanation,
  };
}

function scoreToLabel(score: number, locale: string): string {
  const isEN = locale !== "pt-BR";
  if (score >= 76) return isEN ? "Strong Fit"    : "Forte";
  if (score >= 56) return isEN ? "Good Fit"      : "Bom";
  if (score >= 36) return isEN ? "Partial Fit"   : "Parcial";
  return                  isEN ? "Needs Work"    : "Precisa melhorar";
}

function toArr(v: unknown): string[] {
  return Array.isArray(v) ? v.map(String).filter(Boolean) : [];
}
