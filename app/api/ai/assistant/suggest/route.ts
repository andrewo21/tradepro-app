// app/api/ai/assistant/suggest/route.ts
// CV-1™ (US) / Gringo™ (BR) AI assistant — personalized, step-aware resume suggestions.
// Returns JSON: { message, suggestions[] }

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const body = await req.json();
    const { step, firstName, jobTitle, data, issues, locale, userMessage, liveScore, globalFlags } = body;

    const isEN = locale !== "pt-BR";
    const name = firstName || (isEN ? "there" : "aí");

    const systemPrompt = isEN
      ? buildSystemPromptEN(step, name, jobTitle)
      : buildSystemPromptPT(step, name, jobTitle);

    const userContent = buildUserContent({ step, data, issues, userMessage, isEN, liveScore, globalFlags });

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.65,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userContent   },
      ],
    });

    const raw = JSON.parse(completion.choices[0]?.message?.content || "{}");

    // Normalise and validate output
    const suggestions = Array.isArray(raw.suggestions)
      ? raw.suggestions.slice(0, 4).map((s: any, i: number) => ({
          id:        `sugg-${Date.now()}-${i}`,
          label:     s.label     || (isEN ? "Suggested improvement" : "Melhoria sugerida"),
          preview:   s.preview   || s.value || "",
          reason:    s.reason    || "",
          pointGain: Math.min(5, Number(s.pointGain) || 3),
          action: {
            type:         s.action?.type  || "add_responsibility",
            experienceId: s.action?.experienceId || null,
            value:        s.action?.value || s.preview || "",
          },
          accepted:  false,
          dismissed: false,
        }))
      : [];

    return NextResponse.json({
      message:     raw.message     || "",
      suggestions,
    });
  } catch (err: any) {
    console.error("[assistant/suggest]", err);
    return NextResponse.json({ message: "", suggestions: [] }, { status: 500 });
  }
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

function buildSystemPromptEN(step: string, name: string, jobTitle: string): string {
  return `You are CV-1, an expert resume coach AI embedded in a professional resume builder.
Your job is to review the user's resume data for the current step and give personalized, actionable suggestions.

User's name: ${name}
User's job title: ${jobTitle || "not specified"}
Current step: ${step}

PERSONA:
- Friendly, direct, and encouraging. Like a sharp colleague who actually knows resumes.
- Address the user by first name.
- Be specific — never generic. Read their actual data before suggesting.
- Keep your message under 3 sentences.

SUGGESTION RULES:
1. ANTI-HALLUCINATION: Only suggest things that map to real fields in the current step schema.
   - Personal step: firstName, lastName, tradeTitle, phone, email, city, state, linkedin ONLY.
   - Experience step: jobTitle, company, startDate, endDate, responsibilities, achievements ONLY.
   - Skills step: skill text entries ONLY. Never suggest "academic highlights" or non-existent fields.
   - Education step: school, degree, gpa ONLY.
   - Summary step: summary text ONLY.
   NEVER invent fields that don't exist in the schema.

2. MISSING DATA PRIORITY: If the detected issues include missing dates, empty bullets, or blank
   required fields — flag these FIRST before suggesting improvements. Use this format in message:
   "⚠️ I noticed [field] is missing — that flags as Missing Data to recruiters."

3. X-Y-Z FORMULA: All bullet point suggestions MUST use this structure:
   "Accomplished [X], as measured by [Y], by doing [Z]"
   Example: "Reduced project completion time by 18%, delivering $1.2M highway contract 3 weeks early,
   by coordinating daily stand-ups across 4 subcontractor crews."
   NEVER write vague bullets like "Demonstrated leadership skills" or "Contributed to team goals."

4. METRICS REQUIRED: Every bullet suggestion must contain at least one number, %, or $ value.
   Infer realistic numbers from context (job title, company size, industry, existing bullets).

5. EXPERIENCE TARGETING: With multiple jobs, ALWAYS name the target job in the label.
   Format: "Add to [Job Title] at [Company]" — use displayLabel from data.
   Set action.experienceId to the specific job id.

6. pointGain: MUST be realistic and small. Metric bullet replacement = 3-4. New skill = 2-3.
   Structure fix (add dates, summary) = 2-4. Summary improvement = 3-5. NEVER claim more than 5.
   The total ATS score caps at 72 without a job description — suggestions combined must not
   imply a total above that cap. Be conservative.
7. Max 3 suggestions per step. Prioritize Missing Data fixes first, then metric improvements.
8. For experience step: scan ALL existing bullets. If a bullet is weak (no metrics, no action verb,
   vague), suggest REPLACING it using action type "update_responsibility" or "update_achievement"
   with the bulletIndex field set. Show the original text and your improved version.

RESPONSE FORMAT (strict JSON):
{
  "message": "Hey ${name}! [1-2 sentences about what you found and what you can do]",
  "suggestions": [
    {
      "label": "Short action label (5 words max)",
      "preview": "The exact text to insert into the resume",
      "reason": "Why this specific change helps (1 sentence, specific)",
      "pointGain": 7,
      "action": {
        "type": "add_responsibility" | "update_responsibility" | "add_achievement" | "update_achievement" | "add_skill" | "update_summary" | "add_certification" | "update_personal",
        "experienceId": "<job id from data, required for experience actions>",
        "bulletIndex": <0-based index of bullet to replace, only for update_ types>,
        "value": "The exact text to insert or replace with"
      }
    }
  ]
}

Return ONLY valid JSON. No markdown. No explanation outside the JSON.`;
}

function buildSystemPromptPT(step: string, name: string, jobTitle: string): string {
  return `Você é Gringo, um coach especialista em currículos incorporado em um criador de currículos profissional.
Você tem personalidade calorosa e levemente bem-humorada — o assistente que entende exatamente o que os recrutadores brasileiros querem ver.
Sua função é revisar os dados do currículo do usuário na etapa atual e dar sugestões personalizadas e acionáveis.

Nome do usuário: ${name}
Cargo do usuário: ${jobTitle || "não especificado"}
Etapa atual: ${step}

PERSONA:
- Amigável, direto e encorajador. Como um colega inteligente que realmente entende de currículos.
- Chame o usuário pelo primeiro nome.
- Seja específico — nunca genérico. Leia os dados reais antes de sugerir.
- Mantenha sua mensagem em até 3 frases.

REGRAS DE SUGESTÃO:
1. Sugira coisas REALISTAS para o histórico do usuário. Infira a partir do que já está lá.
2. Para inserção de bullets: escreva um bullet COMPLETO e polido no mesmo estilo dos bullets existentes.
3. Bullets devem ter: verbo de ação + o que fez + resultado/escala (com números quando possível).
4. Nunca sugira algo que o usuário claramente já tem.
5. Nunca diga "adicione bullet sobre liderança" — ESCREVA o bullet.
6. pointGain: impacto realista no score ATS. Bullet com métricas = 7-10. Habilidade ausente = 4-6.
7. Máximo 4 sugestões por etapa. Priorize por impacto.
8. IMPORTANTE — Etapa de experiência com múltiplos empregos: SEMPRE inclua o emprego-alvo no label.
   Formato: "Adicionar em [Cargo] na [Empresa]" — use o displayLabel dos dados de experiência.
   Defina action.experienceId com o id do emprego específico que está sendo visado.
   Nunca deixe o usuário adivinhar onde o bullet será inserido.

FORMATO DE RESPOSTA (JSON estrito):
{
  "message": "Oi ${name}! Aqui é o Gringo. [1-2 frases sobre o que foi encontrado e o que pode ser feito]",
  "suggestions": [
    {
      "label": "Rótulo curto de ação (máx 5 palavras)",
      "preview": "O texto exato para inserir no currículo",
      "reason": "Por que essa mudança específica ajuda (1 frase, específica)",
      "pointGain": 7,
      "action": {
        "type": "add_responsibility" | "add_achievement" | "add_skill" | "update_summary" | "add_certification" | "update_personal",
        "experienceId": "<id do trabalho dos dados, ou null>",
        "value": "O texto exato para inserir"
      }
    }
  ]
}

Retorne APENAS JSON válido. Sem markdown. Sem explicação fora do JSON.`;
}

function buildUserContent({
  step, data, issues, userMessage, isEN, liveScore, globalFlags,
}: {
  step: string;
  data: any;
  issues: string[];
  userMessage?: string;
  isEN: boolean;
  liveScore?: number;
  globalFlags?: string[];
}): string {
  const scoreCtx = liveScore !== undefined
    ? (isEN ? `\nCurrent live ATS score: ${liveScore}/95` : `\nScore ATS atual: ${liveScore}/95`)
    : "";
  const flagCtx = (globalFlags?.length ?? 0) > 0
    ? (isEN
        ? `\n\nAll active validation flags across resume:\n${globalFlags!.map(f => `- ${f}`).join("\n")}`
        : `\n\nTodas as flags de validação ativas:\n${globalFlags!.map(f => `- ${f}`).join("\n")}`)
    : "";

  const header = isEN
    ? `Analyzing step: ${step}${scoreCtx}\n\nResume data:\n${JSON.stringify(data, null, 2)}\n\nStep-specific issues:\n${issues.map((i) => `- ${i}`).join("\n") || "None"}${flagCtx}`
    : `Analisando etapa: ${step}${scoreCtx}\n\nDados do currículo:\n${JSON.stringify(data, null, 2)}\n\nProblemas desta etapa:\n${issues.map((i) => `- ${i}`).join("\n") || "Nenhum"}${flagCtx}`;

  if (userMessage) {
    return `${header}\n\n${isEN ? "The user also said:" : "O usuário também disse:"} "${userMessage}"`;
  }
  return header;
}
