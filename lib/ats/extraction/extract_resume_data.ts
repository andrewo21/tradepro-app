// lib/ats/extraction/extract_resume_data.ts
// ONLY file allowed to make AI calls for resume data.
// Accepts raw text. Returns clean JSON. Never scores. Never suggests.

import OpenAI from "openai";
import { truncateText } from "../utils/text_cleaning";

export interface ResumeExtraction {
  resume_skills: string[];
  resume_experience_bullets: string[];
  resume_tools: string[];
  resume_titles: string[];
  has_summary: boolean;
  has_experience_section: boolean;
  has_skills_section: boolean;
  has_education_section: boolean;
  bullet_point_count: number;
  word_count: number;
}

export async function extractResumeData(
  client: OpenAI,
  resumeText: string
): Promise<ResumeExtraction> {
  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0,  // deterministic
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Você é um extrator de dados de currículos brasileiros.
Extraia informações estruturadas do currículo fornecido.

REGRA ABSOLUTA: extraia APENAS o que está presente no texto. Nunca invente nada.
Não gere pontuações. Não gere sugestões. Somente extração.

Retorne um objeto JSON com exatamente estes campos:
{
  "resume_skills": [lista de habilidades e competências explicitamente mencionadas],
  "resume_experience_bullets": [lista de frases/bullets descrevendo experiência profissional],
  "resume_tools": [lista de ferramentas, softwares e tecnologias mencionadas],
  "resume_titles": [lista de cargos/títulos profissionais],
  "has_summary": boolean — true se há seção de resumo ou objetivo profissional,
  "has_experience_section": boolean — true se há seção de experiência profissional,
  "has_skills_section": boolean — true se há seção de habilidades ou competências,
  "has_education_section": boolean — true se há seção de formação acadêmica ou educação,
  "bullet_point_count": integer — número de bullets de experiência encontrados,
  "word_count": integer — número total de palavras no texto
}`,
      },
      {
        role: "user",
        content: truncateText(resumeText),
      },
    ],
  });

  const raw = JSON.parse(completion.choices[0]?.message?.content || "{}");

  return {
    resume_skills:
      Array.isArray(raw.resume_skills) ? raw.resume_skills : [],
    resume_experience_bullets:
      Array.isArray(raw.resume_experience_bullets) ? raw.resume_experience_bullets : [],
    resume_tools:
      Array.isArray(raw.resume_tools) ? raw.resume_tools : [],
    resume_titles:
      Array.isArray(raw.resume_titles) ? raw.resume_titles : [],
    has_summary:            !!raw.has_summary,
    has_experience_section: !!raw.has_experience_section,
    has_skills_section:     !!raw.has_skills_section,
    has_education_section:  !!raw.has_education_section,
    bullet_point_count:     Number(raw.bullet_point_count) || 0,
    word_count:             Number(raw.word_count) || resumeText.trim().split(/\s+/).length,
  };
}
