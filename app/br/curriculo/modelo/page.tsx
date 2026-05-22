"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBrResumeStore } from "@/app/store/useBrResumeStore";
import GringoCharacter from "@/components/assistant/GringoCharacter";
import BrModernoAzul from "@/components/templates/brazil/BrModernoAzul";
import BrClasicoProfissional from "@/components/templates/brazil/BrClasicoProfissional";
import BrVerdeTecnico from "@/components/templates/brazil/BrVerdeTecnico";
import BrSimplesDirecto from "@/components/templates/brazil/BrSimplesDirecto";
import BrExecutivoVerde from "@/components/templates/brazil/BrExecutivoVerde";
import BrConstrucaoBold from "@/components/templates/brazil/BrConstrucaoBold";
import BrTecnicoModerno from "@/components/templates/brazil/BrTecnicoModerno";
import BrPremiumDourado from "@/components/templates/brazil/BrPremiumDourado";
import BrMinimalistaBR from "@/components/templates/brazil/BrMinimalistaBR";

const TEMPLATES = [
  { key: "br-moderno-azul",         name: "Moderno Azul",         component: BrModernoAzul,         atsLevel: "full" },
  { key: "br-clasico-profissional", name: "Clássico Profissional", component: BrClasicoProfissional,  atsLevel: "full" },
  { key: "br-simples-direto",       name: "Simples & Direto",      component: BrSimplesDirecto,       atsLevel: "full" },
  { key: "br-minimalista-br",       name: "Minimalista BR",        component: BrMinimalistaBR,        atsLevel: "full" },
  { key: "br-verde-tecnico",        name: "Verde Técnico",         component: BrVerdeTecnico,         atsLevel: "modern" },
  { key: "br-executivo-verde",      name: "Executivo Verde",       component: BrExecutivoVerde,       atsLevel: "modern" },
  { key: "br-construcao-bold",      name: "Construção Bold",       component: BrConstrucaoBold,       atsLevel: "modern" },
  { key: "br-tecnico-moderno",      name: "Técnico Moderno",       component: BrTecnicoModerno,       atsLevel: "modern" },
  { key: "br-premium-dourado",      name: "Premium Dourado",       component: BrPremiumDourado,       atsLevel: "modern" },
];

const SAMPLE_DATA = {
  personalInfo: {
    nome: "Carlos", sobrenome: "Silva",
    tituloProfissional: "Técnico em Refrigeração",
    telefone: "(11) 99999-9999", whatsapp: "",
    email: "carlos@email.com", linkedin: "",
    cidade: "São Paulo", estado: "SP", cpf: "", foto: "",
  },
  resumoProfissional: "Técnico com 8 anos de experiência em instalação e manutenção preventiva.",
  habilidades: [
    { text: "Instalação de Ar-Condicionado" },
    { text: "Manutenção Preventiva" },
    { text: "NR-10 e NR-35" },
  ],
  experiencia: [
    {
      id: "1", cargo: "Técnico de Refrigeração", empresa: "Clima Total",
      dataInicio: "03/2020", dataFim: "Atual",
      responsabilidades: [
        { id: "1", text: "Instalação e manutenção de sistemas de ar-condicionado" },
      ],
    },
  ],
  formacao: [{ instituicao: "SENAI São Paulo", curso: "Técnico em Refrigeração", anoConclusao: "2016", tipo: "Técnico" }],
  cursosCertificacoes: [{ nome: "NR-10", instituicao: "SENAI", ano: "2021" }],
};

export default function ModeloPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <ModeloContent />;
}

function ModeloContent() {
  const router = useRouter();
  const { selectedTemplate, setField } = useBrResumeStore();
  const activeTemplate = TEMPLATES.find(t => t.key === selectedTemplate) || TEMPLATES[0];
  const PreviewComponent = activeTemplate.component;

  function handleContinue() {
    router.push("/br/curriculo/gringo");
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Gringo header */}
      <div className="bg-gradient-to-r from-green-950 via-green-900 to-green-950 px-6 py-5 flex items-center gap-5 shadow-xl">
        <GringoCharacter mood="wave" size={80} />
        <div>
          <p className="text-green-300 text-xs font-bold uppercase tracking-widest mb-0.5">Gringo™ — Passo 1 de 2</p>
          <h1 className="text-white font-bold text-lg leading-snug">Escolha o modelo do seu currículo</h1>
          <p className="text-green-200/70 text-sm">Depois eu preencho tudo para você conversando.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Template list */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">Selecione um modelo:</p>
          {TEMPLATES.map(t => (
            <button
              key={t.key}
              onClick={() => setField("selectedTemplate", t.key)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                selectedTemplate === t.key
                  ? "border-green-600 bg-green-50 shadow-md"
                  : "border-neutral-200 bg-white hover:border-green-400"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`font-semibold text-sm ${selectedTemplate === t.key ? "text-green-800" : "text-neutral-800"}`}>
                  {t.name}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                  t.atsLevel === "full"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-neutral-100 text-neutral-500"
                }`}>
                  {t.atsLevel === "full" ? "✓ ATS Otimizado" : "ATS Compatível"}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Preview + continue button */}
        <div className="lg:sticky lg:top-6 lg:self-start flex flex-col gap-4">
          <div className="bg-neutral-200 rounded-xl p-1 text-center text-xs text-neutral-500 font-medium">
            Visualizando: <span className="text-green-700 font-semibold">{activeTemplate.name}</span>
          </div>
          <div className="bg-white border border-neutral-300 rounded-xl shadow-xl overflow-hidden">
            <PreviewComponent data={SAMPLE_DATA} showWatermark={true} />
          </div>
          <button
            onClick={handleContinue}
            className="w-full py-3.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl transition shadow-lg text-sm flex items-center justify-center gap-2"
          >
            🤖 Continuar com este modelo — Deixa o Gringo preencher →
          </button>
        </div>
      </div>
    </div>
  );
}
