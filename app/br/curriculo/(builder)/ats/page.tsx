"use client";

import { useState } from "react";
import { useBrResumeStore } from "@/app/store/useBrResumeStore";
import Link from "next/link";

type Mode = "general" | "with_job";

interface ATSResult {
  mode: string;
  final_ats_score: number | null;
  strength_label: string;
  structure_score: number;
  skills_coverage_score?: number;
  semantic_match_score?: number;
  skills_found?: string[];
  skills_missing?: string[];
  suggestions_pt_br: string[];
}

function labelStyle(label: string) {
  if (label === "Forte") return { ring: "border-green-500", bg: "bg-green-50", color: "text-green-800", bar: "#16a34a" };
  if (label === "Mediano") return { ring: "border-amber-400", bg: "bg-amber-50", color: "text-amber-800", bar: "#d97706" };
  return { ring: "border-red-400", bg: "bg-red-50", color: "text-red-700", bar: "#dc2626" };
}

/** Build a plain-text representation of the resume from the BR store */
function buildResumeText(store: any): string {
  const p = store.personalInfo || {};
  const parts: string[] = [];

  const name = [p.nome, p.sobrenome].filter(Boolean).join(" ");
  if (name) parts.push(`Nome: ${name}`);
  if (p.tituloProfissional) parts.push(`Cargo atual: ${p.tituloProfissional}`);
  if (p.cidade || p.estado) parts.push(`Localização: ${[p.cidade, p.estado].filter(Boolean).join(", ")}`);

  if (store.resumoProfissional?.trim()) {
    parts.push(`\nResumo Profissional:\n${store.resumoProfissional}`);
  }

  const tecnicas = (store.habilidadesTecnicas || []).map((h: any) => h.text || h).filter(Boolean);
  const comportamentais = (store.habilidadesComportamentais || []).map((h: any) => h.text || h).filter(Boolean);
  const idiomas = (store.idiomas || []).map((h: any) => h.text || h).filter(Boolean);
  if (tecnicas.length) parts.push(`\nHabilidades Técnicas: ${tecnicas.join(", ")}`);
  if (comportamentais.length) parts.push(`Habilidades Comportamentais: ${comportamentais.join(", ")}`);
  if (idiomas.length) parts.push(`Idiomas: ${idiomas.join(", ")}`);

  if (store.experiencia?.length) {
    parts.push("\nExperiência Profissional:");
    store.experiencia.forEach((exp: any) => {
      const dates = [exp.dataInicio, exp.dataFim].filter(Boolean).join(" – ");
      parts.push(`${exp.cargo} | ${exp.empresa}${dates ? ` (${dates})` : ""}`);
      if (exp.roleSummary) parts.push(exp.roleSummary);
      (exp.responsabilidades || []).forEach((r: any) => {
        const text = r.text || r;
        if (text) parts.push(`• ${text}`);
      });
    });
  }

  if (store.formacao?.length) {
    parts.push("\nFormação:");
    store.formacao.forEach((f: any) => {
      parts.push(`${f.curso} — ${f.instituicao}`);
    });
  }

  const certs = (store.cursosCertificacoes || []).filter((c: any) => c.nome).map((c: any) => c.nome);
  if (certs.length) parts.push(`\nCertificações: ${certs.join(", ")}`);

  return parts.join("\n");
}

export default function BrATSStepPage() {
  const store = useBrResumeStore();
  const [mode, setMode] = useState<Mode>("general");
  const [jobText, setJobText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setLoading(true); setError(null); setResult(null);

    const resumeText = buildResumeText(store);
    if (!resumeText.trim()) {
      setError("Preencha pelo menos suas informações pessoais e experiência antes de analisar.");
      setLoading(false);
      return;
    }

    const payload: any = { resumeText };
    if (mode === "with_job") {
      if (!jobText.trim()) {
        setError("Cole a descrição da vaga para comparar.");
        setLoading(false);
        return;
      }
      payload.jobDescription = jobText;
    }

    try {
      const res = await fetch("/api/ai/br/ats-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Análise falhou.");
      setResult(json);
    } catch (e: any) {
      setError(e.message || "Erro ao analisar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const styles = result ? labelStyle(result.strength_label) : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <p className="text-sm text-neutral-500 mb-1">Passo 6 de 7 — Análise ATS</p>
      <h1 className="text-2xl font-semibold mb-1">Análise ATS do Currículo</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Descubra se seu currículo passa pelo filtro automático das empresas e o que melhorar.
        Esta etapa é <strong>opcional</strong> — você pode ir direto para a visualização final.
      </p>

      {/* Mode selector */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button onClick={() => { setMode("general"); setResult(null); }}
          className={`px-4 py-4 rounded-xl border-2 text-left transition ${
            mode === "general" ? "border-green-600 bg-green-50" : "border-neutral-200 bg-white hover:border-green-300"
          }`}>
          <p className="font-semibold text-sm text-neutral-900">📋 Avaliação geral</p>
          <p className="text-xs text-neutral-500 mt-1">Analisa a força do currículo sem precisar de uma vaga específica.</p>
        </button>
        <button onClick={() => { setMode("with_job"); setResult(null); }}
          className={`px-4 py-4 rounded-xl border-2 text-left transition ${
            mode === "with_job" ? "border-green-600 bg-green-50" : "border-neutral-200 bg-white hover:border-green-300"
          }`}>
          <p className="font-semibold text-sm text-neutral-900">🎯 Comparar com uma vaga</p>
          <p className="text-xs text-neutral-500 mt-1">Cole a descrição da vaga e veja sua pontuação ATS completa.</p>
        </button>
      </div>

      {/* Job description input — only in with_job mode */}
      {mode === "with_job" && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 mb-5">
          <label className="block font-semibold text-sm text-neutral-800 mb-2">Descrição da Vaga</label>
          <textarea
            className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm resize-none h-40 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Cole aqui o texto completo da vaga para a qual quer se candidatar..."
            value={jobText}
            onChange={e => setJobText(e.target.value)}
          />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">{error}</div>
      )}

      <button onClick={handleAnalyze} disabled={loading}
        className="w-full py-4 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 transition disabled:opacity-60 text-base mb-8">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Analisando com IA…
          </span>
        ) : "✦ Analisar Meu Currículo"}
      </button>

      {/* Results */}
      {result && styles && (
        <div className="space-y-5 mb-8">

          {/* Score card */}
          <div className={`rounded-2xl border-2 p-6 ${styles.ring} ${styles.bg}`}>
            <div className="flex items-center gap-5 mb-5">
              <div className="text-5xl font-bold" style={{ color: styles.bar }}>
                {result.final_ats_score !== null ? result.final_ats_score : result.structure_score}
              </div>
              <div>
                <span className={`inline-block font-bold px-3 py-1 rounded-full text-sm ${styles.color} bg-white border`}
                  style={{ borderColor: styles.bar }}>
                  {result.strength_label}
                </span>
                <p className="text-xs text-neutral-500 mt-1.5">
                  {result.mode === "with_job" ? "Pontuação ATS contra a vaga" : "Avaliação geral do currículo"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: "Estrutura do currículo", value: result.structure_score },
                ...(result.skills_coverage_score !== undefined ? [{ label: "Cobertura de habilidades", value: result.skills_coverage_score }] : []),
                ...(result.semantic_match_score !== undefined ? [{ label: "Alinhamento com a vaga", value: result.semantic_match_score }] : []),
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm text-neutral-700 mb-1">
                    <span>{label}</span><span className="font-semibold">{Math.round(value)}%</span>
                  </div>
                  <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: styles.bar }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          {result.mode === "with_job" && (result.skills_found?.length || result.skills_missing?.length) && (
            <div className="grid grid-cols-2 gap-3">
              {result.skills_found?.length ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="font-semibold text-green-800 text-xs uppercase mb-2">✓ Encontradas</p>
                  <ul className="space-y-1">{result.skills_found.map((s, i) => <li key={i} className="text-xs text-green-700">• {s}</li>)}</ul>
                </div>
              ) : null}
              {result.skills_missing?.length ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="font-semibold text-amber-800 text-xs uppercase mb-2">⚠ Faltando</p>
                  <ul className="space-y-1">{result.skills_missing.map((s, i) => <li key={i} className="text-xs text-amber-700">• {s}</li>)}</ul>
                </div>
              ) : null}
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions_pt_br?.length > 0 && (
            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <h3 className="font-semibold text-neutral-800 mb-3 text-sm">💡 Sugestões de melhoria</h3>
              <ol className="space-y-3">
                {result.suggestions_pt_br.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-neutral-700">
                    <span className="text-green-700 font-bold flex-shrink-0">{i + 1}.</span>{s}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-4">
        <Link href="/br/curriculo/resumo" className="px-6 py-2 bg-neutral-200 rounded-lg text-sm hover:bg-neutral-300">← Passo 5</Link>
        <Link href="/br/curriculo/preview" className="px-6 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800">
          Passo 7: Visualização Final →
        </Link>
      </div>
    </div>
  );
}
