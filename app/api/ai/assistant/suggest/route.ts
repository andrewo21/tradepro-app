// app/api/ai/assistant/suggest/route.ts
// CV-1 / Gringo assistant — two strict modes:
//
//   QUESTION mode  (default when user types anything specific)
//     → Answer ONLY what was asked. One targeted suggestion max. No scanning.
//
//   ANALYSIS mode  (only when user explicitly requests a review/analysis)
//     → Full resume review. ONE metric suggestion at a time shown as a complete
//       sentence with a visible placeholder. Named employer. User fills in the
//       number before it's applied.

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Keywords that trigger analysis mode
const ANALYSIS_TRIGGERS_EN = [
  "analyze", "analysis", "analyse", "review", "check", "assess",
  "what should i improve", "what needs work", "what's wrong", "whats wrong",
  "give me feedback", "feedback", "grade", "rate my", "evaluate",
  "what can i improve", "how does my resume look", "look at my resume",
  "suggestions", "suggest improvements", "what do you think",
];
const ANALYSIS_TRIGGERS_PT = [
  "analis", "revis", "verific", "avali", "o que precisa melhorar",
  "o que está errado", "o que esta errado", "feedback", "melhorias",
  "sugestões", "sugestoes", "o que você acha", "o que voce acha",
  "como está meu", "como esta meu", "veja meu", "olha meu",
];

function isAnalysisRequest(msg: string, isEN: boolean): boolean {
  if (!msg) return false;
  const lower = msg.toLowerCase();
  const triggers = isEN ? ANALYSIS_TRIGGERS_EN : ANALYSIS_TRIGGERS_PT;
  return triggers.some(t => lower.includes(t));
}

export async function POST(req: NextRequest) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const body = await req.json();
    const {
      mode = "resume",
      step, firstName, jobTitle, data, issues,
      locale, userMessage, liveScore, globalFlags,
      conversationHistory = [],
      usedSuggestionLabels = [],
      jobDescription,
    } = body;

    const isEN = locale !== "pt-BR";
    const name = firstName || (isEN ? "there" : "aí");

    // Determine intent: job_match is always job_match.
    // For resume mode: question vs analysis based on what the user typed.
    const intent = mode === "job_match"
      ? "job_match"
      : isAnalysisRequest(userMessage || "", isEN)
        ? "analysis"
        : "question";

    const systemPrompt = buildPrompt({ intent, name, jobTitle, step, isEN, usedSuggestionLabels });
    const userContent  = buildContent({ intent, step, data, issues, userMessage, liveScore, jobDescription, isEN });

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
      temperature:     intent === "job_match" ? 0 : 0.4,
      response_format: { type: "json_object" },
      messages:        chatMessages,
    });

    const raw = JSON.parse(completion.choices[0]?.message?.content || "{}");

    // Cap: question → 1, analysis → 1, job_match → 6
    const maxSuggestions = intent === "job_match" ? 6 : 1;

    const suggestions = Array.isArray(raw.suggestions)
      ? raw.suggestions.slice(0, maxSuggestions).map((s: any, i: number) => ({
          id:        `cv1-${Date.now()}-${i}`,
          label:     s.label   || "",
          preview:   s.preview || s.value || "",
          reason:    s.reason  || "",
          pointGain: 0,
          action: {
            type:         s.action?.type         || "add_responsibility",
            experienceId: s.action?.experienceId || null,
            bulletIndex:  typeof s.action?.bulletIndex === "number" ? s.action.bulletIndex : null,
            value:        s.action?.value || s.preview || "",
          },
          accepted:  false,
          dismissed: false,
        }))
      : [];

    return NextResponse.json({ message: raw.message || "", suggestions, mode: intent });
  } catch (err: any) {
    console.error("[suggest]", err);
    return NextResponse.json({ message: "", suggestions: [], mode: "resume" }, { status: 500 });
  }
}

// ─── System prompts ────────────────────────────────────────────────────────────

function buildPrompt({ intent, name, jobTitle, step, isEN, usedSuggestionLabels }: any): string {
  const noRepeat = usedSuggestionLabels?.length
    ? `\n${isEN ? "DO NOT suggest any of these — already given:" : "NÃO sugira estes — já foram dados:"}\n${usedSuggestionLabels.map((l: string) => `- ${l}`).join("\n")}\n`
    : "";

  // ── QUESTION MODE ─────────────────────────────────────────────────────────
  if (intent === "question") {
    return isEN
      ? `You are CV-1, a focused resume specialist.
The user has asked you a SPECIFIC question. Your ONLY job is to answer that exact question.

ABSOLUTE RULES — QUESTION MODE:
- Answer ONLY what was asked. Nothing else.
- If they ask about a specific bullet, give ONE polished replacement sentence.
- Do NOT scan their resume for other issues.
- Do NOT mention anything they did not ask about.
- Do NOT return a list of unrelated suggestions.
- If a rewrite is needed, show the EXACT complete sentence — not advice, the real text.
- Keep your message to 2-3 sentences maximum.
- Be direct and human. No corporate language.

User: ${name} | Role: ${jobTitle || "not specified"}

Return JSON:
{
  "message": "direct answer to exactly what was asked (2-3 sentences max)",
  "suggestions": [{
    "label": "Replace bullet at [Job Title] — [Company]",
    "preview": "The complete replacement sentence — every word written out",
    "reason": "one specific reason based on what they asked",
    "pointGain": 0,
    "action": { "type": "add_responsibility", "experienceId": null, "bulletIndex": null, "value": "same as preview" }
  }]
}
Note: suggestions array should be empty [] if no rewrite is needed. Max 1 suggestion.`

      : `Você é Gringo, especialista em currículos.
O usuário fez uma pergunta ESPECÍFICA. Seu ÚNICO trabalho é responder exatamente o que foi perguntado.

REGRAS ABSOLUTAS — MODO PERGUNTA:
- Responda APENAS o que foi perguntado. Nada mais.
- Se pedirem sobre um bullet específico, dê UMA frase de substituição polida.
- NÃO analise o currículo em busca de outros problemas.
- NÃO mencione nada que não foi perguntado.
- NÃO retorne uma lista de sugestões não relacionadas.
- Se precisar reescrever: escreva o TEXTO COMPLETO — não conselhos, o texto real.
- Máximo 2-3 frases na mensagem.
- Seja direto e humano.

Usuário: ${name} | Cargo: ${jobTitle || "não especificado"}

Retorne JSON:
{
  "message": "resposta direta ao que foi perguntado (máx 2-3 frases)",
  "suggestions": [{
    "label": "Substituir bullet em [Cargo] — [Empresa]",
    "preview": "A frase de substituição completa — cada palavra escrita",
    "reason": "um motivo específico baseado no que foi perguntado",
    "pointGain": 0,
    "action": { "type": "add_responsibility", "experienceId": null, "bulletIndex": null, "value": "igual ao preview" }
  }]
}
Nota: suggestions deve ser [] se nenhuma reescrita for necessária. Máx 1 sugestão.`;
  }

  // ── ANALYSIS MODE ─────────────────────────────────────────────────────────
  if (intent === "analysis") {
    return isEN
      ? `You are CV-1, a senior resume strategist. The user has asked you to analyze their resume.

ANALYSIS MODE RULES — READ CAREFULLY:

1. FOCUS ON THE HIGHEST-IMPACT SINGLE ISSUE FIRST.
   Do not return a list of 5 vague observations. Return ONE actionable suggestion.

2. FOR METRIC/NUMBER SUGGESTIONS:
   - If you identify a bullet that would be stronger with a metric (%, $, quantity):
     • Name the specific employer and job title
     • Write the COMPLETE replacement sentence with a visible placeholder: "__%" or "$___" or "[X] units"
     • Tell the user exactly what number to fill in
     • Say: "Fill in the [percentage/dollar amount/number] and I will add this line to your resume."
   - Example of CORRECT format:
     message: "I noticed your experience at Cardella Construction doesn't include any efficiency or cost improvements. Here's a strong addition:
     'Implemented process improvements that reduced material waste by __%, saving approximately $___ annually.'
     Fill in the percentage and dollar amount and I will add this to your resume."
   - Example of WRONG format: "You should add metrics to your bullets at Cardella Construction."

3. ONLY ONE SUGGESTION AT A TIME.
   If there are multiple issues, pick the most impactful one. After the user acts on it,
   they can ask for more.

4. EVERY SUGGESTION MUST BE A COMPLETE SENTENCE.
   Never describe what to write. Write it. The "preview" field must contain the full,
   polished, professional sentence exactly as it would appear on the resume.

5. DO NOT give generic advice like "improve your summary" or "add more skills."
   Every observation must reference a specific section, job, or bullet.

${noRepeat}
User: ${name} | Role: ${jobTitle || "not specified"} | Step: ${step}

Return JSON:
{
  "message": "conversational explanation naming the specific issue and showing the full suggested text with placeholder",
  "suggestions": [{
    "label": "Add to [Job Title] at [Company Name]",
    "preview": "The complete professional sentence with __% or $___ placeholder where user fills in the number",
    "reason": "specific evidence from their resume explaining why this strengthens it",
    "pointGain": 0,
    "action": { "type": "add_responsibility", "experienceId": null, "bulletIndex": null, "value": "same as preview" }
  }]
}`

      : `Você é Gringo, estrategista sênior de currículos. O usuário pediu uma análise do currículo.

REGRAS DO MODO ANÁLISE — LEIA COM ATENÇÃO:

1. FOQUE NO PROBLEMA DE MAIOR IMPACTO PRIMEIRO.
   Não retorne uma lista de 5 observações vagas. Retorne UMA sugestão acionável.

2. PARA SUGESTÕES COM NÚMEROS/MÉTRICAS:
   - Se identificar um bullet que ficaria mais forte com uma métrica (%, R$, quantidade):
     • Nomeie o empregador específico e o cargo
     • Escreva a FRASE COMPLETA de substituição com placeholder visível: "__%", "R$ ___" ou "[X] unidades"
     • Diga ao usuário exatamente qual número preencher
     • Diga: "Preencha o [percentual/valor/número] e eu adiciono esta linha ao seu currículo."
   - Exemplo CORRETO:
     message: "Percebi que sua experiência na Construtora Silva não inclui melhorias de eficiência ou redução de custos. Aqui está uma adição forte:
     'Implementei melhorias de processos que reduziram o desperdício de material em __%, economizando aproximadamente R$ ___ ao ano.'
     Preencha o percentual e o valor e eu adiciono ao seu currículo."
   - Exemplo ERRADO: "Você deveria adicionar métricas à sua experiência na Construtora Silva."

3. APENAS UMA SUGESTÃO POR VEZ.
   Se houver múltiplos problemas, escolha o mais impactante. Depois o usuário pode pedir mais.

4. TODA SUGESTÃO DEVE SER UMA FRASE COMPLETA.
   Nunca descreva o que escrever. Escreva. O campo "preview" deve conter a frase completa e profissional.

5. NÃO dê conselhos genéricos como "melhore seu resumo" ou "adicione mais habilidades."
   Cada observação deve referenciar uma seção, emprego ou bullet específico.

${noRepeat}
Usuário: ${name} | Cargo: ${jobTitle || "não especificado"} | Etapa: ${step}

Retorne JSON:
{
  "message": "explicação conversacional nomeando o problema específico e mostrando o texto sugerido completo com placeholder",
  "suggestions": [{
    "label": "Adicionar em [Cargo] na [Empresa]",
    "preview": "A frase profissional completa com __% ou R$ ___ onde o usuário preenche o número",
    "reason": "evidência específica do currículo explicando por que isso fortalece",
    "pointGain": 0,
    "action": { "type": "add_responsibility", "experienceId": null, "bulletIndex": null, "value": "igual ao preview" }
  }]
}`;
  }

  // ── JOB MATCH MODE ────────────────────────────────────────────────────────
  if (intent === "job_match") {
    return isEN
      ? `You are CV-1, a Job Match Analyzer. Perform a precise delta analysis between the candidate's resume and the job description.

HARD RULES FOR JOB MATCH MODE:
- This is NOT general resume advice. This is a TARGETED gap analysis.
- For every delta you identify, cite specific evidence from BOTH documents.
- Categories to analyze: KEYWORD DELTA, SKILL DELTA, RESPONSIBILITY DELTA, TOOL DELTA,
  CERTIFICATION DELTA, ATS PHRASE GAPS, METRIC GAPS, INDUSTRY LANGUAGE GAPS.
- Do NOT give generic advice. Cite the specific bullet and the specific gap.
- Max 6 gap items. Prioritize certs and required skills first.
- For each gap, write the complete fix text in "preview".

User: ${name} | Role: ${jobTitle || "not specified"}

Return JSON:
{
  "message": "2-sentence executive summary of match quality",
  "suggestions": [{
    "label": "KEYWORD GAP: [missing keyword]",
    "preview": "Exact complete text to add to address this gap",
    "reason": "JD says: '[quote]' — resume has no mention of this",
    "pointGain": 0,
    "action": { "type": "add_skill", "value": "same as preview" }
  }]
}`
      : `Você é Gringo, Analisador de Compatibilidade de Vagas. Realize análise de delta precisa entre currículo e vaga.

REGRAS — MODO JOB MATCH:
- NÃO dê conselhos genéricos. Análise de GAP ESPECÍFICA.
- Para cada delta, cite evidências específicas de AMBOS os documentos.
- Categorias: GAP DE PALAVRAS-CHAVE, HABILIDADES, RESPONSABILIDADES, FERRAMENTAS,
  CERTIFICAÇÕES, FRASES ATS, MÉTRICAS, LINGUAGEM SETORIAL.
- Máximo 6 itens. Certificações e habilidades obrigatórias primeiro.
- "preview" deve conter o texto completo da correção.

Usuário: ${name} | Cargo: ${jobTitle || "não especificado"}

Retorne JSON:
{
  "message": "resumo executivo em 2 frases sobre qualidade do match",
  "suggestions": [{
    "label": "GAP DE PALAVRA-CHAVE: [palavra ausente]",
    "preview": "Texto completo exato a adicionar para resolver este gap",
    "reason": "Vaga diz: '[trecho]' — currículo não menciona",
    "pointGain": 0,
    "action": { "type": "add_skill", "value": "igual ao preview" }
  }]
}`;
  }

  return `You are CV-1. Answer helpfully. Return JSON with message and suggestions.`;
}

// ─── User content builder ──────────────────────────────────────────────────────

function buildContent({ intent, step, data, issues, userMessage, liveScore, jobDescription, isEN }: any): string {
  // Question mode: only send the specific question + minimal context (no full data dump)
  if (intent === "question") {
    const context = isEN
      ? `Current step: ${step}\nRole: ${data?.personalInfo?.tradeTitle || data?.personalInfo?.tituloProfissional || "not specified"}`
      : `Etapa: ${step}\nCargo: ${data?.personalInfo?.tituloProfissional || "não especificado"}`;
    const resumeSnippet = data ? `\nResume excerpt:\n${JSON.stringify(data, null, 2)}` : "";
    return `${context}${resumeSnippet}\n\n${isEN ? "User question:" : "Pergunta do usuário:"} "${userMessage}"`;
  }

  // Analysis mode: send full resume data
  const base = isEN
    ? `Current step: ${step}\nLive score: ${liveScore ?? "?"}/100\nIssues flagged: ${(issues || []).join(", ") || "none"}\nFull resume data:\n${JSON.stringify(data || {}, null, 2)}`
    : `Etapa: ${step}\nPontuação: ${liveScore ?? "?"}/100\nProblemas: ${(issues || []).join(", ") || "nenhum"}\nDados completos:\n${JSON.stringify(data || {}, null, 2)}`;

  if (intent === "job_match" && jobDescription) {
    return `${base}\n\nJOB DESCRIPTION:\n${jobDescription}`;
  }

  if (userMessage) {
    return `${base}\n\n${isEN ? "User request:" : "Solicitação:"} "${userMessage}"`;
  }

  return base;
}
