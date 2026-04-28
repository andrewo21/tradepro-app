"use client";

import { useState } from "react";
import { ProductId } from "@/lib/pricing";

export default function CheckoutButton({
  userId,
  productId,
  label = "Buy Now",
  className,
}: {
  userId: string;
  productId: ProductId;
  label?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setError(data.detail || data.error || `Server error (${res.status})`);
    } catch (err: any) {
      setError(err?.message || "Network error — could not reach checkout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={className || "bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 w-full"}
      >
        {loading ? "Redirecting..." : label}
      </button>
      {error && (
        <p className="text-red-600 text-xs text-center break-words">{error}</p>
      )}
    </div>
  );
}
