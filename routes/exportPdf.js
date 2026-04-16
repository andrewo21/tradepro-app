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
    // FIXED MEDIUM HEADER (5 lines)
    // -----------------------------
    const headerHeight = 165; // increased for 5 lines
    const pageWidth = doc.page.width;
    const margin = doc.page.margins.left;

    // Blue bar
    doc.rect(0, 0, pageWidth, headerHeight).fill("#1F4E79");

    // White text
    doc.fillColor("white");

    // Starting Y position inside header
    let y = 28;

    // Name (left aligned)
    doc.font("Times-Bold")
      .fontSize(22)
      .text(applicantName, margin, y, { align: "left" });

    y += 26;

    // Right‑aligned contact info
    const contactX = pageWidth - margin;

    doc.font("Times-Roman").fontSize(11);

    doc.text(applicantCityStateZip, contactX, 28, { align: "right" });
    doc.text(applicantPhone, contactX, 44, { align: "right" });
    doc.text(applicantEmail, contactX, 60, { align: "right" });

    if (applicantLinkedIn && applicantLinkedIn.trim() !== "") {
      doc.text(applicantLinkedIn, contactX, 76, { align: "right" });
    }

    // Reset fill color for body text
    doc.fillColor("black");

    // -----------------------------
    // DATE BELOW HEADER
    // -----------------------------
    doc.font("Times-Roman").fontSize(12);

    // Move cursor BELOW the header
    doc.y = headerHeight + 25;

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
