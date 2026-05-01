"use client";

import { useState } from "react";
import { useBrResumeStore } from "@/app/store/useBrResumeStore";
import Link from "next/link";

export default function BrHabilidadesPage() {
  const { habilidades, addHabilidade, updateHabilidade, removeHabilidade, setField } = useBrResumeStore();
  const [rewriting, setRewriting] = useState<number | null>(null);

  async function handleRewrite(index: number) {
    const skill = habilidades[index];
    if (!skill?.text?.trim()) return;
    setRewriting(index);
    try {
      const res = await fetch("/api/ai/br/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: skill.text, type: "habilidade" }),
      });
      const data = await res.json();
      if (data.suggestion) {
        const updated = [...habilidades];
        updated[index] = { ...updated[index], suggestion: data.suggestion };
        setField("habilidades", updated);
      }
    } catch { /* silent */ }
    finally { setRewriting(null); }
  }

  function acceptSuggestion(index: number) {
    const updated = [...habilidades];
    updated[index] = { ...updated[index], text: updated[index].suggestion, suggestion: null };
    setField("habilidades", updated);
  }

  function discardSuggestion(index: number) {
    const updated = [...habilidades];
    updated[index] = { ...updated[index], suggestion: null };
    setField("habilidades", updated);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <p className="text-sm text-neutral-500 mb-1">Passo 2 de 6 — Habilidades</p>
      <h1 className="text-2xl font-semibold mb-2">Habilidades Profissionais</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Digite suas habilidades em qualquer formato — gíria, abreviação, qualquer idioma.
        A IA transforma em linguagem profissional.
      </p>

      <div className="bg-white border rounded-xl p-6 space-y-4">
        {habilidades.map((s: any, i: number) => (
          <div key={i} className="space-y-2">
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
                placeholder="ex: instalo ar condicionado, soldagem MIG, opero guindaste"
                value={s.text}
                onChange={e => updateHabilidade(i, e.target.value)}
              />
              <button
                onClick={() => handleRewrite(i)}
                disabled={rewriting === i || !s.text?.trim()}
                className="px-3 py-2 bg-green-700 text-white rounded-lg text-xs font-semibold hover:bg-green-800 disabled:opacity-40 whitespace-nowrap"
              >
                {rewriting === i ? "IA..." : "✦ Melhorar"}
              </button>
              <button
                onClick={() => removeHabilidade(i)}
                className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            {s.suggestion && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <p className="text-xs text-green-800 font-semibold mb-1">✦ Sugestão da IA:</p>
                <p className="text-sm text-neutral-800 mb-2">{s.suggestion}</p>
                <div className="flex gap-2">
                  <button onClick={() => acceptSuggestion(i)}
                    className="px-3 py-1 bg-green-700 text-white rounded text-xs font-medium hover:bg-green-800">
                    Aceitar
                  </button>
                  <button onClick={() => discardSuggestion(i)}
                    className="px-3 py-1 bg-neutral-200 rounded text-xs hover:bg-neutral-300">
                    Descartar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        <button
          onClick={() => addHabilidade()}
          className="w-full py-2 border-2 border-dashed border-neutral-300 rounded-lg text-sm text-neutral-500 hover:border-green-400 hover:text-green-700 transition"
        >
          + Adicionar Habilidade
        </button>
      </div>

      <div className="flex justify-between mt-8">
        <Link href="/br/curriculo/pessoal" className="px-6 py-2 bg-neutral-200 rounded-lg text-sm hover:bg-neutral-300">← Passo 1</Link>
        <Link href="/br/curriculo/experiencia" className="px-6 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800">Passo 3: Experiência →</Link>
      </div>
    </div>
  );
}
