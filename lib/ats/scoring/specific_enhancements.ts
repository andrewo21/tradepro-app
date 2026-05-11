// lib/ats/scoring/specific_enhancements.ts
// Pure deterministic function. No AI. No randomness. Same input = same output.
// Generates quantified, actionable "Specific Enhancements" based on extracted data.

import type { ResumeExtraction } from "../extraction/extract_resume_data";
import type { JobExtraction }    from "../extraction/extract_job_data";
import { normalize }             from "../utils/normalize";

export interface EnhancementInput {
  resumeExtraction: ResumeExtraction;
  mode: "with_job" | "general";
  // Mode A inputs (optional)
  jobExtraction?: JobExtraction;
  skillsMissing?: string[];
  skillsFound?: string[];
}

/**
 * Generate specific, quantified enhancement suggestions based on extracted data.
 *
 * Rules applied in order:
 *  1. Missing skills (Mode A: from job; Mode B: structure only)
 *  2. Bullet point count
 *  3. Missing tools (Mode A)
 *  4. Missing responsibilities (Mode A — top 2 unmatched)
 *  5. Missing summary section
 *  6. Missing skills section
 *  7. Word count too low / too high
 *
 * All point estimates match the structure_score penalty values defined in structure_score.ts.
 */
export function computeSpecificEnhancements(input: EnhancementInput): string[] {
  const { resumeExtraction, mode, jobExtraction, skillsMissing } = input;
  const enhancements: string[] = [];

  // ── 1. Missing skills ─────────────────────────────────────────────────────
  if (mode === "with_job" && skillsMissing && skillsMissing.length > 0) {
    const top = skillsMissing.slice(0, 3);
    if (top.length === 1) {
      enhancements.push(
        `Seu currículo está perdendo a habilidade "${top[0]}". Se você realmente possui essa habilidade, adicione-a — isso pode aumentar sua pontuação em aproximadamente 5 pontos.`
      );
    } else if (top.length >= 2) {
      const listed = top.map(s => `"${s}"`).join(", ");
      enhancements.push(
        `Seu currículo está perdendo habilidades exigidas pela vaga: ${listed}. Se você possui essas habilidades, adicione-as — cada uma pode aumentar sua pontuação em até 5 pontos.`
      );
    }
  }

  // ── 2. Bullet point count ─────────────────────────────────────────────────
  if (resumeExtraction.bullet_point_count < 5) {
    const missing = 5 - resumeExtraction.bullet_point_count;
    enhancements.push(
      `Seu currículo tem apenas ${resumeExtraction.bullet_point_count} tópico${resumeExtraction.bullet_point_count !== 1 ? "s" : ""} de experiência. ` +
      `Adicionar ${missing} tópico${missing !== 1 ? "s" : ""} relevante${missing !== 1 ? "s" : ""} pode aumentar sua pontuação estrutural em cerca de 5 pontos.`
    );
  }

  // ── 3. Missing tools (Mode A only) ───────────────────────────────────────
  if (mode === "with_job" && jobExtraction?.tools?.length) {
    const normResumeTools = resumeExtraction.resume_tools.map(normalize);
    const missingTools = jobExtraction.tools
      .filter(t => !normResumeTools.some(rt => rt.includes(normalize(t)) || normalize(t).includes(rt)))
      .slice(0, 2);

    missingTools.forEach(tool => {
      enhancements.push(
        `A vaga menciona a ferramenta "${tool}", que não aparece no seu currículo. ` +
        `Se você já utilizou essa ferramenta, inclua-a — isso pode melhorar sua pontuação.`
      );
    });
  }

  // ── 4. Missing responsibilities (Mode A only) ─────────────────────────────
  if (mode === "with_job" && jobExtraction?.responsibilities?.length) {
    const normBullets = resumeExtraction.resume_experience_bullets.map(normalize).join(" ");
    const unmatched = jobExtraction.responsibilities
      .filter(resp => {
        const words = normalize(resp).split(" ").filter(w => w.length > 4);
        const matchCount = words.filter(w => normBullets.includes(w)).length;
        return matchCount < 2; // fewer than 2 significant words matched
      })
      .slice(0, 2);

    unmatched.forEach(resp => {
      const shortResp = resp.length > 80 ? resp.slice(0, 77) + "..." : resp;
      enhancements.push(
        `A vaga menciona a responsabilidade: "${shortResp}". ` +
        `Isso não aparece no seu currículo. Se você já executou essa atividade, adicione um tópico descrevendo sua experiência — isso pode aumentar sua pontuação.`
      );
    });
  }

  // ── 5. Missing summary ────────────────────────────────────────────────────
  if (!resumeExtraction.has_summary) {
    enhancements.push(
      `Seu currículo não possui um resumo profissional. ` +
      `Adicionar um resumo claro e direto pode melhorar sua pontuação estrutural em até 10 pontos.`
    );
  }

  // ── 6. Missing skills section ─────────────────────────────────────────────
  if (!resumeExtraction.has_skills_section) {
    enhancements.push(
      `Seu currículo não possui uma seção de habilidades. ` +
      `Adicionar uma lista das suas principais competências pode melhorar sua pontuação estrutural em até 15 pontos.`
    );
  }

  // ── 7. Word count ─────────────────────────────────────────────────────────
  if (resumeExtraction.word_count < 200) {
    enhancements.push(
      `Seu currículo está muito curto (${resumeExtraction.word_count} palavras). ` +
      `Expandir suas experiências com mais detalhes pode melhorar sua pontuação em até 10 pontos.`
    );
  } else if (resumeExtraction.word_count > 1200) {
    enhancements.push(
      `Seu currículo está longo demais (${resumeExtraction.word_count} palavras). ` +
      `Resumir ao essencial pode melhorar sua pontuação estrutural em até 10 pontos.`
    );
  }

  return enhancements;
}
