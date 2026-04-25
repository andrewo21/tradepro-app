import 'dotenv/config';
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import PDFDocument from "pdfkit";
import multer from "multer";

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

/**
 * --- 1. AI ENGINE (REWRITES & EXTRACTION) ---
 * Surgically fixed to handle both Resume Page (JSON) and Cover Letter Page (FormData)
 */

app.post("/api/ai/extract-summary", upload.none(), async (req, res) => {
  try {
    // FIXED: Catches 'resumeText' from Cover Letter FormData or 'text' from Resume Builder JSON
    const text = req.body.resumeText || req.body.text;
    
    if (!text) return res.status(400).json({ error: "No text provided" });

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ 
        role: "system", 
        content: "You are a professional resume writer. Based on the provided resume text, write a 3-4 sentence professional summary focusing on construction experience. Return ONLY text." 
      }, { role: "user", content: text }],
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
      messages: [{ 
        role: "system", 
        content: "You are an Elite Construction Recruiter. Fix grammar and translate to professional English. Return ONLY text without quotes." 
      }, { role: "user", content: `Rewrite this ${type}: ${text}` }],
      temperature: 0.3,
    });
    let result = completion.choices?.[0]?.message?.content?.trim() || "";
    res.json({ suggestion: result.replace(/^["'‘“`]+|["'’ ”`]+$/g, "") });
  } catch (err) { res.status(500).json({ error: "Rewrite failed" }); }
});

app.post("/api/ai/generate", upload.none(), async (req, res) => {
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: "Construction Career Coach. Body paragraphs only." }, { role: "user", content: req.body.prompt }],
    });
    res.json({ text: completion.choices?.[0]?.message?.content || "" });
  } catch (err) { res.status(500).json({ error: "Generation failed" }); }
});

/**
 * --- 2. MASTER TEMPLATE REGISTRY (ALL 9 TEMPLATES) ---
 * FIXED: Explicit left-alignment and complete data display for all sections.
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

    if (data.skills && data.skills.length > 0) {
      doc.moveDown(2).font("Helvetica-Bold").fontSize(14).text("Skills", leftMargin);
      const skillStrings = data.skills.map(s => typeof s === 'string' ? s : (s.text || ""));
      doc.font("Helvetica").fontSize(10).text(skillStrings.join("  |  "), leftMargin, doc.y + 5, { width: 520 });
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
    doc.font("Helvetica").fontSize(10).fillColor("#4b5563").text(`${data.applicantAddress} | ${data.applicantEmail} | ${data.applicantPhone}`, leftMargin, doc.y + 5);
    doc.moveTo(leftMargin, doc.y + 10).lineTo(570, doc.y + 10).stroke("#d1d5db");
    
    doc.fillColor("black").moveDown(2).font("Helvetica-Bold").fontSize(12).text("SUMMARY", leftMargin);
    doc.font("Helvetica").fontSize(10).text(data.summary || "", leftMargin, doc.y + 5, { width: 520 });

    if (data.skills && data.skills.length > 0) {
      doc.moveDown(2).font("Helvetica-Bold").fontSize(12).text("SKILLS", leftMargin);
      const mid = Math.ceil(data.skills.length / 2);
      const sy = doc.y + 5;
      data.skills.slice(0, mid).forEach((s, i) => doc.font("Helvetica").fontSize(9).text(`• ${s.text || s}`, leftMargin, sy + (i * 12)));
      data.skills.slice(mid).forEach((s, i) => doc.font("Helvetica").fontSize(9).text(`• ${s.text || s}`, 300, sy + (i * 12)));
      doc.moveDown(mid * 0.8 + 1);
    }

    doc.moveDown(1).font("Helvetica-Bold").fontSize(12).text("EXPERIENCE", leftMargin);
    (data.experience || []).forEach(job => {
      doc.moveDown(0.5).font("Helvetica-Bold").fontSize(11).text(`${job.jobTitle} — ${job.company}`, leftMargin);
      const bullets = [...(job.responsibilities || []), ...(job.achievements || [])];
      bullets.forEach(r => {
        const txt = typeof r === 'string' ? r : (r.text || "");
        if (txt) doc.font("Helvetica").fontSize(9).text(`• ${txt}`, leftMargin + 10, doc.y, { width: 510 });
      });
    });
  },

  "standard-classic": (doc, data) => {
    const leftMargin = 40;
    doc.rect(0, 0, doc.page.width, 100).fill("#1a202c");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(20).text(data.applicantName || "", leftMargin, 40);
    doc.fontSize(10).text(`${data.applicantEmail} | ${data.applicantPhone}`, leftMargin, doc.y + 5);
    doc.fillColor("black").moveDown(5).font("Helvetica-Bold").fontSize(12).text("EXPERIENCE", leftMargin);
    (data.experience || []).forEach(job => {
      doc.moveDown(1).font("Helvetica-Bold").text(`${job.jobTitle} — ${job.company}`, leftMargin);
      [...(job.responsibilities || []), ...(job.achievements || [])].forEach(r => {
        const txt = typeof r === 'string' ? r : (r.text || "");
        if (txt) doc.font("Helvetica").text(`• ${txt}`, leftMargin + 10);
      });
    });
  },

  "sidebar-green": (doc, data) => {
    const sw = doc.page.width * 0.32;
    doc.rect(0, 0, sw, doc.page.height).fill("#E6F4EA");
    doc.fillColor("#1a202c").font("Helvetica-Bold").fontSize(18).text(data.applicantName || "", 20, 50, { width: sw - 40 });
    doc.fillColor("#4a5568").font("Helvetica").fontSize(10).text(data.tradeTitle || "", 20, doc.y + 5);
    doc.fontSize(9).moveDown(2).text(data.applicantPhone || "").text(data.applicantEmail || "").text(data.applicantAddress || "");
    const mx = sw + 30;
    doc.fillColor("#1a202c").font("Helvetica-Bold").fontSize(11).text("SUMMARY", mx, 50);
    doc.font("Helvetica").fontSize(10).text(data.summary || "", mx, 70, { width: doc.page.width - sw - 60 });
    doc.moveDown(2).font("Helvetica-Bold").fontSize(11).text("EXPERIENCE", mx);
    (data.experience || []).forEach(job => {
      doc.moveDown(1).font("Helvetica-Bold").fontSize(10).text(`${job.jobTitle || ""} — ${job.company || ""}`, mx);
      [...(job.responsibilities || []), ...(job.achievements || [])].forEach(r => {
        const txt = typeof r === 'string' ? r : (r.text || "");
        if (txt) doc.font("Helvetica").fontSize(9).text(`• ${txt}`, mx + 10);
      });
    });
  },

  "basic-two-column": (doc, data) => {
    const sw = doc.page.width * 0.30;
    doc.rect(0, 0, sw, doc.page.height).fill("#f3f4f6");
    doc.fillColor("#111827").font("Helvetica-Bold").fontSize(20).text(data.applicantName || "", 25, 50);
    doc.fontSize(9).font("Helvetica").text(`${data.applicantPhone}\n${data.applicantEmail}\n${data.applicantAddress}`, 25, doc.y + 10);
    doc.fillColor("#1f2937").font("Helvetica-Bold").fontSize(12).text("EXPERIENCE", sw + 40, 50);
    (data.experience || []).forEach(job => {
      doc.moveDown(1).font("Helvetica-Bold").text(`${job.jobTitle} — ${job.company}`, sw + 40);
      [...(job.responsibilities || []), ...(job.achievements || [])].forEach(r => {
        const txt = typeof r === 'string' ? r : (r.text || "");
        if (txt) doc.font("Helvetica").text(`• ${txt}`, sw + 50);
      });
    });
  },

  "executive-classic": (doc, data) => {
    doc.rect(0, 0, doc.page.width, 100).fill("#003A70");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(20).text(data.applicantName || "", 40, 40);
    doc.fontSize(10).text(data.applicantEmail || "", 400, 40, { align: "right" });
    doc.moveDown(4).fillColor("#0A1F44").font("Helvetica-Bold").fontSize(12).text(data.tradeTitle || "", { align: "center" });
    doc.moveTo(40, doc.y + 5).lineTo(570, doc.y + 5).stroke("#F28C28");
    (data.experience || []).forEach(job => {
        doc.moveDown(1).fillColor("black").font("Helvetica-Bold").text(`${job.jobTitle} — ${job.company}`, 40);
        [...(job.responsibilities || []), ...(job.achievements || [])].forEach(r => {
          const txt = typeof r === 'string' ? r : (r.text || "");
          if (txt) doc.font("Helvetica").text(`• ${txt}`, 50);
        });
    });
  },

  "executive-luxe": (doc, data) => {
    const sw = doc.page.width * 0.30;
    doc.rect(0, 0, sw, doc.page.height).fill("#F4E7C6");
    doc.fillColor("#1a202c").font("Helvetica-Bold").fontSize(20).text(data.applicantName || "", 20, 50);
    doc.font("Helvetica-Bold").fontSize(11).text("EXPERIENCE", sw + 30, 50);
    (data.experience || []).forEach(job => {
        doc.moveDown(1).font("Helvetica-Bold").text(`${job.jobTitle} — ${job.company}`, sw + 30);
        [...(job.responsibilities || []), ...(job.achievements || [])].forEach(r => {
          const txt = typeof r === 'string' ? r : (r.text || "");
          if (txt) doc.font("Helvetica").text(`• ${txt}`, sw + 40);
        });
    });
  },

  "modern-elite": (doc, data) => {
    doc.rect(0, 0, doc.page.width, 100).fill("#4B5563");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(22).text(data.applicantName || "", 40, 35);
    doc.fillColor("black").font("Helvetica-Bold").fontSize(11).text("Experience", 220, 130);
    (data.experience || []).forEach(job => {
        doc.moveDown(1).font("Helvetica-Bold").text(`${job.jobTitle} — ${job.company}`, 220);
        [...(job.responsibilities || []), ...(job.achievements || [])].forEach(r => {
          const txt = typeof r === 'string' ? r : (r.text || "");
          if (txt) doc.font("Helvetica").text(`• ${txt}`, 230);
        });
    });
  },

  "modern-professional": (doc, data) => {
    doc.fillColor("#111827").font("Helvetica-Bold").fontSize(22).text(data.applicantName || "", { align: "center" });
    doc.moveTo(40, doc.y + 10).lineTo(570, doc.y + 10).stroke("#d1d5db");
    doc.moveDown(2).font("Helvetica-Bold").fontSize(11).text("Experience", 40);
    (data.experience || []).forEach(job => {
        doc.moveDown(1).font("Helvetica-Bold").text(`${job.jobTitle} — ${job.company}`, 40);
        [...(job.responsibilities || []), ...(job.achievements || [])].forEach(r => {
          const txt = typeof r === 'string' ? r : (r.text || "");
          if (txt) doc.font("Helvetica").text(`• ${txt}`, 50);
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
      // COVER LETTER: Isolated Blue Header
      doc.rect(0, 0, doc.page.width, 130).fill("#1F4E79");
      doc.fillColor("white").font("Helvetica-Bold").fontSize(26).text(data.applicantName || "", 50, 40);
      doc.font("Helvetica").fontSize(10).text(`${data.applicantEmail || ""} | ${data.applicantPhone || ""}`, 50, 75);
      doc.text(data.applicantAddress || "", 50, 90);
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
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Master Brain Live`));
