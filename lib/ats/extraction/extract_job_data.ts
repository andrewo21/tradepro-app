// lib/ats/extraction/extract_job_data.ts
// ONLY file allowed to make AI calls for job description data.
// Accepts raw text. Returns clean JSON. Never scores. Never suggests.

import OpenAI from "openai";
import { truncateText } from "../utils/text_cleaning";

export interface JobExtraction {
  required_skills: string[];           // explicit skills, certs, competencies
  experience_requirements: string[];   // years, project scale, industry background
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
        content: `Você é um extrator de requisitos de vagas de emprego.
Extraia informações estruturadas da descrição da vaga fornecida.

REGRA ABSOLUTA: extraia APENAS o que está no texto. Nunca invente nada.
Não gere pontuações. Não gere sugestões. Somente extração.

IMPORTANTE — required_skills vs experience_requirements:
- required_skills: habilidades, competências, certificações, ferramentas concretas (ex: "PMP", "AutoCAD", "gestão de projetos")
- experience_requirements: requisitos de experiência e contexto (ex: "10+ anos de experiência", "projetos acima de R$5M", "experiência no setor de construção")
  NÃO coloque requisitos de anos/tempo de experiência em required_skills.

Retorne um objeto JSON com exatamente estes campos:
{
  "required_skills": [lista de habilidades, competências e certificações requeridas],
  "experience_requirements": [lista de requisitos de experiência, tempo de trabalho, escala de projetos],
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
    experience_requirements:
      Array.isArray(raw.experience_requirements) ? raw.experience_requirements : [],
    responsibilities:
      Array.isArray(raw.responsibilities) ? raw.responsibilities : [],
    keywords:
      Array.isArray(raw.keywords) ? raw.keywords : [],
    tools:
      Array.isArray(raw.tools) ? raw.tools : [],
    seniority: raw.seniority || null,
  };
}
