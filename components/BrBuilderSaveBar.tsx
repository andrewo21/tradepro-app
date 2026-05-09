"use client";

import { useState, useCallback, useRef } from "react";
import { useBrResumeStore } from "@/app/store/useBrResumeStore";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BrBuilderSaveBar() {
  const store = useBrResumeStore();
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const resumeIdRef = useRef<string | null>(null);

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
    const pi = store.personalInfo || {};
    const autoTitle = [pi.nome, pi.sobrenome].filter(Boolean).join(" ") || "Meu Currículo";

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
      <Link href="/br/meus-curriculos" className="text-green-700 hover:text-green-900 font-medium flex items-center gap-1.5">
        <span>←</span> Meus Currículos
      </Link>

      <div className="flex items-center gap-3">
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
