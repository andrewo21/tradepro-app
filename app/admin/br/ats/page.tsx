"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const OPERATOR_PASSWORD = process.env.NEXT_PUBLIC_OPERATOR_PASSWORD || "tradepro2026";

interface ATSResult {
  mode: string;
  candidate_name: string | null;
  final_ats_score: number | null;
  strength_label: string;
  structure_score: number;
  skills_coverage_score?: number;
  semantic_match_score?: number;
  skills_found?: string[];
  skills_missing?: string[];
  suggestions_pt_br: string[];
  specific_recommendations?: string[];
  specific_enhancements?: string[];
  profession?: string | null;
  raw_extraction?: any;
}

function labelColor(label: string) {
  if (label === "Forte") return { bg: "bg-green-100", text: "text-green-800", bar: "#16a34a" };
  if (label === "Mediano") return { bg: "bg-amber-100", text: "text-amber-800", bar: "#d97706" };
  return { bg: "bg-red-100", text: "text-red-700", bar: "#dc2626" };
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm text-neutral-600 mb-1">
        <span>{label}</span><span className="font-semibold">{Math.round(value)}%</span>
      </div>
      <div className="h-2.5 bg-neutral-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function AdminATSPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);

  const [candidateName, setCandidateName] = useState("");
  const [profession, setProfession] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [useJob, setUseJob] = useState(false);
  const [date, setDate] = useState(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  });

  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  function handleLogin() {
    if (pw === OPERATOR_PASSWORD) setAuthed(true);
    else setPwError(true);
  }

  async function handleFileUpload(file: File) {
    setParsing(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/ai/parse-resume", { method: "POST", body: form });
      const json = await res.json();
      if (json.data) {
        const d = json.data;
        if (!candidateName && d.personalInfo) {
          const name = [d.personalInfo.firstName, d.personalInfo.lastName].filter(Boolean).join(" ");
          if (name) setCandidateName(name);
        }
        if (!profession && d.personalInfo?.tradeTitle) setProfession(d.personalInfo.tradeTitle);
        const parts = [
          d.summary ? `Resumo: ${d.summary}` : "",
          (d.experience || []).map((e: any) => [
            `${e.jobTitle} | ${e.company} (${e.startDate}–${e.endDate})`,
            e.roleSummary || "",
            ...(e.responsibilities || []).map((r: string) => `• ${r}`),
          ].filter(Boolean).join("\n")).join("\n\n"),
          d.skills?.length ? `Habilidades: ${d.skills.join(", ")}` : "",
          (d.education || []).map((edu: any) => `${edu.degree} — ${edu.school}`).join("\n"),
        ].filter(Boolean).join("\n\n");
        setResumeText(parts);
      }
    } catch { setError("Erro ao processar arquivo."); }
    finally { setParsing(false); }
  }

  async function handleAnalyze() {
    if (!resumeText.trim()) return setError("Adicione o texto do currículo.");
    setLoading(true); setError(null); setResult(null);

    const payload: any = {
      resumeText,
      candidateName: candidateName || null,
      profession: profession.trim() || null,
      date,
    };
    if (useJob && jobText.trim()) payload.jobDescription = jobText;

    try {
      const res = await fetch("/api/ai/br/ats-analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Análise falhou");
      setResult(json);
    } catch (e: any) {
      setError(e.message || "Erro ao analisar.");
    } finally { setLoading(false); }
  }

  async function handleDownloadPDF() {
    if (!result) return;
    setDownloading(true);
    try {
      const res = await fetch("/api/export/pdf", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ats-report",
          locale: "pt-BR",
          candidateName: candidateName || "Candidato",
          profession: profession || "",
          date,
          mode: result.mode,
          final_ats_score: result.final_ats_score,
          strength_label: result.strength_label,
          structure_score: result.structure_score,
          skills_coverage_score: result.skills_coverage_score,
          semantic_match_score: result.semantic_match_score,
          skills_found: result.skills_found || [],
          skills_missing: result.skills_missing || [],
          suggestions_pt_br: result.suggestions_pt_br || [],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.error || "Falha ao gerar PDF");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Analise-ATS-${(candidateName || "curriculo").replace(/\s+/g, "-")}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e: any) { setError(e.message || "Erro ao gerar PDF."); }
    finally { setDownloading(false); }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h1 className="text-xl font-bold mb-1">Área do Operador</h1>
          <p className="text-sm text-neutral-500 mb-6">TradePro Brasil — Análise ATS</p>
          <input type="password" placeholder="Senha" value={pw}
            onChange={e => { setPw(e.target.value); setPwError(false); }}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            className="w-full border rounded-lg px-4 py-3 text-sm mb-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
          {pwError && <p className="text-red-600 text-xs mb-3">Senha incorreta.</p>}
          <button onClick={handleLogin} className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800">Entrar</button>
          <Link href="/admin/br" className="block mt-4 text-xs text-neutral-400 hover:text-neutral-600">← Voltar ao Gerador de Currículo</Link>
        </div>
      </div>
    );
  }

  const colors = result ? labelColor(result.strength_label) : null;

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <div className="bg-green-800 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">🇧🇷 TradePro — Análise ATS</h1>
          <p className="text-green-200 text-xs">Área do Operador · Gere o relatório e envie pelo WhatsApp</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/br" className="text-green-200 text-sm hover:text-white">← Currículo</Link>
          <Link href="/admin/br/carta" className="text-green-200 text-sm hover:text-white">✉️ Carta</Link>
          <button onClick={() => setAuthed(false)} className="text-green-200 text-sm hover:text-white">Sair</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT — Form */}
        <div className="space-y-5">

          {/* Candidate info */}
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">Dados do Candidato</h2>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Nome do Candidato</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nome completo"
                  value={candidateName} onChange={e => setCandidateName(e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Profissão / Área</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="ex: Analista de Marketing, Eletricista..."
                  value={profession} onChange={e => setProfession(e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Data do relatório</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" value={date} onChange={e => setDate(e.target.value)} /></div>
            </div>
          </div>

          {/* Resume input */}
          <div className="bg-white rounded-xl border p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">Currículo do Cliente</h2>
              <div className="flex gap-2">
                {parsing && <span className="text-xs text-green-600 animate-pulse">Lendo…</span>}
                <button onClick={() => fileRef.current?.click()} disabled={parsing}
                  className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs text-neutral-600 hover:bg-neutral-50 disabled:opacity-50">
                  📎 Enviar PDF/Word
                </button>
                <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
              </div>
            </div>
            <textarea className="w-full border rounded-lg px-3 py-2 text-sm resize-none h-44 focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Cole aqui o texto do currículo, ou envie o arquivo acima…"
              value={resumeText} onChange={e => setResumeText(e.target.value)} />
          </div>

          {/* Mode toggle */}
          <div className="bg-white rounded-xl border p-5 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={useJob} onChange={e => setUseJob(e.target.checked)} className="rounded w-4 h-4 accent-green-700" />
              <span className="font-semibold text-sm text-neutral-800">Comparar com uma vaga específica</span>
            </label>
            {useJob && (
              <textarea className="w-full border rounded-lg px-3 py-2 text-sm resize-none h-32 focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="Cole aqui a descrição da vaga para a qual o cliente quer se candidatar…"
                value={jobText} onChange={e => setJobText(e.target.value)} />
            )}
            {!useJob && (
              <p className="text-xs text-neutral-400">Sem vaga: analisa a força geral do currículo para a profissão informada.</p>
            )}
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

          <button onClick={handleAnalyze} disabled={loading || !resumeText.trim()}
            className="w-full bg-green-700 text-white py-4 rounded-xl font-bold text-base hover:bg-green-800 disabled:opacity-50 transition">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analisando com IA…
              </span>
            ) : "✦ Gerar Análise ATS"}
          </button>
        </div>

        {/* RIGHT — Results */}
        <div className="space-y-5">
          {result ? (
            <>
              {/* Download button */}
              <div className="flex justify-end gap-3">
                <button onClick={handleDownloadPDF} disabled={downloading}
                  className="px-6 py-2.5 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 disabled:opacity-50 text-sm">
                  {downloading ? "Gerando PDF…" : "⬇ Baixar Relatório PDF"}
                </button>
                <button onClick={() => setResult(null)}
                  className="px-4 py-2.5 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50">
                  Nova Análise
                </button>
              </div>

              {/* Score card */}
              <div className="bg-white border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-5 mb-6">
                  {result.final_ats_score !== null ? (
                    <div className="text-6xl font-bold" style={{ color: colors?.bar }}>{result.final_ats_score}</div>
                  ) : (
                    <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center" style={{ borderColor: colors?.bar }}>
                      <span className="text-lg font-bold" style={{ color: colors?.bar }}>{result.structure_score}</span>
                    </div>
                  )}
                  <div>
                    <span className={`inline-block text-sm font-bold px-3 py-1.5 rounded-full ${colors?.bg} ${colors?.text}`}>
                      {result.strength_label}
                    </span>
                    <p className="text-xs text-neutral-500 mt-1.5">
                      {result.mode === "with_job" ? "Pontuação ATS contra a vaga" : "Avaliação geral do currículo"}
                    </p>
                    {candidateName && <p className="text-sm font-medium text-neutral-700 mt-1">{candidateName}</p>}
                  </div>
                </div>

                <div className="space-y-3">
                  <ScoreBar label="Estrutura do currículo" value={result.structure_score} color="#16a34a" />
                  {result.skills_coverage_score !== undefined && (
                    <ScoreBar label="Cobertura de habilidades" value={result.skills_coverage_score} color="#2563eb" />
                  )}
                  {result.semantic_match_score !== undefined && (
                    <ScoreBar label="Alinhamento com a vaga" value={result.semantic_match_score} color="#d97706" />
                  )}
                </div>
              </div>

              {/* Skills */}
              {result.mode === "with_job" && (result.skills_found?.length || result.skills_missing?.length) && (
                <div className="grid grid-cols-2 gap-3">
                  {result.skills_found?.length ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <p className="font-semibold text-green-800 text-xs uppercase tracking-wide mb-2">✓ Encontradas ({result.skills_found.length})</p>
                      <ul className="space-y-1">
                        {result.skills_found.map((s, i) => <li key={i} className="text-xs text-green-700">• {s}</li>)}
                      </ul>
                    </div>
                  ) : null}
                  {result.skills_missing?.length ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="font-semibold text-amber-800 text-xs uppercase tracking-wide mb-2">⚠ Faltando ({result.skills_missing.length})</p>
                      <ul className="space-y-1">
                        {result.skills_missing.map((s, i) => <li key={i} className="text-xs text-amber-700">• {s}</li>)}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Specific enhancements */}
              {result.specific_enhancements?.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="font-semibold text-blue-900 text-sm mb-1">📈 Melhorias Específicas</h3>
                  <p className="text-xs text-blue-700 mb-3">Ações concretas com impacto estimado na pontuação.</p>
                  <ul className="space-y-2">
                    {result.specific_enhancements.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-blue-900">
                        <span className="flex-shrink-0">•</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Profession-specific recommendations */}
              {result.specific_recommendations?.length > 0 && (
                <div className="bg-white border border-green-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="font-semibold text-neutral-800 text-sm mb-1">
                    🎯 Para {result.profession || "a profissão"} — recomendações específicas
                  </h3>
                  <p className="text-xs text-neutral-500 mb-3">
                    Comparando o currículo com o que é esperado para esta área no mercado.
                  </p>
                  <ol className="space-y-3">
                    {result.specific_recommendations.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm text-neutral-700">
                        <span className="text-green-700 font-bold flex-shrink-0 w-5">{i + 1}.</span>{s}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* General hints */}
              {result.suggestions_pt_br?.length > 0 && (
                <div className="bg-white border rounded-2xl p-5 shadow-sm">
                  <h3 className="font-semibold text-neutral-800 text-sm mb-3">💡 Dicas gerais de estrutura</h3>
                  <ol className="space-y-3">
                    {result.suggestions_pt_br.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm text-neutral-700">
                        <span className="text-neutral-400 font-bold flex-shrink-0 w-5">{i + 1}.</span>{s}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white border-2 border-dashed border-neutral-300 rounded-2xl flex items-center justify-center min-h-[500px] text-neutral-400">
              <div className="text-center px-6">
                <div className="text-5xl mb-4">📊</div>
                <p className="font-semibold text-neutral-600 mb-2">Relatório ATS</p>
                <p className="text-sm">Preencha os dados e clique em Gerar Análise.</p>
                <p className="text-sm mt-1">O relatório em PDF pode ser enviado diretamente pelo WhatsApp.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
