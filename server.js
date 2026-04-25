import 'dotenv/config';
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import PDFDocument from "pdfkit";
import multer from "multer";

const app = express();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "5mb" }));

// --- 1. AI ENGINE (REWRITE & SUMMARY) ---
app.post("/api/ai/rewrite", async (req, res) => {
  try {
    const { text, type } = req.body; 
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an Elite Construction Recruiter. Translate Spanish/Spanglish and fix all grammar into high-end professional American English. Return ONLY the text." 
        },
        { role: "user", content: `Rewrite this ${type}: ${text}` }
      ],
      temperature: 0.3,
    });
    let result = completion.choices?.[0]?.message?.content?.trim() || "";
    res.json({ suggestion: result.replace(/^["'‘“`]+|["'’ ”`]+$/g, "") });
  } catch (err) { res.status(500).json({ error: "Rewrite failed" }); }
});

// RESTORED: Extract Summary Button Logic
app.post("/api/ai/extract-summary", async (req, res) => {
  try {
    const { text } = req.body;
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are a professional resume writer. Write a 3-4 sentence professional summary focusing on construction experience. Return ONLY the text." 
        },
        { role: "user", content: text }
      ],
    });
    res.json({ summary: completion.choices?.[0]?.message?.content?.trim() || "" });
  } catch (err) { res.status(500).json({ error: "Extraction failed" }); }
});

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

// --- 2. THE PDF TEMPLATE REGISTRY ---
// Each function here draws a specific layout matching your template-list.ts
const templateRegistry = {
  "sidebar-green": (doc, data) => {
    doc.rect(0, 0, 220, doc.page.height).fill("#2D3748");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(22).text(data.applicantName || "", 30, 50);
    doc.fillColor("#48BB78").fontSize(10).text(data.tradeTitle || "", 30, 80);
    doc.fillColor("white").fontSize(10).font("Helvetica-Bold").text("CONTACT", 30, 150);
    doc.font("Helvetica").fontSize(9).text(data.applicantEmail || "", 30, 170).text(data.applicantPhone || "", 30, 185).text(data.applicantAddress || "", 30, 200);
    doc.fillColor("black").font("Helvetica-Bold").fontSize(14).text("SUMMARY", 250, 50);
    doc.font("Helvetica").fontSize(10).text(data.summary || "", 250, 75, { width: 330 });
    doc.moveDown(2).font("Helvetica-Bold").fontSize(14).text("EXPERIENCE", 250);
    data.experience?.forEach(exp => {
      doc.moveDown().font("Helvetica-Bold").fontSize(11).text(`${exp.jobTitle || exp.title} - ${exp.company}`, 250);
      (exp.responsibilities || []).forEach(r => doc.font("Helvetica").fontSize(10).text(`• ${r.text || r}`, 260, doc.y, { width: 310 }));
    });
  },

  "standard-contemporary": (doc, data) => {
    doc.fillColor("black").font("Helvetica-Bold").fontSize(24).text(data.applicantName || "", 50, 50);
    doc.font("Helvetica").fontSize(9).fillColor("#4A5568").text(`${data.applicantAddress} | ${data.applicantEmail} | ${data.applicantPhone}`, 50, 80);
    doc.moveDown(2).fillColor("black").font("Helvetica-Bold").fontSize(12).text("PROFESSIONAL SUMMARY");
    doc.moveTo(50, doc.y + 2).lineTo(550, doc.y + 2).stroke("#E2E8F0");
    doc.moveDown(0.5).font("Helvetica").fontSize(10).text(data.summary || "", { width: 500 });
    doc.moveDown(2).font("Helvetica-Bold").fontSize(12).text("EXPERIENCE");
    doc.moveTo(50, doc.y + 2).lineTo(550, doc.y + 2).stroke("#E2E8F0");
    data.experience?.forEach(exp => {
      doc.moveDown(1).font("Helvetica-Bold").fontSize(11).text(exp.jobTitle || exp.title || "");
      doc.font("Helvetica-Oblique").fontSize(10).text(exp.company || "");
      (exp.responsibilities || []).forEach(r => doc.font("Helvetica").fontSize(10).text(`• ${r.text || r}`, 60));
    });
  },

  "modern-blue": (doc, data) => {
    doc.rect(0, 0, doc.page.width, 100).fill("#2B6CB0");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(26).text(data.applicantName || "", 50, 35);
    doc.fontSize(10).text(data.tradeTitle || "", 50, 65);
    doc.fillColor("black").moveDown(4);
    doc.font("Helvetica-Bold").fontSize(12).text("EXPERIENCE", 50);
    data.experience?.forEach(exp => {
      doc.moveDown(1).font("Helvetica-Bold").text(`${exp.jobTitle} @ ${exp.company}`);
      (exp.responsibilities || []).forEach(r => doc.font("Helvetica").fontSize(10).text(`- ${r.text || r}`, 60));
    });
  },

  "standard-classic": (doc, data) => {
    doc.font("Helvetica-Bold").fontSize(28).text(data.applicantName || "", { align: "center" });
    doc.font("Helvetica").fontSize(10).text(`${data.applicantEmail} | ${data.applicantPhone}`, { align: "center" });
    doc.moveDown(2).font("Helvetica-Bold").text("SUMMARY", { underline: true });
    doc.font("Helvetica").text(data.summary || "");
    doc.moveDown().font("Helvetica-Bold").text("EXPERIENCE", { underline: true });
    data.experience?.forEach(exp => {
      doc.moveDown(0.5).font("Helvetica-Bold").text(exp.jobTitle || "");
      (exp.responsibilities || []).forEach(r => doc.font("Helvetica").text(`• ${r.text || r}`, 70));
    });
  }
  // Note: Add remaining executive/premium keys here following the same pattern
};

// --- 3. MASTER EXPORT ENGINE ---
app.post("/api/export/pdf", async (req, res) => {
  try {
    const data = req.body;
    const isResume = data.type === "resume";
    
    // Create Doc - Sidebar templates get 0 margin for full-bleed background
    const doc = new PDFDocument({ 
      size: "LETTER", 
      margin: (data.selectedTemplate === "sidebar-green") ? 0 : 50 
    });

    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    if (isResume) {
      // 1. Get the drawing recipe based on Step 1 selection
      const templateId = data.selectedTemplate || "standard-contemporary";
      const draw = templateRegistry[templateId] || templateRegistry["standard-contemporary"];
      
      // 2. Execute drawing
      draw(doc, data);
    } else {
      // COVER LETTER - Surgically isolated Blue Header logic
      doc.rect(0, 0, doc.page.width, 130).fill("#1F4E79");
      doc.fillColor("white").font("Helvetica-Bold").fontSize(26).text(data.applicantName || "", 50, 40);
      doc.font("Helvetica").fontSize(10).text(`${data.applicantEmail || ""} | ${data.applicantPhone || ""}`, 50, 75);
      doc.text(data.applicantAddress || "", 50, 90);
      
      doc.fillColor("black").font("Helvetica").fontSize(11).text(data.date || "", 50, 150);
      doc.moveDown(1.5).text(data.hiringManager || "").text(data.companyName || "").text(data.companyAddress || "");
      doc.moveDown(2).fontSize(12).text(data.letter || "", { width: 500, lineGap: 3 });
    }

    doc.end();
  } catch (err) { 
    console.error("PDF Export Error:", err);
    res.status(500).send("PDF failed"); 
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Master Brain Live`));
