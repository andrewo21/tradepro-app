"use client";

import Watermark from "@/components/Watermark";

interface BrTemplateProps {
  data: any;
  mode?: "preview" | "pdf";
  showWatermark?: boolean;
}

export default function BrModernoAzul({ data, mode = "preview", showWatermark = true }: BrTemplateProps) {
  const p = data?.personalInfo || {};
  const fontSize = mode === "pdf" ? "text-[11px]" : "text-[13px]";

  return (
    <div className={`relative font-sans ${fontSize} text-neutral-900 bg-white`}>
      <Watermark show={showWatermark} />

      {/* HEADER — blue with photo */}
      <div className="bg-blue-800 text-white flex gap-5 p-6 rounded-t-lg">
        {p.foto && (
          <img
            src={p.foto}
            alt="Foto"
            className="w-20 h-20 rounded-full object-cover flex-shrink-0 border-2 border-white/30"
          />
        )}
        {!p.foto && (
          <div className="w-20 h-20 rounded-full bg-blue-700 border-2 border-white/20 flex-shrink-0 flex items-center justify-center text-white/40 text-xs text-center leading-tight">
            Sua<br />Foto
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold leading-tight">
            {p.nome || "Nome"} {p.sobrenome || "Sobrenome"}
          </h1>
          <p className="text-blue-200 text-base mt-0.5">{p.tituloProfissional || "Cargo / Título Profissional"}</p>
          <div className="mt-2 text-sm text-blue-100 flex flex-wrap gap-x-4 gap-y-0.5">
            {p.telefone && <span>{p.telefone}</span>}
            {p.whatsapp && <span>WhatsApp: {p.whatsapp}</span>}
            {p.email && <span>{p.email}</span>}
            {(p.cidade || p.estado) && <span>{p.cidade}{p.cidade && p.estado ? ", " : ""}{p.estado}</span>}
            {p.linkedin && <span>LinkedIn: {p.linkedin}</span>}
            {p.cpf && <span>CPF: {p.cpf}</span>}
          </div>
        </div>
      </div>

      <div className="p-6 bg-white border border-neutral-200 rounded-b-lg space-y-5">

        {/* Resumo */}
        {data?.resumoProfissional && (
          <section>
            <h2 className="text-blue-800 font-bold text-sm uppercase tracking-wide border-b border-blue-200 pb-1 mb-2">Resumo Profissional</h2>
            <p className="leading-relaxed text-neutral-700">{data.resumoProfissional}</p>
          </section>
        )}

        {/* Habilidades */}
        {data?.habilidades?.length > 0 && (
          <section>
            <h2 className="text-blue-800 font-bold text-sm uppercase tracking-wide border-b border-blue-200 pb-1 mb-2">Habilidades</h2>
            <div className="flex flex-wrap gap-2">
              {data.habilidades.map((s: any, i: number) => (
                <span key={i} className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-xs font-medium">
                  {s.text || s}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Experiência */}
        {data?.experiencia?.length > 0 && (
          <section>
            <h2 className="text-blue-800 font-bold text-sm uppercase tracking-wide border-b border-blue-200 pb-1 mb-2">Experiência Profissional</h2>
            <div className="space-y-4">
              {data.experiencia.map((exp: any, i: number) => (
                <div key={i}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-neutral-900">{exp.cargo || exp.jobTitle}</p>
                      <p className="text-neutral-600 text-xs">{exp.empresa || exp.company}</p>
                    </div>
                    <p className="text-xs text-neutral-400 text-right whitespace-nowrap ml-2">
                      {exp.dataInicio || exp.startDate} – {exp.dataFim || exp.endDate}
                    </p>
                  </div>
                  {(exp.responsabilidades || exp.responsibilities || []).length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {(exp.responsabilidades || exp.responsibilities || []).map((r: any, j: number) => {
                        const txt = typeof r === "string" ? r : (r.text || "");
                        return txt ? (
                          <li key={j} className="flex items-start gap-1.5 text-neutral-700">
                            <span className="text-blue-600 mt-1 flex-shrink-0">▸</span>
                            <span>{txt}</span>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Formação */}
        {data?.formacao?.length > 0 && (
          <section>
            <h2 className="text-blue-800 font-bold text-sm uppercase tracking-wide border-b border-blue-200 pb-1 mb-2">Formação Acadêmica</h2>
            <div className="space-y-2">
              {data.formacao.map((f: any, i: number) => (
                <div key={i} className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-neutral-900">{f.curso || f.degree}</p>
                    <p className="text-xs text-neutral-500">{f.instituicao || f.school} {f.tipo ? `· ${f.tipo}` : ""}</p>
                  </div>
                  <p className="text-xs text-neutral-400 whitespace-nowrap ml-2">{f.anoConclusao || f.year}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cursos */}
        {data?.cursosCertificacoes?.some((c: any) => c.nome) && (
          <section>
            <h2 className="text-blue-800 font-bold text-sm uppercase tracking-wide border-b border-blue-200 pb-1 mb-2">Cursos e Certificações</h2>
            <div className="space-y-1">
              {data.cursosCertificacoes.filter((c: any) => c.nome).map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="font-medium text-neutral-900">{c.nome}</span>
                  <span className="text-xs text-neutral-400">{c.instituicao} {c.ano}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
