export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI not configured." }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name?.toLowerCase() || "";
    const isDocx = fileName.endsWith(".docx") ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    let text = "";

    if (isDocx) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value?.trim() || "";
    } else {
      // Default: treat as PDF
      const pdfParse = (await import("pdf-parse-fixed")).default;
      const parsed = await pdfParse(buffer);
      text = parsed.text?.trim() || "";
    }

    if (!text) {
      return NextResponse.json({
        error: isDocx
          ? "Could not extract text from the Word document. Make sure it's a typed (not scanned) .docx file."
          : "Could not extract text from PDF. Try a different file.",
      }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an expert resume parser for skilled trades and construction professionals.
Extract all information from the resume text and return it as structured JSON.
Be thorough — capture every job, every skill, every detail.
If a field is missing or unclear, use an empty string "".
Return ONLY valid JSON in exactly this format:

{
  "personalInfo": {
    "firstName": "",
    "lastName": "",
    "tradeTitle": "",
    "phone": "",
    "email": "",
    "city": "",
    "state": ""
  },
  "summary": "",
  "skills": ["skill1", "skill2"],
  "experience": [
    {
      "jobTitle": "",
      "company": "",
      "startDate": "",
      "endDate": "",
      "responsibilities": ["bullet1", "bullet2"],
      "achievements": []
    }
  ],
  "education": [
    {
      "school": "",
      "degree": "",
      "year": "",
      "gpa": ""
    }
  ]
}`,
        },
        {
          role: "user",
          content: `Parse this resume:\n\n${text}`,
        },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content || "{}";
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response." }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    const detail = err?.message || String(err);
    console.error("parse-resume error:", detail);
    return NextResponse.json({ error: "Resume parsing failed.", detail }, { status: 500 });
  }
}
