import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

// ⭐ REQUIRED FOR PUPPETEER ON NEXT.JS 16
export const runtime = "nodejs";

// ⭐ Prevent static optimization
export const dynamic = "force-dynamic";

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
] as const;

type ResumeTemplateKey = (typeof ALLOWED_RESUME_TEMPLATES)[number];
type PdfTemplateKey = ResumeTemplateKey | "cover-letter";

// ⭐ Launch Chromium (Vercel-compatible)
async function launchBrowser() {
  const executablePath = await chromium.executablePath();

  return puppeteer.launch({
    args: chromium.args,
    executablePath,
    headless: true,
  });
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    if (!payload || !payload.template) {
      return NextResponse.json(
        { error: "Missing template in request payload" },
        { status: 400 }
      );
    }

    const templateId = payload.template as PdfTemplateKey;
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
        return (window as any).__COVER_LETTER_READY__ === true;
      });

      const pdfBuffer = Buffer.from(
        await page.pdf({
          printBackground: true,
          preferCSSPageSize: true,
          margin: { top: "0", right: "0", bottom: "0", left: "0" },
        })
      );

      await browser.close();

      console.log("[PDF] Cover letter export completed");

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=cover-letter.pdf",
        },
      });
    }

    // -----------------------------
    // RESUME PDF
    // -----------------------------
    console.log("[PDF] Resume export started for template:", templateId);

    const isAllowedResumeTemplate =
      ALLOWED_RESUME_TEMPLATES.includes(templateId as ResumeTemplateKey);

    if (!isAllowedResumeTemplate) {
      console.error("[PDF] Invalid resume template:", templateId);
      return NextResponse.json(
        { error: "Invalid template" },
        { status: 400 }
      );
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
      return NextResponse.json(
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
      return (window as any).__RESUME_DATA_READY__ === true;
    });

    const pdfBuffer = Buffer.from(
      await page.pdf({
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
      })
    );

    await browser.close();

    console.log("[PDF] Resume export completed for template:", templateId);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=resume.pdf",
      },
    });
  } catch (err) {
    console.error("PDF export error:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
