import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    let body = await req.json();

    // Ensure body is always an object
    if (!body || typeof body !== "object") {
      body = {};
    }

    // Convert null/undefined to empty strings
    for (const key in body) {
      if (body[key] === null || body[key] === undefined) {
        body[key] = "";
      }
    }

    const messages = [
      {
        role: "system",
        content: `
You generate clean, professional resumes using a universal, ATS-friendly structure.

You must follow these rules:

TRUTHFULNESS RULES:
- NEVER assume or invent any details the user did not explicitly provide.
- NEVER add job duties, dates, job titles, certifications, tools, or achievements unless the user mentioned them.
- NEVER fabricate education, languages, or experience.
- ONLY enhance, clarify, and professionalize the user's actual words.
- If a field is blank, omit that section entirely.

REWRITE RULES:
- Rewrite all user input into polished, confident, trade-aware language.
- Improve grammar, clarity, and tone.
- Fix Spanish-influenced grammar while preserving meaning.
- Remove slang, filler, and casual tone.
- Strengthen vague input into safe, generalized professional statements.
- DO NOT add specifics the user did not imply.

STRUCTURE RULES:
Only include sections that contain real content.
Order sections as:
1. Header (Name, Phone, Email, Location)
2. Summary
3. Skills
4. Experience
5. Education
6. Languages

FORMATTING RULES:
- Experience must use bullet points.
- Use clean, modern, ATS-safe formatting (no tables, no emojis).
- Keep tone confident and grounded in real work.

SUGGESTION RULES:
After the resume, provide a separate section titled:
"Suggestions to Strengthen Your Resume"

This section must include:
1. A short paragraph offering general guidance.
2. A bullet list of optional suggestions.

Suggestions must:
- NEVER be added to the resume itself.
- NEVER be stated as facts.
- ONLY be optional ideas the user may want to consider.
- Be safe, general, and non-specific.

OUTPUT FORMAT:
Return ONLY valid JSON in this exact shape:

{
  "resumeText": "...",
  "suggestions": {
    "paragraph": "...",
    "bullets": ["...", "..."]
  },
  "theme": {
    "base": "#F9FAFB",
    "text": "#111827",
    "accent": "#2563EB"
  }
}
        `,
      },
      {
        role: "user",
        content: JSON.stringify(body),
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content || "";

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        resumeText: raw,
        suggestions: {
          paragraph: "",
          bullets: [],
        },
        theme: {
          base: "#F9FAFB",
          text: "#111827",
          accent: "#2563EB",
        },
      };
    }

    return NextResponse.json(parsed);
  } catch (e) {
    console.error("Generate error:", e);
    return new NextResponse("Error generating resume", { status: 500 });
  }
}