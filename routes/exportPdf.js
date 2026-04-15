import express from "express";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { letter } = req.body;

    if (!letter || typeof letter !== "string") {
      return res.status(400).json({ error: "Invalid letter content" });
    }

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    const lineHeight = 16;
    const margin = 50;
    const maxWidth = 500;

    let page = pdfDoc.addPage([612, 792]);
    let y = page.getHeight() - margin;

    const paragraphs = letter.split("\n");

    for (const paragraph of paragraphs) {
      const lines = font.splitTextIntoLines(paragraph, maxWidth);

      for (const line of lines) {
        if (y < margin) {
          page = pdfDoc.addPage([612, 792]);
          y = page.getHeight() - margin;
        }

        page.drawText(line, {
          x: margin,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });

        y -= lineHeight;
      }

      y -= lineHeight; // extra spacing between paragraphs
    }

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=cover-letter.pdf");
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error("PDF ERROR:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

export default router;
