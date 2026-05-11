// lib/ats/scoring/structure_score.ts
// Pure deterministic function. No AI. No randomness. Same input = same output.

import type { ResumeExtraction } from "../extraction/extract_resume_data";

export interface StructureScoreResult {
  score: number;          // 0–100
  penalties: string[];    // list of what was penalized (for debugging/reporting)
}

/**
 * Compute structure score based on resume section presence and content volume.
 *
 * Penalties applied:
 *   -10 if no professional summary
 *   -20 if no experience section
 *   -15 if no skills section
 *   -10 if no education section
 *   -10 if fewer than 5 bullet points
 *   -10 if word count outside recommended range (200–1200)
 *
 * Result is clamped to [0, 100].
 */
export function computeStructureScore(e: ResumeExtraction): StructureScoreResult {
  let score = 100;
  const penalties: string[] = [];

  if (!e.has_summary) {
    score -= 10;
    penalties.push("Sem resumo profissional (-10)");
  }
  if (!e.has_experience_section) {
    score -= 20;
    penalties.push("Sem seção de experiência (-20)");
  }
  if (!e.has_skills_section) {
    score -= 15;
    penalties.push("Sem seção de habilidades (-15)");
  }
  if (!e.has_education_section) {
    score -= 10;
    penalties.push("Sem seção de formação (-10)");
  }
  if (e.bullet_point_count < 5) {
    score -= 10;
    penalties.push(`Poucos bullets de experiência: ${e.bullet_point_count} (mínimo 5) (-10)`);
  }
  if (e.word_count < 200 || e.word_count > 1200) {
    score -= 10;
    penalties.push(`Contagem de palavras fora do ideal: ${e.word_count} (recomendado 200–1200) (-10)`);
  }

  return { score: Math.max(0, Math.min(100, score)), penalties };
}
