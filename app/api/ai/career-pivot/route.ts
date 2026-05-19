export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { detectAndPivot } from "@/lib/ats/scoring/career_pivot";

export async function POST(req: NextRequest) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const { resumeData, jobDescription, locale } = await req.json();
    if (!resumeData || !jobDescription?.trim()) {
      return NextResponse.json({ is_pivot: false }, { status: 400 });
    }
    const result = await detectAndPivot(client, resumeData, jobDescription, locale || "en");
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[career-pivot]", err);
    return NextResponse.json({ is_pivot: false }, { status: 500 });
  }
}
