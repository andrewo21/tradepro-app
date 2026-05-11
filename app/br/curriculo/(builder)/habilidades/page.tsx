"use client";

import { useState } from "react";
import { useBrResumeStore } from "@/app/store/useBrResumeStore";
import Link from "next/link";

type SkillField = "habilidadesTecnicas" | "habilidadesComportamentais";

export default function BrHabilidadesPage() {
  const store = useBrResumeStore();
  const habilidadesTecnicas = store.habilidadesTecnicas || [];
  const habilidadesComportamentais = store.habilidadesComportamentais || [];
  const [rewriting, setRewriting] = useState<{ field: SkillField; index: number } | null>(null);

  async function handleRewrite(field: SkillField, index: number) {
    const arr = field === "habilidadesTecnicas" ? habilidadesTecnicas : habilidadesComportamentais;
    const skill = arr[index];
    if (!skill?.text?.trim()) return;
    setRewriting({ field, index });
    try {
      const res = await fetch("/api/ai/br/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: skill.text, type: "habilidade" }),
      });
      const data = await res.json();
      if (data.suggestion) {
        const updated = [...arr];
        updated[index] = { ...updated[index], suggestion: data.suggestion };
        store.setField(field, updated);
      }
    } catch { /* silent */ }
    finally { setRewriting(null); }
  }

  function acceptSuggestion(field: SkillField, index: number) {
    const arr = field === "habilidadesTecnicas" ? habilidadesTecnicas : habilidadesComportamentais;
    const updated = [...arr];
    updated[index] = { ...updated[index], text: updated[index].suggestion, suggestion: null };
    store.setField(field, updated);
  }

  function discardSuggestion(field: SkillField, index: number) {
    const arr = field === "habilidadesTecnicas" ? habilidadesTecnicas : habilidadesComportamentais;
    const updated = [...arr];
    updated[index] = { ...updated[index], suggestion: null };
    store.setField(field, updated);
  }

  function updateText(field: SkillField, index: number, text: string) {
    const arr = field === "habilidadesTecnicas" ? habilidadesTecnicas : habilidadesComportamentais;
    const updated = [...arr];
    if (updated[index]) updated[index] = { ...updated[index], text, suggestion: null };
    store.setField(field, updated);
  }

  function addSkill(field: SkillField) {
    const arr = field === "habilidadesTecnicas" ? habilidadesTecnicas : habilidadesComportamentais;
    store.setField(field, [...arr, { text: "", suggestion: null, loading: false }]);
  }

  function removeSkill(field: SkillField, index: number) {
    const arr = field === "habilidadesTecnicas" ? habilidadesTecnicas : habilidadesComportamentais;
    store.setField(field, arr.filter((_: any, i: number) => i !== index));
  }

  function SkillSection({ field, title, subtitle, placeholder }: {
    field: SkillField; title: string; subtitle: string; placeholder: string;
  }) {
    const arr = field === "habilidadesTecnicas" ? habilidadesTecnicas : habilidadesComportamentais;
    return (
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
          <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="space-y-3">
          {arr.map((s: any, i: number) => (
            <div key={i} className="space-y-2">
              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  placeholder={placeholder}
                  value={s.text}
                  onChange={e => updateText(field, i, e.target.value)}
                />
                <button
                  onClick={() => handleRewrite(field, i)}
                  disabled={rewriting !== null || !s.text?.trim()}
                  className="px-3 py-2 bg-green-700 text-white rounded-lg text-xs font-semibold hover:bg-green-800 disabled:opacity-40 whitespace-nowrap"
                >
                  {rewriting?.field === field && rewriting?.index === i ? "IA..." : "✦ Melhorar"}
                </button>
                <button
                  onClick={() => removeSkill(field, i)}
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
                    <button onClick={() => acceptSuggestion(field, i)}
                      className="px-3 py-1 bg-green-700 text-white rounded text-xs font-medium hover:bg-green-800">
                      Aceitar
                    </button>
                    <button onClick={() => discardSuggestion(field, i)}
                      className="px-3 py-1 bg-neutral-200 rounded text-xs hover:bg-neutral-300">
                      Descartar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={() => addSkill(field)}
          className="w-full py-2 border-2 border-dashed border-neutral-300 rounded-lg text-sm text-neutral-500 hover:border-green-400 hover:text-green-700 transition"
        >
          + Adicionar {title}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <p className="text-sm text-neutral-500 mb-1">Passo 2 de 6 — Habilidades</p>
      <h1 className="text-2xl font-semibold mb-2">Habilidades Profissionais</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Digite suas habilidades em qualquer formato — gíria, abreviação, qualquer idioma.
        A IA transforma em linguagem profissional.
      </p>

      <div className="space-y-6">
        <SkillSection
          field="habilidadesTecnicas"
          title="Habilidades Técnicas"
          subtitle="Ferramentas, softwares, sistemas, idiomas, certificações, equipamentos"
          placeholder="ex: Excel avançado, Python, NR-10, Autocad, inglês intermediário..."
        />
        <SkillSection
          field="habilidadesComportamentais"
          title="Habilidades Comportamentais"
          subtitle="Comunicação, liderança, trabalho em equipe, resolução de problemas"
          placeholder="ex: trabalho bem em equipe, organizado, pontual, liderança..."
        />
      </div>

      <div className="flex justify-between mt-8">
        <Link href="/br/curriculo/pessoal" className="px-6 py-2 bg-neutral-200 rounded-lg text-sm hover:bg-neutral-300">← Passo 1</Link>
        <Link href="/br/curriculo/experiencia" className="px-6 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800">Passo 3: Experiência →</Link>
      </div>
    </div>
  );
}
