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
      return NextResponse.json({ error: "OpenAI não configurado." }, { status: 500 });
    }

    const { descricaoVaga, resumoAtual, habilidades, experiencia } = await req.json();

    if (!descricaoVaga?.trim()) {
      return NextResponse.json({ error: "Descrição da vaga é obrigatória." }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const contextoCV = [
      resumoAtual ? `RESUMO ATUAL:\n${resumoAtual}` : "",
      habilidades?.length ? `HABILIDADES:\n${habilidades.map((s: any) => s.text || s).filter(Boolean).join(", ")}` : "",
      experiencia?.length
        ? `EXPERIÊNCIA:\n${experiencia.map((e: any) =>
            `${e.cargo || e.jobTitle} em ${e.empresa || e.company}\n${(e.responsabilidades || e.responsibilities || []).map((r: any) => r.text || r).filter(Boolean).join("\n")}`
          ).join("\n\n")}`
        : "",
    ].filter(Boolean).join("\n\n");

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Você é um especialista em otimização de currículos para sistemas ATS (Applicant Tracking System) no mercado de trabalho brasileiro, com foco em construção civil e todas as indústrias técnicas e de serviços.

Analise a descrição da vaga e o currículo do candidato e retorne:
1. Palavras-chave IMPORTANTES da vaga que estão AUSENTES no currículo
2. Palavras-chave que já estão PRESENTES no currículo
3. Um resumo profissional OTIMIZADO em português que inclui naturalmente as palavras-chave ausentes
4. 2-3 sugestões de atividades para adicionar à experiência
5. HABILIDADES INTELIGENTES PARA ADICIONAR — palavras-chave ausentes que são genuinamente comprovadas pela experiência real do candidato. Máximo 6 habilidades. Formule como frases de habilidade limpas e profissionais em português (ex: "Gestão de Cronograma de Obras", "Conformidade com NR-10"). NUNCA invente experiência que o candidato não tem.

Regras:
- Sugira apenas habilidades que a experiência do candidato realmente comprova
- Escreva em português brasileiro profissional, sem pronomes de primeira pessoa
- Foque em termos técnicos do setor identificado no currículo
- Retorne SOMENTE JSON válido neste formato exato:
{
  "palavrasAusentes": ["palavra1", "palavra2"],
  "palavrasPresentes": ["palavra1", "palavra2"],
  "resumoOtimizado": "...",
  "sugestoesBullets": ["sugestao1", "sugestao2"],
  "habilidadesParaAdicionar": ["Habilidade 1", "Habilidade 2"]
}`,
        },
        {
          role: "user",
          content: `DESCRIÇÃO DA VAGA:\n${descricaoVaga}\n\n---\n\nCURRÍCULO DO CANDIDATO:\n${contextoCV || "Nenhum conteúdo de currículo fornecido ainda."}`,
        },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content || "{}";
    const result = JSON.parse(raw);

    return NextResponse.json({
      palavrasAusentes: result.palavrasAusentes || [],
      palavrasPresentes: result.palavrasPresentes || [],
      resumoOtimizado: result.resumoOtimizado || "",
      sugestoesBullets: result.sugestoesBullets || [],
      habilidadesParaAdicionar: result.habilidadesParaAdicionar || [],
    });
  } catch (err: any) {
    const detail = err?.message || String(err);
    console.error("br/match-job error:", detail);
    return NextResponse.json({ error: "Análise da vaga falhou.", detail }, { status: 500 });
  }
}
