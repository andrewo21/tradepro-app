"use client";

import { useState } from "react";
import { ProductId } from "@/lib/pricing";

export default function CheckoutButton({ userId, productId }: { userId: string; productId: ProductId }) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }

    setLoading(false);
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      {loading ? "Redirecting..." : "Buy Now"}
    </button>
  );
}
