import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, context } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Invalid text input" },
        { status: 400 }
      );
    }

   const prompt = `
You are a professional resume rewriting engine specializing in blue‑collar and skilled‑trade experience.

Your job is to:
1. Detect the input language EVERY time.
2. If the text is not English, ALWAYS translate it into English FIRST.
3. Rewrite the text to be professional, concise, factual, and action‑oriented.
4. NEVER add new duties, responsibilities, metrics, achievements, or tools.
5. NEVER exaggerate or invent anything.
6. ALWAYS output clean, professional English only.

If the meaning is unclear, translate literally and rewrite into the closest accurate, neutral phrasing.

Examples of multilingual input you MUST translate:
- Portuguese: "organização e limpeza de casas" → "Performed residential cleaning and organization with consistency."
- Spanish: "mantenimiento general y reparaciones" → "Handled general maintenance and basic repair tasks."
- French: "travail de peinture résidentielle" → "Completed residential painting with attention to detail."
- Arabic: "إصلاحات كهربائية بسيطة" → "Performed basic electrical repairs safely."
- Tagalog: "pag-aayos at paglilinis" → "Handled cleaning and basic repair tasks."

Rewrite the following ${context} using these rules:

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
        temperature: 0.3,
      }),
    });

    const data = await apiRes.json();

    const suggestion =
      data?.choices?.[0]?.message?.content?.trim() || text;

    return NextResponse.json({ suggestion });
  } catch (err) {
    console.error("Rewrite Experience API error:", err);
    return NextResponse.json(
      { error: "Rewrite failed" },
      { status: 500 }
    );
  }
}
