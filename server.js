import 'dotenv/config';
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import PDFDocument from "pdfkit";
import multer from "multer";
import pdf from "pdf-parse-fixed";

const app = express();
const upload = multer();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));

app.post("/api/ai/generate", async (req, res) => {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const { mode, text, payload } = req.body;
    const systemContent = "You are a professional career coach for the skilled trades.";
    const userContent = mode === "summary" 
      ? `Rewrite this into a professional summary: ${text}`
      : `Write a cover letter for ${payload?.applicantName} at ${payload?.companyName}`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userContent }
      ]
    });

    res.json({ result: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: "AI Failed" });
  }
});

app.post("/api/ai/extract-summary", upload.single("file"), async (req, res) => {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const pdfData = await pdf(req.file.buffer);
    const extractedText = pdfData.text || "";

    

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: aiMessages
    });

    res.json({ summary: completion.choices[0].message.content });
  } catch (err) {
    console.error("PDF Error:", err);
    res.status(500).json({ error: "Failed to read PDF." });
  }
});

app.post("/api/export/pdf", async (req, res) => {
  try {
    const data = req.body;
    const doc = new PDFDocument({ size: "LETTER", margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);
    doc.rect(0, 0, doc.page.width, 140).fill("#1F4E79");
    doc.fillColor("white").fontSize(24).text(data.applicantName || "Professional", 50, 45);
    doc.fillColor("black").moveDown(8);
    doc.fontSize(12).text(data.letter || data.summary || "Content missing.", { width: 512 });
    doc.end();
  } catch (err) {
    res.status(500).send("Failed to create PDF.");
  }
});

app.get("/", (req, res) => res.send("TradePro Master Brain is Live"));

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Listening on ${PORT}`));
