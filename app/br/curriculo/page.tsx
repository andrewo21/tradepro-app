"use client";

import { useState, useEffect } from "react";
import { useBrResumeStore } from "@/app/store/useBrResumeStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getOrCreateUserId } from "@/lib/userId";
import Watermark from "@/components/Watermark";
import BrResumeUpload from "@/components/BrResumeUpload";
import GringoSpline from "@/components/assistant/GringoSpline";
import InstallPrompt from "@/components/InstallPrompt";
import BrModernoAzul from "@/components/templates/brazil/BrModernoAzul";
import BrClasicoProfissional from "@/components/templates/brazil/BrClasicoProfissional";
import BrVerdeTecnico from "@/components/templates/brazil/BrVerdeTecnico";
import BrSimplesDirecto from "@/components/templates/brazil/BrSimplesDirecto";
import BrExecutivoVerde from "@/components/templates/brazil/BrExecutivoVerde";
import BrConstrucaoBold from "@/components/templates/brazil/BrConstrucaoBold";
import BrTecnicoModerno from "@/components/templates/brazil/BrTecnicoModerno";
import BrPremiumDourado from "@/components/templates/brazil/BrPremiumDourado";
import BrMinimalistaBR from "@/components/templates/brazil/BrMinimalistaBR";

// All 9 templates — ATS compatibility badges
// Single-column = maximum ATS compatibility (all systems)
// Two-column = compatible with modern ATS (Gupy, Gaia) but great for visual impact
const TEMPLATES = [
  { key: "br-moderno-azul",         name: "Moderno Azul",        component: BrModernoAzul,          atsLevel: "full" },
  { key: "br-clasico-profissional", name: "Clássico Profissional",component: BrClasicoProfissional,  atsLevel: "full" },
  { key: "br-simples-direto",       name: "Simples & Direto",     component: BrSimplesDirecto,        atsLevel: "full" },
  { key: "br-minimalista-br",       name: "Minimalista BR",       component: BrMinimalistaBR,         atsLevel: "full" },
  { key: "br-verde-tecnico",        name: "Verde Técnico",        component: BrVerdeTecnico,          atsLevel: "modern" },
  { key: "br-executivo-verde",      name: "Executivo Verde",      component: BrExecutivoVerde,        atsLevel: "modern" },
  { key: "br-construcao-bold",      name: "Construção Bold",      component: BrConstrucaoBold,        atsLevel: "modern" },
  { key: "br-tecnico-moderno",      name: "Técnico Moderno",      component: BrTecnicoModerno,        atsLevel: "modern" },
  { key: "br-premium-dourado",      name: "Premium Dourado",      component: BrPremiumDourado,        atsLevel: "modern" },
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

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_BR || "";

function waLink(templateName: string) {
  const msg = encodeURIComponent(`Olá! Gostei do modelo "${templateName}" para meu currículo. Pode me ajudar?`);
  return WA_NUMBER ? `https://wa.me/${WA_NUMBER}?text=${msg}` : "/br/contato";
}

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

      <div className="mb-6">
        <Link href="/br" className="text-sm text-green-600 hover:underline">← Início</Link>
        <h1 className="text-2xl font-semibold mt-1">Passo 1 — Escolha seu Modelo</h1>
        <p className="text-neutral-600 text-sm mt-1">
          Selecione o modelo que preferir, visualize ao lado e avance. Gostou de um?{" "}
          <strong>Chame no WhatsApp</strong> e nós fazemos para você.
        </p>
      </div>

      {/* Ringo banner */}
      <div className="mb-8 rounded-2xl overflow-hidden bg-gradient-to-r from-green-950 via-green-900 to-green-950 border border-green-700/40 shadow-lg">
        <div className="flex items-center gap-6 px-6 py-5">
          <div className="flex-shrink-0 hidden sm:block">
            <GringoSpline size={80} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-green-300 text-xs font-bold uppercase tracking-widest mb-1">Gringo™ — Escritor de Currículo IA</p>
            <p className="text-white font-bold text-base leading-snug mb-1">
              Deixa o Gringo escrever seu currículo por você.
            </p>
            <p className="text-green-200/70 text-sm">
              Ele faz perguntas simples e monta tudo na hora. Veja antes de pagar.
            </p>
          </div>
          <div className="flex-shrink-0">
            <a href="/br/curriculo/ringo"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-400 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-green-500/20 whitespace-nowrap">
              🤖 Gringo escreve pra mim
            </a>
          </div>
        </div>
      </div>

      {/* Resume drop-in */}
      <div className="mb-8 bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-green-50 border-b border-green-100 px-5 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-700 flex items-center justify-center flex-shrink-0 text-white text-lg">📎</div>
          <div>
            <p className="font-semibold text-sm text-neutral-900">Já tem um currículo? Envie aqui e preenchemos tudo automaticamente.</p>
            <p className="text-xs text-neutral-500">Envie seu PDF ou Word — a IA extrai seus dados, você escolhe o modelo e avança para o próximo passo.</p>
          </div>
        </div>
        <div className="px-5 py-5">
          <BrResumeUpload />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Template list */}
        <div className="space-y-3">
          {TEMPLATES.map(t => (
            <div key={t.key}
              className={`rounded-xl border transition ${
                selectedTemplate === t.key
                  ? "border-green-600 shadow-lg bg-green-50"
                  : "border-neutral-300 bg-white hover:border-green-400"
              }`}
            >
              {/* Template info row */}
              <button
                onClick={() => setField("selectedTemplate", t.key)}
                className="w-full p-4 text-left"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-neutral-900">{t.name}</h3>
                    <p className="text-neutral-500 text-xs mt-0.5">Clique para visualizar à direita</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-700">
                      Incluído
                    </span>
                    {t.atsLevel === "full" ? (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700 whitespace-nowrap">
                        ✓ ATS Otimizado
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-neutral-100 text-neutral-500 whitespace-nowrap">
                        ATS Compatível
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {/* Action buttons */}
              <div className="px-4 pb-4 flex gap-2 flex-wrap">
                {/* WhatsApp — operator model */}
                <a href={waLink(t.name)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition hover:opacity-90"
                  style={{ backgroundColor: "#25D366" }}>
                  <svg viewBox="0 0 32 32" className="w-4 h-4" fill="white">
                    <path d="M16 2C8.268 2 2 8.268 2 16c0 2.444.658 4.733 1.805 6.7L2 30l7.5-1.775A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.43 11.43 0 0 1-5.82-1.593l-.418-.247-4.453 1.053 1.09-4.322-.274-.44A11.432 11.432 0 0 1 4.5 16C4.5 9.649 9.649 4.5 16 4.5S27.5 9.649 27.5 16 22.351 27.5 16 27.5zm6.29-8.47c-.345-.173-2.04-1.005-2.355-1.12-.315-.115-.545-.172-.774.173-.23.345-.89 1.12-1.09 1.348-.2.23-.4.258-.745.086-.345-.172-1.457-.537-2.775-1.713-1.025-.916-1.717-2.047-1.917-2.392-.2-.345-.021-.532.15-.703.154-.154.345-.4.518-.6.172-.2.23-.345.345-.575.115-.23.057-.43-.029-.603-.086-.172-.774-1.866-1.06-2.555-.28-.67-.564-.58-.774-.59-.2-.01-.43-.012-.66-.012-.23 0-.603.086-.918.43-.315.345-1.205 1.177-1.205 2.869s1.233 3.328 1.405 3.557c.172.23 2.427 3.71 5.88 5.204.822.355 1.463.567 1.963.725.824.263 1.575.226 2.168.137.66-.099 2.04-.834 2.327-1.638.287-.805.287-1.494.2-1.638-.085-.143-.315-.23-.66-.4z"/>
                  </svg>
                  Quero esse modelo
                </a>

                {!hasAccess && (
                  <Link href="/br/precos"
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-green-600 text-green-700 hover:bg-green-50 transition">
                    Fazer eu mesmo — R$ 49
                  </Link>
                )}
                {hasAccess && (
                  <button onClick={() => { setField("selectedTemplate", t.key); router.push("/br/curriculo/pessoal"); }}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-green-600 text-green-700 hover:bg-green-50 transition">
                    Usar este modelo →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Live preview — NO watermark so customers see exactly what they get */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="bg-neutral-200 rounded-xl p-1 mb-2 text-center text-xs text-neutral-500 font-medium">
            Visualizando: <span className="text-green-700 font-semibold">{activeTemplate.name}</span>
          </div>
          <div className="bg-white border border-neutral-300 rounded-xl shadow-xl overflow-hidden">
            <PreviewComponent data={SAMPLE_DATA} showWatermark={true} />
          </div>

          {/* WhatsApp CTA under preview */}
          <a href={waLink(activeTemplate.name)}
            target="_blank" rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-3 w-full py-3 rounded-xl font-bold text-white text-sm transition hover:opacity-90 shadow-md"
            style={{ backgroundColor: "#25D366" }}>
            <svg viewBox="0 0 32 32" className="w-5 h-5" fill="white">
              <path d="M16 2C8.268 2 2 8.268 2 16c0 2.444.658 4.733 1.805 6.7L2 30l7.5-1.775A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.43 11.43 0 0 1-5.82-1.593l-.418-.247-4.453 1.053 1.09-4.322-.274-.44A11.432 11.432 0 0 1 4.5 16C4.5 9.649 9.649 4.5 16 4.5S27.5 9.649 27.5 16 22.351 27.5 16 27.5zm6.29-8.47c-.345-.173-2.04-1.005-2.355-1.12-.315-.115-.545-.172-.774.173-.23.345-.89 1.12-1.09 1.348-.2.23-.4.258-.745.086-.345-.172-1.457-.537-2.775-1.713-1.025-.916-1.717-2.047-1.917-2.392-.2-.345-.021-.532.15-.703.154-.154.345-.4.518-.6.172-.2.23-.345.345-.575.115-.23.057-.43-.029-.603-.086-.172-.774-1.866-1.06-2.555-.28-.67-.564-.58-.774-.59-.2-.01-.43-.012-.66-.012-.23 0-.603.086-.918.43-.315.345-1.205 1.177-1.205 2.869s1.233 3.328 1.405 3.557c.172.23 2.427 3.71 5.88 5.204.822.355 1.463.567 1.963.725.824.263 1.575.226 2.168.137.66-.099 2.04-.834 2.327-1.638.287-.805.287-1.494.2-1.638-.085-.143-.315-.23-.66-.4z"/>
            </svg>
            Quero o modelo "{activeTemplate.name}" — Chamar no WhatsApp
          </a>
          <p className="text-center text-xs text-neutral-500 mt-2">Respondemos em minutos • Sem compromisso</p>
        </div>
      </div>
    </div>
  );
}
