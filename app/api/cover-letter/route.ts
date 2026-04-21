import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    let text = await req.text();
    // Clean up potential leading dashes from the request
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
    } else if (salutationStyle === "C") {
      salutation = "To Whom It May Concern,";
    }

    const prompt = `
Write a polished, professional cover letter for a skilled trade/blue-collar position.

APPLICANT INFO:
${applicantName}
${applicantAddress}
${applicantCityStateZip}
${applicantEmail}
${applicantPhone}
${date}

EMPLOYER INFO:
${hiringManager || "Hiring Manager"}
${companyName}
${companyAddress}
${companyCityStateZip}

JOB DETAILS:
Role: ${jobTitle}
Tone: ${tone}
Experience Summary: ${experience}

SALUTATION:
${salutation}

INSTRUCTIONS:
1. Use standard business letter formatting.
2. Start with the Applicant Block, then Date, then Employer Block.
3. Write 3-4 professional paragraphs highlighting the experience provided.
4. Tone should be ${tone || "professional and confident"}.
5. Do NOT use markdown (no bold, no hashtags, no italics).
6. Do NOT use brackets or placeholders.
7. Length should be between 250-300 words.
8. End with "Sincerely," followed by ${applicantName}.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        { 
          role: "system", 
          content: "You are an expert career coach. You write high-impact cover letters that translate trade skills into professional value. You use natural but formal language." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    const letter =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Unable to generate cover letter.";

    // Clean up special characters for PDF compatibility
    const cleanedLetter = letter
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
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
