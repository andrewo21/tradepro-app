import express from "express";
import PDFDocument from "pdfkit";

console.log("🚀 EXPORT PDF ROUTE FILE LOADED (server startup)");

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("📄 EXPORT PDF ROUTE HIT (incoming request)");

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
      console.log("❌ Missing or invalid letter content");
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
    // TEMPORARY DEBUG HEADER
    // -----------------------------
    const headerHeight = 200; // intentionally huge so we SEE a difference
    const pageWidth = doc.page.width;
    const margin = doc.page.margins.left;

    // Blue bar
    doc.rect(0, 0, pageWidth, headerHeight).fill("#1F4E79");

    // White text
    doc.fillColor("white");

    let y = 40;

    doc.font("Times-Bold")
      .fontSize(24)
      .text(applicantName || "NO NAME PROVIDED", margin, y);

    y += 30;

    doc.font("Times-Roman").fontSize(12);

    doc.text(applicantCityStateZip || "NO CITY", margin, y);
    y += 16;

    doc.text(applicantPhone || "NO PHONE", margin, y);
    y += 16;

    doc.text(applicantEmail || "NO EMAIL", margin, y);
    y += 16;

    if (applicantLinkedIn) {
      doc.text(applicantLinkedIn, margin, y);
      y += 16;
    }

    // Reset fill color
    doc.fillColor("black");

    // -----------------------------
    // DATE BELOW HEADER
    // -----------------------------
    doc.y = headerHeight + 30;
    doc.font("Times-Roman").fontSize(12).text(date || "NO DATE");

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
