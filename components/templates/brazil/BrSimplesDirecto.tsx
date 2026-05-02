"use client";
import Watermark from "@/components/Watermark";

export default function BrSimplesDirecto({ data, mode = "preview", showWatermark = true }: any) {
  const p = data?.personalInfo || {};
  const fs = mode === "pdf" ? "text-[11px]" : "text-[13px]";
  return (
    <div className={`relative font-sans ${fs} text-neutral-900 bg-white p-8`}>
      <Watermark show={showWatermark} />
      {/* Clean single column — maximally ATS friendly */}
      <div className="border-b-2 border-neutral-900 pb-4 mb-5">
        <h1 className="text-2xl font-bold text-neutral-900">{p.nome || "Nome"} {p.sobrenome || "Sobrenome"}</h1>
        <p className="text-sm text-neutral-600 mt-0.5">{p.tituloProfissional || "Cargo / Título Profissional"}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-neutral-500 mt-2">
          {p.telefone && <span>{p.telefone}</span>}
          {p.whatsapp && <span>WA: {p.whatsapp}</span>}
          {p.email && <span>{p.email}</span>}
          {(p.cidade || p.estado) && <span>{p.cidade}{p.cidade && p.estado ? ", " : ""}{p.estado}</span>}
          {p.linkedin && <span>{p.linkedin}</span>}
          {p.cpf && <span>CPF: {p.cpf}</span>}
        </div>
      </div>
      {data?.resumoProfissional && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-2">Resumo Profissional</h2>
          <p className="text-neutral-700 leading-relaxed">{data.resumoProfissional}</p>
        </div>
      )}
      {data?.habilidades?.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-2">Habilidades</h2>
          <p className="text-neutral-700">{data.habilidades.map((s: any) => s.text || s).filter(Boolean).join(" • ")}</p>
        </div>
      )}
      {data?.experiencia?.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-2">Experiência Profissional</h2>
          <div className="space-y-4">
            {data.experiencia.map((exp: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between items-start">
                  <div><p className="font-semibold">{exp.cargo || exp.jobTitle}</p><p className="text-xs text-neutral-500">{exp.empresa || exp.company}</p></div>
                  <p className="text-xs text-neutral-400 whitespace-nowrap ml-2">{exp.dataInicio || exp.startDate} – {exp.dataFim || exp.endDate}</p>
                </div>
                <ul className="mt-1 space-y-0.5">
                  {(exp.responsabilidades || exp.responsibilities || []).map((r: any, j: number) => {
                    const txt = typeof r === "string" ? r : (r.text || "");
                    return txt ? <li key={j} className="text-neutral-600 pl-3 text-xs">• {txt}</li> : null;
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
      {data?.formacao?.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-2">Formação Acadêmica</h2>
          {data.formacao.map((f: any, i: number) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="font-medium">{f.curso || f.degree} — {f.instituicao || f.school}</span>
              <span className="text-neutral-400">{f.anoConclusao || f.year}</span>
            </div>
          ))}
        </div>
      )}
      {data?.cursosCertificacoes?.some((c: any) => c.nome) && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-900 mb-2">Cursos e Certificações</h2>
          {data.cursosCertificacoes.filter((c: any) => c.nome).map((c: any, i: number) => (
            <p key={i} className="text-xs text-neutral-600">• {c.nome}{c.instituicao ? ` — ${c.instituicao}` : ""}{c.ano ? ` (${c.ano})` : ""}</p>
          ))}
        </div>
      )}
    </div>
  );
}
