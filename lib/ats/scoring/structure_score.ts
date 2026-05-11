// lib/ats/scoring/structure_score.ts
// Pure deterministic function. No AI. Same input = same output.
// Additive scoring formula per spec — replaces previous penalty-based approach.

import type { ResumeExtraction } from "../extraction/extract_resume_data";

export interface StructureScoreResult {
  score: number;
  penalties: string[]; // kept for backwards compat — now lists what's missing
}

/**
 * Compute structure score using additive formula (0 → 100):
 *
 *   bullet_point_count >= 5: +20  |  >= 3: +10
 *   word_count 200–450:      +20  |  120–199: +10
 *   has_summary:             +15
 *   has_skills_section:      +15
 *   has_experience_section:  +15
 *   has_education_section:   +15
 *   ─────────────────────────────
 *   Maximum possible:        100
 */
export function computeStructureScore(e: ResumeExtraction): StructureScoreResult {
  let score = 0;
  const missing: string[] = [];

  // Bullet count
  if (e.bullet_point_count >= 5)      { score += 20; }
  else if (e.bullet_point_count >= 3) { score += 10; missing.push(`Poucos bullets (${e.bullet_point_count}) — mínimo recomendado: 5`); }
  else                                { missing.push(`Muito poucos bullets (${e.bullet_point_count}) — mínimo recomendado: 5`); }

  // Word count
  if (e.word_count >= 200 && e.word_count <= 450)      { score += 20; }
  else if (e.word_count >= 120 && e.word_count < 200)  { score += 10; missing.push(`Currículo curto (${e.word_count} palavras) — recomendado: 200–450`); }
  else if (e.word_count > 450)                         { score += 20; } // longer is ok, no penalty
  else                                                 { missing.push(`Currículo muito curto (${e.word_count} palavras)`); }

  // Sections
  if (e.has_summary)           { score += 15; } else { missing.push("Sem resumo profissional (-15)"); }
  if (e.has_skills_section)    { score += 15; } else { missing.push("Sem seção de habilidades (-15)"); }
  if (e.has_experience_section){ score += 15; } else { missing.push("Sem seção de experiência (-15)"); }
  if (e.has_education_section) { score += 15; } else { missing.push("Sem seção de formação (-15)"); }

  return { score: Math.max(0, Math.min(100, score)), penalties: missing };
}
