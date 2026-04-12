import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    let text = await req.text();
    text = text.replace(/^\s*[-–—]+/, "").trim();
    const data = JSON.parse(text);

    const {
      applicantName,
      applicantAddress,
      applicantCityStateZip,
      applicantEmail,
      applicantPhone,
      date,
      hiringManager,
      companyName,
      companyAddress,
      companyCityStateZip,
      jobTitle,
      tone,
      experience,
      salutationStyle,
    } = data;

    let salutation = "Dear Hiring Manager,";
    if (salutationStyle === "B") {
      salutation = hiringManager
        ? `Dear ${hiringManager},`
        : "Dear Hiring Manager,";
    }
    if (salutationStyle === "C") {
      salutation = "To Whom It May Concern,";
    }

    const prompt = `
Write a polished, executive-level cover letter using strict business-letter etiquette.

STRUCTURE:
1. Applicant block (exactly as provided)
2. Blank line
3. Employer block (exactly as provided)
4. Blank line
5. Salutation
6. 4–5 short executive paragraphs (total 250–300 words)
7. Blank line
8. "Sincerely," on its own line
9. Applicant name on its own line

STRICT RULES:
- Use the applicant's real name: ${applicantName}
- No pronouns (no "I", "me", "my", "he", "she", "they").
- No placeholders.
- No markdown.
- No brackets.
- Executive tone.
- Preserve EXACT formatting of applicant and employer blocks.
- Do NOT modify addresses or spacing.
- TOTAL LENGTH MUST FIT ON ONE PAGE (250–300 words max).

APPLICANT BLOCK:
${applicantName}
${applicantAddress}
${applicantCityStateZip}
${applicantEmail}
${applicantPhone}
${date}

EMPLOYER BLOCK:
${hiringManager || "Hiring Manager"}
${companyName}
${companyAddress}
${companyCityStateZip}

SALUTATION:
${salutation}

JOB TITLE:
${jobTitle}

EXPERIENCE SUMMARY:
${experience}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const letter =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Unable to generate cover letter.";

    const cleanedLetter = letter
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[^\x00-\x7F]/g, "");

    return NextResponse.json({ letter: cleanedLetter });
  } catch (err) {
    console.error("COVER LETTER ERROR:", err);
    return NextResponse.json(
      { error: "Failed to generate letter" },
      { status: 500 }
    );
  }
}
