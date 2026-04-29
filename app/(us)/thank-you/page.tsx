"use client";

import { useState } from "react";
import { useThankYouStore } from "@/app/store/useThankYouStore";

export default function ThankYouPage() {
  const {
    customerName,
    productName,
    orderNumber,
    tone,
    personalNote,
    generatedEmail,
    setField,
    setGeneratedEmail,
  } = useThankYouStore();

  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);

    const payload = {
      customerName,
      productName,
      orderNumber,
      tone,
      personalNote,
    };

    const res = await fetch(
      "https://tradepro-app.onrender.com/thankyou/generate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    if (data.email) {
      setGeneratedEmail(data.email);
    }

    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedEmail);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-10">
      <h1 className="text-3xl font-bold">Thank‑You Email Generator</h1>

      {/* Inputs */}
      <section className="space-y-4">
        <input
          className="w-full border p-2 rounded"
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => setField("customerName", e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Product Purchased"
          value={productName}
          onChange={(e) => setField("productName", e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Order Number (optional)"
          value={orderNumber}
          onChange={(e) => setField("orderNumber", e.target.value)}
        />

        <select
          className="w-full border p-2 rounded"
          value={tone}
          onChange={(e) => setField("tone", e.target.value)}
        >
          <option>Warm</option>
          <option>Friendly</option>
          <option>Professional</option>
        </select>

        <textarea
          className="w-full border p-2 rounded h-32"
          placeholder="Optional personal note..."
          value={personalNote}
          onChange={(e) => setField("personalNote", e.target.value)}
        />
      </section>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Generating..." : "Generate Email"}
      </button>

      {/* Preview */}
      {generatedEmail && (
        <section className="mt-10 p-6 border rounded bg-white shadow">
          <h2 className="text-xl font-semibold mb-4">Preview (Editable)</h2>

          <textarea
            className="w-full border p-3 rounded h-80 whitespace-pre-wrap"
            value={generatedEmail}
            onChange={(e) => setGeneratedEmail(e.target.value)}
          />

          <button
            onClick={handleCopy}
            className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded"
          >
            Copy to Clipboard
          </button>
        </section>
      )}
    </div>
  );
}
