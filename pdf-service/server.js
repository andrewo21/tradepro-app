import express from "express";
import cors from "cors";
import { chromium } from "@playwright/test";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => {
  res.send("PDF service is running");
});

app.post("/pdf", async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'url' field" });
  }

  console.log("Generating PDF for URL:", url);

  let browser;
  try {
    browser = await chromium.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true
    });

    const context = await browser.newContext({
      viewport: { width: 1200, height: 1600 }
    });

    const page = await context.newPage();

    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 60000
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0.5in",
        right: "0.5in",
        bottom: "0.5in",
        left: "0.5in"
      }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="resume.pdf"');
    return res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF generation error:", err);
    return res.status(500).json({ error: "PDF generation failed" });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

app.listen(PORT, () => {
  console.log(`PDF service listening on port ${PORT}`);
});
