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

  if (mode === "general") {
    return isEN
      ? `You are CV-1, a helpful AI assistant built into a professional resume builder.
The user is asking a question or having a conversation.

HARD RULES FOR GENERAL MODE:
- Answer what was asked. Nothing more.
- Do NOT give unsolicited resume advice.
- Do NOT reference previous steps or previous suggestions.
- Do NOT analyze their resume unless they explicitly ask "what do you think of my resume" or similar.
- If they ask a factual question, answer it directly in plain English.
- Keep responses to 2-3 sentences max unless a detailed answer is genuinely needed.
- Be warm and human. No corporate language.

User: ${name} | Role: ${jobTitle || "not specified"}

Return JSON: { "message": "your direct answer", "suggestions": [] }`
      : `Você é CV-1, um assistente de IA útil. O usuário está fazendo uma pergunta ou conversando.
REGRAS: Responda o que foi perguntado. Não dê conselhos de currículo não solicitados. Seja direto e humano.
User: ${name}
Retorne JSON: { "message": "sua resposta", "suggestions": [] }`;
  }

  if (mode === "resume") {
    return isEN
      ? `You are CV-1, a resume coach. The user has asked for a specific improvement on the ${step} step.
${noRepeat}
HARD RULES FOR RESUME OPTIMIZATION MODE:
- ONLY address what the user specifically asked for.
- Write the actual replacement text — never describe what to write.
- Use X-Y-Z formula: Action verb + what they did + result/scale.
- Use [X] placeholder for unknown numbers — never invent numbers.
- If bullet needs improvement: show "current" vs "proposed" clearly.
- Max 3 suggestions. Skip any that match the DO NOT REPEAT list above.
- pointGain: always 0 (UI computes real delta).
- Certifications are 2x more valuable than generic skills — flag them explicitly.

User: ${name} | Role: ${jobTitle || "not specified"} | Step: ${step}

Return JSON:
{
  "message": "brief direct response to what was asked",
  "suggestions": [{
    "label": "Replace at [Job Title], [Company] OR Add [skill/cert]",
    "preview": "COMPLETE replacement text — no advice, the actual words",
    "reason": "one specific sentence citing evidence from their resume",
    "pointGain": 0,
    "action": { "type": "...", "experienceId": "...", "bulletIndex": 0, "value": "same as preview" }
  }]
}`
      : `Você é CV-1, coach de currículo. O usuário pediu uma melhoria específica na etapa ${step}.
${noRepeat}
REGRAS OBRIGATÓRIAS — MODO OTIMIZAÇÃO:
- Melhore APENAS o que foi solicitado. Nada mais.
- Escreva o TEXTO REAL de substituição — nunca descreva o que escrever, escreva o texto.
- Fórmula X-Y-Z: verbo de ação + o que fez + resultado/escala.
- Use [X] como placeholder para números desconhecidos — jamais invente números.
- Máximo 3 sugestões. Pule qualquer uma que esteja na lista NÃO REPITA acima.
- pointGain: sempre 0 (calculado pelo cliente).
- Certificações valem 2x mais que habilidades genéricas.

Usuário: ${name} | Cargo: ${jobTitle || "não especificado"} | Etapa: ${step}

Retorne JSON:
{
  "message": "resposta direta ao que foi pedido",
  "suggestions": [{
    "label": "Substituir em [Cargo], [Empresa] OU Adicionar [habilidade/cert]",
    "preview": "TEXTO COMPLETO de substituição — as palavras exatas, não conselhos",
    "reason": "uma frase específica citando evidência do currículo",
    "pointGain": 0,
    "action": { "type": "...", "experienceId": "...", "bulletIndex": 0, "value": "igual ao preview" }
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
