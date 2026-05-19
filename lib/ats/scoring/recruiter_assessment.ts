// lib/ats/scoring/recruiter_assessment.ts
//
// TradePro Resume Intelligence™
//
// Architecture:
//   SCORE  → text-embedding-3-small cosine similarity (deterministic, consistent)
//   EXPLAIN → GPT-4o reads both documents and writes the plain-English breakdown
//
// The score is math. GPT only touches the words, never the number.
// Same resume + same JD = same score, every time.

import OpenAI from "openai";
import { cosineSimilarity, similarityToScore } from "../utils/embeddings";
import { truncateText } from "../utils/text_cleaning";

export interface RecruiterAssessment {
  overall_score:  number;   // 0–100, from embeddings (deterministic)
  job_fit_label:  string;   // plain-English label
  match_summary:  string;   // GPT-4o plain English explanation
  strengths:      string[];
  gaps:           string[];
  improvements:   string[];
  skills_found:   string[];
  skills_missing: string[];
}

// ─── Score via embeddings (deterministic) ────────────────────────────────────

async function computeJobFitScore(
  client: OpenAI,
  resumeText: string,
  jobDescription: string,
  candidateTitle?: string | null,
): Promise<number> {
  try {
    const [resumeEmb, jobEmb] = await Promise.all([
      client.embeddings.create({ model: "text-embedding-3-small", input: truncateText(resumeText, 8000) }),
      client.embeddings.create({ model: "text-embedding-3-small", input: truncateText(jobDescription, 8000) }),
    ]);

    const similarity = cosineSimilarity(
      resumeEmb.data[0].embedding,
      jobEmb.data[0].embedding
    );

    // Convert cosine similarity to 0-100 score
    // similarityToScore maps typical resume-JD similarity range (0.6-0.95) to 0-100
    let score = similarityToScore(similarity);

    // Title match floor — if candidate's title matches the job title,
    // the score can't be below a meaningful threshold
    if (candidateTitle) {
      const titleWords = candidateTitle.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const jdLower    = jobDescription.toLowerCase();
      const matches    = titleWords.filter(w => jdLower.includes(w)).length;
      if (matches >= 2) score = Math.max(45, score);  // strong title match floor
      else if (matches >= 1) score = Math.max(28, score); // partial title match floor
    }

    return Math.min(100, Math.round(score));
  } catch {
    return 0;
  }
}

// ─── Explain via GPT-4o (language only, never sets the score) ─────────────────

async function generateExplanation(
  client: OpenAI,
  resumeText: string,
  jobDescription: string,
  jobFitScore: number,
  locale: string
): Promise<Omit<RecruiterAssessment, "overall_score" | "job_fit_label">> {
  const isEN = locale !== "pt-BR";

  const systemPrompt = isEN ? `You are TradePro Resume Intelligence™, a plain-English resume analysis tool.
The Job Fit Score has already been calculated at ${jobFitScore}/100 using AI matching technology.
Your job is ONLY to explain this score in plain English that anyone can understand.

RULES:
1. Write like you're explaining to someone who has never heard of "ATS" or "keywords"
2. Every strength and gap must come directly from the documents — no hallucinations
3. Only flag skills/certs that are genuinely missing — not soft skills, not experience requirements
4. Your explanation must be consistent with the score of ${jobFitScore}/100
5. NEVER say "semantic" or "embeddings" — say "how well your resume matches this job"

Return JSON:
{
  "match_summary": "2-3 plain sentences explaining the ${jobFitScore}/100 score in everyday language",
  "strengths": ["specific evidence of match, quoted from documents"],
  "gaps": ["genuine gaps only — things truly missing that the job requires"],
  "improvements": ["specific, actionable things to add or change"],
  "skills_found": ["concrete technical skills/certs resume has that JD mentions"],
  "skills_missing": ["concrete technical skills/certs JD requires that resume lacks"]
}`
  : `Você é o TradePro Resume Intelligence™, uma ferramenta de análise de currículo em linguagem simples.
O Job Fit Score já foi calculado em ${jobFitScore}/100.
Sua função é APENAS explicar essa pontuação em português simples que qualquer pessoa entenda.
NUNCA diga "semântico" — diga "como seu currículo combina com esta vaga".
Retorne JSON com: match_summary, strengths, gaps, improvements, skills_found, skills_missing`;

  try {
    const completion = await client.chat.completions.create({
      model:           "gpt-4o",
      temperature:     0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: `JOB DESCRIPTION:\n${jobDescription}\n\n---\n\nCANDIDATE RESUME:\n${resumeText}` },
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
  // Step 1: Score via embeddings — deterministic, consistent
  const overall_score = await computeJobFitScore(client, resumeText, jobDescription, candidateTitle);

  // Step 2: Explain via GPT-4o — plain English only, never changes the score
  const explanation = await generateExplanation(client, resumeText, jobDescription, overall_score, locale);

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
