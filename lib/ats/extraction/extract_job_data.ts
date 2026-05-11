// lib/ats/extraction/extract_job_data.ts
// ONLY file allowed to make AI calls for job description data.
// Accepts raw text. Returns clean JSON. Never scores. Never suggests.

import OpenAI from "openai";
import { truncateText } from "../utils/text_cleaning";

export interface JobExtraction {
  required_skills: string[];
  responsibilities: string[];
  keywords: string[];
  tools: string[];
  seniority: string | null;
}

export async function extractJobData(
  client: OpenAI,
  jobText: string
): Promise<JobExtraction> {
  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0,  // deterministic
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Você é um extrator de requisitos de vagas de emprego brasileiras.
Extraia informações estruturadas da descrição da vaga fornecida.

REGRA ABSOLUTA: extraia APENAS o que está no texto. Nunca invente nada.
Não gere pontuações. Não gere sugestões. Somente extração.

Retorne um objeto JSON com exatamente estes campos:
{
  "required_skills": [lista de habilidades e competências requeridas],
  "responsibilities": [lista de responsabilidades principais da vaga],
  "keywords": [lista de termos e palavras-chave importantes],
  "tools": [lista de ferramentas, softwares e tecnologias exigidas],
  "seniority": "junior" | "pleno" | "senior" | null — se detectável no texto
}`,
      },
      {
        role: "user",
        content: truncateText(jobText),
      },
    ],
  });

  const raw = JSON.parse(completion.choices[0]?.message?.content || "{}");

  return {
    required_skills:
      Array.isArray(raw.required_skills) ? raw.required_skills : [],
    responsibilities:
      Array.isArray(raw.responsibilities) ? raw.responsibilities : [],
    keywords:
      Array.isArray(raw.keywords) ? raw.keywords : [],
    tools:
      Array.isArray(raw.tools) ? raw.tools : [],
    seniority: raw.seniority || null,
  };
}
