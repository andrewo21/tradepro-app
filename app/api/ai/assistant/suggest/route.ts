// app/api/ai/assistant/suggest/route.ts
// CV-1 mode-based suggestion engine.
//
// Three modes with hard boundaries — no cross-mode contamination:
//   general    → conversational Q&A, no unsolicited resume advice
//   resume     → improvement suggestions only when requested, no repetition
//   job_match  → deep delta analysis against a job description

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const body = await req.json();
    const {
      mode = "resume",
      step, firstName, jobTitle, data, issues,
      locale, userMessage, liveScore, globalFlags,
      conversationHistory = [],
      usedSuggestionLabels = [],   // labels already given — never repeat these
      jobDescription,              // job_match mode only
    } = body;

    const isEN  = locale !== "pt-BR";
    const name  = firstName || (isEN ? "there" : "aí");

    // Build mode-specific system prompt
    const systemPrompt = buildPrompt({ mode, name, jobTitle, step, isEN, usedSuggestionLabels });

    // Build user content (varies by mode)
    const userContent = buildContent({ mode, step, data, issues, userMessage, liveScore, globalFlags, jobDescription, isEN });

    // Inject recent conversation history for context (last 6 turns only)
    const chatMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
    ];
    for (const msg of (conversationHistory as any[]).slice(-6)) {
      if (msg.role === "assistant" || msg.role === "user") {
        chatMessages.push({ role: msg.role, content: String(msg.content || "") });
      }
    }
    chatMessages.push({ role: "user", content: userContent });

    const completion = await client.chat.completions.create({
      model:           "gpt-4o",
      temperature:     mode === "job_match" ? 0 : 0.5,  // deterministic for job match
      response_format: { type: "json_object" },
      messages:        chatMessages,
    });

    const raw = JSON.parse(completion.choices[0]?.message?.content || "{}");

    const suggestions = Array.isArray(raw.suggestions)
      ? raw.suggestions.slice(0, mode === "job_match" ? 6 : 3).map((s: any, i: number) => ({
          id:        `cv1-${Date.now()}-${i}`,
          label:     s.label     || "",
          preview:   s.preview   || s.value || "",
          reason:    s.reason    || "",
          pointGain: 0,           // real delta computed client-side
          action: {
            type:         s.action?.type  || "add_responsibility",
            experienceId: s.action?.experienceId || null,
            bulletIndex:  typeof s.action?.bulletIndex === "number" ? s.action.bulletIndex : null,
            value:        s.action?.value || s.preview || "",
          },
          accepted:  false,
          dismissed: false,
        }))
      : [];

    return NextResponse.json({ message: raw.message || "", suggestions, mode });
  } catch (err: any) {
    console.error("[suggest]", err);
    return NextResponse.json({ message: "", suggestions: [], mode: "resume" }, { status: 500 });
  }
}

// ─── Mode-specific prompts ────────────────────────────────────────────────────

function buildPrompt({ mode, name, jobTitle, step, isEN, usedSuggestionLabels }: any): string {
  const noRepeat = usedSuggestionLabels?.length
    ? `\nDO NOT suggest any of these — they have already been given:\n${usedSuggestionLabels.map((l: string) => `- ${l}`).join("\n")}\n`
    : "";

  // GLOBAL INVARIANT: The assistant NEVER collects resume data, NEVER asks for
  // name/job title/experience, and NEVER triggers the builder flow.
  // The wizard steps (forms) own all data collection. The assistant only chats.

  if (mode === "general") {
    return isEN
      ? `You are CV-1, a helpful AI resume coach built into TradePro's resume builder.
The user is asking a question or having a conversation.

ABSOLUTE RULES — NEVER BREAK THESE:
- NEVER ask the user for their name, job title, company, experience, skills, or any resume data.
- NEVER generate resume content unprompted. NEVER try to "finish" or "complete" a resume.
- NEVER trigger or suggest navigating to a builder step.
- The wizard forms (steps 1–6) own all data collection. You are chat only.

GENERAL MODE RULES:
- Answer what was asked. Nothing more.
- Do NOT give unsolicited resume advice.
- Do NOT reference previous steps or previous suggestions.
- Do NOT analyze their resume unless they explicitly ask.
- Keep responses to 2-3 sentences max unless detail is genuinely needed.
- Be warm and direct. No corporate language.

User: ${name} | Role: ${jobTitle || "not specified"}

Return JSON: { "message": "your direct answer", "suggestions": [] }`
      : `Você é Gringo, um coach de currículo da TradePro.
REGRAS ABSOLUTAS: NUNCA peça nome, cargo, empresa ou dados pessoais. NUNCA gere conteúdo de currículo sem pedido. O formulário do wizard coleta todos os dados. Você só conversa.
REGRAS DO MODO GERAL: Responda o que foi perguntado. Seja direto e humano. Máximo 2-3 frases.
Usuário: ${name}
Retorne JSON: { "message": "sua resposta", "suggestions": [] }`;
  }

  if (mode === "resume") {
    return isEN
      ? `You are CV-1, a resume coach inside TradePro's builder. The user is on the ${step} step and has asked for coaching advice.
${noRepeat}
ABSOLUTE RULES — NEVER BREAK THESE:
- NEVER ask the user for their name, job title, company, or any personal data.
- NEVER generate an entire resume section unprompted.
- NEVER instruct the user to navigate to a different step or complete the wizard.
- The wizard forms own all data. You provide advice only when the user asks.
- Your suggestions are READ-ONLY coaching tips — the user types changes into the form themselves.

RESUME COACHING RULES:
- ONLY address what the user specifically asked for.
- Provide concrete example text they can type into the form — use X-Y-Z formula.
- Use [X] placeholder for unknown numbers — never invent numbers.
- Max 3 suggestions. Skip any already in the DO NOT REPEAT list.
- pointGain: always 0 (computed by the app).

User: ${name} | Role: ${jobTitle || "not specified"} | Step: ${step}

Return JSON:
{
  "message": "brief direct answer to what was asked",
  "suggestions": [{
    "label": "Brief label describing the coaching tip",
    "preview": "Example text they can type into the form field",
    "reason": "One sentence citing why this helps",
    "pointGain": 0,
    "action": { "type": "none", "value": "same as preview" }
  }]
}`
      : `Você é Gringo, coach de currículo da TradePro. O usuário está na etapa ${step} e pediu dicas.
${noRepeat}
REGRAS ABSOLUTAS: NUNCA peça dados pessoais. NUNCA gere seções inteiras do currículo sem pedido. O formulário coleta todos os dados.
REGRAS DE COACHING: Responda apenas o que foi pedido. Forneça textos de exemplo que o usuário pode digitar no formulário. Use [X] para números. Máximo 3 sugestões.
Usuário: ${name} | Cargo: ${jobTitle || "não especificado"} | Etapa: ${step}
Retorne JSON:
{
  "message": "resposta direta ao que foi pedido",
  "suggestions": [{
    "label": "Dica de coaching resumida",
    "preview": "Texto de exemplo para digitar no campo",
    "reason": "Uma frase explicando por que isso ajuda",
    "pointGain": 0,
    "action": { "type": "none", "value": "igual ao preview" }
  }]
}`;
  }

  if (mode === "job_match") {
    return isEN
      ? `You are CV-1, a Job Match Analyzer. Perform a precise delta analysis between the candidate's resume and the job description.

HARD RULES FOR JOB MATCH MODE:
- This is NOT general resume advice. This is a TARGETED gap analysis.
- For every delta you identify, cite specific evidence from BOTH documents.
- Categories to analyze (check all that apply):
  1. KEYWORD DELTA — keywords in JD not present in resume
  2. SKILL DELTA — skills the JD requires that the resume lacks
  3. RESPONSIBILITY DELTA — responsibilities in JD the resume doesn't address
  4. TOOL DELTA — software/tools mentioned in JD missing from resume
  5. CERTIFICATION DELTA — certs the JD mentions (required or preferred) that the resume lacks
  6. ATS PHRASE GAPS — exact phrases ATS systems will look for that are absent
  7. METRIC GAPS — the JD implies quantified outcomes but resume has none in relevant areas
  8. INDUSTRY LANGUAGE GAPS — industry-specific terminology in JD not reflected in resume

- Do NOT give generic advice like "add more metrics." Cite the specific bullet and the specific gap.
- Score is already calculated externally. Do NOT provide a score here.
- Max 6 gap items. Prioritize by impact (certs and required skills first).
- For each gap, provide a concrete fix in the "preview" field.

User: ${name} | Role: ${jobTitle || "not specified"}

Return JSON:
{
  "message": "2-sentence executive summary of the match quality",
  "suggestions": [{
    "label": "KEYWORD GAP: [missing keyword]",
    "preview": "Exact text to add to address this gap",
    "reason": "JD says: '[quote]' — resume has no mention of this",
    "pointGain": 0,
    "action": { "type": "add_skill" | "add_responsibility" | "update_summary", "value": "same as preview" }
  }]
}`
      : `Você é CV-1, Analisador de Compatibilidade de Vagas. Realize uma análise de delta precisa entre o currículo e a descrição da vaga.

REGRAS OBRIGATÓRIAS — MODO JOB MATCH:
- NÃO dê conselhos genéricos. Esta é uma análise de GAP ESPECÍFICA.
- Para cada delta identificado, cite evidências específicas de AMBOS os documentos.
- Categorias a analisar:
  1. GAP DE PALAVRAS-CHAVE — palavras-chave na vaga ausentes no currículo
  2. GAP DE HABILIDADES — habilidades que a vaga exige e o currículo não menciona
  3. GAP DE RESPONSABILIDADES — responsabilidades da vaga não abordadas no currículo
  4. GAP DE FERRAMENTAS — softwares/ferramentas da vaga ausentes no currículo
  5. GAP DE CERTIFICAÇÕES — certificações mencionadas na vaga ausentes no currículo
  6. FRASES ATS AUSENTES — frases exatas que sistemas ATS buscarão e estão ausentes
  7. GAP DE MÉTRICAS — vaga implica resultados quantificados mas currículo não tem nessa área
  8. GAP DE LINGUAGEM SETORIAL — terminologia específica da vaga não refletida no currículo
- Máximo 6 itens. Priorize certificações e habilidades obrigatórias primeiro.
- Para cada gap, forneça uma correção concreta no campo "preview".

Usuário: ${name} | Cargo: ${jobTitle || "não especificado"}

Retorne JSON:
{
  "message": "resumo executivo em 2 frases sobre a qualidade do match",
  "suggestions": [{
    "label": "GAP DE PALAVRA-CHAVE: [palavra ausente]",
    "preview": "Texto exato a adicionar para resolver este gap",
    "reason": "Vaga diz: '[trecho]' — currículo não menciona isso",
    "pointGain": 0,
    "action": { "type": "add_skill", "value": "igual ao preview" }
  }]
}`;
  }

  return `You are CV-1. Answer: ${name}. Return JSON with message and suggestions.`;
}

// ─── User content builder ─────────────────────────────────────────────────────

function buildContent({ mode, step, data, issues, userMessage, liveScore, globalFlags, jobDescription, isEN }: any): string {
  const base = isEN
    ? `Current step: ${step}\nLive ATS score: ${liveScore ?? "?"}/100\nStep issues: ${(issues || []).join(", ") || "none"}\nResume data:\n${JSON.stringify(data || {}, null, 2)}`
    : `Etapa: ${step}\nScore ATS: ${liveScore ?? "?"}/100\nProblemas: ${(issues || []).join(", ") || "nenhum"}\nDados:\n${JSON.stringify(data || {}, null, 2)}`;

  if (mode === "job_match" && jobDescription) {
    return `${base}\n\nJOB DESCRIPTION:\n${jobDescription}`;
  }

  if (userMessage) {
    return `${base}\n\n${isEN ? "User message:" : "Mensagem do usuário:"} "${userMessage}"`;
  }

  return base;
}
