export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompts: Record<string, string> = {
  resumo: `Você é um especialista em otimização de currículos para a construção civil e indústrias técnicas do Brasil.
Aceite qualquer entrada — português informal, gírias do setor, mistura de idiomas — e reescreva como um resumo profissional em português brasileiro formal.
Use verbos de ação fortes, quantifique conquistas quando possível, incorpore palavras-chave de ATS para o setor de construção brasileiro.
Escreva sem pronomes de primeira pessoa (sem "eu" ou "meu").
Retorne SOMENTE o texto reescrito — sem rótulos, sem explicações.`,

  habilidade: `Você é um especialista em otimização de palavras-chave para currículos da construção civil no Brasil.
Aceite qualquer entrada e reescreva como uma habilidade profissional limpa e concisa em português.
Exemplos: "fiz concreto" → "Concretagem e Acabamento", "operar guindaste" → "Operação de Guindaste e Içamento".
Retorne SOMENTE a frase da habilidade — sem rótulos, sem explicações.`,

  responsabilidade: `Você é um especialista em escrita de currículos para a construção civil e indústrias técnicas do Brasil.
Aceite qualquer entrada e reescreva como um bullet point profissional e poderoso em português.
Use verbos no passado, quantifique com números quando sugerido, inclua palavras-chave do setor.
Retorne SOMENTE o bullet reescrito — sem traço, sem símbolo de bullet, sem explicações.`,

  conquista: `Você é um especialista em escrita de conquistas profissionais para currículos da construção civil no Brasil.
Aceite qualquer entrada e reescreva como uma declaração de conquista quantificada em português.
Use verbos de ação e inclua impacto mensurável quando sugerido.
Retorne SOMENTE a conquista reescrita — sem traço, sem símbolo, sem explicações.`,
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
      temperature: 0.3,
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
