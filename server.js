import 'dotenv/config';
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import PDFDocument from "pdfkit";
import multer from "multer";
import pdf from "pdf-parse-fixed";

const app = express();
const upload = multer();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));

// --- 1. AI REWRITE GENERATOR (Poliglota & Sugestões) ---
app.post("/api/ai/rewrite", async (req, res) => {
  try {
    const { text, type } = req.body; 
    
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are an elite career coach. 
          TASKS:
          1. Detect the language of the input.
          2. Translate it to professional, superior English.
          3. Improve sentence structure and impact.
          4. If type is 'skill', return 2-4 powerful words. 
          5. If type is 'responsibility' or 'achievement', use strong action verbs.
          6. Return ONLY the rewritten text. No introduction or conversational filler.` 
        },
        { role: "user", content: `Rewrite this ${type}: ${text}` }
      ],
      temperature: 0.7,
    });

    res.json({ suggestion: completion.choices[0].message.content.trim() });
  } catch (err) {
    console.error("Rewrite Error:", err);
    res.status(500).json({ error: "AI Rewrite failed" });
  }
});

// --- 2. SUMMARY EXTRACTION (PDF Upload) ---
app.post("/api/ai/extract-summary", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const pdfData = await pdf(req.file.buffer);
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Extract info and write a professional 3rd person summary. Translate to English if the source is in another language. No 'I/Me/My'." },
        { role: "user", content: pdfData.text }
      ],
    });
    res.json({ summary: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: "Summary failed" });
  }
});

// --- 3. AI COVER LETTER TEXT ---
app.post("/api/ai/generate", async (req, res) => {
  try {
    const { payload } = req.body;
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Write a professional cover letter body paragraphs. No headers or signatures." },
        { role: "user", content: `Write for ${payload.applicantName} role: ${payload.jobTitle}. Experience: ${payload.experience}` }
      ],
    });
    res.json({ result: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: "Generation failed" });
  }
});

// --- 4. MASTER PDF ENGINE ---
app.post("/api/export/pdf", async (req, res) => {
  try {
    const data = req.body;
    const doc = new PDFDocument({ size: "LETTER", margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);
    doc.rect(0, 0, doc.page.width, 140).fill("#1F4E79");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(26).text(data.applicantName || "", 50, 40);
    doc.font("Helvetica").fontSize(11).text(`${data.applicantEmail || ""} | ${data.applicantPhone || ""}`, 50, 80);
    doc.text(`${data.applicantAddress || ""} ${data.applicantCityStateZip || ""}`, 50, 95);
    doc.fillColor("black").moveDown(8);
    if (data.type === "resume") {
      doc.font("Helvetica-Bold").fontSize(14).text("PROFESSIONAL SUMMARY", { underline: true });
      doc.font("Helvetica").fontSize(11).moveDown(0.5).text(data.summary || "", { width: 500 });
      doc.moveDown().font("Helvetica-Bold").fontSize(14).text("WORK EXPERIENCE", { underline: true });
      data.experience?.forEach(exp => {
        doc.moveDown(0.5).font("Helvetica-Bold").fontSize(12).text(`${exp.title} - ${exp.company}`);
        doc.font("Helvetica").fontSize(10).text(`${exp.startDate} - ${exp.endDate}`);
        doc.moveDown(0.2).text(exp.description, { width: 480 });
      });
    } else {
      doc.font("Helvetica").fontSize(12).text(data.letter || "", { width: 500, align: "left", lineGap: 2 });
    }
    doc.end();
  } catch (err) {
    res.status(500).send("PDF Error");
  }
});

app.get("/", (req, res) => res.send("TradePro Master Brain V3.5 Online"));

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Master Brain V3.5 Live`));
