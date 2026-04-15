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
    // BLUE HEADER BAR
    // -----------------------------
    const headerHeight = 90;
    const pageWidth = doc.page.width;
    const margin = doc.page.margins.left;

    // Blue bar
    doc.rect(0, 0, pageWidth, headerHeight)
      .fill("#1F4E79");

    // White text
    doc.fillColor("white");

    // Name (left aligned)
    doc.font("Times-Bold")
      .fontSize(20)
      .text(applicantName, margin, 20, { align: "left" });

    // Right‑aligned contact info
    const contactX = pageWidth - margin;

    doc.font("Times-Roman")
      .fontSize(10)
      .text(applicantCityStateZip, contactX, 20, { align: "right" });

    doc.text(applicantPhone, contactX, 35, { align: "right" });
    doc.text(applicantEmail, contactX, 50, { align: "right" });

    if (applicantLinkedIn && applicantLinkedIn.trim() !== "") {
      doc.text(applicantLinkedIn, contactX, 65, { align: "right" });
    }

    // Reset fill color for body text
    doc.fillColor("black");

    // -----------------------------
    // DATE BELOW HEADER
    // -----------------------------
    doc.moveDown(4);
    doc.font("Times-Roman").fontSize(12).text(date);

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
