"use client";

import { useState, useRef, useCallback } from "react";
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
  const [linkedin, setLinkedin] = useState("");
  const [setor, setSetor] = useState("Construção Civil");
  const [certificacoes, setCertificacoes] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("br-moderno-azul");

  // Multiple experiences
  const [experiencias, setExperiencias] = useState<Experiencia[]>([newExp()]);

  // Skills + summary
  const [habilidades, setHabilidades] = useState<string[]>([""]);
  const [resumo, setResumo] = useState("");

  // Formação + idiomas
  const [formacao, setFormacao] = useState([{ curso: "", instituicao: "" }]);
  const [idiomas, setIdiomas] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [rewritingResumo, setRewritingResumo] = useState(false);
  const [rewritingBullet, setRewritingBullet] = useState<{expId: string; idx: number} | null>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Resume drop-in — parse uploaded file and pre-fill all fields
  async function handleResumeUpload(file: File) {
    setParsing(true); setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/ai/parse-resume", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao processar arquivo");
      const d = json.data;
      if (d.personalInfo) {
        setNome(d.personalInfo.firstName || d.personalInfo.nome || "");
        setSobrenome(d.personalInfo.lastName || d.personalInfo.sobrenome || "");
        setTelefone(d.personalInfo.phone || d.personalInfo.telefone || "");
        setEmail(d.personalInfo.email || "");
        setCidade(d.personalInfo.city || d.personalInfo.cidade || "");
        setEstado(d.personalInfo.state || d.personalInfo.estado || "");
        setLinkedin(d.personalInfo.linkedin || "");
      }
      if (d.summary) setResumo(d.summary);
      if (d.skills?.length) setHabilidades(d.skills.filter(Boolean));
      if (d.certifications?.length) setCertificacoes(d.certifications.join(", "));
      if (d.education?.length) setFormacao(d.education.map((e: any) => ({ curso: e.degree || "", instituicao: e.school || "" })));
      if (d.experience?.length) {
        setExperiencias(d.experience.map((exp: any) => ({
          id: Date.now().toString() + Math.random(),
          cargo: exp.jobTitle || "",
          empresa: exp.company || "",
          dataInicio: exp.startDate || "",
          dataFim: exp.endDate || "",
          anos: "",
          supervisionou: false,
          comercial: false,
          contexto: exp.roleSummary || exp.responsibilities?.slice(0,2).join(". ") || "",
        })));
      }
    } catch (e: any) {
      setError(e.message || "Erro ao processar currículo.");
    } finally { setParsing(false); }
  }

  function onFileDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleResumeUpload(file);
  }

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

      const generatedResumo = sumData.suggestion || resumo || "";
      if (generatedResumo && !resumo) setResumo(generatedResumo);

      const finalHabilidades = habilidades.filter(Boolean).length > 0
        ? habilidades.filter(Boolean)
        : certificacoes
          ? certificacoes.split(",").map((c: string) => c.trim()).filter(Boolean)
          : [experiencias[0].cargo, setor].filter(Boolean);

      setResumeData({
        personalInfo: {
          nome, sobrenome,
          tituloProfissional: experiencias[0].cargo,
          telefone, whatsapp, email, cidade, estado,
          cpf: "", linkedin, foto,
        },
        resumoProfissional: generatedResumo,
        habilidades: finalHabilidades.map((h: string) => ({ text: h })),
        experiencia: expWithBullets,
        formacao: formacao.filter(f => f.curso || f.instituicao).map(f => ({
          instituicao: f.instituicao, curso: f.curso, anoConclusao: "", tipo: "Técnico",
        })),
        cursosCertificacoes: [
          ...certificacoes.split(",").filter(Boolean).map((c: string) => ({ nome: c.trim(), instituicao: "", ano: "" })),
          ...idiomas.filter(Boolean).map((lang: string) => ({ nome: `Idioma: ${lang}`, instituicao: "", ano: "" })),
        ],
      });
    } catch (err: any) {
      setError(err?.message || "Erro ao gerar currículo.");
    } finally { setLoading(false); }
  }

  // Update a bullet text directly in resumeData
  function updateBullet(expId: string, idx: number, text: string) {
    setResumeData((prev: any) => ({
      ...prev,
      experiencia: prev.experiencia.map((exp: any) =>
        exp.id === expId
          ? { ...exp, responsabilidades: exp.responsabilidades.map((r: any, i: number) => i === idx ? { ...r, text } : r) }
          : exp
      ),
    }));
  }

  // Update resumo directly
  function updateResumo(text: string) {
    setResumeData((prev: any) => ({ ...prev, resumoProfissional: text }));
  }

  // AI rewrite a single bullet
  async function rewriteBulletAI(expId: string, idx: number, currentText: string, cargo: string) {
    setRewritingBullet({ expId, idx });
    try {
      const res = await fetch("/api/ai/br/rewrite", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `Reescreva este bullet para ${cargo}: ${currentText}`, type: "responsabilidade" }),
      });
      const d = await res.json();
      if (d.suggestion) updateBullet(expId, idx, d.suggestion);
    } catch { /* silent */ }
    finally { setRewritingBullet(null); }
  }

  // AI rewrite resumo
  async function rewriteResumoAI() {
    if (!resumeData) return;
    setRewritingResumo(true);
    try {
      const res = await fetch("/api/ai/br/rewrite", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `Melhore este resumo profissional: ${resumeData.resumoProfissional}`, type: "resumo" }),
      });
      const d = await res.json();
      if (d.suggestion) updateResumo(d.suggestion);
    } catch { /* silent */ }
    finally { setRewritingResumo(false); }
  }

  async function handleDownload() {
    if (!resumeData) return;
    setDownloading(true);
    try {
      const templateMap: Record<string, string> = {
        "br-moderno-azul": "modern-blue",
        "br-clasico-profissional": "standard-classic",
        "br-verde-tecnico": "sidebar-green",
        "br-simples-direto": "standard-contemporary",
        "br-executivo-verde": "executive-classic",
        "br-construcao-bold": "modern-elite",
        "br-tecnico-moderno": "basic-two-column",
        "br-premium-dourado": "executive-luxe",
        "br-minimalista-br": "modern-professional",
      };
      const pdfPayload = {
        type: "resume",
        locale: "pt-BR",
        selectedTemplate: templateMap[selectedTemplate] || "standard-contemporary",
        name: `${nome} ${sobrenome}`.trim(),
        title: resumeData.personalInfo?.tituloProfissional || "",
        photo: resumeData.personalInfo?.foto || undefined,
        contact: {
          phone: telefone || whatsapp || "",
          email: email || "",
          location: `${cidade || ""}${cidade && estado ? ", " : ""}${estado || ""}`,
          linkedin: linkedin || "",
        },
        summary: resumeData.resumoProfissional || "",
        skills: (resumeData.habilidades || []).map((h: any) => h.text || h).filter(Boolean),
        experience: (resumeData.experiencia || []).map((exp: any) => ({
          jobTitle: exp.cargo || "",
          company: exp.empresa || "",
          city: exp.cidade || "",
          state: exp.estado || "",
          startDate: exp.dataInicio || "",
          endDate: exp.dataFim || "",
          roleSummary: exp.roleSummary || "",
          responsibilities: (exp.responsabilidades || []).map((r: any) => r.text || r).filter(Boolean),
          achievements: [],
        })),
        education: (resumeData.formacao || []).map((f: any) => ({
          school: f.instituicao || "", degree: f.curso || "",
        })),
        certifications: (resumeData.cursosCertificacoes || []).filter((c: any) => c.nome).map((c: any) => c.nome),
      };
      const pdfRes = await fetch("/api/export/pdf", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pdfPayload),
      });
      if (!pdfRes.ok) {
        const errData = await pdfRes.json().catch(() => ({}));
        throw new Error(errData.detail || errData.error || `Erro ${pdfRes.status} ao gerar PDF`);
      }
      const blob = await pdfRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `Curriculo-${nome}-${sobrenome}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e.message || "Erro ao baixar PDF. Tente novamente.");
    }
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
        <a href="/admin/br/carta" className="text-green-200 text-sm hover:text-white">✉️ Carta de Apresentação</a>
        <button onClick={() => setAuthed(false)} className="text-green-200 text-sm hover:text-white">Sair</button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT — Form */}
        <div className="space-y-5">

          {/* Resume drop-in */}
          <div className="bg-white rounded-xl border p-6 space-y-3">
            <h2 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">📎 Currículo Existente</h2>
            <p className="text-xs text-neutral-500">Se o cliente enviou um currículo, suba aqui — os campos são preenchidos automaticamente pela IA.</p>
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={onFileDrop}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-neutral-300 hover:border-green-500 rounded-xl p-6 text-center cursor-pointer transition"
            >
              {parsing ? (
                <p className="text-green-700 text-sm font-medium animate-pulse">Lendo currículo com IA…</p>
              ) : (
                <>
                  <p className="text-neutral-500 text-sm">Arraste o PDF/DOCX aqui ou <span className="text-green-700 font-medium underline">clique para selecionar</span></p>
                  <p className="text-neutral-400 text-xs mt-1">PDF ou Word • A IA extrai tudo automaticamente</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleResumeUpload(f); }} />
          </div>

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
              <div className="col-span-2"><label className="block text-xs font-medium mb-1 text-neutral-500">LinkedIn <span className="text-neutral-400 font-normal">(opcional)</span></label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="linkedin.com/in/seunome" value={linkedin} onChange={e => setLinkedin(e.target.value)} /></div>
            </div>
          </div>

          {/* Resumo / Objetivo */}
          <div className="bg-white rounded-xl border p-6 space-y-3">
            <h2 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">Resumo Profissional / Objetivo</h2>
            <p className="text-xs text-neutral-500">Deixe em branco para gerar com IA, ou escreva aqui para usar como está.</p>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none h-28 focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Ex: Eletricista com 9 anos de experiência em instalações comerciais e residenciais. Especializado em NR-10..."
              value={resumo}
              onChange={e => setResumo(e.target.value)}
            />
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl border p-6 space-y-3">
            <h2 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">Habilidades / Skills</h2>
            <p className="text-xs text-neutral-500">Uma habilidade por linha. Serão listadas no currículo.</p>
            <div className="space-y-2">
              {habilidades.map((h, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                    placeholder={`Habilidade ${i + 1}...`}
                    value={h}
                    onChange={e => setHabilidades(prev => { const n = [...prev]; n[i] = e.target.value; return n; })}
                  />
                  {habilidades.length > 1 && (
                    <button onClick={() => setHabilidades(prev => prev.filter((_, idx) => idx !== i))}
                      className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm">✕</button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => setHabilidades(prev => [...prev, ""])}
              className="w-full py-2 border-dashed border-2 border-neutral-300 rounded-lg text-sm text-neutral-500 hover:border-green-400 hover:text-green-700 transition">
              + Adicionar Habilidade
            </button>
          </div>

          {/* Formação */}
          <div className="bg-white rounded-xl border p-6 space-y-3">
            <h2 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">Formação Acadêmica</h2>
            <div className="space-y-3">
              {formacao.map((f, i) => (
                <div key={i} className="grid grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-neutral-500">Curso / Área</label>
                    <input className="w-full border rounded-lg px-3 py-2 text-sm"
                      placeholder="Técnico em Eletrotécnica, MBA..."
                      value={f.curso}
                      onChange={e => setFormacao(prev => { const n = [...prev]; n[i] = { ...n[i], curso: e.target.value }; return n; })} />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium mb-1 text-neutral-500">Instituição</label>
                      <input className="w-full border rounded-lg px-3 py-2 text-sm"
                        placeholder="SENAI, ETEC, USP..."
                        value={f.instituicao}
                        onChange={e => setFormacao(prev => { const n = [...prev]; n[i] = { ...n[i], instituicao: e.target.value }; return n; })} />
                    </div>
                    {formacao.length > 1 && (
                      <button onClick={() => setFormacao(prev => prev.filter((_, idx) => idx !== i))}
                        className="mt-5 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm self-end">✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setFormacao(prev => [...prev, { curso: "", instituicao: "" }])}
              className="w-full py-2 border-dashed border-2 border-neutral-300 rounded-lg text-sm text-neutral-500 hover:border-green-400 hover:text-green-700 transition">
              + Adicionar Formação
            </button>
          </div>

          {/* Idiomas */}
          <div className="bg-white rounded-xl border p-6 space-y-3">
            <h2 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">Idiomas</h2>
            <p className="text-xs text-neutral-500">Ex: Português (nativo), Inglês (básico), Espanhol (intermediário)</p>
            <div className="space-y-2">
              {idiomas.length === 0 && (
                <p className="text-xs text-neutral-400 italic">Nenhum idioma adicionado.</p>
              )}
              {idiomas.map((lang, i) => (
                <div key={i} className="flex gap-2">
                  <input className="flex-1 border rounded-lg px-3 py-2 text-sm"
                    placeholder="Ex: Inglês (intermediário)"
                    value={lang}
                    onChange={e => setIdiomas(prev => { const n = [...prev]; n[i] = e.target.value; return n; })} />
                  <button onClick={() => setIdiomas(prev => prev.filter((_, idx) => idx !== i))}
                    className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm">✕</button>
                </div>
              ))}
            </div>
            <button onClick={() => setIdiomas(prev => [...prev, ""])}
              className="w-full py-2 border-dashed border-2 border-neutral-300 rounded-lg text-sm text-neutral-500 hover:border-green-400 hover:text-green-700 transition">
              + Adicionar Idioma
            </button>
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

        {/* RIGHT — Edit + Preview */}
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

              {/* Editable content panel */}
              <div className="bg-white border rounded-xl p-5 space-y-5">
                <h3 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">✏️ Editar e Reescrever com IA</h3>

                {/* Resumo */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-neutral-500 uppercase">Resumo Profissional</label>
                    <button onClick={rewriteResumoAI} disabled={rewritingResumo}
                      className="px-3 py-1 bg-green-700 text-white rounded-lg text-xs font-semibold hover:bg-green-800 disabled:opacity-50 flex items-center gap-1">
                      {rewritingResumo ? <span className="animate-pulse">IA...</span> : "✦ Reescrever"}
                    </button>
                  </div>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2 text-sm resize-none h-24 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    value={resumeData.resumoProfissional}
                    onChange={e => updateResumo(e.target.value)}
                  />
                </div>

                {/* Bullets per experience */}
                {(resumeData.experiencia || []).map((exp: any) => (
                  <div key={exp.id} className="space-y-2">
                    <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide border-b pb-1">
                      {exp.cargo} — {exp.empresa}
                    </p>
                    {(exp.responsabilidades || []).map((r: any, i: number) => {
                      const isRewriting = rewritingBullet?.expId === exp.id && rewritingBullet?.idx === i;
                      return (
                        <div key={i} className="flex gap-2 items-start">
                          <textarea
                            className="flex-1 border rounded-lg px-3 py-2 text-xs resize-none h-16 focus:ring-2 focus:ring-green-500 focus:outline-none"
                            value={r.text}
                            onChange={e => updateBullet(exp.id, i, e.target.value)}
                          />
                          <button
                            onClick={() => rewriteBulletAI(exp.id, i, r.text, exp.cargo)}
                            disabled={!!rewritingBullet || isRewriting}
                            className="flex-shrink-0 px-2.5 py-1.5 bg-green-700 text-white rounded-lg text-xs font-semibold hover:bg-green-800 disabled:opacity-50 whitespace-nowrap mt-1"
                          >
                            {isRewriting ? <span className="animate-pulse">IA...</span> : "✦"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
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
