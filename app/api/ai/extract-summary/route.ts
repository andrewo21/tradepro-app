export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI not configured." }, { status: 500 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    let text = "";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const pdfParse = (await import("pdf-parse-fixed")).default;
        const parsed = await pdfParse(buffer);
        text = parsed.text || "";
      }

      if (!text) {
        text =
          (formData.get("resumeText") as string) ||
          (formData.get("text") as string) ||
          "";
      }
    } else {
      const body = await req.json().catch(() => ({}));
      text = body.resumeText || body.text || body.resumeContent || body.content || "";
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: "No resume content received. Upload a PDF file or send resumeText in the request body." },
        { status: 400 }
      );
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an elite bilingual resume strategist specializing in skilled trades, construction, and blue-collar industries.
Extract the candidate's experience from the provided text and write a 3–5 sentence professional English summary suitable for an ATS-optimized resume.
Use strong action verbs, include relevant trade keywords and certifications detected in the text, quantify experience where possible, and write without first-person pronouns.
Return ONLY the summary text — no labels, no explanations.`,
        },
        { role: "user", content: text },
      ],
      temperature: 0.4,
    });

    return NextResponse.json({
      summary: completion.choices?.[0]?.message?.content?.trim() || "",
    });
  } catch (err: any) {
    console.error("extract-summary error:", err?.message || err);
    return NextResponse.json({ error: "Extraction failed." }, { status: 500 });
  }
}
