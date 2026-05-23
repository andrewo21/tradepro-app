"use client";

import { useEffect, useState } from "react";
import { useBrResumeStore } from "@/app/store/useBrResumeStore";
import Link from "next/link";
import dynamic from "next/dynamic";
const AskGringoButton = dynamic(() => import("@/components/AskGringoButton"), { ssr: false });

export default function BrHabilidadesPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return <BrHabilidadesContent />;
}

function BrHabilidadesContent() {
  const store = useBrResumeStore();
  const tecnicas = store.habilidadesTecnicas || [];
  const comportamentais = store.habilidadesComportamentais || [];
  const idiomas = store.idiomas || [];

  function updateTecnica(index: number, text: string) {
    const updated = [...tecnicas];
    if (updated[index]) updated[index] = { ...updated[index], text };
    store.setField("habilidadesTecnicas", updated);
  }

  function removeTecnica(index: number) {
    store.setField("habilidadesTecnicas", tecnicas.filter((_: any, i: number) => i !== index));
  }

  function addTecnica() {
    store.setField("habilidadesTecnicas", [...tecnicas, { text: "" }]);
  }

  function updateComportamental(index: number, text: string) {
    const updated = [...comportamentais];
    if (updated[index]) updated[index] = { ...updated[index], text };
    store.setField("habilidadesComportamentais", updated);
  }

  function removeComportamental(index: number) {
    store.setField("habilidadesComportamentais", comportamentais.filter((_: any, i: number) => i !== index));
  }

  function addComportamental() {
    store.setField("habilidadesComportamentais", [...comportamentais, { text: "" }]);
  }

  function updateIdioma(index: number, text: string) {
    const updated = [...idiomas];
    if (updated[index]) updated[index] = { ...updated[index], text };
    store.setField("idiomas", updated);
  }

  function removeIdioma(index: number) {
    store.setField("idiomas", idiomas.filter((_: any, i: number) => i !== index));
  }

  function addIdioma() {
    store.setField("idiomas", [...idiomas, { text: "" }]);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-neutral-500">Passo 2 de 6 — Habilidades</p>
        <AskGringoButton />
      </div>
      <h1 className="text-2xl font-semibold mb-2">Habilidades Profissionais</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Adicione suas habilidades. Uma por campo — use o botão <strong>+</strong> para adicionar mais.
      </p>

      <div className="space-y-8">

        {/* Habilidades Técnicas */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-base font-semibold text-neutral-800 mb-1">Habilidades Técnicas</h2>
          <p className="text-xs text-neutral-500 mb-4">
            Ferramentas, softwares, idiomas, sistemas, certificações — o que você sabe fazer tecnicamente.
          </p>
          <div className="space-y-2">
            {tecnicas.map((s: any, i: number) => (
              <div key={i} className="flex gap-2">
                <input
                  className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="ex: Excel avançado, NR-10, inglês básico, Autocad..."
                  value={s.text || ""}
                  onChange={e => updateTecnica(i, e.target.value)}
                />
                {tecnicas.length > 1 && (
                  <button
                    onClick={() => removeTecnica(i)}
                    className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm flex-shrink-0"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addTecnica}
            className="mt-3 w-full py-2 border-2 border-dashed border-neutral-300 rounded-lg text-sm text-neutral-500 hover:border-green-500 hover:text-green-700 transition"
          >
            + Adicionar Habilidade Técnica
          </button>
        </div>

        {/* Habilidades Comportamentais */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-base font-semibold text-neutral-800 mb-1">Habilidades Comportamentais</h2>
          <p className="text-xs text-neutral-500 mb-4">
            Comunicação, liderança, organização, trabalho em equipe — suas qualidades pessoais.
          </p>
          <div className="space-y-2">
            {comportamentais.map((s: any, i: number) => (
              <div key={i} className="flex gap-2">
                <input
                  className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="ex: comunicativo, organizado, trabalho bem em equipe..."
                  value={s.text || ""}
                  onChange={e => updateComportamental(i, e.target.value)}
                />
                {comportamentais.length > 1 && (
                  <button
                    onClick={() => removeComportamental(i)}
                    className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm flex-shrink-0"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addComportamental}
            className="mt-3 w-full py-2 border-2 border-dashed border-neutral-300 rounded-lg text-sm text-neutral-500 hover:border-green-500 hover:text-green-700 transition"
          >
            + Adicionar Habilidade Comportamental
          </button>
        </div>

        {/* Idiomas */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-base font-semibold text-neutral-800 mb-1">Idiomas</h2>
          <p className="text-xs text-neutral-500 mb-4">
            Inclua o idioma e o nível — ex: Inglês (intermediário), Espanhol (básico).
          </p>
          <div className="space-y-2">
            {idiomas.map((s: any, i: number) => (
              <div key={i} className="flex gap-2">
                <input
                  className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="ex: Inglês (intermediário), Espanhol (básico)..."
                  value={s.text || ""}
                  onChange={e => updateIdioma(i, e.target.value)}
                />
                {idiomas.length > 1 && (
                  <button
                    onClick={() => removeIdioma(i)}
                    className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm flex-shrink-0"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addIdioma}
            className="mt-3 w-full py-2 border-2 border-dashed border-neutral-300 rounded-lg text-sm text-neutral-500 hover:border-green-500 hover:text-green-700 transition"
          >
            + Adicionar Idioma
          </button>
        </div>

      </div>

      <div className="flex justify-between mt-8">
        <Link href="/br/curriculo/pessoal" className="px-6 py-2 bg-neutral-200 rounded-lg text-sm hover:bg-neutral-300">← Passo 1</Link>
        <Link href="/br/curriculo/experiencia" className="px-6 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800">Passo 3: Experiência →</Link>
      </div>
    </div>
  );
}
