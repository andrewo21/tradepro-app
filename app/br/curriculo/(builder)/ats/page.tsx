"use client";

// Etapa 6 BR — Força do Currículo com Gringo
// Pontuação ao vivo + comparação com vaga de emprego

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
const AskGringoButton = dynamic(() => import("@/components/AskGringoButton"), { ssr: false });
import { useBrResumeStore } from "@/app/store/useBrResumeStore";
import { useAssistantStore } from "@/app/store/useAssistantStore";
import { computeLiveAtsScore, atsLabelColor } from "@/lib/ats/live/liveAtsScore";
import { mapBrDataToUsFormat } from "@/lib/pdfTemplates";
import { mapBrStoreForAts } from "@/lib/ats/brStoreForAts";
import GringoCharacter from "@/components/assistant/GringoCharacter";
import { Check, AlertCircle, Zap, MessageCircle, ChevronRight, Target, TrendingUp } from "lucide-react";

const EMPTY_ATS = {
  score: 0,
  label: "Not Started" as const,
  flags: [] as any[],
  breakdown: { personal: 0, summary: 0, experience: 0, skills: 0, education: 0, certifications: 0 },
};

function buildResumeText(brStore: any): string {
  const mapped = mapBrDataToUsFormat(brStore);
  const parts: string[] = [];
  if (mapped.name)  parts.push(`Nome: ${mapped.name}`);
  if (mapped.title) parts.push(`Cargo: ${mapped.title}`);
  if (mapped.summary?.trim()) parts.push(`\nResumo Profissional:\n${mapped.summary.trim()}`);
  const skills = (mapped.skills || []).filter(Boolean);
  if (skills.length) parts.push(`\nHabilidades: ${skills.join(", ")}`);
  const certs = (mapped.certifications || []).filter(Boolean);
  if (certs.length) parts.push(`Certificações: ${certs.join(", ")}`);
  (mapped.experience || []).forEach((exp: any) => {
    parts.push(`\n${exp.jobTitle || ""} | ${exp.company || ""}`);
    (exp.responsibilities || []).forEach((b: string) => { if (b?.trim()) parts.push(`• ${b}`); });
  });
  return parts.join("\n");
}

function ScoreRing({ score, max = 100, label, color }: { score: number; max?: number; label: string; color: string }) {
  const pct  = Math.min(100, (score / max) * 100);
  const r    = 36;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
          <circle cx="48" cy="48" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8"/>
          <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${(pct/100)*circ} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.8s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black" style={{ color }}>{score}</span>
          <span className="text-[10px] text-neutral-400 font-medium">/{max}</span>
        </div>
      </div>
      <span className="text-xs font-bold" style={{ color }}>{label}</span>
    </div>
  );
}

function ptLabel(label: string): string {
  switch (label) {
    case "Strong":      return "Forte";
    case "Good":        return "Bom";
    case "Building":    return "Em construção";
    case "Weak":        return "Fraco";
    case "Not Started": return "Não iniciado";
    default: return label;
  }
}

export default function BrJobTargetStep() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <BrJobTargetContent />;
}

// Translates English ATS flag messages to Portuguese
function ptFlagMessage(msg: string): string {
  const map: Record<string, string> = {
    "Full name is missing": "Nome completo está faltando",
    "Professional title is missing — this is a primary ATS keyword field": "Título profissional está faltando — este é o campo de palavra-chave mais importante",
    "LinkedIn URL adds credibility and searchability": "URL do LinkedIn aumenta credibilidade e visibilidade",
    "Professional summary is empty — this is the highest-value ATS placement position": "Resumo profissional está vazio — esta é a posição de maior valor no ATS",
    "No skills listed — ATS cannot find keyword matches": "Nenhuma habilidade listada — o ATS não consegue encontrar correspondências",
    "Education section is empty": "Seção de formação está vazia",
    "No certifications listed — industry certs significantly boost ATS scores": "Nenhuma certificação listada — certificações do setor aumentam muito a pontuação",
  };
  if (map[msg]) return map[msg];
  // Pattern-based translations
  if (msg.startsWith("Summary is") && msg.includes("words")) {
    const m = msg.match(/Summary is (\d+) words/);
    return m ? `Resumo tem ${m[1]} palavras — 40+ palavras com métricas pontuam muito melhor` : msg;
  }
  if (msg.includes("job title missing")) return msg.replace(/^(.*): job title missing.*$/, "$1: título do cargo faltando — o ATS não consegue categorizar esta função");
  if (msg.includes("start date missing")) return msg.replace(/^(.*): start date missing.*$/, "$1: data de início faltando — o ATS sinaliza histórico incompleto");
  if (msg.includes("end date missing")) return msg.replace(/^(.*): end date missing.*$/, "$1: data de saída faltando — o ATS sinaliza histórico incompleto");
  if (msg.includes("no bullet points")) return msg.replace(/^(.*): no bullet points.*$/, "$1: sem bullets — o ATS vê uma função vazia");
  if (msg.includes("bullets have no numbers")) {
    const m = msg.match(/^(.*): (\d+) bullets have no numbers/);
    return m ? `${m[1]}: ${m[2]} bullets sem números ou métricas — pontuam mal no ATS` : msg;
  }
  if (msg.includes("Only") && msg.includes("skills")) {
    const m = msg.match(/Only (\d+) skills/);
    return m ? `Apenas ${m[1]} habilidades — a maioria das vagas espera 8-12 habilidades relevantes` : msg;
  }
  return msg;
}

function BrJobTargetContent() {
  const brStore   = useBrResumeStore();
  const { open }  = useAssistantStore();
  const mapped    = mapBrDataToUsFormat(brStore);      // for resume text + hasResumeData check
  const scoreData = mapBrStoreForAts(brStore);         // for computeLiveAtsScore — same mapping as AskGringoButton
  const firstName = brStore.personalInfo?.nome || "você";

  const [mounted] = useState(true);

  let liveAts = EMPTY_ATS;
  if (mounted) {
    try { liveAts = computeLiveAtsScore(scoreData); } catch { /* silent */ }
  }
  const scoreColor = atsLabelColor(liveAts.label);

  const [jobText, setJobText]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [result,  setResult]    = useState<any>(null);
  const [error,   setError]     = useState<string | null>(null);
  const isThinking = loading;

  const hasResumeData = mounted && !!(mapped.name || (mapped.experience || []).some((e: any) => e.jobTitle));
  const errorFlags    = liveAts.flags.filter(f => f.severity === "error");
  const warnFlags     = liveAts.flags.filter(f => f.severity === "warning");

  const runComparison = useCallback(async () => {
    if (!jobText.trim()) return;
    setLoading(true); setError(null); setResult(null);
    const resumeText = buildResumeText(brStore);
    if (resumeText.trim().split(/\s+/).length < 20) {
      setError("Por favor, complete mais seções do seu currículo antes de rodar a análise.");
      setLoading(false); return;
    }
    try {
      const res = await fetch("/api/ai/br/ats-analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription: jobText, locale: "pt-BR", candidateTitle: mapped.title || null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || json.error || `Erro ${res.status}`);
      setResult(json);
    } catch (e: any) { setError(e.message || "Análise falhou. Tente novamente."); }
    finally { setLoading(false); }
  }, [jobText, brStore, mapped.title]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-neutral-500">Passo 6 — Força do Currículo</p>
        <AskGringoButton />
      </div>

      <div className="flex items-start gap-5 mb-8">
        <GringoCharacter mood={isThinking ? "thinking" : "talking"} size={90} />
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">
            Força do Currículo — Revisão Final com Gringo
          </h1>
          <p className="text-neutral-500 text-sm leading-relaxed">
            Oi, {firstName}! Aqui está sua pontuação atual. Quer ver como seu currículo se compara a uma vaga específica? Cole a descrição abaixo.
          </p>
        </div>
      </div>

      {/* Empty state */}
      {mounted && !hasResumeData && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6 text-center">
          <p className="text-amber-800 font-semibold mb-2">Nenhum dado de currículo encontrado</p>
          <p className="text-amber-700 text-sm mb-4">Parece que você acessou esta página diretamente. Comece do Passo 1.</p>
          <Link href="/br/curriculo/pessoal" className="inline-block px-6 py-2.5 bg-green-700 text-white rounded-xl text-sm font-bold hover:bg-green-800 transition">
            Começar a construir →
          </Link>
        </div>
      )}

      {/* Live score */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-bold text-neutral-800 text-base">Força Atual do Currículo</p>
            <p className="text-xs text-neutral-500 mt-0.5">Baseada em completude, estrutura e qualidade do conteúdo</p>
          </div>
          <ScoreRing score={liveAts.score} label={ptLabel(liveAts.label)} color={scoreColor} />
        </div>
        <div className="space-y-2.5">
          {([
            ["Informações Pessoais", liveAts.breakdown.personal, 14],
            ["Resumo Profissional",  liveAts.breakdown.summary,  18],
            ["Experiência",          liveAts.breakdown.experience, 36],
            ["Habilidades",          liveAts.breakdown.skills,    10],
            ["Formação",             liveAts.breakdown.education,  8],
            ["Certificações",        liveAts.breakdown.certifications, 6],
          ] as [string, number, number][]).map(([label, pts, max]) => (
            <div key={label}>
              <div className="flex justify-between text-xs text-neutral-600 mb-1">
                <span>{label}</span><span className="font-semibold">{Math.round(pts)} / {max}</span>
              </div>
              <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100,(pts/max)*100)}%`, backgroundColor: scoreColor }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Validation flags */}
      {(errorFlags.length > 0 || warnFlags.length > 0) && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 mb-6 shadow-sm">
          <p className="font-semibold text-neutral-800 text-sm mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Gringo detectou {errorFlags.length + warnFlags.length} item(ns) para resolver
          </p>
          <div className="space-y-2">
            {errorFlags.map((f, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 bg-red-50 rounded-xl border border-red-100 text-xs text-red-700">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>⚠️ Dado Faltando: {ptFlagMessage(f.message)}</span>
              </div>
            ))}
            {warnFlags.map((f, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700">
                <Zap className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{ptFlagMessage(f.message)}</span>
              </div>
            ))}
          </div>
          <button onClick={open} className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-900 transition-colors">
            <MessageCircle className="w-3.5 h-3.5" />
            Pedir ao Gringo para resolver agora →
          </button>
        </div>
      )}

      {/* Job comparison */}
      <div className="bg-gradient-to-br from-green-950 to-green-900 border border-green-700/30 rounded-2xl p-6 mb-6 shadow-xl">
        <div className="flex items-center gap-2.5 mb-2">
          <Target className="w-5 h-5 text-green-400" />
          <h2 className="text-white font-bold text-base">Compare seu Currículo com uma Vaga</h2>
        </div>
        <p className="text-green-200/70 text-sm mb-4">
          Cole qualquer descrição de vaga — Gringo vai analisar os gaps e dar uma pontuação de compatibilidade.
        </p>
        <textarea
          value={jobText}
          onChange={e => setJobText(e.target.value)}
          placeholder="Cole a descrição da vaga aqui — do LinkedIn, Indeed, site da empresa ou e-mail..."
          className="w-full h-40 bg-green-900/80 border border-green-700/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-green-300/40 focus:outline-none focus:border-green-500 resize-none transition-all"
        />
        {error && <div className="mt-3 px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-sm text-red-300">{error}</div>}
        <button onClick={runComparison} disabled={!jobText.trim() || loading}
          className="mt-4 w-full py-3.5 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Gringo está analisando…</>
          ) : (
            <><TrendingUp className="w-4 h-4" />Analisar Meu Currículo →</>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4 mb-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-6 mb-4">
              <ScoreRing
                score={result.final_ats_score ?? result.structure_score ?? 0}
                max={100}
                label={result.strength_label || result.job_fit_label || ""}
                color={result.strength_label === "Forte" || result.job_fit_label === "Strong Fit" ? "#16a34a" : "#d97706"}
              />
              <div className="flex-1">
                <p className="font-bold text-neutral-800 text-base">Job Fit Score</p>
                <p className="text-xs text-neutral-500 mt-0.5 mb-2">Análise feita pelo Gringo como um recrutador</p>
                {result.match_summary && (
                  <p className="text-sm text-neutral-700 leading-relaxed bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                    {result.match_summary}
                  </p>
                )}
              </div>
            </div>
          </div>

          {(result.skills_found?.length > 0 || result.skills_missing?.length > 0) && (
            <div className="grid sm:grid-cols-2 gap-3">
              {result.skills_found?.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                  <p className="font-semibold text-green-800 text-xs uppercase mb-2">✓ Habilidades Encontradas</p>
                  <ul className="space-y-1">{result.skills_found.map((s: string, i: number) => (
                    <li key={i} className="flex items-center gap-1.5 text-xs text-green-700"><Check className="w-3 h-3 flex-shrink-0" />{s}</li>
                  ))}</ul>
                </div>
              )}
              {result.skills_missing?.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
                  <p className="font-semibold text-rose-800 text-xs uppercase mb-2">✗ Gaps de Habilidades</p>
                  <ul className="space-y-1">{result.skills_missing.map((s: string, i: number) => (
                    <li key={i} className="text-xs text-rose-700">• {s}</li>
                  ))}</ul>
                  <button onClick={open} className="mt-3 text-xs font-semibold text-green-700 hover:underline flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" /> Pedir ao Gringo para adicionar →
                  </button>
                </div>
              )}
            </div>
          )}

          {result.specific_enhancements?.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <h3 className="font-semibold text-green-900 text-sm mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Melhorias Recomendadas
              </h3>
              <ul className="space-y-2">
                {result.specific_enhancements.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-green-900 flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-green-500" />{s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between mt-4">
        <Link href="/br/curriculo/resumo" className="px-6 py-2.5 bg-neutral-200 text-neutral-800 rounded-xl text-sm font-medium hover:bg-neutral-300 transition">
          ← Passo 5: Resumo
        </Link>
        <Link href="/br/curriculo/preview" className="px-6 py-2.5 bg-green-700 text-white rounded-xl text-sm font-bold hover:bg-green-800 transition flex items-center gap-2">
          Prévia Final → <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
