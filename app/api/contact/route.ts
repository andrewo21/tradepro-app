export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (!process.env.SENDGRID_API_KEY) {
      // SendGrid not configured — log and return success so UX still works
      console.log(`Contact form submission (no SendGrid): ${name} <${email}>: ${message}`);
      return NextResponse.json({ success: true });
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    await sgMail.send({
      to: "andrew@tradeprotech.ai",
      from: {
        name: "TradePro Contact Form",
        email: "no-reply@tradeprotech.ai",
      },
      replyTo: { name, email },
      subject: `TradePro Support Request from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <hr />
        <p>${message.replace(/\n/g, "<br/>")}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Contact form error:", err?.message || err);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
