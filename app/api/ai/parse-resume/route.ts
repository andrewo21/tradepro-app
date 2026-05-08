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

    // Pre-process: strip PDF page markers and repeated headers before sending to AI
    const cleanedText = text
      .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "")           // remove "-- 1 of 3 --"
      .replace(/\n{3,}/g, "\n\n")                             // collapse excess blank lines
      .trim();

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an expert resume parser. Extract ALL information from this resume with perfect accuracy.

CRITICAL RULES — FOLLOW EXACTLY:

PAGE HANDLING:
- The resume may span multiple pages. Page headers (repeated name/contact at top of each page) and page footers are NOT content — ignore them entirely.
- Bullets that appear after a page break belong to the SAME job that was active before the page break. Do NOT create a new job entry when a page break occurs mid-job.
- If you see "ANDREW O'NEILL" or any name/contact line repeated mid-document, it is a page header — skip it and continue parsing the current job.

BULLET COUNTING (CRITICAL):
- Extract EVERY bullet from EVERY job. Count them carefully.
- Bullets are lines starting with •, ▪, ➢, -, *, or indented/leading whitespace.
- The intro paragraph of each job (non-bulleted text after the job title) counts as part of that job — include it as the first responsibility.
- Do NOT skip any bullet. Do NOT merge bullets. Output count must equal source count.
- If Hedrick Brothers has 10 bullets in the source, output must have 10 bullets.

DATE HANDLING:
- "2018-2021 – 2023-2025" means two stints at the same company — use startDate="2018" endDate="2025"
- "2025-Present" → startDate="2025" endDate="Present"

OTHER RULES:
- Extract ALL skills, ALL education, ALL certifications
- Split first/last name correctly
- Empty string "" for missing fields
- Return ONLY valid JSON, no explanations

JSON FORMAT:
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
          content: `Parse this resume completely. Remember: page headers (repeated name lines) are NOT content, and bullets continuing after a page break belong to the SAME job.\n\n${cleanedText}`,
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
