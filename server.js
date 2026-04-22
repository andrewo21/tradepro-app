import 'dotenv/config';
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import PDFDocument from "pdfkit";
import multer from "multer";
import pdf from "pdf-parse-fixed";

const app = express();
const upload = multer();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));

// --- 1. AI SUMMARY GENERATOR (PDF Extraction) ---
app.post("/api/ai/extract-summary", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const pdfData = await pdf(req.file.buffer);
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a professional recruiter. Rewrite this resume into a 5-7 sentence executive summary. Use third-person ONLY (no 'I' or 'me')." },
        { role: "user", content: pdfData.text }
      ],
    });
    res.json({ summary: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: "Summary extraction failed" });
  }
});

// --- 2. AI GENERATE TEXT (Handles Letter, Skills, and Experience) ---
app.post("/api/ai/generate", async (req, res) => {
  try {
    const { mode, payload } = req.body;
    let systemPrompt = "You are a professional career coach for the trades.";
    let userPrompt = "";

    if (mode === "cover-letter") {
      userPrompt = `Write a cover letter for ${payload.applicantName} for ${payload.jobTitle}. Experience: ${payload.experience}`;
    } else {
      userPrompt = `Rewrite this professional point into a powerful resume bullet: ${payload.text}`;
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
    });
    res.json({ result: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: "AI generation failed" });
  }
});

// --- 3. MASTER PDF ENGINE (Resume & Cover Letter) ---
app.post("/api/export/pdf", async (req, res) => {
  try {
    const data = req.body;
    const doc = new PDFDocument({ size: "LETTER", margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // BLUE HEADER BRANDING
    doc.rect(0, 0, doc.page.width, 140).fill("#1F4E79");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(26).text(data.applicantName || "", 50, 40);
    doc.font("Helvetica").fontSize(11).text(`${data.applicantEmail || ""} | ${data.applicantPhone || ""}`, 50, 75);
    doc.text(`${data.applicantAddress || ""} ${data.applicantCityStateZip || ""}`, 50, 90);

    doc.fillColor("black").moveDown(8);

    if (data.type === "resume") {
      // Resume Layout
      doc.font("Helvetica-Bold").fontSize(14).text("PROFESSIONAL SUMMARY", { underline: true });
      doc.font("Helvetica").fontSize(11).moveDown(0.5).text(data.summary || "", { width: 500 });
      
      doc.moveDown().font("Helvetica-Bold").fontSize(14).text("WORK EXPERIENCE", { underline: true });
      data.experience?.forEach(exp => {
        doc.moveDown(0.5).font("Helvetica-Bold").fontSize(12).text(`${exp.title} - ${exp.company}`);
        doc.font("Helvetica").fontSize(10).text(`${exp.startDate} - ${exp.endDate}`);
        doc.moveDown(0.2).text(exp.description, { width: 480 });
      });
    } else {
      // Cover Letter Layout (Uses Editable Preview Text)
      doc.font("Helvetica").fontSize(12).text(data.letter || "", { width: 500, align: "left", lineGap: 2 });
    }

    doc.end();
  } catch (err) {
    res.status(500).send("PDF generation failed.");
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Master Brain Live on Port ${PORT}`));
