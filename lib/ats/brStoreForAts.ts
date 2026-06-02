// Transforms the BR Zustand store shape into the exact shape
// that computeLiveAtsScore expects (same as the US store shape).
// The US store uses English field names; BR uses Portuguese.
export function mapBrStoreForAts(s: any) {
  return {
    personalInfo: {
      firstName:  s.personalInfo?.nome               || "",
      lastName:   s.personalInfo?.sobrenome          || "",
      tradeTitle: s.personalInfo?.tituloProfissional || "",
      phone:      s.personalInfo?.telefone           || s.personalInfo?.whatsapp || "",
      email:      s.personalInfo?.email              || "",
      city:       s.personalInfo?.cidade             || "",
      linkedin:   s.personalInfo?.linkedin           || "",
    },
    summary: s.resumoProfissional || "",
    skills: [...(s.habilidadesTecnicas || s.habilidades || [])].map((h: any) => ({
      text: (h.text || h).toString().replace(/^[•·]\s*/, ""),
    })),
    experience: (s.experiencia || []).map((e: any) => ({
      jobTitle:  e.cargo    || "",
      company:   e.empresa  || "",
      startDate: e.dataInicio || "",
      endDate:   e.dataFim  || "",
      responsibilities: (e.responsabilidades || []).map((r: any) => ({ text: r.text || r })),
      achievements: [],
    })),
    education: (s.formacao || []).map((f: any) => ({
      school: f.instituicao || "",
      degree: f.curso       || "",
    })),
    certifications: (s.cursosCertificacoes || [])
      .filter((c: any) => c.nome)
      .map((c: any) => ({ id: c.nome, text: c.nome })),
  };
}
