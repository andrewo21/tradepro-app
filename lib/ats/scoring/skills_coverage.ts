// lib/ats/scoring/skills_coverage.ts
// Pure deterministic function. No AI. No randomness. Same input = same output.

import { normalizeList, expandSynonyms } from "../utils/normalize";

export interface SkillsCoverageResult {
  score: number;          // 0–100
  skills_found: string[];
  skills_missing: string[];
  total_required: number;
  total_found: number;
}

/**
 * Check if a skill appears in a pool of normalized text strings,
 * including synonym matching.
 */
function skillAppearsIn(skill: string, pool: string[]): boolean {
  const variants = expandSynonyms(skill);
  const combined = pool.join(" ");
  return variants.some(v => combined.includes(v));
}

/**
 * Compute how many job-required skills appear in the resume.
 *
 * Formula:
 *   score = (found / required) * 100
 *   If required == 0, score = 0 (no skills listed in job — cannot evaluate)
 *
 * Matching uses normalized strings + Portuguese synonym expansion.
 */
export function computeSkillsCoverage(
  requiredSkills: string[],
  resumeSkills: string[],
  resumeBullets: string[]
): SkillsCoverageResult {
  const normRequired = normalizeList(requiredSkills);
  const searchPool   = normalizeList([...resumeSkills, ...resumeBullets]);

  const skillsFound: string[]   = [];
  const skillsMissing: string[] = [];

  for (const skill of normRequired) {
    if (skillAppearsIn(skill, searchPool)) {
      skillsFound.push(skill);
    } else {
      skillsMissing.push(skill);
    }
  }

  const total   = normRequired.length;
  const found   = skillsFound.length;
  const score   = total === 0 ? 0 : Math.min(100, (found / total) * 100);

  return {
    score,
    skills_found:    skillsFound,
    skills_missing:  skillsMissing,
    total_required:  total,
    total_found:     found,
  };
}
