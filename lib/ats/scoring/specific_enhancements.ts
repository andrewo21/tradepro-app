// lib/ats/scoring/specific_enhancements.ts
// Pure deterministic function. No AI. Same input = same output.
// Generates 4–7 specific, quantified, personalized enhancements in PT-BR.

import type { ResumeExtraction } from "../extraction/extract_resume_data";
import type { JobExtraction }    from "../extraction/extract_job_data";
import { normalize }             from "../utils/normalize";
import { atsPointGains }         from "./final_score";
import { findUSRoleData }        from "../roles/us_roles";

export interface EnhancementInput {
  resumeExtraction: ResumeExtraction;
  mode: "with_job" | "general";
  jobExtraction?: JobExtraction;
  skillsMissing?: string[];
  skillsFound?: string[];
  profession?: string | null;
  locale?: string | null;  // "en" uses US library, "pt-BR" uses BR library
}

// ─── Role library — exact 19 Brazilian job titles ─────────────────────────────

interface RoleData { skills: string[]; tools: string[]; responsibilities: string[]; }

export const roleSkillLibrary: Record<string, RoleData> = {
  "Analista de Marketing Jr.": {
    skills: ["copywriting","SEO","gestão de redes sociais","planejamento de conteúdo","análise de métricas","comunicação eficaz","organização"],
    tools:  ["Google Analytics","Canva","Meta Business Suite","Google Ads","RD Station","Hootsuite"],
    responsibilities: ["criação de conteúdo","gestão de campanhas","otimização de SEO","monitoramento de redes sociais","análise de performance"],
  },
  "Analista de Atendimento": {
    skills: ["resolução de conflitos","comunicação eficaz","empatia","organização","atendimento omnichannel"],
    tools:  ["Zendesk","Freshdesk","HubSpot Service","Salesforce Service Cloud"],
    responsibilities: ["responder solicitações","gerenciar tickets","acompanhar métricas de atendimento","resolver problemas de clientes"],
  },
  "Assistente Administrativo": {
    skills: ["organização","comunicação","gestão de documentos","controle de agendas","atenção aos detalhes"],
    tools:  ["Excel","Word","ERP","Google Workspace"],
    responsibilities: ["controle de documentos","apoio administrativo","atendimento interno","gestão de planilhas"],
  },
  "Auxiliar Administrativo": {
    skills: ["organização","arquivamento","comunicação","controle de estoque","agilidade"],
    tools:  ["Excel","Word","Sistemas internos"],
    responsibilities: ["apoio administrativo","controle de materiais","atendimento interno"],
  },
  "Analista de RH": {
    skills: ["recrutamento e seleção","entrevistas","onboarding","avaliação de desempenho","clima organizacional"],
    tools:  ["Gupy","Kenoby","Sólides","LinkedIn Recruiter"],
    responsibilities: ["condução de entrevistas","triagem de currículos","gestão de indicadores de RH","processos de admissão"],
  },
  "Assistente de RH": {
    skills: ["triagem de currículos","comunicação","organização","apoio em entrevistas"],
    tools:  ["Gupy","Sólides","Excel"],
    responsibilities: ["apoio ao recrutamento","agendamento de entrevistas","controle de documentos"],
  },
  "Analista Financeiro": {
    skills: ["análise financeira","fluxo de caixa","conciliação bancária","planejamento financeiro","contas a pagar e receber"],
    tools:  ["Excel avançado","ERP","Power BI"],
    responsibilities: ["controle financeiro","análise de indicadores","gestão de pagamentos","relatórios financeiros"],
  },
  "Assistente Financeiro": {
    skills: ["conciliação bancária","organização","controle financeiro","comunicação"],
    tools:  ["Excel","ERP"],
    responsibilities: ["lançamentos financeiros","controle de pagamentos","apoio administrativo"],
  },
  "Analista de Logística": {
    skills: ["gestão de estoque","planejamento logístico","rastreio de entregas","negociação"],
    tools:  ["ERP","WMS","Excel"],
    responsibilities: ["controle de estoque","gestão de rotas","acompanhamento de entregas"],
  },
  "Auxiliar de Logística": {
    skills: ["organização","controle de estoque","separação de pedidos"],
    tools:  ["WMS","ERP"],
    responsibilities: ["separação de mercadorias","controle de entrada e saída","apoio logístico"],
  },
  "Vendedor": {
    skills: ["negociação","comunicação","persuasão","relacionamento com clientes"],
    tools:  ["CRM","WhatsApp Business","ERP"],
    responsibilities: ["prospecção","atendimento ao cliente","fechamento de vendas"],
  },
  "Atendente": {
    skills: ["comunicação","empatia","agilidade","organização"],
    tools:  ["sistemas de atendimento","PDV"],
    responsibilities: ["atendimento ao cliente","resolução de dúvidas","apoio operacional"],
  },
  "Recepcionista": {
    skills: ["comunicação","organização","atendimento ao público"],
    tools:  ["agenda eletrônica","sistemas internos"],
    responsibilities: ["recepção de clientes","agendamento","controle de entrada"],
  },
  "Analista de Suporte Técnico": {
    skills: ["diagnóstico técnico","resolução de problemas","comunicação","documentação"],
    tools:  ["Jira","Zendesk","Freshdesk"],
    responsibilities: ["suporte ao usuário","registro de tickets","solução de problemas técnicos"],
  },
  "Desenvolvedor Jr.": {
    skills: ["lógica de programação","versionamento","resolução de problemas"],
    tools:  ["Git","VS Code","Postman"],
    responsibilities: ["desenvolvimento de funcionalidades","correção de bugs","testes básicos"],
  },
  "Auxiliar de Produção": {
    skills: ["agilidade","atenção aos detalhes","organização"],
    tools:  ["máquinas industriais","equipamentos de segurança"],
    responsibilities: ["apoio na produção","controle de qualidade","embalagem"],
  },
  "Operador de Caixa": {
    skills: ["agilidade","atenção","comunicação"],
    tools:  ["PDV","sistemas de pagamento"],
    responsibilities: ["registro de compras","fechamento de caixa","atendimento ao cliente"],
  },
  "Auxiliar de Escritório": {
    skills: ["organização","comunicação","arquivamento"],
    tools:  ["Excel","Word"],
    responsibilities: ["apoio administrativo","organização de documentos","atendimento interno"],
  },
  "Analista de Compras": {
    skills: ["negociação","pesquisa de fornecedores","gestão de contratos"],
    tools:  ["ERP","Excel","Power BI"],
    responsibilities: ["cotação","negociação","gestão de pedidos"],
  },

  // ── 10 new roles — top gaps in Brazilian job market ──────────────────────────

  "Analista de Dados": {
    skills: ["SQL","análise estatística","visualização de dados","modelagem de dados","Python","interpretação de indicadores"],
    tools:  ["Power BI","Tableau","Python","SQL Server","Google Data Studio","Excel avançado"],
    responsibilities: ["análise de dados","criação de dashboards","relatórios gerenciais","suporte à tomada de decisão"],
  },

  "Motorista": {
    skills: ["habilitação categoria D ou E","direção defensiva","conhecimento do trânsito","controle de documentos de carga","pontualidade"],
    tools:  ["GPS","Waze","sistemas de rastreamento","planilha de km"],
    responsibilities: ["transporte de passageiros ou cargas","entrega de mercadorias","controle de rotas","manutenção básica do veículo"],
  },

  "Técnico de Enfermagem": {
    skills: ["assistência ao paciente","administração de medicamentos","curativos e procedimentos","sinais vitais","biossegurança","BLS"],
    tools:  ["prontuário eletrônico","Tasy","MV Soul","equipamentos hospitalares"],
    responsibilities: ["assistência de enfermagem","administração de medicamentos","monitoramento de pacientes","registros clínicos"],
  },

  "Gerente de Loja": {
    skills: ["gestão de equipes","controle de estoque","metas de vendas","atendimento ao cliente","treinamento de equipe","gestão financeira básica"],
    tools:  ["PDV","ERP","Excel","sistemas de estoque"],
    responsibilities: ["gestão de equipe","controle de metas","abertura e fechamento de caixa","gestão de estoque","atendimento a clientes"],
  },

  "Analista de E-commerce": {
    skills: ["gestão de plataformas de venda","SEO para e-commerce","análise de conversão","gestão de produtos","atendimento online","marketing digital"],
    tools:  ["Shopify","VTEX","Mercado Livre","Amazon Seller","Google Analytics","Meta Ads"],
    responsibilities: ["gestão de catálogo","análise de performance","campanha de tráfego pago","gestão de pedidos","atendimento pós-venda"],
  },

  "Designer Gráfico": {
    skills: ["identidade visual","tipografia","composição visual","branding","criação para redes sociais","prototipagem"],
    tools:  ["Adobe Photoshop","Illustrator","Figma","InDesign","Canva Pro","After Effects"],
    responsibilities: ["criação de materiais visuais","desenvolvimento de identidade visual","edição de imagens","criação para mídias digitais"],
  },

  "Analista de Projetos": {
    skills: ["gestão de projetos","metodologias ágeis","Scrum","planejamento e cronograma","gestão de riscos","comunicação com stakeholders"],
    tools:  ["MS Project","Jira","Trello","Asana","Excel","Notion"],
    responsibilities: ["planejamento de projetos","acompanhamento de cronograma","gestão de riscos","comunicação com equipes","relatórios de status"],
  },

  "Auxiliar de Farmácia": {
    skills: ["atendimento ao cliente","conhecimento de medicamentos","controle de estoque","legislação sanitária","organização"],
    tools:  ["sistema de gestão de farmácia","PDV","leitor de código de barras"],
    responsibilities: ["atendimento ao balcão","venda de medicamentos","controle de estoque","organização de prateleiras","orientação ao cliente"],
  },

  "Estagiário": {
    skills: ["organização","comunicação","proatividade","aprendizado rápido","trabalho em equipe","atenção aos detalhes"],
    tools:  ["Pacote Office","Google Workspace","sistemas internos"],
    responsibilities: ["apoio às atividades do setor","participação em projetos","organização de documentos","suporte administrativo"],
  },

  "Personal Trainer": {
    skills: ["avaliação física","prescrição de treinos","motivação de clientes","nutrição básica","primeiros socorros","anatomia aplicada"],
    tools:  ["aplicativos de treino","Trainerize","planilhas de evolução","equipamentos de academia"],
    responsibilities: ["avaliação física dos alunos","prescrição de treinos personalizados","acompanhamento de evolução","orientação nutricional básica"],
  },
};

/** Find role data — exact match first, then keyword fallback */
function findRoleData(profession: string | null | undefined): { role: string; data: RoleData } | null {
  if (!profession) return null;

  // 1. Exact match (case-insensitive)
  for (const [key, data] of Object.entries(roleSkillLibrary)) {
    if (key.toLowerCase() === profession.toLowerCase()) return { role: key, data };
  }

  // 2. Partial match — profession contains role name or vice versa
  for (const [key, data] of Object.entries(roleSkillLibrary)) {
    const kLower = key.toLowerCase();
    const pLower = profession.toLowerCase();
    if (pLower.includes(kLower) || kLower.includes(pLower)) return { role: key, data };
  }

  // 3. Keyword fallback for common variants not in the exact list
  const KEYWORD_FALLBACKS: Array<{ keywords: string[]; role: string }> = [
    { keywords: ["marketing","social media","conteúdo","mídia"],                      role: "Analista de Marketing Jr." },
    { keywords: ["atendimento","customer","sac"],                                     role: "Analista de Atendimento" },
    { keywords: ["helpdesk","suporte técnico","ti","infraestrutura"],                 role: "Analista de Suporte Técnico" },
    { keywords: ["rh","recursos humanos","recrutamento","seleção","people"],          role: "Analista de RH" },
    { keywords: ["financeiro","finanças","contabil","controladoria"],                 role: "Analista Financeiro" },
    { keywords: ["logística","supply","estoque","almoxarifado"],                      role: "Analista de Logística" },
    { keywords: ["desenvolvedor","programador","software","dev","fullstack","backend","frontend"], role: "Desenvolvedor Jr." },
    { keywords: ["vendas","comercial","representante","account"],                     role: "Vendedor" },
    { keywords: ["administrativo","secretária","backoffice"],                         role: "Assistente Administrativo" },
    { keywords: ["compras","procurement","suprimentos"],                              role: "Analista de Compras" },
    { keywords: ["dados","data","bi","business intelligence","cientista"],             role: "Analista de Dados" },
    { keywords: ["motorista","entregador","condutor","transporte","motoboy"],         role: "Motorista" },
    { keywords: ["enfermagem","técnico de enfermagem","enfermeiro","hospitalar"],     role: "Técnico de Enfermagem" },
    { keywords: ["gerente de loja","gerência","varejo","supervisor de loja"],         role: "Gerente de Loja" },
    { keywords: ["e-commerce","ecommerce","marketplace","loja virtual"],              role: "Analista de E-commerce" },
    { keywords: ["designer","design gráfico","criativo","arte","visual","ui","ux"],  role: "Designer Gráfico" },
    { keywords: ["projetos","pmo","scrum","agile","project manager"],                role: "Analista de Projetos" },
    { keywords: ["farmácia","farmacêutico","medicamento","drogaria"],                 role: "Auxiliar de Farmácia" },
    { keywords: ["estágio","estagiário","trainee","aprendiz"],                        role: "Estagiário" },
    { keywords: ["personal trainer","educação física","academia","fitness","personal"], role: "Personal Trainer" },
  ];

  const pLower = profession.toLowerCase();
  for (const fb of KEYWORD_FALLBACKS) {
    if (fb.keywords.some(kw => pLower.includes(kw))) {
      return { role: fb.role, data: roleSkillLibrary[fb.role] };
    }
  }

  return null;
}

// ─── Build specific enhancements — exact spec implementation ──────────────────

export function buildSpecificEnhancements(
  data: ResumeExtraction,
  role: string
): string[] {
  const enhancements: string[] = [];
  const roleMatch = findRoleData(role);
  const roleData = roleMatch?.data ?? null;
  const roleLabel = roleMatch?.role ?? role;

  // 1. Missing skills from role library
  if (roleData) {
    const missingSkills = roleData.skills.filter(
      skill => !data.resume_skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
    );
    if (missingSkills.length > 0) {
      enhancements.push(
        `Seu currículo não menciona habilidades importantes para ${roleLabel}, como ${missingSkills
          .slice(0, 3)
          .join(", ")}. Se você realmente possui essas habilidades e adicioná‑las, sua pontuação pode aumentar em aproximadamente +${atsPointGains.missingSkill} pontos.`
      );
    }
  }

  // 2. Missing tools from role library
  if (roleData) {
    const missingTools = roleData.tools.filter(
      tool => !data.resume_tools.some(t => t.toLowerCase().includes(tool.toLowerCase()))
    );
    if (missingTools.length > 0) {
      enhancements.push(
        `Profissionais de ${roleLabel} costumam utilizar ferramentas como ${missingTools
          .slice(0, 3)
          .join(", ")}. Se você já trabalhou com alguma delas, incluí‑las pode melhorar sua pontuação em cerca de +${atsPointGains.missingToolMin}–${atsPointGains.missingToolMax} pontos.`
      );
    }
  }

  // 3. Bullet count
  if (data.bullet_point_count < 5) {
    enhancements.push(
      `Seu currículo tem apenas ${data.bullet_point_count} tópico${data.bullet_point_count !== 1 ? "s" : ""} de experiência. Adicionar ${
        5 - data.bullet_point_count
      } tópico${5 - data.bullet_point_count !== 1 ? "s" : ""}(s) relevante(s) pode aumentar sua pontuação estrutural em aproximadamente +${atsPointGains.missingBullet} pontos.`
    );
  }

  // 4. Missing metrics (always included — everyone benefits from this)
  enhancements.push(
    `Inclua resultados mensuráveis em seus tópicos de experiência — números, percentuais e metas atingidas tornam seu currículo mais impactante e aumentam sua pontuação em até +${atsPointGains.missingMetrics} pontos.`
  );

  // 5. Missing summary
  if (!data.has_summary) {
    enhancements.push(
      `Seu currículo não possui um resumo profissional forte. Criar um resumo claro e objetivo pode melhorar sua pontuação estrutural em até +${atsPointGains.missingSummary} pontos.`
    );
  }

  // 6. Word count
  if (data.word_count < 200) {
    enhancements.push(
      `Seu currículo está abaixo do tamanho recomendado (${data.word_count} palavras — mínimo: 200). Expandir suas experiências pode melhorar sua pontuação em até +${atsPointGains.lowWordCount} pontos.`
    );
  }

  // 7. Missing skills section
  if (!data.has_skills_section) {
    enhancements.push(
      `Seu currículo não possui uma seção de habilidades. Adicionar uma lista das suas principais competências pode aumentar sua pontuação em até +${atsPointGains.missingSkillsSection} pontos.`
    );
  }

  return enhancements.slice(0, 7);
}

// ─── English version for US site ─────────────────────────────────────────────

export function buildSpecificEnhancementsEN(data: ResumeExtraction, role: string): string[] {
  const enhancements: string[] = [];
  const roleMatch = findUSRoleData(role);
  const roleData = roleMatch?.data ?? null;
  const roleLabel = roleMatch?.role ?? role;

  if (roleData) {
    const missingSkills = roleData.skills.filter(
      skill => !data.resume_skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
    );
    if (missingSkills.length > 0) {
      enhancements.push(
        `Your resume doesn't mention key skills for ${roleLabel}: ${missingSkills.slice(0, 3).join(", ")}. ` +
        `If you have these skills, adding them could increase your score by approximately +${atsPointGains.missingSkill} points.`
      );
    }
  }

  if (roleData) {
    const missingTools = roleData.tools.filter(
      tool => !data.resume_tools.some(t => t.toLowerCase().includes(tool.toLowerCase()))
    );
    if (missingTools.length > 0) {
      enhancements.push(
        `${roleLabel}s commonly use ${missingTools.slice(0, 3).join(", ")}. ` +
        `If you've worked with any of these, add them — it could improve your score by +${atsPointGains.missingToolMin}–${atsPointGains.missingToolMax} points.`
      );
    }
  }

  if (data.bullet_point_count < 5) {
    const deficit = 5 - data.bullet_point_count;
    enhancements.push(
      `Your resume only has ${data.bullet_point_count} experience bullet${data.bullet_point_count !== 1 ? "s" : ""}. ` +
      `Adding ${deficit} more relevant bullet${deficit !== 1 ? "s" : ""} could increase your structural score by ~+${atsPointGains.missingBullet} points.`
    );
  }

  enhancements.push(
    `Add measurable results to your experience bullets — numbers, percentages, and outcomes make your resume more impactful and can increase your score by up to +${atsPointGains.missingMetrics} points.`
  );

  if (!data.has_summary) {
    enhancements.push(
      `Your resume doesn't have a professional summary. Adding a clear, focused summary could improve your structural score by up to +${atsPointGains.missingSummary} points.`
    );
  }

  if (data.word_count < 200) {
    enhancements.push(
      `Your resume is too short (${data.word_count} words — minimum recommended: 200). ` +
      `Expanding your experience descriptions could improve your score by up to +${atsPointGains.lowWordCount} points.`
    );
  }

  if (!data.has_skills_section) {
    enhancements.push(
      `Your resume doesn't have a skills section. Adding a dedicated skills list could improve your score by up to +${atsPointGains.missingSkillsSection} points.`
    );
  }

  const fillers = [
    `Start each bullet point with a strong action verb (Led, Built, Managed, Reduced, Increased) to make your experience more dynamic.`,
    `If you have certifications or licenses relevant to your field, add them in a dedicated section — they differentiate your profile.`,
    `Make sure your professional summary mentions your years of experience and your specific specialty area.`,
  ];
  let fi = 0;
  while (enhancements.length < 4 && fi < fillers.length) enhancements.push(fillers[fi++]);

  return enhancements.slice(0, 7);
}

// ─── Main export — called by general.ts and with_job.ts ──────────────────────

export function computeSpecificEnhancements(input: EnhancementInput): string[] {
  const { resumeExtraction: e, mode, jobExtraction, skillsMissing, profession, locale } = input;

  if (mode === "general") {
    const role = profession || e.resume_titles?.[0] || (locale === "en" ? "your field" : "sua área");
    if (locale === "en") return buildSpecificEnhancementsEN(e, role);
    return buildSpecificEnhancements(e, role);
  }

  // Mode A — job description comparisons (deterministic from job data)
  const items: string[] = [];

  // Individual missing skills
  (skillsMissing || []).slice(0, 3).forEach(skill => {
    if (items.length >= 7) return;
    items.push(
      `Seu currículo não menciona "${skill}", uma habilidade exigida por esta vaga. ` +
      `Se você possui essa habilidade, adicione-a — pode aumentar sua pontuação em +${atsPointGains.missingSkill} pontos.`
    );
  });

  // Missing tools from job description
  if (jobExtraction?.tools?.length && items.length < 7) {
    const normResTools = e.resume_tools.map(normalize);
    jobExtraction.tools
      .filter(t => !normResTools.some(rt => rt.includes(normalize(t)) || normalize(t).includes(rt)))
      .slice(0, 2)
      .forEach(tool => {
        if (items.length >= 7) return;
        items.push(
          `A vaga exige "${tool}", que não aparece no seu currículo. ` +
          `Se você já utilizou, inclua-a — pode melhorar sua pontuação em +${atsPointGains.missingToolMin}–${atsPointGains.missingToolMax} pontos.`
        );
      });
  }

  // Unmatched responsibilities
  if (jobExtraction?.responsibilities?.length && items.length < 7) {
    const normBullets = e.resume_experience_bullets.map(normalize).join(" ");
    jobExtraction.responsibilities
      .filter(resp => {
        const words = normalize(resp).split(" ").filter(w => w.length > 4);
        return words.filter(w => normBullets.includes(w)).length < 2;
      })
      .slice(0, 2)
      .forEach(resp => {
        if (items.length >= 7) return;
        const short = resp.length > 70 ? resp.slice(0, 67) + "..." : resp;
        items.push(
          `A vaga menciona: "${short}". Se você executou isso, crie um bullet descrevendo como — pode aumentar +${atsPointGains.missingResponsibilityMin}–${atsPointGains.missingResponsibilityMax} pontos.`
        );
      });
  }

  // Structure items
  if (e.bullet_point_count < 5 && items.length < 7) {
    const deficit = 5 - e.bullet_point_count;
    items.push(`Seu currículo tem apenas ${e.bullet_point_count} tópicos de experiência. Adicionar ${deficit} mais pode aumentar +${atsPointGains.missingBullet} pontos.`);
  }
  if (!e.has_summary && items.length < 7)
    items.push(`Adicionar um resumo profissional pode melhorar sua pontuação estrutural em até +${atsPointGains.missingSummary} pontos.`);
  if (!e.has_skills_section && items.length < 7)
    items.push(`Adicionar uma seção de habilidades pode melhorar sua pontuação em até +${atsPointGains.missingSkillsSection} pontos.`);
  if (e.word_count < 200 && items.length < 7)
    items.push(`Seu currículo está muito curto (${e.word_count} palavras). Expandir pode melhorar +${atsPointGains.lowWordCount} pontos.`);

  // Padding to minimum 4
  const fillers = [
    `Inclua resultados mensuráveis nos seus bullets — números e percentuais aumentam o impacto e a pontuação em até +${atsPointGains.missingMetrics} pontos.`,
    `Use verbos de ação no início de cada bullet (Liderou, Implementou, Reduziu, Aumentou) para tornar suas experiências mais dinâmicas.`,
    `Se você possui certificações ou idiomas relevantes, adicione-os em seções dedicadas — isso diferencia seu perfil.`,
  ];
  let fi = 0;
  while (items.length < 4 && fi < fillers.length) items.push(fillers[fi++]);

  return items.slice(0, 7);
}
