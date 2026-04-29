"use client";

import { useBrResumeStore } from "@/app/store/useBrResumeStore";
import Link from "next/link";
import { useState } from "react";

export default function BrPessoalPage() {
  const { personalInfo, setPersonalField } = useBrResumeStore();
  const [preview, setPreview] = useState<string>(personalInfo.foto || "");

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPersonalField("foto", result);
      setPreview(result);
    };
    reader.readAsDataURL(file);
  }

  const f = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setPersonalField(field, e.target.value);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <p className="text-sm text-neutral-500 mb-1">Passo 1 de 6 — Dados Pessoais</p>
      <h1 className="text-2xl font-semibold mb-6">Dados Pessoais</h1>

      <div className="space-y-6">

        {/* Photo upload */}
        <section className="bg-white border rounded-xl p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 mb-4">Foto (opcional)</h2>
          <div className="flex items-center gap-6">
            {preview ? (
              <img src={preview} alt="Foto" className="w-20 h-20 rounded-full object-cover border-2 border-neutral-300" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-neutral-100 border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 text-xs">Foto</div>
            )}
            <div>
              <input type="file" accept="image/*" onChange={handleFoto}
                className="block text-sm text-neutral-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-700 file:text-white hover:file:bg-green-800 cursor-pointer" />
              <p className="text-xs text-neutral-400 mt-1">JPG ou PNG. Recomendado: foto profissional.</p>
            </div>
          </div>
        </section>

        {/* Name and title */}
        <section className="bg-white border rounded-xl p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 mb-4">Identificação</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Nome Completo</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Carlos" value={personalInfo.nome} onChange={f("nome")} /></div>
            <div><label className="block text-sm font-medium mb-1">Sobrenome</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Silva" value={personalInfo.sobrenome} onChange={f("sobrenome")} /></div>
            <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1">Título Profissional</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="ex: Técnico em Refrigeração, Mestre de Obras, Engenheiro" value={personalInfo.tituloProfissional} onChange={f("tituloProfissional")} /></div>
            <div><label className="block text-sm font-medium mb-1">CPF <span className="text-neutral-400 font-normal">(opcional)</span></label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="000.000.000-00" value={personalInfo.cpf} onChange={f("cpf")} /></div>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-white border rounded-xl p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 mb-4">Contato</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Telefone</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="(11) 99999-9999" value={personalInfo.telefone} onChange={f("telefone")} /></div>
            <div><label className="block text-sm font-medium mb-1">WhatsApp</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="(11) 99999-9999" value={personalInfo.whatsapp} onChange={f("whatsapp")} /></div>
            <div><label className="block text-sm font-medium mb-1">E-mail</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="voce@email.com" value={personalInfo.email} onChange={f("email")} /></div>
            <div><label className="block text-sm font-medium mb-1">LinkedIn</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="linkedin.com/in/seunome" value={personalInfo.linkedin} onChange={f("linkedin")} /></div>
            <div><label className="block text-sm font-medium mb-1">Cidade</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="São Paulo" value={personalInfo.cidade} onChange={f("cidade")} /></div>
            <div><label className="block text-sm font-medium mb-1">Estado</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="SP" value={personalInfo.estado} onChange={f("estado")} /></div>
          </div>
        </section>

      </div>

      <div className="flex justify-between mt-8">
        <Link href="/br/curriculo" className="px-6 py-2 bg-neutral-200 rounded-lg text-sm hover:bg-neutral-300">← Modelos</Link>
        <Link href="/br/curriculo/habilidades" className="px-6 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800">Passo 2: Habilidades →</Link>
      </div>
    </div>
  );
}
