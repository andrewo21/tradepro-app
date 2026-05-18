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

    // Detect conversational mode — user sent a direct message/question
    const isConversational = !!(userMessage?.trim());

    const systemPrompt = isConversational
      ? buildConversationalPromptEN(step, name, jobTitle, isEN)
      : (isEN ? buildSystemPromptEN(step, name, jobTitle) : buildSystemPromptPT(step, name, jobTitle));

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
          pointGain: 0, // real delta computed client-side after applying
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

function buildConversationalPromptEN(step: string, name: string, jobTitle: string, isEN: boolean): string {
  const lang = isEN ? "English" : "Portuguese (Brazilian)";
  return `You are CV-1, a resume coach AI. The user has asked you a DIRECT QUESTION or made a SPECIFIC REQUEST.
Your entire job right now is to answer that question or fulfill that request. Nothing else.

User's name: ${name}
User's job title: ${jobTitle || "not specified"}
Current step: ${step}
Language: ${lang}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL RULES FOR CONVERSATIONAL MODE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. READ THE USER'S MESSAGE CAREFULLY. Respond directly to what they asked.
   - If they ask to simplify language → rewrite it in plain, friendly language
   - If they ask what a term means → explain it simply in 1-2 sentences
   - If they ask you to make something more personal → make it personal and specific
   - If they reference [X] or [Y] placeholders → ask them for those specific values
   - If they give you values to fill in → write the complete text with those values filled in

2. NEVER REPEAT YOUR PREVIOUS MESSAGE. If you already said something, move forward.

3. NEVER HALLUCINATE NUMBERS. If you don't know a value, ask for it.
   WRONG: "You saved $50,000 in costs" (invented)
   RIGHT: "You mentioned saving costs — can you tell me approximately how much?"

4. If they say "I don't have that number" or "I don't know" — use a [placeholder] they can fill in later
   and explain what kind of value would go there.

5. If their message seems unclear, ask one clarifying question. Just one.

6. Keep your message concise — 2-3 sentences max unless writing a full rewrite.

7. If writing a rewrite based on their input: put it in the preview field as the complete final text.

RESPONSE FORMAT (strict JSON):
{
  "message": "Your direct response to what they asked",
  "suggestions": [
    {
      "label": "Short label (optional — only include if you have a concrete action)",
      "preview": "The complete rewritten text, or empty string if just answering a question",
      "reason": "Why this version is better",
      "pointGain": 0,
      "action": {
        "type": "update_responsibility" | "update_achievement" | "update_summary" | "add_skill" | "add_responsibility",
        "experienceId": "<if applicable>",
        "bulletIndex": <if applicable>,
        "value": "<same as preview>"
      }
    }
  ]
}

If you're just answering a question (no concrete text action), return empty suggestions array [].
Return ONLY valid JSON.`;
}

function buildSystemPromptEN(step: string, name: string, jobTitle: string): string {
  return `You are CV-1, an expert resume coach AI embedded in a professional resume builder.
Your job is to review the user's resume data for the current step and give personalized, actionable suggestions.

User's name: ${name}
User's job title: ${jobTitle || "not specified"}
Current step: ${step}

PERSONA:
- You are an assistant, not an agent. You suggest — the user decides.
- Friendly, direct, specific. Like a sharp colleague who writes the actual fix, not just describes it.
- Address the user by first name.
- Keep your message under 3 sentences.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE MOST IMPORTANT RULE — READ THIS FIRST:
The "preview" field must ALWAYS contain the COMPLETE, FINAL, READY-TO-USE TEXT that will replace
or be added to the resume. It is NEVER advice. It is NEVER a description of what to write.
It is the ACTUAL replacement text, word for word, exactly as it should appear on the resume.

❌ BAD preview: "You should quantify your achievements with specific metrics"
❌ BAD preview: "This bullet can be improved by adding a number or percentage"
❌ BAD preview: "Consider rephrasing to show measurable impact"
✅ GOOD preview: "Increased company profits by [X]% over 12 months by renegotiating vendor contracts on the [Project Name] project"
✅ GOOD preview: "Led a team of [X] technicians on commercial HVAC installations across 3 concurrent job sites, completing all projects on time and under budget"

If you don't know a specific number, use a [bracket placeholder] like [X%] or [$amount] — but
always write the COMPLETE bullet around it so the user can see exactly what it will look like.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUGGESTION RULES:
1. STRICT STEP SCOPE: Only suggest things for fields on the current step page.
   - Personal: only name, title, phone, email, city, linkedin. If filled, say so and stop.
   - Experience: only job fields and bullet text.
   - Skills/Education/Summary: only those fields.
   NEVER cross-suggest between steps.

2. MISSING DATA FIRST: Flag blank required fields before improvements.
   "⚠️ [Field] is missing at [Job Title], [Company] — recruiters flag this as incomplete."

3. WRITE THE BULLET — don't describe it:
   Every experience suggestion must follow: Action verb + what you did + result/scale
   Use [bracket] placeholders for unknown numbers but ALWAYS write the complete sentence.
   Example message: "Hey ${name}! Your bullet 'I made the company money' at [Company] is too vague
   for recruiters. Here's a version that shows real impact — just fill in [X] with your number:"

4. EXPERIENCE TARGETING:
   - label: "Replace at [Job Title], [Company]" or "Add to [Job Title], [Company]"
   - reason: compare original vs replacement — "Original says 'made money'; this version shows
     exactly how much and how, which is what hiring managers need to see"
   - Set action.experienceId and action.bulletIndex correctly

5. pointGain: Set to 0. The UI calculates the REAL score change after applying — never estimate it.
   Claiming "+5 pts" when the real change is 0 destroys trust. Use 0 always.

6. ZERO HALLUCINATION ON NUMBERS: If you need a number the user hasn't provided, use [X] placeholder
   AND the UI will prompt them to fill it in before accepting. Never invent numbers.

7. Max 3 suggestions. Missing data first, then weakest bullets.

RESPONSE FORMAT (strict JSON):
{
  "message": "Hey ${name}! [1-2 sentences. If improving a specific bullet: say what was weak about the original and that you wrote a stronger version below. If scanning the step: say what you found. Always an offer, never a done deal. NEVER say 'you should add quantitative data' — say what the new text actually says.]",
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

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGRA MAIS IMPORTANTE — LEIA PRIMEIRO:
O campo "preview" SEMPRE deve conter o TEXTO COMPLETO, FINAL e PRONTO PARA USO que substituirá
ou será adicionado ao currículo. NUNCA é conselho. NUNCA é descrição do que escrever.
É o TEXTO REAL, palavra por palavra, exatamente como deve aparecer no currículo.

❌ RUIM: "Você deve quantificar suas conquistas com métricas específicas"
❌ RUIM: "Este bullet pode ser melhorado adicionando um número ou porcentagem"
✅ BOM: "Aumentei o lucro da empresa em [X]% ao longo de 12 meses renegociando contratos de fornecedores no projeto [Nome do Projeto]"
✅ BOM: "Liderei equipe de [X] técnicos em instalações de ar-condicionado comercial em 3 obras simultâneas, entregando todos os projetos no prazo e abaixo do orçamento"

Se não souber um número específico, use [placeholder entre colchetes] — mas sempre escreva o
bullet COMPLETO ao redor dele para o usuário ver exatamente como ficará.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REGRAS DE SUGESTÃO:
1. ESCOPO ESTRITO: Sugira apenas campos da etapa atual.
2. DADOS FALTANDO PRIMEIRO: "⚠️ [Campo] está faltando em [Cargo] na [Empresa] — recrutadores marcam como incompleto."
3. ESCREVA O BULLET — não descreva: Verbo de ação + o que fez + resultado/escala. Use [colchetes] para números desconhecidos.
4. TARGETING: label: "Substituir em [Cargo] na [Empresa]". reason: compare original vs substituto.
5. pointGain: Use sempre 0. A UI calcula a mudança real de pontuação — nunca estime.
6. ZERO ALUCINAÇÃO EM NÚMEROS: Use [X] placeholder para qualquer número desconhecido.
7. Máximo 3 sugestões. Dados faltando primeiro, depois bullets fracos.

FORMATO DE RESPOSTA (JSON estrito):
{
  "message": "Oi ${name}! Aqui é o Gringo. [1-2 frases. Se melhorando um bullet específico: diga o que estava fraco no original e que você escreveu uma versão mais forte abaixo. NUNCA diga 'você deve adicionar dados quantitativos' — diga o que o novo texto realmente diz.]",
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
