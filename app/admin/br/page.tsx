"use client";

// ── Operator intake tool for Brazil ─────────────────────────────────────────
// Password protected — only Andrew uses this.
// Enter minimal customer info, AI generates a full professional resume,
// download the PDF to send to the customer via WhatsApp.

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

export default function OperadorBR() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);

  // Form fields
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [cargo, setCargo] = useState("");
  const [setor, setSetor] = useState("Construção Civil");
  const [anos, setAnos] = useState("");
  const [contexto, setContexto] = useState("");
  const [supervisionou, setSupervisionou] = useState(false);
  const [comercial, setComercial] = useState(false);
  const [certificacoes, setCertificacoes] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("br-moderno-azul");

  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  function handleLogin() {
    if (pw === OPERATOR_PASSWORD) { setAuthed(true); }
    else { setPwError(true); }
  }

  async function handleGenerate() {
    if (!nome || !cargo) return alert("Nome e cargo são obrigatórios.");
    setLoading(true); setError(null);
    try {
      // Build a rich prompt from minimal inputs
      const promptParts = [
        `Nome: ${nome} ${sobrenome}`,
        `Cargo pretendido: ${cargo}`,
        `Setor: ${setor}`,
        `Anos de experiência: ${anos}`,
        supervisionou ? "Supervisionou equipes: Sim" : "",
        comercial ? "Trabalhou em obras comerciais/industriais: Sim" : "",
        certificacoes ? `Certificações/cursos: ${certificacoes}` : "",
        contexto ? `Informações adicionais do cliente: ${contexto}` : "",
      ].filter(Boolean).join("\n");

      // Generate summary
      const sumRes = await fetch("/api/ai/br/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `Gere um resumo profissional completo para: ${promptParts}`,
          type: "resumo",
        }),
      });
      const sumData = await sumRes.json();

      // Generate 3 responsibility bullets
      const bulletsRes = await fetch("/api/ai/br/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `Gere 3 responsabilidades profissionais para ${cargo} com ${anos} anos de experiência em ${setor}. ${supervisionou ? "Supervisionou equipes." : ""} ${comercial ? "Trabalhou em obras comerciais." : ""}`,
          type: "responsabilidade",
        }),
      });
      const bulletsData = await bulletsRes.json();
      const bullets = (bulletsData.suggestion || "").split("\n").filter(Boolean).slice(0, 3);

      // Build resume data structure
      const generated = {
        personalInfo: {
          nome, sobrenome,
          tituloProfissional: cargo,
          telefone, whatsapp, email,
          cidade, estado,
          cpf: "", linkedin: "", foto: "",
        },
        resumoProfissional: sumData.suggestion || "",
        habilidades: certificacoes
          ? certificacoes.split(",").map((c: string) => ({ text: c.trim() }))
          : [{ text: cargo }, { text: setor }],
        experiencia: [{
          id: "1",
          cargo,
          empresa: "Empresa Atual",
          dataInicio: anos ? `${new Date().getFullYear() - parseInt(anos)}/01` : "",
          dataFim: "Atual",
          responsabilidades: bullets.map((b: string, i: number) => ({ id: String(i), text: b })),
        }],
        formacao: [{ instituicao: "", curso: "", anoConclusao: "", tipo: "Técnico" }],
        cursosCertificacoes: certificacoes
          ? certificacoes.split(",").map((c: string) => ({ nome: c.trim(), instituicao: "", ano: "" }))
          : [],
      };

      setResumeData(generated);
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

  // ── Password gate ─────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h1 className="text-xl font-bold text-neutral-900 mb-1">Área do Operador</h1>
          <p className="text-sm text-neutral-500 mb-6">TradePro Brasil — Uso interno</p>
          <input
            type="password"
            placeholder="Senha de acesso"
            value={pw}
            onChange={e => { setPw(e.target.value); setPwError(false); }}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            className="w-full border rounded-lg px-4 py-3 text-sm mb-3 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
          {pwError && <p className="text-red-600 text-xs mb-3">Senha incorreta.</p>}
          <button onClick={handleLogin} className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800">
            Entrar
          </button>
        </div>
      </div>
    );
  }

  // ── Operator tool ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="bg-green-800 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">🇧🇷 TradePro — Gerador de Currículo</h1>
          <p className="text-green-200 text-xs">Área do Operador — uso interno</p>
        </div>
        <button onClick={() => setAuthed(false)} className="text-green-200 text-sm hover:text-white">Sair</button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT — Input form */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">Dados do Cliente</h2>
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
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Cidade/Estado</label>
                <div className="flex gap-2">
                  <input className="flex-1 border rounded-lg px-3 py-2 text-sm" placeholder="São Paulo" value={cidade} onChange={e => setCidade(e.target.value)} />
                  <input className="w-16 border rounded-lg px-3 py-2 text-sm" placeholder="SP" value={estado} onChange={e => setEstado(e.target.value)} />
                </div></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">Experiência Profissional</h2>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Cargo / Profissão *</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Eletricista, Mecânico..." value={cargo} onChange={e => setCargo(e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Setor</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white" value={setor} onChange={e => setSetor(e.target.value)}>
                  {SETORES.map(s => <option key={s}>{s}</option>)}
                </select></div>
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Anos de Experiência</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="9" value={anos} onChange={e => setAnos(e.target.value)} /></div>
              <div><label className="block text-xs font-medium mb-1 text-neutral-500">Certificações (separe por vírgula)</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="NR-10, NR-35, CNH B" value={certificacoes} onChange={e => setCertificacoes(e.target.value)} /></div>
            </div>
            <div className="flex gap-4 flex-wrap">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={supervisionou} onChange={e => setSupervisionou(e.target.checked)} className="rounded" />
                Supervisionou equipes
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={comercial} onChange={e => setComercial(e.target.checked)} className="rounded" />
                Obras comerciais/industriais
              </label>
            </div>
            <div><label className="block text-xs font-medium mb-1 text-neutral-500">Informações extras (o que o cliente te contou)</label>
              <textarea className="w-full border rounded-lg px-3 py-2 text-sm h-24 resize-none"
                placeholder="Ex: trabalhou 5 anos na construtora X, fez obras em condomínios, gosta de trabalhar com equipe..."
                value={contexto} onChange={e => setContexto(e.target.value)} /></div>
          </div>

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

          <button onClick={handleGenerate} disabled={loading || !nome || !cargo}
            className="w-full bg-green-700 text-white py-4 rounded-xl font-bold text-base hover:bg-green-800 disabled:opacity-50 transition">
            {loading ? "Gerando com IA..." : "✦ Gerar Currículo com IA"}
          </button>
        </div>

        {/* RIGHT — Preview + download */}
        <div className="space-y-4">
          {resumeData ? (
            <>
              <div className="flex gap-3 justify-end">
                <button onClick={handleDownload} disabled={downloading}
                  className="px-6 py-2.5 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 disabled:opacity-50 transition">
                  {downloading ? "Baixando..." : "⬇ Baixar PDF"}
                </button>
                <button onClick={() => setResumeData(null)}
                  className="px-4 py-2.5 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50">
                  Novo
                </button>
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
