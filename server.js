import 'dotenv/config';
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import PDFDocument from "pdfkit";
import multer from "multer";
import pdf from "pdf-parse-fixed";

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// SECURITY: LOCKDOWN (Replace "*" with your domain when ready)
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "5mb" }));

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
          1. TRANSLATE: Convert Spanish/Spanglish to perfect American English.
          2. TRADE SLANG: Convert slang into professional terms (e.g., "mudding" -> "Drywall Finishing").
          3. STRUCTURE: Use powerful action verbs for responsibilities. 3rd person for summaries.
          4. NO CHAT: Return ONLY the corrected text.` 
        },
        { role: "user", content: `Rewrite this ${type}: ${text}` }
      ],
      temperature: 0.3,
    });
    let result = completion.choices?.[0]?.message?.content?.trim() || "";
    result = result.replace(/^["'‘“`]+|["'’ ”`]+$/g, ""); 
    res.json({ suggestion: result });
  } catch (err) {
    console.error("Rewrite Error:", err);
    res.status(500).json({ error: "Rewrite failed" });
  }
});

// --- 2. COVER LETTER GENERATOR (LOCKED) ---
app.post("/api/ai/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: "Construction Career Coach. Write ONLY the body paragraphs." }, { role: "user", content: prompt }],
    });
    res.json({ text: completion.choices?.[0]?.message?.content || "" });
  } catch (err) { res.status(500).json({ error: "Generation failed" }); }
});

// --- 3. SUMMARY EXTRACTION ---
app.post("/api/ai/extract-summary", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const pdfData = await pdf(req.file.buffer);
    if (!pdfData?.text) return res.status(422).json({ error: "No text in PDF" });
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: "Extract a professional trade summary." }, { role: "user", content: pdfData.text }],
    });
    res.json({ summary: completion.choices?.[0]?.message?.content || "" });
  } catch (err) { res.status(500).json({ error: "Extraction failed" }); }
});

// --- 4. MASTER PDF ENGINE (DYNAMIC LAYOUTS RESTORED) ---
app.post("/api/export/pdf", async (req, res) => {
  try {
    const data = req.body;
    const isSidebar = data.selectedTemplate === "sidebar-green";
    
    const doc = new PDFDocument({ size: "LETTER", margin: isSidebar ? 0 : 50 });
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    if (data.type === "resume") {
      if (isSidebar) {
        // --- SIDEBAR GREEN FULL RESTORED ---
        doc.rect(0, 0, 220, doc.page.height).fill("#2D3748");
        doc.fillColor("white").font("Helvetica-Bold").fontSize(22).text(data.applicantName || "", 30, 50);
        doc.fillColor("#48BB78").fontSize(10).text(data.tradeTitle || "", 30, 80);
        
        doc.fillColor("white").fontSize(10).font("Helvetica-Bold").text("CONTACT", 30, 150);
        doc.font("Helvetica").fontSize(9).text(data.applicantEmail || "", 30, 170);
        doc.text(data.applicantPhone || "", 30, 185);
        doc.text(data.applicantAddress || "", 30, 200, { width: 160 });

        doc.fillColor("white").fontSize(10).font("Helvetica-Bold").text("SKILLS", 30, 260);
        const skillsText = data.skills?.join(" | ") || "";
        doc.font("Helvetica").fontSize(9).text(skillsText, 30, 280, { width: 160 });

        // Main Content Area
        doc.fillColor("black").font("Helvetica-Bold").fontSize(14).text("PROFESSIONAL SUMMARY", 250, 50);
        doc.font("Helvetica").fontSize(10).text(data.summary || "", 250, 75, { width: 330, lineGap: 2 });
        
        doc.moveDown(2).font("Helvetica-Bold").fontSize(14).text("WORK EXPERIENCE", 250);
        data.experience?.forEach(exp => {
          doc.moveDown().font("Helvetica-Bold").fontSize(11).text(`${exp.jobTitle} - ${exp.company}`, 250);
          exp.responsibilities?.forEach(r => {
            doc.font("Helvetica").fontSize(10).text(`• ${r.text}`, 260, doc.y, { width: 310 });
          });
        });
      } else {
        // --- CLASSIC PROFESSIONAL RESTORED ---
        doc.rect(0, 0, doc.page.width, 110).fill("#1F4E79");
        doc.fillColor("white").font("Helvetica-Bold").fontSize(28).text(data.applicantName || "", 50, 35);
        doc.font("Helvetica").fontSize(10).text(`${data.applicantEmail} | ${data.applicantPhone} | ${data.applicantAddress}`, 50, 75);
        
        doc.fillColor("black").moveDown(5);
        doc.font("Helvetica-Bold").fontSize(14).text("SUMMARY", 50, 130);
        doc.font("Helvetica").fontSize(10).text(data.summary, 50, 155, { width: 500 });
        
        doc.moveDown().font("Helvetica-Bold").fontSize(14).text("EXPERIENCE", 50);
        data.experience?.forEach(exp => {
          doc.moveDown().font("Helvetica-Bold").fontSize(11).text(`${exp.jobTitle} - ${exp.company}`);
          exp.responsibilities?.forEach(r => doc.font("Helvetica").fontSize(10).text(`• ${r.text}`, 65));
        });
      }
    } else {
      // --- COVER LETTER (LOCKED) ---
      doc.rect(0, 0, doc.page.width, 110).fill("#1F4E79");
      doc.fillColor("white").font("Helvetica-Bold").fontSize(26).text(data.applicantName || "", 50, 40);
      doc.fillColor("black").font("Helvetica").fontSize(11).text(data.date || "", 50, 130);
      doc.text(data.hiringManager || "").text(data.companyName || "").text(data.companyAddress || "");
      doc.moveDown(2).fontSize(12).text(data.letter || "", { width: 500, lineGap: 3 });
    }
    doc.end();
  } catch (err) { 
    console.error("PDF Engine Error:", err);
    res.status(500).send("PDF failed"); 
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Master Brain Live`));
