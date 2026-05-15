// app/api/ai/assistant/suggest/route.ts
// CV-1™ (US) / Ringo™ (BR) AI assistant — personalized, step-aware resume suggestions.
// Returns JSON: { message, suggestions[] }

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const body = await req.json();
    const { step, firstName, jobTitle, data, issues, locale, userMessage } = body;

    const isEN = locale !== "pt-BR";
    const name = firstName || (isEN ? "there" : "aí");

    const systemPrompt = isEN
      ? buildSystemPromptEN(step, name, jobTitle)
      : buildSystemPromptPT(step, name, jobTitle);

    const userContent = buildUserContent({ step, data, issues, userMessage, isEN });

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
          pointGain: Number(s.pointGain) || 5,
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
1. Suggest things that are REALISTIC for their background. Infer from what's already there.
2. For bullet inserts: write a COMPLETE, polished bullet in the same voice as existing bullets.
3. Bullets must be: action verb + what you did + result/scale (quantified when possible).
4. Never suggest something the user clearly already has.
5. Never say "add bullet about leadership" — WRITE the actual bullet.
6. pointGain: realistic ATS score impact. Bullet with metrics = 7-10. Missing skill = 4-6.
   Structure fix = 3-5. Summary improvement = 5-8.
7. Max 4 suggestions per step. Prioritize by impact.
8. IMPORTANT — Experience step with multiple jobs: ALWAYS include the target job in the label.
   Format: "Add to [Job Title] at [Company]" — use the displayLabel from the experience data.
   Set action.experienceId to the id of the specific job you are targeting.
   Never leave the user guessing where a bullet will go.

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
        "type": "add_responsibility" | "add_achievement" | "add_skill" | "update_summary" | "add_certification" | "update_personal",
        "experienceId": "<job id from data, or null>",
        "value": "The exact text to insert"
      }
    }
  ]
}

Return ONLY valid JSON. No markdown. No explanation outside the JSON.`;
}

function buildSystemPromptPT(step: string, name: string, jobTitle: string): string {
  return `Você é Ringo, um coach especialista em currículos incorporado em um criador de currículos profissional.
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
  "message": "Oi ${name}! Aqui é o Ringo. [1-2 frases sobre o que foi encontrado e o que pode ser feito]",
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
  step, data, issues, userMessage, isEN,
}: {
  step: string;
  data: any;
  issues: string[];
  userMessage?: string;
  isEN: boolean;
}): string {
  const header = isEN
    ? `Analyzing step: ${step}\n\nResume data:\n${JSON.stringify(data, null, 2)}\n\nDetected issues:\n${issues.map((i) => `- ${i}`).join("\n") || "None"}`
    : `Analisando etapa: ${step}\n\nDados do currículo:\n${JSON.stringify(data, null, 2)}\n\nProblemas detectados:\n${issues.map((i) => `- ${i}`).join("\n") || "Nenhum"}`;

  if (userMessage) {
    return `${header}\n\n${isEN ? "The user also said:" : "O usuário também disse:"} "${userMessage}"`;
  }
  return header;
}
