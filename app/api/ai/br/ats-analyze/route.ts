export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ATSInput {
  resumeText: string;
  jobDescription?: string | null;
  candidateName?: string | null;
  jobTitle?: string | null;
  companyName?: string | null;
  date?: string | null;
}

interface ResumeExtraction {
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

interface JobExtraction {
  required_skills: string[];
  responsibilities: string[];
  keywords: string[];
  tools: string[];
  seniority: string | null;
}

// ─── Normalization ─────────────────────────────────────────────────────────────

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/[.,;:!?()\[\]{}'"`]/g, "").replace(/\s+/g, " ");
}

function normalizeList(arr: string[]): string[] {
  return [...new Set(arr.map(normalize).filter(Boolean))];
}

// Common Portuguese synonyms for skill matching
const SYNONYM_GROUPS: string[][] = [
  ["atendimento ao cliente", "customer service", "suporte ao cliente", "atendimento"],
  ["gestão de projetos", "gerenciamento de projetos", "project management"],
  ["liderança", "lider", "liderar", "liderança de equipe", "gestão de equipe"],
  ["excel", "microsoft excel", "planilha excel", "excel avançado"],
  ["pacote office", "microsoft office", "office", "ms office"],
  ["inglês", "ingles", "english", "idioma inglês"],
  ["comunicação", "comunicacao", "habilidade de comunicação"],
  ["trabalho em equipe", "trabalho em time", "teamwork", "colaboração"],
  ["redes sociais", "social media", "mídias sociais"],
  ["análise de dados", "data analysis", "analise de dados"],
];

function expandSynonyms(term: string): string[] {
  const normalized = normalize(term);
  for (const group of SYNONYM_GROUPS) {
    if (group.some(s => normalize(s) === normalized)) {
      return group.map(normalize);
    }
  }
  return [normalized];
}

function skillAppearsIn(skill: string, texts: string[]): boolean {
  const variants = expandSynonyms(skill);
  const combined = normalize(texts.join(" "));
  return variants.some(v => combined.includes(v));
}

// ─── Structure Score ──────────────────────────────────────────────────────────
// Formula-based, deterministic. Same input = same output.

function computeStructureScore(e: ResumeExtraction): number {
  let score = 100;
  if (!e.has_summary)           score -= 10;
  if (!e.has_experience_section) score -= 20;
  if (!e.has_skills_section)    score -= 15;
  if (!e.has_education_section) score -= 10;
  if (e.bullet_point_count < 5) score -= 10;
  if (e.word_count < 200 || e.word_count > 1200) score -= 10;
  return Math.max(0, Math.min(100, score));
}

// ─── Strength Label ────────────────────────────────────────────────────────────

function strengthLabel(score: number): "Forte" | "Mediano" | "Precisa de ajustes" {
  if (score >= 80) return "Forte";
  if (score >= 50) return "Mediano";
  return "Precisa de ajustes";
}

// ─── Cosine Similarity ─────────────────────────────────────────────────────────

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ─── AI: Extract resume data ───────────────────────────────────────────────────
// AI used ONLY for extraction, not for scoring.

async function extractResumeData(client: OpenAI, resumeText: string): Promise<ResumeExtraction> {
  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0, // deterministic
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Você é um extrator de dados de currículos brasileiros.
Extraia informações estruturadas do currículo fornecido.
REGRA ABSOLUTA: extraia APENAS o que está presente no texto. Nunca invente nada.

Retorne um objeto JSON com exatamente estes campos:
{
  "resume_skills": [lista de habilidades e competências mencionadas],
  "resume_experience_bullets": [lista de frases/bullets descrevendo experiência profissional],
  "resume_tools": [lista de ferramentas, softwares e tecnologias mencionadas],
  "resume_titles": [lista de cargos/títulos profissionais],
  "has_summary": boolean (true se há seção de resumo ou objetivo profissional),
  "has_experience_section": boolean (true se há seção de experiência profissional),
  "has_skills_section": boolean (true se há seção de habilidades ou competências),
  "has_education_section": boolean (true se há seção de formação acadêmica ou educação),
  "bullet_point_count": número inteiro de bullets de experiência encontrados,
  "word_count": número total de palavras no texto
}`,
      },
      { role: "user", content: resumeText.slice(0, 10000) },
    ],
  });

  const raw = JSON.parse(completion.choices[0]?.message?.content || "{}");
  return {
    resume_skills:             Array.isArray(raw.resume_skills)             ? raw.resume_skills             : [],
    resume_experience_bullets: Array.isArray(raw.resume_experience_bullets) ? raw.resume_experience_bullets : [],
    resume_tools:              Array.isArray(raw.resume_tools)              ? raw.resume_tools              : [],
    resume_titles:             Array.isArray(raw.resume_titles)             ? raw.resume_titles             : [],
    has_summary:           !!raw.has_summary,
    has_experience_section: !!raw.has_experience_section,
    has_skills_section:    !!raw.has_skills_section,
    has_education_section: !!raw.has_education_section,
    bullet_point_count: Number(raw.bullet_point_count) || 0,
    word_count:         Number(raw.word_count) || resumeText.trim().split(/\s+/).length,
  };
}

// ─── AI: Extract job description data ─────────────────────────────────────────

async function extractJobData(client: OpenAI, jobText: string): Promise<JobExtraction> {
  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Você é um extrator de requisitos de vagas de emprego brasileiras.
Extraia informações estruturadas da descrição da vaga fornecida.
REGRA ABSOLUTA: extraia APENAS o que está no texto. Nunca invente nada.

Retorne um objeto JSON com exatamente estes campos:
{
  "required_skills": [lista de habilidades e competências requeridas],
  "responsibilities": [lista de responsabilidades principais da vaga],
  "keywords": [lista de termos e palavras-chave importantes],
  "tools": [lista de ferramentas, softwares e tecnologias exigidas],
  "seniority": "junior" | "pleno" | "senior" | null (se detectável no texto)
}`,
      },
      { role: "user", content: jobText.slice(0, 10000) },
    ],
  });

  const raw = JSON.parse(completion.choices[0]?.message?.content || "{}");
  return {
    required_skills:  Array.isArray(raw.required_skills)  ? raw.required_skills  : [],
    responsibilities: Array.isArray(raw.responsibilities) ? raw.responsibilities : [],
    keywords:         Array.isArray(raw.keywords)         ? raw.keywords         : [],
    tools:            Array.isArray(raw.tools)            ? raw.tools            : [],
    seniority: raw.seniority || null,
  };
}

// ─── AI: Generate suggestions in PT-BR ────────────────────────────────────────
// AI used ONLY for natural-language output. Scores and logic come from formulas.

async function generateSuggestions(
  client: OpenAI,
  mode: "with_job" | "general",
  scores: { skillsCoverage?: number; semanticMatch?: number; structure: number; finalScore?: number },
  data: { skillsMissing?: string[]; resumeExtraction: ResumeExtraction; jobExtraction?: JobExtraction }
): Promise<string[]> {

  const contextLines = mode === "with_job" ? [
    `Modo: análise contra descrição de vaga`,
    `Pontuação ATS final: ${scores.finalScore?.toFixed(0)}/100`,
    `Cobertura de habilidades da vaga: ${scores.skillsCoverage?.toFixed(0)}%`,
    `Alinhamento semântico com a vaga: ${scores.semanticMatch?.toFixed(0)}%`,
    `Pontuação de estrutura do currículo: ${scores.structure}/100`,
    `Habilidades exigidas pela vaga que não aparecem no currículo: ${data.skillsMissing?.slice(0, 6).join(", ") || "nenhuma identificada"}`,
    `Tem resumo profissional: ${data.resumeExtraction.has_summary ? "sim" : "não"}`,
    `Tem seção de experiência: ${data.resumeExtraction.has_experience_section ? "sim" : "não"}`,
    `Tem seção de habilidades: ${data.resumeExtraction.has_skills_section ? "sim" : "não"}`,
    `Tem seção de formação: ${data.resumeExtraction.has_education_section ? "sim" : "não"}`,
    `Número de bullets de experiência: ${data.resumeExtraction.bullet_point_count}`,
    `Número de palavras: ${data.resumeExtraction.word_count}`,
  ] : [
    `Modo: avaliação geral de qualidade (sem vaga específica)`,
    `Pontuação de estrutura: ${scores.structure}/100`,
    `Tem resumo profissional: ${data.resumeExtraction.has_summary ? "sim" : "não"}`,
    `Tem seção de experiência: ${data.resumeExtraction.has_experience_section ? "sim" : "não"}`,
    `Tem seção de habilidades: ${data.resumeExtraction.has_skills_section ? "sim" : "não"}`,
    `Tem seção de formação: ${data.resumeExtraction.has_education_section ? "sim" : "não"}`,
    `Número de bullets de experiência: ${data.resumeExtraction.bullet_point_count}`,
    `Número de palavras: ${data.resumeExtraction.word_count}`,
  ];

  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Você é um consultor de carreira especializado no mercado de trabalho brasileiro.
Gere sugestões práticas de melhoria para o currículo com base nos dados fornecidos.

REGRAS:
- Escreva em português brasileiro, tom caloroso, simples e humano — nunca corporativo
- Gere entre 3 e 6 sugestões específicas e acionáveis
- Base CADA sugestão nos dados reais fornecidos — não invente problemas inexistentes
- NUNCA afirme que o candidato já tem algo que não foi mencionado
- Seja construtivo e encorajador
- Use linguagem direta: "Adicione...", "Tente incluir...", "Considere..."
- Retorne: { "suggestions": ["sugestão 1", "sugestão 2", ...] }`,
      },
      { role: "user", content: contextLines.join("\n") },
    ],
  });

  const raw = JSON.parse(completion.choices[0]?.message?.content || "{}");
  return Array.isArray(raw.suggestions) ? raw.suggestions : [];
}

// ─── Main handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI não configurado." }, { status: 500 });
    }

    const body: ATSInput = await req.json();
    const { resumeText, jobDescription, candidateName, jobTitle, companyName, date } = body;

    if (!resumeText?.trim()) {
      return NextResponse.json({ error: "Texto do currículo é obrigatório." }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const hasJob = !!(jobDescription?.trim());

    // ── Extract resume data (both modes) — AI for extraction only ──────────────
    const resumeExtraction = await extractResumeData(client, resumeText);

    // ── Structure score — pure formula, no AI ──────────────────────────────────
    const structureScore = computeStructureScore(resumeExtraction);

    // ══════════════════════════════════════════════════════════════════════════
    // MODE B — General strength (no job description)
    // ══════════════════════════════════════════════════════════════════════════
    if (!hasJob) {
      const label = strengthLabel(structureScore);
      const suggestions = await generateSuggestions(
        client, "general",
        { structure: structureScore },
        { resumeExtraction }
      );

      return NextResponse.json({
        mode: "general",
        candidate_name: candidateName || null,
        final_ats_score: null,
        strength_label: label,
        structure_score: Math.round(structureScore),
        suggestions_pt_br: suggestions,
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
      });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // MODE A — Full ATS analysis with job description
    // ══════════════════════════════════════════════════════════════════════════

    // Step 1: Extract job data — AI for extraction only
    const jobExtraction = await extractJobData(client, jobDescription!);

    // Step 2: Normalize
    const normRequiredSkills = normalizeList(jobExtraction.required_skills);
    const normResumeSkills   = normalizeList(resumeExtraction.resume_skills);
    const normResumeBullets  = normalizeList(resumeExtraction.resume_experience_bullets);
    const resumeSearchPool   = [...normResumeSkills, ...normResumeBullets];

    // Step 3: Skills coverage score — pure formula
    let skillsCoverageScore = 0;
    const skillsFound: string[] = [];
    const skillsMissing: string[] = [];

    if (normRequiredSkills.length > 0) {
      for (const skill of normRequiredSkills) {
        if (skillAppearsIn(skill, resumeSearchPool)) {
          skillsFound.push(skill);
        } else {
          skillsMissing.push(skill);
        }
      }
      skillsCoverageScore = Math.min(100, (skillsFound.length / normRequiredSkills.length) * 100);
    }

    // Step 4: Semantic match score — embeddings + cosine similarity
    // Falls back to safe neutral default (50) if embeddings fail
    let semanticMatchScore = 50;
    try {
      const [resumeEmb, jobEmb] = await Promise.all([
        client.embeddings.create({
          model: "text-embedding-3-small",
          input: resumeText.slice(0, 8000),
        }),
        client.embeddings.create({
          model: "text-embedding-3-small",
          input: jobDescription!.slice(0, 8000),
        }),
      ]);

      const similarity = cosineSimilarity(
        resumeEmb.data[0].embedding,
        jobEmb.data[0].embedding
      );
      // text-embedding-3-small cosine similarity for related texts typically 0.5–1.0
      // Map linearly: 0.5 → 0, 1.0 → 100
      semanticMatchScore = Math.min(100, Math.max(0, (similarity - 0.5) * 200));
    } catch {
      // Keep safe default of 50
    }

    // Step 5: Structure score already computed above

    // Step 6: Final ATS score — weighted formula
    const finalScore = Math.min(100, Math.max(0,
      (skillsCoverageScore * 0.4) +
      (semanticMatchScore  * 0.4) +
      (structureScore      * 0.2)
    ));

    // Step 7: Strength label
    const label = strengthLabel(finalScore);

    // Step 8: AI suggestions — based on formula results, not AI-guessed scores
    const suggestions = await generateSuggestions(
      client, "with_job",
      {
        skillsCoverage: skillsCoverageScore,
        semanticMatch:  semanticMatchScore,
        structure:      structureScore,
        finalScore,
      },
      { skillsMissing, resumeExtraction, jobExtraction }
    );

    // Step 9: Structured output
    return NextResponse.json({
      mode: "with_job",
      candidate_name: candidateName || null,
      job_title:      jobTitle      || null,
      company_name:   companyName   || null,
      date:           date          || null,

      final_ats_score:       Math.round(finalScore),
      strength_label:        label,

      skills_coverage_score: Math.round(skillsCoverageScore),
      semantic_match_score:  Math.round(semanticMatchScore),
      structure_score:       Math.round(structureScore),

      skills_found:   skillsFound,
      skills_missing: skillsMissing,

      suggestions_pt_br: suggestions,

      raw_extraction: {
        required_skills:           jobExtraction.required_skills,
        responsibilities:          jobExtraction.responsibilities,
        keywords:                  jobExtraction.keywords,
        tools:                     jobExtraction.tools,
        seniority:                 jobExtraction.seniority,
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
    });

  } catch (err: any) {
    const detail = err?.message || String(err);
    console.error("br/ats-analyze error:", detail);
    return NextResponse.json({ error: "Análise falhou.", detail }, { status: 500 });
  }
}
