"use client";

import { useState } from "react";

export default function AdminCustomersPage() {
  const [secret,  setSecret]  = useState("");
  const [userId,  setUserId]  = useState("");
  const [type,    setType]    = useState("resume");
  const [result,  setResult]  = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleReset() {
    if (!secret || !userId) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/admin/reset-downloads", {
        method:  "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": secret },
        body:    JSON.stringify({ userId, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheck() {
    if (!userId) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res  = await fetch(`/api/debug/entitlements?userId=${userId}`);
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-1">Customer Admin</h1>
        <p className="text-neutral-400 text-sm mb-8">Reset downloads · Check entitlements</p>

        <div className="space-y-4 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">

          <div>
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Admin Secret</label>
            <input
              type="password"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              placeholder="Your ADMIN_SECRET from Vercel"
              className="mt-1 w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Customer User ID</label>
            <input
              type="text"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              placeholder="From Supabase → Auth → Users"
              className="mt-1 w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Reset Type</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="mt-1 w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="resume">Resume (3 downloads)</option>
              <option value="cover_letter">Cover Letter</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleReset}
              disabled={loading || !secret || !userId}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-colors"
            >
              {loading ? "Working…" : "Reset Downloads"}
            </button>
            <button
              onClick={handleCheck}
              disabled={loading || !userId}
              className="flex-1 py-2.5 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Check Status
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-950 border border-red-800 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-emerald-950 border border-emerald-800 rounded-xl">
            <p className="text-emerald-400 font-bold text-sm mb-2">
              {result.success ? "✓ " + result.message : "Result"}
            </p>
            <pre className="text-emerald-300 text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}
