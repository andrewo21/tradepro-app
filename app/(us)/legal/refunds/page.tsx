import Link from "next/link";

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col">
      <main className="flex-1 w-full">
        <div className="max-w-3xl mx-auto px-4 py-16">

          <Link href="/" className="text-sm text-blue-600 hover:underline mb-8 inline-block">← Back to Home</Link>

          <h1 className="text-3xl font-semibold mb-2">Refund Policy</h1>
          <p className="text-sm text-neutral-500 mb-10">Last updated: May 2026</p>

          <div className="space-y-8 text-sm leading-relaxed text-neutral-700">

            <section>
              <p>TradePro provides a digital, instant‑delivery resume‑building service. Because the product is delivered immediately and cannot be returned, all sales are considered final once the service has been successfully delivered.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-3">Refunds Are Granted Only In These Cases</h2>
              <ul className="space-y-2">
                <li className="flex items-start gap-2"><span className="text-blue-600 flex-shrink-0 mt-0.5">•</span><span>You were charged twice for the same purchase</span></li>
                <li className="flex items-start gap-2"><span className="text-blue-600 flex-shrink-0 mt-0.5">•</span><span>The product failed to generate due to a technical error on our side</span></li>
                <li className="flex items-start gap-2"><span className="text-blue-600 flex-shrink-0 mt-0.5">•</span><span>You were charged but did not receive access to the service</span></li>
              </ul>
              <p className="mt-3 text-neutral-600">If any of these apply, contact us within 7 days and we will resolve it quickly.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-3">Non‑Refundable Situations</h2>
              <p className="mb-3">We do not offer refunds for:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2"><span className="text-neutral-400 flex-shrink-0 mt-0.5">•</span><span>Completed resume generations</span></li>
                <li className="flex items-start gap-2"><span className="text-neutral-400 flex-shrink-0 mt-0.5">•</span><span>User dissatisfaction with style or content after delivery</span></li>
                <li className="flex items-start gap-2"><span className="text-neutral-400 flex-shrink-0 mt-0.5">•</span><span>Accidental purchases</span></li>
                <li className="flex items-start gap-2"><span className="text-neutral-400 flex-shrink-0 mt-0.5">•</span><span>Change of mind after the product is delivered</span></li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">Need Help?</h2>
              <p>If you believe you qualify for a refund, contact us at: <a href="mailto:support@tradepro.tools" className="text-blue-600 hover:underline">support@tradepro.tools</a></p>
              <p className="mt-1 text-neutral-500">We're here to help.</p>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
