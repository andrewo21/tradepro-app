import express from "express";
import OpenAI from "openai";

const router = express.Router();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", async (req, res) => {
  try {
    const data = req.body;

    const prompt = `
Write a professional cover letter using the following information.

IMPORTANT RULES:
- Create a modern header at the very top of the letter containing:
  • Applicant’s full name (exactly as provided)
  • Applicant’s city/state/zip
  • Applicant’s phone number
  • Applicant’s email
  • Applicant’s LinkedIn URL (if provided)
- Format the header as a clean block of text separated by a line above and below.
- Do NOT invent, modify, or replace the applicant’s name.
- Do NOT censor or mask names. Never use asterisks (*****).
- Do NOT insert any assistant, system, or placeholder name (including Andrew O’Neill).
- Place the date BELOW the header, with one blank line above and below it.
- Use the hiring manager name exactly as provided.
- Maintain a professional tone.
- Do not add extra commentary.

Applicant Information:
Name: ${data.applicantName}
Address: ${data.applicantAddress}
City/State/Zip: ${data.applicantCityStateZip}
Email: ${data.applicantEmail}
Phone: ${data.applicantPhone}
LinkedIn: ${data.applicantLinkedIn || ""}

Date: ${data.date}

Hiring Manager: ${data.hiringManager}
Company: ${data.companyName}
Company Address: ${data.companyAddress}
Company City/State/Zip: ${data.companyCityStateZip}

Job Title: ${data.jobTitle}
Tone: ${data.tone}
Experience Summary: ${data.experience}

Salutation Style: ${data.salutationStyle}

Write the full cover letter now using the structure described above.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const letter =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Unable to generate letter.";

    res.json({ letter });
  } catch (err) {
    console.error("LETTER ERROR:", err);
    res.status(500).json({ error: "Failed to generate letter" });
  }
});

export default router;
