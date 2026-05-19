// lib/ats/modes/with_job.ts
// Orchestrates Mode A: full Resume Intelligence™ with job description.
// Calls extraction, scoring, suggestions, and output builder in order.

import OpenAI from "openai";
import { extractResumeData }    from "../extraction/extract_resume_data";
import { extractJobData }       from "../extraction/extract_job_data";
import { computeStructureScore } from "../scoring/structure_score";
import { computeSkillsCoverage } from "../scoring/skills_coverage";
import { computeSemanticMatch }  from "../scoring/semantic_match";
import { computeFinalScore, getStrengthLabel } from "../scoring/final_score";
import { computeSpecificEnhancements } from "../scoring/specific_enhancements";
import { generateSuggestionsWithJob } from "./suggestions";
import { buildOutputWithJob }    from "../output/build_output_json";

export interface WithJobInput {
  resumeText:      string;
  jobDescription:  string;
  candidateName?:  string | null;
  jobTitle?:       string | null;
  companyName?:    string | null;
  date?:           string | null;
  locale?:         string | null;
  candidateTitle?: string | null;  // user's actual job title for semantic floor
}

export async function runWithJob(client: OpenAI, input: WithJobInput) {
  const { resumeText, jobDescription, candidateName, jobTitle, companyName, date, locale, candidateTitle } = input;

  // ── Step 1: Extract (AI allowed here only) ────────────────────────────────
  const [resumeExtraction, jobExtraction] = await Promise.all([
    extractResumeData(client, resumeText),
    extractJobData(client, jobDescription),
  ]);

  // ── Step 3: Skills coverage (pure formula) ────────────────────────────────
  // Only use required_skills (actual skills) — never experience_requirements
  const skillsCoverage = computeSkillsCoverage(
    jobExtraction.required_skills,        // already separated from experience reqs
    resumeExtraction.resume_skills,
    resumeExtraction.resume_experience_bullets
  );

  // ── Step 4: Semantic match (embeddings + cosine, formula score) ───────────
  const rawSemanticMatch = await computeSemanticMatch(client, resumeText, jobDescription);

  // Apply a semantic floor when the candidate's job title appears in the job description.
  // A "Senior Project Manager" applying for a "Project Manager" role should never score
  // near 0 on semantic similarity — the titles alone guarantee meaningful overlap.
  let semanticFloor = 0;
  if (candidateTitle && jobDescription) {
    const titleWords = candidateTitle.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const jdLower = jobDescription.toLowerCase();
    const titleMatches = titleWords.filter(w => jdLower.includes(w)).length;
    if (titleMatches >= 2) semanticFloor = 35;       // strong title match
    else if (titleMatches >= 1) semanticFloor = 20;  // partial title match
  }

  const semanticMatch = {
    ...rawSemanticMatch,
    score: Math.max(semanticFloor, rawSemanticMatch.score),
  };

  // ── Step 5: Structure score (pure formula) ────────────────────────────────
  const structureResult = computeStructureScore(resumeExtraction);

  // ── Step 6: Final ATS score (pure formula) ────────────────────────────────
  const finalResult = computeFinalScore(
    skillsCoverage.score,
    semanticMatch.score,
    structureResult.score
  );

  // ── Step 6b: Locale-aware final score label ───────────────────────────────
  const finalResultWithLocale = {
    ...finalResult,
    strength_label: getStrengthLabel(finalResult.final_ats_score, locale),
  };

  // ── Step 7b: Specific enhancements — pure deterministic, no AI ───────────
  const specificEnhancements = computeSpecificEnhancements({
    resumeExtraction,
    mode: "with_job",
    jobExtraction,
    skillsMissing: skillsCoverage.skills_missing,
    skillsFound:   skillsCoverage.skills_found,
    locale:        locale || null,
  });

  // ── Step 8: Suggestions (AI for natural language only, scores are input) ──
  const suggestions = await generateSuggestionsWithJob(client, {
    finalScore:      finalResult.final_ats_score,
    skillsCoverage:  skillsCoverage.score,
    semanticMatch:   semanticMatch.score,
    structureScore:  structureResult.score,
    skillsMissing:   skillsCoverage.skills_missing,
    resumeExtraction,
    jobExtraction,
    locale:          locale || null,
  });

  // ── Step 9: Build structured output ──────────────────────────────────────
  return buildOutputWithJob({
    candidateName, jobTitle, companyName, date,
    finalResult: finalResultWithLocale,
    skillsCoverageScore:  skillsCoverage.score,
    semanticMatchScore:   semanticMatch.score,
    structureScore:       structureResult.score,
    skillsFound:          skillsCoverage.skills_found,
    skillsMissing:        skillsCoverage.skills_missing,
    suggestions,
    specificEnhancements,
    resumeExtraction,
    jobExtraction,
  });
}
