import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export async function sendThankYouEmail({
  customerName,
  customerEmail,
  productName,
}: {
  customerName: string;
  customerEmail: string;
  productName: string;
}) {
  const msg = {
    to: customerEmail,
    from: {
      name: "Andrew from TradePro",
      email: "no-reply@tradepro.com",
    },
    subject: `Thank you for your purchase!`,
    text: `
Hi ${customerName || "there"},

Thank you for your purchase of: ${productName}.

Your order has been received and your access is now active.

If you need anything, just reply to this email.

Best,
Andrew from TradePro
    `,
  };

  await sgMail.send(msg);
}
