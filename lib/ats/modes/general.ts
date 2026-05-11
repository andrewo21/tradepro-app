// lib/ats/modes/general.ts
// Orchestrates Mode B: general resume strength analysis (no job description).

import OpenAI from "openai";
import { extractResumeData }     from "../extraction/extract_resume_data";
import { computeStructureScore } from "../scoring/structure_score";
import { getStrengthLabel }      from "../scoring/final_score";
import { generateSuggestionsGeneral } from "./suggestions";
import { buildOutputGeneral }    from "../output/build_output_json";

export interface GeneralInput {
  resumeText: string;
  candidateName?: string | null;
}

export async function runGeneral(client: OpenAI, input: GeneralInput) {
  const { resumeText, candidateName } = input;

  // ── Step 1: Extract (AI allowed here only) ────────────────────────────────
  const resumeExtraction = await extractResumeData(client, resumeText);

  // ── Step 2: Structure score (pure formula) ────────────────────────────────
  const structureResult = computeStructureScore(resumeExtraction);

  // ── Step 3: Strength label (from structure score in Mode B) ──────────────
  const strengthLabel = getStrengthLabel(structureResult.score);

  // ── Step 4: Suggestions (AI for natural language only) ───────────────────
  const suggestions = await generateSuggestionsGeneral(client, {
    structureScore: structureResult.score,
    penalties:      structureResult.penalties,
    resumeExtraction,
  });

  // ── Step 5: Build structured output ──────────────────────────────────────
  return buildOutputGeneral({
    candidateName,
    structureScore: structureResult.score,
    strengthLabel,
    suggestions,
    resumeExtraction,
  });
}
