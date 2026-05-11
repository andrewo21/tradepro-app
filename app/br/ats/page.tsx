"use client";

import { useState, useRef } from "react";
import Link from "next/link";

type Mode = "with_job" | "general";
type Status = "idle" | "loading" | "done" | "error";

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

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm text-neutral-600 mb-1">
        <span>{label}</span>
        <span className="font-semibold">{Math.round(value)}%</span>
      </div>
      <div className="h-2.5 bg-neutral-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function labelColor(label: string) {
  if (label === "Forte") return "bg-green-100 text-green-800";
  if (label === "Mediano") return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-700";
}

export default function BrATSPage() {
  const [mode, setMode] = useState<Mode>("general");
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [profession, setProfession] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ATSResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);

  async function handleFileUpload(file: File) {
    setParsing(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/ai/parse-resume", { method: "POST", body: form });
      const json = await res.json();
      if (json.data) {
        const d = json.data;
        const parts = [
          d.summary ? `Resumo: ${d.summary}` : "",
          (d.experience || []).map((e: any) => [
            `${e.jobTitle} | ${e.company} (${e.startDate}–${e.endDate})`,
            e.roleSummary || "",
            ...(e.responsibilities || []).map((r: string) => `• ${r}`),
          ].filter(Boolean).join("\n")).join("\n\n"),
          d.skills?.length ? `Habilidades: ${d.skills.join(", ")}` : "",
          d.education?.map((edu: any) => `${edu.degree} — ${edu.school}`).join("\n") || "",
        ].filter(Boolean).join("\n\n");
        setResumeText(parts);
        if (d.personalInfo?.tradeTitle && !profession) {
          setProfession(d.personalInfo.tradeTitle);
        }
      }
    } catch { setError("Erro ao processar arquivo."); }
    finally { setParsing(false); }
  }

  async function handleAnalyze() {
    if (!resumeText.trim()) return setError("Cole ou envie o texto do currículo.");
    setStatus("loading"); setError(null); setResult(null);

    const payload: any = {
      resumeText,
      candidateName: "",
    };

    if (mode === "with_job") {
      if (!jobText.trim()) { setError("Cole a descrição da vaga."); setStatus("idle"); return; }
      payload.jobDescription = jobText;
    } else {
      // General mode: enrich with profession context in the resume text
      if (profession.trim()) {
        payload.resumeText = `Profissão / Cargo atual: ${profession}\n\n${resumeText}`;
      }
    }

    try {
      const res = await fetch("/api/ai/br/ats-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Análise falhou");
      setResult(json);
      setStatus("done");
    } catch (e: any) {
      setError(e.message || "Erro ao analisar. Tente novamente.");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <Link href="/br" className="text-sm text-green-600 hover:underline">← Início</Link>
          <h1 className="text-2xl font-bold text-neutral-900 mt-2 mb-1">Análise ATS do Currículo</h1>
          <p className="text-neutral-600 text-sm">
            Descubra se seu currículo passa pelo filtro automático das empresas — e exatamente o que melhorar.
          </p>
        </div>

        {/* Mode selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setMode("general")}
            className={`px-4 py-4 rounded-xl border-2 text-left transition ${
              mode === "general"
                ? "border-green-600 bg-green-50"
                : "border-neutral-200 bg-white hover:border-green-300"
            }`}
          >
            <p className="font-semibold text-sm text-neutral-900">📋 Avaliar meu currículo</p>
            <p className="text-xs text-neutral-500 mt-1">
              Sem vaga específica — a IA analisa a força geral do currículo para a sua área.
            </p>
          </button>
          <button
            onClick={() => setMode("with_job")}
            className={`px-4 py-4 rounded-xl border-2 text-left transition ${
              mode === "with_job"
                ? "border-green-600 bg-green-50"
                : "border-neutral-200 bg-white hover:border-green-300"
            }`}
          >
            <p className="font-semibold text-sm text-neutral-900">🎯 Comparar com uma vaga</p>
            <p className="text-xs text-neutral-500 mt-1">
              Cole a descrição da vaga — veja alinhamento, habilidades faltando e pontuação ATS completa.
            </p>
          </button>
        </div>

        <div className="space-y-5">

          {/* Resume input */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="font-semibold text-sm text-neutral-800">Currículo</label>
              <div className="flex gap-2">
                {parsing && <span className="text-xs text-green-600 animate-pulse">Lendo arquivo…</span>}
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={parsing}
                  className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs text-neutral-600 hover:bg-neutral-50 transition disabled:opacity-50"
                >
                  📎 Enviar PDF ou Word
                </button>
                <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
              </div>
            </div>
            <textarea
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm resize-none h-48 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Cole aqui o texto completo do currículo — ou envie o arquivo acima para preencher automaticamente."
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
            />
          </div>

          {/* General mode: profession field */}
          {mode === "general" && (
            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <label className="block font-semibold text-sm text-neutral-800 mb-1">
                Qual é a sua área ou profissão? <span className="text-neutral-400 font-normal">(opcional, mas melhora a análise)</span>
              </label>
              <input
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="ex: Analista de Marketing, Eletricista, Enfermeiro, Técnico em TI..."
                value={profession}
                onChange={e => setProfession(e.target.value)}
              />
              <p className="text-xs text-neutral-400 mt-2">
                A IA usa sua área para dar sugestões mais relevantes — mesmo sem uma vaga específica.
              </p>
            </div>
          )}

          {/* With job mode: job description field */}
          {mode === "with_job" && (
            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <label className="block font-semibold text-sm text-neutral-800 mb-3">
                Descrição da Vaga
              </label>
              <textarea
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm resize-none h-40 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Cole aqui o texto completo da vaga para a qual quer se candidatar..."
                value={jobText}
                onChange={e => setJobText(e.target.value)}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={status === "loading"}
            className="w-full py-4 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 transition disabled:opacity-60 text-base"
          >
            {status === "loading" ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analisando com IA…
              </span>
            ) : "✦ Analisar Currículo"}
          </button>

        </div>

        {/* Results */}
        {status === "done" && result && (
          <div className="mt-10 space-y-6">

            {/* Score card */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-5 mb-6">
                {result.final_ats_score !== null ? (
                  <div className="text-6xl font-bold text-green-700">{result.final_ats_score}</div>
                ) : (
                  <div className="text-6xl font-bold text-neutral-400">—</div>
                )}
                <div>
                  <span className={`inline-block text-sm font-bold px-3 py-1 rounded-full ${labelColor(result.strength_label)}`}>
                    {result.strength_label}
                  </span>
                  <p className="text-xs text-neutral-500 mt-1">
                    {result.mode === "with_job" ? "Pontuação ATS contra a vaga" : "Avaliação geral do currículo"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <ScoreBar label="Estrutura do currículo" value={result.structure_score} color="bg-green-500" />
                {result.skills_coverage_score !== undefined && (
                  <ScoreBar label="Cobertura de habilidades" value={result.skills_coverage_score} color="bg-blue-500" />
                )}
                {result.semantic_match_score !== undefined && (
                  <ScoreBar label="Alinhamento com a vaga" value={result.semantic_match_score} color="bg-amber-500" />
                )}
              </div>
            </div>

            {/* Skills found/missing */}
            {result.mode === "with_job" && (result.skills_found?.length || result.skills_missing?.length) && (
              <div className="grid sm:grid-cols-2 gap-4">
                {result.skills_found?.length ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="font-semibold text-green-800 text-sm mb-2">✓ Habilidades encontradas</p>
                    <ul className="space-y-1">
                      {result.skills_found.map((s, i) => (
                        <li key={i} className="text-xs text-green-700">• {s}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {result.skills_missing?.length ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="font-semibold text-amber-800 text-sm mb-2">⚠ Habilidades faltando</p>
                    <ul className="space-y-1">
                      {result.skills_missing.map((s, i) => (
                        <li key={i} className="text-xs text-amber-700">• {s}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions_pt_br?.length > 0 && (
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-neutral-900 mb-4">💡 Sugestões de melhoria</h3>
                <ul className="space-y-3">
                  {result.suggestions_pt_br.map((s, i) => (
                    <li key={i} className="flex gap-3 text-sm text-neutral-700">
                      <span className="text-green-600 font-bold flex-shrink-0">{i + 1}.</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA */}
            <div className="bg-green-700 rounded-2xl p-6 text-white text-center">
              <p className="font-semibold mb-2">Pronto para criar ou melhorar seu currículo?</p>
              <p className="text-green-200 text-sm mb-4">Use as sugestões acima no criador de currículo da TradePro.</p>
              <Link href="/br/curriculo"
                className="inline-block px-6 py-2.5 bg-white text-green-800 font-semibold rounded-lg hover:bg-green-50 transition text-sm">
                Criar / Editar meu Currículo →
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
