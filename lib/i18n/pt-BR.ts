// lib/i18n/pt-BR.ts
// All Portuguese (Brazil) UI strings for the Brazilian portal

export const ptBR = {
  // Navigation
  nav: {
    home: "Início",
    resume: "Criador de Currículo",
    coverLetter: "Carta de Apresentação",
    projects: "Portfólio Profissional",
    pricing: "Preços",
    about: "Sobre Nós",
    contact: "Contato",
    comingSoon: "Em Breve",
  },

  // Landing page
  landing: {
    tagline: "Para todo profissional — de qualquer área.",
    mission: "A TradePro transforma sua experiência real em um currículo profissional que abre portas — para profissionais de marketing, saúde, tecnologia, educação, administração, serviços, obras e muito mais.",
    hero: "Bem-vindo à TradePro Technologies",
    cta: "Criar Meu Currículo",
    ctaPricing: "Ver Planos",
    skills: {
      title: "Áreas",
      words: ["Marketing", "Saúde", "Tecnologia", "Educação", "Administração", "Serviços", "Engenharia"],
    },
    testimonials: {
      title: "O que os profissionais estão dizendo",
      items: [
        { text: "Tive acesso antecipado à TradePro e foi uma ótima experiência. A plataforma me ajudou a criar um currículo profissional do zero, analisando meus pontos fortes, fracos e áreas de melhoria. Processo muito limpo e uma excelente ferramenta para quem quer se destacar no mercado.", author: "Luis C." },
        { text: "Nunca soube como escrever meu currículo direito. O Gringo me guiou em cada passo. Na primeira semana já tinha entrevista marcada.", author: "Carla, Enfermeira" },
        { text: "Fácil de usar e o resultado ficou incrível. Consegui entrevista na primeira semana.", author: "Paulo, Técnico em TI" },
      ],
    },
    features: {
      title: "Suas ferramentas para ser contratado",
      resume: { title: "Criador de Currículo", desc: "Para qualquer área e setor — não modelos genéricos. Seu perfil real, apresentado com profissionalismo." },
      coverLetter: { title: "Carta de Apresentação", desc: "Cartas honestas e diretas escritas na sua voz, em português." },
      ats: { title: "Análise ATS com IA", desc: "Descubra se seu currículo passa pelo filtro automático das empresas — e o que melhorar." },
    },
    pricing: {
      title: "Preço Único e Transparente",
      cta: "Adquirir Agora",
    },
    newsletter: {
      title: "Fique por dentro",
      subtitle: "Novidades, modelos e ferramentas para profissionais brasileiros. Sem spam.",
      placeholder: "Digite seu e-mail",
      button: "Receber Novidades",
      success: "✓ Você está na lista. Entraremos em contato.",
    },
  },

  // Pricing — single R$49 bundle
  pricing: {
    title: "Um preço. Tudo incluído.",
    subtitle: "Sem assinatura. Sem taxas escondidas. Sem distinção entre modelos. Tudo desbloqueado por R$ 49.",
    bundle: {
      name: "Pacote Completo",
      desc: "Tudo que você precisa para criar um currículo e carta de apresentação profissional.",
      price: "R$ 79",
      originalPrice: "R$ 149",
      badge: "Oferta por Tempo Limitado",
      features: [
        "Todos os 9 modelos profissionais incluídos",
        "Criador de Currículo com IA em português",
        "Carta de Apresentação com IA",
        "Edite à vontade até ficar satisfeito",
        "3 downloads em PDF incluídos por ferramenta",
        "Pagamento único — sem mensalidade",
      ],
    },
    footer: "Compra única por sessão. Edite livremente — 3 downloads em PDF incluídos.",
    popular: "Oferta por Tempo Limitado",
    buyNow: "Adquirir por R$ 49",
    alreadyPurchased: "Já Adquirido",
    pix: "Pagar com PIX",
    installments: "Pagamento único",
  },

  // Resume builder
  resume: {
    chooseTemplate: "Escolha seu Modelo",
    browseTemplates: "Veja todos os modelos abaixo. Adquira o pacote para começar.",
    unlock: "Adquirir — R$ 49",
    unlockBundle: "Adquirir Pacote Completo — R$ 49",
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
      placeholder: "Ex: Trabalho com marketing há 3 anos, especializado em redes sociais e eventos. Tenho experiência com Meta Business Suite e gestão de campanhas...",
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
      allSetDesc: "Você utilizou seus 3 downloads em PDF. Seu currículo foi entregue.",
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
