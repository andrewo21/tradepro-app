"use client";

import Watermark from "@/components/Watermark";

interface BrTemplateProps {
  data: any;
  mode?: "preview" | "pdf";
  showWatermark?: boolean;
}

export default function BrClasicoProfissional({ data, mode = "preview", showWatermark = true }: BrTemplateProps) {
  const p = data?.personalInfo || {};
  const fontSize = mode === "pdf" ? "text-[11px]" : "text-[13px]";

  return (
    <div className={`relative font-serif ${fontSize} text-neutral-900 bg-white`}>
      <Watermark show={showWatermark} />

      {/* HEADER — clean black with photo sidebar */}
      <div className="flex gap-6 p-6 bg-neutral-900 text-white rounded-t-lg">
        {p.foto ? (
          <img src={p.foto} alt="Foto" className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div className="w-24 h-24 rounded-lg bg-neutral-700 flex-shrink-0 flex items-center justify-center text-neutral-400 text-xs text-center">
            Sua<br />Foto
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{p.nome || "Nome"} {p.sobrenome || "Sobrenome"}</h1>
          <p className="text-neutral-300 mt-0.5">{p.tituloProfissional || "Cargo / Título"}</p>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-neutral-400">
            {p.telefone && <span>📞 {p.telefone}</span>}
            {p.whatsapp && <span>💬 {p.whatsapp}</span>}
            {p.email && <span>✉ {p.email}</span>}
            {p.linkedin && <span>in {p.linkedin}</span>}
            {(p.cidade || p.estado) && <span>📍 {p.cidade}{p.cidade && p.estado ? ", " : ""}{p.estado}</span>}
            {p.cpf && <span>CPF: {p.cpf}</span>}
          </div>
        </div>
      </div>

      <div className="p-6 border border-neutral-200 rounded-b-lg space-y-5">

        {data?.resumoProfissional && (
          <section>
            <h2 className="font-bold text-sm uppercase tracking-widest text-neutral-500 border-b pb-1 mb-2">Resumo Profissional</h2>
            <p className="leading-relaxed text-neutral-700">{data.resumoProfissional}</p>
          </section>
        )}

        {data?.experiencia?.length > 0 && (
          <section>
            <h2 className="font-bold text-sm uppercase tracking-widest text-neutral-500 border-b pb-1 mb-2">Experiência Profissional</h2>
            <div className="space-y-4">
              {data.experiencia.map((exp: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-neutral-900">{exp.cargo || exp.jobTitle}</p>
                      <p className="text-neutral-500 text-xs italic">{exp.empresa || exp.company}</p>
                    </div>
                    <p className="text-xs text-neutral-400 whitespace-nowrap ml-2">
                      {exp.dataInicio || exp.startDate} — {exp.dataFim || exp.endDate}
                    </p>
                  </div>
                  <ul className="mt-1 space-y-0.5">
                    {(exp.responsabilidades || exp.responsibilities || []).map((r: any, j: number) => {
                      const txt = typeof r === "string" ? r : (r.text || "");
                      return txt ? (
                        <li key={j} className="text-neutral-700 pl-3 border-l-2 border-neutral-300">{txt}</li>
                      ) : null;
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-6">
          {data?.habilidades?.length > 0 && (
            <section>
              <h2 className="font-bold text-sm uppercase tracking-widest text-neutral-500 border-b pb-1 mb-2">Habilidades</h2>
              <ul className="space-y-1">
                {data.habilidades.map((s: any, i: number) => (
                  <li key={i} className="text-neutral-700 text-xs">• {s.text || s}</li>
                ))}
              </ul>
            </section>
          )}

          {data?.formacao?.length > 0 && (
            <section>
              <h2 className="font-bold text-sm uppercase tracking-widest text-neutral-500 border-b pb-1 mb-2">Formação</h2>
              <div className="space-y-2">
                {data.formacao.map((f: any, i: number) => (
                  <div key={i}>
                    <p className="font-semibold text-neutral-900 text-xs">{f.curso || f.degree}</p>
                    <p className="text-neutral-500 text-xs">{f.instituicao || f.school} · {f.anoConclusao || f.year}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {data?.cursosCertificacoes?.some((c: any) => c.nome) && (
          <section>
            <h2 className="font-bold text-sm uppercase tracking-widest text-neutral-500 border-b pb-1 mb-2">Cursos e Certificações</h2>
            <div className="flex flex-wrap gap-2">
              {data.cursosCertificacoes.filter((c: any) => c.nome).map((c: any, i: number) => (
                <span key={i} className="text-xs bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded">
                  {c.nome} {c.ano ? `(${c.ano})` : ""}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
