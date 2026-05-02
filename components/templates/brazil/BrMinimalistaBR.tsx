"use client";
import Watermark from "@/components/Watermark";

export default function BrMinimalistaBR({ data, mode = "preview", showWatermark = true }: any) {
  const p = data?.personalInfo || {};
  const fs = mode === "pdf" ? "text-[11px]" : "text-[13px]";
  return (
    <div className={`relative font-sans ${fs} text-neutral-800 bg-white px-10 py-8`}>
      <Watermark show={showWatermark} />
      {/* Pure minimal — elegant typography, lots of white space */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-neutral-900">{p.nome || "Nome"} <span className="font-bold">{p.sobrenome || "Sobrenome"}</span></h1>
          <p className="text-sm text-neutral-500 tracking-wide mt-1">{p.tituloProfissional || "Cargo / Título Profissional"}</p>
        </div>
        {p.foto && (
          <img src={p.foto} alt="Foto" className="w-16 h-16 rounded-full object-cover border border-neutral-200 flex-shrink-0 ml-4" />
        )}
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-0.5 text-xs text-neutral-400 mb-6 pb-4 border-b border-neutral-200">
        {p.telefone && <span>{p.telefone}</span>}
        {p.whatsapp && <span>WhatsApp: {p.whatsapp}</span>}
        {p.email && <span>{p.email}</span>}
        {(p.cidade || p.estado) && <span>{p.cidade}{p.cidade && p.estado ? ", " : ""}{p.estado}</span>}
        {p.linkedin && <span>{p.linkedin}</span>}
        {p.cpf && <span>CPF: {p.cpf}</span>}
      </div>
      {data?.resumoProfissional && (
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Sobre</p>
          <p className="leading-relaxed text-neutral-700">{data.resumoProfissional}</p>
        </div>
      )}
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-5">
          {data?.experiencia?.length > 0 && (
            <section>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-3">Experiência</p>
              <div className="space-y-4">
                {data.experiencia.map((exp: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline">
                      <p className="font-semibold text-neutral-900">{exp.cargo || exp.jobTitle}</p>
                      <p className="text-[10px] text-neutral-400 whitespace-nowrap ml-2">{exp.dataInicio || exp.startDate} – {exp.dataFim || exp.endDate}</p>
                    </div>
                    <p className="text-[11px] text-neutral-400 mb-1">{exp.empresa || exp.company}</p>
                    {(exp.responsabilidades || exp.responsibilities || []).map((r: any, j: number) => {
                      const txt = typeof r === "string" ? r : (r.text || "");
                      return txt ? <p key={j} className="text-neutral-600 text-xs pl-2 border-l border-neutral-200">{ txt}</p> : null;
                    })}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
        <div className="space-y-5">
          {data?.habilidades?.length > 0 && (
            <section>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Habilidades</p>
              <ul className="space-y-1">
                {data.habilidades.map((s: any, i: number) => (
                  <li key={i} className="text-xs text-neutral-600">{s.text || s}</li>
                ))}
              </ul>
            </section>
          )}
          {data?.formacao?.length > 0 && (
            <section>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Formação</p>
              {data.formacao.map((f: any, i: number) => (
                <div key={i} className="text-xs">
                  <p className="font-medium text-neutral-700">{f.curso || f.degree}</p>
                  <p className="text-neutral-400">{f.instituicao || f.school}</p>
                  <p className="text-neutral-300">{f.anoConclusao || f.year}</p>
                </div>
              ))}
            </section>
          )}
          {data?.cursosCertificacoes?.some((c: any) => c.nome) && (
            <section>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">Certificações</p>
              {data.cursosCertificacoes.filter((c: any) => c.nome).map((c: any, i: number) => (
                <p key={i} className="text-xs text-neutral-600">{c.nome}{c.ano ? ` (${c.ano})` : ""}</p>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
