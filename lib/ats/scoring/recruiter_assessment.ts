// lib/ats/scoring/recruiter_assessment.ts
//
// GPT-4o powered ATS assessment — reads both documents as a senior recruiter.
// Replaces rigid keyword-frequency matching with genuine compatibility analysis.
//
// Why this is better than keyword matching:
//   - "15 years PM experience" satisfies "10+ years required" — a keyword matcher misses this
//   - "$90M portfolio" satisfies "$30M+ projects required" — a keyword matcher misses this
//   - A thin JD (few keywords) gets scored on what it ACTUALLY requires, not penalized
//   - Only real gaps are reported — not missing keywords that aren't genuinely missing

import OpenAI from "openai";

export interface RecruiterAssessment {
  overall_score:  number;         // 0–95, honest compatibility score
  match_summary:  string;         // 2-3 sentence executive summary of the match
  strengths:      string[];       // specific things that match, with evidence from both docs
  gaps:           string[];       // genuine gaps only — things actually missing
  improvements:   string[];       // specific, actionable suggestions
  skills_found:   string[];       // concrete skills the resume demonstrates that the JD needs
  skills_missing: string[];       // concrete skills the JD requires that are genuinely absent
}

export async function runRecruiterAssessment(
  client: OpenAI,
  resumeText: string,
  jobDescription: string,
  locale: string = "en"
): Promise<RecruiterAssessment> {
  const isEN = locale !== "pt-BR";

  const systemPrompt = isEN
    ? buildSystemEN()
    : buildSystemPT();

  const userContent = `JOB DESCRIPTION:
${jobDescription}

---

CANDIDATE RESUME:
${resumeText}`;

  try {
    const completion = await client.chat.completions.create({
      model:           "gpt-4o",
      temperature:     0,   // deterministic — same resume + same JD = same score
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userContent   },
      ],
    });

    const raw = JSON.parse(completion.choices[0]?.message?.content || "{}");

    return {
      overall_score:  clampScore(Number(raw.overall_score) || 0),
      match_summary:  String(raw.match_summary || ""),
      strengths:      toStringArray(raw.strengths),
      gaps:           toStringArray(raw.gaps),
      improvements:   toStringArray(raw.improvements),
      skills_found:   toStringArray(raw.skills_found),
      skills_missing: toStringArray(raw.skills_missing),
    };
  } catch {
    // Graceful fallback — never crash the ATS step
    return {
      overall_score:  0,
      match_summary:  "Assessment could not be completed. Please try again.",
      strengths:      [],
      gaps:           [],
      improvements:   [],
      skills_found:   [],
      skills_missing: [],
    };
  }
}

function clampScore(n: number): number {
  return Math.min(95, Math.max(0, Math.round(n)));
}

function toStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val.map(v => String(v)).filter(Boolean);
}

function buildSystemEN(): string {
  return `You are a senior recruiter and ATS specialist with 20 years of experience evaluating candidates.
Your job is to honestly assess how well a candidate resume matches a job description.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL RULES — READ BEFORE SCORING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. DO NOT DO KEYWORD MATCHING. Read both documents as a human would.
   A JD saying "10+ years in PM role" is satisfied by a resume showing 15 years of PM experience,
   even if the exact words differ. A JD saying "$30M+ projects" is satisfied by "$90M portfolio."

2. THIN JDs ARE NORMAL. Many job descriptions are brief and list mostly experience requirements.
   This does NOT mean the candidate is a poor match. Evaluate what the JD actually requires
   against what the resume actually demonstrates.

3. ONLY REPORT REAL GAPS. A gap is something the role genuinely needs that the resume
   genuinely does not have. "Ability to manage large-scale projects" is NOT a gap if the
   resume shows 15 years of managing large-scale projects. Do not invent gaps.

4. SCORING GUIDE (be honest, not generous):
   - 75-95: Strong match. Candidate demonstrably meets most/all requirements. Hire-ready.
   - 55-74: Good match. Candidate meets core requirements, minor gaps.
   - 35-54: Partial match. Meets some requirements, has notable gaps.
   - 15-34: Weak match. Limited alignment with requirements.
   - 0-14:  Poor match. Candidate does not meet the role's requirements.

5. For skills_found/skills_missing: ONLY list concrete technical skills, certifications,
   and tools — NOT experience requirements or soft skills.
   ❌ skills_missing: "ability to manage projects", "10+ years experience"
   ✅ skills_missing: "PMP certification", "Procore", "AutoCAD"

6. NO HALLUCINATIONS. Every strength and gap must be directly evidenced in the documents.
   Quote specific phrases when citing evidence.

Return JSON:
{
  "overall_score": 0-95,
  "match_summary": "2-3 sentence honest assessment of the fit",
  "strengths": ["Specific match point with evidence — e.g. 'Resume shows $90M+ portfolio; JD requires $30M+ experience'"],
  "gaps": ["Genuine gap with specific evidence — only if truly missing"],
  "improvements": ["Specific, actionable suggestion based on a real gap"],
  "skills_found": ["concrete technical skills/certs in resume that JD also mentions"],
  "skills_missing": ["concrete technical skills/certs the JD requires that resume lacks"]
}`;
}

function buildSystemPT(): string {
  return `Você é um recrutador sênior e especialista em ATS com 20 anos de experiência avaliando candidatos.
Sua função é avaliar com honestidade o alinhamento entre um currículo e uma vaga de emprego.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGRAS CRÍTICAS — LEIA ANTES DE PONTUAR:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. NÃO FAÇA CORRESPONDÊNCIA DE PALAVRAS-CHAVE. Leia os documentos como um humano.
   "10+ anos em gestão de projetos" na vaga é atendido por um currículo com 15 anos de experiência em PM,
   mesmo que as palavras exatas sejam diferentes.

2. VAGAS CURTAS SÃO NORMAIS. Muitas descrições são breves e listam principalmente requisitos de experiência.
   Isso NÃO significa que o candidato é inadequado. Avalie o que a vaga realmente exige.

3. REPORTE APENAS LACUNAS REAIS. Uma lacuna é algo que a vaga genuinamente precisa e o currículo não tem.
   Não invente lacunas.

4. GUIA DE PONTUAÇÃO:
   - 75-95: Forte alinhamento. Candidato demonstravelmente atende a maioria dos requisitos.
   - 55-74: Bom alinhamento. Atende aos requisitos principais, lacunas menores.
   - 35-54: Alinhamento parcial. Atende alguns requisitos, tem lacunas notáveis.
   - 0-34:  Alinhamento fraco ou inadequado.

5. SEM ALUCINAÇÕES. Toda força e lacuna deve ter evidência direta nos documentos.

Retorne JSON:
{
  "overall_score": 0-95,
  "match_summary": "Avaliação honesta em 2-3 frases",
  "strengths": ["Ponto de alinhamento com evidência específica"],
  "gaps": ["Lacuna genuína com evidência — apenas se realmente ausente"],
  "improvements": ["Sugestão específica e acionável"],
  "skills_found": ["habilidades técnicas/certificações do currículo que a vaga também menciona"],
  "skills_missing": ["habilidades técnicas/certificações que a vaga exige e o currículo não tem"]
}`;
}
