// lib/emailSequences.ts
// Post-purchase email sequences via SendGrid

import sgMail from "@sendgrid/mail";

const FROM = {
  name: "Andrew from TradePro",
  email: "no-reply@tradeprotech.ai",
};

const BASE_URL = "https://tradeprotech.ai";
const BR_URL   = `${BASE_URL}/br`;

// ── Email 1 — Welcome (EN) ────────────────────────────────────────────────────

export async function sendWelcomeEmail(customerEmail: string, productName: string) {
  if (!process.env.SENDGRID_API_KEY || !customerEmail) return;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const isCoverLetter = productName.toLowerCase().includes("cover");
  const builderUrl = isCoverLetter ? `${BASE_URL}/cover-letter` : `${BASE_URL}/resume`;

  await sgMail.send({
    to: customerEmail,
    from: FROM,
    subject: "Your TradePro access is ready",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a">
        <img src="${BASE_URL}/brand/Tradepro-logo.svg" alt="TradePro" style="width:180px;margin-bottom:24px" />
        <h1 style="font-size:22px;font-weight:700;margin-bottom:8px">Welcome to TradePro.</h1>
        <p style="color:#555;margin-bottom:4px">Thank you for your purchase. Your access is active and ready to use right now.</p>
        <p style="color:#555;margin-bottom:24px">Let's fix your resume in the next 10 minutes.</p>
        <a href="${builderUrl}" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-bottom:24px">
          Start Building Your Resume →
        </a>
        <h3 style="font-size:15px;font-weight:600;margin-bottom:12px">Here's how it works:</h3>
        <ol style="color:#555;padding-left:20px;line-height:1.8">
          <li>Fill in your work history — any language, any style.</li>
          <li>Let TradePro's AI rewrite it in clean, professional language.</li>
          <li>Download your new PDF and start applying.</li>
        </ol>
        <hr style="border:none;border-top:1px solid #eee;margin:28px 0" />
        <p style="font-size:12px;color:#999">Questions? Reply to this email or visit <a href="${BASE_URL}/contact" style="color:#555">tradeprotech.ai/contact</a>.</p>
        <p style="font-size:12px;color:#999">© ${new Date().getFullYear()} TradePro Technologies</p>
      </div>
    `,
    text: `Welcome to TradePro!\n\nYour access is ready.\n\nStart here: ${builderUrl}\n\nQuestions? Reply to this email.`,
  });
}

// ── Email 1 — Welcome (PT-BR) ─────────────────────────────────────────────────

export async function sendWelcomeEmailPTBR(customerEmail: string) {
  if (!process.env.SENDGRID_API_KEY || !customerEmail) return;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const builderUrl = `${BR_URL}/curriculo`;

  await sgMail.send({
    to: customerEmail,
    from: FROM,
    subject: "Seu acesso à TradePro está ativo",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a">
        <img src="${BASE_URL}/brand/Tradepro-logo.svg" alt="TradePro" style="width:180px;margin-bottom:24px" />
        <h1 style="font-size:22px;font-weight:700;margin-bottom:8px">Bem-vindo à TradePro.</h1>
        <p style="color:#555;margin-bottom:4px">Obrigado pela sua compra. Seu acesso está ativo e pronto para usar agora mesmo.</p>
        <p style="color:#555;margin-bottom:24px">Vamos criar seu currículo nos próximos 10 minutos.</p>
        <a href="${builderUrl}" style="display:inline-block;background:#166534;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-bottom:24px">
          Criar Meu Currículo Agora →
        </a>
        <h3 style="font-size:15px;font-weight:600;margin-bottom:12px">Como funciona:</h3>
        <ol style="color:#555;padding-left:20px;line-height:1.8">
          <li>Preencha sua experiência — pode ser informal, em português mesmo.</li>
          <li>A IA da TradePro reescreve tudo em linguagem profissional.</li>
          <li>Baixe seu currículo em PDF e comece a se candidatar.</li>
        </ol>
        <hr style="border:none;border-top:1px solid #eee;margin:28px 0" />
        <p style="font-size:12px;color:#999">Dúvidas? Responda este e-mail ou acesse <a href="${BR_URL}/contato" style="color:#555">tradeprotech.ai/br/contato</a>.</p>
        <p style="font-size:12px;color:#999">© ${new Date().getFullYear()} TradePro Technologies</p>
      </div>
    `,
    text: `Bem-vindo à TradePro!\n\nSeu acesso está ativo.\n\nComeçar aqui: ${builderUrl}\n\nDúvidas? Responda este e-mail.`,
  });
}

// ── Email 2 — "You're 80% done" (send Day 2) ─────────────────────────────────

export async function sendDay2Email(customerEmail: string) {
  if (!process.env.SENDGRID_API_KEY || !customerEmail) return;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  await sgMail.send({
    to: customerEmail,
    from: FROM,
    subject: "You're 80% of the way to a better resume",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a">
        <img src="${BASE_URL}/brand/Tradepro-logo.svg" alt="TradePro" style="width:180px;margin-bottom:24px" />
        <h1 style="font-size:22px;font-weight:700;margin-bottom:8px">You're almost there.</h1>
        <p style="color:#555;margin-bottom:16px">Most people stop right before the finish line. The ones who finish get the callbacks.</p>
        <p style="color:#555;margin-bottom:24px">A finished resume sitting in someone's inbox is worth more than a perfect one still being worked on.</p>

        <a href="${BASE_URL}/resume" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-bottom:24px">
          Finish Your Resume Now →
        </a>

        <p style="color:#777;font-size:13px">It takes less than 10 minutes to complete. Your next job could start with the next application.</p>

        <hr style="border:none;border-top:1px solid #eee;margin:28px 0" />
        <p style="font-size:12px;color:#999">© ${new Date().getFullYear()} TradePro Technologies · <a href="${BASE_URL}/contact" style="color:#999">Contact</a></p>
      </div>
    `,
    text: `You're almost there.\n\nMost people stop right before the finish line. Finish your resume now:\n${BASE_URL}/resume\n\nIt takes less than 10 minutes.`,
  });
}

// ── Email 3 — Cover letter upsell (send Day 5) ───────────────────────────────

export async function sendDay5Email(customerEmail: string, hasCoverLetter: boolean) {
  if (!process.env.SENDGRID_API_KEY || !customerEmail) return;
  if (hasCoverLetter) return; // already has it, skip
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  await sgMail.send({
    to: customerEmail,
    from: FROM,
    subject: "Want a cover letter to match your resume?",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a">
        <img src="${BASE_URL}/brand/Tradepro-logo.svg" alt="TradePro" style="width:180px;margin-bottom:24px" />
        <h1 style="font-size:22px;font-weight:700;margin-bottom:8px">One more thing that gets you hired.</h1>
        <p style="color:#555;margin-bottom:16px">Employers who receive a resume <em>and</em> a matching cover letter are more likely to call back — especially for competitive positions.</p>
        <p style="color:#555;margin-bottom:24px">TradePro can generate a professional cover letter in minutes, written in the same tone and style as your resume.</p>

        <a href="${BASE_URL}/pricing" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-bottom:8px">
          Generate Your Cover Letter — $8.99
        </a>
        <br />
        <a href="${BASE_URL}/pricing" style="display:inline-block;color:#555;font-size:13px;margin-bottom:24px;text-decoration:underline">
          Or upgrade to the full bundle for $29.99
        </a>

        <p style="color:#777;font-size:13px">One-time purchase. No subscription.</p>

        <hr style="border:none;border-top:1px solid #eee;margin:28px 0" />
        <p style="font-size:12px;color:#999">© ${new Date().getFullYear()} TradePro Technologies · <a href="${BASE_URL}/contact" style="color:#999">Contact</a></p>
      </div>
    `,
    text: `Want a cover letter to match your resume?\n\nTradePro can generate one in minutes.\n\nGet it here: ${BASE_URL}/pricing\n\n$8.99 one-time. No subscription.`,
  });
}

// ── Day 2 PT-BR ───────────────────────────────────────────────────────────────

export async function sendDay2EmailPTBR(customerEmail: string) {
  if (!process.env.SENDGRID_API_KEY || !customerEmail) return;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  await sgMail.send({
    to: customerEmail,
    from: FROM,
    subject: "Seu currículo está quase pronto",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a">
        <img src="${BASE_URL}/brand/Tradepro-logo.svg" alt="TradePro" style="width:180px;margin-bottom:24px" />
        <h1 style="font-size:22px;font-weight:700;margin-bottom:8px">Você está quase lá.</h1>
        <p style="color:#555;margin-bottom:16px">A maioria das pessoas para um passo antes de terminar. Quem termina é quem recebe as ligações.</p>
        <p style="color:#555;margin-bottom:24px">Um currículo finalizado na caixa de entrada de um recrutador vale mais do que um perfeito que ainda está sendo editado.</p>
        <a href="${BR_URL}/curriculo" style="display:inline-block;background:#166534;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-bottom:24px">
          Terminar Meu Currículo →
        </a>
        <p style="color:#777;font-size:13px">Leva menos de 10 minutos. Seu próximo emprego pode começar na próxima candidatura.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:28px 0" />
        <p style="font-size:12px;color:#999">© ${new Date().getFullYear()} TradePro Technologies</p>
      </div>
    `,
    text: `Você está quase lá.\n\nTermine seu currículo agora: ${BR_URL}/curriculo\n\nLeva menos de 10 minutos.`,
  });
}

// ── Scheduler — queues Day 2 and Day 5 emails ────────────────────────────────
// Uses setTimeout for serverless (fires async, non-blocking).
// Detects BR purchases by productId prefix "br_".

export function schedulePostPurchaseEmails(
  customerEmail: string,
  productName: string,
  hasCoverLetter: boolean,
  productId?: string
) {
  if (!customerEmail) return;

  const isBrazil = !!(productId?.startsWith("br_") || productName.toLowerCase().includes("br_"));

  if (isBrazil) {
    // PT-BR sequence
    sendWelcomeEmailPTBR(customerEmail).catch(console.error);
    setTimeout(() => {
      sendDay2EmailPTBR(customerEmail).catch(console.error);
    }, 48 * 60 * 60 * 1000);
    // No Day 5 upsell for BR (single product)
  } else {
    // EN sequence
    sendWelcomeEmail(customerEmail, productName).catch(console.error);
    setTimeout(() => {
      sendDay2Email(customerEmail).catch(console.error);
    }, 48 * 60 * 60 * 1000);
    setTimeout(() => {
      sendDay5Email(customerEmail, hasCoverLetter).catch(console.error);
    }, 120 * 60 * 60 * 1000);
  }
}
