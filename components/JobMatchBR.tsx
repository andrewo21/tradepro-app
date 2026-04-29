"use client";

import { useState } from "react";
import { useBrResumeStore } from "@/app/store/useBrResumeStore";

interface MatchResult {
  palavrasAusentes: string[];
  palavrasPresentes: string[];
  resumoOtimizado: string;
  sugestoesBullets: string[];
}

export default function JobMatchBR() {
  const { resumoProfissional, habilidades, experiencia, setField, updateResumo } = useBrResumeStore();
  const [descricaoVaga, setDescricaoVaga] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleAnalisar() {
    if (!descricaoVaga.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/ai/br/match-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricaoVaga, resumoAtual: resumoProfissional, habilidades, experiencia }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "Análise falhou");
      setResult(data);
    } catch (err: any) {
      setError(err?.message || "Algo deu errado.");
    } finally {
      setLoading(false); }
  }

  function aplicarResumo() {
    if (result?.resumoOtimizado) updateResumo(result.resumoOtimizado);
  }

  const total = (result?.palavrasAusentes.length || 0) + (result?.palavrasPresentes.length || 0);
  const score = total > 0 ? Math.round(((result?.palavrasPresentes.length || 0) / total) * 100) : 0;

  return (
    <div className="border border-green-200 rounded-xl bg-green-50 overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-green-100 transition">
        <div className="flex items-center gap-3">
          <span className="text-xl">🎯</span>
          <div>
            <p className="font-bold text-green-900 text-sm">Otimizador para Vagas (ATS)</p>
            <p className="text-green-700 text-xs">Cole a descrição da vaga — a IA reescreve seu currículo para passar pelo filtro automático</p>
          </div>
        </div>
        <span className="text-green-400 text-lg">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-green-900 mb-1">Cole a Descrição da Vaga</label>
            <textarea
              className="w-full border border-green-200 rounded-lg p-3 text-sm h-36 resize-none focus:ring-2 focus:ring-green-500 focus:outline-none bg-white"
              placeholder="Cole aqui o anúncio completo da vaga — título, requisitos, responsabilidades..."
              value={descricaoVaga}
              onChange={e => setDescricaoVaga(e.target.value)}
            />
          </div>

          <button onClick={handleAnalisar} disabled={loading || !descricaoVaga.trim()}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-lg disabled:opacity-50 transition text-sm">
            {loading ? "Analisando vaga..." : "Analisar e Otimizar Meu Currículo →"}
          </button>

          {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">{error}</p>}

          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.palavrasAusentes.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-2">
                      ⚠ Palavras Ausentes ({result.palavrasAusentes.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.palavrasAusentes.map((kw, i) => (
                        <span key={i} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
                {result.palavrasPresentes.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">
                      ✓ Já Presentes ({result.palavrasPresentes.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.palavrasPresentes.map((kw, i) => (
                        <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {total > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-neutral-600 mb-1">
                    <span>Compatibilidade com a vaga</span>
                    <span className="font-bold">{score}% → <span className="text-green-600">100% após aplicar</span></span>
                  </div>
                  <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600 rounded-full" style={{ width: `${score}%` }} />
                  </div>
                </div>
              )}

              {result.resumoOtimizado && (
                <div className="bg-white border border-green-200 rounded-lg p-4">
                  <p className="text-xs font-bold text-green-900 uppercase tracking-wide mb-2">✦ Resumo Otimizado para ATS</p>
                  <p className="text-sm text-neutral-700 leading-relaxed mb-3">{result.resumoOtimizado}</p>
                  <button onClick={aplicarResumo}
                    className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2 rounded-lg text-sm transition">
                    Aplicar ao Meu Currículo
                  </button>
                </div>
              )}

              {result.sugestoesBullets.length > 0 && (
                <div className="bg-white border border-green-200 rounded-lg p-4">
                  <p className="text-xs font-bold text-green-900 uppercase tracking-wide mb-2">💡 Atividades para Adicionar</p>
                  <ul className="space-y-2">
                    {result.sugestoesBullets.map((s, i) => (
                      <li key={i} className="text-sm text-neutral-700 flex items-start gap-2">
                        <span className="text-green-500 flex-shrink-0 mt-0.5">▸</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
