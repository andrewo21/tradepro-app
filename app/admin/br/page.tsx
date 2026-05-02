"use client";

import { useState, useRef } from "react";
import BrModernoAzul from "@/components/templates/brazil/BrModernoAzul";
import BrClasicoProfissional from "@/components/templates/brazil/BrClasicoProfissional";
import BrVerdeTecnico from "@/components/templates/brazil/BrVerdeTecnico";
import BrSimplesDirecto from "@/components/templates/brazil/BrSimplesDirecto";
import BrExecutivoVerde from "@/components/templates/brazil/BrExecutivoVerde";
import BrConstrucaoBold from "@/components/templates/brazil/BrConstrucaoBold";
import BrTecnicoModerno from "@/components/templates/brazil/BrTecnicoModerno";
import BrPremiumDourado from "@/components/templates/brazil/BrPremiumDourado";
import BrMinimalistaBR from "@/components/templates/brazil/BrMinimalistaBR";

const OPERATOR_PASSWORD = process.env.NEXT_PUBLIC_OPERATOR_PASSWORD || "tradepro2026";

const TEMPLATES: Record<string, any> = {
  "br-moderno-azul": { name: "Moderno Azul", component: BrModernoAzul },
  "br-clasico-profissional": { name: "Clássico Profissional", component: BrClasicoProfissional },
  "br-verde-tecnico": { name: "Verde Técnico", component: BrVerdeTecnico },
  "br-simples-direto": { name: "Simples & Direto", component: BrSimplesDirecto },
  "br-executivo-verde": { name: "Executivo Verde", component: BrExecutivoVerde },
  "br-construcao-bold": { name: "Construção Bold", component: BrConstrucaoBold },
  "br-tecnico-moderno": { name: "Técnico Moderno", component: BrTecnicoModerno },
  "br-premium-dourado": { name: "Premium Dourado", component: BrPremiumDourado },
  "br-minimalista-br": { name: "Minimalista BR", component: BrMinimalistaBR },
};

const SETORES = [
  "Construção Civil", "Elétrica", "Hidráulica/Encanamento", "HVAC/Refrigeração",
  "Mecânica", "Logística/Transporte", "Alimentação/Cozinha", "Segurança",
  "Saúde/Enfermagem", "TI/Técnico", "Administrativo", "Outro",
];

interface Experiencia {
  id: string;
  cargo: string;
  empresa: string;
  dataInicio: string;
  dataFim: string;
  anos: string;
  supervisionou: boolean;
  comercial: boolean;
  contexto: string;
}

function newExp(): Experiencia {
  return { id: Date.now().toString(), cargo: "", empresa: "", dataInicio: "", dataFim: "", anos: "", supervisionou: false, comercial: false, contexto: "" };
}

export default function OperadorBR() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);

  // Personal info
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [foto, setFoto] = useState<string>("");
  const [setor, setSetor] = useState("Construção Civil");
  const [certificacoes, setCertificacoes] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("br-moderno-azul");

  // Multiple experiences
  const [experiencias, setExperiencias] = useState<Experiencia[]>([newExp()]);

  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  function handleLogin() {
    if (pw === OPERATOR_PASSWORD) setAuthed(true);
    else setPwError(true);
  }

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  function updateExp(id: string, field: keyof Experiencia, value: any) {
    setExperiencias(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  }

  function addExp() { setExperiencias(prev => [...prev, newExp()]); }
  function removeExp(id: string) { setExperiencias(prev => prev.filter(e => e.id !== id)); }

  async function handleGenerate() {
    if (!nome || !experiencias[0].cargo) return alert("Nome e cargo são obrigatórios.");
    setLoading(true); setError(null);
    try {
      // Build prompt from all experiences
      const expSummary = experiencias.map(exp =>
        [
          `Cargo: ${exp.cargo}`, exp.empresa ? `Empresa: ${exp.empresa}` : "",
          exp.anos ? `${exp.anos} anos` : "",
          exp.supervisionou ? "Supervisionou equipes" : "",
          exp.comercial ? "Obras comerciais" : "",
          exp.contexto || "",
        ].filter(Boolean).join(", ")
      ).join(" | ");

      const promptParts = [
        `Nome: ${nome} ${sobrenome}`,
        `Setor principal: ${setor}`,
        `Experiências: ${expSummary}`,
        certificacoes ? `Certificações: ${certificacoes}` : "",
      ].filter(Boolean).join("\n");

      // Generate summary
      const sumRes = await fetch("/api/ai/br/rewrite", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `Gere um resumo profissional para: ${promptParts}`, type: "resumo" }),
      });
      const sumData = await sumRes.json();

      // Generate bullets for each experience
      const expWithBullets = await Promise.all(experiencias.map(async (exp) => {
        const bulletsRes = await fetch("/api/ai/br/rewrite", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `Gere 3 responsabilidades para ${exp.cargo} com ${exp.anos || "alguns"} anos. ${exp.supervisionou ? "Supervisionou equipes." : ""} ${exp.comercial ? "Obras comerciais." : ""} ${exp.contexto || ""}`,
            type: "responsabilidade",
          }),
        });
        const bd = await bulletsRes.json();
        const bullets = (bd.suggestion || "").split("\n").filter(Boolean).slice(0, 3);
        return {
          id: exp.id,
          cargo: exp.cargo,
          empresa: exp.empresa || "Empresa",
          dataInicio: exp.dataInicio || (exp.anos ? `${new Date().getFullYear() - parseInt(exp.anos)}/01` : ""),
          dataFim: exp.dataFim || "Atual",
          responsabilidades: bullets.map((b: string, i: number) => ({ id: String(i), text: b })),
        };
      }));

      setResumeData({
        personalInfo: {
          nome, sobrenome,
          tituloProfissional: experiencias[0].cargo,
          telefone, whatsapp, email, cidade, estado,
          cpf: "", linkedin: "", foto,
        },
        resumoProfissional: sumData.suggestion || "",
        habilidades: certificacoes
          ? certificacoes.split(",").map((c: string) => ({ text: c.trim() }))
          : [{ text: experiencias[0].cargo }, { text: setor }],
        experiencia: expWithBullets,
        formacao: [{ instituicao: "", curso: "", anoConclusao: "", tipo: "Técnico" }],
        cursosCertificacoes: certificacoes
          ? certificacoes.split(",").map((c: string) => ({ nome: c.trim(), instituicao: "", ano: "" }))
          : [],
      });
    } catch (err: any) {
      setError(err?.message || "Erro ao gerar currículo.");
    } finally { setLoading(false); }
  }

  async function handleDownload() {
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
      const W = pdf.internal.pageSize.getWidth();
      const H = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(W / canvas.width, H / canvas.height);
      pdf.addImage(imgData, "PNG", (W - canvas.width * ratio) / 2, 0, canvas.width * ratio, canvas.height * ratio);
      pdf.save(`Curriculo-${nome}-${sobrenome}.pdf`);
    } catch { alert("Erro ao baixar PDF."); }
    finally { setDownloading(false); }
  }

  const TemplateComponent = TEMPLATES[selectedTemplate]?.component || BrModernoAzul;

  if (!authed) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h1 className="text-xl font-bold mb-1">Área do Operador</h1>
          <p className="text-sm text-neutral-500 mb-6">TradePro Brasil — Uso interno</p>
          <input type="password" placeholder="Senha" value={pw}
            onChange={e => { setPw(e.target.value); setPwError(false); }}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            className="w-full border rounded-lg px-4 py-3 text-sm mb-3 focus:ring-2 focus:ring-green-500 focus:outline-none" />
          {pwError && <p className="text-red-600 text-xs mb-3">Senha incorreta.</p>}
          <button onClick={handleLogin} className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800">Entrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="bg-green-800 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">🇧🇷 TradePro — Gerador de Currículo</h1>
          <p className="text-green-200 text-xs">Área do Operador</p>
        </div>
        <button onClick={() => setAuthed(false)} className="text-green-200 text-sm hover:text-white">Sair</button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT — Form */}
        <div className="space-y-5">

          {/* Personal info */}
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">Dados Pessoais</h2>

            {/* Photo upload */}
            <div className="flex items-center gap-4">
              <div onClick={() => photoRef.current?.click()} className="w-20 h-20 rounded-full border-2 border-dashed border-neutral-300 flex items-center justify-center cursor-pointer hover:border-green-400 overflow-hidden flex-shrink-0 bg-neutral-50">
                {foto ? <img src={foto} alt="Foto" className="w-full h-full object-cover" /> : <span className="text-xs text-neutral-400 text-center">📷<br/>Foto</span>}
              </div>
              <div>
                <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
                <button onClick={() => photoRef.current?.click()} className="px-4 py-2 bg-neutral-100 border rounded-lg text-sm hover:bg-neutral-200">Adicionar Foto</button>
                {foto && <button onClick={() => setFoto("")} className="ml-2 text-red-500 text-xs hover:underline">Remover</button>}
                <p className="text-xs text-neutral-400 mt-1">Opcional. JPG ou PNG.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Nome *</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Neto" value={nome} onChange={e => setNome(e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Sobrenome</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Alvarez" value={sobrenome} onChange={e => setSobrenome(e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Telefone</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="(11) 99999-9999" value={telefone} onChange={e => setTelefone(e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">WhatsApp</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="(11) 99999-9999" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">E-mail</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="email@exemplo.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Cidade / Estado</label>
                <div className="flex gap-2">
                  <input className="flex-1 border rounded-lg px-3 py-2 text-sm" placeholder="São Paulo" value={cidade} onChange={e => setCidade(e.target.value)} />
                  <input className="w-16 border rounded-lg px-3 py-2 text-sm" placeholder="SP" value={estado} onChange={e => setEstado(e.target.value)} />
                </div></div>
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Setor</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white" value={setor} onChange={e => setSetor(e.target.value)}>
                  {SETORES.map(s => <option key={s}>{s}</option>)}
                </select></div>
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Certificações (vírgula)</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="NR-10, NR-35, CNH B" value={certificacoes} onChange={e => setCertificacoes(e.target.value)} /></div>
            </div>
          </div>

          {/* Experience entries */}
          {experiencias.map((exp, idx) => (
            <div key={exp.id} className="bg-white rounded-xl border p-6 space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">
                  Experiência {experiencias.length > 1 ? idx + 1 : ""}
                </h2>
                {experiencias.length > 1 && (
                  <button onClick={() => removeExp(exp.id)} className="text-red-500 text-xs hover:underline">Remover</button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium mb-1 text-neutral-500">Cargo / Profissão *</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Eletricista, Mecânico..." value={exp.cargo} onChange={e => updateExp(exp.id, "cargo", e.target.value)} /></div>
                <div><label className="block text-xs font-medium mb-1 text-neutral-500">Empresa</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nome da empresa" value={exp.empresa} onChange={e => updateExp(exp.id, "empresa", e.target.value)} /></div>
                <div><label className="block text-xs font-medium mb-1 text-neutral-500">Data Início</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="01/2020" value={exp.dataInicio} onChange={e => updateExp(exp.id, "dataInicio", e.target.value)} /></div>
                <div><label className="block text-xs font-medium mb-1 text-neutral-500">Data Saída</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Atual" value={exp.dataFim} onChange={e => updateExp(exp.id, "dataFim", e.target.value)} /></div>
                <div><label className="block text-xs font-medium mb-1 text-neutral-500">Anos nesse cargo</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="5" value={exp.anos} onChange={e => updateExp(exp.id, "anos", e.target.value)} /></div>
              </div>
              <div className="flex gap-4 flex-wrap">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={exp.supervisionou} onChange={e => updateExp(exp.id, "supervisionou", e.target.checked)} className="rounded" />
                  Supervisionou equipes
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={exp.comercial} onChange={e => updateExp(exp.id, "comercial", e.target.checked)} className="rounded" />
                  Obras comerciais
                </label>
              </div>
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Contexto extra</label>
                <textarea className="w-full border rounded-lg px-3 py-2 text-sm h-16 resize-none"
                  placeholder="O que o cliente contou sobre esse emprego..." value={exp.contexto}
                  onChange={e => updateExp(exp.id, "contexto", e.target.value)} /></div>
            </div>
          ))}

          <button onClick={addExp}
            className="w-full py-3 border-2 border-dashed border-neutral-300 rounded-xl text-sm text-neutral-500 hover:border-green-400 hover:text-green-700 transition">
            + Adicionar Outra Experiência
          </button>

          {/* Template picker */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide mb-3">Modelo</h2>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(TEMPLATES).map(([key, t]) => (
                <button key={key} onClick={() => setSelectedTemplate(key)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition ${selectedTemplate === key ? "bg-green-700 text-white border-green-700" : "bg-white text-neutral-700 border-neutral-300 hover:border-green-500"}`}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

          <button onClick={handleGenerate} disabled={loading || !nome || !experiencias[0].cargo}
            className="w-full bg-green-700 text-white py-4 rounded-xl font-bold text-base hover:bg-green-800 disabled:opacity-50 transition">
            {loading ? "Gerando com IA..." : "✦ Gerar Currículo com IA"}
          </button>
        </div>

        {/* RIGHT — Preview */}
        <div className="space-y-4">
          {resumeData ? (
            <>
              <div className="flex gap-3 justify-end">
                <button onClick={handleDownload} disabled={downloading}
                  className="px-6 py-2.5 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 disabled:opacity-50">
                  {downloading ? "Baixando..." : "⬇ Baixar PDF"}
                </button>
                <button onClick={() => setResumeData(null)} className="px-4 py-2.5 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50">Novo</button>
              </div>
              <div ref={previewRef} className="bg-white border rounded-xl shadow-xl overflow-hidden">
                <TemplateComponent data={resumeData} showWatermark={false} />
              </div>
            </>
          ) : (
            <div className="bg-white border-2 border-dashed border-neutral-300 rounded-xl flex items-center justify-center min-h-[500px] text-neutral-400">
              <div className="text-center">
                <div className="text-5xl mb-3">📄</div>
                <p className="font-medium">Preencha os dados e clique em Gerar</p>
                <p className="text-sm mt-1">A IA cria o currículo completo automaticamente</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
