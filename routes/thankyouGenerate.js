import express from "express";
import OpenAI from "openai";

const router = express.Router();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", async (req, res) => {
  try {
    const {
      customerName,
      productName,
      orderNumber,
      tone,
      personalNote,
    } = req.body;

    const prompt = `
Write a warm, sincere thank‑you email from "Andrew from TradePro" to a customer who made a purchase.

FORMAT RULES:
- Do NOT hallucinate or invent any details.
- Use the customer name exactly as provided.
- Use the product name exactly as provided.
- If an order number is provided, include it naturally. If not, omit it.
- Tone must match the selected tone: ${tone}.
- Keep the email short, warm, and human (5–7 sentences).
- No masking, no asterisks, no placeholders.
- No assistant or system names.

Customer Name: ${customerName}
Product Purchased: ${productName}
Order Number: ${orderNumber || "None"}
Personal Note from Andrew: ${personalNote || "None"}

Write the full thank‑you email now.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    const email =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Unable to generate email.";

    res.json({ email });
  } catch (err) {
    console.error("THANK YOU ERROR:", err);
    res.status(500).json({ error: "Failed to generate thank‑you email" });
  }
});

export default router;
