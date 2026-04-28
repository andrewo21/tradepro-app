import Footer from "@/components/Footer";
import Link from "next/link";

export default function RefundsPage() {
  const updated = "April 28, 2025";

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col">
      <main className="flex-1 w-full">
        <div className="max-w-3xl mx-auto px-4 py-16">

          <Link href="/" className="text-sm text-blue-600 hover:underline mb-8 inline-block">← Back to Home</Link>

          <h1 className="text-3xl font-semibold mb-2">Refund Policy</h1>
          <p className="text-sm text-neutral-500 mb-10">Last updated: {updated}</p>

          <div className="prose prose-neutral max-w-none space-y-8 text-sm leading-relaxed text-neutral-700">

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">Digital Product Policy</h2>
              <p>TradePro Technologies sells digital services — resume builders and cover letter generators — that deliver content immediately upon purchase. Because the product is digital and access is granted instantly, all sales are generally final.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">When We Will Issue a Refund</h2>
              <p>We will issue a full refund in the following situations:</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li><strong>Technical failure</strong> — you were charged but never gained access to the tool due to a verified technical error on our side.</li>
                <li><strong>Duplicate charge</strong> — you were charged more than once for the same session.</li>
                <li><strong>Service unavailable</strong> — the tool was completely non-functional at the time of your purchase and we are unable to restore access within 24 hours.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">When We Do Not Issue Refunds</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>You accessed the builder and downloaded one or more PDFs.</li>
                <li>You changed your mind after purchase.</li>
                <li>You were dissatisfied with the AI-generated content suggestions (these are starting points, not guaranteed outputs).</li>
                <li>Your download limit has been reached.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">How to Request a Refund</h2>
              <p>Email <a href="mailto:andrew@tradeprotech.ai" className="text-blue-600 hover:underline">andrew@tradeprotech.ai</a> within <strong>48 hours</strong> of your purchase with:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Your name and email address used at checkout</li>
                <li>The date and amount of the charge</li>
                <li>A brief description of the issue</li>
              </ul>
              <p className="mt-3">We will respond within 1–2 business days. Approved refunds are returned to your original payment method within 5–10 business days depending on your bank.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">Contact</h2>
              <p>Questions? Reach us at <a href="mailto:andrew@tradeprotech.ai" className="text-blue-600 hover:underline">andrew@tradeprotech.ai</a>.</p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
