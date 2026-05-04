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

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    let text = "";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const pdfParse = (await import("pdf-parse-fixed")).default;
        const parsed = await pdfParse(buffer);
        text = parsed.text || "";
      }
      if (!text) {
        text = (formData.get("resumeText") as string) || (formData.get("text") as string) || "";
      }
    } else {
      const body = await req.json().catch(() => ({}));
      text = body.resumeText || body.text || "";
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Nenhum conteúdo recebido. Envie um arquivo PDF ou texto do currículo." },
        { status: 400 }
      );
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Você é um especialista em currículos para construção civil e indústrias técnicas do Brasil.
Extraia a experiência do candidato e escreva um resumo profissional de 3 a 5 frases em português brasileiro.
Use verbos de ação fortes, inclua palavras-chave do setor e quantifique experiências quando possível.
Escreva sem pronomes de primeira pessoa.
Retorne APENAS o texto do resumo — sem rótulos, sem explicações.`,
        },
        { role: "user", content: text },
      ],
      temperature: 0.4,
    });

    return NextResponse.json({
      summary: completion.choices?.[0]?.message?.content?.trim() || "",
    });
  } catch (err: any) {
    console.error("br/extract-summary error:", err?.message);
    return NextResponse.json({ error: "Falha ao extrair dados do currículo." }, { status: 500 });
  }
}
