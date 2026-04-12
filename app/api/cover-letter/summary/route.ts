import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      jobTitles,
      skills,
      responsibilities,
      achievements,
      dates,
    } = body;

    const prompt = `
Generate a professional, human-sounding resume summary based ONLY on the following data. 
The language must be proportional to the user's real experience level. 
Do NOT exaggerate. Do NOT use corporate fluff. 
Write in first-person implied (no "I", no "my"). 
Keep it concise, confident, and trade-focused.

Job Titles:
${jobTitles.join(", ")}

Skills:
${skills.join(", ")}

Experience Dates:
${dates.join(", ")}

Responsibilities:
${responsibilities.join("\n")}

Achievements:
${achievements.join("\n")}

Write a polished 3–5 sentence summary that reflects the user's true experience level.
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const summary =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Experienced trades professional.";

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("SUMMARY ERROR:", err);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
