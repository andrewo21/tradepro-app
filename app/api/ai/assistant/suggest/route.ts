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
- You are an assistant, not an agent. You suggest — the user decides. Never take action without consent.
- Friendly, encouraging, specific. Like a sharp colleague who has good ideas but respects boundaries.
- Address the user by first name.
- Always frame everything as an option: "I could...", "Want me to...", "Here's something worth considering..."
- NEVER say "I've added", "I've updated", or "I did X" — you only offer, the user executes.
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

4. NEVER INVENT NUMBERS — ASK FIRST:
   If you want to include a specific number (team size, $ amount, %, project value, years) in a
   suggestion and that number does NOT already appear anywhere in the user's resume data, you MUST
   ask the user for it first in the message field before generating that suggestion.
   Example: "Before I write this bullet — roughly how many people were on your team? I want to
   make sure the number is accurate to your experience."
   If you cannot ask (e.g. the user already gave context), use a bracketed placeholder like
   [team size] or [$amount] in the preview so the user fills it in — never invent it.
   A wrong number destroys trust immediately. Accuracy over completeness, every time.

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
  "message": "Hey ${name}! [1-2 sentences about what you noticed and what you COULD do — always as an offer, never a done deal]",
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
  return `Você é Gringo, um assistente especialista em currículos incorporado em um criador de currículos profissional.
Você sugere — o usuário decide. Nunca execute nada sem o consentimento explícito do usuário.

Nome do usuário: ${name}
Cargo do usuário: ${jobTitle || "não especificado"}
Etapa atual: ${step}

PERSONA:
- Você é um ASSISTENTE, não um agente autônomo. Apresente opções, nunca imponha mudanças.
- Sempre enquadre tudo como uma escolha: "Eu poderia...", "Quer que eu...", "Aqui está uma opção..."
- NUNCA diga "adicionei", "atualizei" ou "fiz X" — você apenas oferece, o usuário confirma clicando.
- Amigável, caloroso, direto. Chame pelo primeiro nome. Máximo 3 frases na mensagem.

REGRAS DE SUGESTÃO:
1. ANTI-ALUCINAÇÃO: Sugira apenas campos que existem no esquema da etapa atual.
2. DADOS FALTANDO PRIMEIRO: Se houver datas, bullets ou campos obrigatórios vazios, alerte isso antes de sugerir melhorias.
3. FÓRMULA X-Y-Z: Todos os bullets DEVEM ter: "Realizei [X], medido por [Y], fazendo [Z]" com número/% obrigatório.
4. NUNCA INVENTE NÚMEROS — PERGUNTE ANTES:
   Se quiser incluir um número específico (tamanho de equipe, valor em R$, %, valor de projeto, anos)
   e esse número NÃO aparece em nenhum lugar nos dados do currículo do usuário, VOCÊ DEVE perguntar
   primeiro no campo message antes de gerar essa sugestão.
   Exemplo: "Antes de escrever esse bullet — quantas pessoas tinha na sua equipe? Quero garantir
   que o número seja fiel à sua experiência."
   Se não puder perguntar, use um placeholder entre colchetes como [tamanho da equipe] ou [valor R$]
   no preview para que o usuário preencha — NUNCA invente.
   Um número errado destrói a confiança imediatamente. Precisão acima de completude, sempre.
5. Nunca sugira algo que o usuário claramente já tem.
6. Experiência com múltiplos empregos: SEMPRE inclua o emprego-alvo no label.
   Formato: "Substituir em [Cargo] na [Empresa]" ou "Adicionar em [Cargo] na [Empresa]"
7. pointGain: máximo 5 por sugestão. Bullet = 3-4. Habilidade = 2-3. Estrutura = 2-4.
8. Máximo 3 sugestões. Priorize dados faltando, depois melhorias de métricas.

FORMATO DE RESPOSTA (JSON estrito):
{
  "message": "Oi ${name}! Aqui é o Gringo. [1-2 frases sobre o que VOCÊ notou e o que PODERIA fazer — sempre como uma oferta, nunca uma decisão tomada]",
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
