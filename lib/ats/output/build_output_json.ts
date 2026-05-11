// lib/ats/output/build_output_json.ts
// Assembles the final structured JSON output for both modes.
// Pure function. No AI. No scoring. Just data assembly.

import type { ResumeExtraction } from "../extraction/extract_resume_data";
import type { JobExtraction }    from "../extraction/extract_job_data";
import type { FinalScoreResult, StrengthLabel } from "../scoring/final_score";

// ─── Mode A output ─────────────────────────────────────────────────────────────

export interface WithJobOutputInput {
  candidateName?: string | null;
  jobTitle?: string | null;
  companyName?: string | null;
  date?: string | null;
  finalResult: FinalScoreResult;
  skillsCoverageScore: number;
  semanticMatchScore: number;
  structureScore: number;
  skillsFound: string[];
  skillsMissing: string[];
  suggestions: string[];
  specificEnhancements: string[];
  resumeExtraction: ResumeExtraction;
  jobExtraction: JobExtraction;
}

export function buildOutputWithJob(input: WithJobOutputInput) {
  const {
    candidateName, jobTitle, companyName, date,
    finalResult, skillsCoverageScore, semanticMatchScore, structureScore,
    skillsFound, skillsMissing, suggestions, specificEnhancements,
    resumeExtraction, jobExtraction,
  } = input;

  return {
    mode:          "with_job" as const,
    candidate_name: candidateName || null,
    job_title:      jobTitle      || null,
    company_name:   companyName   || null,
    date:           date          || null,

    final_ats_score:       finalResult.final_ats_score,
    strength_label:        finalResult.strength_label,

    skills_coverage_score: Math.round(skillsCoverageScore),
    semantic_match_score:  Math.round(semanticMatchScore),
    structure_score:       Math.round(structureScore),

      skills_found:   skillsFound,
      skills_missing: skillsMissing,

      suggestions_pt_br:    suggestions,
      specific_enhancements: specificEnhancements,

    raw_extraction: {
      // Job description fields
      required_skills:  jobExtraction.required_skills,
      responsibilities: jobExtraction.responsibilities,
      keywords:         jobExtraction.keywords,
      tools:            jobExtraction.tools,
      seniority:        jobExtraction.seniority,
      // Resume fields
      resume_skills:             resumeExtraction.resume_skills,
      resume_experience_bullets: resumeExtraction.resume_experience_bullets,
      resume_tools:              resumeExtraction.resume_tools,
      resume_titles:             resumeExtraction.resume_titles,
      has_summary:               resumeExtraction.has_summary,
      has_experience_section:    resumeExtraction.has_experience_section,
      has_skills_section:        resumeExtraction.has_skills_section,
      has_education_section:     resumeExtraction.has_education_section,
      bullet_point_count:        resumeExtraction.bullet_point_count,
      word_count:                resumeExtraction.word_count,
    },
  };
}

// ─── Mode B output ─────────────────────────────────────────────────────────────

export interface GeneralOutputInput {
  candidateName?: string | null;
  profession?: string | null;
  structureScore: number;
  strengthLabel: StrengthLabel;
  suggestions: string[];
  specific_recommendations: string[];
  specificEnhancements: string[];
  resumeExtraction: ResumeExtraction;
}

export function buildOutputGeneral(input: GeneralOutputInput) {
  const { candidateName, profession, structureScore, strengthLabel, suggestions, specific_recommendations, specificEnhancements, resumeExtraction } = input;

  return {
    mode:           "general" as const,
    candidate_name: candidateName || null,
    profession:     profession || null,

    final_ats_score: null,
    strength_label:  strengthLabel,

    structure_score: Math.round(structureScore),

    suggestions_pt_br:          suggestions,
    role_recommendations_pt_br: specific_recommendations,
    specific_enhancements:      specificEnhancements,

    raw_extraction: {
      resume_skills:             resumeExtraction.resume_skills,
      resume_experience_bullets: resumeExtraction.resume_experience_bullets,
      resume_tools:              resumeExtraction.resume_tools,
      resume_titles:             resumeExtraction.resume_titles,
      has_summary:               resumeExtraction.has_summary,
      has_experience_section:    resumeExtraction.has_experience_section,
      has_skills_section:        resumeExtraction.has_skills_section,
      has_education_section:     resumeExtraction.has_education_section,
      bullet_point_count:        resumeExtraction.bullet_point_count,
      word_count:                resumeExtraction.word_count,
    },
  };
}
