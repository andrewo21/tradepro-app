"use client";

import { useBrResumeStore } from "@/app/store/useBrResumeStore";
import Link from "next/link";

export default function BrHabilidadesPage() {
  const { habilidades, addHabilidade, updateHabilidade, removeHabilidade } = useBrResumeStore();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <p className="text-sm text-neutral-500 mb-1">Passo 2 de 6 — Habilidades</p>
      <h1 className="text-2xl font-semibold mb-2">Habilidades Profissionais</h1>
      <p className="text-sm text-neutral-500 mb-6">Adicione suas habilidades técnicas e profissionais. Pode usar gírias ou abreviações — a IA vai melhorar o texto.</p>

      <div className="bg-white border rounded-xl p-6 space-y-3">
        {habilidades.map((s: any, i: number) => (
          <div key={i} className="flex gap-2">
            <input
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
              placeholder={`ex: Instalação elétrica, Solda MIG, Operação de guindaste`}
              value={s.text}
              onChange={e => updateHabilidade(i, e.target.value)}
            />
            <button onClick={() => removeHabilidade(i)} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm">✕</button>
          </div>
        ))}
        <button onClick={() => addHabilidade()} className="w-full py-2 border-2 border-dashed border-neutral-300 rounded-lg text-sm text-neutral-500 hover:border-green-400 hover:text-green-700 transition">
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
