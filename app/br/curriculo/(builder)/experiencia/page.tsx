"use client";

import { useBrResumeStore } from "@/app/store/useBrResumeStore";
import Link from "next/link";

export default function BrExperienciaPage() {
  const { experiencia, addExperiencia, removeExperiencia, updateExperienciaField, addResponsabilidade, updateResponsabilidade } = useBrResumeStore();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <p className="text-sm text-neutral-500 mb-1">Passo 3 de 6 — Experiência Profissional</p>
      <h1 className="text-2xl font-semibold mb-6">Experiência Profissional</h1>

      <div className="space-y-6">
        {experiencia.map((exp: any) => (
          <div key={exp.id} className="bg-white border rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-neutral-700">{exp.cargo || "Nova Experiência"}</h3>
              {experiencia.length > 1 && (
                <button onClick={() => removeExperiencia(exp.id)} className="text-red-500 text-sm hover:underline">Remover</button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Cargo / Função</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="ex: Mestre de Obras, Técnico Elétrico" value={exp.cargo} onChange={e => updateExperienciaField(exp.id, "cargo", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Empresa</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nome da empresa" value={exp.empresa} onChange={e => updateExperienciaField(exp.id, "empresa", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Data de Início (DD/MM/AAAA)</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="03/2020" value={exp.dataInicio} onChange={e => updateExperienciaField(exp.id, "dataInicio", e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Data de Saída (ou "Atual")</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Atual" value={exp.dataFim} onChange={e => updateExperienciaField(exp.id, "dataFim", e.target.value)} /></div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-2 text-neutral-500">Responsabilidades / Atividades</label>
              <div className="space-y-2">
                {exp.responsabilidades.map((r: any, i: number) => (
                  <input key={r.id} className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="ex: Gerenciei equipe de 10 pedreiros em obra comercial de R$ 2MM"
                    value={r.text} onChange={e => updateResponsabilidade(exp.id, i, e.target.value)} />
                ))}
                <button onClick={() => addResponsabilidade(exp.id)}
                  className="w-full py-2 border-dashed border-2 border-neutral-300 rounded-lg text-sm text-neutral-400 hover:border-green-400 hover:text-green-700 transition">
                  + Adicionar Atividade
                </button>
              </div>
            </div>
          </div>
        ))}
        <button onClick={() => addExperiencia()}
          className="w-full py-3 border-2 border-dashed border-neutral-300 rounded-xl text-sm text-neutral-500 hover:border-green-500 hover:text-green-700 transition">
          + Adicionar Outra Experiência
        </button>
      </div>

      <div className="flex justify-between mt-8">
        <Link href="/br/curriculo/habilidades" className="px-6 py-2 bg-neutral-200 rounded-lg text-sm hover:bg-neutral-300">← Passo 2</Link>
        <Link href="/br/curriculo/formacao" className="px-6 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800">Passo 4: Formação →</Link>
      </div>
    </div>
  );
}
