// lib/ats/scoring/final_score.ts
// Pure deterministic function. No AI. Same input = same output.

/** Weights for ATS match score (job description mode only) */
const WEIGHTS = {
  skills_coverage: 0.6,
  semantic_match:  0.4,
} as const;

/** Thresholds for strength label */
const THRESHOLDS = {
  forte:   80,
  mediano: 50,
} as const;

/** Point gain estimates used by specific_enhancements — exported for consistency */
export const atsPointGains = {
  missingSkill:              5,
  missingToolMin:            3,
  missingToolMax:            5,
  missingResponsibilityMin:  3,
  missingResponsibilityMax:  5,
  missingBullet:             5,
  missingMetrics:            5,
  missingSummary:           10,
  lowWordCount:             10,
  missingSkillsSection:     10,
  missingEducationSection:   5,
} as const;

export type StrengthLabel = "Forte" | "Mediano" | "Precisa de ajustes" | "Strong" | "Good" | "Needs Improvement";

export interface FinalScoreResult {
  final_ats_score: number;
  strength_label: StrengthLabel;
  weights_used: typeof WEIGHTS;
}

/**
 * Combine three component scores into the final ATS score.
 *
 * Formula:
 *   final = (skills_coverage * 0.4) + (semantic_match * 0.4) + (structure * 0.2)
 *
 * Result clamped to [0, 100] and rounded to nearest integer.
 *
 * To adjust weights: change WEIGHTS constant at the top of this file.
 * To adjust thresholds: change THRESHOLDS constant at the top of this file.
 */
export function computeFinalScore(
  skillsCoverage: number,
  semanticMatch: number,
  structure: number  // kept in signature for backwards compat, not used in weighted score
): FinalScoreResult {
  // ATS match score: 60% skills coverage + 40% job fit (per spec)
  const raw =
    (skillsCoverage * WEIGHTS.skills_coverage) +
    (semanticMatch  * WEIGHTS.semantic_match);

  const final = Math.round(Math.min(100, Math.max(0, raw)));
  const label  = getStrengthLabel(final);

  return { final_ats_score: final, strength_label: label, weights_used: WEIGHTS };
}

/** Assign strength label — locale-aware (en = English, default = PT-BR) */
export function getStrengthLabel(score: number, locale?: string | null): StrengthLabel {
  const isEN = locale === "en";
  if (score >= THRESHOLDS.forte)   return isEN ? "Strong"            : "Forte";
  if (score >= THRESHOLDS.mediano) return isEN ? "Good"              : "Mediano";
  return                                  isEN ? "Needs Improvement" : "Precisa de ajustes";
}
