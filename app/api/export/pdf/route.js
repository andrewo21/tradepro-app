export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { webkit } from "playwright";
import { NextResponse } from "next/server";
import { generatePdfFromResume } from "@/lib/pdf/generatePdf";

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

    // ---------------------------------------------------------
    // ⭐ COVER LETTER SECTION — DO NOT TOUCH, DO NOT MODIFY ⭐
    // ---------------------------------------------------------
    if (isCoverLetter) {
      const browser = await webkit.launch();
      const page = await browser.newPage();

      await page.exposeFunction("__INJECT_COVER_LETTER__", () => payload.letter);

      const pdfUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/pdf/cover-letter`;

      await page.goto(pdfUrl, { waitUntil: "networkidle" });

      await page.waitForFunction(() => {
        return globalThis.__COVER_LETTER_READY__ === true;
      });

      const pdfBuffer = await page.pdf({
        printBackground: true,
        format: "Letter",
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

    // ---------------------------------------------------------
    // ⭐ RESUME SECTION — REPLACED WITH SATORI/RESVG ENGINE ⭐
    // ---------------------------------------------------------

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

    // ⭐ NEW RESUME ENGINE (NO PLAYWRIGHT)
console.log("🔥 NEW RESUME ENGINE RUNNING");

const pdfBuffer = await generatePdfFromResume({
  templateKey: templateId,
  rawResumeData: payload,
  premiumUnlocked,
  showWatermark: true,
});


    return new NextResponse(pdfBuffer, {
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
