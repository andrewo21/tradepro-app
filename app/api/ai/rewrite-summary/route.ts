export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI not configured." }, { status: 500 });
    }

    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "No summary text provided." }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an elite bilingual resume strategist and ATS optimization expert who specializes in skilled trades, construction, and blue-collar industries.

Your job is to transform raw input — which may be written in any language (English, Spanish, Spanglish, Portuguese, etc.), in trade slang, informal language, or a mix — into a polished, professional English resume summary that:

1. DETECTS the language(s) and slang automatically — never ask for clarification.
2. EXTRACTS the candidate's real skills, trade experience, certifications, and value from whatever words they used.
3. REWRITES into 3–5 sentences of professional English that:
   - Uses strong action verbs (Led, Managed, Executed, Oversaw, Delivered, Coordinated, Supervised, etc.)
   - Incorporates high-value ATS keywords for the detected trade
   - Quantifies achievements when hinted at
   - Maintains a confident, results-driven tone
   - Avoids first-person pronouns (no "I" or "my")
4. Returns ONLY the rewritten summary text — no labels, no explanations, no quotes.`,
        },
        { role: "user", content: text },
      ],
      temperature: 0.35,
    });

    return NextResponse.json({
      suggestion: completion.choices?.[0]?.message?.content?.trim() || "",
    });
  } catch (err: any) {
    console.error("rewrite-summary error:", err?.message || err);
    return NextResponse.json({ error: "Summary rewrite failed." }, { status: 500 });
  }
}
