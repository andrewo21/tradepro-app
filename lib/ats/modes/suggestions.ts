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
}

export async function generateSuggestionsGeneral(
  client: OpenAI,
  input: GeneralSuggestionInput
): Promise<string[]> {
  const { structureScore, penalties, resumeExtraction } = input;

  const contextLines = [
    `Modo: avaliação geral de qualidade (sem vaga específica)`,
    `Pontuação de estrutura: ${Math.round(structureScore)}/100`,
    `Penalizações aplicadas: ${penalties.join("; ") || "nenhuma"}`,
    `Tem resumo profissional: ${resumeExtraction.has_summary ? "sim" : "não"}`,
    `Tem seção de experiência: ${resumeExtraction.has_experience_section ? "sim" : "não"}`,
    `Tem seção de habilidades: ${resumeExtraction.has_skills_section ? "sim" : "não"}`,
    `Tem seção de formação: ${resumeExtraction.has_education_section ? "sim" : "não"}`,
    `Número de bullets de experiência: ${resumeExtraction.bullet_point_count}`,
    `Número de palavras: ${resumeExtraction.word_count}`,
  ];

  return callSuggestionsAI(client, contextLines.join("\n"));
}

// ─── Shared AI call ────────────────────────────────────────────────────────────

async function callSuggestionsAI(
  client: OpenAI,
  context: string
): Promise<string[]> {
  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Você é um consultor de carreira especializado no mercado de trabalho brasileiro.
Gere sugestões práticas de melhoria de currículo com base nos dados fornecidos.

REGRAS OBRIGATÓRIAS:
- Escreva em português brasileiro, tom caloroso, simples e humano — nunca corporativo
- Gere entre 3 e 6 sugestões específicas e acionáveis
- Base CADA sugestão nos dados reais fornecidos — não invente problemas
- NUNCA afirme que o candidato já tem algo que não foi mencionado
- NUNCA invente habilidades ou experiências que não estão nos dados
- Seja construtivo e encorajador
- Use linguagem direta: "Adicione...", "Tente incluir...", "Considere..."
- Retorne um JSON com este formato: { "suggestions": ["sugestão 1", "sugestão 2", ...] }`,
      },
      { role: "user", content: context },
    ],
  });

  const raw = JSON.parse(completion.choices[0]?.message?.content || "{}");
  return Array.isArray(raw.suggestions) ? raw.suggestions : [];
}
