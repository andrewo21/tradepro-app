"use client";

// Resumo step — o wizard coleta os dados, a IA gera apenas quando solicitado.
// Botão "Gerar com Gringo" chama a API uma única vez.
// O usuário revisa e decide antes de usar.

import { useState, useEffect, useRef } from "react";
import { useBrResumeStore } from "@/app/store/useBrResumeStore";
import Link from "next/link";
import { Sparkles, Check, RotateCcw } from "lucide-react";

export default function BrResumoPage() {
  const store                   = useBrResumeStore();
  const resumoProfissional      = store.resumoProfissional;
  const updateResumo            = store.updateResumo;

  const [local, setLocal]       = useState(resumoProfissional);
  const [aiDraft, setAiDraft]   = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const timer                   = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { setLocal(resumoProfissional); }, [resumoProfissional]);

  // Debounced save on every keystroke
  function handleChange(val: string) {
    setLocal(val);
    setAiDraft(null);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => updateResumo(val), 500);
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setAiDraft(null);
    try {
      const s = useBrResumeStore.getState();
      const res = await fetch("/api/ai/assistant/suggest", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode:     "resume",
          step:     "resumo",
          locale:   "pt-BR",
          firstName: s.personalInfo?.nome,
          jobTitle:  s.personalInfo?.tituloProfissional,
          userMessage: "Escreva um resumo profissional forte com base nos meus dados de currículo.",
          data: {
            personalInfo:   s.personalInfo,
            experiencia:    s.experiencia,
            habilidadesTecnicas:        s.habilidadesTecnicas,
            habilidadesComportamentais: s.habilidadesComportamentais,
            formacao:       s.formacao,
            cursosCertificacoes: s.cursosCertificacoes,
            resumoAtual:    local || "(vazio)",
          },
        }),
      });
      const data = await res.json();
      const draft =
        data.suggestions?.[0]?.preview ||
        (data.message?.length > 40 ? data.message : null);
      if (draft) {
        setAiDraft(draft);
      } else {
        setError("Gringo não conseguiu gerar um resumo agora. Tente novamente.");
      }
    } catch {
      setError("Erro de conexão. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function acceptDraft() {
    if (!aiDraft) return;
    setLocal(aiDraft);
    updateResumo(aiDraft);
    setAiDraft(null);
  }

  const wordCount = local.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <p className="text-sm text-neutral-500 mb-1">Passo 5 de 6 — Resumo Profissional</p>
      <h1 className="text-2xl font-semibold mb-2">Resumo Profissional</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Escreva 2–4 frases sobre você, ou deixe o Gringo gerar um resumo a partir dos seus dados.
        Você revisa antes de usar.
      </p>

      <textarea
        className="w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm h-40 resize-none focus:ring-2 focus:ring-green-500 focus:outline-none bg-white"
        placeholder="ex: Eletricista com 8 anos de experiência em instalações residenciais e comerciais. Liderou equipes de 6 pessoas, entregou projetos abaixo do orçamento. Certificado NR-10..."
        value={local}
        onChange={e => handleChange(e.target.value)}
      />
      <p className="text-xs text-neutral-400 mt-1 mb-4">
        {wordCount} {wordCount === 1 ? "palavra" : "palavras"} (ideal: 40–80)
      </p>

      {/* Gringo Generate button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          {loading ? "Gringo está escrevendo…" : "Gerar com Gringo"}
        </button>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>

      {/* AI draft review */}
      {aiDraft && (
        <div className="mb-6 border border-green-200 rounded-xl bg-green-50 overflow-hidden">
          <div className="px-4 py-2.5 bg-green-700 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-xs font-bold">Gringo gerou — revise antes de usar</span>
          </div>
          <div className="px-4 py-3">
            <p className="text-sm text-gray-800 leading-relaxed italic">&ldquo;{aiDraft}&rdquo;</p>
          </div>
          <div className="flex border-t border-green-100">
            <button
              onClick={acceptDraft}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-green-800 hover:bg-green-100 transition-colors"
            >
              <Check className="w-4 h-4" />
              Usar este resumo
            </button>
            <div className="w-px bg-green-100" />
            <button
              onClick={() => setAiDraft(null)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Manter o meu
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <Link href="/br/curriculo/formacao" className="px-6 py-2 bg-neutral-200 rounded-lg text-sm hover:bg-neutral-300">← Passo 4</Link>
        <Link href="/br/curriculo/ats" onClick={() => updateResumo(local)} className="px-6 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800">Passo 6: Análise →</Link>
      </div>
    </div>
  );
}
