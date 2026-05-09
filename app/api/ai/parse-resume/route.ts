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

    // Pre-process: strip PDF page markers and repeated page headers
    const cleanedText = text
      .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "")     // remove "-- 1 of 3 --"
      .replace(/\n{3,}/g, "\n\n")                       // collapse excess blank lines
      .trim();

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an expert resume parser. Your job is to extract ALL information from a resume with perfect accuracy and map it to the correct fields.

══════════════════════════════════════════════════
SECTION DETECTION — READ THIS CAREFULLY
══════════════════════════════════════════════════

1. PROFESSIONAL SUMMARY (global, about the person)
   - The paragraph(s) at the very top describing who the person is
   - May include bullet points (➢ • ▪ -) as part of the summary
   - Include ALL of it — the paragraph AND any following bullets — joined into one summary field
   - If you find a "Summary" paragraph INSIDE the experience section (a document-level overview), treat it as the global summary ONLY if no other summary was found at the top
   - Do NOT include company-specific paragraphs in the global summary

2. SKILLS / CORE COMPETENCIES
   - Look for sections labeled: Skills, Core Competencies, Key Skills, Competencies, Areas of Expertise
   - IMPORTANT: Section headers may have spaced letters (e.g. "C o r e  C o m p e t e n c i e s") — recognize these as skill section headers
   - Extract every individual skill as its own item in the skills array
   - Do NOT skip skills sections just because the header has unusual formatting

3. EXPERIENCE — PER COMPANY (most critical section)
   Each job entry has up to 4 parts. You MUST separate them:
   
   a) COMPANY NAME — the employer (e.g. "HEDRICK BROTHERS CONSTRUCTION")
   b) JOB TITLE + DATES — e.g. "Project Manager, Operations ● 2018-2021"
   c) ROLE SUMMARY (roleSummary) — The NON-BULLETED paragraph immediately after the job title.
      This is a prose description of the role/company. It is NOT a bullet point.
      It often starts with "Held a strategic role...", "Facilitated...", "Hands-on and strategic..."
      Store this in "roleSummary". Do NOT put it in responsibilities.
   d) RESPONSIBILITIES — the bulleted lines (starting with • ▪ ➢ - ★ or similar)
      Store these in the "responsibilities" array.
      Extract EVERY bullet — do not skip or merge any.

4. WHAT TO IGNORE
   - Page headers: repeated name/contact lines appearing mid-document (e.g. "ANDREW O'NEILL, MBA 914-424-4786")
   - Page footers / page numbers
   - Testimonials / quotes (text in quotes attributed to a person)
   - Document-level "Summary" paragraphs that appear at the start of the Experience section (only use as global summary if needed)

5. PAGE BREAK HANDLING
   - Bullets continuing after a page break belong to the SAME job that was active before the break
   - Do NOT start a new job entry at a page break
   - If you see a name/contact line mid-document, skip it and continue with the current job

6. BULLET COUNTING — ZERO TOLERANCE
   - Count every bullet in every job before outputting
   - Output count MUST equal source count
   - If Hedrick Brothers has 10 bullets, output 10 bullets
   - Never merge two bullets into one

7. EDUCATION
   - Extract school, degree, city/state if present
   - Do NOT include year (we've removed that field)

8. CERTIFICATIONS
   - Any section labeled Certifications, Licenses, Community Involvement, Board Memberships, Professional Affiliations
   - Extract each item as a string in the certifications array

9. LINKEDIN + CONTACT
   - Extract LinkedIn URL if present (look for linkedin.com/in/...)
   - Include in personalInfo.linkedin

══════════════════════════════════════════════════
OUTPUT FORMAT (return ONLY valid JSON)
══════════════════════════════════════════════════
{
  "personalInfo": {
    "firstName": "",
    "lastName": "",
    "tradeTitle": "",
    "phone": "",
    "email": "",
    "city": "",
    "state": "",
    "linkedin": ""
  },
  "summary": "full professional summary paragraph(s) and any top-level bullets combined into one string",
  "skills": ["skill1", "skill2"],
  "experience": [
    {
      "jobTitle": "",
      "company": "",
      "startDate": "",
      "endDate": "",
      "roleSummary": "the prose paragraph describing the role — NOT bulleted. Empty string if none.",
      "responsibilities": ["every bullet point, word for word"],
      "achievements": []
    }
  ],
  "education": [
    {
      "school": "",
      "degree": "",
      "gpa": ""
    }
  ],
  "certifications": ["any cert, license, community involvement, board role"]
}`,
        },
        {
          role: "user",
          content: `Parse this resume completely and accurately. Remember:\n- Page headers (repeated name lines) are NOT content\n- Bullets after a page break belong to the SAME job\n- roleSummary is the prose paragraph per company, responsibilities are the bullets\n- Extract EVERY bullet — count them\n- Spaced letters in section headers (like "C o r e  C o m p e t e n c i e s") are still skill sections\n\n${cleanedText}`,
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

    // Ensure every experience item has roleSummary
    if (Array.isArray(data.experience)) {
      data.experience = data.experience.map((job: any) => ({
        ...job,
        roleSummary: job.roleSummary || "",
        responsibilities: (job.responsibilities || []).filter(Boolean),
        achievements: (job.achievements || []).filter(Boolean),
      }));
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    const detail = err?.message || String(err);
    console.error("parse-resume error:", detail);
    return NextResponse.json({ error: "Resume parsing failed.", detail }, { status: 500 });
  }
}
