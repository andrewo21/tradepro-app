import 'dotenv/config';
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import PDFDocument from "pdfkit";
import multer from "multer";
import pdf from "pdf-parse-fixed";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// LOCKDOWN: Change the "*" to your domain when ready
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));

// --- 1. THE IMPROVED AI REWRITE EXPERT ---
app.post("/api/ai/rewrite", async (req, res) => {
  try {
    const { text, type } = req.body; 
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are an expert Elite Construction Recruiter and Master Linguist.
          YOUR GOAL: Take raw input (broken English, Spanglish, trade slang) and transform it into superior, high-end professional trade language.
          
          RULES:
          1. DETECT: If the text is in Spanish or Spanglish (e.g., "yo trabaje en roofing" or "tengo mucha experiencia"), translate it to perfect American English.
          2. TRADE SLANG: Convert slang into professional terms (e.g., "mudding" -> "Drywall Finishing", "sparky" -> "Journeyman Electrician").
          3. STRUCTURE: 
             - If 'responsibility': Start with a powerful action verb. Focus on safety and precision.
             - If 'summary': Write a punchy, 3rd person professional narrative.
             - If 'skill': Return ONLY 2-4 professional words.
          4. NO CHAT: Return ONLY the corrected text. No quotes.` 
        },
        { role: "user", content: `Rewrite this ${type} for a master-level construction resume: ${text}` }
      ],
      temperature: 0.3,
    });

    let result = completion.choices[0].message.content.trim();
    result = result.replace(/^["'‘“`]+|["'’ ”`]+$/g, ""); 
    res.json({ suggestion: result });
  } catch (err) {
    res.status(500).json({ error: "Rewrite failed" });
  }
});

// --- 2. COVER LETTER GENERATOR (LOCKED & WORKING) ---
app.post("/api/ai/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Construction Career Coach. Write ONLY the body of the letter." },
        { role: "user", content: prompt }
      ],
    });
    res.json({ text: completion.choices[0].message.content });
  } catch (err) { res.status(500).json({ error: "Generation failed" }); }
});

// --- 3. SUMMARY EXTRACTION ---
app.post("/api/ai/extract-summary", upload.single("file"), async (req, res) => {
  try {
    const pdfData = await pdf(req.file.buffer);
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: "Extract professional trade summary." }, { role: "user", content: pdfData.text }],
    });
    res.json({ summary: completion.choices[0].message.content });
  } catch (err) { res.status(500).json({ error: "Extraction failed" }); }
});

// --- 4. MASTER PDF ENGINE ---
app.post("/api/export/pdf", async (req, res) => {
  try {
    const data = req.body;
    const doc = new PDFDocument({ size: "LETTER", margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.rect(0, 0, doc.page.width, 110).fill("#1F4E79");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(28).text(data.applicantName || "", 50, 35);
    doc.font("Helvetica").fontSize(10);
    doc.text(`${data.applicantEmail || ""} | ${data.applicantPhone || ""} | ${data.applicantAddress || ""} ${data.applicantCityStateZip || ""}`, 50, 75);
    
    doc.fillColor("black").moveDown(4);

    if (data.type === "resume") {
      doc.font("Helvetica-Bold").fontSize(14).text("PROFESSIONAL SUMMARY", { underline: true });
      doc.font("Helvetica").fontSize(11).moveDown(0.5).text(data.summary || "", { width: 500 });
      doc.moveDown().font("Helvetica-Bold").fontSize(14).text("WORK EXPERIENCE", { underline: true });
      data.experience?.forEach(exp => {
        doc.moveDown(0.5).font("Helvetica-Bold").fontSize(12).text(`${exp.jobTitle} - ${exp.company}`);
        exp.responsibilities?.forEach(r => doc.font("Helvetica").fontSize(10).text(`• ${r.text}`, { indent: 10 }));
      });
      doc.moveDown().font("Helvetica-Bold").fontSize(14).text("SKILLS", { underline: true });
      doc.font("Helvetica").fontSize(11).text(data.skills?.map(s => s.text).join(" | ") || "");
    } else {
      doc.font("Helvetica").fontSize(11).text(data.date || "", 50, 130);
      doc.moveDown(1.5).text(data.hiringManager || "").text(data.companyName || "").text(data.companyAddress || "");
      doc.moveDown(2).font("Helvetica").fontSize(11.5).text(data.letter || "", { width: 500, lineGap: 3.5 });
    }
    doc.end();
  } catch (err) { res.status(500).send("PDF failed"); }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Master Brain Live`));
