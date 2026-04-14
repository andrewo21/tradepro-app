import express from "express";
import { PDFDocument, StandardFonts } from "pdf-lib";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { letter } = req.body;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Letter size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const fontSize = 12;
    const maxWidth = 500;
    const lines = letter.split("\n");

    let y = 750;

    lines.forEach((line) => {
      const wrapped = font.splitTextIntoLines(line, maxWidth);
      wrapped.forEach((w) => {
        page.drawText(w, { x: 50, y, size: fontSize, font });
        y -= 18;
      });
      y -= 10;
    });

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
