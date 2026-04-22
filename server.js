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

// --- 1. THE AI REWRITE EXPERT (Construction & Trade Specialist) ---
app.post("/api/ai/rewrite", async (req, res) => {
  try {
    const { text, type } = req.body; 
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are an expert elite Construction & Trade Industry Recruiter.
          STRICT RULES:
          1. TRANSLATION: Instantly detect and translate Spanish, Spanglish, or broken English into superior professional American English.
          2. SLANG: You understand all trade slang (e.g., 'mudding', 'rough-in', 'sparky', 'chippy', 'blueprints').
          3. GRAMMAR: If the user has poor grammar (e.g., "i manage many peoples" or "yo tengo tools"), extract the professional intent.
          4. FORMATTING:
             - If 'skill': Return ONLY 2-4 powerful words (e.g., "Advanced Drywall Finishing").
             - If 'summary' or 'responsibility': Use high-impact action verbs and superior sentence structure.
          5. NO conversation. NO quotes. NO 'Here is your suggestion'. JUST the final text.` 
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

// --- 2. SUMMARY EXTRACTION (From PDF Upload) ---
app.post("/api/ai/extract-summary", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const pdfData = await pdf(req.file.buffer);
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Professional 3rd person trade summary. Translate Spanglish to English if needed. Focus on construction expertise." },
        { role: "user", content: pdfData.text }
      ],
    });
    res.json({ summary: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: "Summary extraction failed" });
  }
});

// --- 3. MASTER PDF ENGINE ---
app.post("/api/export/pdf", async (req, res) => {
  try {
    const data = req.body;
    const doc = new PDFDocument({ size: "LETTER", margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);
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
      doc.font("Helvetica").fontSize(12).text(data.letter || "", { width: 500, align: "left", lineGap: 2 });
    }
    doc.end();
  } catch (err) {
    res.status(500).send("PDF generation failed.");
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Master Brain Live`));
