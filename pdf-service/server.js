const express = require("express");
const cors = require("cors");

const { generatePdfFromResume } = require("./lib/pdf/generatePdf");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => {
  res.send("PDF service is running");
});

app.post("/pdf", async (req, res) => {
  try {
    const body = req.body || {};

    // ⭐ Accept ALL possible template field names
    const templateKey =
      body.template ||
      body.templateId ||
      body.templateKey ||
      body.selectedTemplate ||
      body.selectedTemplateId ||
      null;

    if (!templateKey) {
      console.error("❌ Missing template key in request body:", body);
      return res.status(400).json({ error: "Missing template key" });
    }

    console.log("📄 Using template:", templateKey);

    const pdf = await generatePdfFromResume({
      templateKey,
      rawResumeData: body,
      premiumUnlocked: body.premiumUnlocked ?? false,
      showWatermark: !body.premiumUnlocked,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);
  } catch (err) {
    console.error("❌ PDF generation error:", err);
    res.status(500).json({ error: "PDF generation failed" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("PDF service running on port", PORT);
});
