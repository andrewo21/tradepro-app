import 'dotenv/config';
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import PDFDocument from "pdfkit";
import multer from "multer";
import pdf from "pdf-parse-fixed";

const app = express();
const upload = multer();

// 1. UNIVERSAL PERMISSION
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));

// 2. AI GENERATE LETTER
app.post("/api/ai/generate", async (req, res) => {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const { payload } = req.body;
    const letterMessages = [
      { role: "system", content: "Write a professional cover letter body. No headers." },
      { role: "user", content: `Write a letter for ${payload.applicantName} for ${payload.jobTitle}. Experience: ${payload.experience}` }
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: letterMessages
    });

    res.json({ result: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: "Generation failed" });
  }
});

// 3. AI SUMMARY EXTRACTION
app.post("/api/ai/extract-summary", upload.single("file"), async (req, res) => {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const pdfData = await pdf(req.file.buffer);

    // FIXED: Defining messages here to avoid the ":" syntax error in the call below
    const summaryMessages = [
      { role: "system", content: "Extract and rewrite into a 5-7 sentence professional 3rd person summary." },
      { role: "user", content: pdfData.text }
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: summaryMessages
    });

    res.json({ summary: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: "Summary failed" });
  }
});

// 4. PDF EXPORT
app.post("/api/export/pdf", async (req, res) => {
  try {
    const data = req.body;
    const doc = new PDFDocument({ size: "LETTER", margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.rect(0, 0, doc.page.width, 140).fill("#1F4E79");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(26).text(data.applicantName || "", 50, 40);
    doc.font("Helvetica").fontSize(11).text(`${data.applicantEmail} | ${data.applicantPhone}`, 50, 75);
    doc.text(`${data.applicantAddress || ""} ${data.applicantCityStateZip || ""}`, 50, 90);

    doc.fillColor("black").moveDown(8);
    doc.font("Helvetica").fontSize(11).text(data.date || "", { align: "left" });
    doc.moveDown();
    doc.font("Helvetica-Bold").text(data.hiringManager || "Hiring Manager");
    doc.font("Helvetica").text(data.companyName || "");
    doc.text(data.companyAddress || "");
    doc.text(data.companyCityStateZip || "");

    doc.moveDown(2);
    doc.font("Helvetica").fontSize(12).text(data.letter || "", { width: 500, align: "left" });

    doc.moveDown(2).text("Sincerely,");
    doc.moveDown().font("Helvetica-Bold").text(data.applicantName || "");

    doc.end();
  } catch (err) {
    res.status(500).send("PDF Error");
  }
});

app.get("/", (req, res) => res.send("TradePro Master Brain is Live"));

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Brain live on ${PORT}`));
