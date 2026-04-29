// lib/emailSequences.ts
// Post-purchase email sequences via SendGrid

import sgMail from "@sendgrid/mail";

const FROM = {
  name: "Andrew from TradePro",
  email: "no-reply@tradeprotech.ai",
};

const BASE_URL = "https://tradeprotech.ai";

// ── Email 1 — Welcome + Quick Win (send immediately) ─────────────────────────

export async function sendWelcomeEmail(customerEmail: string, productName: string) {
  if (!process.env.SENDGRID_API_KEY || !customerEmail) return;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const isCoverLetter = productName.toLowerCase().includes("cover");
  const builderUrl = isCoverLetter ? `${BASE_URL}/cover-letter` : `${BASE_URL}/resume`;
  const builderLabel = isCoverLetter ? "Cover Letter Builder" : "Resume Builder";

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
          Start Building Your ${builderLabel === "Resume Builder" ? "Resume" : "Cover Letter"} →
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
    text: `Welcome to TradePro!\n\nYour access is ready. Let's fix your resume in the next 10 minutes.\n\nStart here: ${builderUrl}\n\n1. Fill in your work history.\n2. Let TradePro rewrite it professionally.\n3. Download your PDF and apply.\n\nQuestions? Reply to this email.`,
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

// ── Scheduler — queues Day 2 and Day 5 emails ────────────────────────────────
// Uses setTimeout for serverless (fires async, non-blocking).
// For production scale, replace with a proper queue (Upstash QStash, etc.)

export function schedulePostPurchaseEmails(
  customerEmail: string,
  productName: string,
  hasCoverLetter: boolean
) {
  if (!customerEmail) return;

  // Email 1 — immediate (non-blocking)
  sendWelcomeEmail(customerEmail, productName).catch(console.error);

  // Email 2 — Day 2 (48 hours)
  setTimeout(() => {
    sendDay2Email(customerEmail).catch(console.error);
  }, 48 * 60 * 60 * 1000);

  // Email 3 — Day 5 (120 hours)
  setTimeout(() => {
    sendDay5Email(customerEmail, hasCoverLetter).catch(console.error);
  }, 120 * 60 * 60 * 1000);
}
