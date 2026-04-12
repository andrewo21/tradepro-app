import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Invalid text input" },
        { status: 400 }
      );
    }

    const prompt = `
You are a professional resume rewriting engine for blue‑collar and skilled‑trade workers.

Your job is to:
1. Detect the input language EVERY time.
2. If the text is not English, ALWAYS translate it into English FIRST.
3. After translation, rewrite the text to be professional, concise, factual, and resume‑ready.
4. NEVER add new information, duties, metrics, achievements, or responsibilities.
5. NEVER exaggerate or invent anything.
6. ALWAYS output clean, professional English only.

Rewrite the following text using these rules:

"${text}"
`;

    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
      }),
    });

    const data = await apiRes.json();

    const result =
      data?.choices?.[0]?.message?.content?.trim() || text;

    // ⭐ FIX: return suggestion instead of result
    return NextResponse.json({ suggestion: result });

  } catch (err) {
    console.error("Rewrite API error:", err);
    return NextResponse.json(
      { error: "Rewrite failed" },
      { status: 500 }
    );
  }
}
