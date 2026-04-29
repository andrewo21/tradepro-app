"use client";

import Watermark from "@/components/Watermark";

interface BrTemplateProps {
  data: any;
  mode?: "preview" | "pdf";
  showWatermark?: boolean;
}

export default function BrVerdeTecnico({ data, mode = "preview", showWatermark = true }: BrTemplateProps) {
  const p = data?.personalInfo || {};
  const fontSize = mode === "pdf" ? "text-[11px]" : "text-[13px]";

  return (
    <div className={`relative font-sans ${fontSize} text-neutral-900 bg-white flex min-h-[600px]`}>
      <Watermark show={showWatermark} />

      {/* LEFT SIDEBAR */}
      <div className="bg-green-800 text-white w-48 flex-shrink-0 p-5 rounded-l-lg flex flex-col gap-5">
        {p.foto ? (
          <img src={p.foto} alt="Foto" className="w-full aspect-square rounded-full object-cover border-2 border-white/20" />
        ) : (
          <div className="w-full aspect-square rounded-full bg-green-700 border-2 border-white/20 flex items-center justify-center text-white/40 text-xs">
            Foto
          </div>
        )}

        <div>
          <h3 className="text-[10px] uppercase tracking-widest text-green-300 font-bold mb-2">Contato</h3>
          <div className="space-y-1 text-[11px] text-green-100">
            {p.telefone && <p>{p.telefone}</p>}
            {p.whatsapp && <p>WA: {p.whatsapp}</p>}
            {p.email && <p className="break-all">{p.email}</p>}
            {(p.cidade || p.estado) && <p>{p.cidade}{p.cidade && p.estado ? "/" : ""}{p.estado}</p>}
            {p.cpf && <p>CPF: {p.cpf}</p>}
          </div>
        </div>

        {p.linkedin && (
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-green-300 font-bold mb-1">LinkedIn</h3>
            <p className="text-[11px] text-green-100 break-all">{p.linkedin}</p>
          </div>
        )}

        {data?.habilidades?.length > 0 && (
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-green-300 font-bold mb-2">Habilidades</h3>
            <ul className="space-y-1">
              {data.habilidades.map((s: any, i: number) => (
                <li key={i} className="text-[11px] text-green-100 flex items-start gap-1">
                  <span className="text-green-400 flex-shrink-0">▸</span>
                  {s.text || s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{p.nome || "Nome"} {p.sobrenome || "Sobrenome"}</h1>
          <p className="text-green-700 font-semibold">{p.tituloProfissional || "Cargo / Título Profissional"}</p>
        </div>

        {data?.resumoProfissional && (
          <section>
            <h2 className="text-green-800 font-bold text-xs uppercase tracking-widest border-b-2 border-green-200 pb-1 mb-2">Resumo Profissional</h2>
            <p className="leading-relaxed text-neutral-700">{data.resumoProfissional}</p>
          </section>
        )}

        {data?.experiencia?.length > 0 && (
          <section>
            <h2 className="text-green-800 font-bold text-xs uppercase tracking-widest border-b-2 border-green-200 pb-1 mb-2">Experiência Profissional</h2>
            <div className="space-y-3">
              {data.experiencia.map((exp: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-neutral-900">{exp.cargo || exp.jobTitle}</p>
                      <p className="text-xs text-neutral-500">{exp.empresa || exp.company}</p>
                    </div>
                    <span className="text-xs text-neutral-400 whitespace-nowrap ml-2 bg-green-50 px-2 py-0.5 rounded">
                      {exp.dataInicio || exp.startDate} – {exp.dataFim || exp.endDate}
                    </span>
                  </div>
                  <ul className="mt-1 space-y-0.5">
                    {(exp.responsabilidades || exp.responsibilities || []).map((r: any, j: number) => {
                      const txt = typeof r === "string" ? r : (r.text || "");
                      return txt ? (
                        <li key={j} className="flex items-start gap-1.5 text-neutral-700">
                          <span className="text-green-600 mt-0.5 flex-shrink-0">•</span>
                          {txt}
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {data?.formacao?.length > 0 && (
          <section>
            <h2 className="text-green-800 font-bold text-xs uppercase tracking-widest border-b-2 border-green-200 pb-1 mb-2">Formação Acadêmica</h2>
            <div className="space-y-2">
              {data.formacao.map((f: any, i: number) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-neutral-900">{f.curso || f.degree}</p>
                    <p className="text-xs text-neutral-500">{f.instituicao || f.school} {f.tipo ? `· ${f.tipo}` : ""}</p>
                  </div>
                  <p className="text-xs text-neutral-400">{f.anoConclusao || f.year}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {data?.cursosCertificacoes?.some((c: any) => c.nome) && (
          <section>
            <h2 className="text-green-800 font-bold text-xs uppercase tracking-widest border-b-2 border-green-200 pb-1 mb-2">Cursos e Certificações</h2>
            <div className="space-y-1">
              {data.cursosCertificacoes.filter((c: any) => c.nome).map((c: any, i: number) => (
                <p key={i} className="text-neutral-700 text-xs">
                  <span className="font-medium">{c.nome}</span>
                  {c.instituicao ? ` — ${c.instituicao}` : ""}
                  {c.ano ? ` (${c.ano})` : ""}
                </p>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
