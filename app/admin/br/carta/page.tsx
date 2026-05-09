"use client";

import { useState, useRef } from "react";
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

  // Vaga
  const [cargo, setCargo] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [nomeContratante, setNomeContratante] = useState("");

  // Contexto do candidato (preenchido manualmente ou via IA do currículo)
  const [experiencia, setExperiencia] = useState("");
  const [realizacoes, setRealizacoes] = useState("");
  const [tom, setTom] = useState("executivo");
  const [selectedTemplate, setSelectedTemplate] = useState("modern-blue");

  // Estado do upload
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  // Full resume drop-in — parse and populate all fields
  async function handleResumeUpload(file: File) {
    setParsing(true); setParseError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/ai/parse-resume", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro ao processar currículo");

      const d = json.data;

      // Fill personal fields
      if (d.personalInfo) {
        if (!nome) setNome([d.personalInfo.firstName, d.personalInfo.lastName].filter(Boolean).join(" "));
        if (!email) setEmail(d.personalInfo.email || "");
        if (!telefone) setTelefone(d.personalInfo.phone || "");
        if (!cidadeEstado && (d.personalInfo.city || d.personalInfo.state)) {
          setCidadeEstado([d.personalInfo.city, d.personalInfo.state].filter(Boolean).join(", "));
        }
        if (!linkedin) setLinkedin(d.personalInfo.linkedin || "");
        if (!cargo && d.personalInfo.tradeTitle) setCargo(d.personalInfo.tradeTitle);
      }

      // Build rich experiência context from all experience entries
      const expBlocks = (d.experience || []).map((exp: any) => {
        const dates = [exp.startDate, exp.endDate].filter(Boolean).join(" – ");
        const bullets = [...(exp.responsibilities || []), ...(exp.achievements || [])].filter(Boolean);
        return [
          `${exp.jobTitle || ""} | ${exp.company || ""} ${dates ? `(${dates})` : ""}`,
          exp.roleSummary || "",
          ...bullets.map((b: string) => `• ${b}`),
        ].filter(Boolean).join("\n");
      }).join("\n\n");

      const skillsText = (d.skills || []).filter(Boolean).join(", ");
      const certsText = (d.certifications || []).filter(Boolean).join(", ");

      setExperiencia([
        d.summary ? `Resumo: ${d.summary}` : "",
        expBlocks ? `Experiência:\n${expBlocks}` : "",
        skillsText ? `Habilidades: ${skillsText}` : "",
        certsText ? `Certificações: ${certsText}` : "",
      ].filter(Boolean).join("\n\n"));

    } catch (e: any) {
      setParseError(e.message || "Erro ao processar currículo.");
    } finally { setParsing(false); }
  }

  async function handleGerar() {
    if (!nome || !cargo) return alert("Nome e cargo são obrigatórios.");
    setLoading(true); setError(null);
    try {
      const tomInstrucao = tom === "executivo"
        ? "executivo e estratégico — use vocabulário de alto nível como 'impulsionar', 'alavancar', 'transformar', 'otimizar', 'liderar com excelência'"
        : tom === "tecnico"
        ? "técnico e direto — enfatize competências específicas, certificações e resultados mensuráveis"
        : "cordial e profissional — equilibre competência com acessibilidade";

      const destinatario = nomeContratante
        ? `Dirija-se diretamente a ${nomeContratante}, responsável por Recursos Humanos ou pela seleção.`
        : `Use abertura profissional 'A quem possa interessar'.`;

      const prompt = `Você é um consultor sênior de carreira executiva especializado no mercado brasileiro.

Escreva o CORPO de uma carta de apresentação de nível executivo em português brasileiro formal para:

CANDIDATO: ${nome}
CARGO PRETENDIDO: ${cargo}${empresa ? `\nEMPRESA: ${empresa}` : ""}${nomeContratante ? `\nDESTINATÁRIO: ${nomeContratante}` : ""}

${destinatario}

TOM: ${tomInstrucao}

ESTRUTURA OBRIGATÓRIA (4 parágrafos):
1. Abertura impactante — apresente o candidato com uma declaração de valor única, mostrando por que esta candidatura é estratégica para a empresa
2. Realizações-chave — destaque o resultado mais expressivo e quantificável da trajetória, conectando diretamente às necessidades do cargo
3. Competências diferenciadoras — 2-3 habilidades críticas para o cargo, com exemplos concretos que demonstrem domínio e liderança
4. Encerramento executivo — chamada para ação confiante, demonstrando disponibilidade e visão de impacto

REGRAS:
- Nunca use pronomes em primeira pessoa (eu, meu, minha) — use sujeito implícito ou terceira pessoa
- Mínimo 4 parágrafos completos, linguagem densa e substancial
- Escreva APENAS o corpo da carta — sem saudação, sem assinatura
- Cada parágrafo deve ter no mínimo 3 linhas
- Use conectores executivos: "Ao longo de", "Comprometido com", "Reconhecido por", "Com sólida trajetória em"

CONTEXTO E EXPERIÊNCIA DO CANDIDATO:
${experiencia || `Profissional da área de ${cargo} buscando oportunidade na empresa ${empresa || "referenciada"}.`}
${realizacoes ? `\nREALIZAÇÕES ESPECÍFICAS A DESTACAR:\n${realizacoes}` : ""}`;

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

  // Per-paragraph AI rewrite
  const paragraphs = carta.split("\n\n");
  function updateParagraph(idx: number, text: string) {
    const updated = [...paragraphs]; updated[idx] = text; setCarta(updated.join("\n\n"));
  }
  async function rewriteParagraph(idx: number) {
    const text = paragraphs[idx];
    if (!text?.trim()) return;
    setRewritingIdx(idx);
    try {
      const res = await fetch("/api/ai/br/rewrite", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `Reescreva este parágrafo de carta de apresentação executiva em português formal, mantendo o mesmo significado mas com linguagem mais impactante e profissional de alto nível: ${text}`,
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
          locale: "pt-BR",
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
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || errData.error || `Erro ${res.status}`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Carta-${nome.replace(/\s+/g, "-")}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e: any) { alert(e.message || "Erro ao baixar PDF."); }
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
          <h1 className="text-lg font-bold">🇧🇷 TradePro — Carta de Apresentação Executiva</h1>
          <p className="text-green-200 text-xs">Área do Operador · Redação de alto nível em português</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/br" className="text-green-200 text-sm hover:text-white">← Currículo</Link>
          <button onClick={() => setAuthed(false)} className="text-green-200 text-sm hover:text-white">Sair</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT — Form */}
        <div className="space-y-5">

          {/* Candidato */}
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">Dados do Candidato</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1 text-neutral-500">Nome Completo *</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Juan Sanka Martins de Souza"
                  value={nome} onChange={e => setNome(e.target.value)} />
              </div>
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Telefone / WhatsApp</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="(11) 99999-9999"
                  value={telefone} onChange={e => setTelefone(e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">E-mail</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="email@exemplo.com"
                  value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Cidade / Estado</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="São Paulo, SP"
                  value={cidadeEstado} onChange={e => setCidadeEstado(e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">LinkedIn</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="linkedin.com/in/seunome"
                  value={linkedin} onChange={e => setLinkedin(e.target.value)} /></div>
            </div>
          </div>

          {/* Vaga */}
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">Vaga / Empresa Destino</h2>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Cargo Pretendido *</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Analista de Marketing Jr., Gerente..."
                  value={cargo} onChange={e => setCargo(e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Empresa</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nome da empresa"
                  value={empresa} onChange={e => setEmpresa(e.target.value)} /></div>
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1 text-neutral-500">
                  Nome do Contratante / RH <span className="text-neutral-400">(a IA personaliza o tom para essa pessoa)</span>
                </label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Sr. Carlos Mendes, Dra. Ana Lima..."
                  value={nomeContratante} onChange={e => setNomeContratante(e.target.value)} /></div>
            </div>
          </div>

          {/* Contexto e tom */}
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">Contexto do Candidato</h2>
            <p className="text-xs text-neutral-500">Cole aqui os principais pontos da trajetória, ou suba o currículo abaixo para preencher automaticamente.</p>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none h-36 focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Ex: Analista de Marketing com 3 anos na Grupo Euro17. Liderou eventos com 1.000+ atletas. Especialista em Meta Business Suite, TikTok e Instagram. Aumentou engajamento em 30%..."
              value={experiencia}
              onChange={e => setExperiencia(e.target.value)}
            />

            <div>
              <label className="block text-xs font-medium mb-1 text-neutral-500">
                Realizações específicas a destacar <span className="text-neutral-400">(opcional — IA usará se fornecido)</span>
              </label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm resize-none h-20 focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="Ex: Aumentou seguidores em 30%, organizou Euro17 Cup com 1.000 atletas, gerenciou orçamento de R$ 200K..."
                value={realizacoes}
                onChange={e => setRealizacoes(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-neutral-500">Estilo de escrita</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                  value={tom} onChange={e => setTom(e.target.value)}>
                  <option value="executivo">Executivo — vocabulário de alto nível, estratégico</option>
                  <option value="tecnico">Técnico — competências, certificações, resultados</option>
                  <option value="cordial">Cordial — profissional e acessível</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-neutral-500">Modelo de carta</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                  value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}>
                  {Object.entries(TEMPLATES).map(([k, t]) => (
                    <option key={k} value={k}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Editable generated letter */}
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
                      className={`flex-1 border rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-green-500 focus:outline-none ${isGreeting || isSignoff ? "h-10 bg-neutral-50" : "h-24"}`}
                      value={para}
                      onChange={e => updateParagraph(idx, e.target.value)}
                    />
                    {canRewrite && (
                      <button onClick={() => rewriteParagraph(idx)} disabled={rewritingIdx !== null}
                        className="flex-shrink-0 px-3 py-2 bg-green-700 text-white rounded-lg text-xs font-semibold hover:bg-green-800 disabled:opacity-50 mt-1 whitespace-nowrap">
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
            {loading ? "Gerando com IA executiva..." : "✦ Gerar Carta Executiva com IA"}
          </button>

          {/* Resume drop-in — at the bottom as requested */}
          <div className="bg-white rounded-xl border border-dashed border-green-400 p-6 space-y-3">
            <h2 className="font-semibold text-green-800 text-sm uppercase tracking-wide">📎 Subir Currículo Completo</h2>
            <p className="text-xs text-neutral-500">
              Suba o PDF ou Word do candidato — a IA extrai toda a trajetória, habilidades e realizações e preenche o campo de contexto automaticamente.
              Depois clique em <strong>Gerar Carta</strong>.
            </p>
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleResumeUpload(f); }}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-green-300 hover:border-green-600 rounded-xl p-6 text-center cursor-pointer transition bg-green-50"
            >
              {parsing ? (
                <p className="text-green-700 text-sm font-medium animate-pulse">Analisando currículo com IA...</p>
              ) : (
                <>
                  <p className="text-neutral-600 text-sm">Arraste o PDF/DOCX aqui ou <span className="text-green-700 font-semibold underline">clique para selecionar</span></p>
                  <p className="text-neutral-400 text-xs mt-1">A IA extrai experiências, realizações e habilidades automaticamente</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleResumeUpload(f); }} />
            {parseError && <p className="text-red-600 text-xs">{parseError}</p>}
          </div>

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
            <div className="bg-white border-2 border-dashed border-neutral-300 rounded-xl flex items-center justify-center min-h-[600px] text-neutral-400">
              <div className="text-center px-6">
                <div className="text-5xl mb-4">✉️</div>
                <p className="font-semibold text-neutral-600 mb-2">Carta de Apresentação Executiva</p>
                <p className="text-sm mb-4">Preencha os dados à esquerda e clique em Gerar.<br/>Ou suba o currículo no final do formulário para preenchimento automático.</p>
                <div className="text-left bg-neutral-50 rounded-xl p-4 text-xs text-neutral-500 space-y-1.5">
                  <p className="font-semibold text-neutral-700 mb-2">O que a IA faz automaticamente:</p>
                  <p>✓ Abertura impactante direcionada ao contratante</p>
                  <p>✓ Destaque da maior realização com dados específicos</p>
                  <p>✓ Conexão estratégica entre o perfil e a vaga</p>
                  <p>✓ Encerramento executivo com chamada para ação</p>
                  <p>✓ Vocabulário de alto nível em português formal</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
