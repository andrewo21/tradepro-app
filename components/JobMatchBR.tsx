"use client";

import { useState } from "react";
import { useBrResumeStore } from "@/app/store/useBrResumeStore";

interface ResultadoAnalise {
  palavrasAusentes: string[];
  palavrasPresentes: string[];
  resumoOtimizado: string;
  sugestoesBullets: string[];
  habilidadesParaAdicionar: string[];
}

export default function JobMatchBR() {
  const { resumoProfissional, habilidades, experiencia, setField, updateResumo, addHabilidade } = useBrResumeStore();
  const [descricaoVaga, setDescricaoVaga] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ResultadoAnalise | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aberto, setAberto] = useState(false);
  const [aplicado, setAplicado] = useState<{ resumo: boolean; habilidades: boolean }>({ resumo: false, habilidades: false });

  async function handleAnalisar() {
    if (!descricaoVaga.trim()) return;
    setLoading(true);
    setErro(null);
    setResultado(null);
    setAplicado({ resumo: false, habilidades: false });
    try {
      const res = await fetch("/api/ai/br/match-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricaoVaga, resumoAtual: resumoProfissional, habilidades, experiencia }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "Análise falhou");
      setResultado(data);
    } catch (err: any) {
      setErro(err?.message || "Algo deu errado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function aplicarResumo() {
    if (!resultado?.resumoOtimizado) return;
    updateResumo(resultado.resumoOtimizado);
    setAplicado(prev => ({ ...prev, resumo: true }));
  }

  function aplicarHabilidades() {
    if (!resultado?.habilidadesParaAdicionar?.length) return;
    resultado.habilidadesParaAdicionar.forEach(habilidade => {
      const jaExiste = habilidades.some((h: any) =>
        (h.text || h).toLowerCase().includes(habilidade.toLowerCase().split(" ")[0])
      );
      if (!jaExiste) addHabilidade(habilidade);
    });
    setAplicado(prev => ({ ...prev, habilidades: true }));
  }

  function aplicarTudo() {
    aplicarResumo();
    aplicarHabilidades();
  }

  const total = (resultado?.palavrasAusentes.length || 0) + (resultado?.palavrasPresentes.length || 0);
  const pontuacao = total > 0 ? Math.round(((resultado?.palavrasPresentes.length || 0) / total) * 100) : 0;
  const pontuacaoProjetada = total > 0
    ? Math.min(100, Math.round((((resultado?.palavrasPresentes.length || 0) + (resultado?.habilidadesParaAdicionar?.length || 0)) / total) * 100))
    : 0;

  return (
    <div className="border border-green-200 rounded-xl bg-green-50 overflow-hidden">

      {/* Cabeçalho */}
      <button onClick={() => setAberto(!aberto)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-green-100 transition">
        <div className="flex items-center gap-3">
          <span className="text-xl">🎯</span>
          <div>
            <p className="font-bold text-green-900 text-sm">Otimizador para Vagas (ATS)</p>
            <p className="text-green-700 text-xs">Cole a descrição da vaga — a IA reescreve seu currículo para passar pelo filtro automático</p>
          </div>
        </div>
        <span className="text-green-400 text-lg">{aberto ? "▲" : "▼"}</span>
      </button>

      {aberto && (
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

          {erro && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">{erro}</p>}

          {resultado && (
            <div className="space-y-4">

              {/* Chips de palavras-chave */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {resultado.palavrasAusentes.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-2">
                      ⚠ Palavras Ausentes ({resultado.palavrasAusentes.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {resultado.palavrasAusentes.map((kw, i) => (
                        <span key={i} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
                {resultado.palavrasPresentes.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">
                      ✓ Já Presentes ({resultado.palavrasPresentes.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {resultado.palavrasPresentes.map((kw, i) => (
                        <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Barra de compatibilidade */}
              {total > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-neutral-600 mb-1">
                    <span>Compatibilidade com a vaga</span>
                    <span className="font-bold">
                      {pontuacao}% agora
                      {pontuacaoProjetada > pontuacao && (
                        <span className="text-green-600"> → {pontuacaoProjetada}% após aplicar</span>
                      )}
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600 rounded-full transition-all" style={{ width: `${pontuacao}%` }} />
                  </div>
                </div>
              )}

              {/* ── APLICAR MELHORIAS ── */}
              {(resultado.resumoOtimizado || resultado.habilidadesParaAdicionar?.length > 0) && (
                <div className="bg-white border-2 border-green-400 rounded-xl p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✦</span>
                    <p className="font-bold text-green-900 text-sm">Aplicar Melhorias ao Seu Currículo</p>
                  </div>

                  {/* Resumo otimizado */}
                  {resultado.resumoOtimizado && (
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs font-bold text-green-800 uppercase tracking-wide mb-1">Resumo Otimizado</p>
                      <p className="text-xs text-neutral-700 leading-relaxed mb-3 line-clamp-3">{resultado.resumoOtimizado}</p>
                      <button onClick={aplicarResumo} disabled={aplicado.resumo}
                        className={`w-full py-2 rounded-lg text-sm font-semibold transition ${
                          aplicado.resumo
                            ? "bg-green-100 text-green-700 cursor-default"
                            : "bg-green-700 hover:bg-green-800 text-white"
                        }`}>
                        {aplicado.resumo ? "✓ Resumo Aplicado" : "Aplicar Resumo Otimizado"}
                      </button>
                    </div>
                  )}

                  {/* Habilidades para adicionar */}
                  {resultado.habilidadesParaAdicionar?.length > 0 && (
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs font-bold text-green-800 uppercase tracking-wide mb-1">
                        Habilidades para Adicionar ({resultado.habilidadesParaAdicionar.length} compatíveis com sua experiência)
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {resultado.habilidadesParaAdicionar.map((h, i) => (
                          <span key={i} className="text-xs bg-green-100 text-green-800 border border-green-300 px-2 py-0.5 rounded-full font-medium">
                            + {h}
                          </span>
                        ))}
                      </div>
                      <button onClick={aplicarHabilidades} disabled={aplicado.habilidades}
                        className={`w-full py-2 rounded-lg text-sm font-semibold transition ${
                          aplicado.habilidades
                            ? "bg-green-100 text-green-700 cursor-default"
                            : "bg-green-700 hover:bg-green-800 text-white"
                        }`}>
                        {aplicado.habilidades ? "✓ Habilidades Adicionadas" : "Adicionar Habilidades ao Currículo"}
                      </button>
                    </div>
                  )}

                  {/* Aplicar tudo */}
                  {resultado.resumoOtimizado && resultado.habilidadesParaAdicionar?.length > 0 && (
                    <button
                      onClick={aplicarTudo}
                      disabled={aplicado.resumo && aplicado.habilidades}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition ${
                        aplicado.resumo && aplicado.habilidades
                          ? "bg-green-100 text-green-700 cursor-default"
                          : "bg-neutral-900 hover:bg-neutral-800 text-white"
                      }`}
                    >
                      {aplicado.resumo && aplicado.habilidades
                        ? "✓ Todas as Melhorias Aplicadas — Baixe Seu Currículo"
                        : "⚡ Aplicar Tudo — Maximizar Minha Pontuação"}
                    </button>
                  )}

                  {(aplicado.resumo || aplicado.habilidades) && (
                    <p className="text-xs text-center text-green-700 font-medium">
                      Alterações aplicadas ao seu currículo. Revise as seções de Habilidades e Resumo antes de baixar.
                    </p>
                  )}
                </div>
              )}

              {/* Sugestões de atividades */}
              {resultado.sugestoesBullets?.length > 0 && (
                <div className="bg-white border border-green-200 rounded-lg p-4">
                  <p className="text-xs font-bold text-green-900 uppercase tracking-wide mb-2">
                    💡 Atividades Sugeridas para Adicionar Manualmente
                  </p>
                  <ul className="space-y-2">
                    {resultado.sugestoesBullets.map((s, i) => (
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
