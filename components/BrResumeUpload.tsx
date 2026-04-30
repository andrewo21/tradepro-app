"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useBrResumeStore } from "@/app/store/useBrResumeStore";

export default function BrResumeUpload() {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const store = useBrResumeStore();

  const ACCEPTED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  async function handleFile(file: File) {
    const isAccepted = ACCEPTED_TYPES.includes(file.type) ||
      file.name?.toLowerCase().endsWith(".pdf") ||
      file.name?.toLowerCase().endsWith(".docx");

    if (!file || !isAccepted) {
      setError("Por favor, envie um arquivo PDF ou Word (.docx).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Arquivo muito grande. Máximo 10MB.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/ai/parse-resume", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok || !json.data) {
        setError(json.detail || json.error || "Não foi possível ler seu currículo. Tente outro arquivo.");
        return;
      }

      const d = json.data;

      // Pre-fill Brazilian store
      if (d.personalInfo) {
        const p = d.personalInfo;
        store.setPersonalField("nome", p.firstName || "");
        store.setPersonalField("sobrenome", p.lastName || "");
        store.setPersonalField("tituloProfissional", p.tradeTitle || "");
        store.setPersonalField("telefone", p.phone || "");
        store.setPersonalField("email", p.email || "");
        store.setPersonalField("cidade", p.city || "");
        store.setPersonalField("estado", p.state || "");
      }

      if (d.summary) store.updateResumo(d.summary);

      if (Array.isArray(d.skills) && d.skills.length > 0) {
        store.setField("habilidades", d.skills.map((text: string) => ({ text, suggestion: null, loading: false })));
      }

      if (Array.isArray(d.experience) && d.experience.length > 0) {
        store.setField("experiencia", d.experience.map((exp: any) => ({
          id: `${Date.now()}-${Math.random()}`,
          cargo: exp.jobTitle || "",
          empresa: exp.company || "",
          dataInicio: exp.startDate || "",
          dataFim: exp.endDate || "",
          responsabilidades: (exp.responsibilities || []).map((text: string) => ({
            id: `${Date.now()}-${Math.random()}`,
            text,
          })),
        })));
      }

      if (Array.isArray(d.education) && d.education.length > 0) {
        store.setField("formacao", d.education.map((edu: any) => ({
          instituicao: edu.school || "",
          curso: edu.degree || "",
          anoConclusao: edu.year || "",
          tipo: "Técnico",
        })));
      }

      setSuccess(true);
      setTimeout(() => router.push("/br/curriculo/pessoal"), 1500);
    } catch (err: any) {
      setError(err?.message || "Erro de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  if (success) {
    return (
      <div className="border-2 border-green-400 bg-green-50 rounded-xl p-6 text-center">
        <div className="text-3xl mb-2">✓</div>
        <p className="font-semibold text-green-800">Currículo enviado e processado!</p>
        <p className="text-green-700 text-sm mt-1">Levando você para o editor — revise e ajuste seus dados.</p>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
          dragging ? "border-green-500 bg-green-50" : "border-neutral-300 bg-neutral-50 hover:border-green-400 hover:bg-green-50"
        }`}
      >
        <input ref={inputRef} type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

        {loading ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-green-700 font-medium text-sm">Lendo seu currículo...</p>
            <p className="text-neutral-500 text-xs">A IA está extraindo suas informações — cerca de 10 segundos.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">📄</div>
            <p className="font-semibold text-neutral-800">Arraste seu currículo aqui ou clique para enviar</p>
            <p className="text-sm text-neutral-500">PDF ou Word (.docx) · Máximo 10MB</p>
            <p className="text-xs text-neutral-400">A IA extrai suas informações e preenche o editor automaticamente</p>
          </div>
        )}
      </div>
      {error && <p className="mt-3 text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
    </div>
  );
}
