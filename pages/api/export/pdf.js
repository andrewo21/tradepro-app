import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

// Allowed templates
const ALLOWED_RESUME_TEMPLATES = [
  "basic-two-column",
  "modern-blue",
  "sidebar-green",
  "standard-contemporary",
  "standard-classic",
  "executive-classic",
  "executive-luxe",
  "modern-elite",
  "modern-professional",
];

// Launch Chromium (Vercel-compatible)
async function launchBrowser() {
  const executablePath = await chromium.executablePath();

  return puppeteer.launch({
    args: chromium.args,
    executablePath,
    headless: true,
  });
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const payload = JSON.parse(req.body);

    if (!payload || !payload.template) {
      return res.status(400).json({ error: "Missing template in request payload" });
    }

    const templateId = payload.template;
    const isCoverLetter = templateId === "cover-letter";
    const premiumUnlocked = payload.premiumUnlocked ?? false;

    // -----------------------------
    // COVER LETTER PDF
    // -----------------------------
    if (isCoverLetter) {
      console.log("[PDF] Cover letter export started");

      const browser = await launchBrowser();
      const page = await browser.newPage();

      await page.setViewport({
        width: 1400,
        height: 2000,
        deviceScaleFactor: 2,
      });

      await page.exposeFunction("__INJECT_COVER_LETTER__", () => payload.letter);

      const pdfUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/pdf/cover-letter`;
      console.log("[PDF] Cover letter URL:", pdfUrl);

      page.on("console", (msg) =>
        console.log("[PDF console][cover-letter]:", msg.text())
      );

      await page.goto(pdfUrl, { waitUntil: "networkidle0" });

      await page.addStyleTag({
        content: `
          header, nav {
            display: none !important;
            visibility: hidden !important;
          }
        `,
      });

      await page.waitForFunction(() => {
        return globalThis.__COVER_LETTER_READY__ === true;
      });

      const pdfBuffer = await page.pdf({
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
      });

      await browser.close();

      console.log("[PDF] Cover letter export completed");

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=cover-letter.pdf");
      return res.status(200).send(pdfBuffer);
    }

    // -----------------------------
    // RESUME PDF
    // -----------------------------
    console.log("[PDF] Resume export started for template:", templateId);

    const isAllowedResumeTemplate = ALLOWED_RESUME_TEMPLATES.includes(templateId);

    if (!isAllowedResumeTemplate) {
      console.error("[PDF] Invalid resume template:", templateId);
      return res.status(400).json({ error: "Invalid template" });
    }

    const isPremiumTemplate =
      templateId === "executive-classic" ||
      templateId === "executive-luxe" ||
      templateId === "modern-elite" ||
      templateId === "modern-professional";

    if (isPremiumTemplate && !premiumUnlocked) {
      console.warn(
        "[PDF] Blocked resume export – premium template without access:",
        templateId
      );
      return res.status(403).json({
        error: "This template requires TradePro™ Premium.",
        code: "PREMIUM_REQUIRED",
      });
    }

    const browser = await launchBrowser();
    const page = await browser.newPage();

    await page.setViewport({
      width: 1400,
      height: 2000,
      deviceScaleFactor: 2,
    });

    await page.exposeFunction("__INJECT_RESUME_DATA__", () => payload);

    const pdfUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/pdf/${templateId}`;
    console.log("[PDF] Resume URL:", pdfUrl);

    page.on("console", (msg) =>
      console.log("[PDF console][resume]:", msg.text())
    );

    await page.goto(pdfUrl, { waitUntil: "networkidle0" });

    await page.addStyleTag({
      content: `
        header, nav {
          display: none !important;
          visibility: hidden !important;
        }
      `,
    });

    await page.waitForFunction(() => {
      return globalThis.__RESUME_DATA_READY__ === true;
    });

    const pdfBuffer = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    await browser.close();

    console.log("[PDF] Resume export completed for template:", templateId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=resume.pdf");
    return res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error("PDF export error:", err);
    return res.status(500).json({ error: "Failed to generate PDF" });
  }
}
