import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // if you're on Node < 18; on Node 18+ you can use global fetch

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => {
  res.send("PDF service is running");
});

app.post("/pdf", async (req, res) => {
  try {
    const body = req.body || {};
    const url = body.url;

    if (!url) {
      console.error("❌ Missing url in request body:", body);
      return res.status(400).json({ error: "Missing url" });
    }

    console.log("📄 Generating PDF for URL:", url);

    // ---- PDF provider call (example: PDFShift) ----
    const pdfRes = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(process.env.PDFSHIFT_API_KEY + ":").toString("base64"),
      },
      body: JSON.stringify({ source: url }),
    });

    if (!pdfRes.ok) {
      const errText = await pdfRes.text();
      console.error("❌ PDF provider error:", errText);
      return res.status(500).json({ error: "PDF provider failed" });
    }

    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());

    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);
  } catch (err) {
    console.error("❌ PDF generation error:", err);
    res.status(500).json({ error: "PDF generation failed" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("PDF service running on port", PORT);
});
