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

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));

// --- 1. THE ELITE CONSTRUCTION LINGUIST (Summary & Responsibility Rewrite) ---
app.post("/api/ai/rewrite", async (req, res) => {
  try {
    const { text, type } = req.body; 
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are an expert Elite Construction Recruiter. 
          GOAL: Transform raw, broken, or multi-lingual trade input into high-end professional American English.
          RULES:
          1. TRANSLATE: Convert Spanish/Spanglish ("yo trabaje") to professional English.
          2. GRAMMAR: Fix all subject-verb errors (e.g., "many peoples" -> "diverse workforce").
          3. TRADE SLANG: Use industry-standard terms ("mudding" -> "Drywall Finishing").
          4. FORMAT: If type is 'summary', write a punchy 3rd person narrative. If 'responsibility', use power verbs.
          5. NO CHAT: Return ONLY the final professional text.` 
        },
        { role: "user", content: `Professionalize this ${type}: ${text}` }
      ],
      temperature: 0.3,
    });
    let result = completion.choices?.[0]?.message?.content?.trim() || "";
    result = result.replace(/^["'‘“`]+|["'’ ”`]+$/g, ""); 
    res.json({ suggestion: result });
  } catch (err) {
    res.status(500).json({ error: "Rewrite failed" });
  }
});

// --- 2. COVER LETTER GENERATOR (Body Only) ---
app.post("/api/ai/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: "Construction Career Coach. Write only high-impact body paragraphs. No headers." }, { role: "user", content: prompt }],
    });
    res.json({ text: completion.choices?.[0]?.message?.content || "" });
  } catch (err) { res.status(500).json({ error: "Generation failed" }); }
});

// --- 3. SUMMARY EXTRACTION ---
app.post("/api/ai/extract-summary", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });
    const pdfData = await pdf(req.file.buffer);
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: "Extract a professional 3rd person trade summary." }, { role: "user", content: pdfData.text }],
    });
    res.json({ summary: completion.choices?.[0]?.message?.content || "" });
  } catch (err) { res.status(500).json({ error: "Extraction failed" }); }
});

// --- 4. THE MASTER PDF ENGINE (DYNAMIC TEMPLATE BRANCHING) ---
app.post("/api/export/pdf", async (req, res) => {
  try {
    const data = req.body;
    const template = data.selectedTemplate || "classic-blue";
    
    // Config: 0 margin for sidebar designs, 50 for standard
    const doc = new PDFDocument({ size: "LETTER", margin: template === "sidebar-green" ? 0 : 50 });
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    if (data.type === "resume") {
      // BRANCH 1: PREMIUM SIDEBAR GREEN
      if (template === "sidebar-green") {
        doc.rect(0, 0, 220, doc.page.height).fill("#2D3748"); // Dark Sidebar
        doc.fillColor("white").font("Helvetica-Bold").fontSize(22).text(data.applicantName || "", 30, 50);
        doc.fillColor("#48BB78").fontSize(10).text(data.tradeTitle || "", 30, 85);
        
        doc.fillColor("white").fontSize(10).font("Helvetica-Bold").text("CONTACT", 30, 160);
        doc.font("Helvetica").fontSize(9).text(data.applicantEmail || "", 30, 180);
        doc.text(data.applicantPhone || "", 30, 195);
        doc.text(data.applicantAddress || "", 30, 210, { width: 160 });

        if (data.skills?.length > 0) {
          doc.fillColor("white").fontSize(10).font("Helvetica-Bold").text("SKILLS", 30, 280);
          doc.font("Helvetica").fontSize(9).text(data.skills.join(" | "), 30, 300, { width: 160 });
        }

        // Main Body (Right Side)
        doc.fillColor("black").font("Helvetica-Bold").fontSize(14).text("PROFESSIONAL SUMMARY", 250, 50);
        doc.font("Helvetica").fontSize(10).text(data.summary || "", 250, 75, { width: 330, lineGap: 2 });
        
        doc.moveDown(2).font("Helvetica-Bold").fontSize(14).text("WORK EXPERIENCE", 250);
        data.experience?.forEach(exp => {
          doc.moveDown().font("Helvetica-Bold").fontSize(11).text(`${exp.jobTitle || exp.title} - ${exp.company}`, 250);
          exp.responsibilities?.forEach(r => {
            doc.font("Helvetica").fontSize(10).text(`• ${r.text || r}`, 260, doc.y, { width: 310 });
          });
        });

      // BRANCH 2: STANDARD CLASSIC BLUE
      } else {
        doc.rect(0, 0, doc.page.width, 130).fill("#1F4E79");
        doc.fillColor("white").font("Helvetica-Bold").fontSize(28).text(data.applicantName || "", 50, 35);
        doc.fontSize(12).text(data.tradeTitle || "", 50, 68); 
        doc.font("Helvetica").fontSize(10).text(`${data.applicantEmail} | ${data.applicantPhone} | ${data.applicantAddress}`, 50, 85);
        
        doc.fillColor("black").moveDown(5);
        doc.font("Helvetica-Bold").fontSize(14).text("SUMMARY", 50, 150);
        doc.font("Helvetica").fontSize(10).text(data.summary || "", 50, 175, { width: 500 });
        
        doc.moveDown().font("Helvetica-Bold").fontSize(14).text("EXPERIENCE", 50);
        data.experience?.forEach(exp => {
          doc.moveDown(0.5).font("Helvetica-Bold").fontSize(11).text(`${exp.jobTitle || exp.title} - ${exp.company}`);
          exp.responsibilities?.forEach(r => doc.font("Helvetica").fontSize(10).text(`• ${r.text || r}`, 65, doc.y, { width: 480 }));
        });

        if (data.skills?.length > 0) {
            doc.moveDown().font("Helvetica-Bold").fontSize(14).text("SKILLS", 50);
            doc.font("Helvetica").fontSize(11).text(data.skills.join(" | "));
        }
      }
    } else {
      // BRANCH 3: COVER LETTER (STRICTLY ISOLATED)
      doc.rect(0, 0, doc.page.width, 110).fill("#1F4E79");
      doc.fillColor("white").font("Helvetica-Bold").fontSize(26).text(data.applicantName || "", 50, 35);
      doc.font("Helvetica").fontSize(10).text(`${data.applicantEmail || ""} | ${data.applicantPhone || ""}`, 50, 65);
      doc.fillColor("black").font("Helvetica").fontSize(11).text(data.date || "", 50, 130);
      doc.moveDown(1).text(data.hiringManager || "").text(data.companyName || "").text(data.companyAddress || "");
      doc.moveDown(2).fontSize(12).text(data.letter || "", { width: 500, lineGap: 3 });
    }
    doc.end();
  } catch (err) { res.status(500).send("PDF failed"); }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Master Layout Engine Live`));
