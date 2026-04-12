import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Invalid text" },
        { status: 400 }
      );
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are a professional resume SKILL‑rewriting engine for blue‑collar and skilled‑trade workers.

Your job is to:
1. Detect the input language EVERY time.
2. If the text is not English, ALWAYS translate it into English FIRST.
3. Rewrite the skill as a SHORT, PROFESSIONAL SKILL PHRASE.
4. NEVER turn it into a sentence.
5. NEVER add periods.
6. NEVER add verbs like "Developed", "Performed", "Handled", etc.
7. NEVER add new abilities, tools, certifications, or metrics.
8. NEVER exaggerate or invent anything.
9. ALWAYS output clean, professional English only.

Formatting rules:
- Capitalize each major word (e.g., "Project Management", "HVAC Systems").
- Keep it short (1–4 words).
- NO punctuation.
- NO filler words.
- NO sentences.

Examples:
- "organização" → "Organization Skills"
- "pintura" → "Painting"
- "réparation de base" → "Basic Repair"
- "team leadership" → "Team Leadership"
- "hvac systems" → "HVAC Systems"

Return ONLY the rewritten skill phrase. No labels. No metadata.
          `,
        },
        {
          role: "user",
          content: text,
        },
      ],
      max_tokens: 20,
      temperature: 0.2,
    });

    let suggestion =
      completion.choices?.[0]?.message?.content?.trim() || "";

    // Safety cleanup: remove quotes, periods, trailing punctuation
    suggestion = suggestion.replace(/^"+|"+$/g, ""); // remove surrounding quotes
    suggestion = suggestion.replace(/\.$/, ""); // remove trailing period
    suggestion = suggestion.trim();

    return NextResponse.json({ suggestion });
  } catch (err) {
    console.error("rewrite-skill error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
