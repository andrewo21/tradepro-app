// lib/ats/modes/with_job.ts
// Orchestrates Mode A: full ATS analysis with job description.
// Calls extraction, scoring, suggestions, and output builder in order.

import OpenAI from "openai";
import { extractResumeData }    from "../extraction/extract_resume_data";
import { extractJobData }       from "../extraction/extract_job_data";
import { computeStructureScore } from "../scoring/structure_score";
import { computeSkillsCoverage } from "../scoring/skills_coverage";
import { computeSemanticMatch }  from "../scoring/semantic_match";
import { computeFinalScore }     from "../scoring/final_score";
import { generateSuggestionsWithJob } from "./suggestions";
import { buildOutputWithJob }    from "../output/build_output_json";

export interface WithJobInput {
  resumeText: string;
  jobDescription: string;
  candidateName?: string | null;
  jobTitle?: string | null;
  companyName?: string | null;
  date?: string | null;
}

export async function runWithJob(client: OpenAI, input: WithJobInput) {
  const { resumeText, jobDescription, candidateName, jobTitle, companyName, date } = input;

  // ── Step 1: Extract (AI allowed here only) ────────────────────────────────
  const [resumeExtraction, jobExtraction] = await Promise.all([
    extractResumeData(client, resumeText),
    extractJobData(client, jobDescription),
  ]);

  // ── Step 3: Skills coverage (pure formula) ────────────────────────────────
  const skillsCoverage = computeSkillsCoverage(
    jobExtraction.required_skills,
    resumeExtraction.resume_skills,
    resumeExtraction.resume_experience_bullets
  );

  // ── Step 4: Semantic match (embeddings + cosine, formula score) ───────────
  const semanticMatch = await computeSemanticMatch(client, resumeText, jobDescription);

  // ── Step 5: Structure score (pure formula) ────────────────────────────────
  const structureResult = computeStructureScore(resumeExtraction);

  // ── Step 6: Final ATS score (pure formula) ────────────────────────────────
  const finalResult = computeFinalScore(
    skillsCoverage.score,
    semanticMatch.score,
    structureResult.score
  );

  // ── Step 8: Suggestions (AI for natural language only, scores are input) ──
  const suggestions = await generateSuggestionsWithJob(client, {
    finalScore:      finalResult.final_ats_score,
    skillsCoverage:  skillsCoverage.score,
    semanticMatch:   semanticMatch.score,
    structureScore:  structureResult.score,
    skillsMissing:   skillsCoverage.skills_missing,
    resumeExtraction,
    jobExtraction,
  });

  // ── Step 9: Build structured output ──────────────────────────────────────
  return buildOutputWithJob({
    candidateName, jobTitle, companyName, date,
    finalResult,
    skillsCoverageScore: skillsCoverage.score,
    semanticMatchScore:  semanticMatch.score,
    structureScore:      structureResult.score,
    skillsFound:         skillsCoverage.skills_found,
    skillsMissing:       skillsCoverage.skills_missing,
    suggestions,
    resumeExtraction,
    jobExtraction,
  });
}
