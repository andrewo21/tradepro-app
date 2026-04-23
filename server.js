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

// --- 1. AI REWRITE EXPERT ---
app.post("/api/ai/rewrite", async (req, res) => {
  try {
    const { text, type } = req.body; 
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are an expert elite Construction & Trade Industry Recruiter. 
          Instantly detect and translate Spanish/Spanglish into professional American English. 
          Use trade-specific slang correctly. No conversation, JUST the final text.` 
        },
        { role: "user", content: `Professionalize this ${type}: ${text}` }
      ],
      temperature: 0.3,
    });
    let result = completion.choices[0].message.content.trim();
    result = result.replace(/^["'‘“`]+|["'’ ”`]+$/g, ""); 
    res.json({ suggestion: result });
  } catch (err) {
    res.status(500).json({ error: "AI Rewrite failed" });
  }
});

// --- 2. FULL COVER LETTER GENERATOR (FIXES THE 404) ---
app.post("/api/ai/generate", async (req, res) => {
  try {
    const { prompt, type } = req.body;
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are a Construction Career Coach. Write a high-impact cover letter. Keep it under 300 words. No conversational filler." 
        },
        { role: "user", content: prompt }
      ],
    });
    // This matches the data.text the frontend is looking for
    res.json({ text: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: "Generation failed" });
  }
});

// --- 3. SUMMARY EXTRACTION (From PDF Upload) ---
app.post("/api/ai/extract-summary", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const pdfData = await pdf(req.file.buffer);
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Extract a professional 3rd person trade summary focusing on construction expertise." },
        { role: "user", content: pdfData.text }
      ],
    });
    res.json({ summary: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: "Summary extraction failed" });
  }
});

// --- 4. MASTER PDF ENGINE (UPDATED FOR COMPANY ADDRESS) ---
app.post("/api/export/pdf", async (req, res) => {
  try {
    const data = req.body;
    const doc = new PDFDocument({ size: "LETTER", margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // BLUE HEADER LOGIC
    doc.rect(0, 0, doc.page.width, 140).fill("#1F4E79");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(26).text(data.applicantName || "", 50, 40);
    doc.font("Helvetica").fontSize(11).text(`${data.applicantEmail || ""} | ${data.applicantPhone || ""}`, 50, 75);
    doc.text(`${data.applicantAddress || ""} ${data.applicantCityStateZip || ""}`, 50, 90);
    
    doc.fillColor("black").moveDown(8);

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
      // COVER LETTER LOGIC
      // This places the Company Address below the header but above the letter text
      if (data.recipientAddress) {
        doc.font("Helvetica-Bold").fontSize(11).text("TO:", 50, 160);
        doc.font("Helvetica").fontSize(11).text(data.recipientAddress, 50, 175);
        doc.moveDown(2);
      }
      doc.font("Helvetica").fontSize(12).text(data.letter || "", { width: 500, align: "left", lineGap: 2 });
    }
    doc.end();
  } catch (err) {
    console.error("PDF Export Error:", err);
    res.status(500).send("PDF generation failed.");
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Master Brain Live`));
