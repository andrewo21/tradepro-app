import express from "express";
import OpenAI from "openai";

const router = express.Router();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", async (req, res) => {
  try {
    const data = req.body;

    const prompt = `
Write a professional cover letter using the following information.

IMPORTANT:
- DO NOT include the date at the top. The PDF generator will add it.
- DO NOT include the applicant's contact information block. The PDF generator will add it.
- Start directly with the hiring manager/company block.
- Then the salutation.
- Then the body of the letter.
- End with a professional closing and the applicant's name.

Applicant Information:
Name: ${data.applicantName}
Email: ${data.applicantEmail}
Phone: ${data.applicantPhone}
City/State/Zip: ${data.applicantCityStateZip}
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

Write the full cover letter now using the structure and rules above.
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
