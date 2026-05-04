export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // Detect Brazil contact (prefixed by /br/contato page)
    const isBrazil = message.startsWith("[Brasil]");
    const cleanMessage = isBrazil ? message.replace("[Brasil]", "").trim() : message;

    if (!process.env.SENDGRID_API_KEY) {
      console.log(`Contact form (${isBrazil ? "BR" : "US"}): ${name} <${email}>: ${cleanMessage}`);
      return NextResponse.json({ success: true });
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Send notification to support
    await sgMail.send({
      to: "support@tradepro.tools",
      from: {
        name: isBrazil ? "TradePro Brasil Contato" : "TradePro Contact Form",
        email: "no-reply@tradeprotech.ai",
      },
      replyTo: { name, email },
      subject: isBrazil
        ? `[Brasil] Mensagem de ${name}`
        : `TradePro Support Request from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${cleanMessage}`,
      html: `
        <p><strong>${isBrazil ? "Nome" : "Name"}:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <hr />
        <p>${cleanMessage.replace(/\n/g, "<br/>")}</p>
      `,
    });

    // Send confirmation back to the sender — in Portuguese for Brazil, English for US
    await sgMail.send({
      to: email,
      from: {
        name: isBrazil ? "TradePro Brasil" : "TradePro Technologies",
        email: "no-reply@tradeprotech.ai",
      },
      subject: isBrazil
        ? "Recebemos sua mensagem — TradePro Brasil"
        : "We received your message — TradePro",
      text: isBrazil
        ? `Olá ${name},\n\nRecebemos sua mensagem e um membro da nossa equipe entrará em contato em até 24 horas.\n\nObrigado por entrar em contato com a TradePro Brasil!\n\nAtenciosamente,\nEquipe TradePro Brasil\nsupport@tradepro.tools`
        : `Hi ${name},\n\nThank you for reaching out. A team member will contact you within 24 hours.\n\nBest regards,\nTradePro Technologies\nsupport@tradepro.tools`,
      html: isBrazil
        ? `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;color:#1a1a1a">
            <img src="https://tradeprotech.ai/brand/Tradepro-logo.svg" alt="TradePro" style="width:160px;margin-bottom:20px" />
            <h2 style="color:#166534">Olá, ${name}!</h2>
            <p>Recebemos sua mensagem com sucesso.</p>
            <p>Um membro da nossa equipe entrará em contato em até <strong>24 horas</strong>.</p>
            <p style="color:#555">Obrigado por entrar em contato com a TradePro Brasil 🇧🇷</p>
            <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
            <p style="font-size:12px;color:#999">TradePro Brasil · <a href="mailto:support@tradepro.tools" style="color:#999">support@tradepro.tools</a></p>
          </div>`
        : `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;color:#1a1a1a">
            <img src="https://tradeprotech.ai/brand/Tradepro-logo.svg" alt="TradePro" style="width:160px;margin-bottom:20px" />
            <h2>Hi ${name},</h2>
            <p>Thank you for reaching out to TradePro.</p>
            <p>A team member will contact you within <strong>24 hours</strong>.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
            <p style="font-size:12px;color:#999">TradePro Technologies · <a href="mailto:support@tradepro.tools" style="color:#999">support@tradepro.tools</a></p>
          </div>`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Contact form error:", err?.message || err);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
