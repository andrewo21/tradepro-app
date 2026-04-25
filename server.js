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
    const mainX = sidebarWidth + 30;
    const mainW = doc.page.width - sidebarWidth - 60;

    doc.rect(0, 0, sidebarWidth, doc.page.height).fill("#E6F4EA");
    doc.fillColor("#1a202c").font("Helvetica-Bold").fontSize(18).text(data.applicantName || data.name || "Name", 20, 50, { width: sidebarWidth - 40 });
    doc.fillColor("#4a5568").font("Helvetica").fontSize(10).text(data.tradeTitle || data.title || "Title", 20, doc.y + 5);
    
    doc.fillColor("#1a202c").font("Helvetica-Bold").fontSize(11).text("PROFESSIONAL SUMMARY", mainX, 50);
    doc.font("Helvetica").fontSize(10).text(data.summary || "Summary goes here", mainX, 70, { width: mainW });
    
    doc.moveDown(2).font("Helvetica-Bold").fontSize(11).text("EXPERIENCE", mainX);
    (data.experience || []).forEach(job => {
      doc.moveDown(1).font("Helvetica-Bold").fontSize(10).text(job.jobTitle || job.title || "", mainX);
      const bullets = [...(job.responsibilities || []), ...(job.achievements || [])];
      bullets.forEach(r => {
        const txt = typeof r === 'string' ? r : (r.text || "");
        if (txt) doc.font("Helvetica").fontSize(9).text(`• ${txt}`, mainX + 10, doc.y, { width: mainW - 10 });
      });
    });
  },

  "basic-two-column": (doc, data) => {
    const sidebarWidth = doc.page.width * 0.30;
    doc.rect(0, 0, sidebarWidth, doc.page.height).fill("#f3f4f6");
    doc.fillColor("#111827").font("Helvetica-Bold").fontSize(20).text(data.applicantName || data.name || "", 25, 50);
    doc.fillColor("#1f2937").font("Helvetica-Bold").fontSize(12).text("EXPERIENCE", sidebarWidth + 40, 50);
    doc.font("Helvetica").fontSize(10).text(data.summary || "", sidebarWidth + 40, 75, { width: doc.page.width - sidebarWidth - 80 });
  },

  "modern-blue": (doc, data) => {
    doc.rect(0, 0, doc.page.width, 120).fill("#1d4ed8");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(28).text(data.applicantName || data.name || "", 40, 40);
    doc.fillColor("black").moveDown(5).font("Helvetica-Bold").fontSize(14).text("Summary", 40);
    doc.font("Helvetica").fontSize(11).text(data.summary || "", 40, doc.y + 10, { width: 500 });
  },

  "standard-classic": (doc, data) => {
    doc.rect(0, 0, doc.page.width, 100).fill("#1a202c");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(20).text(data.applicantName || data.name || "", 40, 40);
    doc.fillColor("black").moveDown(4).font("Helvetica-Bold").fontSize(11).text("PROFESSIONAL SUMMARY");
    doc.font("Helvetica").fontSize(10).text(data.summary || "", 40, doc.y + 5, { width: 500 });
  },

  "standard-contemporary": (doc, data) => {
    doc.fillColor("#1a202c").font("Helvetica-Bold").fontSize(20).text(data.applicantName || data.name || "", 40, 50);
    doc.moveTo(40, doc.y + 10).lineTo(570, doc.y + 10).stroke("#d1d5db");
    doc.fillColor("black").moveDown(2).font("Helvetica-Bold").fontSize(11).text("EXPERIENCE");
    (data.experience || []).forEach(job => {
      doc.moveDown(1).font("Helvetica-Bold").fontSize(10).text(job.jobTitle || job.title || "");
      const bullets = [...(job.responsibilities || []), ...(job.achievements || [])];
      bullets.forEach(r => {
        const txt = typeof r === 'string' ? r : (r.text || "");
        if (txt) doc.font("Helvetica").fontSize(9).text(`• ${txt}`, 50);
      });
    });
  },

  "executive-classic": (doc, data) => {
    doc.rect(0, 0, doc.page.width, 100).fill("#003A70");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(20).text(data.applicantName || data.name || "", 40, 40);
    doc.moveDown(4).fillColor("#0A1F44").font("Helvetica-Bold").fontSize(12).text(data.tradeTitle || data.title || "", { align: "center" });
    doc.moveTo(40, doc.y + 5).lineTo(570, doc.y + 5).stroke("#F28C28");
  },

  "executive-luxe": (doc, data) => {
    const sidebarWidth = doc.page.width * 0.30;
    doc.rect(0, 0, sidebarWidth, doc.page.height).fill("#F4E7C6");
    doc.fillColor("#1a202c").font("Helvetica-Bold").fontSize(20).text(data.applicantName || data.name || "", 20, 50);
    doc.font("Helvetica-Bold").fontSize(11).text("PROFESSIONAL SUMMARY", sidebarWidth + 30, 50);
    doc.font("Helvetica").fontSize(10).text(data.summary || "", sidebarWidth + 30, 75, { width: 350 });
  },

  "modern-elite": (doc, data) => {
    doc.rect(0, 0, doc.page.width, 100).fill("#4B5563");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(22).text(data.applicantName || data.name || "", 40, 35);
    doc.fillColor("black").font("Helvetica-Bold").fontSize(11).text("Summary", 40, 130);
    doc.font("Helvetica").fontSize(10).text(data.summary || "", 40, 150, { width: 150 });
  },

  "modern-professional": (doc, data) => {
    doc.fillColor("#111827").font("Helvetica-Bold").fontSize(22).text(data.applicantName || data.name || "", { align: "center" });
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

    const doc = new PDFDocument({ 
      size: "LETTER", 
      margin: (templateId === "sidebar-green" || templateId === "basic-two-column" || templateId === "executive-luxe") ? 0 : 50 
    });

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
