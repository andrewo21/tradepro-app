"use client";

import { useState, useEffect } from "react";
import { useBrCoverLetterStore } from "@/app/store/useBrCoverLetterStore";
import { getOrCreateUserId } from "@/lib/userId";
import Link from "next/link";
import { ModernBlueCoverLetter, TraditionalCoverLetter, type CoverLetterTemplateKey } from "@/components/CoverLetterTemplates";
import { coverLetterTemplates } from "@/components/CoverLetterTemplates";

const MAX_DOWNLOADS = 2;

export default function BrCartaPage() {
  const store = useBrCoverLetterStore();
  const {
    candidatoNome, candidatoEmail, candidatoTelefone, candidatoWhatsapp,
    candidatoEndereco, candidatoCidadeEstado, data,
    nomeContratante, nomeEmpresa, enderecoEmpresa, cidadeEstadoEmpresa,
    cargoPretendido, saudacao, experiencia, cartaGerada,
    setField, setCartaGerada, clearAll,
  } = store;

  const [userId] = useState(() => getOrCreateUserId());
  const [selectedTemplate, setSelectedTemplate] = useState<CoverLetterTemplateKey>("modern-blue");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loadingExtract, setLoadingExtract] = useState(false);
  const [loadingCarta, setLoadingCarta] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [downloadsUsed, setDownloadsUsed] = useState<number | null>(null);
  const [revoked, setRevoked] = useState(false);

  useEffect(() => {
    if (!data) {
      const hoje = new Date();
      setField("data", `${String(hoje.getDate()).padStart(2, "0")}/${String(hoje.getMonth() + 1).padStart(2, "0")}/${hoje.getFullYear()}`);
    }
    fetch(`/api/debug/entitlements?userId=${userId}`)
      .then(r => r.json())
      .then(d => {
        setDownloadsUsed(d.entitlements?.coverLetterDownloads ?? 0);
        if (!d.entitlements?.coverLetter && !d.entitlements?.bundle) setRevoked(true);
      })
      .catch(() => null);
  }, [userId]); // eslint-disable-line

  const remaining = downloadsUsed !== null ? Math.max(0, MAX_DOWNLOADS - downloadsUsed) : null;

  async function handleExtract() {
    if (!resumeFile) return alert("Selecione um arquivo PDF.");
    setLoadingExtract(true);
    try {
      const formData = new FormData();
      formData.append("file", resumeFile);
      const res = await fetch("/api/ai/extract-summary", { method: "POST", body: formData });
      const d = await res.json();
      if (d.summary) setField("experiencia", d.summary);
    } catch { alert("Erro ao extrair dados. Tente novamente."); }
    finally { setLoadingExtract(false); }
  }

  async function handleGerar() {
    setLoadingCarta(true);
    try {
      const res = await fetch("/api/ai/br/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `Escreva o corpo de uma carta de apresentação profissional em português para ${candidatoNome || "o candidato"} se candidatando ao cargo de ${cargoPretendido || "vaga em aberto"} na empresa ${nomeEmpresa || "a empresa"}. Contexto e experiência: ${experiencia}`,
          type: "carta",
        }),
      });
      const d = await res.json();
      if (d.suggestion) {
        const saudacaoTexto = saudacao === "A quem" ? "A quem possa interessar," : `${saudacao} ${nomeContratante || "Senhor(a)"},`;
        const carta = `${saudacaoTexto}\n\n${d.suggestion}\n\nAtenciosamente,\n\n${candidatoNome}`;
        setCartaGerada(carta);
      }
    } catch { alert("Erro ao gerar carta. Tente novamente."); }
    finally { setLoadingCarta(false); }
  }

  async function handleDownloadPDF() {
    if (!cartaGerada || revoked) return;
    setLoadingPDF(true);
    try {
      const res = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "cover-letter",
          applicantName: candidatoNome,
          applicantEmail: candidatoEmail,
          applicantPhone: candidatoTelefone || candidatoWhatsapp,
          applicantAddress: candidatoEndereco,
          applicantCityStateZip: candidatoCidadeEstado,
          date: data,
          hiringManager: nomeContratante,
          companyName: nomeEmpresa,
          companyAddress: enderecoEmpresa,
          companyCityStateZip: cidadeEstadoEmpresa,
          letter: cartaGerada,
        }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "Carta-de-Apresentacao.pdf"; a.click();

      const record = await fetch("/api/stripe/record-download", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type: "coverLetter" }),
      });
      const data2 = await record.json();
      if (data2.success) {
        setDownloadsUsed(data2.downloadsUsed);
        if (data2.revoked) { setRevoked(true); clearAll(); }
      }
    } catch { alert("Erro ao gerar PDF."); }
    finally { setLoadingPDF(false); }
  }

  const previewData = {
    applicantName: candidatoNome, applicantEmail: candidatoEmail,
    applicantPhone: candidatoTelefone || candidatoWhatsapp,
    applicantAddress: candidatoEndereco, applicantCityStateZip: candidatoCidadeEstado,
    date: data, hiringManager: nomeContratante, companyName: nomeEmpresa,
    companyAddress: enderecoEmpresa, companyCityStateZip: cidadeEstadoEmpresa,
    jobTitle: cargoPretendido, letter: cartaGerada,
  };

  if (revoked) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 text-center">
        <div className="text-5xl mb-6">✓</div>
        <h1 className="text-3xl font-bold mb-4">Tudo pronto!</h1>
        <p className="text-neutral-600 mb-8">Você utilizou seus 2 downloads. Adquira uma nova sessão para continuar.</p>
        <Link href="/br/precos" className="inline-block px-8 py-3 bg-green-700 text-white rounded-lg font-bold hover:bg-green-800">
          Adquirir Nova Sessão
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-8">
      <div className="border-b pb-4 flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Carta de Apresentação</h1>
        {remaining !== null && (
          <div className={`px-4 py-2 rounded-lg text-sm font-medium w-fit ${
            remaining === 0 ? "bg-red-50 border border-red-200 text-red-700" :
            remaining === 1 ? "bg-amber-50 border border-amber-200 text-amber-800" :
            "bg-blue-50 border border-blue-200 text-blue-700"
          }`}>
            {remaining === MAX_DOWNLOADS && `${MAX_DOWNLOADS} downloads em PDF incluídos.`}
            {remaining === 1 && "⚠ Último download — certifique-se que está tudo certo."}
            {remaining === 0 && "Downloads esgotados. Adquira uma nova sessão."}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">

          {/* Dados do candidato */}
          <section className="bg-slate-50 p-6 rounded-xl border space-y-4">
            <h2 className="font-bold text-blue-800 uppercase text-sm">1. Seus Dados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="border p-2 rounded text-sm" placeholder="Nome Completo" value={candidatoNome} onChange={e => setField("candidatoNome", e.target.value)} />
              <input className="border p-2 rounded text-sm" placeholder="E-mail" value={candidatoEmail} onChange={e => setField("candidatoEmail", e.target.value)} />
              <input className="border p-2 rounded text-sm" placeholder="Telefone" value={candidatoTelefone} onChange={e => setField("candidatoTelefone", e.target.value)} />
              <input className="border p-2 rounded text-sm" placeholder="WhatsApp" value={candidatoWhatsapp} onChange={e => setField("candidatoWhatsapp", e.target.value)} />
              <input className="border p-2 rounded text-sm" placeholder="Endereço" value={candidatoEndereco} onChange={e => setField("candidatoEndereco", e.target.value)} />
              <input className="border p-2 rounded text-sm" placeholder="Cidade, Estado" value={candidatoCidadeEstado} onChange={e => setField("candidatoCidadeEstado", e.target.value)} />
            </div>
          </section>

          {/* Dados da empresa */}
          <section className="bg-slate-50 p-6 rounded-xl border space-y-4">
            <h2 className="font-bold text-blue-800 uppercase text-sm">2. Dados da Empresa</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="border p-2 rounded text-sm" placeholder="Cargo Pretendido" value={cargoPretendido} onChange={e => setField("cargoPretendido", e.target.value)} />
              <select className="border p-2 rounded text-sm bg-white" value={saudacao} onChange={e => setField("saudacao", e.target.value)}>
                <option value="Prezado(a)">Prezado(a) [Nome]</option>
                <option value="A quem">A quem possa interessar</option>
              </select>
              <input className="border p-2 rounded text-sm" placeholder="Nome do Responsável" value={nomeContratante} onChange={e => setField("nomeContratante", e.target.value)} />
              <input className="border p-2 rounded text-sm" placeholder="Nome da Empresa" value={nomeEmpresa} onChange={e => setField("nomeEmpresa", e.target.value)} />
              <input className="border p-2 rounded sm:col-span-2 text-sm" placeholder="Endereço da Empresa" value={enderecoEmpresa} onChange={e => setField("enderecoEmpresa", e.target.value)} />
              <input className="border p-2 rounded sm:col-span-2 text-sm" placeholder="Cidade, Estado da Empresa" value={cidadeEstadoEmpresa} onChange={e => setField("cidadeEstadoEmpresa", e.target.value)} />
            </div>
          </section>

          {/* Dados do currículo */}
          <section className="bg-blue-50 p-6 rounded-xl border border-blue-100 space-y-4">
            <h2 className="font-bold text-blue-800 text-sm">3. Sua Experiência</h2>
            <input type="file" accept=".pdf" onChange={e => setResumeFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-blue-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
            <button onClick={handleExtract} disabled={loadingExtract} className="w-full bg-slate-800 text-white p-2.5 rounded-lg font-bold text-sm">
              {loadingExtract ? "Extraindo..." : "Extrair Resumo do Currículo"}
            </button>
            <textarea className="w-full border p-3 rounded h-28 text-sm" placeholder="Descreva sua experiência profissional..." value={experiencia} onChange={e => setField("experiencia", e.target.value)} />
          </section>

          <div className="flex gap-3">
            <button onClick={handleGerar} disabled={loadingCarta} className="flex-1 bg-green-700 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-800 disabled:opacity-50">
              {loadingCarta ? "Gerando..." : "Gerar Carta"}
            </button>
            {cartaGerada && (
              <button onClick={handleDownloadPDF} disabled={loadingPDF || remaining === 0}
                className="flex-1 bg-blue-800 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-900 disabled:opacity-50">
                {loadingPDF ? "Gerando..." : "Baixar PDF"}
              </button>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            {(Object.keys(coverLetterTemplates) as CoverLetterTemplateKey[]).map(key => (
              <button key={key} onClick={() => setSelectedTemplate(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                  selectedTemplate === key ? "bg-blue-700 text-white border-blue-700" : "bg-white text-slate-700 border-slate-300 hover:border-blue-400"
                }`}>
                {coverLetterTemplates[key].name}
              </button>
            ))}
          </div>

          {(() => {
            const TemplateComponent = coverLetterTemplates[selectedTemplate].component;
            return <TemplateComponent data={previewData} />;
          })()}

          <div className="bg-slate-50 rounded-xl border p-4">
            <p className="text-xs text-slate-500 mb-2 font-medium">Editar texto da carta:</p>
            <textarea
              className="w-full border-none focus:ring-0 font-serif leading-relaxed text-slate-800 outline-none resize-none bg-transparent text-sm h-40"
              value={cartaGerada} onChange={e => setCartaGerada(e.target.value)}
              placeholder="A carta gerada aparecerá aqui..." />
          </div>
        </div>
      </div>
    </div>
  );
}
