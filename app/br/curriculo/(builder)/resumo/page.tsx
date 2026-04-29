"use client";

import { useState, useEffect, useRef } from "react";
import { useBrResumeStore } from "@/app/store/useBrResumeStore";
import Link from "next/link";

export default function BrResumoPage() {
  const { resumoProfissional, updateResumo } = useBrResumeStore();
  const [local, setLocal] = useState(resumoProfissional);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { setLocal(resumoProfissional); }, [resumoProfissional]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!local.trim() || suggestion) return;
    timer.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/ai/br/rewrite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: local, type: "resumo" }),
        });
        const data = await res.json();
        if (res.ok && data.suggestion) setSuggestion(data.suggestion);
        else setError(data.error || "Erro na IA.");
      } catch { setError("Erro de rede."); }
      finally { setLoading(false); }
    }, 1400);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [local]); // eslint-disable-line

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <p className="text-sm text-neutral-500 mb-1">Passo 5 de 6 — Resumo Profissional</p>
      <h1 className="text-2xl font-semibold mb-2">Resumo Profissional</h1>
      <p className="text-sm text-neutral-500 mb-6">Escreva em português informal, gíria ou mistura de idiomas. A IA vai melhorar automaticamente enquanto você digita.</p>

      <textarea
        className="w-full border rounded-xl px-4 py-3 text-sm h-40 resize-none focus:ring-2 focus:ring-green-500 focus:outline-none"
        placeholder="ex: Trabalho com elétrica há 10 anos, instalei painel, fiz quadro, conheço NR-10, já fui encarregado de equipe de 8 pessoas..."
        value={local}
        onChange={e => { setLocal(e.target.value); if (suggestion) setSuggestion(null); updateResumo(e.target.value); }}
      />

      {loading && (
        <div className="mt-3 text-sm text-neutral-500 flex items-center gap-2">
          <span className="inline-block h-3 w-3 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
          IA melhorando seu resumo...
        </div>
      )}
      {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}

      {suggestion && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm font-semibold text-green-800 mb-2">✅ Sugestão da IA:</p>
          <p className="text-sm text-neutral-800 leading-relaxed mb-4">{suggestion}</p>
          <div className="flex gap-3">
            <button onClick={() => { updateResumo(suggestion); setLocal(suggestion); setSuggestion(null); }}
              className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800">
              Aceitar Sugestão
            </button>
            <button onClick={() => setSuggestion(null)} className="px-4 py-2 bg-neutral-200 rounded-lg text-sm hover:bg-neutral-300">
              Descartar
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <Link href="/br/curriculo/formacao" className="px-6 py-2 bg-neutral-200 rounded-lg text-sm hover:bg-neutral-300">← Passo 4</Link>
        <Link href="/br/curriculo/preview" className="px-6 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800">Visualizar →</Link>
      </div>
    </div>
  );
}
