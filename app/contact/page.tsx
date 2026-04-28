"use client";

import { useState } from "react";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col">

      <main className="flex-1 w-full">
        <div className="max-w-2xl mx-auto px-4 py-16">

          <h1 className="text-3xl font-semibold mb-6 text-center">
            Contact Us
          </h1>

          <p className="text-neutral-700 text-center mb-10 max-w-lg mx-auto">
            Have a question, need support, or want to leave feedback?
            Fill out the form below and we'll get back to you as soon as possible.
          </p>

          {submitted ? (
            <div className="bg-white border border-green-300 rounded-lg shadow-sm p-10 text-center">
              <div className="text-5xl mb-4">✓</div>
              <h2 className="text-2xl font-semibold text-green-700 mb-3">
                Thanks for your email!
              </h2>
              <p className="text-neutral-700 text-lg">
                A team member will contact you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-neutral-300 rounded-lg shadow-sm p-8 space-y-6">

              <div>
                <label className="block text-sm font-medium mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Your Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm h-32"
                  placeholder="How can we help?"
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm text-center">{error}</p>
              )}

              <div className="text-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-neutral-900 text-white px-8 py-3 rounded-md text-sm font-semibold hover:bg-neutral-800 disabled:opacity-50"
                >
                  {loading ? "Sending…" : "Send Message"}
                </button>
              </div>

            </form>
          )}

        </div>
      </main>

      <Footer />

    </div>
  );
}
