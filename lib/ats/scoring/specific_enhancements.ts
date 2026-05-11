// lib/ats/scoring/specific_enhancements.ts
// Pure deterministic function. No AI. Same input = same output.
// Generates 4–7 specific, quantified, personalized enhancements in PT-BR.

import type { ResumeExtraction } from "../extraction/extract_resume_data";
import type { JobExtraction }    from "../extraction/extract_job_data";
import { normalize }             from "../utils/normalize";

export interface EnhancementInput {
  resumeExtraction: ResumeExtraction;
  mode: "with_job" | "general";
  jobExtraction?: JobExtraction;
  skillsMissing?: string[];
  skillsFound?: string[];
  profession?: string | null;
}

// ─── Role-based skill + tool libraries ────────────────────────────────────────
// Deterministic lookup for Mode B (no job description).
// Match profession string (case-insensitive, partial) to expected skills/tools.

interface RoleProfile { skills: string[]; tools: string[]; }

const ROLE_LIBRARY: Array<{ keywords: string[]; profile: RoleProfile }> = [
  {
    keywords: ["atendimento", "customer service", "suporte", "sac", "relacionamento com cliente"],
    profile: {
      skills: ["resolução de conflitos", "comunicação eficaz", "empatia", "organização", "atendimento omnichannel"],
      tools:  ["Zendesk", "Freshdesk", "HubSpot Service", "Salesforce Service Cloud"],
    },
  },
  {
    keywords: ["marketing", "social media", "conteúdo", "mídia", "redes sociais"],
    profile: {
      skills: ["planejamento de campanhas", "análise de métricas", "copywriting", "SEO", "gestão de redes sociais"],
      tools:  ["Meta Business Suite", "Google Analytics", "Canva", "Hootsuite", "Google Ads"],
    },
  },
  {
    keywords: ["desenvolvedor", "programador", "software", "backend", "frontend", "fullstack", "dev"],
    profile: {
      skills: ["controle de versão", "testes unitários", "metodologias ágeis", "revisão de código", "documentação técnica"],
      tools:  ["Git", "GitHub", "Docker", "Jira", "Postman"],
    },
  },
  {
    keywords: ["analista de ti", "ti", "suporte técnico", "infraestrutura", "redes", "helpdesk"],
    profile: {
      skills: ["troubleshooting", "segurança da informação", "gestão de redes", "backup e recuperação"],
      tools:  ["Active Directory", "GLPI", "Zabbix", "TeamViewer", "Office 365 Admin"],
    },
  },
  {
    keywords: ["recursos humanos", "rh", "recrutamento", "seleção", "gente e gestão", "people"],
    profile: {
      skills: ["recrutamento e seleção", "gestão de desempenho", "onboarding", "legislação trabalhista", "treinamento"],
      tools:  ["Gupy", "LinkedIn Recruiter", "SAP HCM", "Sólides", "PontoTel"],
    },
  },
  {
    keywords: ["financeiro", "finanças", "contabilidade", "controladoria", "fiscal"],
    profile: {
      skills: ["controle de fluxo de caixa", "conciliação bancária", "análise financeira", "orçamento", "relatórios gerenciais"],
      tools:  ["SAP FI", "Totvs", "Excel avançado", "Sankhya", "Power BI"],
    },
  },
  {
    keywords: ["logística", "supply chain", "estoque", "almoxarifado", "cadeia de suprimentos", "transporte"],
    profile: {
      skills: ["gestão de estoque", "roteirização", "controle de inventário", "negociação com fornecedores"],
      tools:  ["SAP MM", "Totvs", "WMS", "Excel avançado", "TMS"],
    },
  },
  {
    keywords: ["vendas", "comercial", "vendedor", "representante", "account"],
    profile: {
      skills: ["prospecção de clientes", "negociação", "fechamento de vendas", "gestão de carteira", "CRM"],
      tools:  ["Salesforce", "HubSpot CRM", "Pipedrive", "RD Station", "Excel"],
    },
  },
  {
    keywords: ["enfermeiro", "enfermagem", "técnico de enfermagem", "saúde", "hospitalar", "clínico"],
    profile: {
      skills: ["assistência ao paciente", "administração de medicamentos", "procedimentos clínicos", "ACLS", "BLS"],
      tools:  ["Tasy", "MV Soul", "Prontuário Eletrônico", "Philips Tasy"],
    },
  },
  {
    keywords: ["eletricista", "elétrica", "instalações elétricas", "eletrotécnica"],
    profile: {
      skills: ["NR-10", "NR-35", "leitura de diagramas elétricos", "instalações de baixa tensão", "SPDA"],
      tools:  ["multímetro", "alicate amperímetro", "megôhmetro"],
    },
  },
  {
    keywords: ["construção", "obras", "civil", "engenharia civil", "mestre de obras", "encarregado"],
    profile: {
      skills: ["gestão de equipes", "controle de cronograma", "leitura de projetos", "NR-18", "qualidade"],
      tools:  ["AutoCAD", "MS Project", "Excel", "BIM"],
    },
  },
  {
    keywords: ["educação", "professor", "docente", "pedagogo", "ensino", "escola"],
    profile: {
      skills: ["planejamento de aulas", "avaliação de aprendizagem", "gestão de sala de aula", "metodologias ativas"],
      tools:  ["Google Classroom", "Canva Educação", "Moodle", "Microsoft Teams"],
    },
  },
  {
    keywords: ["administrativo", "assistente administrativo", "secretária", "backoffice", "auxiliar"],
    profile: {
      skills: ["organização de documentos", "atendimento telefônico", "gestão de agenda", "redação de e-mails"],
      tools:  ["Pacote Office", "G Suite", "ERP", "Asana"],
    },
  },
  {
    keywords: ["designer", "design gráfico", "criativo", "arte", "visual", "ui", "ux"],
    profile: {
      skills: ["identidade visual", "tipografia", "composição visual", "prototipagem", "UX writing"],
      tools:  ["Adobe Photoshop", "Illustrator", "Figma", "InDesign", "After Effects"],
    },
  },
  {
    keywords: ["analista de dados", "data", "bi", "business intelligence", "dados", "cientista de dados"],
    profile: {
      skills: ["análise estatística", "visualização de dados", "modelagem de dados", "SQL", "machine learning"],
      tools:  ["Power BI", "Tableau", "Python", "SQL Server", "Google Data Studio"],
    },
  },
];

/** Find the role profile for a given profession string */
function findRoleProfile(profession: string | null | undefined): RoleProfile | null {
  if (!profession) return null;
  const lowerProf = profession.toLowerCase();
  for (const entry of ROLE_LIBRARY) {
    if (entry.keywords.some(kw => lowerProf.includes(kw))) {
      return entry.profile;
    }
  }
  return null;
}

// ─── Main function ─────────────────────────────────────────────────────────────

export function computeSpecificEnhancements(input: EnhancementInput): string[] {
  const { resumeExtraction: e, mode, jobExtraction, skillsMissing, profession } = input;
  const items: string[] = [];

  // ── MODE A: Job description comparisons ────────────────────────────────────

  if (mode === "with_job") {

    // 1. Individual missing skills (up to 3)
    (skillsMissing || []).slice(0, 3).forEach(skill => {
      if (items.length >= 7) return;
      items.push(
        `Seu currículo não menciona "${skill}", uma habilidade exigida por esta vaga. ` +
        `Se você realmente possui essa habilidade, adicione-a na seção de habilidades — ` +
        `isso pode aumentar sua pontuação em aproximadamente +5 pontos.`
      );
    });

    // 2. Individual missing tools (up to 2)
    if (jobExtraction?.tools?.length && items.length < 7) {
      const normResTools = e.resume_tools.map(normalize);
      jobExtraction.tools
        .filter(t => !normResTools.some(rt => rt.includes(normalize(t)) || normalize(t).includes(rt)))
        .slice(0, 2)
        .forEach(tool => {
          if (items.length >= 7) return;
          items.push(
            `A vaga exige conhecimento em "${tool}", que não aparece no seu currículo. ` +
            `Se você já utilizou essa ferramenta, inclua-a nas habilidades ou em um bullet de experiência — ` +
            `isso pode melhorar sua pontuação em +3–5 pontos.`
          );
        });
    }

    // 3. Unmatched responsibilities (up to 2)
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
            `A vaga menciona: "${short}". ` +
            `Essa atividade não aparece no seu currículo. ` +
            `Se você já executou algo parecido, crie um bullet descrevendo como fez — ` +
            `isso pode aumentar sua pontuação em até +5 pontos.`
          );
        });
    }
  }

  // ── MODE B: Role library comparisons ───────────────────────────────────────

  if (mode === "general" && items.length < 7) {
    const roleProfile = findRoleProfile(profession);

    if (roleProfile) {
      // Missing skills from role library
      const normResSkills = e.resume_skills.map(normalize);
      const missingRoleSkills = roleProfile.skills
        .filter(skill => !normResSkills.some(s => s.includes(normalize(skill)) || normalize(skill).includes(s)))
        .slice(0, 3);

      if (missingRoleSkills.length > 0 && items.length < 7) {
        const role = profession || "sua área";
        const listed = missingRoleSkills.map(s => `"${s}"`).join(", ");
        items.push(
          `Seu currículo não menciona habilidades importantes para ${role}, como ${listed}. ` +
          `Se você realmente possui essas habilidades e adicioná-las, sua pontuação pode aumentar em aproximadamente +5 pontos.`
        );
      }

      // Missing tools from role library
      const normResTools = e.resume_tools.map(normalize);
      const missingRoleTools = roleProfile.tools
        .filter(tool => !normResTools.some(t => t.includes(normalize(tool)) || normalize(tool).includes(t)))
        .slice(0, 3);

      if (missingRoleTools.length > 0 && items.length < 7) {
        const role = profession || "sua área";
        const listed = missingRoleTools.slice(0, 2).join(", ");
        items.push(
          `Profissionais de ${role} costumam utilizar ferramentas como ${listed}. ` +
          `Se você já trabalhou com alguma delas, incluí-las pode melhorar sua pontuação em cerca de +3–5 pontos.`
        );
      }
    } else if (e.resume_skills.length < 3 && items.length < 7) {
      // No role matched but very few skills listed
      items.push(
        `Seu currículo lista ${e.resume_skills.length === 0 ? "nenhuma" : "poucas"} habilidades. ` +
        `Adicione pelo menos 5 a 8 competências relevantes para sua área — ` +
        `isso torna seu perfil mais visível em buscas automáticas de recrutadores.`
      );
    }
  }

  // ── STRUCTURE ITEMS (both modes) ──────────────────────────────────────────

  if (e.bullet_point_count < 5 && items.length < 7) {
    const deficit = 5 - e.bullet_point_count;
    items.push(
      `Seu currículo tem apenas ${e.bullet_point_count} tópico${e.bullet_point_count !== 1 ? "s" : ""} de experiência. ` +
      `Adicionar ${deficit} tópico${deficit !== 1 ? "s" : ""} relevante${deficit !== 1 ? "s" : ""} pode aumentar ` +
      `sua pontuação estrutural em aproximadamente +5 pontos.`
    );
  }

  if (!e.has_summary && items.length < 7) {
    items.push(
      `Seu currículo não possui um resumo profissional no topo. ` +
      `Adicionar um resumo claro e objetivo com 3 a 5 frases pode melhorar sua pontuação estrutural em até +10 pontos.`
    );
  }

  if (!e.has_skills_section && items.length < 7) {
    items.push(
      `Seu currículo não possui uma seção de habilidades. ` +
      `Adicionar uma seção com suas principais competências pode aumentar sua pontuação estrutural em cerca de +15 pontos.`
    );
  }

  if (e.word_count < 200 && items.length < 7) {
    items.push(
      `Seu currículo está abaixo do tamanho recomendado (${e.word_count} palavras — mínimo: 200). ` +
      `Expandir a descrição das suas experiências pode melhorar sua pontuação em até +10 pontos.`
    );
  }

  if (e.word_count > 1200 && items.length < 7) {
    items.push(
      `Seu currículo está longo demais (${e.word_count} palavras — máximo: 1.200). ` +
      `Remova informações redundantes e mantenha o essencial — ` +
      `isso pode melhorar sua pontuação estrutural em até +10 pontos.`
    );
  }

  if (!e.has_experience_section && items.length < 7) {
    items.push(
      `Seu currículo não possui uma seção clara de experiência profissional. ` +
      `Inclua uma seção com seus empregos anteriores, cargos e responsabilidades — ` +
      `isso pode aumentar sua pontuação estrutural em até +20 pontos.`
    );
  }

  // ── Padding: ensure at least 4 items ──────────────────────────────────────

  const fillers = [
    `Inclua resultados mensuráveis em seus tópicos de experiência — números, percentuais e metas atingidas tornam seu currículo mais impactante.`,
    `Use verbos de ação no início de cada tópico (Liderou, Implementou, Reduziu, Aumentou, Desenvolveu) para tornar suas experiências mais dinâmicas.`,
    `Se você possui certificações, cursos ou idiomas relevantes, adicione-os em seções dedicadas — esses elementos diferenciam seu perfil.`,
    `Verifique se seu resumo profissional menciona sua área de atuação e seus anos de experiência — recrutadores leem o resumo primeiro.`,
  ];

  let fillerIdx = 0;
  while (items.length < 4 && fillerIdx < fillers.length) {
    items.push(fillers[fillerIdx++]);
  }

  return items.slice(0, 7);
}
