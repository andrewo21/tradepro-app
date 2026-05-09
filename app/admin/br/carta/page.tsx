"use client";

import { useState } from "react";
import Link from "next/link";
import { ModernBlueCoverLetter, TraditionalCoverLetter } from "@/components/CoverLetterTemplates";

const OPERATOR_PASSWORD = process.env.NEXT_PUBLIC_OPERATOR_PASSWORD || "tradepro2026";

const TEMPLATES: Record<string, { name: string; component: any }> = {
  "modern-blue": { name: "Moderno Azul", component: ModernBlueCoverLetter },
  "traditional-clean": { name: "Clássico Limpo", component: TraditionalCoverLetter },
};

export default function OperadorCartaBR() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);

  // Candidato
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidadeEstado, setCidadeEstado] = useState("");
  const [linkedin, setLinkedin] = useState("");

  // Vaga / empresa
  const [cargo, setCargo] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [nomeContratante, setNomeContratante] = useState("");

  // Conteúdo
  const [experiencia, setExperiencia] = useState("");
  const [tom, setTom] = useState("formal");
  const [selectedTemplate, setSelectedTemplate] = useState("modern-blue");

  // Output
  const [carta, setCarta] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rewritingIdx, setRewritingIdx] = useState<number | null>(null);

  const hoje = new Date();
  const dataHoje = `${String(hoje.getDate()).padStart(2, "0")}/${String(hoje.getMonth() + 1).padStart(2, "0")}/${hoje.getFullYear()}`;

  function handleLogin() {
    if (pw === OPERATOR_PASSWORD) setAuthed(true);
    else setPwError(true);
  }

  async function handleGerar() {
    if (!nome || !cargo) return alert("Nome e cargo são obrigatórios.");
    setLoading(true); setError(null);
    try {
      const prompt = [
        `Escreva o CORPO de uma carta de apresentação profissional em português ${tom === "formal" ? "formal" : "cordial e direto"}.`,
        `Candidato: ${nome}`,
        `Cargo pretendido: ${cargo}`,
        empresa ? `Empresa: ${empresa}` : "",
        nomeContratante ? `Destinatário: ${nomeContratante}` : "",
        experiencia ? `Contexto e experiência do candidato: ${experiencia}` : "",
        `Escreva apenas o corpo da carta (3-4 parágrafos). Não inclua saudação nem assinatura. Use linguagem profissional brasileira.`,
      ].filter(Boolean).join("\n");

      const res = await fetch("/api/ai/br/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: prompt, type: "carta" }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Erro ao gerar carta");

      const saudacao = nomeContratante
        ? `Prezado(a) ${nomeContratante},`
        : "A quem possa interessar,";
      setCarta(`${saudacao}\n\n${d.suggestion || ""}\n\nAtenciosamente,\n\n${nome}`);
    } catch (e: any) {
      setError(e.message || "Erro ao gerar carta.");
    } finally { setLoading(false); }
  }

  // Split carta into paragraphs for per-paragraph editing
  const paragraphs = carta.split("\n\n");
  function updateParagraph(idx: number, text: string) {
    const updated = [...paragraphs];
    updated[idx] = text;
    setCarta(updated.join("\n\n"));
  }

  async function rewriteParagraph(idx: number) {
    const text = paragraphs[idx];
    if (!text?.trim()) return;
    setRewritingIdx(idx);
    try {
      const res = await fetch("/api/ai/br/rewrite", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `Reescreva este parágrafo de carta de apresentação de forma profissional em português: ${text}`,
          type: "carta",
        }),
      });
      const d = await res.json();
      if (d.suggestion) updateParagraph(idx, d.suggestion);
    } catch { /* silent */ }
    finally { setRewritingIdx(null); }
  }

  async function handleDownload() {
    if (!carta) return;
    setDownloading(true);
    try {
      const res = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "cover-letter",
          coverLetterTemplate: selectedTemplate,
          applicantName: nome,
          applicantEmail: email,
          applicantPhone: telefone,
          applicantCityStateZip: cidadeEstado,
          applicantLinkedin: linkedin || undefined,
          date: dataHoje,
          hiringManager: nomeContratante,
          companyName: empresa,
          letter: carta,
        }),
      });
      if (!res.ok) throw new Error("Falha ao gerar PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Carta-${nome.replace(/\s+/g, "-")}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert("Erro ao baixar PDF."); }
    finally { setDownloading(false); }
  }

  const TemplateComponent = TEMPLATES[selectedTemplate]?.component || ModernBlueCoverLetter;
  const previewData = {
    applicantName: nome, applicantEmail: email,
    applicantPhone: telefone, applicantCityStateZip: cidadeEstado,
    date: dataHoje, hiringManager: nomeContratante,
    companyName: empresa, jobTitle: cargo, letter: carta,
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h1 className="text-xl font-bold mb-1">Área do Operador</h1>
          <p className="text-sm text-neutral-500 mb-6">TradePro Brasil — Carta de Apresentação</p>
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

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <div className="bg-green-800 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">🇧🇷 TradePro — Carta de Apresentação</h1>
          <p className="text-green-200 text-xs">Área do Operador</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/br" className="text-green-200 text-sm hover:text-white">← Currículo</Link>
          <button onClick={() => setAuthed(false)} className="text-green-200 text-sm hover:text-white">Sair</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT — Form */}
        <div className="space-y-5">

          {/* Dados do candidato */}
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">Dados do Candidato</h2>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Nome Completo *</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Neto Alvarez"
                  value={nome} onChange={e => setNome(e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Telefone / WhatsApp</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="(11) 99999-9999"
                  value={telefone} onChange={e => setTelefone(e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">E-mail</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="email@exemplo.com"
                  value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Cidade / Estado</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="São Paulo, SP"
                  value={cidadeEstado} onChange={e => setCidadeEstado(e.target.value)} /></div>
              <div className="col-span-2"><label className="block text-xs font-medium mb-1 text-neutral-500">LinkedIn <span className="text-neutral-400 font-normal">(opcional)</span></label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="linkedin.com/in/seunome"
                  value={linkedin} onChange={e => setLinkedin(e.target.value)} /></div>
            </div>
          </div>

          {/* Vaga */}
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">Vaga / Empresa</h2>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Cargo Pretendido *</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Eletricista, Gerente, Técnico..."
                  value={cargo} onChange={e => setCargo(e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Empresa</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nome da empresa"
                  value={empresa} onChange={e => setEmpresa(e.target.value)} /></div>
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1 text-neutral-500">Nome do Contratante <span className="text-neutral-400 font-normal">(opcional)</span></label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Sr. Carlos, Dra. Ana..."
                  value={nomeContratante} onChange={e => setNomeContratante(e.target.value)} /></div>
            </div>
          </div>

          {/* Experiência e tom */}
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">Experiência do Candidato</h2>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none h-32 focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Descreva o que o cliente faz, anos de experiência, conquistas, habilidades principais...&#10;Ex: Eletricista com 9 anos, trabalhou em obras comerciais, tem NR-10, liderou equipe de 5 pessoas..."
              value={experiencia}
              onChange={e => setExperiencia(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-neutral-500">Tom da carta</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                  value={tom} onChange={e => setTom(e.target.value)}>
                  <option value="formal">Formal (escritório, corporativo)</option>
                  <option value="direto">Direto e cordial (obras, técnico)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-neutral-500">Modelo</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                  value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}>
                  {Object.entries(TEMPLATES).map(([k, t]) => (
                    <option key={k} value={k}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Carta gerada — editable per paragraph with AI rewrite */}
          {carta && (
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h2 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">✏️ Editar e Reescrever com IA</h2>
              {paragraphs.map((para, idx) => {
                const isGreeting = idx === 0;
                const isSignoff = idx >= paragraphs.length - 2;
                const canRewrite = !isGreeting && !isSignoff;
                return (
                  <div key={idx} className="flex gap-2 items-start">
                    <textarea
                      className={`flex-1 border rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-green-500 focus:outline-none ${isGreeting || isSignoff ? "h-12 bg-neutral-50" : "h-20"}`}
                      value={para}
                      onChange={e => updateParagraph(idx, e.target.value)}
                    />
                    {canRewrite && (
                      <button
                        onClick={() => rewriteParagraph(idx)}
                        disabled={rewritingIdx !== null}
                        className="flex-shrink-0 px-3 py-2 bg-green-700 text-white rounded-lg text-xs font-semibold hover:bg-green-800 disabled:opacity-50 mt-1 whitespace-nowrap"
                      >
                        {rewritingIdx === idx ? <span className="animate-pulse">IA...</span> : "✦ Reescrever"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

          <button onClick={handleGerar} disabled={loading || !nome || !cargo}
            className="w-full bg-green-700 text-white py-4 rounded-xl font-bold text-base hover:bg-green-800 disabled:opacity-50 transition">
            {loading ? "Gerando com IA..." : "✦ Gerar Carta com IA"}
          </button>
        </div>

        {/* RIGHT — Preview */}
        <div className="space-y-4">
          {carta ? (
            <>
              <div className="flex gap-3 justify-end">
                <button onClick={handleDownload} disabled={downloading}
                  className="px-6 py-2.5 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 disabled:opacity-50">
                  {downloading ? "Baixando..." : "⬇ Baixar PDF"}
                </button>
                <button onClick={() => setCarta("")}
                  className="px-4 py-2.5 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50">
                  Nova Carta
                </button>
              </div>
              <div className="bg-white border rounded-xl shadow-xl overflow-hidden">
                <TemplateComponent data={previewData} />
              </div>
            </>
          ) : (
            <div className="bg-white border-2 border-dashed border-neutral-300 rounded-xl flex items-center justify-center min-h-[500px] text-neutral-400">
              <div className="text-center">
                <div className="text-5xl mb-3">✉️</div>
                <p className="font-medium">Preencha os dados e clique em Gerar</p>
                <p className="text-sm mt-1">A IA escreve a carta profissional automaticamente</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
