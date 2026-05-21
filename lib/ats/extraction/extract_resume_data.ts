// lib/ats/extraction/extract_resume_data.ts
// ONLY file allowed to make AI calls for resume data.
// Accepts raw text. Returns clean JSON. Never scores. Never suggests.
// Locale-aware: uses English extractor for EN, Portuguese for PT-BR.

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

const SYSTEM_EN = `You are a resume data extractor for English-language resumes.
Extract structured information from the provided resume text.

ABSOLUTE RULE: extract ONLY what is present in the text. Never invent anything.
Do not generate scores. Do not generate suggestions. Extraction only.

Return a JSON object with exactly these fields:
{
  "resume_skills": [list of explicitly mentioned skills and competencies],
  "resume_experience_bullets": [list of phrases/bullets describing professional experience],
  "resume_tools": [list of tools, software, and technologies mentioned],
  "resume_titles": [list of professional job titles],
  "has_summary": boolean — true if a professional summary or objective section exists,
  "has_experience_section": boolean — true if a work experience section exists,
  "has_skills_section": boolean — true if a skills or competencies section exists,
  "has_education_section": boolean — true if an education section exists,
  "bullet_point_count": integer — number of experience bullet points found,
  "word_count": integer — total word count of the text
}`;

const SYSTEM_PT = `Você é um extrator de dados de currículos brasileiros.
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
}`;

export async function extractResumeData(
  client: OpenAI,
  resumeText: string,
  locale: string = "pt-BR"
): Promise<ResumeExtraction> {
  const systemPrompt = locale === "en" ? SYSTEM_EN : SYSTEM_PT;

  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: truncateText(resumeText) },
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
