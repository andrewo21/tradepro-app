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
  locale?: string | null;
}

export async function generateSuggestionsWithJob(
  client: OpenAI,
  input: WithJobSuggestionInput
): Promise<string[]> {
  const {
    finalScore, skillsCoverage, semanticMatch, structureScore,
    skillsMissing, resumeExtraction, locale,
  } = input;
  const isEnglish = locale === "en";

  const contextLines = isEnglish ? [
    `Mode: analysis against job description`,
    `Final ATS score: ${Math.round(finalScore)}/100`,
    `Job skills coverage: ${Math.round(skillsCoverage)}%`,
    `Semantic alignment with job: ${Math.round(semanticMatch)}%`,
    `Resume structure score: ${Math.round(structureScore)}/100`,
    `Skills required by job not in resume: ${skillsMissing.slice(0, 6).join(", ") || "none identified"}`,
    `Has professional summary: ${resumeExtraction.has_summary ? "yes" : "no"}`,
    `Has experience section: ${resumeExtraction.has_experience_section ? "yes" : "no"}`,
    `Has skills section: ${resumeExtraction.has_skills_section ? "yes" : "no"}`,
    `Has education section: ${resumeExtraction.has_education_section ? "yes" : "no"}`,
    `Experience bullet count: ${resumeExtraction.bullet_point_count}`,
    `Word count: ${resumeExtraction.word_count}`,
  ] : [
    `Modo: análise contra descrição de vaga`,
    `Pontuação ATS final: ${Math.round(finalScore)}/100`,
    `Cobertura de habilidades da vaga: ${Math.round(skillsCoverage)}%`,
    `Alinhamento semântico com a vaga: ${Math.round(semanticMatch)}%`,
    `Pontuação de estrutura do currículo: ${Math.round(structureScore)}/100`,
    `Habilidades exigidas pela vaga que não aparecem no currículo: ${skillsMissing.slice(0, 6).join(", ") || "nenhuma identificada"}`,
    `Tem resumo profissional: ${resumeExtraction.has_summary ? "sim" : "não"}`,
    `Tem seção de experiência: ${resumeExtraction.has_experience_section ? "sim" : "não"}`,
    `Tem seção de habilidades: ${resumeExtraction.has_skills_section ? "sim" : "não"}`,
    `Tem seção de formação: ${resumeExtraction.has_education_section ? "sim" : "não"}`,
    `Número de bullets de experiência: ${resumeExtraction.bullet_point_count}`,
    `Número de palavras: ${resumeExtraction.word_count}`,
  ];

  return callSuggestionsAI(client, contextLines.join("\n"), 4, locale);
}

// ─── Mode B suggestions ────────────────────────────────────────────────────────

export interface GeneralSuggestionInput {
  structureScore: number;
  penalties: string[];
  resumeExtraction: ResumeExtraction;
  profession?: string | null;
  locale?: string | null;
}

export interface TieredSuggestions {
  general:  string[];  // 3-4 general structure hints
  specific: string[];  // 4-5 profession-specific resume recommendations
}

export async function generateSuggestionsGeneral(
  client: OpenAI,
  input: GeneralSuggestionInput
): Promise<TieredSuggestions> {
  const { structureScore, penalties, resumeExtraction, profession, locale } = input;
  const isEnglish = locale === "en";

  // ── Tier 1: General structure hints ─────────────────────────────────────
  const structureContext = isEnglish ? [
    `Resume structure evaluation`,
    `Score: ${Math.round(structureScore)}/100`,
    `Issues found: ${penalties.join("; ") || "none"}`,
    `Has professional summary: ${resumeExtraction.has_summary ? "yes" : "no"}`,
    `Has experience section: ${resumeExtraction.has_experience_section ? "yes" : "no"}`,
    `Has skills section: ${resumeExtraction.has_skills_section ? "yes" : "no"}`,
    `Has education section: ${resumeExtraction.has_education_section ? "yes" : "no"}`,
    `Experience bullet count: ${resumeExtraction.bullet_point_count}`,
    `Word count: ${resumeExtraction.word_count}`,
  ].join("\n") : [
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

  const generalSuggestions = await callSuggestionsAI(client, structureContext, 3, locale);

  // ── Tier 2: Profession-specific recommendations ─────────────────────────
  let specificSuggestions: string[] = [];
  if (profession?.trim()) {
    const prof = profession.trim();
    const resumeSkills = resumeExtraction.resume_skills.slice(0, 10).join(", ") || (isEnglish ? "none listed" : "não listadas");
    const resumeTitles = resumeExtraction.resume_titles.slice(0, 3).join(", ") || (isEnglish ? "none listed" : "não listados");
    const bulletSample = resumeExtraction.resume_experience_bullets.slice(0, 4).join(" | ") || (isEnglish ? "none" : "nenhum");

    const specificContext = isEnglish ? [
      `Candidate's profession: ${prof}`,
      `Skills the candidate has listed: ${resumeSkills}`,
      `Previous job titles: ${resumeTitles}`,
      `Sample experience bullets: ${bulletSample}`,
      ``,
      `Compare what the candidate has against what ${prof} professionals typically present.`,
      `Generate 4-5 specific, actionable recommendations for THIS resume — not generic advice.`,
      `Examples of the type of recommendation expected:`,
      `- "Your resume mentions X but doesn't mention Y — a key skill for ${prof}"`,
      `- "Add measurable results to your ${prof} experience bullets — percentages, dollar amounts, team sizes"`,
      `- "${prof} professionals typically highlight Z — consider adding this"`,
    ].join("\n") : [
      `Profissão do candidato: ${prof}`,
      `Habilidades que o candidato tem: ${resumeSkills}`,
      `Cargos que o candidato teve: ${resumeTitles}`,
      `Exemplos de bullets de experiência: ${bulletSample}`,
      ``,
      `Compare o que o candidato tem com o que profissionais de "${prof}" normalmente precisam apresentar.`,
      `Gere 4 a 5 recomendações específicas para ESTE currículo — não conselhos genéricos.`,
    ].join("\n");

    specificSuggestions = await callSuggestionsAI(client, specificContext, 5, locale);
  }

  return { general: generalSuggestions, specific: specificSuggestions };
}

// ─── Shared AI call ────────────────────────────────────────────────────────────

async function callSuggestionsAI(
  client: OpenAI,
  context: string,
  count: number = 4,
  locale?: string | null
): Promise<string[]> {
  const isEnglish = locale === "en";
  const systemPrompt = isEnglish
    ? `You are a career consultant specializing in the US job market.
Generate exactly ${count} practical resume improvement suggestions based on the data provided.

RULES:
- Write in clear, direct American English
- Generate EXACTLY ${count} specific, actionable suggestions
- Base EACH suggestion on real data provided — do not invent problems that don't exist
- NEVER claim the candidate already has something not mentioned
- NEVER invent skills or experience not in the data
- Use direct language: "Add...", "Consider...", "Your resume mentions X but not Y..."
- Return a JSON in this format: { "suggestions": ["suggestion 1", "suggestion 2", ...] }`
    : `Você é um consultor de carreira especializado no mercado de trabalho brasileiro.
Gere exatamente ${count} sugestões práticas de melhoria de currículo com base nos dados fornecidos.

REGRAS:
- Escreva em português brasileiro, tom direto e humano
- Gere EXATAMENTE ${count} sugestões específicas e acionáveis
- Base CADA sugestão nos dados reais fornecidos — não invente problemas que não existem
- NUNCA afirme que o candidato já tem algo que não foi mencionado
- NUNCA invente habilidades ou experiências que não estão nos dados
- Use linguagem direta: "Adicione...", "Considere...", "Seu currículo menciona X mas não Y..."
- Retorne um JSON com este formato: { "suggestions": ["sugestão 1", "sugestão 2", ...] }`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: context },
    ],
  });

  const raw = JSON.parse(completion.choices[0]?.message?.content || "{}");
  return Array.isArray(raw.suggestions) ? raw.suggestions : [];
}
