// lib/ats/modes/general.ts
// Orchestrates Mode B: general resume strength analysis (no job description).

import OpenAI from "openai";
import { extractResumeData }     from "../extraction/extract_resume_data";
import { computeStructureScore } from "../scoring/structure_score";
import { getStrengthLabel }      from "../scoring/final_score";
import { computeSpecificEnhancements } from "../scoring/specific_enhancements";
import { generateSuggestionsGeneral } from "./suggestions";
import { buildOutputGeneral }    from "../output/build_output_json";
import { findUSRoleData }        from "../roles/us_roles";

export interface GeneralInput {
  resumeText: string;
  candidateName?: string | null;
  profession?: string | null;
  locale?: string | null;  // "en" for US, "pt-BR" for Brazil
}

export async function runGeneral(client: OpenAI, input: GeneralInput) {
  const { resumeText, candidateName, profession, locale } = input;

  // ── Step 1: Extract (AI allowed here only) ────────────────────────────────
  const resumeExtraction = await extractResumeData(client, resumeText);

  // ── Step 2: Structure score (pure formula) ────────────────────────────────
  const structureResult = computeStructureScore(resumeExtraction);

  // ── Step 2b: Role skills match (English/US only) ─────────────────────────
  // For US site: blend structure (60%) with role skills coverage (40%)
  // This prevents a well-structured but skills-thin resume from scoring 100
  let blendedScore = structureResult.score;
  if (locale === "en" && profession) {
    const roleMatch = findUSRoleData(profession);
    if (roleMatch) {
      const expectedSkills = roleMatch.data.skills;
      const resumeSkillsLower = resumeExtraction.resume_skills.map(s => s.toLowerCase());
      const resumeBulletsLower = resumeExtraction.resume_experience_bullets.map(s => s.toLowerCase()).join(" ");
      const covered = expectedSkills.filter(skill =>
        resumeSkillsLower.some(s => s.includes(skill.toLowerCase())) ||
        resumeBulletsLower.includes(skill.toLowerCase())
      ).length;
      const roleSkillsScore = expectedSkills.length > 0
        ? Math.min(100, Math.round((covered / expectedSkills.length) * 100))
        : structureResult.score;
      // Blend: 60% structure + 40% role skills match
      blendedScore = Math.round(structureResult.score * 0.6 + roleSkillsScore * 0.4);
    }
  }

  // ── Step 3: Strength label ────────────────────────────────────────────────
  const strengthLabel = getStrengthLabel(blendedScore);

  // ── Step 3b: Specific enhancements — pure deterministic, no AI ───────────
  const specificEnhancements = computeSpecificEnhancements({
    resumeExtraction,
    mode: "general",
    profession: profession || null,
    locale: locale || null,
  });

  // ── Step 4: Two-tiered suggestions ────────────────────────────────────────
  const suggestions = await generateSuggestionsGeneral(client, {
    structureScore: structureResult.score,
    penalties:      structureResult.penalties,
    resumeExtraction,
    profession:     profession || null,
    locale:         locale || null,
  });

  // ── Step 5: Build structured output ──────────────────────────────────────
  return buildOutputGeneral({
    candidateName,
    profession:               profession || null,
    structureScore:           blendedScore,
    strengthLabel,
    suggestions:              suggestions.general,
    specific_recommendations: suggestions.specific,
    specificEnhancements,
    resumeExtraction,
  });
}
