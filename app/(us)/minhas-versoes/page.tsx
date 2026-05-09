"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { useResumeStore } from "@/app/store/useResumeStore";
import Link from "next/link";

interface Resume {
  id: string;
  title: string;
  locale: string;
  updated_at: string;
}

export default function YourResumesPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const setField = useResumeStore((s: any) => s.setField);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setLoading(false);
      return;
    }
    sb.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
        return;
      }
      setUser(session.user);
      const res = await fetch("/api/resume/list", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      setResumes(json.resumes || []);
      setLoading(false);
    });
  }, [router]);

  async function loadResume(id: string) {
    const sb = getSupabase();
    if (!sb) return;
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return;

    const res = await fetch(`/api/resume/load?id=${id}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const json = await res.json();
    if (json.resume?.data) {
      // Hydrate the Zustand store from saved data
      const d = json.resume.data;
      Object.keys(d).forEach(k => setField(k, d[k]));
      router.push("/resume/personal");
    }
  }

  async function handleLogout() {
    const sb = getSupabase();
    if (!sb) return;
    await sb.auth.signOut();
    router.replace("/");
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Your Resumes</h1>
            {user && <p className="text-sm text-neutral-500 mt-1">{user.email}</p>}
          </div>
          <div className="flex gap-3">
            <Link
              href="/resume/select"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              + New Resume
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg text-sm hover:bg-neutral-300 transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-neutral-500 text-sm">Loading your resumes…</div>
        ) : resumes.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-2xl p-10 text-center">
            <p className="text-neutral-500 mb-4">No saved resumes yet.</p>
            <Link
              href="/resume/select"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
            >
              Build Your First Resume
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {resumes.map(r => (
              <button
                key={r.id}
                onClick={() => loadResume(r.id)}
                className="w-full text-left bg-white border border-neutral-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-sm transition"
              >
                <p className="font-medium text-neutral-900">{r.title}</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Last updated: {new Date(r.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  {r.locale === "pt-BR" && " · Brazil"}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
