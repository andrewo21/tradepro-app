"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useBrResumeStore } from "@/app/store/useBrResumeStore";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BrBuilderSaveBar() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <BrBuilderSaveBarContent />;
}

function BrBuilderSaveBarContent() {
  const store = useBrResumeStore();
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [editing, setEditing] = useState(false);
  const [resumeName, setResumeName] = useState("Meu Currículo");
  const resumeIdRef = useRef<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const p = store.personalInfo || {};
    const auto = [p.nome, p.sobrenome].filter(Boolean).join(" ");
    if (auto && resumeName === "Meu Currículo") setResumeName(auto);
  }, [store.personalInfo?.nome, store.personalInfo?.sobrenome]);

  useEffect(() => {
    if (editing) nameInputRef.current?.focus();
  }, [editing]);

  const handleSave = useCallback(async (): Promise<boolean> => {
    const sb = getSupabase();
    if (!sb) { setStatus("error"); setTimeout(() => setStatus("idle"), 3000); return false; }

    const { data: { session } } = await sb.auth.getSession();
    if (!session) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
      return false;
    }

    setStatus("saving");
    const autoTitle = resumeName || "Meu Currículo";

    const data = {
      personalInfo: store.personalInfo,
      resumoProfissional: store.resumoProfissional,
      habilidades: store.habilidades,
      experiencia: store.experiencia,
      formacao: store.formacao,
      cursosCertificacoes: store.cursosCertificacoes,
      selectedTemplate: store.selectedTemplate,
      showWatermark: store.showWatermark,
      premiumUnlocked: store.premiumUnlocked,
    };

    try {
      const res = await fetch("/api/resume/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ resumeId: resumeIdRef.current, title: autoTitle, data, locale: "pt-BR" }),
      });
      const json = await res.json();
      if (json.resumeId) {
        resumeIdRef.current = json.resumeId;
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 3000);
        return true;
      }
    } catch { /* silent */ }
    setStatus("error");
    setTimeout(() => setStatus("idle"), 3000);
    return false;
  }, [store]);

  async function handleSaveAndExit() {
    await handleSave();
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    router.push("/br");
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-neutral-200 text-sm">
      <Link href="/br/meus-curriculos" className="text-green-700 hover:text-green-900 font-medium flex items-center gap-1.5 flex-shrink-0">
        <span>←</span> Meus Currículos
      </Link>

      {/* Nome editável */}
      <div className="flex-1 mx-4">
        {editing ? (
          <input
            ref={nameInputRef}
            type="text"
            value={resumeName}
            onChange={e => setResumeName(e.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") setEditing(false); }}
            className="w-full max-w-xs border border-green-500 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="Nome do currículo..."
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-neutral-600 hover:text-neutral-900 transition group max-w-xs truncate"
            title="Clique para renomear"
          >
            <span className="truncate font-medium">{resumeName}</span>
            <span className="text-neutral-400 group-hover:text-green-600 flex-shrink-0">✏️</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {status === "saved" && <span className="text-green-600 font-medium">✓ Salvo</span>}
        {status === "error" && <span className="text-red-500 text-xs">Entre na conta para salvar</span>}
        {status === "saving" && <span className="text-neutral-400 text-xs animate-pulse">Salvando…</span>}
        <button onClick={handleSave} disabled={status === "saving"}
          className="px-4 py-1.5 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition disabled:opacity-60">
          {status === "saving" ? "Salvando…" : "Salvar"}
        </button>
        <button onClick={handleSaveAndExit} disabled={status === "saving"}
          className="px-4 py-1.5 bg-neutral-700 text-white rounded-lg text-sm font-medium hover:bg-neutral-900 transition disabled:opacity-60">
          Salvar e Sair
        </button>
      </div>
    </div>
  );
}
