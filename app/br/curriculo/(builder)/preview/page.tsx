"use client";

import { useState, useEffect, useRef } from "react";
import { useBrResumeStore } from "@/app/store/useBrResumeStore";
import Link from "next/link";
import { getOrCreateUserId } from "@/lib/userId";
import BrModernoAzul from "@/components/templates/brazil/BrModernoAzul";
import BrClasicoProfissional from "@/components/templates/brazil/BrClasicoProfissional";
import BrVerdeTecnico from "@/components/templates/brazil/BrVerdeTecnico";
import BrSimplesDirecto from "@/components/templates/brazil/BrSimplesDirecto";
import BrExecutivoVerde from "@/components/templates/brazil/BrExecutivoVerde";
import BrConstrucaoBold from "@/components/templates/brazil/BrConstrucaoBold";
import BrTecnicoModerno from "@/components/templates/brazil/BrTecnicoModerno";
import BrPremiumDourado from "@/components/templates/brazil/BrPremiumDourado";
import BrMinimalistaBR from "@/components/templates/brazil/BrMinimalistaBR";

const MAX_DOWNLOADS = 3;

const TEMPLATES: Record<string, any> = {
  "br-moderno-azul": BrModernoAzul,
  "br-clasico-profissional": BrClasicoProfissional,
  "br-verde-tecnico": BrVerdeTecnico,
  "br-simples-direto": BrSimplesDirecto,
  "br-executivo-verde": BrExecutivoVerde,
  "br-construcao-bold": BrConstrucaoBold,
  "br-tecnico-moderno": BrTecnicoModerno,
  "br-premium-dourado": BrPremiumDourado,
  "br-minimalista-br": BrMinimalistaBR,
};

// Map BR template key to US PDF template key
const BR_TO_PDF_TEMPLATE: Record<string, string> = {
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

export default function BrPreviewPage() {
  const store = useBrResumeStore();
  const [loading, setLoading] = useState(false);
  const [userId] = useState(() => getOrCreateUserId());
  const [downloadsUsed, setDownloadsUsed] = useState<number | null>(null);
  const [revoked, setRevoked] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/debug/entitlements?userId=${userId}`)
      .then(r => r.json())
      .then(d => {
        setDownloadsUsed(d.entitlements?.resumeDownloads ?? 0);
        if (!d.entitlements?.resume && !d.entitlements?.bundle) setRevoked(true);
      });
  }, [userId]);

  // Intercept browser print — redirect to PDF download
  useEffect(() => {
    function onBeforePrint(e: Event) { e.preventDefault(); handleDownload(); }
    window.addEventListener("beforeprint", onBeforePrint);
    return () => window.removeEventListener("beforeprint", onBeforePrint);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const remaining = downloadsUsed !== null ? Math.max(0, MAX_DOWNLOADS - downloadsUsed) : null;
  const TemplateComponent = TEMPLATES[store.selectedTemplate] || BrModernoAzul;

  const resumeData = {
    personalInfo: store.personalInfo,
    resumoProfissional: store.resumoProfissional,
    // Merge habilidadesTecnicas (Gringo flow) with legacy habilidades — deduplicated
    habilidades: (() => {
      const tecnicas = store.habilidadesTecnicas || [];
      const legacy   = store.habilidades || [];
      const tecnicaTexts = new Set(tecnicas.map((h: any) => (h.text || h).toLowerCase().trim()));
      const extra = legacy.filter((h: any) => !tecnicaTexts.has((h.text || h).toLowerCase().trim()));
      return [...tecnicas, ...extra];
    })(),
    habilidadesComportamentais: store.habilidadesComportamentais || [],
    idiomas: store.idiomas || [],
    experiencia: store.experiencia,
    formacao: store.formacao,
    // Deduplicated certifications — avoid repeating the same nome
    cursosCertificacoes: (() => {
      const seen = new Set<string>();
      return (store.cursosCertificacoes || []).filter((c: any) => {
        const key = (c.nome || "").toLowerCase().trim();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    })(),
  };

  const buildPayload = () => ({
    type: "resume",
    locale: "pt-BR",
    selectedTemplate: BR_TO_PDF_TEMPLATE[store.selectedTemplate] || "standard-contemporary",
    name: `${store.personalInfo.nome || ""} ${store.personalInfo.sobrenome || ""}`.trim(),
    title: store.personalInfo.tituloProfissional || "",
    photo: store.personalInfo.foto || undefined,
    contact: {
      phone: store.personalInfo.telefone || store.personalInfo.whatsapp || "",
      email: store.personalInfo.email || "",
      location: `${store.personalInfo.cidade || ""}${store.personalInfo.cidade && store.personalInfo.estado ? ", " : ""}${store.personalInfo.estado || ""}`,
      linkedin: store.personalInfo.linkedin || "",
    },
    summary: store.resumoProfissional || "",
    skills: [
      ...(store.habilidadesTecnicas || store.habilidades || []).map((h: any) => h.text || h),
    ].filter(Boolean),
    softSkills: (store.habilidadesComportamentais || []).map((h: any) => h.text || h).filter(Boolean),
    experience: (store.experiencia || []).map((exp: any) => ({
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
    education: (store.formacao || []).map((f: any) => ({
      school: f.instituicao || "",
      degree: f.curso || "",
    })),
    certifications: (() => {
      const seen = new Set<string>();
      const result: string[] = [];
      for (const c of (store.cursosCertificacoes || [])) {
        const name = c.nome || "";
        if (name && !seen.has(name.toLowerCase())) { seen.add(name.toLowerCase()); result.push(name); }
      }
      for (const i of (store.idiomas || [])) {
        const lang = `Idioma: ${i.text || i}`;
        if (!seen.has(lang.toLowerCase())) { seen.add(lang.toLowerCase()); result.push(lang); }
      }
      return result;
    })(),
  });

  async function handleDownload() {
    if (revoked) return;
    setLoading(true);
    try {
      const pdfPayload = buildPayload();

      const pdfRes = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pdfPayload),
      });

      if (!pdfRes.ok) throw new Error("Falha ao gerar PDF");

      const blob = await pdfRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Curriculo.pdf";
      a.click();
      window.URL.revokeObjectURL(url);

      // Record download server-side
      const record = await fetch("/api/stripe/record-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type: "resume" }),
      });
      const data = await record.json();
      if (data.success) {
        setDownloadsUsed(data.downloadsUsed);
        if (data.revoked) { setRevoked(true); store.clearAll(); }
      }
    } catch { alert("Erro ao gerar PDF. Tente novamente."); }
    finally { setLoading(false); }
  }

  if (revoked) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 text-center">
        <div className="text-5xl mb-6">✓</div>
        <h1 className="text-3xl font-bold mb-4">Tudo certo!</h1>
        <p className="text-neutral-600 mb-8">Você utilizou seus 2 downloads. Adquira uma nova sessão para continuar editando.</p>
        <Link href="/br/precos" className="inline-block px-8 py-3 bg-green-700 text-white rounded-lg font-bold hover:bg-green-800">
          Adquirir Nova Sessão
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Print warning */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="no-print mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-center gap-2">
        <span className="text-base">🖨️</span>
        <span>Para imprimir, <strong>baixe o PDF</strong> abaixo e imprima pelo Adobe Reader ou Preview. Imprimir diretamente pelo navegador gera texto muito pequeno.</span>
      </div>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Visualização Final</h1>
          <p className="text-sm text-neutral-500">Modelo: {store.selectedTemplate.replace("br-", "").replace(/-/g, " ")}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/br/curriculo/resumo" className="px-4 py-2 border rounded-lg text-sm hover:bg-neutral-50">Editar</Link>
          <button
            onClick={handleDownload}
            disabled={loading || remaining === 0}
            className="px-6 py-2 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 disabled:opacity-50"
          >
            {loading ? "Gerando..." : "Baixar Currículo PDF"}
          </button>
        </div>
      </div>

      {remaining !== null && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
          remaining === 0 ? "bg-red-50 border border-red-200 text-red-700" :
          remaining === 1 ? "bg-amber-50 border border-amber-200 text-amber-800" :
          "bg-blue-50 border border-blue-200 text-blue-700"
        }`}>
          {remaining === MAX_DOWNLOADS && `Você tem ${MAX_DOWNLOADS} downloads em PDF incluídos com sua compra.`}
          {remaining === 1 && "⚠ Último download disponível — certifique-se que está tudo certo."}
          {remaining === 0 && "Todos os downloads foram utilizados. Adquira uma nova sessão."}
        </div>
      )}

      {/* Template rendered here — this is what gets screenshotted */}
      <div ref={previewRef} className="bg-white border rounded-xl shadow-xl overflow-hidden">
        <TemplateComponent data={resumeData} showWatermark={false} />
      </div>
    </div>
  );
}
