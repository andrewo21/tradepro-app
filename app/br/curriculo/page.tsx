"use client";

import { useState, useEffect } from "react";
import { useBrResumeStore } from "@/app/store/useBrResumeStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getOrCreateUserId } from "@/lib/userId";
import Watermark from "@/components/Watermark";
import BrResumeUpload from "@/components/BrResumeUpload";
import BrModernoAzul from "@/components/templates/brazil/BrModernoAzul";
import BrClasicoProfissional from "@/components/templates/brazil/BrClasicoProfissional";
import BrVerdeTecnico from "@/components/templates/brazil/BrVerdeTecnico";

const TEMPLATES = [
  { key: "br-moderno-azul", name: "Moderno Azul", component: BrModernoAzul },
  { key: "br-clasico-profissional", name: "Clássico Profissional", component: BrClasicoProfissional },
  { key: "br-verde-tecnico", name: "Verde Técnico", component: BrVerdeTecnico },
];

const SAMPLE_DATA = {
  personalInfo: {
    nome: "Carlos", sobrenome: "Silva",
    tituloProfissional: "Técnico em Refrigeração",
    telefone: "(11) 99999-9999", whatsapp: "(11) 99999-9999",
    email: "carlos.silva@email.com", linkedin: "linkedin.com/in/carlossilva",
    cidade: "São Paulo", estado: "SP", cpf: "", foto: "",
  },
  resumoProfissional: "Técnico em Refrigeração e Climatização com 8 anos de experiência em instalação, manutenção preventiva e corretiva de sistemas de ar-condicionado comercial e industrial. Habilitado para trabalho em altura e com certificação NR-10.",
  habilidades: [
    { text: "Instalação de Ar-Condicionado Split" },
    { text: "Manutenção Preventiva e Corretiva" },
    { text: "Refrigeração Industrial" },
    { text: "NR-10 e NR-35" },
  ],
  experiencia: [
    {
      id: "1", cargo: "Técnico de Refrigeração Sênior", empresa: "Clima Total Serviços",
      dataInicio: "03/2020", dataFim: "Atual",
      responsabilidades: [
        { id: "1", text: "Instalação e manutenção de sistemas de ar-condicionado em clientes comerciais" },
        { id: "2", text: "Diagnóstico e reparo de sistemas de refrigeração industrial" },
      ],
    },
  ],
  formacao: [{ instituicao: "SENAI São Paulo", curso: "Técnico em Refrigeração", anoConclusao: "2016", tipo: "Técnico" }],
  cursosCertificacoes: [{ nome: "NR-10 Segurança em Instalações Elétricas", instituicao: "SENAI", ano: "2021" }],
};

export default function BrCurriculoSelectPage() {
  const { selectedTemplate, setField } = useBrResumeStore();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const uid = getOrCreateUserId();
    fetch(`/api/debug/entitlements?userId=${uid}`)
      .then(r => r.json())
      .then(d => setHasAccess(!!(d.entitlements?.resume || d.entitlements?.bundle)))
      .catch(() => setHasAccess(false));
  }, []);

  const activeTemplate = TEMPLATES.find(t => t.key === selectedTemplate) || TEMPLATES[0];
  const PreviewComponent = activeTemplate.component;

  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-8 sm:p-10">

      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <div>
          <Link href="/br" className="text-sm text-green-600 hover:underline">← Início</Link>
          <h1 className="text-2xl font-semibold mt-1">Escolha seu Modelo</h1>
        </div>
        {!hasAccess && (
          <Link href="/br/precos" className="px-5 py-2.5 bg-green-700 text-white rounded-lg text-sm font-semibold hover:bg-green-800">
            Desbloquear — R$ 79
          </Link>
        )}
      </div>

      {!hasAccess && (
        <p className="text-neutral-500 text-sm mb-5">Veja os modelos abaixo. Adquira para criar seu currículo.</p>
      )}

      {/* Resume Upload */}
      <div className="mb-6 bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">⚡</span>
          <div>
            <p className="font-semibold text-sm text-neutral-900">Já tem um currículo? Envie e a IA preenche tudo automaticamente.</p>
            <p className="text-xs text-neutral-500">Envie seu PDF — extraímos seus dados e você ajusta o que precisar.</p>
          </div>
        </div>
        <BrResumeUpload />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Template list */}
        <div className="space-y-3">
          {TEMPLATES.map(t => (
            <button
              key={t.key}
              onClick={() => setField("selectedTemplate", t.key)}
              className={`w-full p-5 rounded-xl border text-left transition ${
                selectedTemplate === t.key ? "border-green-600 shadow-lg bg-green-50" : "border-neutral-300 bg-white hover:border-green-400"
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold text-neutral-900">{t.name}</h3>
                <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-1 rounded">Padrão</span>
              </div>
              <div className="flex justify-between mt-1">
                <p className="text-neutral-500 text-sm">Clique para visualizar</p>
                <p className="text-sm font-semibold text-green-700">Desbloquear — R$ 79</p>
              </div>
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="flex flex-col gap-4">
          <div className="relative">
            <PreviewComponent data={SAMPLE_DATA} showWatermark={true} />
          </div>
          {!hasAccess && (
            <div className="mt-2 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
              <p className="text-green-800 font-semibold mb-2">Pronto para criar seu currículo?</p>
              <p className="text-green-700 text-sm mb-3">Adquira para remover a marca d'água e inserir seus dados.</p>
              <Link href="/br/precos" className="inline-block px-6 py-2 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800">
                Começar — R$ 79
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 flex justify-end">
        <button
          onClick={() => hasAccess ? router.push("/br/curriculo/pessoal") : router.push("/br/precos")}
          className="px-6 py-3 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800"
        >
          {hasAccess ? "Continuar para o Passo 2 →" : "Adquirir para Continuar →"}
        </button>
      </div>
    </div>
  );
}
