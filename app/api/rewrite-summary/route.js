import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    let body;

    // Safely parse JSON
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { rewritten: "", error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const text = typeof body.text === "string" ? body.text : "";

    if (!text.trim()) {
      return NextResponse.json({ rewritten: "" });
    }

    // Call OpenAI safely
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
You are a professional resume rewriting engine for blue‑collar and skilled‑trade workers.

Your job is to:
1. Detect the input language EVERY time.
2. If the text is not English, ALWAYS translate it into English FIRST.
3. Rewrite the text into a polished, professional, industry‑appropriate resume summary.
4. NEVER add new responsibilities, achievements, metrics, or duties.
5. NEVER exaggerate or invent anything.
6. ALWAYS output clean, professional English only.

If the meaning is unclear, translate literally and rewrite into the closest accurate professional phrasing.

Examples of multilingual input you MUST translate:
- Portuguese → "Experiência em limpeza e organização" → "Experienced in residential cleaning and organization."
- Spanish → "Experto en mantenimiento general" → "Skilled in general maintenance and repair tasks."
- French → "Compétences en peinture et rénovation" → "Experienced in painting and basic renovation work."
- Arabic → "خبرة في صيانة المباني" → "Experienced in building maintenance and upkeep."
- Tagalog → "May karanasan sa paglilinis" → "Experienced in residential and commercial cleaning."

Return ONLY the rewritten English text.
            `,
          },
          { role: "user", content: text },
        ],
        temperature: 0.3,
      });
    } catch (err) {
      console.error("OpenAI error:", err);
      return NextResponse.json(
        { rewritten: "", error: "OpenAI request failed" },
        { status: 500 }
      );
    }

    const rewritten = completion?.choices?.[0]?.message?.content || "";

    return NextResponse.json({ rewritten });
  } catch (e) {
    console.error("Rewrite error:", e);
    return NextResponse.json(
      { rewritten: "", error: "Rewrite error" },
      { status: 500 }
    );
  }
}
