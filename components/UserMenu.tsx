"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import Link from "next/link";

export default function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  async function handleSignOut() {
    const sb = getSupabase();
    if (!sb) return;
    await sb.auth.signOut();
    setUser(null);
    setOpen(false);
    router.push("/");
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="px-3 py-1.5 border rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition"
      >
        Sign In
      </Link>
    );
  }

  const initials = (user.email || "?")[0].toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 border rounded-md bg-neutral-100 hover:bg-neutral-200 text-sm font-medium transition"
      >
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
          {initials}
        </span>
        <span className="hidden sm:inline max-w-[140px] truncate text-neutral-700">
          {user.email}
        </span>
        <span className="text-neutral-400">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white border border-neutral-200 rounded-xl shadow-lg py-2 text-sm z-50">
          <div className="px-4 py-2 border-b border-neutral-100">
            <p className="text-xs text-neutral-400">Signed in as</p>
            <p className="text-neutral-800 font-medium truncate">{user.email}</p>
          </div>
          <Link
            href="/minhas-versoes"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-neutral-700 hover:bg-neutral-50 transition"
          >
            <span>📄</span> My Resumes
          </Link>
          <Link
            href="/resume/select"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-neutral-700 hover:bg-neutral-50 transition"
          >
            <span>✚</span> New Resume
          </Link>
          <div className="border-t border-neutral-100 mt-1 pt-1">
            <button
              onClick={handleSignOut}
              className="w-full text-left flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition"
            >
              <span>→</span> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
