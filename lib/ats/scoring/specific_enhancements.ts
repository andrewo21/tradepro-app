// lib/ats/scoring/specific_enhancements.ts
// Pure deterministic function. No AI. Same input = same output.
// Generates 4–7 specific, quantified, personalized enhancement suggestions in PT-BR.

import type { ResumeExtraction } from "../extraction/extract_resume_data";
import type { JobExtraction }    from "../extraction/extract_job_data";
import { normalize }             from "../utils/normalize";

export interface EnhancementInput {
  resumeExtraction: ResumeExtraction;
  mode: "with_job" | "general";
  jobExtraction?: JobExtraction;
  skillsMissing?: string[];
  skillsFound?: string[];
}

const MIN_ITEMS = 4;
const MAX_ITEMS = 7;

/**
 * Generate 4–7 specific, quantified enhancement suggestions.
 * Priority order:
 *   1. Individual missing skills (Mode A)
 *   2. Individual missing tools (Mode A)
 *   3. Top unmatched responsibilities (Mode A)
 *   4. Structure gaps: summary, skills section, bullet count, word count
 */
export function computeSpecificEnhancements(input: EnhancementInput): string[] {
  const { resumeExtraction: e, mode, jobExtraction, skillsMissing } = input;
  const items: string[] = [];

  // ── MODE A: Job-specific items ─────────────────────────────────────────────

  if (mode === "with_job") {

    // 1. Individual missing skills — one suggestion per skill (cap at 3)
    const topMissing = (skillsMissing || []).slice(0, 3);
    topMissing.forEach(skill => {
      if (items.length >= MAX_ITEMS) return;
      items.push(
        `Seu currículo não menciona "${skill}", uma habilidade exigida por esta vaga. ` +
        `Se você realmente possui essa habilidade, adicione-a na seção de habilidades — isso pode aumentar sua pontuação em aproximadamente +5 pontos.`
      );
    });

    // 2. Individual missing tools — one suggestion per tool (cap at 2)
    if (jobExtraction?.tools?.length && items.length < MAX_ITEMS) {
      const normResumeTools = e.resume_tools.map(normalize);
      const missingTools = jobExtraction.tools
        .filter(t => !normResumeTools.some(rt =>
          rt.includes(normalize(t)) || normalize(t).includes(rt)
        ))
        .slice(0, 2);

      missingTools.forEach(tool => {
        if (items.length >= MAX_ITEMS) return;
        items.push(
          `A vaga exige conhecimento em "${tool}", que não aparece no seu currículo. ` +
          `Se você já utilizou essa ferramenta, inclua-a nas suas habilidades técnicas ou em um bullet de experiência — isso pode melhorar sua pontuação.`
        );
      });
    }

    // 3. Top unmatched responsibilities (cap at 2)
    if (jobExtraction?.responsibilities?.length && items.length < MAX_ITEMS) {
      const normBullets = e.resume_experience_bullets.map(normalize).join(" ");
      const unmatched = jobExtraction.responsibilities
        .filter(resp => {
          const words = normalize(resp).split(" ").filter(w => w.length > 4);
          return words.filter(w => normBullets.includes(w)).length < 2;
        })
        .slice(0, 2);

      unmatched.forEach(resp => {
        if (items.length >= MAX_ITEMS) return;
        const shortResp = resp.length > 70 ? resp.slice(0, 67) + "..." : resp;
        items.push(
          `A vaga menciona a responsabilidade: "${shortResp}". ` +
          `Essa atividade não aparece no seu currículo. Se você já executou algo parecido, ` +
          `crie um bullet descrevendo como fez — isso pode aumentar sua pontuação em até +5 pontos.`
        );
      });
    }
  }

  // ── STRUCTURE ITEMS (both modes) ──────────────────────────────────────────

  // 4. Low bullet count
  if (e.bullet_point_count < 5 && items.length < MAX_ITEMS) {
    const current = e.bullet_point_count;
    const needed  = 5 - current;
    items.push(
      `Seu currículo tem apenas ${current} tópico${current !== 1 ? "s" : ""} de experiência. ` +
      `Expanda suas experiências com ${needed} tópico${needed !== 1 ? "s" : ""} adicionais — cada responsabilidade descrita concretamente pode aumentar sua pontuação em ~+5 pontos.`
    );
  }

  // 5. Missing summary
  if (!e.has_summary && items.length < MAX_ITEMS) {
    items.push(
      `Seu currículo não possui um resumo profissional. ` +
      `Adicione um parágrafo de 3 a 5 frases descrevendo sua trajetória, principais competências e objetivo — ` +
      `isso pode aumentar sua pontuação estrutural em até +10 pontos.`
    );
  }

  // 6. Missing skills section
  if (!e.has_skills_section && items.length < MAX_ITEMS) {
    items.push(
      `Seu currículo não possui uma seção de habilidades. ` +
      `Crie uma seção com suas principais competências técnicas e comportamentais — ` +
      `isso pode aumentar sua pontuação estrutural em até +15 pontos.`
    );
  }

  // 7. Word count too low
  if (e.word_count < 200 && items.length < MAX_ITEMS) {
    items.push(
      `Seu currículo está muito curto (${e.word_count} palavras — mínimo recomendado: 200). ` +
      `Expanda suas experiências com mais detalhes sobre o que você fez e os resultados que gerou — ` +
      `isso pode aumentar sua pontuação em até +10 pontos.`
    );
  }

  // 8. Word count too high
  if (e.word_count > 1200 && items.length < MAX_ITEMS) {
    items.push(
      `Seu currículo está longo demais (${e.word_count} palavras — máximo recomendado: 1.200). ` +
      `Remova informações redundantes e mantenha apenas o que é mais relevante — ` +
      `isso pode melhorar sua pontuação estrutural em até +10 pontos.`
    );
  }

  // 9. Missing experience section (rare but possible)
  if (!e.has_experience_section && items.length < MAX_ITEMS) {
    items.push(
      `Seu currículo não possui uma seção clara de experiência profissional. ` +
      `Inclua uma seção com seus empregos anteriores, cargos, datas e responsabilidades — ` +
      `isso pode aumentar sua pontuação estrutural em até +20 pontos.`
    );
  }

  // 10. Empty or very few skills on resume (Mode B — no job description)
  if (mode === "general" && e.resume_skills.length < 3 && items.length < MAX_ITEMS) {
    items.push(
      `Seu currículo lista ${e.resume_skills.length === 0 ? "nenhuma" : "poucas"} habilidades. ` +
      `Adicione pelo menos 5 a 8 competências relevantes para sua área — ` +
      `isso torna seu perfil mais visível em buscas e filtros automáticos.`
    );
  }

  // ── Ensure minimum 4 items with fallback fillers ──────────────────────────

  if (items.length < MIN_ITEMS && e.bullet_point_count >= 5 && e.has_summary && e.has_skills_section) {
    // Pad with soft improvements if structure is already good
    if (items.length < MIN_ITEMS) {
      items.push(
        `Inclua resultados mensuráveis em seus tópicos de experiência — ` +
        `números, percentuais, volumes e metas atingidas tornam seu currículo mais impactante e memorável para recrutadores.`
      );
    }
    if (items.length < MIN_ITEMS) {
      items.push(
        `Use verbos de ação no início de cada tópico (Liderou, Implementou, Reduziu, Aumentou, Desenvolveu) — ` +
        `isso torna suas experiências mais dinâmicas e profissionais.`
      );
    }
    if (items.length < MIN_ITEMS) {
      items.push(
        `Se você possui certificações, cursos ou idiomas relevantes, adicione-os em seções dedicadas — ` +
        `esses elementos podem diferenciar seu perfil em processos seletivos.`
      );
    }
    if (items.length < MIN_ITEMS) {
      items.push(
        `Verifique se seu resumo profissional menciona sua área de atuação e seus anos de experiência — ` +
        `recrutadores geralmente leem o resumo antes de qualquer outra seção.`
      );
    }
  }

  return items.slice(0, MAX_ITEMS);
}
