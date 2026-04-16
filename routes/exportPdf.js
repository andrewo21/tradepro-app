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

    const doc = new PDFDocument({
      size: "LETTER",
      margin: 50,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=cover-letter.pdf"
    );

    doc.pipe(res);

    // BLUE HEADER (your original working version)
    const headerHeight = 165;
    const pageWidth = doc.page.width;
    const margin = doc.page.margins.left;

    doc.rect(0, 0, pageWidth, headerHeight).fill("#1F4E79");

    doc.fillColor("white");

    let y = 28;

    doc.font("Times-Bold")
      .fontSize(22)
      .text(applicantName, margin, y);

    y += 26;

    doc.font("Times-Roman").fontSize(11);

    doc.text(applicantCityStateZip, pageWidth - margin, 28, { align: "right" });
    doc.text(applicantPhone, pageWidth - margin, 44, { align: "right" });
    doc.text(applicantEmail, pageWidth - margin, 60, { align: "right" });

    if (applicantLinkedIn && applicantLinkedIn.trim() !== "") {
      doc.text(applicantLinkedIn, pageWidth - margin, 76, { align: "right" });
    }

    doc.fillColor("black");

    // DATE (original behavior)
    doc.y = headerHeight + 25;
    doc.font("Times-Roman").fontSize(12).text(date);

    doc.moveDown(1);

    // LETTER BODY (original behavior)
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
