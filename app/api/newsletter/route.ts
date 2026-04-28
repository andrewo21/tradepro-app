export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

async function addToSendGridContacts(email: string): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) return;

  // SendGrid Marketing Contacts API — upserts the contact into your All Contacts list
  const res = await fetch("https://api.sendgrid.com/v3/marketing/contacts", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contacts: [{ email }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("SendGrid contacts upsert failed:", res.status, body);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    }

    if (!process.env.SENDGRID_API_KEY) {
      console.log(`Newsletter signup (no SendGrid): ${email}`);
      return NextResponse.json({ success: true });
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Save to SendGrid Contacts list (non-blocking — don't fail the signup if this errors)
    addToSendGridContacts(email).catch((err) =>
      console.error("SendGrid contacts error:", err?.message)
    );

    // Notify you of the new signup
    await sgMail.send({
      to: "andrew@tradeprotech.ai",
      from: {
        name: "TradePro Signups",
        email: "no-reply@tradeprotech.ai",
      },
      subject: `New newsletter signup: ${email}`,
      text: `A new user signed up for TradePro updates:\n\n${email}`,
    });

    // Send a welcome email to the subscriber
    await sgMail.send({
      to: email,
      from: {
        name: "Andrew from TradePro",
        email: "no-reply@tradeprotech.ai",
      },
      subject: "You're on the TradePro list",
      text: `Hey there,\n\nThanks for signing up — you'll be the first to hear about new tools, templates, and updates from TradePro Technologies.\n\nWe build everything for the trades. No fluff.\n\nAndrew\nTradePro Technologies`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Newsletter signup error:", err?.message || err);
    return NextResponse.json({ error: "Failed to sign up." }, { status: 500 });
  }
}
