import { NextResponse } from "next/server";
// @ts-ignore
import pdf from "pdf-parse-fixed";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "nodejs";

function cleanText(text: string) {
  return text
    .replace(/\u0000/g, "")
    .replace(/[^\S\r\n]+/g, " ")
    .replace(/[^\x20-\x7E\n]/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await pdf(buffer);
    const rawText = pdfData.text || "";
    const cleaned = cleanText(rawText);

    const prompt = `
You are given resume text.

Your job:
1. Read the resume.
2. Internally extract skills, experience, achievements, and years worked.
3. Then return ONLY a 5–7 sentence executive-level professional summary.

STRICT RULES:
- No pronouns (no "I", "me", "my", "he", "she", "they").
- No names.
- No headings.
- No lists.
- No markdown.
- Executive tone.
- Output ONLY the summary.

Resume text:
${cleaned}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const summary =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Experienced professional with a strong background in the field.";

    return NextResponse.json({
      rawText: cleaned,
      summary,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json(
      { error: "Failed to process resume" },
      { status: 500 }
    );
  }
}
