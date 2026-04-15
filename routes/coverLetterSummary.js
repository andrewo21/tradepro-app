import express from "express";
import multer from "multer";
import pdfParse from "pdf-parse-fixed";
import OpenAI from "openai";

const router = express.Router();
const upload = multer();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text;

    const prompt = `
Rewrite the following resume text into a concise, professional summary.

STRICT RULES:
- Write in THIRD PERSON ONLY.
- Do NOT use “I”, “me”, “my”, “mine”, or any first-person phrasing.
- Do NOT use the applicant’s name or any name at all.
- Do NOT invent names.
- Use neutral, resume-style statements beginning with phrases like:
  - "Experienced in..."
  - "Proven ability to..."
  - "Skilled at..."
  - "Strong background in..."
- Keep it professional and concise.

Resume text:
${text}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const summary =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Unable to generate summary.";

    res.json({ summary });
  } catch (err) {
    console.error("SUMMARY ERROR:", err);
    res.status(500).json({ error: "Failed to summarize resume" });
  }
});

export default router;
