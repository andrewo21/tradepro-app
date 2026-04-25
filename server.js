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

// --- 1. THE AI ENGINE (REWRITES & EXTRACTION) ---

// RESTORED: Summary Extraction logic for the "Extract Summary" button
app.post("/api/ai/extract-summary", async (req, res) => {
  try {
    const { text } = req.body;
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are a professional resume writer. Based on the provided resume text, write a 3-4 sentence professional summary focusing on construction experience and leadership. Return ONLY the summary text." 
        },
        { role: "user", content: text }
      ],
      temperature: 0.5,
    });
    res.json({ summary: completion.choices?.[0]?.message?.content?.trim() || "" });
  } catch (err) { 
    console.error("Extraction error:", err);
    res.status(500).json({ error: "Extraction failed" }); 
  }
});

// FIXED: AI Rewrite logic with improved system prompt
app.post("/api/ai/rewrite", async (req, res) => {
  try {
    const { text, type } = req.body; 
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an Elite Construction Recruiter. Translate Spanish/Spanglish and fix all grammar like 'many peoples' into high-end professional American English. Return ONLY the text without quotes." 
        },
        { role: "user", content: `Rewrite this ${type}: ${text}` }
      ],
      temperature: 0.3,
    });
    let result = completion.choices?.[0]?.message?.content?.trim() || "";
    res.json({ suggestion: result.replace(/^["'‘“`]+|["'’ ”`]+$/g, "") });
  } catch (err) { res.status(500).json({ error: "Rewrite failed" }); }
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

// --- 2. DYNAMIC PDF TEMPLATE ENGINE ---

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
    (data.experience || []).forEach(exp => {
      doc.moveDown().font("Helvetica-Bold").fontSize(11).text(`${exp.jobTitle || exp.title} - ${exp.company}`, 250);
      (exp.responsibilities || []).forEach(r => doc.font("Helvetica").fontSize(10).text(`• ${r.text || r}`, 260, doc.y, { width: 310 }));
    });
  },

  "standard-contemporary": (doc, data) => {
    doc.fillColor("black").font("Helvetica-Bold").fontSize(24).text(data.applicantName || "", 50, 50);
    doc.font("Helvetica").fontSize(9).fillColor("#4A5568");
    doc.text(data.applicantAddress || "", 400, 50, { align: "right" });
    doc.text(data.applicantEmail || "", 400, 62, { align: "right" });
    doc.text(data.applicantPhone || "", 400, 74, { align: "right" });
    doc.moveDown(3).fillColor("black").font("Helvetica-Bold").fontSize(10).text("CORE SKILLS");
    doc.moveTo(50, doc.y + 2).lineTo(550, doc.y + 2).stroke("#E2E8F0");
    doc.moveDown(1.5);
    if (data.skills?.length > 0) {
      const mid = Math.ceil(data.skills.length / 2);
      let skillY = doc.y;
      data.skills.slice(0, mid).forEach((s, i) => doc.font("Helvetica").fontSize(9).text(`• ${s}`, 50, skillY + (i * 12)));
      data.skills.slice(mid).forEach((s, i) => doc.font("Helvetica").fontSize(9).text(`• ${s}`, 300, skillY + (i * 12)));
      doc.moveDown(Math.max(mid, data.skills.length - mid) * 0.8);
    }
    doc.moveDown(2).font("Helvetica-Bold").fontSize(10).text("EXPERIENCE");
    doc.moveTo(50, doc.y + 2).lineTo(550, doc.y + 2).stroke("#E2E8F0");
    (data.experience || []).forEach(exp => {
      doc.moveDown(1).font("Helvetica-Bold").fontSize(10).text(exp.jobTitle || exp.title || "", 50);
      doc.font("Helvetica").fontSize(9).fillColor("#718096").text(exp.dateRange || "Present", 400, doc.y - 10, { align: "right" });
      doc.fillColor("black").font("Helvetica").text(exp.company || "", 50);
      (exp.responsibilities || []).forEach(r => doc.font("Helvetica").fontSize(9).text(`• ${r.text || r}`, 60, doc.y, { width: 480 }));
    });
  },

  "standard-classic": (doc, data) => {
    doc.font("Helvetica-Bold").fontSize(26).text(data.applicantName || "", { align: "center" });
    doc.font("Helvetica").fontSize(10).text(`${data.applicantEmail} | ${data.applicantPhone} | ${data.applicantAddress}`, { align: "center" });
    doc.moveDown(2).font("Helvetica-Bold").fontSize(14).text("SUMMARY", { underline: true });
    doc.font("Helvetica").fontSize(11).moveDown(0.5).text(data.summary || "", { width: 500 });
    doc.moveDown().font("Helvetica-Bold").fontSize(14).text("EXPERIENCE", { underline: true });
    (data.experience || []).forEach(exp => {
      doc.moveDown(0.5).font("Helvetica-Bold").fontSize(11).text(`${exp.jobTitle || exp.title} - ${exp.company}`);
      (exp.responsibilities || []).forEach(r => doc.font("Helvetica").fontSize(10).text(`• ${r.text || r}`, 65));
    });
  }
};

// --- 3. EXPORT CONTROLLER ---

app.post("/api/export/pdf", async (req, res) => {
  try {
    const data = req.body;
    const isResume = data.type === "resume";
    const templateId = data.selectedTemplate || "standard-contemporary";

    const doc = new PDFDocument({ 
      size: "LETTER", 
      margin: (isResume && templateId === "sidebar-green") ? 0 : 50 
    });

    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    if (isResume) {
      // DYNAMIC DISPATCH: Matches Step 1 Template ID to drawing logic
      const draw = templateRegistry[templateId] || templateRegistry["standard-contemporary"];
      draw(doc, data);
    } else {
      // COVER LETTER: The blue header remains locked to cover letters only
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
