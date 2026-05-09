"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { useResumeStore } from "@/app/store/useResumeStore";
import { getOrCreateUserId } from "@/lib/userId";
import Link from "next/link";

interface Resume {
  id: string;
  title: string;
  locale: string;
  updated_at: string;
}

interface Profile {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile>({ firstName: "", lastName: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const setField = useResumeStore((s: any) => s.setField);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setLoading(false); return; }
    sb.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }
      setUser(session.user);

      // Load profile from user metadata
      const meta = session.user.user_metadata || {};
      setProfile({
        firstName: meta.firstName || "",
        lastName: meta.lastName || "",
        phone: meta.phone || "",
        address: meta.address || "",
      });

      // Load saved resumes
      const res = await fetch("/api/resume/list", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      setResumes((json.resumes || []).filter((r: Resume) => r.locale === "en"));
      setLoading(false);
    });
  }, [router]);

  async function handleSaveProfile() {
    const sb = getSupabase();
    if (!sb) return;
    setSaving(true);
    await sb.auth.updateUser({ data: profile });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function loadResume(id: string) {
    const sb = getSupabase();
    if (!sb) return;
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return;

    // Load resume data
    const res = await fetch(`/api/resume/load?id=${id}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const json = await res.json();
    if (!json.resume?.data) return;

    // Restore entitlement — saved resume = proof of purchase
    const userId = getOrCreateUserId();
    await fetch("/api/resume/grant-access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ userId }),
    });

    // Hydrate store with saved data + clear watermark
    const d = json.resume.data;
    Object.keys(d).forEach(k => setField(k, d[k]));
    setField("showWatermark", false);
    setField("premiumUnlocked", d.premiumUnlocked ?? false);

    router.push("/resume/personal");
  }

  async function handleSignOut() {
    const sb = getSupabase();
    if (!sb) return;
    await sb.auth.signOut();
    router.replace("/");
  }

  const mostRecentResume = resumes[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-neutral-900">My Account</h1>
          <button
            onClick={handleSignOut}
            className="text-sm text-red-600 hover:text-red-800 transition"
          >
            Sign Out
          </button>
        </div>

        {/* Resume CTA */}
        <div className="bg-blue-600 rounded-2xl p-6 text-white">
          {mostRecentResume ? (
            <div>
              <p className="text-blue-100 text-sm mb-1">Last saved: {new Date(mostRecentResume.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
              <p className="font-semibold text-lg mb-4">{mostRecentResume.title}</p>
              <button
                onClick={() => loadResume(mostRecentResume.id)}
                className="px-6 py-2.5 bg-white text-blue-700 rounded-lg font-semibold text-sm hover:bg-blue-50 transition"
              >
                Continue with Your Resume →
              </button>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-lg mb-2">You haven't built a resume yet.</p>
              <Link
                href="/resume/select"
                className="inline-block px-6 py-2.5 bg-white text-blue-700 rounded-lg font-semibold text-sm hover:bg-blue-50 transition"
              >
                Start Building Your Resume →
              </Link>
            </div>
          )}
        </div>

        {/* Saved Resumes */}
        {resumes.length > 0 && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-neutral-900">Saved Resumes</h2>
              <Link href="/resume/select" className="text-sm text-blue-600 hover:text-blue-800">+ New Resume</Link>
            </div>
            <div className="space-y-2">
              {resumes.map(r => (
                <button
                  key={r.id}
                  onClick={() => loadResume(r.id)}
                  className="w-full text-left px-4 py-3 bg-neutral-50 hover:bg-blue-50 border border-neutral-200 hover:border-blue-300 rounded-xl transition"
                >
                  <p className="font-medium text-sm text-neutral-900">{r.title}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Updated {new Date(r.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <h2 className="font-semibold text-neutral-900 mb-5">Account Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">First Name</label>
              <input
                type="text"
                value={profile.firstName}
                onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Last Name</label>
              <input
                type="text"
                value={profile.lastName}
                onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-neutral-50 text-neutral-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Phone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                placeholder="(555) 000-0000"
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-500 mb-1">City, State</label>
              <input
                type="text"
                value={profile.address}
                onChange={e => setProfile(p => ({ ...p, address: e.target.value }))}
                placeholder="West Palm Beach, FL"
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60"
          >
            {saving ? "Saving…" : saved ? "✓ Saved" : "Save Profile"}
          </button>
        </div>

      </div>
    </div>
  );
}
