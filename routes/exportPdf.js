import express from "express";
import PDFDocument from "pdfkit";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { letter } = req.body;

    if (!letter || typeof letter !== "string") {
      return res.status(400).json({ error: "Invalid letter content" });
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: "LETTER",
      margin: 50,
    });

    // Set headers BEFORE piping
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=cover-letter.pdf"
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Write text with automatic wrapping
    doc.font("Times-Roman").fontSize(12).text(letter, {
      width: 500,
      align: "left",
    });

    // Finalize PDF
    doc.end();
  } catch (err) {
    console.error("PDF ERROR:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

export default router;
