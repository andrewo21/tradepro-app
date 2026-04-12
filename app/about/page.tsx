"use client";

import Link from "next/link";

import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col">

      

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full">
        <div className="max-w-3xl mx-auto px-4 py-16">

          <h1 className="text-3xl font-semibold mb-6 text-center">
            About TradePro
          </h1>

          <p className="text-neutral-700 text-lg leading-relaxed mb-10 text-center max-w-2xl mx-auto">
            Built for workers. Built with honesty. Built to help you tell your story with confidence.
          </p>

          {/* SECTION: OUR MISSION */}
          <section className="mb-14">
            <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
            <p className="text-neutral-700 leading-relaxed">
              TradePro exists to give tradespeople the tools they need to present their experience with clarity and pride. 
              Too many workers get overlooked not because they lack skill, but because they were never taught how to build a resume 
              that reflects the real work they’ve done. We’re here to change that.
            </p>
          </section>

          {/* SECTION: FOUNDER STORY */}
          <section className="mb-14">
            <h2 className="text-2xl font-semibold mb-3">A Message From the Founder</h2>

            <div className="text-neutral-700 leading-relaxed space-y-5">
              <p>
                I was a builder before I was ever a leader. I started my career with my hands, not a title — showing up early, 
                staying late, solving problems on the fly, and learning what real craftsmanship looks like. Those years shaped 
                everything about who I am and how I lead.
              </p>

              <p>
                As I grew into leadership roles, I never forgot where I came from. I learned that growth isn’t just about climbing 
                a ladder — it’s about becoming someone who can tell their story with clarity, confidence, and pride. And that’s 
                something a lot of tradespeople never get the chance to do.
              </p>

              <p>
                That’s why I built TradePro.
              </p>

              <p>
                I’ve seen too many workers with real skill, real grit, and real experience get overlooked because they didn’t know 
                how to build a resume that accurately tells their story. Job applications don’t capture a person’s true story or 
                skill level. They don’t show the leadership, the problem‑solving, the responsibility, or the pride that goes into 
                the work.
              </p>

              <p>
                Through this resume‑building experience, you have the opportunity to share your employment history, your growth, 
                your challenges, and the jobs that shaped you — and turn that into a story that finally does justice to the career 
                you’ve built.
              </p>

              <p>
                If you’ve built things with your hands, you deserve tools built with the same level of care. That’s what TradePro is.
              </p>
            </div>
          </section>

          {/* SECTION: OUR VALUES */}
          <section className="mb-14">
            <h2 className="text-2xl font-semibold mb-3">Our Values</h2>
            <ul className="text-neutral-700 leading-relaxed space-y-3">
              <li>• Honesty — No fluff, no gimmicks, no subscriptions.</li>
              <li>• Craftsmanship — Tools built with the same pride tradespeople put into their work.</li>
              <li>• Empowerment — Helping workers tell their story with confidence.</li>
              <li>• Simplicity — Clear, straightforward tools that anyone can use.</li>
            </ul>
          </section>

          {/* SECTION: ROADMAP */}
          <section className="mb-14">
            <h2 className="text-2xl font-semibold mb-3">Our Roadmap</h2>
            <ul className="text-neutral-700 leading-relaxed space-y-3">
              <li>• Resume Builder — Available now</li>
              <li>• Cover Letter Generator — Included at launch</li>
              <li>• Project List Builder — Coming May 2026</li>
              <li>• More tools designed for tradespeople — Coming soon</li>
            </ul>
          </section>

        </div>
      </main>

      {/* GLOBAL FOOTER */}
      <Footer />

    </div>
  );
}
