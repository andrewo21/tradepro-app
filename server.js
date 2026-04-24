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

// --- 1. THE AI REWRITE EXPERT (Updated System Prompt) ---
app.post("/api/ai/rewrite", async (req, res) => {
  try {
    const { text, type } = req.body; 
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an Elite Construction Recruiter. Translate Spanish/Spanglish and fix all grammar like 'many peoples' into high-end professional American English. Return ONLY the text." 
        },
        { role: "user", content: `Rewrite this ${type}: ${text}` }
      ],
      temperature: 0.3,
    });
    let result = completion.choices?.[0]?.message?.content?.trim() || "";
    res.json({ suggestion: result.replace(/^["'‘“`]+|["'’ ”`]+$/g, "") });
  } catch (err) { res.status(500).json({ error: "Rewrite failed" }); }
});

// --- 2. COVER LETTER GENERATOR ---
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

// --- 3. MASTER PDF ENGINE (Surgically Separated) ---
app.post("/api/export/pdf", async (req, res) => {
  try {
    const data = req.body;
    
    // --- BRANCH A: THE RESUME ENGINE ---
    if (data.type === "resume") {
      const isSidebar = data.selectedTemplate === "sidebar-green";
      const doc = new PDFDocument({ size: "LETTER", margin: isSidebar ? 0 : 50 });
      res.setHeader("Content-Type", "application/pdf");
      doc.pipe(res);

      if (isSidebar) {
        // SIDEBAR GREEN LAYOUT
        doc.rect(0, 0, 220, doc.page.height).fill("#2D3748");
        doc.fillColor("white").font("Helvetica-Bold").fontSize(22).text(data.applicantName || "", 30, 50);
        doc.fillColor("#48BB78").fontSize(10).text(data.tradeTitle || "", 30, 80);
        doc.fillColor("white").fontSize(10).font("Helvetica-Bold").text("CONTACT", 30, 150);
        doc.font("Helvetica").fontSize(9).text(data.applicantEmail || "", 30, 170).text(data.applicantPhone || "", 30, 185).text(data.applicantAddress || "", 30, 200);
        
        doc.fillColor("black").font("Helvetica-Bold").fontSize(14).text("SUMMARY", 250, 50);
        doc.font("Helvetica").fontSize(10).text(data.summary || "", 250, 75, { width: 330 });
        doc.moveDown(2).font("Helvetica-Bold").fontSize(14).text("EXPERIENCE", 250);
        data.experience?.forEach(exp => {
          doc.moveDown().font("Helvetica-Bold").fontSize(11).text(`${exp.jobTitle} - ${exp.company}`, 250);
          exp.responsibilities?.forEach(r => doc.font("Helvetica").fontSize(10).text(`• ${r.text || r}`, 260, doc.y, { width: 310 }));
        });
      } else {
        // CLEAN CLASSIC RESUME (NO BLUE HEADER)
        doc.fillColor("black").font("Helvetica-Bold").fontSize(26).text(data.applicantName || "", { align: "center" });
        doc.font("Helvetica").fontSize(10).text(`${data.applicantEmail} | ${data.applicantPhone} | ${data.applicantAddress}`, { align: "center" });
        doc.moveDown(2);
        doc.font("Helvetica-Bold").fontSize(14).text("SUMMARY", { underline: true });
        doc.font("Helvetica").fontSize(11).moveDown(0.5).text(data.summary || "", { width: 500 });
        doc.moveDown().font("Helvetica-Bold").fontSize(14).text("EXPERIENCE", { underline: true });
        data.experience?.forEach(exp => {
          doc.moveDown(0.5).font("Helvetica-Bold").fontSize(11).text(`${exp.jobTitle || exp.title} - ${exp.company}`);
          exp.responsibilities?.forEach(r => doc.font("Helvetica").fontSize(10).text(`• ${r.text || r}`, 65));
        });
        if (data.skills?.length > 0) {
          doc.moveDown().font("Helvetica-Bold").fontSize(14).text("SKILLS", { underline: true });
          doc.font("Helvetica").fontSize(11).text(data.skills.join(" | "));
        }
      }
      doc.end();

    // --- BRANCH B: THE COVER LETTER ENGINE ---
    } else {
      const doc = new PDFDocument({ size: "LETTER", margin: 50 });
      res.setHeader("Content-Type", "application/pdf");
      doc.pipe(res);

      // FULL HEADER RESTORED (Email, Phone, Address)
      doc.rect(0, 0, doc.page.width, 130).fill("#1F4E79");
      doc.fillColor("white").font("Helvetica-Bold").fontSize(26).text(data.applicantName || "", 50, 40);
      doc.font("Helvetica").fontSize(10).text(`${data.applicantEmail || ""} | ${data.applicantPhone || ""}`, 50, 75);
      doc.text(data.applicantAddress || "", 50, 90);
      
      doc.fillColor("black").font("Helvetica").fontSize(11).text(data.date || "", 50, 150);
      doc.moveDown(1.5).text(data.hiringManager || "").text(data.companyName || "").text(data.companyAddress || "");
      doc.moveDown(2).fontSize(12).text(data.letter || "", { width: 500, lineGap: 3 });
      doc.end();
    }
  } catch (err) { res.status(500).send("PDF failed"); }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Master Brain Live`));
