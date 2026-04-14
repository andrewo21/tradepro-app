export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

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

async function launchBrowser() {
  const executablePath = await chromium.executablePath();

  return puppeteer.launch({
    args: chromium.args,
    executablePath,
    headless: true,
  });
}

export async function POST(req) {
  try {
    const payload = await req.json();

    if (!payload || !payload.template) {
      return Response.json(
        { error: "Missing template in request payload" },
        { status: 400 }
      );
    }

    const templateId = payload.template;
    const isCoverLetter = templateId === "cover-letter";
    const premiumUnlocked = payload.premiumUnlocked ?? false;

    // COVER LETTER
    if (isCoverLetter) {
      const browser = await launchBrowser();
      const page = await browser.newPage();

      await page.setViewport({
        width: 1400,
        height: 2000,
        deviceScaleFactor: 2,
      });

      await page.exposeFunction("__INJECT_COVER_LETTER__", () => payload.letter);

      const pdfUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/pdf/cover-letter`;

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

      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=cover-letter.pdf",
        },
      });
    }

    // RESUME
    if (!ALLOWED_RESUME_TEMPLATES.includes(templateId)) {
      return Response.json({ error: "Invalid template" }, { status: 400 });
    }

    const isPremiumTemplate =
      templateId === "executive-classic" ||
      templateId === "executive-luxe" ||
      templateId === "modern-elite" ||
      templateId === "modern-professional";

    if (isPremiumTemplate && !premiumUnlocked) {
      return Response.json(
        {
          error: "This template requires TradePro™ Premium.",
          code: "PREMIUM_REQUIRED",
        },
        { status: 403 }
      );
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

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=resume.pdf",
      },
    });
  } catch (err) {
    console.error("PDF export error:", err);
    return Response.json(
      { error: "Failed to generate PDF", details: err.message },
      { status: 500 }
    );
  }
}
