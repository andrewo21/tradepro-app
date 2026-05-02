// lib/i18n/pt-BR.ts
// All Portuguese (Brazil) UI strings for the Brazilian portal

export const ptBR = {
  // Navigation
  nav: {
    home: "Início",
    resume: "Criador de Currículo",
    coverLetter: "Carta de Apresentação",
    projects: "Portfólio de Obras",
    pricing: "Preços",
    about: "Sobre Nós",
    contact: "Contato",
    comingSoon: "Em Breve",
  },

  // Landing page
  landing: {
    tagline: "Para quem trabalha de verdade — de qualquer área.",
    mission: "A TradePro transforma sua experiência real em um currículo profissional que abre portas — para eletricistas, técnicos, motoristas, cozinheiros, enfermeiros e muito mais.",
    hero: "Bem-vindo à TradePro Technologies",
    cta: "Criar Meu Currículo",
    ctaPricing: "Ver Planos",
    skills: {
      title: "Habilidades",
      words: ["Precisão", "Qualidade", "Liderança", "Segurança", "Gestão de Obras"],
    },
    testimonials: {
      title: "O que os profissionais estão dizendo",
      items: [
        { text: "A TradePro me ajudou a transformar anos de experiência em obra em um currículo do qual me orgulho.", author: "Miguel, Eletricista Comercial" },
        { text: "O currículo mais limpo que já tive. Sem frescura — só o meu trabalho, apresentado do jeito certo.", author: "Carla, Mestra de Obras" },
        { text: "Finalmente algo feito para a construção, não para escritório. Parece que entende como a gente trabalha.", author: "Paulo, Técnico em HVAC" },
      ],
    },
    features: {
      title: "Suas ferramentas para ser contratado",
      resume: { title: "Criador de Currículo", desc: "Estruturado para experiência real em obra, não modelos genéricos." },
      coverLetter: { title: "Carta de Apresentação", desc: "Cartas honestas e profissionais que soam como você." },
      projects: { title: "Portfólio de Obras", desc: "Mostre os projetos que provam o que você é capaz de fazer." },
    },
    pricing: {
      title: "Preços Simples e Transparentes",
      cta: "Ver Planos Completos",
    },
    newsletter: {
      title: "Fique por dentro",
      subtitle: "Novidades, modelos e ferramentas — feitos para a construção. Sem spam.",
      placeholder: "Digite seu e-mail",
      button: "Receber Novidades",
      success: "✓ Você está na lista. Entraremos em contato.",
    },
  },

  // Pricing
  pricing: {
    title: "Preços Simples e Honestos",
    subtitle: "Sem assinatura. Sem taxas escondidas. Sem pegadinhas. Escolha o plano que se encaixa nas suas necessidades.",
    resume: {
      name: "Criador de Currículo Padrão",
      desc: "Um currículo limpo e profissional para qualquer área de atuação.",
      price: "R$ 79",
      features: [
        "4 modelos profissionais incluídos",
        "Escrita assistida por IA em português",
        "Edite até ficar satisfeito",
        "2 downloads em PDF incluídos",
      ],
      notIncluded: [
        "Modelos premium (não incluído)",
        "Carta de Apresentação (não incluído)",
        "Portfólio de Obras (não incluído)",
      ],
    },
    coverLetter: {
      name: "Carta de Apresentação",
      desc: "Cartas honestas e diretas que soam como você.",
      price: "R$ 39",
      features: [
        "Escrita assistida por IA",
        "Edite até ficar satisfeito",
        "2 downloads em PDF incluídos",
      ],
      notIncluded: [
        "Criador de Currículo (não incluído)",
        "Modelos premium (não incluído)",
        "Portfólio de Obras (não incluído)",
      ],
    },
    bundle: {
      name: "Pacote Premium Completo",
      desc: "Libere tudo — 9 modelos premium, carta de apresentação e portfólio profissional.",
      price: "R$ 99",
      originalPrice: "R$ 149",
      badge: "Mais Popular",
      features: [
        "Todos os 9 modelos (4 padrão + 5 premium)",
        "Escrita assistida por IA em português",
        "Edite até ficar satisfeito",
        "2 downloads em PDF por ferramenta",
        "Carta de Apresentação incluída",
        "Portfólio de Obras incluído",
      ],
    },
    footer: "Compra única por sessão. Edite livremente — 2 downloads em PDF incluídos por ferramenta.",
    popular: "Mais Popular",
    buyNow: "Comprar Agora",
    alreadyPurchased: "Já Adquirido",
    pix: "Pagar com PIX",
    installments: "ou 3x sem juros",
  },

  // Resume builder
  resume: {
    chooseTemplate: "Escolha seu Modelo",
    browseTemplates: "Navegue pelos modelos abaixo. Adquira para começar a construir seu currículo.",
    unlock: "Desbloquear — R$ 79",
    unlockBundle: "Desbloquear com Pacote — R$ 149",
    purchaseToContinue: "Adquirir para Continuar →",
    continueStep2: "Continuar para o Passo 2 →",
    uploadComingSoon: "Já tem um currículo? Envie e nós otimizaremos.",
    uploadComingSoonBadge: "Em Breve",
    steps: {
      personal: "Informações Pessoais",
      skills: "Habilidades",
      experience: "Experiência",
      education: "Formação",
      summary: "Resumo Profissional",
      preview: "Visualização Final",
    },
    personal: {
      title: "Informações Pessoais",
      firstName: "Nome",
      lastName: "Sobrenome",
      tradeTitle: "Título Profissional",
      phone: "Telefone",
      email: "E-mail",
      city: "Cidade",
      state: "Estado",
    },
    summary: {
      title: "Resumo Profissional",
      placeholder: "Ex: Trabalho com construção há 10 anos, fiz concretagem, alvenaria, instalações elétricas. Sou mestre de obras e gerencio equipes de até 15 pessoas...",
      aiImproving: "IA está melhorando seu resumo...",
      suggestion: "✅ Sugestão da IA:",
      accept: "Aceitar Sugestão",
      discard: "Descartar",
    },
    preview: {
      title: "Visualização Final",
      download: "Baixar Currículo em PDF",
      edit: "Editar Informações",
      generating: "Gerando...",
      downloadsRemaining: "downloads restantes",
      lastDownload: "⚠ Último download — certifique-se que está tudo certo antes de baixar.",
      allUsed: "Todos os downloads foram utilizados. Adquira uma nova sessão para continuar.",
      allSet: "Tudo pronto!",
      allSetDesc: "Você utilizou seus 2 downloads em PDF. Seu currículo foi entregue.",
      buyNew: "Adquirir Nova Sessão",
    },
  },

  // Cover letter
  coverLetter: {
    title: "Carta de Apresentação",
    applicantDetails: "1. Dados do Candidato",
    companyDetails: "2. Dados da Empresa",
    resumeData: "3. Dados do Currículo",
    fullName: "Nome Completo",
    email: "E-mail",
    phone: "Telefone",
    address: "Endereço",
    cityStateZip: "Cidade, Estado, CEP",
    jobTitle: "Cargo Pretendido",
    hiringManager: "Responsável pela Contratação",
    companyName: "Nome da Empresa",
    companyAddress: "Endereço da Empresa",
    companyCityStateZip: "Cidade, Estado, CEP da Empresa",
    salutation: {
      dear: "Prezado(a) [Nome]",
      toWhom: "A quem possa interessar",
    },
    extract: "Extrair Resumo do Currículo",
    extracting: "Extraindo...",
    generate: "Gerar Carta",
    download: "Baixar PDF",
    generating: "Gerando...",
  },

  // Legal
  legal: {
    terms: "Termos de Uso",
    privacy: "Política de Privacidade",
    refunds: "Política de Reembolso",
    contact: "Contato",
    lastUpdated: "Última atualização",
  },

  // Common
  common: {
    backHome: "← Voltar ao Início",
    error: "Algo deu errado. Tente novamente.",
    network: "Erro de rede. Verifique sua conexão.",
    refresh: "Atualizar para restaurar acesso",
    alreadyPurchased: "Já adquirido? Atualize a página após o pagamento.",
  },
};

export type PtBR = typeof ptBR;
