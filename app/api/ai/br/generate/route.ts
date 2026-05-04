export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { checkRateLimit, getIP } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const { allowed, retryAfter } = await checkRateLimit(`ai:${getIP(req)}`, 20, 60);
    if (!allowed) {
      return NextResponse.json(
        { error: "Muitas requisições. Aguarde um momento e tente novamente." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "IA não configurada." }, { status: 500 });
    }

    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Nenhum prompt fornecido." }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um coach de carreira especializado em construção civil e trabalhadores brasileiros. Escreva apenas o corpo da carta em português brasileiro profissional — sem saudação inicial nem assinatura.",
        },
        { role: "user", content: prompt },
      ],
    });

    return NextResponse.json({
      text: completion.choices?.[0]?.message?.content || "",
    });
  } catch (err: any) {
    console.error("br/generate error:", err?.message);
    return NextResponse.json({ error: "Falha ao gerar conteúdo." }, { status: 500 });
  }
}
