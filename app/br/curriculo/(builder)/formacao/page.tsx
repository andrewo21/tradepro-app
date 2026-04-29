"use client";

import { useBrResumeStore } from "@/app/store/useBrResumeStore";
import Link from "next/link";

const TIPOS = ["Técnico", "Graduação", "Pós-Graduação", "MBA", "Curso Livre", "Outro"];

export default function BrFormacaoPage() {
  const { formacao, cursosCertificacoes, setField } = useBrResumeStore();

  function updateFormacao(i: number, field: string, value: string) {
    const f = [...formacao];
    f[i] = { ...f[i], [field]: value };
    setField("formacao", f);
  }
  function addFormacao() {
    setField("formacao", [...formacao, { instituicao: "", curso: "", anoConclusao: "", tipo: "Técnico" }]);
  }
  function removeFormacao(i: number) {
    setField("formacao", formacao.filter((_: any, idx: number) => idx !== i));
  }

  function updateCurso(i: number, field: string, value: string) {
    const c = [...cursosCertificacoes];
    c[i] = { ...c[i], [field]: value };
    setField("cursosCertificacoes", c);
  }
  function addCurso() {
    setField("cursosCertificacoes", [...cursosCertificacoes, { nome: "", instituicao: "", ano: "" }]);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <p className="text-sm text-neutral-500 mb-1">Passo 4 de 6 — Formação</p>
      <h1 className="text-2xl font-semibold mb-6">Formação Acadêmica e Cursos</h1>

      {/* Formação */}
      <div className="bg-white border rounded-xl p-6 space-y-4 mb-6">
        <h2 className="font-semibold text-neutral-700">Formação Acadêmica</h2>
        {formacao.map((f: any, i: number) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4 border-b last:border-0">
            <div><label className="block text-xs font-medium mb-1 text-neutral-500">Curso / Área</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Técnico em Eletrotécnica" value={f.curso} onChange={e => updateFormacao(i, "curso", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1 text-neutral-500">Instituição</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="SENAI, SENAC, ETEC..." value={f.instituicao} onChange={e => updateFormacao(i, "instituicao", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1 text-neutral-500">Ano de Conclusão</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="2019" value={f.anoConclusao} onChange={e => updateFormacao(i, "anoConclusao", e.target.value)} /></div>
            <div><label className="block text-xs font-medium mb-1 text-neutral-500">Tipo</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white" value={f.tipo} onChange={e => updateFormacao(i, "tipo", e.target.value)}>
                {TIPOS.map(t => <option key={t}>{t}</option>)}
              </select></div>
            {formacao.length > 1 && (
              <button onClick={() => removeFormacao(i)} className="text-red-500 text-xs hover:underline text-left">Remover</button>
            )}
          </div>
        ))}
        <button onClick={addFormacao} className="w-full py-2 border-dashed border-2 border-neutral-300 rounded-lg text-sm text-neutral-400 hover:border-green-400 hover:text-green-700">
          + Adicionar Formação
        </button>
      </div>

      {/* Cursos e certificações */}
      <div className="bg-white border rounded-xl p-6 space-y-3">
        <h2 className="font-semibold text-neutral-700">Cursos e Certificações</h2>
        {cursosCertificacoes.map((c: any, i: number) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input className="border rounded-lg px-3 py-2 text-sm sm:col-span-1" placeholder="NR-10, NR-35, CREA..." value={c.nome} onChange={e => updateCurso(i, "nome", e.target.value)} />
            <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Instituição" value={c.instituicao} onChange={e => updateCurso(i, "instituicao", e.target.value)} />
            <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Ano" value={c.ano} onChange={e => updateCurso(i, "ano", e.target.value)} />
          </div>
        ))}
        <button onClick={addCurso} className="w-full py-2 border-dashed border-2 border-neutral-300 rounded-lg text-sm text-neutral-400 hover:border-green-400 hover:text-green-700">
          + Adicionar Curso
        </button>
      </div>

      <div className="flex justify-between mt-8">
        <Link href="/br/curriculo/experiencia" className="px-6 py-2 bg-neutral-200 rounded-lg text-sm hover:bg-neutral-300">← Passo 3</Link>
        <Link href="/br/curriculo/resumo" className="px-6 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800">Passo 5: Resumo →</Link>
      </div>
    </div>
  );
}
