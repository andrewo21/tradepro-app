export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompts: Record<string, string> = {
  summary: `You are an elite bilingual resume strategist specializing in skilled trades, construction, and blue-collar industries. 
Accept input in any language or slang and rewrite it as a polished professional English resume summary. 
Use strong action verbs, quantify achievements where possible, incorporate ATS keywords for the trade, and write in third person (no "I"). 
Return ONLY the rewritten text — no labels or explanations.`,

  skill: `You are a professional resume keyword optimizer for skilled trades and construction industries.
Accept any input (trade slang, abbreviations, any language) and rewrite it as a clean, ATS-friendly skill phrase in English.
Examples: "done concrete" → "Concrete Forming & Pouring", "run the crane" → "Crane Operation & Rigging".
Return ONLY the polished skill phrase — no labels, no explanations.`,

  responsibility: `You are an expert resume bullet point writer for skilled trades, construction, and blue-collar industries.
Accept input in any language, slang, or informal style and rewrite it as a single, powerful, ATS-optimized bullet point in professional English.
Use strong past-tense action verbs, quantify with numbers when hinted at, and include relevant trade keywords.
Return ONLY the rewritten bullet — no dash, no bullet symbol, no explanations.`,

  achievement: `You are an expert resume achievement writer for skilled trades, construction, and blue-collar industries.
Accept input in any language or informal style and rewrite it as a single, compelling, quantified achievement statement in professional English.
Use strong action verbs and include measurable impact where hinted at.
Return ONLY the rewritten achievement — no dash, no bullet symbol, no explanations.`,
};

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI not configured." }, { status: 500 });
    }

    const { text, type } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "No text provided." }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const systemContent = systemPrompts[type] || systemPrompts.responsibility;

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: text },
      ],
      temperature: 0.3,
    });

    const raw = completion.choices?.[0]?.message?.content?.trim() || "";
    const suggestion = raw
      .replace(/^["'''"`]+|["'''"`]+$/g, "")
      .replace(/^[-•]\s*/, "");

    return NextResponse.json({ suggestion });
  } catch (err: any) {
    const detail = err?.message || String(err);
    console.error("rewrite error:", detail);
    return NextResponse.json({ error: "Rewrite failed.", detail }, { status: 500 });
  }
}
