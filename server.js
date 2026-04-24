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
          
          STRICT RULES:
          1. TRANSLATE: Instantly convert Spanish/Spanglish to perfect American English.
          2. GRAMMAR: Fix all subject-verb agreement (e.g., 'i manage many peoples' becomes 'Supervised a large-scale workforce').
          3. TRADE SLANG: Convert slang into professional terms (e.g., 'mudding' -> 'Advanced Drywall Finishing').
          4. NO CONVERSATION: Return ONLY the corrected professional text.` 
        },
        { role: "user", content: `Rewrite this ${type} for a construction expert: ${text}` }
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

// --- 2. COVER LETTER GENERATOR (LOCKED) ---
app.post("/api/ai/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: "Construction Career Coach. Body paragraphs only." }, { role: "user", content: prompt }],
    });
    res.json({ text: completion.choices?.[0]?.message?.content || "" });
  } catch (err) { res.status(500).json({ error: "Generation failed" }); }
});

// --- 3. SUMMARY EXTRACTION ---
app.post("/api/ai/extract-summary", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const pdfData = await pdf(req.file.buffer);
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: "Extract a professional trade summary." }, { role: "user", content: pdfData.text }],
    });
    res.json({ summary: completion.choices?.[0]?.message?.content || "" });
  } catch (err) { res.status(500).json({ error: "Extraction failed" }); }
});

// --- 4. MASTER PDF ENGINE ---
app.post("/api/export/pdf", async (req, res) => {
  try {
    const data = req.body;
    const isSidebar = data.selectedTemplate === "sidebar-green";
    const doc = new PDFDocument({ size: "LETTER", margin: isSidebar ? 0 : 50 });
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    if (data.type === "resume") {
      if (isSidebar) {
        // --- SIDEBAR GREEN LAYOUT ---
        doc.rect(0, 0, 220, doc.page.height).fill("#2D3748");
        doc.fillColor("white").font("Helvetica-Bold").fontSize(22).text(data.applicantName || "", 30, 50);
        doc.fillColor("#48BB78").fontSize(10).text(data.tradeTitle || "", 30, 80);
        
        doc.fillColor("white").fontSize(10).font("Helvetica-Bold").text("CONTACT", 30, 150);
        doc.font("Helvetica").fontSize(9).text(data.applicantEmail || "", 30, 170).text(data.applicantPhone || "", 30, 185);
        doc.text(data.applicantAddress || "", 30, 200, { width: 160 });

        doc.fillColor("white").fontSize(10).font("Helvetica-Bold").text("SKILLS", 30, 260);
        doc.font("Helvetica").fontSize(9).text(data.skills?.join(" | ") || "", 30, 280, { width: 160 });

        // Main Content (Right)
        doc.fillColor("black").font("Helvetica-Bold").fontSize(14).text("PROFESSIONAL SUMMARY", 250, 50);
        doc.font("Helvetica").fontSize(10).text(data.summary || "", 250, 75, { width: 330, lineGap: 2 });
        
        doc.moveDown(2).font("Helvetica-Bold").fontSize(14).text("WORK EXPERIENCE", 250);
        data.experience?.forEach(exp => {
          doc.moveDown().font("Helvetica-Bold").fontSize(11).text(`${exp.jobTitle || exp.title} - ${exp.company}`, 250);
          exp.responsibilities?.forEach(r => doc.font("Helvetica").fontSize(10).text(`• ${r.text || r}`, 260, doc.y, { width: 310 }));
        });

        if (data.education?.length > 0) {
            doc.moveDown(2).font("Helvetica-Bold").fontSize(14).text("EDUCATION", 250);
            data.education.forEach(edu => {
                doc.moveDown(0.5).font("Helvetica-Bold").fontSize(11).text(`${edu.degree} - ${edu.school}`, 250);
            });
        }
      } else {
        // --- CLASSIC PROFESSIONAL LAYOUT ---
        doc.rect(0, 0, doc.page.width, 110).fill("#1F4E79");
        doc.fillColor("white").font("Helvetica-Bold").fontSize(28).text(data.applicantName || "", 50, 35);
        doc.font("Helvetica").fontSize(10).text(`${data.applicantEmail || ""} | ${data.applicantPhone || ""} | ${data.applicantAddress || ""}`, 50, 75);
        
        doc.fillColor("black").moveDown(5).font("Helvetica-Bold").fontSize(14).text("SUMMARY", 50, 130);
        doc.font("Helvetica").fontSize(10).text(data.summary || "", 50, 155, { width: 500 });
        
        doc.moveDown().font("Helvetica-Bold").fontSize(14).text("EXPERIENCE", 50);
        data.experience?.forEach(exp => {
          doc.moveDown().font("Helvetica-Bold").fontSize(11).text(`${exp.jobTitle || exp.title} - ${exp.company}`);
          exp.responsibilities?.forEach(r => doc.font("Helvetica").fontSize(10).text(`• ${r.text || r}`, 65, doc.y, { width: 480 }));
        });

        if (data.skills?.length > 0) {
            doc.moveDown().font("Helvetica-Bold").fontSize(14).text("SKILLS", 50);
            doc.font("Helvetica").fontSize(10).text(data.skills.join(" | "), 50);
        }

        if (data.education?.length > 0) {
            doc.moveDown().font("Helvetica-Bold").fontSize(14).text("EDUCATION", 50);
            data.education.forEach(edu => {
                doc.moveDown(0.5).font("Helvetica").fontSize(10).text(`${edu.degree} - ${edu.school}`);
            });
        }
      }
    } else {
      // --- COVER LETTER ---
      doc.rect(0, 0, doc.page.width, 110).fill("#1F4E79");
      doc.fillColor("white").font("Helvetica-Bold").fontSize(26).text(data.applicantName || "", 50, 35);
      
      // RESTORED HEADER CONTACT INFO FOR COVER LETTER
      doc.font("Helvetica").fontSize(10).text(`${data.applicantEmail || ""} | ${data.applicantPhone || ""}`, 50, 65);
      doc.text(data.applicantAddress || "", 50, 77);

      doc.fillColor("black").font("Helvetica").fontSize(11).text(data.date || "", 50, 130);
      doc.moveDown(1).text(data.hiringManager || "").text(data.companyName || "").text(data.companyAddress || "");
      doc.moveDown(2).fontSize(12).text(data.letter || "", { width: 500, lineGap: 3 });
    }
    doc.end();
  } catch (err) { res.status(500).send("PDF failed"); }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Master Brain Live`));
