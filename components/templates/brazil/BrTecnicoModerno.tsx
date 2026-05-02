"use client";
import Watermark from "@/components/Watermark";

export default function BrTecnicoModerno({ data, mode = "preview", showWatermark = true }: any) {
  const p = data?.personalInfo || {};
  const fs = mode === "pdf" ? "text-[11px]" : "text-[13px]";
  const BLUE = "#1e40af"; const SIDE_W = "w-44";
  return (
    <div className={`relative font-sans ${fs} text-neutral-900 bg-white flex min-h-[600px]`}>
      <Watermark show={showWatermark} />
      {/* Left sidebar — blue */}
      <div className="w-44 flex-shrink-0 p-5 space-y-5" style={{ backgroundColor: BLUE }}>
        {p.foto ? (
          <img src={p.foto} alt="Foto" className="w-full aspect-square rounded-lg object-cover border-2 border-blue-400" />
        ) : (
          <div className="w-full aspect-square rounded-lg bg-blue-700 border-2 border-blue-400 flex items-center justify-center text-blue-300 text-xs">Foto</div>
        )}
        <div>
          <p className="text-[9px] uppercase tracking-widest text-blue-300 font-bold mb-1">Contato</p>
          <div className="space-y-1 text-[10px] text-blue-100">
            {p.telefone && <p>{p.telefone}</p>}
            {p.whatsapp && <p>WA: {p.whatsapp}</p>}
            {p.email && <p className="break-all">{p.email}</p>}
            {(p.cidade || p.estado) && <p>{p.cidade}{p.cidade && p.estado ? "/" : ""}{p.estado}</p>}
            {p.cpf && <p>CPF: {p.cpf}</p>}
          </div>
        </div>
        {data?.habilidades?.length > 0 && (
          <div>
            <p className="text-[9px] uppercase tracking-widest text-blue-300 font-bold mb-1">Habilidades</p>
            <ul className="space-y-0.5">
              {data.habilidades.map((s: any, i: number) => (
                <li key={i} className="text-[10px] text-blue-100 flex items-start gap-1"><span className="text-blue-300">▸</span>{s.text || s}</li>
              ))}
            </ul>
          </div>
        )}
        {data?.formacao?.length > 0 && (
          <div>
            <p className="text-[9px] uppercase tracking-widest text-blue-300 font-bold mb-1">Formação</p>
            {data.formacao.map((f: any, i: number) => (
              <div key={i} className="text-[10px] text-blue-100">
                <p className="font-medium">{f.curso || f.degree}</p>
                <p className="text-blue-300">{f.instituicao || f.school} · {f.anoConclusao || f.year}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Main */}
      <div className="flex-1 p-6 space-y-5">
        <div className="border-b-2 pb-3" style={{ borderColor: BLUE }}>
          <h1 className="text-2xl font-bold" style={{ color: BLUE }}>{p.nome || "Nome"} {p.sobrenome || ""}</h1>
          <p className="text-sm text-neutral-600 font-medium">{p.tituloProfissional || "Cargo"}</p>
          {p.linkedin && <p className="text-xs text-neutral-400 mt-0.5">{p.linkedin}</p>}
        </div>
        {data?.resumoProfissional && (
          <section>
            <h2 className="font-bold text-xs uppercase tracking-widest mb-2" style={{ color: BLUE }}>Resumo Profissional</h2>
            <p className="leading-relaxed text-neutral-700">{data.resumoProfissional}</p>
          </section>
        )}
        {data?.experiencia?.length > 0 && (
          <section>
            <h2 className="font-bold text-xs uppercase tracking-widest mb-2" style={{ color: BLUE }}>Experiência</h2>
            <div className="space-y-3">
              {data.experiencia.map((exp: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between items-start">
                    <div><p className="font-bold text-neutral-900">{exp.cargo || exp.jobTitle}</p><p className="text-xs text-neutral-500">{exp.empresa || exp.company}</p></div>
                    <span className="text-xs text-neutral-400 whitespace-nowrap ml-2 bg-blue-50 px-2 py-0.5 rounded">{exp.dataInicio || exp.startDate} – {exp.dataFim || exp.endDate}</span>
                  </div>
                  <ul className="mt-1">
                    {(exp.responsabilidades || exp.responsibilities || []).map((r: any, j: number) => {
                      const txt = typeof r === "string" ? r : (r.text || "");
                      return txt ? <li key={j} className="text-neutral-600 text-xs flex items-start gap-1 mt-0.5"><span style={{ color: BLUE }}>•</span>{txt}</li> : null;
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
        {data?.cursosCertificacoes?.some((c: any) => c.nome) && (
          <section>
            <h2 className="font-bold text-xs uppercase tracking-widest mb-2" style={{ color: BLUE }}>Cursos e Certificações</h2>
            {data.cursosCertificacoes.filter((c: any) => c.nome).map((c: any, i: number) => (
              <p key={i} className="text-xs text-neutral-600">• {c.nome}{c.instituicao ? ` — ${c.instituicao}` : ""}{c.ano ? ` (${c.ano})` : ""}</p>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
