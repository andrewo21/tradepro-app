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

const MAX_DOWNLOADS = 2;

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

  const remaining = downloadsUsed !== null ? Math.max(0, MAX_DOWNLOADS - downloadsUsed) : null;
  const TemplateComponent = TEMPLATES[store.selectedTemplate] || BrModernoAzul;

  const resumeData = {
    personalInfo: store.personalInfo,
    resumoProfissional: store.resumoProfissional,
    habilidades: store.habilidades,
    experiencia: store.experiencia,
    formacao: store.formacao,
    cursosCertificacoes: store.cursosCertificacoes,
  };

  async function handleDownload() {
    if (!previewRef.current || revoked) return;
    setLoading(true);
    try {
      // Screenshot the rendered template — same method as US builder
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
      const imgX = (pageWidth - canvas.width * ratio) / 2;

      pdf.addImage(imgData, "PNG", imgX, 0, canvas.width * ratio, canvas.height * ratio);
      pdf.save("Curriculo.pdf");

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
