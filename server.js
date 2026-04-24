import 'dotenv/config';
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import PDFDocument from "pdfkit";
import multer from "multer";
import pdf from "pdf-parse-fixed";

const app = express();

// --- CRITICAL FIX: Explicitly use memory storage to prevent 500 Errors on Render ---
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));

// --- 1. AI REWRITE EXPERT ---
app.post("/api/ai/rewrite", async (req, res) => {
  try {
    const { text, type } = req.body; 
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: "Expert Construction Recruiter. Return ONLY the text." }, { role: "user", content: `Professionalize: ${text}` }],
      temperature: 0.3,
    });
    res.json({ suggestion: completion.choices[0].message.content.trim() });
  } catch (err) { 
    console.error("Rewrite Error:", err);
    res.status(500).json({ error: "Rewrite failed" }); 
  }
});

// --- 2. FULL COVER LETTER GENERATOR ---
app.post("/api/ai/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Construction Career Coach. Write ONLY the body paragraphs of a cover letter. No headers, no dates, no signatures." },
        { role: "user", content: prompt }
      ],
    });
    res.json({ text: completion.choices[0].message.content });
  } catch (err) { 
    console.error("Generation Error:", err);
    res.status(500).json({ error: "Generation failed" }); 
  }
});

// --- 3. SUMMARY EXTRACTION (FIXED TO STOP 500 ERROR) ---
app.post("/api/ai/extract-summary", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      console.error("❌ No file received by the server.");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log(`📂 Processing PDF: ${req.file.originalname} (${req.file.size} bytes)`);
    
    // Parse the PDF from the memory buffer
    const pdfData = await pdf(req.file.buffer);
    
    if (!pdfData.text) {
      console.error("❌ PDF Parsing resulted in empty text.");
      return res.status(422).json({ error: "Could not read text from this PDF." });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an elite construction recruiter. Extract a professional 3rd person summary of the user's trade experience from this resume text. Focus on trades, years of experience, and key skills. Return ONLY the summary." },
        { role: "user", content: pdfData.text }
      ],
    });

    res.json({ summary: completion.choices[0].message.content.trim() });
  } catch (err) {
    console.error("❌ Extraction Server Error:", err.message);
    res.status(500).json({ error: "Internal server error during PDF extraction." });
  }
});

// --- 4. MASTER PDF ENGINE ---
app.post("/api/export/pdf", async (req, res) => {
  try {
    const data = req.body;
    const doc = new PDFDocument({ size: "LETTER", margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // Professional Blue Header
    doc.rect(0, 0, doc.page.width, 110).fill("#1F4E79");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(28).text(data.applicantName || "", 50, 35);
    doc.font("Helvetica").fontSize(10);
    const contactLine = `${data.applicantEmail || ""}  |  ${data.applicantPhone || ""}  |  ${data.applicantAddress || ""} ${data.applicantCityStateZip || ""}`;
    doc.text(contactLine, 50, 75);
    
    doc.fillColor("black").moveDown(4);

    if (data.type === "resume") {
      doc.font("Helvetica-Bold").fontSize(14).text("PROFESSIONAL SUMMARY", { underline: true });
      doc.font("Helvetica").fontSize(11).moveDown(0.5).text(data.summary || "", { width: 500 });
      doc.moveDown().font("Helvetica-Bold").fontSize(14).text("WORK EXPERIENCE", { underline: true });
      data.experience?.forEach(exp => {
        doc.moveDown(0.5).font("Helvetica-Bold").fontSize(12).text(`${exp.title} - ${exp.company}`);
        doc.font("Helvetica").fontSize(10).text(exp.description, { width: 480 });
      });
      doc.moveDown().font("Helvetica-Bold").fontSize(14).text("SKILLS", { underline: true });
      doc.font("Helvetica").fontSize(11).text(data.skills?.join(" | ") || "");
    } else {
      // Cover Letter Layout
      doc.font("Helvetica").fontSize(11).text(data.date || "", 50, 130);
      doc.moveDown(1.5);
      doc.text(data.hiringManager || "");
      doc.text(data.companyName || "");
      doc.text(data.companyAddress || "");
      doc.text(data.companyCityStateZip || "");
      doc.moveDown(2);
      doc.font("Helvetica").fontSize(11.5).text(data.letter || "", { width: 500, align: "left", lineGap: 3.5 });
    }
    doc.end();
  } catch (err) { 
    console.error("PDF Export Error:", err);
    res.status(500).send("PDF generation failed."); 
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Master Brain Live on port ${PORT}`));
