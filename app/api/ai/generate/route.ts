export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { checkRateLimit, getIP } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const { allowed, retryAfter } = await checkRateLimit(`ai:${getIP(req)}`, 20, 60);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down and try again." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI not configured." }, { status: 500 });
    }

    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided." }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content: `You are a professional resume and cover letter writer for trades, construction, and skilled-worker industries.
Write clear, professional body paragraphs in English.
NEVER invent specific numbers, dollar amounts, or metrics that were not provided.
NEVER give unsolicited resume advice — only write what was requested.
Return only the requested content, no labels or explanations.`,
        },
        { role: "user", content: prompt },
      ],
    });

    return NextResponse.json({
      text: completion.choices?.[0]?.message?.content || "",
    });
  } catch (err: any) {
    const detail = err?.message || String(err);
    console.error("generate error:", detail);
    return NextResponse.json({ error: "Generation failed.", detail }, { status: 500 });
  }
}
