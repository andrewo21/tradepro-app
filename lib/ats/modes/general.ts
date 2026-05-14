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

  // ── Step 2b: Role skills match + realistic scoring ───────────────────────
  // For US (locale=en): blend structure (60%) with role skills coverage (40%)
  // Always cap at 88 — no resume is "perfect" on a blind general analysis
  let blendedScore = structureResult.score;

  if (locale === "en") {
    const professionStr = profession || resumeExtraction.resume_titles?.[0] || "";
    const roleMatch = professionStr ? findUSRoleData(professionStr) : null;

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
        : 60; // safe default when no skills found
      // Blend: 60% structure + 40% role skills match
      blendedScore = Math.round(structureResult.score * 0.6 + roleSkillsScore * 0.4);
    } else {
      // No role match — use structure score but apply word-count quality factor
      // and cap lower since we can't benchmark against role expectations
      const wordFactor = resumeExtraction.word_count > 800 ? 0.9 :
                         resumeExtraction.word_count > 400 ? 0.95 : 1.0;
      blendedScore = Math.round(structureResult.score * wordFactor * 0.85);
    }
    // Hard cap: no general analysis scores above 88
    blendedScore = Math.min(88, blendedScore);
  }

  // ── Step 3: Strength label (locale-aware) ────────────────────────────────
  const strengthLabel = getStrengthLabel(blendedScore, locale);

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
