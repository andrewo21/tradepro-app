import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    let body;

    // Safely parse JSON
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { rewritten: "", error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const text = typeof body.text === "string" ? body.text : "";

    if (!text.trim()) {
      return NextResponse.json({ rewritten: "" });
    }

    // Call OpenAI safely
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: "gpt-4o", // Mudado para gpt-4o para melhor raciocínio e tradução
        messages: [
          {
            role: "system",
            content: `
You are a professional Resume Expert specializing in skilled trades and blue-collar industries. 
Your goal is to transform raw, simple, or multilingual input into a compelling, high-impact professional summary in English.

STRICT RULES:
1. LANGUAGE: Detect the input language. If it is NOT English (Portuguese, Spanish, etc.), translate it to professional English first.
2. REWRITING: Do not just repeat the user's words. Use strong action verbs and industry-standard terminology (e.g., instead of "cleaner", use "Sanitation Specialist" or "Maintenance Professional").
3. FORMAT: Output ONLY the final summary text. No conversational filler, no quotes, no "Here is your summary".
4. TONE: Maintain a hardworking, reliable, and professional tone suitable for the Trade Pro Tech brand.
5. CONSTRAINTS: While you should polish the language, do not invent certifications or years of experience not mentioned in the text.

Example:
Input: "Trabalhei 5 anos limpando casas e sei organizar tudo."
Output: "Dedicated Cleaning Professional with 5 years of experience in residential sanitation and organizational management, committed to maintaining high standards of cleanliness and efficiency."
            `,
          },
          { role: "user", content: text },
        ],
        temperature: 0.7, // Aumentado para permitir que a IA realmente "reescreva" em vez de apenas copiar
      });
    } catch (err) {
      console.error("OpenAI error:", err);
      return NextResponse.json(
        { rewritten: "", error: "OpenAI request failed" },
        { status: 500 }
      );
    }

    const rewritten = completion?.choices?.[0]?.message?.content?.trim() || "";

    return NextResponse.json({ rewritten });
  } catch (e) {
    console.error("Rewrite error:", e);
    return NextResponse.json(
      { rewritten: "", error: "Rewrite error" },
      { status: 500 }
    );
  }
}
