export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

/**
 * Cleans raw job description text pasted from any source
 * (LinkedIn, WhatsApp, Catho, Vagas.com, email).
 * Strips boilerplate, legal text, company descriptions, navigation artifacts.
 * Returns only the information relevant for Resume Intelligence™.
 */
export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI não configurado." }, { status: 500 });
    }

    const { text } = await req.json();
    if (!text?.trim()) {
      return NextResponse.json({ error: "Texto não fornecido." }, { status: 400 });
    }

    if (text.trim().length < 50) {
      return NextResponse.json({ cleaned: text.trim() });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `Você é um extrator de requisitos de vagas de emprego.

Receberá texto copiado de qualquer fonte — site de emprego, LinkedIn, WhatsApp, e-mail — que pode conter lixo como:
- Descrição da empresa / história da empresa
- Benefícios (plano de saúde, vale refeição, etc.)
- Texto legal / LGPD / política de diversidade
- Instruções de candidatura ("envie seu currículo para...")
- Links, navegação, cabeçalhos de página
- Mensagens de forwarding do WhatsApp

Extraia APENAS:
- Cargo / título da vaga
- Requisitos e habilidades (obrigatórios e desejáveis)
- Responsabilidades e atividades do cargo
- Ferramentas, softwares e tecnologias mencionadas
- Nível de experiência (júnior, pleno, sênior)

Retorne o texto limpo em português, organizado e conciso.
Não inclua nada que não seja diretamente relevante para o cargo.
Se não houver texto relevante, retorne o texto original sem alterações.`,
        },
        {
          role: "user",
          content: text.slice(0, 8000),
        },
      ],
    });

    const cleaned = completion.choices[0]?.message?.content?.trim() || text.trim();
    return NextResponse.json({ cleaned });

  } catch (err: any) {
    console.error("clean-job-text error:", err?.message);
    // On error, return original text so the user isn't blocked
    return NextResponse.json({ cleaned: (await req.json().catch(() => ({}))).text || "" });
  }
}
