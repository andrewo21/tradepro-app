// lib/ats/scoring/final_score.ts
// Pure deterministic function. No AI. Same input = same output.

/** Weights must sum to 1.0 */
const WEIGHTS = {
  skills_coverage: 0.4,
  semantic_match:  0.4,
  structure:       0.2,
} as const;

/** Thresholds for strength label */
const THRESHOLDS = {
  forte:   80,
  mediano: 50,
} as const;

export type StrengthLabel = "Forte" | "Mediano" | "Precisa de ajustes";

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
  structure: number
): FinalScoreResult {
  const raw =
    (skillsCoverage * WEIGHTS.skills_coverage) +
    (semanticMatch  * WEIGHTS.semantic_match)  +
    (structure      * WEIGHTS.structure);

  const final = Math.round(Math.min(100, Math.max(0, raw)));
  const label  = getStrengthLabel(final);

  return { final_ats_score: final, strength_label: label, weights_used: WEIGHTS };
}

/** Assign a Brazilian Portuguese strength label based on final score */
export function getStrengthLabel(score: number): StrengthLabel {
  if (score >= THRESHOLDS.forte)   return "Forte";
  if (score >= THRESHOLDS.mediano) return "Mediano";
  return "Precisa de ajustes";
}
