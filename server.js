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

// --- 1. AI ENGINE (REWRITES & EXTRACTION) ---

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

// FIXED: AI Rewrite logic for Professional Summary and Experience
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

// --- 2. MASTER TEMPLATE REGISTRY (ALL 9 TEMPLATES) ---

const templateRegistry = {
  "sidebar-green": (doc, data) => {
    const sidebarWidth = doc.page.width * 0.32;
    doc.rect(0, 0, sidebarWidth, doc.page.height).fill("#E6F4EA");
    doc.fillColor("#1a202c").font("Helvetica-Bold").fontSize(18).text(data.name || "", 20, 50, { width: sidebarWidth - 40 });
    doc.fillColor("#4a5568").font("Helvetica").fontSize(10).text(data.title || "", 20, doc.y + 5);
    doc.moveDown(2).fillColor("#1a202c").font("Helvetica-Bold").fontSize(11).text("PROFESSIONAL SUMMARY", sidebarWidth + 30, 50);
    doc.font("Helvetica").fontSize(10).text(data.summary || "", sidebarWidth + 30, 75, { width: doc.page.width - sidebarWidth - 60 });
    doc.moveDown(2).font("Helvetica-Bold").fontSize(11).text("EXPERIENCE", sidebarWidth + 30);
    (data.experience || []).forEach(job => {
      doc.moveDown().font("Helvetica-Bold").fontSize(10).text(job.jobTitle || "", sidebarWidth + 30);
      (job.responsibilities || []).forEach(r => doc.font("Helvetica").fontSize(9).text(`• ${r}`, sidebarWidth + 40));
    });
  },

  "basic-two-column": (doc, data) => {
    const sidebarWidth = doc.page.width * 0.30;
    doc.rect(0, 0, sidebarWidth, doc.page.height).fill("#f3f4f6");
    doc.fillColor("#111827").font("Helvetica-Bold").fontSize(20).text(data.name || "", 25, 50);
    doc.fontSize(10).font("Helvetica").text(data.title || "", 25, doc.y + 5);
    doc.fillColor("#1f2937").font("Helvetica-Bold").fontSize(12).text("EXPERIENCE", sidebarWidth + 40, 50);
    doc.font("Helvetica").fontSize(10).text(data.summary || "", sidebarWidth + 40, 75, { width: doc.page.width - sidebarWidth - 80 });
  },

  "modern-blue": (doc, data) => {
    doc.rect(0, 0, doc.page.width, 120).fill("#1d4ed8");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(28).text(data.name || "", 40, 40);
    doc.fontSize(14).font("Helvetica").text(data.title || "", 40, doc.y + 5);
    doc.fillColor("black").moveDown(5).font("Helvetica-Bold").fontSize(14).text("Summary", 40);
    doc.font("Helvetica").fontSize(11).text(data.summary || "", 40, doc.y + 10, { width: 500 });
  },

  "standard-classic": (doc, data) => {
    doc.rect(0, 0, doc.page.width, 100).fill("#1a202c");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(20).text(data.name || "", 40, 40);
    doc.fillColor("#e5e7eb").fontSize(10).text(`${data.contact?.location || ""} | ${data.contact?.email || ""}`, 40, doc.y + 5);
    doc.fillColor("black").moveDown(4).font("Helvetica-Bold").fontSize(11).text("PROFESSIONAL SUMMARY");
    doc.font("Helvetica").fontSize(10).text(data.summary || "", 40, doc.y + 5, { width: 500 });
  },

  "standard-contemporary": (doc, data) => {
    doc.fillColor("#1a202c").font("Helvetica-Bold").fontSize(20).text(data.name || "", 40, 50);
    doc.font("Helvetica").fontSize(10).fillColor("#4b5563").text(`${data.contact?.location || ""} | ${data.contact?.email || ""}`, 40, doc.y + 5);
    doc.moveTo(40, doc.y + 10).lineTo(570, doc.y + 10).stroke("#d1d5db");
    doc.fillColor("black").moveDown(2).font("Helvetica-Bold").fontSize(11).text("PROFESSIONAL SUMMARY");
    doc.font("Helvetica").fontSize(10).text(data.summary || "", 40, doc.y + 5, { width: 500 });
  },

  "executive-classic": (doc, data) => {
    doc.rect(0, 0, doc.page.width, 100).fill("#003A70");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(20).text(data.name || "", 40, 40);
    doc.fillColor("white").fontSize(10).text(data.contact?.email || "", 400, 40, { align: "right" });
    doc.moveDown(4).fillColor("#0A1F44").font("Helvetica-Bold").fontSize(12).text(data.title || "", { align: "center" });
    doc.moveTo(40, doc.y + 5).lineTo(570, doc.y + 5).stroke("#F28C28");
  },

  "executive-luxe": (doc, data) => {
    const sidebarWidth = doc.page.width * 0.30;
    doc.rect(0, 0, sidebarWidth, doc.page.height).fill("#F4E7C6");
    doc.fillColor("#1a202c").font("Helvetica-Bold").fontSize(20).text(data.name || "", 20, 50);
    doc.font("Helvetica-Bold").fontSize(11).text("PROFESSIONAL SUMMARY", sidebarWidth + 30, 50);
    doc.font("Helvetica").fontSize(10).text(data.summary || "", sidebarWidth + 30, 75, { width: 350 });
  },

  "modern-elite": (doc, data) => {
    doc.rect(0, 0, doc.page.width, 100).fill("#4B5563");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(22).text(data.name || "", 40, 35);
    doc.fontSize(12).text(data.title || "", 40, doc.y + 5);
    const col1 = 40; const col2 = 220;
    doc.fillColor("black").font("Helvetica-Bold").fontSize(11).text("Summary", col1, 130);
    doc.font("Helvetica").fontSize(10).text(data.summary || "", col1, 150, { width: 150 });
    doc.font("Helvetica-Bold").text("Experience", col2, 130);
  },

  "modern-professional": (doc, data) => {
    doc.fillColor("#111827").font("Helvetica-Bold").fontSize(22).text(data.name || "", { align: "center" });
    doc.font("Helvetica").fontSize(12).text(data.title || "", { align: "center" });
    doc.moveTo(40, doc.y + 10).lineTo(570, doc.y + 10).stroke("#d1d5db");
    doc.moveDown(2).font("Helvetica-Bold").fontSize(11).text("Professional Summary");
    doc.font("Helvetica").fontSize(10).text(data.summary || "", 40, doc.y + 5, { width: 500 });
  }
};

// --- 3. MASTER EXPORT CONTROLLER ---

app.post("/api/export/pdf", async (req, res) => {
  try {
    const data = req.body;
    const isResume = data.type === "resume";
    const templateId = data.selectedTemplate || "standard-contemporary";

    // Set margin to 0 for full-bleed sidebar templates
    const doc = new PDFDocument({ 
      size: "LETTER", 
      margin: (templateId === "sidebar-green" || templateId === "basic-two-column" || templateId === "executive-luxe") ? 0 : 50 
    });

    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    if (isResume) {
      // DYNAMIC DISPATCH: Matches selectedTemplate to its specific drawing logic
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
