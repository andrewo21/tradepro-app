"use client";
import Watermark from "@/components/Watermark";

export default function BrConstrucaoBold({ data, mode = "preview", showWatermark = true }: any) {
  const p = data?.personalInfo || {};
  const fs = mode === "pdf" ? "text-[11px]" : "text-[13px]";
  return (
    <div className={`relative font-sans ${fs} text-neutral-900 bg-white`}>
      <Watermark show={showWatermark} />
      {/* Bold dark industrial header */}
      <div className="bg-neutral-900 text-white px-8 py-6">
        <div className="flex gap-5 items-start">
          {p.foto ? (
            <img src={p.foto} alt="Foto" className="w-20 h-20 rounded object-cover flex-shrink-0 border border-neutral-700" />
          ) : (
            <div className="w-20 h-20 rounded flex-shrink-0 bg-neutral-800 flex items-center justify-center text-neutral-500 text-xs border border-neutral-700">Foto</div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-black tracking-tight text-white uppercase">{p.nome || "Nome"} {p.sobrenome || ""}</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-0.5 w-8 bg-orange-500" />
              <p className="text-orange-400 font-bold text-sm">{p.tituloProfissional || "Cargo"}</p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-neutral-400 mt-2">
              {p.telefone && <span>📞 {p.telefone}</span>}
              {p.whatsapp && <span>💬 {p.whatsapp}</span>}
              {p.email && <span>{p.email}</span>}
              {(p.cidade || p.estado) && <span>📍 {p.cidade}{p.cidade && p.estado ? "/" : ""}{p.estado}</span>}
            </div>
          </div>
        </div>
      </div>
      <div className="h-1 bg-orange-500" />
      <div className="px-8 py-6 space-y-5">
        {data?.resumoProfissional && (
          <section>
            <h2 className="font-black text-xs uppercase tracking-widest text-neutral-900 border-b-2 border-orange-500 pb-1 mb-2">Perfil Profissional</h2>
            <p className="leading-relaxed text-neutral-700">{data.resumoProfissional}</p>
          </section>
        )}
        {data?.habilidades?.length > 0 && (
          <section>
            <h2 className="font-black text-xs uppercase tracking-widest text-neutral-900 border-b-2 border-orange-500 pb-1 mb-2">Habilidades Técnicas</h2>
            <div className="flex flex-wrap gap-2">
              {data.habilidades.map((s: any, i: number) => (
                <span key={i} className="bg-neutral-900 text-white text-xs px-2 py-0.5 rounded font-medium">{s.text || s}</span>
              ))}
            </div>
          </section>
        )}
        {data?.experiencia?.length > 0 && (
          <section>
            <h2 className="font-black text-xs uppercase tracking-widest text-neutral-900 border-b-2 border-orange-500 pb-1 mb-2">Experiência em Obra</h2>
            <div className="space-y-4">
              {data.experiencia.map((exp: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between items-start">
                    <div><p className="font-bold text-neutral-900">{exp.cargo || exp.jobTitle}</p><p className="text-xs text-neutral-500">{exp.empresa || exp.company}</p></div>
                    <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded whitespace-nowrap ml-2">{exp.dataInicio || exp.startDate} – {exp.dataFim || exp.endDate}</span>
                  </div>
                  <ul className="mt-1 space-y-0.5">
                    {(exp.responsabilidades || exp.responsibilities || []).map((r: any, j: number) => {
                      const txt = typeof r === "string" ? r : (r.text || "");
                      return txt ? <li key={j} className="text-neutral-600 pl-3 text-xs flex items-start gap-1"><span className="text-orange-500 flex-shrink-0">▸</span>{txt}</li> : null;
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
        {data?.formacao?.length > 0 && (
          <section>
            <h2 className="font-black text-xs uppercase tracking-widest text-neutral-900 border-b-2 border-orange-500 pb-1 mb-2">Formação</h2>
            {data.formacao.map((f: any, i: number) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="font-medium">{f.curso || f.degree} — {f.instituicao || f.school}</span>
                <span className="text-neutral-400">{f.anoConclusao || f.year}</span>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
