// lib/ats/modes/suggestions.ts
// AI used ONLY for generating natural-language text.
// Scores and logic are passed IN as arguments — never computed here.

import OpenAI from "openai";
import type { ResumeExtraction } from "../extraction/extract_resume_data";
import type { JobExtraction }    from "../extraction/extract_job_data";

// ─── Mode A suggestions ────────────────────────────────────────────────────────

export interface WithJobSuggestionInput {
  finalScore: number;
  skillsCoverage: number;
  semanticMatch: number;
  structureScore: number;
  skillsMissing: string[];
  resumeExtraction: ResumeExtraction;
  jobExtraction: JobExtraction;
}

export async function generateSuggestionsWithJob(
  client: OpenAI,
  input: WithJobSuggestionInput
): Promise<string[]> {
  const {
    finalScore, skillsCoverage, semanticMatch, structureScore,
    skillsMissing, resumeExtraction,
  } = input;

  const contextLines = [
    `Modo: análise contra descrição de vaga`,
    `Pontuação ATS final: ${Math.round(finalScore)}/100`,
    `Cobertura de habilidades da vaga: ${Math.round(skillsCoverage)}%`,
    `Alinhamento semântico com a vaga: ${Math.round(semanticMatch)}%`,
    `Pontuação de estrutura do currículo: ${Math.round(structureScore)}/100`,
    `Habilidades exigidas pela vaga que não aparecem no currículo: ${
      skillsMissing.slice(0, 6).join(", ") || "nenhuma identificada"
    }`,
    `Tem resumo profissional: ${resumeExtraction.has_summary ? "sim" : "não"}`,
    `Tem seção de experiência: ${resumeExtraction.has_experience_section ? "sim" : "não"}`,
    `Tem seção de habilidades: ${resumeExtraction.has_skills_section ? "sim" : "não"}`,
    `Tem seção de formação: ${resumeExtraction.has_education_section ? "sim" : "não"}`,
    `Número de bullets de experiência: ${resumeExtraction.bullet_point_count}`,
    `Número de palavras: ${resumeExtraction.word_count}`,
  ];

  return callSuggestionsAI(client, contextLines.join("\n"));
}

// ─── Mode B suggestions ────────────────────────────────────────────────────────

export interface GeneralSuggestionInput {
  structureScore: number;
  penalties: string[];
  resumeExtraction: ResumeExtraction;
  profession?: string | null;
}

export interface TieredSuggestions {
  general:  string[];  // 3-4 general structure hints
  specific: string[];  // 4-5 profession-specific resume recommendations
}

export async function generateSuggestionsGeneral(
  client: OpenAI,
  input: GeneralSuggestionInput
): Promise<TieredSuggestions> {
  const { structureScore, penalties, resumeExtraction, profession } = input;

  // ── Tier 1: General structure hints ─────────────────────────────────────
  const structureContext = [
    `Avaliação de estrutura do currículo`,
    `Pontuação: ${Math.round(structureScore)}/100`,
    `Problemas encontrados: ${penalties.join("; ") || "nenhum"}`,
    `Tem resumo profissional: ${resumeExtraction.has_summary ? "sim" : "não"}`,
    `Tem seção de experiência: ${resumeExtraction.has_experience_section ? "sim" : "não"}`,
    `Tem seção de habilidades: ${resumeExtraction.has_skills_section ? "sim" : "não"}`,
    `Tem seção de formação: ${resumeExtraction.has_education_section ? "sim" : "não"}`,
    `Bullets de experiência: ${resumeExtraction.bullet_point_count}`,
    `Palavras no currículo: ${resumeExtraction.word_count}`,
  ].join("\n");

  const generalSuggestions = await callSuggestionsAI(client, structureContext, 3);

  // ── Tier 2: Profession-specific recommendations ─────────────────────────
  let specificSuggestions: string[] = [];
  if (profession?.trim()) {
    const prof = profession.trim();
    const resumeSkills = resumeExtraction.resume_skills.slice(0, 10).join(", ") || "não listadas";
    const resumeTitles = resumeExtraction.resume_titles.slice(0, 3).join(", ") || "não listados";
    const bulletSample = resumeExtraction.resume_experience_bullets.slice(0, 4).join(" | ") || "nenhum";

    const specificContext = [
      `Profissão do candidato: ${prof}`,
      `Habilidades que o candidato tem: ${resumeSkills}`,
      `Cargos que o candidato teve: ${resumeTitles}`,
      `Exemplos de bullets de experiência: ${bulletSample}`,
      ``,
      `Compare o que o candidato tem com o que profissionais de "${prof}" normalmente precisam apresentar no mercado de trabalho.`,
      `Gere 4 a 5 recomendações específicas para ESTE currículo — não conselhos genéricos.`,
      `Exemplos do tipo de recomendação esperada:`,
      `- "Seu currículo menciona X mas não menciona Y — uma competência-chave para ${prof}"`,
      `- "Adicione resultados mensuráveis às suas experiências como ${prof}, como percentuais ou volumes"`,
      `- "Profissionais de ${prof} costumam destacar Z — considere incluir isso"`,
    ].join("\n");

    specificSuggestions = await callSuggestionsAI(client, specificContext, 5);
  }

  return { general: generalSuggestions, specific: specificSuggestions };
}

// ─── Shared AI call ────────────────────────────────────────────────────────────

async function callSuggestionsAI(
  client: OpenAI,
  context: string,
  count: number = 4
): Promise<string[]> {
  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Você é um consultor de carreira especializado no mercado de trabalho brasileiro.
Gere exatamente ${count} sugestões práticas de melhoria de currículo com base nos dados fornecidos.

REGRAS:
- Escreva em português brasileiro, tom direto e humano
- Gere EXATAMENTE ${count} sugestões específicas e acionáveis
- Base CADA sugestão nos dados reais fornecidos — não invente problemas que não existem
- NUNCA afirme que o candidato já tem algo que não foi mencionado
- NUNCA invente habilidades ou experiências que não estão nos dados
- Use linguagem direta: "Adicione...", "Considere...", "Seu currículo menciona X mas não Y..."
- Retorne um JSON com este formato: { "suggestions": ["sugestão 1", "sugestão 2", ...] }`,
      },
      { role: "user", content: context },
    ],
  });

  const raw = JSON.parse(completion.choices[0]?.message?.content || "{}");
  return Array.isArray(raw.suggestions) ? raw.suggestions : [];
}
