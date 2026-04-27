import 'dotenv/config';
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import PDFDocument from "pdfkit";
import multer from "multer";
import pdfParse from "pdf-parse-fixed";

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors({ origin: "*" }));
// Support both JSON and URL Encoded for maximum compatibility
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/**
 * --- 1. AI ENGINE (REWRITES & EXTRACTION) ---
 */

// Accepts a PDF upload (field name "file") or a JSON/form body with a "resumeText" field
app.post("/api/ai/extract-summary", upload.any(), async (req, res) => {
  try {
    let text = "";

    // 1. If a PDF file was uploaded, parse it to extract text
    const uploadedFile = req.files && req.files.find(f => f.fieldname === "file");
    if (uploadedFile) {
      const parsed = await pdfParse(uploadedFile.buffer);
      text = parsed.text || "";
    }

    // 2. Fall back to plain-text body fields (JSON or URL-encoded)
    if (!text) {
      text = req.body.resumeText || req.body.text || req.body.resumeContent || req.body.content || "";
    }

    if (!text.trim()) {
      console.error("Payload empty. req.body:", req.body, "req.files:", req.files);
      return res.status(400).json({ error: "No resume content received. Upload a PDF file or send resumeText in the request body." });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ 
        role: "system", 
        content: "You are a professional resume writer. Write a 3-4 sentence professional summary focusing on construction. Return ONLY text." 
      }, { role: "user", content: typeof text === 'string' ? text : JSON.stringify(text) }],
      temperature: 0.5,
    });

    res.json({ summary: completion.choices?.[0]?.message?.content?.trim() || "" });
  } catch (err) { 
    console.error("Extraction error:", err.message);
    res.status(500).json({ error: "Extraction failed" }); 
  }
});

app.post("/api/ai/rewrite-summary", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No summary text provided" });
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ 
        role: "system", 
        content: "You are an expert resume editor. Rewrite this professional summary to be more impactful. Return ONLY text." 
      }, { role: "user", content: text }],
      temperature: 0.4,
    });
    res.json({ suggestion: completion.choices?.[0]?.message?.content?.trim() || "" });
  } catch (err) { res.status(500).json({ error: "Summary rewrite failed" }); }
});

app.post("/api/ai/rewrite", async (req, res) => {
  try {
    const { text, type } = req.body; 
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ 
        role: "system", 
        content: "You are an Elite Construction Recruiter. Fix grammar and professionalism. Return ONLY text." 
      }, { role: "user", content: `Rewrite this ${type}: ${text}` }],
      temperature: 0.3,
    });
    res.json({ suggestion: completion.choices?.[0]?.message?.content?.trim().replace(/^["']+|["']+$/g, "") });
  } catch (err) { res.status(500).json({ error: "Rewrite failed" }); }
});

app.post("/api/ai/generate", upload.any(), async (req, res) => {
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: "Construction Career Coach. Body paragraphs only." }, { role: "user", content: req.body.prompt }],
    });
    res.json({ text: completion.choices?.[0]?.message?.content || "" });
  } catch (err) { res.status(500).json({ error: "Generation failed" }); }
});

/**
 * --- 2. MASTER TEMPLATE REGISTRY ---
 */
const templateRegistry = {
  "modern-blue": (doc, data) => {
    const leftMargin = 40;
    doc.rect(0, 0, doc.page.width, 130).fill("#1d4ed8");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(28).text(data.applicantName || "", leftMargin, 35);
    doc.fontSize(14).font("Helvetica").text(data.tradeTitle || "", leftMargin, doc.y + 5);
    doc.fontSize(9).text(`${data.applicantPhone || ""} | ${data.applicantEmail || ""} | ${data.applicantAddress || ""}`, leftMargin, doc.y + 10);
    doc.fillColor("black").moveDown(6).font("Helvetica-Bold").fontSize(14).text("Summary", leftMargin);
    doc.font("Helvetica").fontSize(10).text(data.summary || "", leftMargin, doc.y + 5, { width: 520 });
    if (Array.isArray(data.skills) && data.skills.length > 0) {
      doc.moveDown(2).font("Helvetica-Bold").fontSize(14).text("Skills", leftMargin);
      const skillStrings = data.skills.map(s => typeof s === 'string' ? s : (s.text || "")).filter(Boolean);
      if (skillStrings.length > 0) {
        doc.font("Helvetica").fontSize(10).text(skillStrings.join("  |  "), leftMargin, doc.y + 5, { width: 520 });
      }
    }
    doc.moveDown(2).font("Helvetica-Bold").fontSize(14).text("Experience", leftMargin);
    (data.experience || []).forEach(job => {
      doc.moveDown(1).font("Helvetica-Bold").fontSize(11).text(`${job.jobTitle || ""} — ${job.company || ""}`, leftMargin);
      const bullets = [...(job.responsibilities || []), ...(job.achievements || [])];
      bullets.forEach(r => {
        const txt = typeof r === 'string' ? r : (r.text || "");
        if (txt) doc.font("Helvetica").fontSize(10).text(`• ${txt}`, leftMargin + 15, doc.y, { width: 500 });
      });
    });
  },
  "standard-contemporary": (doc, data) => {
    const leftMargin = 40;
    doc.fillColor("#1a202c").font("Helvetica-Bold").fontSize(20).text(data.applicantName || "", leftMargin, 50);
    doc.font("Helvetica").fontSize(10).fillColor("#4b5563").text(`${data.applicantAddress || ""} | ${data.applicantEmail || ""} | ${data.applicantPhone || ""}`, leftMargin, doc.y + 5);
    doc.moveTo(leftMargin, doc.y + 10).lineTo(570, doc.y + 10).stroke("#d1d5db");
    doc.fillColor("black").moveDown(2).font("Helvetica-Bold").fontSize(12).text("SUMMARY", leftMargin);
    doc.font("Helvetica").fontSize(10).text(data.summary || "", leftMargin, doc.y + 5, { width: 520 });
    if (data.skills && data.skills.length > 0) {
      doc.moveDown(2).font("Helvetica-Bold").fontSize(12).text("SKILLS", leftMargin);
      const mid = Math.ceil(data.skills.length / 2);
      const sy = doc.y + 5;
      data.skills.slice(0, mid).forEach((s, i) => {
        const txt = typeof s === 'string' ? s : (s.text || "");
        doc.font("Helvetica").fontSize(9).text(`• ${txt}`, leftMargin, sy + (i * 12));
      });
      data.skills.slice(mid).forEach((s, i) => {
        const txt = typeof s === 'string' ? s : (s.text || "");
        doc.font("Helvetica").fontSize(9).text(`• ${txt}`, 300, sy + (i * 12));
      });
      doc.moveDown(mid * 0.8 + 1);
    }
    doc.moveDown(1).font("Helvetica-Bold").fontSize(12).text("EXPERIENCE", leftMargin);
    (data.experience || []).forEach(job => {
      doc.moveDown(0.5).font("Helvetica-Bold").fontSize(11).text(`${job.jobTitle || ""} — ${job.company || ""}`, leftMargin);
      const bullets = [...(job.responsibilities || []), ...(job.achievements || [])];
      bullets.forEach(r => {
        const txt = typeof r === 'string' ? r : (r.text || "");
        if (txt) doc.font("Helvetica").fontSize(9).text(`• ${txt}`, leftMargin + 10, doc.y, { width: 510 });
      });
    });
  }
};

/**
 * --- 3. MASTER EXPORT CONTROLLER ---
 */
app.post("/api/export/pdf", async (req, res) => {
  try {
    const data = req.body;
    const isResume = data.type === "resume";
    const templateId = data.selectedTemplate || "standard-contemporary";
    const doc = new PDFDocument({ size: "LETTER", margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);
    if (isResume) {
      const draw = templateRegistry[templateId] || templateRegistry["standard-contemporary"];
      draw(doc, data);
    } else {
      doc.rect(0, 0, doc.page.width, 130).fill("#1F4E79");
      doc.fillColor("white").font("Helvetica-Bold").fontSize(26).text(data.applicantName || "", 50, 40);
      doc.font("Helvetica").fontSize(10).text(`${data.applicantEmail || ""} | ${data.applicantPhone || ""}`, 50, 75);
      doc.text(data.applicantAddress || "", 50, 90);
      doc.text(data.applicantCityStateZip || "", 50, 103);
      doc.fillColor("black").font("Helvetica").fontSize(11).text(data.date || "", 50, 150);
      doc.moveDown(2).fontSize(12).text(data.letter || "", { width: 500, lineGap: 3 });
    }
    doc.end();
  } catch (err) { 
    console.error("PDF Export Error:", err);
    res.status(500).send("PDF failed"); 
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on Port ${PORT}`));