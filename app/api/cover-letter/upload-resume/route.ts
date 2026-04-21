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
Extract the key professional highlights from this resume text and write a strong, 5-7 sentence executive summary.

RESUME CONTENT:
${cleaned}

STRICT RULES:
1. Write in a professional, active tone.
2. Focus on skills, years of experience, and core trades.
3. Translate everything into professional English if the source is in another language.
4. Do NOT use markdown (no bold, no bullet points).
5. Do NOT use brackets or placeholders.
6. Provide ONLY the summary text. No intro or outro.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o", // Upgraded for better logic and better text extraction
      messages: [
        { 
          role: "system", 
          content: "You are an expert recruiter. You specialize in identifying core competencies in skilled trades and summarizing them into powerful professional profiles. You use formal, impactful English." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
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
