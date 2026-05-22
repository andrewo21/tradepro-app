"use client";

import { useState, useEffect } from "react";
import { useBrResumeStore } from "@/app/store/useBrResumeStore";
import Link from "next/link";

const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];
const ANOS: string[] = Array.from({ length: 50 }, (_, i) => String(new Date().getFullYear() - i));

function parseDataStr(str: string) {
  if (!str) return { mes: "", ano: "", atual: false };
  if (str === "Atual") return { mes: "", ano: "", atual: true };
  const parts = str.trim().split("/");
  if (parts.length >= 2) return { mes: parts[0], ano: parts[1], atual: false };
  return { mes: "", ano: parts[0] || "", atual: false };
}

function buildDataStr(mes: string, ano: string): string {
  if (!mes && !ano) return "";
  if (mes && ano) return `${mes}/${ano}`;
  return ano || mes;
}

interface DataState { mesInicio: string; anoInicio: string; mesFim: string; anoFim: string; atual: boolean; }

export default function BrExperienciaPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { experiencia, addExperiencia, removeExperiencia, updateExperienciaField, addResponsabilidade, updateResponsabilidade, setField } = useBrResumeStore();
  const [rewriting, setRewriting] = useState<{ id: string; idx: number } | null>(null);
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});
  const [datas, setDatas] = useState<Record<string, DataState>>(() => {
    const init: Record<string, DataState> = {};
    experiencia.forEach((exp: any) => {
      const s = parseDataStr(exp.dataInicio);
      const e = parseDataStr(exp.dataFim);
      init[exp.id] = { mesInicio: s.mes, anoInicio: s.ano, mesFim: e.mes, anoFim: e.ano, atual: e.atual };
    });
    return init;
  });

  useEffect(() => {
    setDatas(prev => {
      const next = { ...prev };
      experiencia.forEach((exp: any) => {
        if (!next[exp.id]) next[exp.id] = { mesInicio: "", anoInicio: "", mesFim: "", anoFim: "", atual: false };
      });
      return next;
    });
  }, [experiencia]);

  if (!mounted) return null;

  function setData(expId: string, field: keyof DataState, value: string | boolean) {
    setDatas(prev => {
      const cur = prev[expId] || { mesInicio: "", anoInicio: "", mesFim: "", anoFim: "", atual: false };
      const next = { ...cur, [field]: value };
      updateExperienciaField(expId, "dataInicio", buildDataStr(next.mesInicio, next.anoInicio));
      updateExperienciaField(expId, "dataFim", next.atual ? "Atual" : buildDataStr(next.mesFim, next.anoFim));
      return { ...prev, [expId]: next };
    });
  }

  async function handleRewrite(expId: string, idx: number, text: string) {
    if (!text.trim()) return;
    setRewriting({ id: expId, idx });
    try {
      const res = await fetch("/api/ai/br/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, type: "responsabilidade" }),
      });
      const data = await res.json();
      if (data.suggestion) {
        setSuggestions(prev => ({ ...prev, [`${expId}-${idx}`]: data.suggestion }));
      }
    } catch { /* silent */ }
    finally { setRewriting(null); }
  }

  function acceptSuggestion(expId: string, idx: number) {
    const key = `${expId}-${idx}`;
    updateResponsabilidade(expId, idx, suggestions[key]);
    setSuggestions(prev => { const n = { ...prev }; delete n[key]; return n; });
  }

  function discardSuggestion(expId: string, idx: number) {
    const key = `${expId}-${idx}`;
    setSuggestions(prev => { const n = { ...prev }; delete n[key]; return n; });
  }

  const isRewriting = (id: string, idx: number) => rewriting?.id === id && rewriting?.idx === idx;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <p className="text-sm text-neutral-500 mb-1">Passo 3 de 6 — Experiência Profissional</p>
      <h1 className="text-2xl font-semibold mb-2">Experiência Profissional</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Descreva o que você fez — pode ser informal. Clique em <strong>✦ Melhorar</strong> para a IA reescrever profissionalmente.
      </p>

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
              <div>
                <label className="block text-xs font-medium mb-1 text-neutral-500">Cargo / Função</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="ex: Mestre de Obras, Técnico Elétrico" value={exp.cargo} onChange={e => updateExperienciaField(exp.id, "cargo", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-neutral-500">Empresa</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nome da empresa" value={exp.empresa} onChange={e => updateExperienciaField(exp.id, "empresa", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-neutral-500">Cidade</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="ex: São Paulo" value={exp.cidade || ""} onChange={e => updateExperienciaField(exp.id, "cidade", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-neutral-500">Estado</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="ex: SP" value={exp.estado || ""} onChange={e => updateExperienciaField(exp.id, "estado", e.target.value)} />
              </div>
              {/* Data de Início */}
              <div>
                <label className="block text-xs font-medium mb-1 text-neutral-500">Data de Início</label>
                <div className="flex gap-2">
                  <select value={datas[exp.id]?.mesInicio || ""} onChange={e => setData(exp.id, "mesInicio", e.target.value)}
                    className="flex-1 border rounded-lg px-2 py-2 text-sm bg-white">
                    <option value="">Mês</option>
                    {MESES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select value={datas[exp.id]?.anoInicio || ""} onChange={e => setData(exp.id, "anoInicio", e.target.value)}
                    className="w-24 border rounded-lg px-2 py-2 text-sm bg-white">
                    <option value="">Ano</option>
                    {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              {/* Data de Saída */}
              <div>
                <label className="block text-xs font-medium mb-1 text-neutral-500">Data de Saída</label>
                {datas[exp.id]?.atual ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-neutral-600 font-medium">Atual</span>
                    <button onClick={() => setData(exp.id, "atual", false)} className="text-xs text-green-700 underline">Alterar</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <select value={datas[exp.id]?.mesFim || ""} onChange={e => setData(exp.id, "mesFim", e.target.value)}
                      className="flex-1 border rounded-lg px-2 py-2 text-sm bg-white">
                      <option value="">Mês</option>
                      {MESES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select value={datas[exp.id]?.anoFim || ""} onChange={e => setData(exp.id, "anoFim", e.target.value)}
                      className="w-24 border rounded-lg px-2 py-2 text-sm bg-white">
                      <option value="">Ano</option>
                      {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                )}
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input type="checkbox" checked={datas[exp.id]?.atual || false}
                    onChange={e => setData(exp.id, "atual", e.target.checked)} className="rounded" />
                  <span className="text-xs text-neutral-600">Trabalho aqui atualmente</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-2 text-neutral-500">Responsabilidades / Atividades</label>
              <div className="space-y-3">
                {exp.responsabilidades.map((r: any, i: number) => {
                  const key = `${exp.id}-${i}`;
                  return (
                    <div key={r.id} className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          className="flex-1 border rounded-lg px-3 py-2 text-sm"
                          placeholder="ex: gerenciei equipe de 10 pedreiros em obra de R$2MM"
                          value={r.text}
                          onChange={e => updateResponsabilidade(exp.id, i, e.target.value)}
                        />
                        <button
                          onClick={() => handleRewrite(exp.id, i, r.text)}
                          disabled={isRewriting(exp.id, i) || !r.text?.trim()}
                          className="px-3 py-2 bg-green-700 text-white rounded-lg text-xs font-semibold hover:bg-green-800 disabled:opacity-40 whitespace-nowrap"
                        >
                          {isRewriting(exp.id, i) ? "IA..." : "✦ Melhorar"}
                        </button>
                      </div>

                      {suggestions[key] && (
                        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                          <p className="text-xs text-green-800 font-semibold mb-1">✦ Sugestão da IA:</p>
                          <p className="text-sm text-neutral-800 mb-2">{suggestions[key]}</p>
                          <div className="flex gap-2">
                            <button onClick={() => acceptSuggestion(exp.id, i)}
                              className="px-3 py-1 bg-green-700 text-white rounded text-xs font-medium hover:bg-green-800">
                              Aceitar
                            </button>
                            <button onClick={() => discardSuggestion(exp.id, i)}
                              className="px-3 py-1 bg-neutral-200 rounded text-xs hover:bg-neutral-300">
                              Descartar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                <button
                  onClick={() => addResponsabilidade(exp.id)}
                  className="w-full py-2 border-dashed border-2 border-neutral-300 rounded-lg text-sm text-neutral-400 hover:border-green-400 hover:text-green-700 transition"
                >
                  + Adicionar Atividade
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() => addExperiencia()}
          className="w-full py-3 border-2 border-dashed border-neutral-300 rounded-xl text-sm text-neutral-500 hover:border-green-500 hover:text-green-700 transition"
        >
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
