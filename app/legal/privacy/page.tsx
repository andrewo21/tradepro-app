import Footer from "@/components/Footer";
import Link from "next/link";

export default function PrivacyPage() {
  const updated = "April 28, 2025";

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col">
      <main className="flex-1 w-full">
        <div className="max-w-3xl mx-auto px-4 py-16">

          <Link href="/" className="text-sm text-blue-600 hover:underline mb-8 inline-block">← Back to Home</Link>

          <h1 className="text-3xl font-semibold mb-2">Privacy Policy</h1>
          <p className="text-sm text-neutral-500 mb-10">Last updated: {updated}</p>

          <div className="prose prose-neutral max-w-none space-y-8 text-sm leading-relaxed text-neutral-700">

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">1. Information We Collect</h2>
              <p>When you use TradePro Technologies, we may collect the following:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Resume and cover letter data</strong> — name, contact information, work history, skills, and education that you enter into the builder.</li>
                <li><strong>Payment information</strong> — processed entirely by Stripe. TradePro does not store your card number or payment credentials.</li>
                <li><strong>Email address</strong> — if you sign up for updates or submit a contact form.</li>
                <li><strong>Usage data</strong> — basic analytics such as pages visited and features used, to improve the service.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">2. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>To generate your resume or cover letter PDF.</li>
                <li>To verify and fulfill your purchase.</li>
                <li>To send you product updates if you opted in (you may unsubscribe at any time).</li>
                <li>To respond to support requests.</li>
                <li>To improve the platform and fix technical issues.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">3. Data Storage</h2>
              <p>Resume and cover letter data you enter is stored temporarily in your browser&apos;s local storage and in our session database only long enough to deliver your document. We do not build long-term profiles of users from resume content. Purchase and entitlement records are retained to manage your session access.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">4. Third-Party Services</h2>
              <p>We use the following third-party services:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Stripe</strong> — payment processing. Subject to <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Stripe&apos;s Privacy Policy</a>.</li>
                <li><strong>OpenAI</strong> — AI-assisted writing features. Content sent to OpenAI is subject to <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI&apos;s Privacy Policy</a>.</li>
                <li><strong>SendGrid / Twilio</strong> — transactional email delivery.</li>
                <li><strong>Vercel</strong> — hosting and infrastructure.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">5. We Do Not Sell Your Data</h2>
              <p>TradePro Technologies does not sell, rent, or trade your personal information to any third party for marketing purposes.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">6. Cookies</h2>
              <p>We use minimal cookies necessary for the service to function (such as session identifiers). We do not use advertising cookies or third-party tracking cookies.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">7. Your Rights</h2>
              <p>You may request deletion of any personal data we hold about you at any time by emailing <a href="mailto:andrew@tradeprotech.ai" className="text-blue-600 hover:underline">andrew@tradeprotech.ai</a>. We will respond within 30 days.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">8. Children&apos;s Privacy</h2>
              <p>TradePro is not directed at children under 13. We do not knowingly collect personal information from anyone under 13 years of age.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">9. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will update the &quot;Last updated&quot; date above when changes are made. Continued use of the service after updates constitutes acceptance.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">10. Contact</h2>
              <p>Questions about privacy? Email us at <a href="mailto:andrew@tradeprotech.ai" className="text-blue-600 hover:underline">andrew@tradeprotech.ai</a>.</p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
