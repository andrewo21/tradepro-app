"use client";

import { useState } from "react";

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        alert("Unable to start checkout. Please try again.");
      }
    } catch (err) {
      console.error("Upgrade error:", err);
      alert("Something went wrong starting checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center px-4 py-16">
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-xl p-10 border border-gray-200">
        
        {/* HEADER */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Upgrade to TradePro Premium
        </h1>
        <p className="text-lg text-gray-600 mb-10">
          Unlock professional templates, advanced formatting, and priority AI enhancements.
        </p>

        {/* FEATURES */}
        <div className="space-y-6 mb-12">
          <div className="flex items-start gap-4">
            <div className="w-3 h-3 bg-blue-600 rounded-full mt-2" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Premium Templates
              </h2>
              <p className="text-gray-600">
                Access Clean Professional and future premium layouts designed to elevate your resume.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-3 h-3 bg-blue-600 rounded-full mt-2" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                AI‑Enhanced Formatting
              </h2>
              <p className="text-gray-600">
                Automatically optimized spacing, alignment, and structure for a polished, ATS‑friendly resume.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-3 h-3 bg-blue-600 rounded-full mt-2" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Priority Rewrite Engine
              </h2>
              <p className="text-gray-600">
                Stronger bullet rewrites, clearer summaries, and more professional language tuned for construction and trades.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-3 h-3 bg-blue-600 rounded-full mt-2" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Unlimited PDF Exports
              </h2>
              <p className="text-gray-600">
                Export clean, print‑ready PDFs without watermarks.
              </p>
            </div>
          </div>
        </div>

        {/* PRICING */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-blue-700 mb-2">$9.99</h2>
          <p className="text-gray-700 mb-6">One‑time upgrade. Lifetime access.</p>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Redirecting…" : "Upgrade Now"}
          </button>
        </div>

        
      </div>
    </div>
  );
}
