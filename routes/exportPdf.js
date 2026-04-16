import express from "express";
import PDFDocument from "pdfkit";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      applicantName,
      applicantCityStateZip,
      applicantEmail,
      applicantPhone,
      applicantLinkedIn,
      date,
      letter,
    } = req.body;

    if (!letter || typeof letter !== "string") {
      return res.status(400).json({ error: "Invalid letter content" });
    }

    // Create PDF
    const doc = new PDFDocument({
      size: "LETTER",
      margin: 50,
    });

    // Headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=cover-letter.pdf"
    );

    doc.pipe(res);

    // -----------------------------
    // FIXED MEDIUM BLUE HEADER
    // -----------------------------
    const headerHeight = 130; // increased height
    const pageWidth = doc.page.width;
    const margin = doc.page.margins.left;

    // Blue bar
    doc.rect(0, 0, pageWidth, headerHeight).fill("#1F4E79");

    // White text
    doc.fillColor("white");

    // Starting Y position inside header
    let y = 30;

    // Name (left aligned)
    doc.font("Times-Bold")
      .fontSize(22)
      .text(applicantName, margin, y, { align: "left" });

    y += 22 + 6; // font size + spacing

    // Right‑aligned contact info
    const contactX = pageWidth - margin;

    doc.font("Times-Roman")
      .fontSize(11)
      .text(applicantCityStateZip, contactX, 30, { align: "right" });

    doc.text(applicantPhone, contactX, 46, { align: "right" });
    doc.text(applicantEmail, contactX, 62, { align: "right" });

    if (applicantLinkedIn && applicantLinkedIn.trim() !== "") {
      doc.text(applicantLinkedIn, contactX, 78, { align: "right" });
    }

    // Reset fill color for body text
    doc.fillColor("black");

    // -----------------------------
    // DATE BELOW HEADER
    // -----------------------------
    doc.font("Times-Roman").fontSize(12);

    // Move cursor to BELOW the header
    doc.y = headerHeight + 20;

    doc.text(date);
    doc.moveDown(1);

    // -----------------------------
    // LETTER BODY
    // -----------------------------
    doc.font("Times-Roman")
      .fontSize(12)
      .text(letter, {
        width: 500,
        align: "left",
      });

    doc.end();
  } catch (err) {
    console.error("PDF ERROR:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

export default router;
