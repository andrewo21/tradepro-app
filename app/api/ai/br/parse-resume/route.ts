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
  ]
}`,
        },
        { role: "user", content: `Analise este currículo:\n\n${text}` },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content || "{}";
    let data: any;
    try { data = JSON.parse(raw); }
    catch { return NextResponse.json({ error: "Falha ao processar resposta da IA." }, { status: 500 }); }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("br/parse-resume error:", err?.message);
    return NextResponse.json({ error: "Falha ao analisar currículo.", detail: err?.message }, { status: 500 });
  }
}
