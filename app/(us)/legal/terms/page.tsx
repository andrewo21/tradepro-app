import Footer from "@/components/Footer";
import Link from "next/link";

export default function TermsPage() {
  const updated = "April 28, 2025";

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col">
      <main className="flex-1 w-full">
        <div className="max-w-3xl mx-auto px-4 py-16">

          <Link href="/" className="text-sm text-blue-600 hover:underline mb-8 inline-block">← Back to Home</Link>

          <h1 className="text-3xl font-semibold mb-2">Terms of Service</h1>
          <p className="text-sm text-neutral-500 mb-10">Last updated: {updated}</p>

          <div className="prose prose-neutral max-w-none space-y-8 text-sm leading-relaxed text-neutral-700">

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">1. Acceptance of Terms</h2>
              <p>By accessing or using TradePro Technologies (&quot;TradePro,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) at tradeprotech.ai, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">2. Description of Service</h2>
              <p>TradePro Technologies provides a digital resume builder and cover letter generator designed for skilled tradespeople and construction professionals. Access to tools is granted on a per-session, one-time purchase basis.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">3. Purchases and Payment</h2>
              <p>All purchases are processed securely through Stripe. By completing a purchase you authorize the applicable charge. All fees are in USD. Each purchase grants access to one session with up to two (2) PDF downloads per tool purchased. After download limits are reached, access to that session expires and a new purchase is required.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">4. Refund Policy</h2>
              <p>Please see our <Link href="/legal/refunds" className="text-blue-600 hover:underline">Refund Policy</Link> for full details. Because our tools deliver digital content that is generated and downloaded immediately, refunds are handled on a case-by-case basis. Contact <a href="mailto:andrew@tradeprotech.ai" className="text-blue-600 hover:underline">andrew@tradeprotech.ai</a> within 48 hours of purchase if you experience a technical issue.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">5. User Content</h2>
              <p>You retain full ownership of any personal information, resume data, or cover letter content you enter into TradePro. We do not sell, share, or use your personal resume data for any purpose other than generating your documents. By using the service you grant TradePro a limited, non-exclusive license to process your content solely to deliver the requested output.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">6. AI-Generated Content</h2>
              <p>TradePro uses AI assistance to help generate resume summaries, bullet points, and cover letter content. All AI-generated content is provided as a starting point and should be reviewed for accuracy before use. TradePro makes no guarantees regarding employment outcomes resulting from use of the service.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">7. Prohibited Use</h2>
              <p>You agree not to: (a) use the service for any unlawful purpose; (b) attempt to reverse-engineer, scrape, or copy the platform; (c) submit false or misleading information; (d) resell or redistribute documents generated through the service on a commercial basis without prior written consent.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">8. Intellectual Property</h2>
              <p>The TradePro platform, brand, templates, and underlying technology are owned by TradePro Technologies. You may not reproduce or distribute any portion of the platform without written permission. Documents you generate using your own content belong to you.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">9. Disclaimer of Warranties</h2>
              <p>The service is provided &quot;as is&quot; without warranties of any kind, express or implied. TradePro does not warrant that the service will be uninterrupted, error-free, or that documents generated will meet any particular standard required by a specific employer.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">10. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, TradePro Technologies shall not be liable for any indirect, incidental, special, or consequential damages arising out of your use of or inability to use the service, even if advised of the possibility of such damages. Our total liability to you for any claim shall not exceed the amount you paid for the session in question.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">11. Changes to Terms</h2>
              <p>We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the updated terms. We will update the &quot;Last updated&quot; date above when changes are made.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">12. Governing Law</h2>
              <p>These terms are governed by the laws of the United States. Any disputes shall be resolved in the applicable courts of competent jurisdiction.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">13. Contact</h2>
              <p>For questions about these terms, contact us at <a href="mailto:andrew@tradeprotech.ai" className="text-blue-600 hover:underline">andrew@tradeprotech.ai</a>.</p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
