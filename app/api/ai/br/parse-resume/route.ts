export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "IA não configurada." }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name?.toLowerCase() || "";
    const isDocx = fileName.endsWith(".docx") ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    let text = "";

    if (isDocx) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value?.trim() || "";
    } else {
      const pdfParse = (await import("pdf-parse-fixed")).default;
      const parsed = await pdfParse(buffer);
      text = parsed.text?.trim() || "";
    }

    if (!text) {
      return NextResponse.json({
        error: isDocx
          ? "Não foi possível extrair texto do documento Word. Certifique-se de que é um arquivo .docx digitado (não escaneado)."
          : "Não foi possível extrair texto do PDF. Tente outro arquivo.",
      }, { status: 400 });
    }

    // Same pre-processing as US route — removes page markers and collapses blank lines
    const cleanedText = text
      .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Você é um especialista em análise de currículos brasileiros.
Extraia todas as informações do currículo e retorne como JSON estruturado.
Se um campo estiver ausente, use string vazia "".
Retorne APENAS JSON válido neste formato exato:

{
  "personalInfo": {
    "firstName": "",
    "lastName": "",
    "tradeTitle": "",
    "phone": "",
    "email": "",
    "city": "",
    "state": ""
  },
  "summary": "",
  "skills": ["habilidade1", "habilidade2"],
  "experience": [
    {
      "jobTitle": "",
      "company": "",
      "startDate": "",
      "endDate": "",
      "responsibilities": ["atividade1", "atividade2"],
      "achievements": []
    }
  ],
  "education": [
    {
      "school": "",
      "degree": "",
      "year": "",
      "gpa": ""
    }
  ],
  "certifications": ["certificação1", "certificação2"]
}`,
        },
        { role: "user", content: `Analise este currículo e extraia TODOS os dados com precisão:\n\n${cleanedText}` },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content || "{}";
    let data: any;
    try { data = JSON.parse(raw); }
    catch { return NextResponse.json({ error: "Falha ao processar resposta da IA." }, { status: 500 }); }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    const msg = err?.message || String(err);
    console.error("br/parse-resume error:", msg);
    // Return a clean, user-facing error — never expose raw quota/billing errors
    const isQuota   = /quota|limit|billing|exceeded|insufficient/i.test(msg);
    const isTimeout = /timeout|timed out|ETIMEDOUT/i.test(msg);
    const userError = isQuota
      ? "Serviço temporariamente indisponível. Tente novamente em alguns minutos."
      : isTimeout
      ? "A análise demorou muito. Tente um arquivo menor ou tente novamente."
      : "Não foi possível ler o arquivo. Verifique se é um PDF ou Word válido e tente novamente.";
    return NextResponse.json({ error: userError }, { status: 500 });
  }
}
