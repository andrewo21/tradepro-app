"use client";

import { useState } from "react";

interface Entitlements {
  resume: boolean;
  coverLetter: boolean;
  bundle: boolean;
}

export default function StripeTestPanel({
  userId,
  initial,
}: {
  userId: string;
  initial: Entitlements | null;
}) {
  const [entitlements, setEntitlements] = useState<Entitlements | null>(initial);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const res = await fetch(`/api/debug/entitlements?userId=${userId}`);
    const data = await res.json();
    setEntitlements(data.entitlements);
  }

  async function reset() {
    setLoading(true);
    setStatus(null);
    const res = await fetch("/api/debug/reset-entitlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (data.success) {
      setStatus("Entitlements reset. Ready for a fresh test purchase.");
      await refresh();
    } else {
      setStatus(`Error: ${data.error}`);
    }
    setLoading(false);
  }

  const flag = (v: boolean) =>
    v ? (
      <span className="text-green-600 font-bold">✓ Unlocked</span>
    ) : (
      <span className="text-red-500">✗ Locked</span>
    );

  return (
    <div className="mt-10 mx-auto max-w-2xl border border-amber-400 rounded-xl bg-amber-50 p-6 text-left shadow">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded">
          STRIPE TEST MODE
        </span>
        <span className="text-amber-800 text-sm font-medium">
          Debug panel — not visible in production
        </span>
      </div>

      <p className="text-sm text-amber-900 mb-4">
        User: <code className="bg-amber-100 px-1 rounded font-mono">{userId}</code>
      </p>

      {entitlements ? (
        <table className="w-full text-sm mb-5 border-collapse">
          <tbody>
            <tr className="border-b border-amber-200">
              <td className="py-1.5 text-amber-900 font-medium w-40">Resume Builder</td>
              <td>{flag(entitlements.resume)}</td>
            </tr>
            <tr className="border-b border-amber-200">
              <td className="py-1.5 text-amber-900 font-medium">Cover Letter</td>
              <td>{flag(entitlements.coverLetter)}</td>
            </tr>
            <tr>
              <td className="py-1.5 text-amber-900 font-medium">Premium Bundle</td>
              <td>{flag(entitlements.bundle)}</td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p className="text-sm text-amber-700 mb-5">No entitlements on file (unpurchased).</p>
      )}

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={refresh}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700"
        >
          Refresh Status
        </button>
        <button
          onClick={reset}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Resetting…" : "Reset Entitlements"}
        </button>
        <a
          href="/resume"
          className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800"
        >
          Go to Resume Builder →
        </a>
        <a
          href="/cover-letter"
          className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800"
        >
          Go to Cover Letter →
        </a>
      </div>

      {status && (
        <p className="mt-4 text-sm font-medium text-amber-900 bg-amber-100 px-3 py-2 rounded">
          {status}
        </p>
      )}

      <p className="mt-4 text-xs text-amber-700 border-t border-amber-200 pt-3">
        Use Stripe test card <code className="bg-amber-100 px-1 rounded font-mono">4242 4242 4242 4242</code> · Any future expiry · Any CVC
      </p>
    </div>
  );
}
