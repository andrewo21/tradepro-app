import express from "express";
import multer from "multer";
import pdfParse from "pdf-parse-fixed";
import OpenAI from "openai";

const router = express.Router();
const upload = multer();

router.post("/", upload.single("file"), async (req, res) => {
  // Move initialization here
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text;

    const prompt = `
Rewrite the following resume text into a concise, professional summary.
Return ONLY the summary text.
Resume text:
${text}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
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
