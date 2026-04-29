// lib/newsletterTemplate.ts
// Reusable TradePro newsletter broadcast template

const BASE_URL = "https://tradeprotech.ai";

export function buildNewsletterEmail({
  headline,
  body,
  ctaLabel,
  ctaUrl,
  preheader = "",
}: {
  headline: string;
  body: string;        // HTML allowed
  ctaLabel: string;
  ctaUrl: string;
  preheader?: string;
}): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${headline}</title>
  ${preheader ? `<span style="display:none;max-height:0;overflow:hidden">${preheader}</span>` : ""}
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%">

          <!-- HEADER -->
          <tr>
            <td style="background:#1a1a1a;padding:28px 40px;text-align:center">
              <img src="${BASE_URL}/brand/Tradepro-logo.svg" alt="TradePro Technologies" style="width:180px;height:auto" />
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px 40px 32px">
              <h1 style="font-size:26px;font-weight:700;color:#1a1a1a;margin:0 0 16px">${headline}</h1>
              <div style="font-size:15px;line-height:1.7;color:#444444">${body}</div>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center">
              <a href="${ctaUrl}"
                style="display:inline-block;background:#1a1a1a;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">
                ${ctaLabel}
              </a>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td style="padding:0 40px">
              <hr style="border:none;border-top:1px solid #eeeeee" />
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:24px 40px;text-align:center">
              <p style="font-size:12px;color:#999;margin:0 0 8px">
                © ${new Date().getFullYear()} TradePro Technologies · Built for the trades.
              </p>
              <p style="font-size:12px;color:#999;margin:0">
                <a href="${BASE_URL}/contact" style="color:#999">Contact Us</a>
                &nbsp;·&nbsp;
                <a href="${BASE_URL}/legal/privacy" style="color:#999">Privacy Policy</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `${headline}\n\n${body.replace(/<[^>]+>/g, "").trim()}\n\n${ctaLabel}: ${ctaUrl}\n\n© ${new Date().getFullYear()} TradePro Technologies`;

  return { html, text };
}

// ── Example usage (for testing) ──────────────────────────────────────────────
// import sgMail from "@sendgrid/mail";
// const { html, text } = buildNewsletterEmail({
//   headline: "New Premium Templates Are Here",
//   body: "<p>We just added 4 new premium templates to TradePro — check them out.</p>",
//   ctaLabel: "See New Templates",
//   ctaUrl: "https://tradeprotech.ai/resume",
//   preheader: "4 new templates just dropped.",
// });
// await sgMail.send({ to: "list@example.com", from: ..., subject: "New templates", html, text });
