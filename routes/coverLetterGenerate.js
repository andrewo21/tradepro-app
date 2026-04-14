import express from "express";
import OpenAI from "openai";

const router = express.Router();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", async (req, res) => {
  try {
    const data = req.body;

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
      salutation = hiringManager ? `Dear ${hiringManager},` : "Dear Hiring Manager,";
    }
    if (salutationStyle === "C") {
      salutation = "To Whom It May Concern,";
    }

    const prompt = `
Write a polished, executive-level cover letter using strict business-letter etiquette.

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

    res.json({ letter: cleanedLetter });
  } catch (err) {
    console.error("COVER LETTER ERROR:", err);
    res.status(500).json({ error: "Failed to generate letter" });
  }
});

export default router;
