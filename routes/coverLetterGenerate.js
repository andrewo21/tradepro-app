import express from "express";
import OpenAI from "openai";

const router = express.Router();

router.post("/", async (req, res) => {
  // MOVED INSIDE: This prevents the crash on startup
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  try {
    const data = req.body;

    const prompt = `
Write a professional cover letter for:
Name: ${data.applicantName}
Job Title: ${data.jobTitle}
Experience: ${data.experience}

Rules:
- Professional tone.
- 250-300 words.
- Standard business format.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a professional career coach." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    const letter = completion.choices?.[0]?.message?.content?.trim() || "Unable to generate letter.";
    res.json({ letter });

  } catch (err) {
    console.error("LETTER ERROR:", err);
    res.status(500).json({ error: "Failed to generate letter" });
  }
});

export default router;
