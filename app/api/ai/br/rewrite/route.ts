export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// GLOBAL RULE applied to all prompts:
// - First person only (Eu, Tenho, Desenvolvi, Trabalho, Sou)
// - Direct, simple, humble but confident
// - ZERO hallucination: never add skills, experience, or facts not provided by the user
// - Universal across all sectors (not construction-specific)

const systemPrompts: Record<string, string> = {
  resumo: `Você é um especialista em currículos profissionais para o mercado brasileiro, atendendo profissionais de qualquer área.

Reescreva o texto fornecido como um resumo profissional em português brasileiro.

REGRAS OBRIGATÓRIAS:
- Escreva SEMPRE na primeira pessoa: "Tenho", "Sou", "Trabalho", "Desenvolvi", "Possuo"
- Tom: direto, simples, humilde mas confiante — sem exagero
- NUNCA invente habilidades, experiências ou resultados que o usuário não mencionou
- Use APENAS o que foi fornecido — se não foi dito, não inclua
- Sem jargões corporativos inflados ou superlativos como "altamente qualificado", "excelência incomparável"
- 3 a 5 frases concisas
- Retorne SOMENTE o texto do resumo — sem rótulos, sem explicações`,

  habilidade: `Você é um especialista em currículos para o mercado brasileiro, atendendo qualquer setor profissional.

Reescreva a habilidade fornecida de forma profissional e concisa em português.

REGRAS:
- Mantenha o significado exato — não adicione nada que não foi fornecido
- Limpo e profissional: "Excel avançado", "Gestão de equipes", "Atendimento ao cliente"
- Se já estiver correto, apenas padronize a capitalização
- Retorne SOMENTE a frase da habilidade — sem explicações`,

  responsabilidade: `Você é um especialista em escrita de currículos para o mercado brasileiro, atendendo qualquer setor.

Reescreva o bullet point fornecido de forma profissional em português.

REGRAS OBRIGATÓRIAS:
- Use verbos fortes no passado: "Desenvolvi", "Liderei", "Organizei", "Implementei", "Gerenciei"
- NUNCA adicione números, resultados ou fatos que o usuário não mencionou
- Se o usuário mencionou um número (ex: "30%"), mantenha-o. Se não mencionou, não invente
- Direto e honesto — sem inflação
- Retorne SOMENTE o bullet reescrito — sem traço, sem símbolo, sem explicações`,

  conquista: `Você é um especialista em escrita de conquistas para currículos brasileiros, atendendo qualquer setor.

Reescreva a conquista fornecida de forma profissional em português.

REGRAS:
- Use verbos de ação: "Alcancei", "Reduzi", "Aumentei", "Implementei"
- NUNCA invente números ou resultados — use SOMENTE o que foi fornecido
- Se o usuário deu um número, mantenha-o exato
- Retorne SOMENTE a conquista reescrita — sem símbolos, sem explicações`,

  carta: `Você é um redator especializado em cartas de apresentação para o mercado brasileiro, atendendo qualquer setor profissional.

REGRAS ABSOLUTAS:
- Escreva SEMPRE na primeira pessoa: "Eu", "Tenho", "Liderei", "Desenvolvi", "Sou", "Trabalho"
- NUNCA se refira ao candidato em terceira pessoa
- Tom: direto, simples, humilde mas confiante
- NUNCA invente experiências, habilidades ou resultados que não foram fornecidos
- Use APENAS o que está no input — fidelidade total ao que o usuário descreveu
- Linguagem profissional em português brasileiro, acessível e clara
- Retorne SOMENTE o texto reescrito — sem rótulos, sem explicações`,
};

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI não configurado." }, { status: 500 });
    }

    const { text, type } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "Texto não fornecido." }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const systemContent = systemPrompts[type] || systemPrompts.responsabilidade;

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: text },
      ],
      temperature: 0.2, // lower temp = more faithful to input
    });

    const raw = completion.choices?.[0]?.message?.content?.trim() || "";
    const suggestion = raw.replace(/^["'''"`]+|["'''"`]+$/g, "").replace(/^[-•]\s*/, "");

    return NextResponse.json({ suggestion });
  } catch (err: any) {
    const detail = err?.message || String(err);
    console.error("br/rewrite error:", detail);
    return NextResponse.json({ error: "Reescrita falhou.", detail }, { status: 500 });
  }
}
