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

// 1. UNIVERSAL PERMISSION
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));

// 2. SUMMARY GENERATOR (Extracts from PDF and rewrites in 3rd person)
app.post("/api/ai/extract-summary", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const pdfData = await pdf(req.file.buffer);
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a professional recruiter. Rewrite this resume into a professional 5-7 sentence executive summary. Use third-person ONLY (no 'I' or 'me')." },
        { role: "user", content: pdfData.text }
      ],
    });
    res.json({ summary: completion.choices[0].message.content });
  } catch (err) {
    console.error("Summary error:", err);
    res.status(500).json({ error: "Summary extraction failed" });
  }
});

// 3. AI GENERATE LETTER (Text only)
app.post("/api/ai/generate", async (req, res) => {
  try {
    const { payload } = req.body;
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Write a professional cover letter body. Do NOT include headers, dates, or signatures. Just the body paragraphs." },
        { role: "user", content: `Write a letter for ${payload.applicantName} for the role of ${payload.jobTitle}. Experience: ${payload.experience}` }
      ],
    });
    res.json({ result: completion.choices[0].message.content });
  } catch (err) {
    console.error("Generation error:", err);
    res.status(500).json({ error: "Generation failed" });
  }
});

// 4. PDF EXPORT (Draws what it receives from the preview)
app.post("/api/export/pdf", async (req, res) => {
  try {
    const data = req.body;
    const doc = new PDFDocument({ size: "LETTER", margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // BLUE HEADER
    doc.rect(0, 0, doc.page.width, 140).fill("#1F4E79");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(26).text(data.applicantName || "", 50, 40);
    doc.font("Helvetica").fontSize(11).text(`${data.applicantEmail || ""} | ${data.applicantPhone || ""}`, 50, 80);
    doc.text(`${data.applicantAddress || ""} ${data.applicantCityStateZip || ""}`, 50, 95);

    // BODY CONTENT
    doc.fillColor("black").moveDown(8);
    // This prints exactly what is in the editable preview window
    doc.font("Helvetica").fontSize(12).text(data.letter || "", { width: 500, align: "left", lineGap: 2 });

    doc.end();
  } catch (err) {
    console.error("PDF Error:", err);
    res.status(500).send("PDF Error");
  }
});

app.get("/", (req, res) => res.send("TradePro Master Brain is Live"));

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Master Brain live on ${PORT}`));
