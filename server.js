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

// --- AI REWRITE & GENERATE ENDPOINTS ---
app.post("/api/ai/rewrite", async (req, res) => {
  try {
    const { text, type } = req.body; 
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: "Expert Construction Recruiter. Return ONLY the text." }, { role: "user", content: `Professionalize: ${text}` }],
      temperature: 0.3,
    });
    res.json({ suggestion: completion.choices.message.content.trim() });
  } catch (err) { res.status(500).json({ error: "Rewrite failed" }); }
});

app.post("/api/ai/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Write ONLY the body paragraphs of a professional cover letter. No headers, no dates, no signatures." },
        { role: "user", content: prompt }
      ],
    });
    res.json({ text: completion.choices.message.content });
  } catch (err) { res.status(500).json({ error: "Generation failed" }); }
});

app.post("/api/ai/extract-summary", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const pdfData = await pdf(req.file.buffer);
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: "Extract a professional trade summary." }, { role: "user", content: pdfData.text }],
    });
    res.json({ summary: completion.choices.message.content });
  } catch (err) { res.status(500).json({ error: "Extraction failed" }); }
});

// --- MASTER PDF ENGINE ---
app.post("/api/export/pdf", async (req, res) => {
  try {
    const data = req.body;
    const doc = new PDFDocument({ size: "LETTER", margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // 1. Professional Blue Header
    doc.rect(0, 0, doc.page.width, 110).fill("#1F4E79");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(28).text(data.applicantName || "", 50, 35);
    
    // Balanced Contact Line
    doc.font("Helvetica").fontSize(10);
    const contactLine = `${data.applicantEmail || ""}  |  ${data.applicantPhone || ""}  |  ${data.applicantAddress || ""} ${data.applicantCityStateZip || ""}`;
    doc.text(contactLine, 50, 75);
    
    doc.fillColor("black").moveDown(4);

    if (data.type === "resume") {
      doc.font("Helvetica-Bold").fontSize(14).text("PROFESSIONAL SUMMARY", { underline: true });
      doc.font("Helvetica").fontSize(11).moveDown(0.5).text(data.summary || "", { width: 500 });
      doc.moveDown().font("Helvetica-Bold").fontSize(14).text("WORK EXPERIENCE", { underline: true });
      data.experience?.forEach(exp => {
        doc.moveDown(0.5).font("Helvetica-Bold").fontSize(12).text(`${exp.title} - ${exp.company}`);
        doc.font("Helvetica").fontSize(10).text(exp.description, { width: 480 });
      });
      doc.moveDown().font("Helvetica-Bold").fontSize(14).text("SKILLS", { underline: true });
      doc.font("Helvetica").fontSize(11).text(data.skills?.join(" | ") || "");
    } else {
      // --- COVER LETTER ---
      // Date at the top
      doc.font("Helvetica").fontSize(11).text(data.date || "", 50, 130);

      // Company Info (Standard Font - No Bold)
      doc.moveDown(1.5);
      doc.text(data.hiringManager || "");
      doc.text(data.companyName || "");
      doc.text(data.companyAddress || "");
      doc.text(data.companyCityStateZip || "");

      // Body Content
      doc.moveDown(2);
      doc.font("Helvetica").fontSize(11.5).text(data.letter || "", { 
        width: 500, 
        align: "left", 
        lineGap: 3.5 // Improved readability spacing
      });
    }
    doc.end();
  } catch (err) { res.status(500).send("PDF generation failed."); }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Master Brain Live`));
