"use client";
import Watermark from "@/components/Watermark";

export default function BrPremiumDourado({ data, mode = "preview", showWatermark = true }: any) {
  const p = data?.personalInfo || {};
  const fs = mode === "pdf" ? "text-[11px]" : "text-[13px]";
  const NAVY = "#1e3a5f"; const GOLD = "#92400e"; const GOLD_LIGHT = "#fef3c7";
  return (
    <div className={`relative font-serif ${fs} text-neutral-900 bg-white`}>
      <Watermark show={showWatermark} />
      {/* Navy header with gold accents */}
      <div className="px-8 py-6" style={{ backgroundColor: NAVY }}>
        <div className="flex gap-5 items-center">
          {p.foto ? (
            <img src={p.foto} alt="Foto" className="w-20 h-20 rounded-full object-cover border-2 flex-shrink-0" style={{ borderColor: "#b45309" }} />
          ) : (
            <div className="w-20 h-20 rounded-full flex-shrink-0 flex items-center justify-center text-xs border-2" style={{ backgroundColor: "#1e3a5f", borderColor: "#b45309", color: "#b45309" }}>Foto</div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{p.nome || "Nome"} {p.sobrenome || ""}</h1>
            <p className="text-sm mt-0.5 font-medium" style={{ color: "#fcd34d" }}>{p.tituloProfissional || "Cargo"}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs mt-2" style={{ color: "#93c5fd" }}>
              {p.telefone && <span>{p.telefone}</span>}
              {p.email && <span>{p.email}</span>}
              {(p.cidade || p.estado) && <span>{p.cidade}{p.cidade && p.estado ? "/" : ""}{p.estado}</span>}
              {p.linkedin && <span>{p.linkedin}</span>}
            </div>
          </div>
        </div>
      </div>
      <div className="h-1" style={{ background: `linear-gradient(to right, ${GOLD}, #fcd34d, ${GOLD})` }} />
      <div className="px-8 py-6 space-y-5">
        {data?.resumoProfissional && (
          <section>
            <h2 className="font-bold text-xs uppercase tracking-widest mb-2" style={{ color: NAVY }}>Perfil Executivo</h2>
            <div className="h-0.5 mb-3" style={{ background: `linear-gradient(to right, ${GOLD}, transparent)` }} />
            <p className="leading-relaxed text-neutral-700">{data.resumoProfissional}</p>
          </section>
        )}
        {data?.habilidades?.length > 0 && (
          <section>
            <h2 className="font-bold text-xs uppercase tracking-widest mb-2" style={{ color: NAVY }}>Competências</h2>
            <div className="h-0.5 mb-3" style={{ background: `linear-gradient(to right, ${GOLD}, transparent)` }} />
            <div className="flex flex-wrap gap-2">
              {data.habilidades.map((s: any, i: number) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: GOLD_LIGHT, color: GOLD, border: `1px solid #d97706` }}>{s.text || s}</span>
              ))}
            </div>
          </section>
        )}
        {data?.experiencia?.length > 0 && (
          <section>
            <h2 className="font-bold text-xs uppercase tracking-widest mb-2" style={{ color: NAVY }}>Trajetória Profissional</h2>
            <div className="h-0.5 mb-3" style={{ background: `linear-gradient(to right, ${GOLD}, transparent)` }} />
            <div className="space-y-4">
              {data.experiencia.map((exp: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between items-start">
                    <div><p className="font-bold" style={{ color: NAVY }}>{exp.cargo || exp.jobTitle}</p><p className="text-xs text-neutral-500 italic">{exp.empresa || exp.company}</p></div>
                    <span className="text-xs whitespace-nowrap ml-2 px-2 py-0.5 rounded" style={{ backgroundColor: GOLD_LIGHT, color: GOLD }}>{exp.dataInicio || exp.startDate} – {exp.dataFim || exp.endDate}</span>
                  </div>
                  <ul className="mt-1 space-y-0.5">
                    {(exp.responsabilidades || exp.responsibilities || []).map((r: any, j: number) => {
                      const txt = typeof r === "string" ? r : (r.text || "");
                      return txt ? <li key={j} className="text-neutral-600 text-xs flex items-start gap-1"><span style={{ color: GOLD }}>◆</span>{txt}</li> : null;
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
        {data?.formacao?.length > 0 && (
          <section>
            <h2 className="font-bold text-xs uppercase tracking-widest mb-2" style={{ color: NAVY }}>Formação Acadêmica</h2>
            <div className="h-0.5 mb-3" style={{ background: `linear-gradient(to right, ${GOLD}, transparent)` }} />
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
