import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

// ✅ Server-safe list of allowed resume templates (FULL 9)
const ALLOWED_RESUME_TEMPLATES = [
  // STANDARD
  "basic-two-column",
  "modern-blue",
  "sidebar-green",
  "standard-contemporary",
  "standard-classic", // ⭐ NEW

  // PREMIUM
  "executive-classic",
  "executive-luxe",
  "modern-elite",
  "modern-professional",
] as const;

type ResumeTemplateKey = (typeof ALLOWED_RESUME_TEMPLATES)[number];
type PdfTemplateKey = ResumeTemplateKey | "cover-letter";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // -----------------------------
    // 1. Parse payload safely
    // -----------------------------
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
    // 2. COVER LETTER PDF
    // -----------------------------
    if (isCoverLetter) {
      console.log("[PDF] Cover letter export started");

      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();

      await page.setViewport({
        width: 1400,
        height: 2000,
        deviceScaleFactor: 2,
      });

      // Inject cover letter data BEFORE navigation
      await page.exposeFunction("__INJECT_COVER_LETTER__", () => payload.letter);

      const pdfUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/pdf/cover-letter`;
      console.log("[PDF] Cover letter URL:", pdfUrl);

      page.on("console", (msg) => {
        console.log("[PDF console][cover-letter]:", msg.text());
      });

      await page.goto(pdfUrl, { waitUntil: "networkidle0" });

      // Hide UI chrome
      await page.addStyleTag({
        content: `
          header, nav {
            display: none !important;
            visibility: hidden !important;
          }
        `,
      });

      // Wait for client to signal ready
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
    // 3. RESUME PDF
    // -----------------------------
    console.log("[PDF] Resume export started for template:", templateId);

    // ✅ Server-safe validation against explicit allowlist
    const isAllowedResumeTemplate =
      ALLOWED_RESUME_TEMPLATES.includes(templateId as ResumeTemplateKey);

    if (!isCoverLetter && !isAllowedResumeTemplate) {
      console.error("[PDF] Invalid resume template:", templateId);
      return NextResponse.json(
        { error: "Invalid template" },
        { status: 400 }
      );
    }

    // -----------------------------
    // PREMIUM GATING (FULL 4 PREMIUM)
    // -----------------------------
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

    // -----------------------------
    // 4. Puppeteer PDF Generation
    // -----------------------------
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 1400,
      height: 2000,
      deviceScaleFactor: 2,
    });

    // Inject resume data BEFORE navigation
    await page.exposeFunction("__INJECT_RESUME_DATA__", () => payload);

    const pdfUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/pdf/${templateId}`;
    console.log("[PDF] Resume URL:", pdfUrl);

    page.on("console", (msg) => {
      console.log("[PDF console][resume]:", msg.text());
    });

    await page.goto(pdfUrl, {
      waitUntil: "networkidle0",
    });

    // Hide UI chrome
    await page.addStyleTag({
      content: `
        header, nav {
          display: none !important;
          visibility: hidden !important;
        }
      `,
    });

    // Wait for client to signal ready AFTER data injection + render
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
